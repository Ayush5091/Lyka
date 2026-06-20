type BotLock = {
    botId?: string;
    meetingUrl: string;
    acquiredAt: number;
    expiresAt: number;
};

const LOCK_TTL_MS = 60 * 60 * 1000;
const GLOBAL_LOCK_KEY = "__lykaBotLock__";

function getGlobalLock(): BotLock | null {
    const lock = (globalThis as any)[GLOBAL_LOCK_KEY] as BotLock | undefined;
    if (!lock) return null;
    if (Date.now() > lock.expiresAt) {
        delete (globalThis as any)[GLOBAL_LOCK_KEY];
        return null;
    }
    return lock;
}

export function acquireBotLock(meetingUrl: string) {
    const active = getGlobalLock();
    if (active) {
        return { ok: false, lock: active } as const;
    }
    const newLock: BotLock = {
        meetingUrl,
        acquiredAt: Date.now(),
        expiresAt: Date.now() + LOCK_TTL_MS,
    };
    (globalThis as any)[GLOBAL_LOCK_KEY] = newLock;
    return { ok: true, lock: newLock } as const;
}

export function setBotLockId(botId: string) {
    const active = getGlobalLock();
    if (!active) return;
    (globalThis as any)[GLOBAL_LOCK_KEY] = { ...active, botId };
}

export function releaseBotLock(botId?: string) {
    const active = getGlobalLock();
    if (!active) return;
    if (!botId || !active.botId || active.botId === botId) {
        delete (globalThis as any)[GLOBAL_LOCK_KEY];
    }
}

export function getActiveBotLock() {
    return getGlobalLock();
}
