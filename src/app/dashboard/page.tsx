"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Sparkles,
    ArrowUpRight,
    Layers,
    Activity,
    Database,
    Search,
    Settings,
    LogOut,
    CheckCircle2,
    Target,
    Zap,
    Calendar,
    ChevronRight,
    Terminal,
    Code2,
    Cpu,
    GitBranch,
    FileDown,
    Loader2,
    BarChart3,
    TrendingUp,
    Shield,
    Download
} from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { GraphTimeline } from "@/components/graph-timeline";
import { generateLykaPDF } from "@/utils/pdf-generator";
import { autoClassifyAgenda, evaluateAgenda, evaluateAgendaFromKeywords } from "@/utils/agenda-scoring";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface TimelineEntry {
    title: string;
    content: React.ReactNode;
}

interface EventData {
    id: string;
    title: string;
    date: string;
    department: string;
    status: "Active" | "Completed" | "Pending";
    icon: React.ReactNode;
}

interface RagContextResult {
    id: string;
    meeting_id: string;
    content: string;
    similarity: number;
    created_at?: string;
}

interface ProjectStatsData {
    successRate: number;
    prCount: number;
    uptime: string;
    vulnerabilities: number;
}

function ProjectStats({ stats }: { stats: ProjectStatsData }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Success Rate</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.successRate}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Merged PRs</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.prCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Uptime</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.uptime}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sec Issues</span>
                </div>
                <div className="text-xl font-bold text-white">{stats.vulnerabilities}</div>
            </div>
        </div>
    );
}

function AiSummarySection({ title, context, date }: { title: string, context: string, date: string }) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!summary) return;
        try {
            const filename = await generateLykaPDF(title, date, summary);
            toast.success(`Downloaded ${filename}`);
        } catch {
            toast.error("Failed to generate PDF report.");
        }
    };

    const generateSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, context })
            });
            const data = await res.json();
            if (data.summary) {
                setSummary(data.summary);
                toast.success("AI Summary generated successfully.");
            } else {
                toast.error("Failed to generate summary.");
            }
        } catch (err) {
            toast.error("Error generating AI summary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-white/5">
            {!summary && !loading && (
                <button
                    onClick={generateSummary}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 transition-all group"
                >
                    <Brain className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Analyze</span>
                </button>
            )}

            {loading && (
                <div className="flex items-center gap-3 text-slate-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-mono uppercase tracking-widest">Processing neural patterns...</span>
                </div>
            )}

            {summary && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">Analyze Report</span>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-primary group"
                            >
                                <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Download Report</span>
                            </button>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetailedReportModal({ isOpen, onClose, title, content, stats, summary, date }: { isOpen: boolean, onClose: () => void, title: string, content: React.ReactNode, stats: ProjectStatsData, summary?: string, date?: string }) {
    if (!isOpen) return null;

    const handleDownload = async () => {
        if (!summary) return;
        try {
            const filename = await generateLykaPDF(title, date || "", summary);
            toast.success(`Downloaded ${filename}`);
        } catch {
            toast.error("Failed to generate PDF report.");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-[#0a0a10] border-2 border-white/10 rounded-[3rem] flex flex-col relative"
                >
                    <div className="absolute top-8 right-8 flex items-center gap-3 z-10">
                        {summary && (
                            <button
                                onClick={handleDownload}
                                className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all group"
                                title="Download PDF"
                            >
                                <FileDown className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
                        >
                            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 rotate-180" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                        <div className="flex items-center gap-4 mb-6">
                            <Badge className="bg-primary/10 border-primary/20 text-primary px-3 py-1 font-bold tracking-widest text-[10px] uppercase">
                                Engineering Report
                            </Badge>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidential</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-8">{title}</h2>
                        <div className="mb-12">
                            <ProjectStats stats={stats} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-slate-300">
                            <div className="md:col-span-2 space-y-4">{content}</div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Sub-Modules</h4>
                                <div className="flex flex-wrap gap-2">
                                    {["Core", "Vector", "Edge"].map(m => <span key={m} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px]">{m}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function DashboardPage() {
    const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
    const [role, setRole] = useState<string>("Executive");
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState<{ isOpen: boolean, title: string, content: React.ReactNode, stats: ProjectStatsData, summary?: string, date?: string } | null>(null);
    const [ragContextByEvent, setRagContextByEvent] = useState<Record<string, RagContextResult[]>>({});

    const mockEvents: EventData[] = [
        {
            id: "1",
            title: "Architecture Review: Neural Gateway",
            date: "Today, 10:30 AM",
            department: "Core Infra",
            status: "Active",
            icon: <Cpu className="w-6 h-6 text-primary" />
        },
        {
            id: "2",
            title: "Sprint Retro: RAG Optimization",
            date: "Yesterday",
            department: "AI/ML",
            status: "Completed",
            icon: <Code2 className="w-6 h-6 text-blue-400" />
        },
        {
            id: "3",
            title: "Dependency Audit & Security",
            date: "Mar 12, 2024",
            department: "SRE",
            status: "Completed",
            icon: <Terminal className="w-6 h-6 text-emerald-400" />
        }
    ];

    const resolveDepartmentCode = (departmentLabel: string) => {
        const label = (departmentLabel || '').toLowerCase();
        if (label.includes('marketing')) return 'marketing';
        if (label.includes('finance')) return 'finance';
        if (label.includes('product')) return 'product';
        return 'eng';
    };

    useEffect(() => {
        const savedRole = localStorage.getItem("lyka_role") || "Engineer";
        setRole(savedRole.charAt(0).toUpperCase() + savedRole.slice(1));

        const fetchRagContextForEvents = async () => {
            try {
                const responses = await Promise.all(
                    mockEvents.map(async (event) => {
                        const department = resolveDepartmentCode(event.department);
                        const res = await fetch("/api/rag-search", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ query: event.title, department, limit: 3, threshold: 0.3 })
                        });
                        const data = await res.json();
                        return { eventId: event.id, results: (data.results || []) as RagContextResult[] };
                    })
                );

                const nextState: Record<string, RagContextResult[]> = {};
                for (const response of responses) {
                    nextState[response.eventId] = response.results;
                }
                setRagContextByEvent(nextState);
            } catch (err) {
                console.warn('Failed to load RAG context for events:', err);
            }
        };

        const fetchMeetings = async () => {
            try {
                const { data: meetings, error } = await supabase
                    .from('meetings')
                    .select('*')
                    .order('started_at', { ascending: false });

                if (error) throw error;

                if (meetings && meetings.length > 0) {
                    const updates: Promise<any>[] = [];
                    const dynamicTimeline: TimelineEntry[] = meetings.map((m: any) => {
                        const agendaText = typeof m.agenda === 'string' ? m.agenda.trim() : '';
                        const transcriptSource = m.transcript_text || m.summary || '';
                        const contradictionsCount = Array.isArray(m.contradictions) ? m.contradictions.length : 0;
                        const autoAgenda = !agendaText
                            ? autoClassifyAgenda(`${m.summary || ''}\n${transcriptSource}`, m.department)
                            : null;
                        const finalAgenda = agendaText || autoAgenda?.label || '';
                        const agendaInsights = finalAgenda
                            ? (autoAgenda?.keywords && autoAgenda.keywords.length > 0
                                ? evaluateAgendaFromKeywords(finalAgenda, autoAgenda.keywords, transcriptSource, contradictionsCount)
                                : evaluateAgenda(finalAgenda, transcriptSource, contradictionsCount))
                            : null;

                        if (agendaInsights && (m.agenda_score == null || m.agenda_label == null || m.outcome_score == null || (!agendaText && autoAgenda?.label))) {
                            updates.push(
                                supabase
                                    .from('meetings')
                                    .update({
                                        agenda: finalAgenda || null,
                                        agenda_label: agendaInsights.agendaLabel,
                                        agenda_score: agendaInsights.agendaScore,
                                        agenda_met: agendaInsights.agendaMet,
                                        outcome_score: agendaInsights.outcomeScore,
                                        outcome_met: agendaInsights.outcomeMet
                                    })
                                    .eq('id', m.id)
                            );
                        }

                        return {
                            title: m.started_at ? new Date(m.started_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown Date',
                            content: (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                                {m.department || 'General'}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                ID: {m.id}
                                            </span>
                                            {agendaInsights && (
                                                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                                                    Agenda: {agendaInsights.agendaLabel}
                                                </Badge>
                                            )}
                                            {agendaInsights && (
                                                <Badge className="bg-white/5 text-slate-200 border-white/10">
                                                    Outcome: {agendaInsights.outcomeScore}/100
                                                </Badge>
                                            )}
                                            {agendaInsights && (
                                                <Badge className={agendaInsights.agendaMet ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"}>
                                                    {agendaInsights.agendaMet ? 'Agenda met' : 'Agenda not met'}
                                                </Badge>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setActiveModal({
                                                isOpen: true,
                                                title: m.title || m.id,
                                                stats: { successRate: 98.4, prCount: 124, uptime: "99.9%", vulnerabilities: 0 },
                                                summary: m.summary,
                                                date: m.started_at ? new Date(m.started_at).toDateString() : 'Unknown',
                                                content: (
                                                    <div className="space-y-6">
                                                        <p className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{m.summary || "No summary available."}</p>
                                                        {m.contradictions && m.contradictions.length > 0 && (
                                                            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                                                                <div className="flex items-center gap-2 mb-4 text-red-400">
                                                                    <Shield className="w-4 h-4" />
                                                                    <span className="text-xs font-bold uppercase tracking-widest">System Contradiction Detected</span>
                                                                </div>
                                                                <ul className="space-y-3">
                                                                    {m.contradictions.map((c: string, idx: number) => (
                                                                        <li key={idx} className="text-sm text-slate-400 font-mono italic flex gap-3">
                                                                            <span className="text-red-500/50">!</span>
                                                                            {c}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all group"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                                            <span className="text-slate-400 group-hover:text-white">Full Analysis</span>
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{m.title || m.id}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed font-mono">
                                        {m.summary ? (m.summary.substring(0, 150) + "...") : "Analyzing meeting dynamics..."}
                                    </p>

                                    {m.contradictions && m.contradictions.length > 0 && (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-pulse">
                                            <Shield className="w-4 h-4 text-red-400" />
                                            <span className="text-xs font-bold text-red-400 tracking-wide">
                                                Detected {m.contradictions.length} Logical Conflict{m.contradictions.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}

                                    <AiSummarySection
                                        title={m.title || m.id}
                                        date={m.started_at ? new Date(m.started_at).toDateString() : 'Unknown'}
                                        context={m.summary || ""}
                                    />
                                </div>
                            )
                        };
                    });

                    if (updates.length > 0) {
                        Promise.all(updates).catch((updateErr) => {
                            console.warn('Failed to persist agenda scores:', updateErr);
                        });
                    }
                    setTimelineData(dynamicTimeline);
                } else {
                    // Fallback to static if no data
                    setTimelineData([]);
                }
            } catch (err) {
                console.error("Failed to fetch meetings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
        fetchRagContextForEvents();
    }, []);

    return (
        <div className="min-h-screen relative bg-[#050508] text-white selection:bg-primary/30 font-sans pb-20">
            <FloatingNavbar />

            <AnimatePresence>
                {activeModal && activeModal.isOpen && (
                    <DetailedReportModal
                        isOpen={activeModal.isOpen}
                        onClose={() => setActiveModal(null)}
                        title={activeModal.title}
                        content={activeModal.content}
                        stats={activeModal.stats}
                        summary={activeModal.summary}
                        date={activeModal.date}
                    />
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-6 md:px-10 pt-32 relative z-10">
                {/* Dashboard Header */}
                <div className="flex flex-col items-center mb-16 gap-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Badge className="bg-primary/10 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5">
                            Engineering Oversight
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">Node-7 Active</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 pr-6 rounded-2xl backdrop-blur-xl">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xl">
                            {role.charAt(0)}
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold text-green-400">DEV SESSION</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Auth Level: {role}</div>
                        </div>
                    </div>
                </div>

                {/* Section: Events */}
                <section className="mb-24">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-primary" />
                            Active Events
                        </h2>
                        <button className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                            Explore Archive
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mockEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                ragContext={ragContextByEvent[event.id] || []}
                            />
                        ))}
                    </div>
                </section>

                {/* Section: Graph Timeline */}
                <section className="mb-24">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Database className="w-6 h-6 text-primary" />
                            Graph Timeline
                        </h2>
                        <div className="text-xs text-slate-500 uppercase tracking-widest">
                            Scroll-driven context
                        </div>
                    </div>
                    <GraphTimeline />
                </section>

                {/* Section: Timeline */}
                <section className="relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />
                    <div className="pt-20">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                                <span className="text-slate-500 text-sm font-medium tracking-widest uppercase">Initializing Neural Feed...</span>
                            </div>
                        ) : (
                            <Timeline data={timelineData} />
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

function EventCard({ event, ragContext }: { event: EventData; ragContext: RagContextResult[] }) {
    const topContext = ragContext[0];
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[2rem] bg-white/5 border-2 border-white/10 backdrop-blur-md transition-all hover:border-primary/30 p-8"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {event.icon}
                </div>
                <Badge className={
                    event.status === "Active"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-white/10 text-slate-400 border-white/10"
                }>
                    {event.status}
                </Badge>
            </div>

            <div className="mb-6">
                <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">{event.department}</div>
                <h3 className="text-lg font-bold line-clamp-2">{event.title}</h3>
                {topContext && (
                    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
                            <span>Prior Context</span>
                            <span className="text-primary">{Math.round(topContext.similarity * 100)}%</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-3 italic">
                            “{topContext.content}”
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-400">
                    <Search className="w-3 h-3" />
                    <span className="text-[10px] font-medium uppercase tracking-widest">{event.date}</span>
                </div>
                <Link href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                </Link>
            </div>
        </motion.div>
    );
}
