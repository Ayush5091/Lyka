// Get Jira Projects
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

async function getProjects() {
    const jiraApiKey = process.env.JIRA_API_KEY;
    const jiraDomain = process.env.JIRA_DOMAIN;
    const jiraEmail = process.env.JIRA_EMAIL || "ayush.narayan@example.com";

    const authHeader = `Basic ${Buffer.from(`${jiraEmail}:${jiraApiKey}`).toString('base64')}`;
    const baseUrl = jiraDomain.endsWith('/') ? jiraDomain.slice(0, -1) : jiraDomain;

    try {
        const res = await axios.get(`${baseUrl}/rest/api/3/project`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });
        console.log("Projects found:");
        res.data.forEach((p: any) => console.log(`- ${p.name} (Key: ${p.key})`));
    } catch (err: any) {
        console.error("Failed to fetch projects:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

getProjects();
