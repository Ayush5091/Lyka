import { NextResponse } from "next/server";
import { acquireBotLock, setBotLockId, getActiveBotLock } from "@/utils/bot-lock";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { meeting_url, bot_name = "Lyka Bot" } = body;

        if (!meeting_url) {
            return NextResponse.json({ error: "meeting_url is required." }, { status: 400 });
        }

        const activeLock = getActiveBotLock();
        if (activeLock) {
            return NextResponse.json({
                error: "Only one Recall bot can join at a time.",
                active_bot_id: activeLock.botId || null,
                active_meeting_url: activeLock.meetingUrl,
            }, { status: 409 });
        }

        const lockResult = acquireBotLock(meeting_url);
        if (!lockResult.ok) {
            return NextResponse.json({
                error: "Only one Recall bot can join at a time.",
                active_bot_id: lockResult.lock.botId || null,
                active_meeting_url: lockResult.lock.meetingUrl,
            }, { status: 409 });
        }

        console.log(`[deploy-bot] Deploying bot to: ${meeting_url}`);

        const RECALL_BASE = process.env.RECALL_API_URL || "https://ap-northeast-1.recall.ai/api/v1";
        const apiKey = process.env.RECALL_API_KEY;

        if (!apiKey) {
            console.error("[deploy-bot] Missing RECALL_API_KEY environment variable.");
            return NextResponse.json({ error: "Server missing Recall API Key." }, { status: 500 });
        }

        const response = await fetch(`${RECALL_BASE}/bot`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                meeting_url,
                bot_name,
                recording_config: {
                    // Record both audio and video
                    transcript: { provider: { meeting_captions: {} } },
                },
            })
        });

        if (!response.ok) {
            let errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                errorText = JSON.stringify(errorJson);
            } catch (e) {
                // Keep as text if not JSON
            }
            throw new Error(`Failed to deploy bot via Recall.ai. Status: ${response.status}, Details: ${errorText}`);
        }

        const data = await response.json();
        const bot_id = data.id;
        setBotLockId(bot_id);
        console.log(`[deploy-bot] Bot deployed: ${bot_id}`);

        return NextResponse.json({ bot_id, status: "deployed" });
    } catch (error: any) {
        console.error("[deploy-bot] Recall.ai error:", error.message);
        return NextResponse.json({ error: "Failed to deploy bot via Recall.ai.", detail: error.message }, { status: 502 });
    }
}
