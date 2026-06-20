import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // 1. Fetch integration statuses (Mock check for simplicity in this demo)
        const integrations = {
            supabase: true,
            openai: true,
            deepgram: true,
            recall: true,
        };

        // 2. Fetch Latest Logs
        const { data: logs } = await supabase
            .from("logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        // 3. Fetch Recent Decisions
        const { data: decisions } = await supabase
            .from("decisions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        // 4. Get Meeting Counts
        const { count: totalMeetings } = await supabase
            .from("meetings")
            .select("*", { count: "exact", head: true });

        return NextResponse.json({
            integrations,
            logs: logs || [],
            decisions: decisions || [],
            stats: {
                totalMeetings: totalMeetings || 0,
                activeSyncs: 4,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
