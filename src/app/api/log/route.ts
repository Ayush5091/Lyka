import { NextRequest, NextResponse } from "next/server";
import { log } from "@/utils/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { level = 'info', module = 'external', message, metadata = {} } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (level === 'error') {
            await log.error(module, message, metadata);
        } else if (level === 'warn') {
            await log.warn(module, message, metadata);
        } else {
            await log.info(module, message, metadata);
        }

        return NextResponse.json({ status: "logged" });
    } catch (err: any) {
        return NextResponse.json({ error: "Logging failed", detail: err.message }, { status: 500 });
    }
}
