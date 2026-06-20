"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void focus-visible:ring-ember-coral cursor-pointer",
        variant === "primary" &&
          "bg-ember-coral text-void hover:bg-opacity-90 active:scale-[0.98] transition-transform",
        variant === "ghost" &&
          "bg-transparent text-moon border border-transparent hover:border-moon/20 hover:bg-slate/40 active:scale-[0.98] transition-transform",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
