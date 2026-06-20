import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
}

export default function Section({
  children,
  className,
  containerClassName,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("w-full py-20 md:py-32 overflow-hidden", className)}
      {...props}
    >
      <div className={cn("max-w-7xl mx-auto px-6 md:px-12", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
