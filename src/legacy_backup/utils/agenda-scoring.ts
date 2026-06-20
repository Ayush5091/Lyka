const STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has', 'have',
    'if', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their',
    'then', 'there', 'these', 'they', 'this', 'to', 'was', 'were', 'will', 'with'
]);

const DEFAULT_AGENDAS = [
    {
        label: 'Budget & Finance Review',
        keywords: ['budget', 'finance', 'forecast', 'spend', 'cost', 'savings', 'allocation', 'capex', 'opex']
    },
    {
        label: 'Architecture & Infrastructure',
        keywords: ['architecture', 'infra', 'infrastructure', 'platform', 'migration', 'cloud', 'scalability', 'latency']
    },
    {
        label: 'Security & Compliance',
        keywords: ['security', 'audit', 'incident', 'breach', 'compliance', 'risk', 'credential', 'access']
    },
    {
        label: 'Sprint Planning & Delivery',
        keywords: ['sprint', 'backlog', 'deliverable', 'milestone', 'story', 'velocity', 'roadmap']
    },
    {
        label: 'Product Strategy',
        keywords: ['product', 'strategy', 'roadmap', 'feature', 'prioritization', 'launch', 'market']
    },
    {
        label: 'Go-To-Market & Sales',
        keywords: ['sales', 'pipeline', 'gtm', 'go-to-market', 'pricing', 'revenue', 'partner', 'channel']
    },
    {
        label: 'Operations & Process',
        keywords: ['operations', 'process', 'workflow', 'handoff', 'sla', 'efficiency', 'incident']
    }
];

function normalizeText(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractAgendaKeywords(agenda: string) {
    const normalized = normalizeText(agenda);
    const tokens = normalized.split(' ').filter(Boolean);
    const keywords = tokens.filter((token) => token.length > 2 && !STOPWORDS.has(token));

    return Array.from(new Set(keywords));
}

export function buildAgendaLabel(agenda: string) {
    const cleaned = agenda.replace(/\s+/g, ' ').trim();
    if (!cleaned) return 'General';
    const splitToken = cleaned.split(/[:.-]/)[0]?.trim();
    const base = splitToken || cleaned;
    return base.length > 48 ? `${base.slice(0, 45)}...` : base;
}

export function computeAgendaScore(agenda: string, transcript: string) {
    const keywords = extractAgendaKeywords(agenda);
    if (keywords.length === 0) {
        return { score: 0, matched: 0, total: 0, keywords: [] as string[] };
    }

    const haystack = ` ${normalizeText(transcript)} `;
    let matched = 0;
    for (const word of keywords) {
        if (haystack.includes(` ${word} `)) matched += 1;
    }

    const ratio = matched / keywords.length;
    const score = Math.round(ratio * 100);

    return { score, matched, total: keywords.length, keywords };
}

export function computeAgendaScoreFromKeywords(keywords: string[], transcript: string) {
    if (keywords.length === 0) {
        return { score: 0, matched: 0, total: 0, keywords: [] as string[] };
    }

    const haystack = ` ${normalizeText(transcript)} `;
    let matched = 0;
    for (const word of keywords) {
        const normalized = normalizeText(word);
        if (!normalized) continue;
        if (haystack.includes(` ${normalized} `)) matched += 1;
    }

    const ratio = matched / keywords.length;
    const score = Math.round(ratio * 100);

    return { score, matched, total: keywords.length, keywords };
}

export function computeOutcomeScore(agendaScore: number, contradictionsCount = 0) {
    const penalty = Math.min(contradictionsCount * 10, 40);
    return Math.max(0, Math.min(100, agendaScore - penalty));
}

export function evaluateAgenda(agenda: string, transcript: string, contradictionsCount = 0) {
    const { score: agendaScore } = computeAgendaScore(agenda, transcript);
    const outcomeScore = computeOutcomeScore(agendaScore, contradictionsCount);

    return {
        agendaLabel: buildAgendaLabel(agenda),
        agendaScore,
        agendaMet: agendaScore >= 70,
        outcomeScore,
        outcomeMet: outcomeScore >= 80
    };
}

export function evaluateAgendaFromKeywords(agendaLabel: string, keywords: string[], transcript: string, contradictionsCount = 0) {
    const { score: agendaScore } = computeAgendaScoreFromKeywords(keywords, transcript);
    const outcomeScore = computeOutcomeScore(agendaScore, contradictionsCount);

    return {
        agendaLabel,
        agendaScore,
        agendaMet: agendaScore >= 70,
        outcomeScore,
        outcomeMet: outcomeScore >= 80
    };
}

export function autoClassifyAgenda(text: string, department = '') {
    const normalized = normalizeText(text || '');
    if (!normalized) {
        return null;
    }

    const candidates = DEFAULT_AGENDAS.map((agenda) => {
        const scoreResult = computeAgendaScoreFromKeywords(agenda.keywords, normalized);
        return {
            label: agenda.label,
            keywords: agenda.keywords,
            score: scoreResult.score
        };
    });

    const top = candidates.sort((a, b) => b.score - a.score)[0];
    if (!top || top.score === 0) {
        return {
            label: department ? `${department} Review` : 'General Review',
            keywords: [],
            score: 0
        };
    }

    return top;
}
