# Meridian Module Map

This file serves as a quick reference for the core infrastructure of the Meridian project.

## 🎙️ Deepgram (Transcription)
*   **Module**: Transcription & Diarization
*   **Path**: [src/app/api/process-meeting/route.ts](file:///d:/testing/meridian/src/app/api/process-meeting/route.ts)
*   **Logic**: Handles the audio-to-text pipeline using the `nova-2` model.

## 🤖 Recall.ai (Meeting Bot)
*   **Bot Deployment**: [src/app/api/deploy-bot/route.ts](file:///d:/testing/meridian/src/app/api/deploy-bot/route.ts)
*   **Status & URL Discovery**: [src/app/api/bot-status/[botId]/route.ts](file:///d:/testing/meridian/src/app/api/bot-status/%5BbotId%5D/route.ts)
*   **Logic**: Manages the Lyka bot's lifecycle, recording, and media shortcuts.

## 🧠 OpenAI (Intelligence)
*   **Core Analysis**: [src/app/api/process-meeting/route.ts](file:///d:/testing/meridian/src/app/api/process-meeting/route.ts)
*   **Dashboard Insights**: [src/app/api/ai-summary/route.ts](file:///d:/testing/meridian/src/app/api/ai-summary/route.ts)
*   **Logic**: Generates summaries, action items, and RAG-based intelligence deltas.

## 💾 Supabase (Persistence & RAG)
*   **Initialization**: [src/lib/supabase.ts](file:///d:/testing/meridian/src/lib/supabase.ts)
*   **RAG Storage**: Part of the `process-meeting` route and handled by n8n.
*   **Logic**: Manages meeting chunks, decisions, and project intelligence.

## 📡 Notifiers (Channels)
*   **Slack**: `src/utils/slack-notifier.ts`
*   **Jira**: `src/utils/jira-notifier.ts`
*   **Gmail**: `src/utils/email-notifier.ts`
*   **Logger**: `src/utils/logger.ts` / `src/app/api/log/route.ts`
