"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useOrb } from "@/lib/OrbContext";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ───────────────────────────────────────────────────
   App icon SVG paths (inline, zero runtime overhead)
   ─────────────────────────────────────────────────── */
const appIcons: Record<
  string,
  { color: string; viewBox: string; path: string }
> = {
  slack: {
    color: "#4A154B",
    viewBox: "0 0 24 24",
    path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM9.043 5.043a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52v2.52h-2.52a2.528 2.528 0 0 1-2.522-2.52zm0 1.261a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.997a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.048zM18.958 9.043a2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52a2.528 2.528 0 0 1 2.52-2.52zm-1.261 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.997a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.048zM15.165 18.958a2.528 2.528 0 0 1-2.522 2.522 2.528 2.528 0 0 1-2.52-2.522v-2.52h2.52a2.528 2.528 0 0 1 2.522 2.52zm0-1.261a2.528 2.528 0 0 1-2.522-2.52v-5.048a2.528 2.528 0 0 1 2.52-2.522h5.048a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.048z",
  },
  gmail: {
    color: "#EA4335",
    viewBox: "0 0 24 24",
    path: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  },
  jira: {
    color: "#0052CC",
    viewBox: "0 0 24 24",
    path: "M11.533 1.277a.644.644 0 0 0-.918 0L6.082 5.81a.649.649 0 0 0 0 .918l4.533 4.533a.649.649 0 0 0 .918 0l4.533-4.533a.649.649 0 0 0 0-.918zM6.082 11.533a.649.649 0 0 0 0 .918l4.533 4.533a.649.649 0 0 0 .918 0l4.533-4.533a.649.649 0 0 0 0-.918L11.533 7a.649.649 0 0 0-.918 0zM.631 6.082a.649.649 0 0 0 0 .918l4.533 4.533a.649.649 0 0 0 .918 0l4.533-4.533a.649.649 0 0 0 0-.918L6.082 1.549a.649.649 0 0 0-.918 0z",
  },
  teams: {
    color: "#6264A7",
    viewBox: "0 0 24 24",
    path: "M16.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7.5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm11 .5c-1.5 0-4.5.8-4.5 2.3v1.7h9v-1.7c0-1.5-3-2.3-4.5-2.3zm-11 1c-1.2 0-3.5.6-3.5 1.8v1.2h7v-1.2c0-1.2-2.3-1.8-3.5-1.8z",
  },
  discord: {
    color: "#5865F2",
    viewBox: "0 0 24 24",
    path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z",
  },
};

const APP_ORDER = ["slack", "gmail", "jira", "teams", "discord"] as const;

/* ───────────────────────────────────────────────────
   Participants data
   ─────────────────────────────────────────────────── */
const participants = [
  { name: "John Doe", role: "Product Manager", initials: "JD" },
  { name: "Alice Smith", role: "Lead Designer", initials: "AS" },
  { name: "Sarah Connor", role: "Security Engineer", initials: "SC" },
];

/* ───────────────────────────────────────────────────
   Helper: clamp & remap
   ─────────────────────────────────────────────────── */
function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/* ───────────────────────────────────────────────────
   Mobile / reduced-motion fallback orb
   ─────────────────────────────────────────────────── */
function FallbackOrb({
  color,
  size = 120,
  className,
}: {
  color: "indigo" | "teal" | "coral";
  size?: number;
  className?: string;
}) {
  const gradients = {
    indigo:
      "radial-gradient(circle at 35% 30%, #8F85FF 0%, #463CC2 40%, #0A0B10 85%)",
    teal: "radial-gradient(circle at 35% 30%, #80FFF0 0%, #13897E 40%, #0A0B10 85%)",
    coral:
      "radial-gradient(circle at 35% 30%, #FFA085 0%, #D85A3C 40%, #0A0B10 85%)",
  };
  const shadows = {
    indigo: "0 0 60px 10px rgba(70, 60, 194, 0.35)",
    teal: "0 0 60px 10px rgba(19, 137, 126, 0.35)",
    coral: "0 0 60px 10px rgba(216, 90, 60, 0.35)",
  };
  return (
    <div
      className={cn("rounded-full shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: gradients[color],
        boxShadow: shadows[color],
      }}
    />
  );
}

/* ───────────────────────────────────────────────────
   Main ScrollSequence Component
   ─────────────────────────────────────────────────── */
export default function ScrollSequence() {
  const { setOrbState, orbScreenPos } = useOrb();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Beat element refs
  const panelRef = useRef<HTMLDivElement>(null);
  const chip1Ref = useRef<HTMLDivElement>(null);
  const chip2Ref = useRef<HTMLDivElement>(null);
  const beat2CopyRef = useRef<HTMLDivElement>(null);
  const appRowRef = useRef<HTMLDivElement>(null);
  const connectorSvgRef = useRef<SVGSVGElement>(null);

  // App icon element refs for connector endpoints
  const appIconRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // State
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeApps, setActiveApps] = useState<Record<string, boolean>>({});

  // Client-side checks
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Determine anchor and color from progress
  const updateOrbFromProgress = useCallback(
    (p: number) => {
      setProgress(p);

      if (p < 0.30) {
        // Beat 1: joins — lerp hero → beat1-join
        const t = remap(p, 0, 0.30, 0, 1);
        if (t < 0.5) {
          setOrbState("hero", 0);
        } else {
          setOrbState("beat1-join", 0);
        }
      } else if (p < 0.65) {
        // Beat 2: listens — lerp beat1-join → beat2-listen
        const t = remap(p, 0.30, 0.65, 0, 1);
        if (t < 0.3) {
          setOrbState("beat1-join", 0);
        } else {
          setOrbState("beat2-listen", t < 0.5 ? 0 : 1);
        }
      } else {
        // Beat 3: delivers — lerp beat2-listen → beat3-deliver
        const t = remap(p, 0.65, 1.0, 0, 1);
        if (t < 0.3) {
          setOrbState("beat2-listen", 1);
        } else {
          setOrbState("beat3-deliver", t < 0.5 ? 1 : 2);
        }
      }
    },
    [setOrbState]
  );

  // GSAP ScrollTrigger (desktop pinned)
  useEffect(() => {
    if (!mounted || isMobile || reduceMotion) return;
    if (!containerRef.current || !stickyRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: stickyRef.current,
        scrub: true,
        onUpdate: (self) => {
          updateOrbFromProgress(self.progress);
        },
      });
    });

    return () => ctx.revert();
  }, [mounted, isMobile, reduceMotion, updateOrbFromProgress]);

  // Update active apps when progress > 0.85
  useEffect(() => {
    if (progress > 0.85) {
      const t = remap(progress, 0.85, 1.0, 0, 1);
      const newActive: Record<string, boolean> = {};
      APP_ORDER.forEach((id, i) => {
        newActive[id] = t > i * 0.18;
      });
      setActiveApps(newActive);
    } else {
      setActiveApps({});
    }
  }, [progress]);

  // ── Compute connector paths ──
  const connectorPaths = useCallback(() => {
    if (progress < 0.70 || !connectorSvgRef.current) return [];
    const paths: { id: string; d: string; opacity: number }[] = [];
    const drawProgress = remap(progress, 0.70, 0.95, 0, 1);

    APP_ORDER.forEach((id, i) => {
      const el = appIconRefs.current[id];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const endX = rect.left + rect.width / 2;
      const endY = rect.top + rect.height / 2;
      const startX = orbScreenPos.x;
      const startY = orbScreenPos.y;

      const itemProgress = remap(drawProgress, i * 0.15, i * 0.15 + 0.4, 0, 1);
      if (itemProgress <= 0) return;

      // Curved bezier
      const controlX =
        (startX + endX) / 2 + (startY - endY) * 0.12;
      const controlY =
        (startY + endY) / 2 - (startX - endX) * 0.12;

      paths.push({
        id,
        d: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
        opacity: Math.min(itemProgress, 0.5),
      });
    });
    return paths;
  }, [progress, orbScreenPos]);

  // ── Derived opacity/style values from progress ──
  const panelOpacity =
    progress < 0.30
      ? remap(progress, 0.05, 0.25, 0, 1)
      : progress < 0.65
        ? remap(progress, 0.30, 0.50, 1, 0.4)
        : 0.4;

  const panelScale =
    progress < 0.30
      ? 1
      : progress < 0.65
        ? remap(progress, 0.30, 0.50, 1, 0.92)
        : 0.92;

  const chipOpacity = (chipStart: number) => {
    if (progress < chipStart) return 0;
    if (progress < chipStart + 0.08) return remap(progress, chipStart, chipStart + 0.08, 0, 1);
    if (progress < 0.55) return remap(progress, chipStart + 0.08, 0.55, 1, 0);
    return 0;
  };

  const beat2CopyOpacity = (() => {
    if (progress < 0.40) return 0;
    if (progress < 0.50) return remap(progress, 0.40, 0.50, 0, 1);
    if (progress < 0.63) return remap(progress, 0.50, 0.63, 1, 0);
    return 0;
  })();

  const appRowOpacity =
    progress < 0.65
      ? 0.15
      : remap(progress, 0.65, 0.80, 0.15, 1);

  const appRowGrayscale =
    progress < 0.65
      ? 1
      : remap(progress, 0.65, 0.80, 1, 0);

  // ═══════════════════════════════════════════════
  //  MOBILE / REDUCED MOTION FALLBACK
  // ═══════════════════════════════════════════════
  if (mounted && (isMobile || reduceMotion)) {
    return (
      <section className="relative bg-void w-full py-16 px-6 md:px-12" id="how-it-works">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-16">

          {/* Header */}
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
              The Attentive Listener
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-2 text-moon">
              Attending as a presence
            </h2>
          </div>

          {/* Beat 1: Meeting panel */}
          <div className="w-full">
            <MeetingPanel showOrb />
          </div>

          {/* Beat 2: Context recall */}
          <div className="flex flex-col items-center space-y-6 w-full">
            <FallbackOrb color="teal" size={100} />
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="font-mono text-xs bg-slate/90 border border-white/10 px-3 py-1.5 rounded-full text-glacier-teal">
                Q3 roadmap — May 12
              </span>
              <span className="font-mono text-xs bg-slate/90 border border-white/10 px-3 py-1.5 rounded-full text-glacier-teal">
                Client sync — last Tuesday
              </span>
            </div>
            <p className="font-body text-base text-moon/85 text-center max-w-xl leading-relaxed">
              Lyka already knows what was discussed. It flags when an agenda
              is drifting — or when a meeting could have been an email.
            </p>
          </div>

          {/* Beat 3: Delivery */}
          <div className="flex flex-col items-center space-y-6 w-full border-t border-white/5 pt-8">
            <FallbackOrb color="coral" size={100} />
            <div className="flex justify-center items-center gap-6 flex-wrap">
              {APP_ORDER.map((id) => {
                const icon = appIcons[id];
                return (
                  <div
                    key={id}
                    className="w-12 h-12 rounded-xl bg-slate/85 border border-white/5 flex items-center justify-center"
                    style={{ color: icon.color }}
                  >
                    <svg
                      viewBox={icon.viewBox}
                      className="w-6 h-6"
                      fill="currentColor"
                    >
                      <path d={icon.path} />
                    </svg>
                  </div>
                );
              })}
            </div>
            <p className="font-body text-sm text-moon/50 text-center max-w-md">
              Delivering highlights, decisions, and action items instantly
              across your workspace tools.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // SSR skeleton
  if (!mounted) {
    return (
      <div className="relative bg-void w-full h-[400vh]" id="how-it-works">
        <div className="w-full flex flex-col justify-center items-center overflow-hidden sticky top-0 h-screen">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-center">
            <div className="text-center mb-10">
              <span className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
                The Attentive Listener
              </span>
              <h2 className="font-display text-4xl md:text-5xl mt-2 text-moon">
                Attending as a presence
              </h2>
            </div>
            <MeetingPanel />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  //  DESKTOP PINNED SCROLL SEQUENCE
  // ═══════════════════════════════════════════════
  const paths = connectorPaths();

  return (
    <div
      ref={containerRef}
      className="relative bg-void w-full h-[400vh]"
      id="how-it-works"
    >
      <div
        ref={stickyRef}
        className="w-full h-screen flex flex-col justify-start items-center overflow-hidden pt-20"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-center relative flex-1">

          {/* ── Eyebrow + Heading (rendered ONCE) ── */}
          <div className="text-center mb-8 shrink-0">
            <span className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
              The Attentive Listener
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-2 text-moon">
              Attending as a presence
            </h2>
          </div>

          {/* ── Meeting Panel ── */}
          <div
            ref={panelRef}
            className="w-full max-w-4xl shrink-0 transition-none"
            style={{
              opacity: panelOpacity,
              transform: `scale(${panelScale})`,
              transformOrigin: "top center",
            }}
          >
            <MeetingPanel />
          </div>

          {/* ── Reserved Middle Zone (beat2-listen anchor + chips + copy) ── */}
          <div className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[200px]">

            {/* Beat 2 anchor */}
            <div
              data-orb-anchor="beat2-listen"
              className="absolute top-1/3 left-1/2 -translate-x-1/2"
              style={{ width: 0, height: 0 }}
              aria-hidden="true"
            />

            {/* RAG Chips */}
            <div
              ref={chip1Ref}
              className="absolute font-mono text-[11px] bg-slate/90 border border-white/10 px-4 py-2 rounded-full text-moon/80 pointer-events-none z-20 shadow-xl backdrop-blur-sm whitespace-nowrap"
              style={{
                opacity: chipOpacity(0.32),
                top: "25%",
                left: "15%",
                transform: `translateX(${remap(progress, 0.32, 0.55, 0, 30)}px)`,
              }}
            >
              Q3 roadmap — May 12
            </div>
            <div
              ref={chip2Ref}
              className="absolute font-mono text-[11px] bg-slate/90 border border-white/10 px-4 py-2 rounded-full text-moon/80 pointer-events-none z-20 shadow-xl backdrop-blur-sm whitespace-nowrap"
              style={{
                opacity: chipOpacity(0.36),
                top: "40%",
                right: "15%",
                transform: `translateX(${remap(progress, 0.36, 0.55, 0, -30)}px)`,
              }}
            >
              Client sync — last Tuesday
            </div>

            {/* Beat 2 supporting line */}
            <div
              ref={beat2CopyRef}
              className="absolute bottom-[20%] left-0 right-0 text-center font-body text-lg md:text-xl text-moon/85 px-6 leading-relaxed pointer-events-none"
              style={{ opacity: beat2CopyOpacity }}
            >
              Lyka already knows what was discussed. It flags when an agenda
              is drifting — or when a meeting could have been an email.
            </div>
          </div>

          {/* ── App Mark Row (beat 3) ── */}
          <div
            ref={appRowRef}
            className="w-full max-w-2xl shrink-0 mb-12 relative"
            style={{
              opacity: appRowOpacity,
              filter: `grayscale(${appRowGrayscale})`,
              zIndex: 31,
            }}
          >
            {/* beat3-deliver anchor centered above the row */}
            <div
              data-orb-anchor="beat3-deliver"
              className="absolute -top-16 left-1/2 -translate-x-1/2"
              style={{ width: 0, height: 0 }}
              aria-hidden="true"
            />

            <div className="flex justify-center items-center gap-8 md:gap-12">
              {APP_ORDER.map((id) => {
                const icon = appIcons[id];
                const active = activeApps[id];
                return (
                  <div
                    key={id}
                    ref={(el) => {
                      appIconRefs.current[id] = el;
                    }}
                    role="img"
                    aria-label={`${id} integration`}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-500 shadow-lg relative",
                      active
                        ? "bg-slate/90 border border-white/10 scale-110"
                        : "bg-slate/30 border border-white/5"
                    )}
                    style={{
                      color: active ? icon.color : "var(--moon)",
                    }}
                  >
                    <svg
                      viewBox={icon.viewBox}
                      className="w-6 h-6"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={icon.path} />
                    </svg>

                    {/* Per-icon reactions */}
                    {id === "slack" && active && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#4A154B] text-[#EDEBE6] text-[8px] px-2 py-0.5 rounded font-mono font-medium whitespace-nowrap animate-bounce shadow">
                        New Highlight!
                      </div>
                    )}
                    {id === "gmail" && active && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center text-void text-[9px] font-bold shadow animate-[scale-up_0.3s_ease-out]">
                        ✓
                      </div>
                    )}
                    {id === "jira" && active && (
                      <div className="absolute -right-14 top-1/2 -translate-y-1/2 bg-slate border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-moon shadow whitespace-nowrap animate-[slide-in_0.4s_ease-out]">
                        LYK-92
                      </div>
                    )}
                    {id === "teams" && active && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center text-void text-[9px] font-bold shadow animate-[scale-up_0.3s_ease-out]">
                        ✓
                      </div>
                    )}
                    {id === "discord" && active && (
                      <div className="absolute inset-0 border border-[#5865F2] rounded-xl scale-150 opacity-0 animate-[ping-pulse_0.6s_ease-out]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Connector SVG overlay (beat 3) ── */}
        {paths.length > 0 && (
          <svg
            ref={connectorSvgRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 31 }}
          >
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill="none"
                stroke="var(--ember-coral)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                style={{ opacity: p.opacity }}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────
   MeetingPanel sub-component (rendered once)
   ─────────────────────────────────────────────────── */
function MeetingPanel({ showOrb }: { showOrb?: boolean }) {
  return (
    <div className="w-full bg-slate/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-body text-sm font-medium text-moon">
            Q3 Strategy Alignment
          </span>
        </div>
        <div className="font-mono text-xs text-moon/40">
          10:00 AM - 11:00 AM
        </div>
      </div>

      {/* Participant grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[160px] md:min-h-[220px]">
        {participants.map((person, idx) => (
          <div
            key={idx}
            className="bg-slate/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between items-center text-center relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-full bg-moon/10 border border-white/10 flex items-center justify-center font-mono text-moon text-sm font-semibold">
              {person.initials}
            </div>
            <div className="mt-4">
              <div className="font-body text-sm font-medium text-moon">
                {person.name}
              </div>
              <div className="font-mono text-[10px] text-moon/40 mt-1">
                {person.role}
              </div>
            </div>
          </div>
        ))}

        {/* Lyka placeholder cell — beat1-join anchor lives here */}
        <div className="border border-white/5 border-dashed bg-void/30 rounded-xl p-4 flex flex-col justify-between items-center text-center relative min-h-[160px]">
          <div
            data-orb-anchor="beat1-join"
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            style={{ width: "100%", height: "100%" }}
          />
          {showOrb && (
            <div className="flex-1 flex items-center justify-center">
              <FallbackOrb color="indigo" size={80} />
            </div>
          )}
          <div className="mt-auto">
            <div className="font-body text-sm font-medium text-moon/60">
              Lyka
            </div>
            <div className="font-mono text-[10px] text-dusk-indigo mt-1">
              listening...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
