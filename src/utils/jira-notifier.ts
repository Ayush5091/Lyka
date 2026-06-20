import axios from "axios";
import { log } from "./logger";

/**
 * Automatically creates Jira issues (Tasks) for extracted action items.
 */
export async function sendActionItemsToJira(data: any) {
    const { structured, meeting_id } = data;
    const jiraApiKey = process.env.JIRA_API_KEY;
    const jiraDomain = process.env.JIRA_DOMAIN;

    // Using a default email if not provided, Jira requires an email for Basic Auth
    // In a production app, this should come from process.env.JIRA_EMAIL
    const jiraEmail = process.env.JIRA_EMAIL || "ayush.narayan@example.com";

    // Jira requires a project key (e.g., "MER", "PROJ"). Defaulting to "MER" if not set.
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY || "MER";

    if (!jiraApiKey || !jiraDomain) {
        await log.warn("jira-notifier", "Skipping Jira sync: Credentials missing in .env.");
        return;
    }

    const users = structured.users || [];
    let itemsCreated = 0;

    const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraApiKey}`).toString('base64')}`;
    const baseUrl = jiraDomain.endsWith('/') ? jiraDomain.slice(0, -1) : jiraDomain;

    for (const user of users) {
        if (!user.action_items || user.action_items.length === 0) continue;

        for (const actionItem of user.action_items) {
            try {
                // Construct standard Jira REST API v3 payload
                const payload = {
                    fields: {
                        project: {
                            key: jiraProjectKey
                        },
                        summary: `Action Item: ${actionItem.substring(0, 100)}${actionItem.length > 100 ? '...' : ''}`,
                        description: {
                            type: "doc",
                            version: 1,
                            content: [
                                {
                                    type: "paragraph",
                                    content: [
                                        {
                                            text: `Meeting ID: ${meeting_id}\nAssignee mentioned: ${user.speaker}\n\nFull details: ${actionItem}`,
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

                await axios.post(`${baseUrl}/rest/api/3/issue`, payload, {
                    headers: {
                        'Authorization': authHeader,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                itemsCreated++;
            } catch (err: any) {
                const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
                await log.error("jira-notifier", `Failed to create Jira issue for ${user.speaker}`, { error: detail });
            }
        }
    }

    if (itemsCreated > 0) {
        await log.info("jira-notifier", `Successfully created ${itemsCreated} Jira issues.`, { meeting_id });
    }
}
