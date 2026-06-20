import * as fs from "fs";
import * as path from "path";

// Manually parse .env file BEFORE any imports that might need it
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

// Now we can safely import modules that depend on process.env (like Supabase logger)
import { sendActionItemsToJira } from "./src/utils/jira-notifier";

async function testJira() {
    console.log("Starting Jira test...");

    // We expect JIRA_API_KEY and JIRA_DOMAIN to be set, plus optionally JIRA_EMAIL and JIRA_PROJECT_KEY
    if (!process.env.JIRA_API_KEY || !process.env.JIRA_DOMAIN) {
        console.error("Missing JIRA_API_KEY or JIRA_DOMAIN in .env file.");
        return;
    }

    const mockData = {
        meeting_id: "test-meeting-jira-123",
        structured: {
            users: [
                {
                    speaker: "Ayush Narayan",
                    summary: "Led the discussion.",
                    decisions: [],
                    action_items: [
                        "Verify Jira integration works by EOD",
                        "Review the new Next.js dashboard code"
                    ]
                },
                {
                    speaker: "Engineer Bob",
                    summary: "Backend updates.",
                    decisions: [],
                    action_items: [
                        "Check Supabase logs for errors"
                    ]
                }
            ]
        }
    };

    try {
        await sendActionItemsToJira(mockData);
        console.log("Jira test completed. Check your Jira project boards!");
    } catch (e) {
        console.error("Jira test failed exception:", e);
    }
}

testJira();
