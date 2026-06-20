"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CoreProps {
  className?: string;
  size?: number;
}

export default function Core({ className, size = 320 }: CoreProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none pointer-events-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Background glow shadow layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-dusk-indigo to-glacier-teal opacity-35 blur-3xl transition-all duration-1000",
          !reduceMotion && "animate-[pulse_4s_cubic-bezier(0.45,0,0.15,1)_infinite]"
        )}
      />

      {/* Main living SVG Orb */}
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "w-full h-full relative z-10 origin-center transition-transform duration-1000",
          !reduceMotion && "animate-[breathe_4s_cubic-bezier(0.45,0,0.15,1)_infinite]"
        )}
      >
        <defs>
          {/* Main radial gradient forming the base color representation */}
          <radialGradient id="core-grad" cx="45%" cy="40%" r="55%" fx="35%" fy="30%">
            <stop offset="0%" stopColor="#8F85FF" />
            <stop offset="35%" stopColor="var(--dusk-indigo)" />
            <stop offset="75%" stopColor="var(--glacier-teal)" />
            <stop offset="100%" stopColor="#0B2B26" />
          </radialGradient>

          {/* Organic displacement map to distort the orb edges */}
          <filter id="organic-deform" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
              seed="1"
            >
              {!reduceMotion && (
                <animate
                  attributeName="seed"
                  from="1"
                  to="100"
                  dur="24s"
                  repeatCount="indefinite"
                />
              )}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={reduceMotion ? "0" : "18"}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* The Core shape */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#core-grad)"
          filter="url(#organic-deform)"
        />
      </svg>
    </div>
  );
}
