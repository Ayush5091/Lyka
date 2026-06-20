import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: "Supabase admin client unavailable." }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meeting_id");

    try {
        let nodesQuery = supabaseAdmin.from("graph_nodes").select("*");
        let edgesQuery = supabaseAdmin.from("graph_edges").select("*");

        if (meetingId) {
            nodesQuery = nodesQuery.eq("meeting_id", meetingId);
            edgesQuery = edgesQuery.eq("meeting_id", meetingId);
        }

        const [{ data: nodes, error: nodesError }, { data: edges, error: edgesError }] = await Promise.all([
            nodesQuery.order("created_at", { ascending: true }),
            edgesQuery.order("created_at", { ascending: true })
        ]);

        if (nodesError) {
            return NextResponse.json({ error: nodesError.message }, { status: 500 });
        }
        if (edgesError) {
            return NextResponse.json({ error: edgesError.message }, { status: 500 });
        }

        return NextResponse.json({ nodes: nodes || [], edges: edges || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
    }
}
