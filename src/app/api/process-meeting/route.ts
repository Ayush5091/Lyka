import { NextRequest, NextResponse } from "next/server";
import { DeepgramClient } from "@deepgram/sdk";
import OpenAI from "openai";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { formatUtterances, formatRecallTranscript } from "@/utils/formatter";
import { autoClassifyAgenda, evaluateAgenda, evaluateAgendaFromKeywords } from "@/utils/agenda-scoring";
import { sendMeetingSummaryToSlack } from "@/utils/slack-notifier";
import { sendActionItemsToJira } from "@/utils/jira-notifier";
import { sendMeetingSummaryEmail } from "@/utils/email-notifier";
import { log } from "@/utils/logger";

const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `You are an expert meeting analyst. You will receive a plain-text transcript of a meeting and optionally some "RETRIEVED CONTEXT" from past meetings.

Your job is to extract structured information and return ONLY valid JSON (no markdown, no preamble).

Return a JSON object with this exact schema:
{
  "meeting_summary": "<one to two sentence summary of the meeting's purpose and main outcome>",
  "users": [
    {
      "speaker": "<The name or label of the speaker as it appears in the transcript>",
      "summary": "<one sentence describing this speaker's role and contribution in the meeting>",
      "decisions": ["<decision 1>", "<decision 2>"],
      "action_items": ["<action item with deadline if mentioned>"]
    }
  ],
  "contradictions": ["<optional: if a new decision contradicts a past decision found in RETRIEVED CONTEXT, note it here>"]
}

Rules:
- STRICT IDENTITY: If a real name is available in the transcript (e.g. "Ayush Narayan"), you MUST use that name in the "speaker" field. NEVER use "Speaker 0" if you can determine the person's real name from the text.
- SELF-CORRECTION: If only one person's name is mentioned in the entire transcript (or provided in labels), and other labels are "Speaker 0", assume Speaker 0 IS that person.
- CONTRADICTION DETECTION: If "RETRIEVED CONTEXT" is provided, compare the new decisions against it. If there is a direct conflict, add it to the "contradictions" array.
- Include every speaker who spoke, even if they had a minor role.
- "decisions" are concrete outcomes the group agreed on.
- "action_items" are specific commitments made by that individual speaker. Include deadlines if mentioned.
- If a speaker made no decisions or action items, use an empty array for that field.
- Temperature is low — be precise and literal.`;

async function transcribeWithDeepgram(videoUrl: string) {
    const response = await deepgram.listen.v1.media.transcribeUrl(
        {
            url: videoUrl,
            model: "nova-2",
            diarize: true,
            utterances: true,
            smart_format: true,
            punctuate: true,
        }
    );

    if (!response) {
        throw new Error(`Deepgram transcription failed: No response received`);
    }

    const results = (response as any).results;
    const utterances = results?.utterances ?? [];
    const rawTranscript = results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return { utterances, rawTranscript };
}

async function extractWithOpenAI(formattedTranscript: string, retrievedContext: any[] = []) {
    const contextText = retrievedContext.length > 0
        ? `\n\nRETRIEVED CONTEXT FROM PAST MEETINGS:\n${retrievedContext.map(c => `- ${c.content}`).join('\n')}`
        : "";

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: formattedTranscript + contextText },
        ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    return JSON.parse(raw);
}

async function saveDecisions(meetingId: string, structured: any, department: string) {
    const decisionsRows: any[] = [];
    for (const user of (structured.users || [])) {
        for (const decision of (user.decisions || [])) {
            decisionsRows.push({
                meeting_id: meetingId,
                speaker: user.speaker,
                content: decision,
                department: department || 'eng'
            });
        }
    }

    if (decisionsRows.length > 0) {
        if (!supabase) {
            await log.error('process-meeting', "Supabase client not initialized", { meetingId });
            return;
        }
        await log.info('process-meeting', `Saving ${decisionsRows.length} decisions to Supabase...`, { meetingId });
        const { error } = await supabase.from('decisions').insert(decisionsRows);
        if (error) await log.error('process-meeting', "Error saving decisions", { error: error.message, meetingId });
    }
}

export async function POST(req: NextRequest) {
    const secret = process.env.WEBHOOK_SECRET;
    if (secret && req.headers.get("x-webhook-secret") !== secret) {
        return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    if (!supabase) {
        return NextResponse.json({ error: "Internal Server Error: Supabase not initialized" }, { status: 500 });
    }

    try {
        const body = await req.json();
        let { video_url, recall_transcript, speaker_map = {}, meeting_id = `meeting-${Date.now()}`, department = 'eng', agenda = '' } = body;

        // Build map from raw participants if it's an array (from N8N)
        if (Array.isArray(speaker_map)) {
            const rawParticipants = speaker_map;
            speaker_map = {};

            // Extract real human names (filter out bots, notetakers, empty entries)
            const botKeywords = ['notetaker', 'bot', 'recall', 'lyka assistant', 'assistant'];
            const realParticipants = rawParticipants.filter((p: any) => {
                const name = (p.name || '').trim().toLowerCase();
                return name && !botKeywords.some(kw => name.includes(kw));
            });

            // Build the speaker map: index → cleaned name, id → cleaned name
            realParticipants.forEach((p: any, idx: number) => {
                const cleanName = (p.name || '').trim();
                speaker_map[idx] = cleanName;
                speaker_map[String(idx)] = cleanName;
                speaker_map[`speaker ${idx}`] = cleanName;
                speaker_map[`speaker_${idx}`] = cleanName;
                if (p.id) speaker_map[p.id] = cleanName;
            });

            // If only one real human, map ALL Deepgram speaker IDs to that person's name
            // (Deepgram speaker IDs are 0..N but only one person was actually speaking)
            if (realParticipants.length === 1) {
                const onlyName = realParticipants[0].name.trim();
                for (let i = 0; i <= 10; i++) speaker_map[i] = onlyName;
            }
        }

        if (!video_url && !recall_transcript) {
            return NextResponse.json({ error: "Either video_url or recall_transcript is required." }, { status: 400 });
        }

        let transcript = "";
        let source = "";
        let speakerCount = 0;
        let utteranceCount = 0;

        if (recall_transcript && Array.isArray(recall_transcript)) {
            transcript = formatRecallTranscript(recall_transcript, speaker_map);
            utteranceCount = recall_transcript.length;
            const speakerIds = new Set(recall_transcript.map(u => u.participant?.id || u.participant?.name));
            speakerCount = speakerIds.size;
            source = "recall";
        } else {
            const { utterances, rawTranscript } = await transcribeWithDeepgram(video_url);
            
            if (utterances.length > 0) {
                transcript = formatUtterances(utterances, speaker_map);
                const speakerIds = new Set(utterances.map((u: any) => u.speaker));
                speakerCount = speakerIds.size;
                utteranceCount = utterances.length;
            } else if (rawTranscript.trim().length > 0) {
                // Fallback: If no diarized utterances but there is speech, use raw transcript
                transcript = rawTranscript;
                speakerCount = 1;
                utteranceCount = 1;
            } else {
                // Truly silent meeting
                await log.info('process-meeting', `Silent meeting detected for ${meeting_id}`, { source: 'deepgram' });
                // We'll return 200 but with a silent flag so n8n can handle it
                return NextResponse.json({ 
                    meeting_id,
                    status: 'silent',
                    message: "No speech detected in the meeting.",
                    transcript: "",
                    structured: { meeting_summary: "Silent meeting." }
                });
            }
            source = "deepgram";
        }

        await log.info('process-meeting', `Pipeline triggered for ${meeting_id}`, { source, speakerCount });

        // Phase 1: RAG
        let retrievedContext = [];
        try {
            const embedResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: transcript.substring(0, 2000),
            });
            const embedding = embedResponse.data[0].embedding;

            const { data: chunks, error } = await supabase!.rpc('match_meeting_chunks', {
                query_embedding: embedding,
                match_threshold: 0.5,
                match_count: 5,
                filter_dept: department
            });
            if (!error && chunks) retrievedContext = chunks;
        } catch (ragErr: any) {
            await log.warn('process-meeting', "RAG retrieval failed", { error: ragErr.message, meeting_id });
        }

        // Phase 2: Extraction
        const structured = await extractWithOpenAI(transcript, retrievedContext);


        // Phase 3.5: Save meeting record and embed transcript chunks for RAG
        try {
            // Upsert the meeting record with AI-generated summary and contradictions
            const agendaText = typeof agenda === 'string' ? agenda.trim() : '';
            const autoAgenda = !agendaText
                ? autoClassifyAgenda(`${structured.meeting_summary || ''}\n${transcript}`, department)
                : null;

            const finalAgenda = agendaText || autoAgenda?.label || '';
            const agendaInsights = finalAgenda
                ? (autoAgenda?.keywords && autoAgenda.keywords.length > 0
                    ? evaluateAgendaFromKeywords(finalAgenda, autoAgenda.keywords, transcript, (structured.contradictions || []).length)
                    : evaluateAgenda(finalAgenda, transcript, (structured.contradictions || []).length))
                : null;

            await supabase!.from('meetings').upsert({
                id: meeting_id,
                audio_url: body.video_url || null,
                department,
                summary: structured.meeting_summary || null,
                contradictions: structured.contradictions || [],
                transcript_text: transcript || null,
                agenda: finalAgenda || null,
                agenda_label: agendaInsights?.agendaLabel || autoAgenda?.label || null,
                agenda_score: agendaInsights?.agendaScore ?? null,
                agenda_met: agendaInsights?.agendaMet ?? null,
                outcome_score: agendaInsights?.outcomeScore ?? null,
                outcome_met: agendaInsights?.outcomeMet ?? null
            }, { onConflict: 'id' });

            // Phase 3: Persistence (Moved after meeting upsert to satisfy FK constraint)
            await saveDecisions(meeting_id, structured, department);

            // Chunk the transcript (~500 words each) and embed for vector search
            const words = transcript.split(' ');
            const chunkSize = 500;
            const chunkRows: any[] = [];
            for (let i = 0; i < words.length; i += chunkSize) {
                const chunkText = words.slice(i, i + chunkSize).join(' ');
                const embedRes = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: chunkText,
                });
                chunkRows.push({
                    meeting_id,
                    content: chunkText,
                    embedding: embedRes.data[0].embedding,
                    department,
                });
            }
            if (chunkRows.length > 0) {
                await supabase!.from('meeting_chunks').insert(chunkRows);
                await log.info('process-meeting', `Saved ${chunkRows.length} RAG chunks to Supabase.`, { meeting_id });
            }
        } catch (ragSaveErr: any) {
            await log.warn('process-meeting', 'Failed to save RAG chunks', { error: ragSaveErr.message, meeting_id });
        }

        // Final Delivery
        await sendMeetingSummaryToSlack({
            meeting_id,
            transcript,
            structured,
            source,
            speaker_count: speakerCount,
            utterance_count: utteranceCount,
        });

        await sendActionItemsToJira({
            meeting_id,
            structured
        });

        await sendMeetingSummaryEmail({
            meeting_id,
            structured
        });

        return NextResponse.json({
            meeting_id,
            transcript,
            structured,
            source,
            speaker_count: speakerCount,
            utterance_count: utteranceCount,
            retrieved_context_count: retrievedContext.length
        });

    } catch (err: any) {
        return NextResponse.json({ error: "Processing pipeline failed.", detail: err.message }, { status: 500 });
    }
}
