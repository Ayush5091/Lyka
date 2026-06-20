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

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

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

    // If mobile or reduced-motion, use a simple viewport entrance animation
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

      // Keep timeline alive for future beats
      tl.to({}, { duration: 1 }, 0.25);
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
                    <Core className="w-full h-full" />
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

        </div>

        {/* Absolute Core Wrapper for Pinned Scroll Animations */}
        {!(isMobile || reduceMotion) && (
          <div
            ref={coreWrapperRef}
            className="absolute pointer-events-none z-30 flex items-center justify-center transition-all duration-75"
          >
            <Core className="w-full h-full" />
          </div>
        )}

      </div>
    </div>
  );
}
