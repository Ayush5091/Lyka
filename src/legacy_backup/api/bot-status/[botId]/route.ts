import { NextResponse } from "next/server";
import { releaseBotLock } from "@/utils/bot-lock";

const DONE_STATUSES = new Set(["done", "recording_done"]);
const FAILED_STATUSES = new Set(["error", "fatal", "recording_failed", "timeout", "in_waiting_room_timeout"]);
const KNOWN_REGIONS = ["us-west-2", "us-east-1", "eu-central-1", "ap-northeast-1"];

function getRegions() {
    const configuredRegion = process.env.RECALL_REGION || "ap-northeast-1";
    return [configuredRegion, ...KNOWN_REGIONS.filter(r => r !== configuredRegion)];
}

function getBaseUrl(region: string) {
    return `https://${region}.recall.ai/api/v1`;
}

export async function GET(request: Request, { params }: { params: { botId: string } | Promise<{ botId: string }> }) {
    // Next.js Note: `params` should be awaited in Next.js 15, we await it here to be safe and compatible.
    const resolvedParams = await Promise.resolve(params);
    const { botId } = resolvedParams;
    let responseData: any = null;
    let usedRegion = "";
    const apiKey = process.env.RECALL_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Server missing Recall API Key." }, { status: 500 });
    }

    try {
        // Try multiple regions exactly like the reference script
        for (const region of getRegions()) {
            try {
                const response = await fetch(`${getBaseUrl(region)}/bot/${botId}`, {
                    headers: {
                        'Authorization': `Token ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    // Use force-cache or no-store carefully, Next.js dynamic routes usually don't cache GET requests with dynamic params intrinsically but we specify it clearly.
                    cache: 'no-store'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorObj: any = {};
                    try {
                        errorObj = JSON.parse(errorText);
                    } catch (e) {
                        errorObj = { detail: errorText };
                    }

                    const code = errorObj.code;
                    const detail = String(errorObj.detail || "").toLowerCase();
                    if (response.status === 401 && code === "authentication_failed" && detail.includes("region")) {
                        continue; // try next region
                    }
                    throw new Error(`Recall API returned ${response.status}: ${JSON.stringify(errorObj)}`);
                }

                responseData = await response.json();
                usedRegion = region;
                break;
            } catch (err: any) {
                if (err.message && err.message.includes("region")) continue; // Try next region if authentication failed due to region
                throw err;
            }
        }

        if (!responseData) {
            throw new Error("Unable to reach Recall API in any region.");
        }

        const data = responseData;
        const statusChanges = data.status_changes || [];
        const currentStatus = data.status || "unknown";

        // Exact logic from reference: check if 'recording_done' exists in history
        const hasRecordingDone = statusChanges.some((s: any) => s.code === "recording_done");

        console.log(`[bot-status] Bot ${botId} status: ${currentStatus} (recording_done: ${hasRecordingDone})`);

        if (DONE_STATUSES.has(currentStatus) || hasRecordingDone) {
            // ── Discovery Phase ───────────────────────────────────────────────────

            // 1. Recursive search for ANY video URL
            const findVideoUrl = (obj: any, depth = 0): string | null => {
                if (!obj || depth > 6) return null;
                if (typeof obj === 'string' && obj.startsWith('http') && (obj.includes('.mp4') || obj.includes('media-shortcuts') || obj.includes('/video'))) return obj;
                if (Array.isArray(obj)) {
                    for (const item of obj) {
                        const found = findVideoUrl(item, depth + 1);
                        if (found) return found;
                    }
                } else if (typeof obj === 'object') {
                    for (const key in obj) {
                        const found = findVideoUrl(obj[key], depth + 1);
                        if (found) return found;
                    }
                }
                return null;
            };

            // 2. Search for Recall's Native Transcript (Diarized JSON)
            // Based on user snippet, it's often an array of utterances
            const transcript = data.transcript || data.recordings?.[0]?.transcript || null;
            const videoUrl = findVideoUrl(data);

            if (videoUrl || transcript) {
                console.log(`[bot-status] SUCCESS! ${videoUrl ? 'Video URL' : ''} ${transcript ? 'Transcript' : ''} found.`);
                releaseBotLock(botId);
                return NextResponse.json({
                    is_done: true,
                    is_failed: false,
                    video_url: videoUrl,
                    recall_transcript: transcript,
                    participants: data.participants || data.calendar_meetings?.[0]?.participants || [],
                    should_retry: false,
                    current_status: currentStatus,
                });
            } else {
                console.log(`[bot-status] Bot is 'done' but video_url and transcript are still missing. Polling again...`);
            }
        }

        if (FAILED_STATUSES.has(currentStatus)) {
            releaseBotLock(botId);
            return NextResponse.json({
                is_done: false,
                is_failed: true,
                video_url: null,
                should_retry: false,
                current_status: currentStatus,
            });
        }

        // Return retry to N8N
        return NextResponse.json({
            is_done: false,
            is_failed: false,
            video_url: null,
            should_retry: true,
            current_status: currentStatus,
        });

    } catch (err: any) {
        console.error(`[bot-status] Error fetching bot ${botId}:`, err.message);
        return NextResponse.json({ error: "Recall API error", detail: err.message }, { status: 502 });
    }
}
