"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Core from "./Core";
import { cn } from "@/lib/utils";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

// Brand SVG Path Data (Authentic paths)
const appIcons = {
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

// Offsets to arrange the 5 integration points in an arc around the Core cell
const appPositions = [
  { id: "slack", xOffset: -220, yOffset: -120 },
  { id: "gmail", xOffset: 220, yOffset: -120 },
  { id: "jira", xOffset: -260, yOffset: 60 },
  { id: "teams", xOffset: 260, yOffset: 60 },
  { id: "discord", xOffset: 0, yOffset: 160 },
];

export default function ScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const coreWrapperRef = useRef<HTMLDivElement>(null);
  
  // Refs for Beat 2 elements
  const chip1Ref = useRef<HTMLDivElement>(null);
  const chip2Ref = useRef<HTMLDivElement>(null);
  const beat2CopyRef = useRef<HTMLDivElement>(null);

  // SVG vectors and particle elements for Beat 3
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const particleRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const appContainerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Core visual state (animated by GSAP)
  const [tealOpacity, setTealOpacity] = useState(0);
  const [pulseOpacity, setPulseOpacity] = useState(0);
  const [coralOpacity, setCoralOpacity] = useState(0);

  // Tracks active/reaction state of integration marks
  const [activeApps, setActiveApps] = useState<Record<string, boolean>>({});

  // Handle client-side mount & media queries to prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);

    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);

    checkViewport();
    window.addEventListener("resize", checkViewport);

    const reducedMotionHandler = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    mediaQuery.addEventListener("change", reducedMotionHandler);

    return () => {
      window.removeEventListener("resize", checkViewport);
      mediaQuery.removeEventListener("change", reducedMotionHandler);
    };
  }, []);

  // Update target coordinates of the placeholder tile
  useEffect(() => {
    if (!mounted || isMobile || reduceMotion) return;

    const updateCoords = () => {
      if (placeholderRef.current && stickyRef.current) {
        const pRect = placeholderRef.current.getBoundingClientRect();
        const sRect = stickyRef.current.getBoundingClientRect();
        setTargetRect({
          top: pRect.top - sRect.top,
          left: pRect.left - sRect.left,
          width: pRect.width,
          height: pRect.height,
        });
      }
    };

    const timer = setTimeout(updateCoords, 100);
    window.addEventListener("resize", updateCoords);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateCoords);
    };
  }, [mounted, isMobile, reduceMotion]);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!mounted) return;

    // Mobile / Reduced Motion: Simple viewport entrance animation
    if (isMobile || reduceMotion) {
      if (coreWrapperRef.current) {
        gsap.fromTo(
          coreWrapperRef.current,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
      return;
    }

    if (!containerRef.current || !stickyRef.current || !coreWrapperRef.current || targetRect.width === 0) {
      return;
    }

    // Set initial position of absolute Core wrapper in the center of the screen
    gsap.set(coreWrapperRef.current, {
      xPercent: -50,
      yPercent: -50,
      left: "50%",
      top: "50%",
      width: 240,
      height: 240,
    });

    const ctx = gsap.context(() => {
      const coreState = { teal: 0, pulse: 0, coral: 0 };

      // Pinned timeline spanning 300vh
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Beat 1: Core slides from center of the screen to the target cell (0% to 25% of timeline)
      tl.to(coreWrapperRef.current, {
        left: targetRect.left,
        top: targetRect.top,
        xPercent: 0,
        yPercent: 0,
        width: targetRect.width,
        height: targetRect.height,
        ease: "power1.inOut",
      }, 0);

      // Beat 2: Recalling context / RAG (25% to 60% of timeline)
      tl.to(coreState, {
        teal: 1,
        pulse: 1,
        onUpdate: () => {
          setTealOpacity(coreState.teal);
          setPulseOpacity(coreState.pulse);
        },
        duration: 0.20,
      }, 0.25);

      tl.to(coreState, {
        pulse: 0,
        onUpdate: () => {
          setPulseOpacity(coreState.pulse);
        },
        duration: 0.10,
      }, 0.50);

      const coreCenterX = targetRect.left + targetRect.width / 2;
      const coreCenterY = targetRect.top + targetRect.height / 2;

      // Chip 1 animation (drift to core)
      tl.fromTo(chip1Ref.current, {
        left: "15%",
        top: "35%",
        opacity: 0,
        scale: 1.1,
      }, {
        left: coreCenterX - 80,
        top: coreCenterY - 10,
        opacity: 1,
        scale: 0.85,
        duration: 0.15,
        ease: "power1.in",
      }, 0.25);

      tl.to(chip1Ref.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.05,
      }, 0.40);

      // Chip 2 animation (drift to core)
      tl.fromTo(chip2Ref.current, {
        left: "75%",
        top: "60%",
        opacity: 0,
        scale: 1.1,
      }, {
        left: coreCenterX - 80,
        top: coreCenterY - 10,
        opacity: 1,
        scale: 0.85,
        duration: 0.15,
        ease: "power1.in",
      }, 0.35);

      tl.to(chip2Ref.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.05,
      }, 0.50);

      // Beat 2 narrative copy
      tl.fromTo(beat2CopyRef.current, {
        opacity: 0,
        y: 20,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.13,
        ease: "power2.out",
      }, 0.35);

      tl.to(beat2CopyRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.08,
        ease: "power2.in",
      }, 0.52);

      // Beat 3: Synthesis & Distribution (60% to 100% of timeline)
      
      // Core shifts to coral gradient (starts 60%, completes by 75%)
      tl.to(coreState, {
        coral: 1,
        onUpdate: () => {
          setCoralOpacity(coreState.coral);
        },
        duration: 0.15,
      }, 0.60);

      // Draw vectors and shoot particles out to integration icons sequentially
      appPositions.forEach((app, index) => {
        const startPoint = 0.70 + index * 0.05; // 0.70, 0.75, 0.80, 0.85, 0.90
        const duration = 0.04;

        const pathElement = pathRefs.current[app.id];
        const particleElement = particleRefs.current[app.id];

        if (pathElement && particleElement) {
          // Initialize path drawing
          tl.fromTo(pathElement, 
            { strokeDashoffset: 1000, opacity: 0.1 },
            { strokeDashoffset: 0, opacity: 0.5, duration: duration, ease: "none" },
            startPoint
          );

          // Animate particle along vector path
          tl.fromTo(particleElement,
            { opacity: 0 },
            {
              opacity: 1,
              motionPath: {
                path: pathElement,
                align: pathElement,
                alignOrigin: [0.5, 0.5],
              },
              duration: duration,
              ease: "none"
            },
            startPoint
          );

          // Turn off particle and trigger reactive callback upon arrival
          tl.set(particleElement, { opacity: 0 }, startPoint + duration);
          tl.call(() => {
            setActiveApps(prev => ({ ...prev, [app.id]: true }));
          }, undefined, startPoint + duration);
        }
      });

      // Hold the final synthesis screen with all integrations active at 100% (95% to 100%)
      tl.to({}, { duration: 0.05 }, 0.95);
    });

    return () => {
      ctx.revert();
    };
  }, [mounted, isMobile, reduceMotion, targetRect]);

  const participants = [
    { name: "John Doe", role: "Product Manager", initials: "JD" },
    { name: "Alice Smith", role: "Lead Designer", initials: "AS" },
    { name: "Sarah Connor", role: "Security Engineer", initials: "SC" },
  ];

  // Generates curved vector paths from the Core center to each integration icon
  const getVectorPath = (app: typeof appPositions[0]) => {
    const startX = targetRect.left + targetRect.width / 2;
    const startY = targetRect.top + targetRect.height / 2;
    const endX = startX + app.xOffset;
    const endY = startY + app.yOffset;

    // Beautiful arc bezier control point offsets
    const controlX = (startX + endX) / 2 + (startY - endY) * 0.15;
    const controlY = (startY + endY) / 2 - (startX - endX) * 0.15;

    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  };

  // Render a clean static skeleton for SSR/Hydration matching
  if (!mounted) {
    return (
      <div className="relative bg-void w-full h-[300vh]" id="how-it-works">
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
            <div className="w-full max-w-4xl bg-slate/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-50" />
                  <span className="font-body text-sm font-medium text-moon">
                    Q3 Strategy Alignment
                  </span>
                </div>
                <div className="font-mono text-xs text-moon/40">10:00 AM - 11:00 AM</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[160px] md:min-h-[220px]">
                {participants.map((person, idx) => (
                  <div key={idx} className="bg-slate/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-moon/10 border border-white/10 flex items-center justify-center font-mono text-moon text-sm font-semibold">
                      {person.initials}
                    </div>
                    <div className="font-body text-sm font-medium text-moon mt-4">{person.name}</div>
                  </div>
                ))}
                <div className="border border-white/5 border-dashed bg-void/30 rounded-xl p-4 flex flex-col justify-between items-center text-center relative min-h-[160px]">
                  <div className="mt-auto">
                    <div className="font-body text-sm font-medium text-moon/60">Lyka</div>
                    <div className="font-mono text-[10px] text-dusk-indigo mt-1">connecting...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-void w-full",
        isMobile || reduceMotion ? "min-h-screen py-16" : "h-[300vh]"
      )}
      id="how-it-works"
    >
      <div
        ref={stickyRef}
        className={cn(
          "w-full flex flex-col justify-center items-center overflow-hidden",
          isMobile || reduceMotion ? "relative" : "sticky top-0 h-screen"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-center">
          
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
              The Attentive Listener
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-2 text-moon">
              Attending as a presence
            </h2>
          </div>

          <div className="w-full max-w-4xl bg-slate/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col space-y-6">
            
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[160px] md:min-h-[220px]">
              
              {participants.map((person, idx) => (
                <div
                  key={idx}
                  className="bg-slate/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between items-center text-center relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-full bg-moon/10 border border-white/10 flex items-center justify-center font-mono text-moon text-sm font-semibold">
                    {person.initials}
                  </div>
                  <div>
                    <div className="font-body text-sm font-medium text-moon mt-4">
                      {person.name}
                    </div>
                    <div className="font-mono text-[10px] text-moon/40 mt-1">
                      {person.role}
                    </div>
                  </div>
                </div>
              ))}

              <div
                ref={placeholderRef}
                className="border border-white/5 border-dashed bg-void/30 rounded-xl p-4 flex flex-col justify-between items-center text-center relative min-h-[160px]"
              >
                {(isMobile || reduceMotion) && (
                  <div ref={coreWrapperRef} className="w-24 h-24 flex items-center justify-center">
                    <Core
                      className="w-full h-full"
                      tealOpacity={tealOpacity}
                      pulseOpacity={pulseOpacity}
                      coralOpacity={coralOpacity}
                    />
                  </div>
                )}
                
                <div className="mt-auto">
                  <div className="font-body text-sm font-medium text-moon/60">
                    {(isMobile || reduceMotion) ? "Lyka (Active)" : "Lyka"}
                  </div>
                  <div className="font-mono text-[10px] text-dusk-indigo mt-1">
                    {coralOpacity > 0.8 ? "synthesizing..." : "listening..."}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Mobile/Reduced Motion sequential content */}
          {(isMobile || reduceMotion) && (
            <div className="w-full max-w-4xl px-4 mt-12 flex flex-col items-center space-y-12">
              
              {/* Beat 2 mobile info */}
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="flex flex-wrap gap-3 justify-center">
                  <span className="font-mono text-xs bg-slate/90 border border-white/10 px-3 py-1.5 rounded-full text-glacier-teal">
                    Q3 roadmap — May 12
                  </span>
                  <span className="font-mono text-xs bg-slate/90 border border-white/10 px-3 py-1.5 rounded-full text-glacier-teal">
                    Client sync — last Tuesday
                  </span>
                </div>
                <p className="font-body text-base text-moon/85 text-center max-w-xl leading-relaxed">
                  Lyka already knows what was discussed. It flags when an agenda is drifting — or when a meeting could have been an email.
                </p>
              </div>

              {/* Beat 3 mobile integrations */}
              <div className="flex flex-col items-center space-y-6 w-full border-t border-white/5 pt-8">
                <h3 className="font-display text-xl text-moon">Instant Distribution</h3>
                <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
                  {Object.entries(appIcons).map(([id, app]) => (
                    <div
                      key={id}
                      className="w-12 h-12 rounded-xl bg-slate/85 border border-white/5 flex items-center justify-center transition-all duration-300"
                      style={{ color: app.color }}
                    >
                      <svg viewBox={app.viewBox} className="w-6 h-6" fill="currentColor">
                        <path d={app.path} />
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="font-body text-sm text-moon/50 text-center max-w-md">
                  Delivering highlights, decisions, and action items instantly across your workspace tools.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Absolute Core Wrapper for Pinned Scroll Animations */}
        {!(isMobile || reduceMotion) && (
          <div
            ref={coreWrapperRef}
            className="absolute pointer-events-none z-30 flex items-center justify-center transition-all duration-75"
          >
            <Core
              className="w-full h-full"
              tealOpacity={tealOpacity}
              pulseOpacity={pulseOpacity}
              coralOpacity={coralOpacity}
            />
          </div>
        )}

        {/* Beat 2 Floating Chips (Desktop Pinned) */}
        {!(isMobile || reduceMotion) && (
          <>
            <div
              ref={chip1Ref}
              className="absolute font-mono text-[11px] bg-slate/90 border border-white/10 px-4 py-2 rounded-full text-moon/80 opacity-0 pointer-events-none z-20 shadow-xl backdrop-blur-sm"
            >
              Q3 roadmap — May 12
            </div>
            <div
              ref={chip2Ref}
              className="absolute font-mono text-[11px] bg-slate/90 border border-white/10 px-4 py-2 rounded-full text-moon/80 opacity-0 pointer-events-none z-20 shadow-xl backdrop-blur-sm"
            >
              Client sync — last Tuesday
            </div>
          </>
        )}

        {/* Beat 2 Narrative Copy (Desktop Pinned) */}
        {!(isMobile || reduceMotion) && (
          <div
            ref={beat2CopyRef}
            className="absolute bottom-16 md:bottom-20 max-w-2xl text-center font-body text-lg md:text-xl text-moon/85 opacity-0 px-6 leading-relaxed pointer-events-none"
          >
            Lyka already knows what was discussed. It flags when an agenda is drifting — or when a meeting could have been an email.
          </div>
        )}

        {/* Beat 3 Connecting Vectors (Desktop SVG Overlay) */}
        {!(isMobile || reduceMotion) && targetRect.width > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
            <defs>
              <filter id="glow-particle" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {appPositions.map((app) => (
              <g key={app.id}>
                {/* SVG path connecting Core to app */}
                <path
                  ref={(el) => {
                    pathRefs.current[app.id] = el;
                  }}
                  d={getVectorPath(app)}
                  fill="none"
                  stroke="var(--ember-coral)"
                  strokeWidth="1.5"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  className="opacity-0 transition-opacity duration-300"
                />

                {/* Flying glowing particle */}
                <circle
                  ref={(el) => {
                    particleRefs.current[app.id] = el;
                  }}
                  r="5"
                  fill="var(--ember-coral)"
                  filter="url(#glow-particle)"
                  className="opacity-0"
                />
              </g>
            ))}
          </svg>
        )}

        {/* Beat 3 Pinned Integration Marks (Desktop) */}
        {!(isMobile || reduceMotion) && targetRect.width > 0 && (
          <div ref={appContainerRef} className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {appPositions.map((app) => {
              const startX = targetRect.left + targetRect.width / 2;
              const startY = targetRect.top + targetRect.height / 2;
              const absoluteLeft = startX + app.xOffset - 24; // offset by half icon size
              const absoluteTop = startY + app.yOffset - 24;

              const active = activeApps[app.id];
              const iconData = appIcons[app.id as keyof typeof appIcons];

              return (
                <div
                  key={app.id}
                  role="img"
                  aria-label={`${app.id} integration`}
                  className={cn(
                    "absolute w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-500 shadow-xl",
                    active
                      ? "bg-slate/90 border border-white/10 scale-110 grayscale-0 opacity-100"
                      : "bg-slate/30 border border-white/5 grayscale opacity-20"
                  )}
                  style={{
                    left: absoluteLeft,
                    top: absoluteTop,
                    color: active ? iconData.color : "var(--moon)",
                  }}
                >
                  <svg viewBox={iconData.viewBox} className="w-6 h-6" fill="currentColor" aria-hidden="true">
                    <path d={iconData.path} />
                  </svg>

                  {/* Slack message pop reaction */}
                  {app.id === "slack" && active && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#4A154B] text-[#EDEBE6] text-[8px] px-2 py-0.5 rounded font-mono font-medium whitespace-nowrap animate-bounce shadow">
                      New Highlight!
                    </div>
                  )}

                  {/* Gmail envelope checkmark reaction */}
                  {app.id === "gmail" && active && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center text-void text-[9px] font-bold shadow animate-[scale-up_0.3s_ease-out]">
                      ✓
                    </div>
                  )}

                  {/* Jira ticket slide-in reaction */}
                  {app.id === "jira" && active && (
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2 bg-slate border border-white/10 rounded px-1.5 py-0.5 text-[8px] font-mono text-moon shadow whitespace-nowrap animate-[slide-in_0.4s_ease-out]">
                      LYK-92
                    </div>
                  )}

                  {/* Teams checkmark reaction */}
                  {app.id === "teams" && active && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center text-void text-[9px] font-bold shadow animate-[scale-up_0.3s_ease-out]">
                      ✓
                    </div>
                  )}

                  {/* Discord ping pulse reaction */}
                  {app.id === "discord" && active && (
                    <div className="absolute inset-0 border border-[#5865F2] rounded-xl scale-150 opacity-0 animate-[ping-pulse_0.6s_ease-out]" />
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
