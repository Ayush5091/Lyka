import fs from "fs";
import path from "path";
import axios from "axios";

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

async function getIssueTypes() {
    const jiraApiKey = process.env.JIRA_API_KEY;
    const jiraDomain = process.env.JIRA_DOMAIN;
    const jiraEmail = process.env.JIRA_EMAIL || "ayush.narayan@example.com";
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY;

    const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraApiKey}`).toString('base64')}`;
    const baseUrl = jiraDomain?.endsWith('/') ? jiraDomain.slice(0, -1) : jiraDomain;

    try {
        const res = await axios.get(`${baseUrl}/rest/api/3/project/${jiraProjectKey}`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        console.log(`Issue types for project ${jiraProjectKey}:`);
        res.data.issueTypes.forEach((type: any) => console.log(`- ${type.name} (ID: ${type.id})`));
    } catch (err: any) {
        console.error("Failed to fetch project details:");
        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

getIssueTypes();
