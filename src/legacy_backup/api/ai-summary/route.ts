import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
    try {
        const { title, context } = await req.json();

        if (!title || !context) {
            return NextResponse.json({ error: "Title and context are required." }, { status: 400 });
        }

        const prompt = `You are an expert technical lead at Lyka, an autonomous AI infrastructure company. 
        Your task is to provide a concise, high-impact technical summary for a project phase/meeting.
        
        Project Title: ${title}
        Raw Context: ${context}
        
        Guidelines:
        - Focus on architectural decisions, system performance, and engineering milestones.
        - Use professional, punchy technical language.
        - Structure the summary with "Overview", "Technical Highlights", and "Strategic Outcomes".
        - Keep the total length around 200 words.
        - DO NOT use markdown headers, use plain text headers in ALL CAPS.
        - Output the final summary clearly.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.7,
            messages: [
                { role: "system", content: "You are a technical document generator for Lyka." },
                { role: "user", content: prompt },
            ],
        });

        const summary = completion.choices[0]?.message?.content ?? "Failed to generate summary.";

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error("AI Summary Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
