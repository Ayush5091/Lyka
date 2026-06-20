"use client";

import React from "react";
import dynamic from "next/dynamic";
import { OrbProvider } from "@/lib/OrbContext";

const CoreCanvas = dynamic(() => import("@/components/Core"), { ssr: false });

/**
 * Client-side layout wrapper that provides the OrbProvider context
 * and mounts the global CoreCanvas (R3F) behind all content.
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrbProvider>
      <CoreCanvas />
      {children}
    </OrbProvider>
  );
}
