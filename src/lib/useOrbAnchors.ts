"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface AnchorPositions {
  [key: string]: { x: number; y: number };
}

/**
 * Queries all [data-orb-anchor] elements, reads their viewport-space centers,
 * and re-measures on resize (debounced).
 */
export function useOrbAnchors(): AnchorPositions {
  const [positions, setPositions] = useState<AnchorPositions>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-orb-anchor]");
    const next: AnchorPositions = {};
    els.forEach((el) => {
      const id = el.getAttribute("data-orb-anchor");
      if (!id) return;
      const rect = el.getBoundingClientRect();
      next[id] = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    });
    setPositions(next);
  }, []);

  useEffect(() => {
    // Initial measure after a tick (let layout settle)
    const initialTimer = setTimeout(measure, 80);

    const onResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(measure, 200);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", measure, { passive: true });

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", measure);
    };
  }, [measure]);

  return positions;
}

/**
 * Convert viewport pixel coords to orthographic world space.
 * Camera is set up so 1 world unit = 1 px, origin at viewport center.
 */
export function viewportToWorld(
  x: number,
  y: number,
  vw: number,
  vh: number
): [number, number, number] {
  return [x - vw / 2, -(y - vh / 2), 0];
}
