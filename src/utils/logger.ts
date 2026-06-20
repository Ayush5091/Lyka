import { supabase } from "../lib/supabase";

export const log = {
    info: async (module: string, message: string, meta: any = {}) => {
        console.log(`[INFO][${module}] ${message}`, meta);
        await dbLog('info', module, message, meta);
    },
    warn: async (module: string, message: string, meta: any = {}) => {
        console.warn(`[WARN][${module}] ${message}`, meta);
        await dbLog('warn', module, message, meta);
    },
    error: async (module: string, message: string, meta: any = {}) => {
        console.error(`[ERROR][${module}] ${message}`, meta);
        await dbLog('error', module, message, meta);
    }
};

async function dbLog(level: string, module: string, message: string, meta: any) {
    try {
        const { error } = await supabase.from('logs').insert({
            level,
            module: module,
            message,
            metadata: meta
        });
        if (error) console.error("Logger failed to write to DB:", error.message);
    } catch (err) {
        // Fail silently in DB to avoid crashing main flow
    }
}
