"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";

const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
    person: { fill: "#1e1b4b", stroke: "#6366f1", text: "#e0e7ff" },
    action: { fill: "#3b2f0f", stroke: "#f59e0b", text: "#fef3c7" },
    project: { fill: "#0f2a3b", stroke: "#38bdf8", text: "#e0f2fe" },
    decision: { fill: "#0f172a", stroke: "#22c55e", text: "#dcfce7" },
    risk: { fill: "#3b1414", stroke: "#ef4444", text: "#fee2e2" }
};

const NODE_RADIUS = 34;
const GRAPH_SCALE = 0.82;

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

function safeParseMetadata(metadata: any) {
    if (!metadata) return {};
    if (typeof metadata === "object") return metadata;
    try {
        return JSON.parse(metadata);
    } catch {
        return {};
    }
}

export function GraphTimeline() {
    const [nodes, setNodes] = useState<GraphNodeRow[]>([]);
    const [edges, setEdges] = useState<GraphEdgeRow[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [viewport, setViewport] = useState({ width: 960, height: 720 });
    const [simNodes, setSimNodes] = useState<Array<GraphNodeRow & { x: number; y: number; meta?: any }>>([]);
    const animationRef = useRef<number | null>(null);
    const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

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
        const baseEdges = sortedEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));

        // Infer involvement edges when explicit relations are missing.
        const nodesByLabel = new Map<string, GraphNodeRow>();
        const projectNodes = visibleNodes.filter((node) => node.node_type === "project");

        visibleNodes.forEach((node) => {
            if (node.label) nodesByLabel.set(node.label.toLowerCase(), node);
        });

        const inferredEdges: GraphEdgeRow[] = [];
        visibleNodes.forEach((node) => {
            if (node.node_type !== "action") return;
            const meta = safeParseMetadata(node.metadata);
            const ownerName = typeof meta.owner === "string" ? meta.owner.toLowerCase() : "";
            const ownerNode = ownerName ? nodesByLabel.get(ownerName) : undefined;
            const projectNode = projectNodes[0];

            if (ownerNode) {
                inferredEdges.push({
                    id: `inferred-owner-${node.id}-${ownerNode.id}`,
                    meeting_id: node.meeting_id,
                    source: ownerNode.id,
                    target: node.id,
                    edge_type: "owner",
                    created_at: node.created_at
                });
            }

            if (projectNode) {
                inferredEdges.push({
                    id: `inferred-action-${node.id}-${projectNode.id}`,
                    meeting_id: node.meeting_id,
                    source: node.id,
                    target: projectNode.id,
                    edge_type: "drives",
                    created_at: node.created_at
                });
            }
        });

        return [...baseEdges, ...inferredEdges];
    }, [sortedEdges, visibleNodeIds, visibleNodes]);

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
        const svg = svgRef.current;
        if (!svg) return;
        const zoomBehavior = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.6, 2.2])
            .on("zoom", (event) => {
                setZoomTransform(event.transform);
            });
        d3.select(svg).call(zoomBehavior as any);
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

    useEffect(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (simulationRef.current) {
            simulationRef.current.stop();
            simulationRef.current = null;
        }

        if (visibleNodes.length === 0) {
            setSimNodes([]);
            return;
        }

        const mapped = visibleNodes.map((node) => ({
            ...node,
            x: viewport.width / 2 + (Math.random() - 0.5) * 120,
            y: viewport.height / 2 + (Math.random() - 0.5) * 120,
            meta: safeParseMetadata(node.metadata)
        }));

        const simulation = d3
            .forceSimulation(mapped as any)
            .alpha(1)
            .alphaDecay(0.03)
            .velocityDecay(0.35)
            .force("charge", d3.forceManyBody().strength(-220))
            .force("center", d3.forceCenter(viewport.width / 2, viewport.height / 2))
            .force("collision", d3.forceCollide(NODE_RADIUS + 10))
            .force(
                "link",
                d3
                    .forceLink(visibleEdges as any)
                    .id((d: any) => d.id)
                    .distance(190)
                    .strength(0.7)
            );

        simulationRef.current = simulation;

        const tick = () => {
            setSimNodes([...mapped]);
            if (simulation.alpha() > 0.03) {
                animationRef.current = requestAnimationFrame(tick);
            } else {
                animationRef.current = null;
            }
        };

        simulation.on("tick", () => {
            if (!animationRef.current) {
                animationRef.current = requestAnimationFrame(tick);
            }
        });

        return () => {
            simulation.stop();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [visibleNodes, visibleEdges, viewport.width, viewport.height]);

    return (
        <div className="flex min-h-[70vh] rounded-[2.5rem] border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="flex-1 p-8" ref={containerRef}>
                <div className="mb-6">
                    <h3 className="text-2xl font-semibold">Graph Timeline</h3>
                    <p className="text-sm text-slate-400">
                        Scroll the right panel to animate connections between people, actions, and projects.
                    </p>
                </div>
                <div className="relative h-[60vh] rounded-[2rem] border border-white/10 bg-black/40 overflow-hidden">
                    <svg ref={svgRef} width={viewport.width} height={viewport.height} className="absolute inset-0">
                        <g
                            transform={`translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k}) translate(${(viewport.width * (1 - GRAPH_SCALE)) / 2}, ${(viewport.height * (1 - GRAPH_SCALE)) / 2}) scale(${GRAPH_SCALE})`}
                        >
                            {visibleEdges.map((edge) => {
                                const source = simNodes.find((node) => node.id === edge.source);
                                const target = simNodes.find((node) => node.id === edge.target);
                                if (!source || !target) return null;
                                const strokeColor = edge.edge_type === "risk" || edge.edge_type === "contradiction" ? "#ef4444" : "#f8fafc";
                                return (
                                    <line
                                        key={edge.id}
                                        x1={source.x}
                                        y1={source.y}
                                        x2={target.x}
                                        y2={target.y}
                                        stroke={strokeColor}
                                        strokeWidth={2.6}
                                        opacity={0.9}
                                    />
                                );
                            })}
                            {simNodes.map((node) => {
                                const color = NODE_COLORS[node.node_type] || { fill: "#111827", stroke: "#334155", text: "#e2e8f0" };
                                return (
                                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                        <circle r={NODE_RADIUS} fill={color.fill} stroke={color.stroke} strokeWidth={2} />
                                        <text
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill={color.text}
                                            fontSize={10}
                                            fontWeight={600}
                                        >
                                            {node.label.length > 22 ? `${node.label.slice(0, 22)}…` : node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>
            </div>
            <aside className="w-[28%] border-l border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="p-6 border-b border-white/10">
                    <h4 className="text-lg font-semibold">Timeline</h4>
                    <p className="text-xs text-slate-500 mt-2">
                        Scroll to reveal graph nodes. Nodes appear in chronological order.
                    </p>
                </div>
                <div ref={timelineRef} className="h-[calc(70vh-72px)] overflow-y-auto px-6 py-6 space-y-4">
                    {sortedNodes.map((node, idx) => (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0.35, y: 10 }}
                            animate={{ opacity: idx < visibleCount ? 1 : 0.35, y: 0 }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                            <div className="text-[10px] uppercase tracking-widest text-slate-500">{node.node_type}</div>
                            <div className="text-sm font-semibold text-white">{node.label}</div>
                            <div className="text-[10px] text-slate-500 mt-2">{new Date(node.created_at).toLocaleString()}</div>
                        </motion.div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
