// Load environment variables via native node execution
import fs from "fs";
import path from "path";
import axios from "axios";

// Parse .env manually
const envPath = path.resolve("./.env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of envConfig) {
        if (line && line.includes("=") && !line.startsWith("#")) {
            const [key, ...rest] = line.split("=");
            process.env[key.trim()] = rest.join("=").trim();
        }
    }
}

async function testJiraDirect() {
    console.log("Starting DIRECT Jira test...");

    const jiraApiKey = process.env.JIRA_API_KEY;
    const jiraDomain = process.env.JIRA_DOMAIN;
    const jiraEmail = process.env.JIRA_EMAIL || "ayush.narayan@example.com";
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY || "MER";

    if (!jiraApiKey || !jiraDomain) {
        console.error("Missing JIRA_API_KEY or JIRA_DOMAIN in .env file.");
        return;
    }

    const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraApiKey}`).toString('base64')}`;
    const baseUrl = jiraDomain.endsWith('/') ? jiraDomain.slice(0, -1) : jiraDomain;

    const actionItem = "This is a direct API verification test for Meridian via Node script.";
    const userSpeaker = "Test Script";
    const meeting_id = "direct-test-123";

    try {
        const payload = {
            fields: {
                project: {
                    key: jiraProjectKey
                },
                summary: `Action Item: ${actionItem.substring(0, 100)}`,
                description: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    text: `Meeting ID: ${meeting_id}\nAssignee mentioned: ${userSpeaker}\n\nFull details: ${actionItem}`,
                                    type: "text"
                                }
                            ]
                        }
                    ]
                },
                issuetype: {
                    name: "Idea"
                }
            }
        };

        const res = await axios.post(`${baseUrl}/rest/api/3/issue`, payload, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log("Jira direct test SUCCESS! Issue Key:", res.data.key);
    } catch (err: any) {
        console.error("Jira direct test FAILED:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

testJiraDirect();
