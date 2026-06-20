import nodemailer from 'nodemailer';
import { log } from "@/utils/logger";

export async function sendMeetingSummaryEmail(data: any) {
    const { structured, meeting_id } = data;

    const senderEmail = process.env.MAIL_USERNAME;
    const recipientEmail = process.env.JIRA_EMAIL || senderEmail; // Send to the admin

    if (!senderEmail || !process.env.MAIL_PASSWORD) {
        await log.warn('email-notifier', "Skipping email notification: SMTP credentials not set.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_SERVER || "smtp.gmail.com",
            port: Number(process.env.MAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: senderEmail,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const summaryText = structured.meeting_summary || 'Meeting Summary';

        let htmlContent = `<h2>📋 Meeting Summary: ${meeting_id}</h2>`;
        htmlContent += `<p><strong>Overview:</strong> ${summaryText}</p><hr/>`;

        const users = structured.users || [];
        for (const user of users) {
            htmlContent += `<h3>${user.speaker}</h3>`;
            htmlContent += `<p><em>${user.summary}</em></p>`;

            if (user.action_items && user.action_items.length > 0) {
                htmlContent += `<strong>Actions:</strong><ul>`;
                for (const a of user.action_items) {
                    htmlContent += `<li>${a}</li>`;
                }
                htmlContent += `</ul>`;
            }
            if (user.decisions && user.decisions.length > 0) {
                htmlContent += `<strong>Decisions:</strong><ul>`;
                for (const d of user.decisions) {
                    htmlContent += `<li>${d}</li>`;
                }
                htmlContent += `</ul>`;
            }
            htmlContent += `<br/>`;
        }

        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
            to: recipientEmail,
            subject: `[Lyka] Meeting Summary: ${meeting_id}`,
            html: htmlContent,
        });

        await log.info('email-notifier', `Email sent successfully! Message ID: ${info.messageId}`, { meeting_id });
    } catch (error: any) {
        await log.error('email-notifier', `Error sending email: ${error.message}`, { meeting_id, error_details: error });
    }
}
