"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Core from "./Core";
import { cn } from "@/lib/utils";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const coreWrapperRef = useRef<HTMLDivElement>(null);
  
  // Refs for Beat 2 elements
  const chip1Ref = useRef<HTMLDivElement>(null);
  const chip2Ref = useRef<HTMLDivElement>(null);
  const beat2CopyRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Core visual state (animated by GSAP)
  const [tealOpacity, setTealOpacity] = useState(0);
  const [pulseOpacity, setPulseOpacity] = useState(0);

  // Handle client-side mount & media queries to prevent SSR hydration duplication/mismatch
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

    // Mobile / Reduced Motion: Simple viewport entry animation
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
      // Core animation values object for GSAP to animate state variables
      const coreState = { teal: 0, pulse: 0 };

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
      
      // Core color transition: dusk-indigo to glacier-teal (starts 25%, fully teal by 45%)
      tl.to(coreState, {
        teal: 1,
        pulse: 1,
        onUpdate: () => {
          setTealOpacity(coreState.teal);
          setPulseOpacity(coreState.pulse);
        },
        duration: 0.20,
      }, 0.25);

      // Core listening inward lines fade out (50% to 60%)
      tl.to(coreState, {
        pulse: 0,
        onUpdate: () => {
          setPulseOpacity(coreState.pulse);
        },
        duration: 0.10,
      }, 0.50);

      // Chip 1 animation: drift from left outer point, scale down, and fade out into the Core (25% to 42%)
      const coreCenterX = targetRect.left + targetRect.width / 2;
      const coreCenterY = targetRect.top + targetRect.height / 2;

      tl.fromTo(chip1Ref.current, {
        left: "15%",
        top: "35%",
        opacity: 0,
        scale: 1.1,
      }, {
        left: coreCenterX - 80, // Offset slightly to absorb organically
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

      // Chip 2 animation: drift from right outer point, scale down, and fade out into the Core (35% to 52%)
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

      // Beat 2 Narrative Copy: fade in (35% to 48%) and fade out (52% to 60%)
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

      // Keep timeline alive for future beats
      tl.to({}, { duration: 1 }, 0.60);
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
                    <Core className="w-full h-full" tealOpacity={1} pulseOpacity={1} />
                  </div>
                )}
                
                <div className="mt-auto">
                  <div className="font-body text-sm font-medium text-moon/60">
                    {(isMobile || reduceMotion) ? "Lyka (Active)" : "Lyka"}
                  </div>
                  <div className="font-mono text-[10px] text-dusk-indigo mt-1">
                    listening...
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Mobile/Reduced Motion sequential content */}
          {(isMobile || reduceMotion) && (
            <div className="w-full max-w-4xl px-4 mt-12 flex flex-col items-center space-y-6">
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

      </div>
    </div>
  );
}
