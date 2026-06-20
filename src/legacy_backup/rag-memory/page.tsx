"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, Loader2, ArrowLeft, ChevronDown, ChevronUp, Sparkles, Database } from "lucide-react";
import Link from "next/link";
import { LiquidMetalBackground } from "@/components/liquid-metal-background";
import { Badge } from "@/components/ui/badge";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function RagMemoryPage() {
    const [query, setQuery] = useState("");
    const [department, setDepartment] = useState("eng");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(false);
        try {
            const res = await fetch("/api/rag-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, department, limit: 8, threshold: 0.3 }),
            });
            const data = await res.json();
            setResults(data.results || []);
        } catch (e) {
            setResults([]);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    return (
        <div className="relative min-h-screen selection:bg-primary/30 p-8">
            <LiquidMetalBackground />

            {/* Header */}
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/dashboard" className="group text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:-translate-x-1 transition-transform border border-white/5">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Dashboard
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-0">
                                Neural Search
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
                                <Database className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">Memory Repository</h1>
                        </div>
                        <p className="text-slate-400 text-sm ml-16 max-w-xl">
                            Semantically probe the collective intelligence of all recorded sessions.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/10 mb-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    id="rag-search-input"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Probe for past decisions, budget notes, or Q1 roadmaps..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                            <select
                                id="rag-dept-select"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
                            >
                                <option value="eng">Engineering</option>
                                <option value="marketing">Marketing</option>
                                <option value="finance">Finance</option>
                                <option value="product">Product</option>
                            </select>
                            <ShinyButton
                                id="rag-search-btn"
                                onClick={handleSearch}
                                disabled={loading || !query.trim()}
                                className="px-8 py-4 text-sm"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Probe"}
                            </ShinyButton>
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                Vectorized Similarity Scoring active
                            </p>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {searched ? (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {results.length === 0 ? (
                                    <div className="glass rounded-[2.5rem] p-16 border border-white/10 text-center">
                                        <Brain className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-xl font-bold text-slate-300 mb-2">Neural Mismatch</h3>
                                        <p className="text-slate-500 text-sm italic max-w-sm mx-auto">
                                            No relevant semantic patterns found for <span className="text-primary">"{query}"</span> in the current department.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center px-4 mb-2">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                Ranked results — Retrieval Latency: 12ms
                                            </p>
                                            <Badge variant="outline" className="text-[10px] py-0 border-white/5 text-slate-500">
                                                {results.length} Nodes Found
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {results.map((r, i) => (
                                                <motion.div
                                                    key={r.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="glass rounded-[1.5rem] border border-white/5 hover:border-primary/20 transition-all overflow-hidden group/card"
                                                >
                                                    <div
                                                        className="p-6 cursor-pointer flex justify-between items-start gap-6"
                                                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                                    SES_{r.meeting_id?.substring(0, 6)}
                                                                </span>
                                                                <div className="h-1 w-1 rounded-full bg-slate-700" />
                                                                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">
                                                                    {Math.round(r.similarity * 100)}% Recall Confidence
                                                                </span>
                                                            </div>
                                                            <p className="text-[15px] text-slate-300 leading-relaxed line-clamp-2 italic font-serif">
                                                                “{r.content}”
                                                            </p>
                                                        </div>
                                                        <div className={`mt-2 p-2 rounded-full border transition-all ${expandedId === r.id ? 'bg-primary border-primary text-white scale-110' : 'bg-white/5 border-white/10 text-slate-500 group-hover/card:border-primary/30 group-hover/card:text-primary'}`}>
                                                            {expandedId === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedId === r.id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="border-t border-white/5 px-6 py-6 bg-white/[0.02]"
                                                            >
                                                                <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap italic font-serif">
                                                                    “{r.content}”
                                                                </p>
                                                                <div className="mt-6 flex flex-wrap gap-4 items-center">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Context Node</span>
                                                                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded italic">{r.id}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Created At</span>
                                                                        <span className="text-[10px] font-mono text-slate-400 italic">{new Date(r.created_at).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <div className="py-20 text-center">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="max-w-md mx-auto"
                                >
                                    <Database className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                                    <h3 className="text-xl font-bold text-slate-500 mb-2 font-serif italic opacity-50">Enter a query to initiate semantic retrieval</h3>
                                    <p className="text-sm text-slate-600">The neural engine will cross-reference your request with all historical knowledge nodes.</p>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
