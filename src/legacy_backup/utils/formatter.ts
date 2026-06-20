/**
 * formatUtterances(utterances)
 *
 * Converts a Deepgram utterances array into a clean, human-readable string
 * suitable for sending to OpenAI as plain text.
 */
export function formatUtterances(utterances: any[], speakerMap: any = {}) {
    if (!utterances || utterances.length === 0) {
        return "";
    }

    const merged: any[] = [];

    for (const utterance of utterances) {
        const last = merged[merged.length - 1];
        const speakerLabel = speakerMap[utterance.speaker] || `Speaker ${utterance.speaker}`;

        if (last && last.speaker === utterance.speaker) {
            // Merge consecutive same-speaker utterances
            last.text += " " + utterance.transcript.trim();
        } else {
            merged.push({ speaker: utterance.speaker, label: speakerLabel, text: utterance.transcript.trim() });
        }
    }

    return merged.map((block) => `${block.label}: ${block.text}`).join("\n");
}

/**
 * formatRecallTranscript(rawTranscript)
 */
export function formatRecallTranscript(rawTranscript: any[], speakerMap: any = {}) {
    if (!Array.isArray(rawTranscript)) return "";

    return rawTranscript.map(item => {
        const rawName = item.participant?.name || '';
        const rawId = item.participant?.id || 'Unknown';

        // Prefer mapped names when the transcript name is generic.
        const isGenericName = /^speaker\s*\d+$/i.test(rawName) || rawName.toLowerCase() === 'unknown';
        const mappedName = speakerMap[rawId] || speakerMap[String(rawId)] || speakerMap[rawName];
        const speaker = (rawName && !isGenericName ? rawName : mappedName) || `Speaker ${rawId}`;
        const text = item.words?.map((w: any) => w.text).join(' ') || "";
        return `${speaker}: ${text}`;
    }).join('\n');
}
