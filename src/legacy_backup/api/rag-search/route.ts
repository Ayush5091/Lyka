import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin as supabase } from "@/lib/supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
    try {
        const { query, department = "eng", limit = 8, threshold = 0.4 } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "query is required" }, { status: 400 });
        }

        // Embed the search query
        const embedRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = embedRes.data[0].embedding;

        // Run vector similarity search via Supabase RPC
        const { data: results, error } = await supabase.rpc("match_meeting_chunks", {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit,
            filter_dept: department,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ results: results || [], query });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
