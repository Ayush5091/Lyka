import { sendMeetingSummaryToSlack } from "./src/utils/slack-notifier";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env file
const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of envConfig) {
        if (line && line.includes("=") && !line.startsWith("#")) {
            const [key, ...rest] = line.split("=");
            process.env[key.trim()] = rest.join("=").trim();
        }
    }
}

async function testSlack() {
    console.log("Starting Slack test...");

    const mockData = {
        meeting_id: "test-meeting-123",
        speaker_count: 3,
        utterance_count: 45,
        source: "test-script",
        structured: {
            meeting_summary: "This is a test meeting to verify the Slack integration is working correctly.",
            users: [
                {
                    speaker: "Ayush Narayan",
                    summary: "Led the discussion on system architecture.",
                    decisions: ["Decided to use Next.js App Router.", "Approved the new premium UI design."],
                    action_items: ["Verify Slack and Jira integrations by EOD."]
                },
                {
                    speaker: "Engineer Bob",
                    summary: "Provided updates on backend migration.",
                    decisions: ["Will use Supabase for the database layer."],
                    action_items: []
                }
            ],
            contradictions: []
        }
    };

    try {
        await sendMeetingSummaryToSlack(mockData);
        console.log("Slack test completed.");
    } catch (e) {
        console.error("Slack test failed:", e);
    }
}

testSlack();
