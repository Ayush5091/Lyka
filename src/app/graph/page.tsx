"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { GraphTimeline } from "@/components/graph-timeline";
import { FloatingNavbar } from "@/components/floating-navbar";

type GraphNodeRow = {
    id: string;
    meeting_id: string;
    node_type: string;
    label: string;
    metadata: any;
    created_at: string;
};

type GraphEdgeRow = {
    id: string;
    meeting_id: string;
    source: string;
    target: string;
    edge_type: string;
    created_at: string;
};

const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
    person: { fill: "#1e1b4b", stroke: "#6366f1", text: "#e0e7ff" },
    action: { fill: "#3b2f0f", stroke: "#f59e0b", text: "#fef3c7" },
    project: { fill: "#0f2a3b", stroke: "#38bdf8", text: "#e0f2fe" },
    decision: { fill: "#0f172a", stroke: "#22c55e", text: "#dcfce7" },
    risk: { fill: "#3b1414", stroke: "#ef4444", text: "#fee2e2" }
};

const NODE_RADIUS = 44; // Keeping NODE_RADIUS for potential future use

function safeParseMetadata(metadata: any) {
    if (!metadata) return {};
    if (typeof metadata === "object") return metadata;
    try {
        return JSON.parse(metadata);
    } catch {
        return {};
    }
}

export default function GraphPage() { 
    const [nodes, setNodes] = useState<GraphNodeRow[]>([]);
    const [edges, setEdges] = useState<GraphEdgeRow[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [viewport, setViewport] = useState({ width: 960, height: 720 });

    useEffect(() => {
        const fetchGraph = async () => {
            const res = await fetch("/api/graph");
            const data = await res.json();
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
        };
        fetchGraph();
    }, []);

    const sortedNodes = useMemo(() => {
        return [...nodes].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [nodes]);

    const sortedEdges = useMemo(() => {
        return [...edges].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [edges]);

    const totalSteps = Math.max(sortedNodes.length, 1);
    const visibleCount = Math.max(1, Math.floor(progress * totalSteps));
    const visibleNodes = useMemo(() => sortedNodes.slice(0, visibleCount), [sortedNodes, visibleCount]);
    const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
    const visibleEdges = useMemo(() => {
        return sortedEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
    }, [sortedEdges, visibleNodeIds]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setViewport({ width, height });
            }
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const timeline = timelineRef.current;
        if (!timeline) return;
        const handleScroll = () => {
            const maxScroll = timeline.scrollHeight - timeline.clientHeight;
            const nextProgress = maxScroll <= 0 ? 1 : timeline.scrollTop / maxScroll;
            setProgress(Math.max(0, Math.min(1, nextProgress)));
        };
        timeline.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => timeline.removeEventListener("scroll", handleScroll);
    }, [sortedNodes.length]);

    const simulationNodes = useMemo(() => {
        const mapped = visibleNodes.map((node) => ({
            ...node,
            x: viewport.width / 2,
            y: viewport.height / 2
        }));
        const simulation = d3
            .forceSimulation(mapped as any)
            .force("charge", d3.forceManyBody().strength(-180))
            .force("center", d3.forceCenter(viewport.width / 2, viewport.height / 2))
            .force("collision", d3.forceCollide(NODE_RADIUS + 12))
            .force(
                "link",
                d3
                    .forceLink(visibleEdges as any)
                    .id((d: any) => d.id)
                    .distance(140)
            )
            .stop();

        simulation.tick(120);
        return mapped;
    }, [visibleNodes, visibleEdges, viewport.width, viewport.height]);

    return (
        <div className="min-h-screen bg-[#050508] text-white">
            <FloatingNavbar />
            <div className="pt-24 px-8 pb-16">
                <GraphTimeline />
            </div>
        </div>
    );
}
