"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface OrbState {
  targetAnchor: string;
  colorState: 0 | 1 | 2;
  /** The orb's current projected screen-space position (set by Core each frame) */
  orbScreenPos: { x: number; y: number };
}

interface OrbContextValue extends OrbState {
  setOrbState: (anchor: string, color: 0 | 1 | 2) => void;
  setOrbScreenPos: (x: number, y: number) => void;
}

const OrbContext = createContext<OrbContextValue | null>(null);

export function OrbProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OrbState>({
    targetAnchor: "hero",
    colorState: 0,
    orbScreenPos: { x: 0, y: 0 },
  });

  const setOrbState = useCallback((anchor: string, color: 0 | 1 | 2) => {
    setState((prev) => {
      if (prev.targetAnchor === anchor && prev.colorState === color) return prev;
      return { ...prev, targetAnchor: anchor, colorState: color };
    });
  }, []);

  const setOrbScreenPos = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.orbScreenPos.x === x && prev.orbScreenPos.y === y) return prev;
      return { ...prev, orbScreenPos: { x, y } };
    });
  }, []);

  return (
    <OrbContext.Provider value={{ ...state, setOrbState, setOrbScreenPos }}>
      {children}
    </OrbContext.Provider>
  );
}

export function useOrb() {
  const ctx = useContext(OrbContext);
  if (!ctx) throw new Error("useOrb must be used within OrbProvider");
  return ctx;
}
