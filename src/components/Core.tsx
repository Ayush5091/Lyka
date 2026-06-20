"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CoreProps {
  className?: string;
  size?: number;
  tealOpacity?: number;  // Beat 2: glacier-teal context state
  pulseOpacity?: number; // Beat 2: inward pulsing lines
  coralOpacity?: number; // Beat 3: ember-coral synthesis state
}

export default function Core({
  className,
  size = 320,
  tealOpacity = 0,
  pulseOpacity = 0,
  coralOpacity = 0,
}: CoreProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isAnimatingEntrance, setIsAnimatingEntrance] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setIsAnimatingEntrance(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsAnimatingEntrance(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const hasCustomSize = className?.split(" ").some(c => c.startsWith("w-") || c.startsWith("h-") || c.startsWith("lg:w-") || c.startsWith("xl:w-") || c.startsWith("sm:w-") || c.startsWith("md:w-"));

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none pointer-events-none",
        className
      )}
      style={hasCustomSize ? undefined : { width: size, height: size }}
    >
      {/* Background glow shadow layer (Dusk Indigo / default) */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-r from-dusk-indigo to-glacier-teal opacity-35 blur-3xl transition-all duration-1000",
          !reduceMotion && !isAnimatingEntrance && "animate-[pulse_4s_cubic-bezier(0.45,0,0.15,1)_infinite]",
          !reduceMotion && isAnimatingEntrance && "scale-0 opacity-0 animate-[core-entrance_1.5s_cubic-bezier(0.45,0,0.15,1)_forwards]"
        )}
      />

      {/* Layered Glacier Teal background glow for Beat 2 */}
      <div
        className="absolute inset-0 rounded-full bg-glacier-teal blur-3xl transition-opacity duration-300"
        style={{ opacity: tealOpacity * 0.4 }}
      />

      {/* Layered Ember Coral background glow for Beat 3 */}
      <div
        className="absolute inset-0 rounded-full bg-ember-coral blur-3xl transition-opacity duration-300"
        style={{ opacity: coralOpacity * 0.4 }}
      />

      {/* Main living SVG Orb */}
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "w-full h-full relative z-10 origin-center transition-transform duration-1000",
          !reduceMotion && isAnimatingEntrance && "animate-[core-entrance_1.5s_cubic-bezier(0.45,0,0.15,1)_forwards]",
          !reduceMotion && !isAnimatingEntrance && "animate-[breathe_4s_cubic-bezier(0.45,0,0.15,1)_infinite]"
        )}
      >
        <defs>
          {/* Default radial gradient (dusk-indigo state) */}
          <radialGradient id="core-indigo" cx="45%" cy="40%" r="55%" fx="35%" fy="30%">
            <stop offset="0%" stopColor="#8F85FF" />
            <stop offset="35%" stopColor="var(--dusk-indigo)" />
            <stop offset="75%" stopColor="#2D1BA3" />
            <stop offset="100%" stopColor="#0A0B10" />
          </radialGradient>

          {/* Teal radial gradient (glacier-teal state) */}
          <radialGradient id="core-teal" cx="45%" cy="40%" r="55%" fx="35%" fy="30%">
            <stop offset="0%" stopColor="#80FFF0" />
            <stop offset="35%" stopColor="var(--glacier-teal)" />
            <stop offset="75%" stopColor="#0B5C52" />
            <stop offset="100%" stopColor="#0A0B10" />
          </radialGradient>

          {/* Coral radial gradient (ember-coral state) */}
          <radialGradient id="core-coral" cx="45%" cy="40%" r="55%" fx="35%" fy="30%">
            <stop offset="0%" stopColor="#FFA085" />
            <stop offset="35%" stopColor="var(--ember-coral)" />
            <stop offset="75%" stopColor="#96280E" />
            <stop offset="100%" stopColor="#0A0B10" />
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

        {/* Base Layer: Dusk Indigo */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#core-indigo)"
          filter="url(#organic-deform)"
        />

        {/* Transition Overlay Layer 1: Glacier Teal */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#core-teal)"
          filter="url(#organic-deform)"
          style={{ opacity: Math.max(0, tealOpacity - coralOpacity) }}
          className="transition-opacity duration-75"
        />

        {/* Transition Overlay Layer 2: Ember Coral */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#core-coral)"
          filter="url(#organic-deform)"
          style={{ opacity: coralOpacity }}
          className="transition-opacity duration-75"
        />

        {/* Beat 2 Inward Curved Pulsing Lines ("Listening Inward") */}
        {!reduceMotion && (
          <g style={{ opacity: pulseOpacity }} className="transition-opacity duration-300 pointer-events-none">
            <path
              d="M 50,50 Q 80,70 100,100"
              fill="none"
              stroke="var(--glacier-teal)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="animate-[pulse-in_2.5s_infinite_linear]"
              style={{ strokeDasharray: "15, 100" }}
            />
            <path
              d="M 150,50 Q 120,70 100,100"
              fill="none"
              stroke="var(--glacier-teal)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="animate-[pulse-in_2.5s_infinite_linear_0.6s]"
              style={{ strokeDasharray: "15, 100" }}
            />
            <path
              d="M 50,150 Q 80,130 100,100"
              fill="none"
              stroke="var(--glacier-teal)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="animate-[pulse-in_2.5s_infinite_linear_1.2s]"
              style={{ strokeDasharray: "15, 100" }}
            />
            <path
              d="M 150,150 Q 120,130 100,100"
              fill="none"
              stroke="var(--glacier-teal)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="animate-[pulse-in_2.5s_infinite_linear_1.8s]"
              style={{ strokeDasharray: "15, 100" }}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
