import axios from "axios";

/**
 * Builds and sends a Slack Block Kit message directly from the server.
 */
export async function sendMeetingSummaryToSlack(data: any) {
    const { structured, speaker_count, utterance_count, meeting_id } = data;
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("[slack] Skipping notification: SLACK_WEBHOOK_URL not set.");
        return;
    }

    const users = structured.users || [];
    const blocks: any[] = [];

    // Sanitize summary for JSON
    const summaryText = (structured.meeting_summary || 'Meeting Summary').replace(/"/g, "'");

    // ── Header ──
    blocks.push({
        type: 'header',
        text: { type: 'plain_text', text: '📋 Meeting Summary', emoji: true }
    });

    blocks.push({ type: 'divider' });

    // ── Meeting summary ──
    blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Overview:*\n${summaryText}` }
    });

    blocks.push({ type: 'divider' });

    // ── Per-speaker sections ──
    for (const user of users) {
        const header = `*${user.speaker}*\n_${user.summary}_`.replace(/"/g, "'");
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: header }
        });

        if (user.action_items && user.action_items.length > 0) {
            const items = user.action_items.map((a: string) => `• ${a.replace(/"/g, "'")}`).join('\n');
            blocks.push({
                type: 'section',
                text: { type: 'mrkdwn', text: `*Actions:*\n${items}` }
            });
        }

        if (user.decisions && user.decisions.length > 0) {
            const decisions = user.decisions.map((d: string) => `• ${d.replace(/"/g, "'")}`).join('\n');
            blocks.push({
                type: 'section',
                text: { type: 'mrkdwn', text: `*Decisions:*\n${decisions}` }
            });
        }

        blocks.push({ type: 'divider' });
    }

    // ── Footer ──
    blocks.push({
        type: 'context',
        elements: [{
            type: 'mrkdwn',
            text: `🤖 ${speaker_count} speakers · ${utterance_count} utterances · ID: ${meeting_id}`
        }]
    });

    const payload = {
        text: `Meeting Summary: ${summaryText}`,
        blocks: blocks
    };

    console.log(`[slack] Sending direct notification for ${meeting_id}...`);

    try {
        await axios.post(webhookUrl, payload);
        console.log(`[slack] SUCCESS! Notification delivered.`);
    } catch (err: any) {
        const detail = err.response?.data ?? err.message;
        console.error("[slack] Error delivering notification:", detail);
    }
}
