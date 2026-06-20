"use client";

import React from "react";
import Button from "./Button";
import Section from "./Section";
import Core from "./Core";

export default function Hero() {
  return (
    <Section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
        
        {/* Mobile: Core centered at top. Desktop: Right-of-center off-center */}
        <div className="lg:col-span-5 lg:order-last flex justify-center lg:justify-end xl:justify-center">
          <Core size={320} className="sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] xl:w-[460px] xl:h-[460px]" />
        </div>

        {/* Hero Text Content */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight text-moon">
            Some meetings deserve a witness.
          </h1>
          
          <p className="font-body text-base sm:text-lg text-moon/65 leading-relaxed max-w-xl">
            Lyka sits in, listens closely, and tells the people who wasn't there — on Slack, Gmail, Jira, Teams, and Discord. And before the meeting starts, it'll tell you if you needed it at all.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button variant="primary" className="px-8 py-4 text-base">
              Get started
            </Button>
            <Button variant="ghost" className="px-8 py-4 text-base">
              See how it works
            </Button>
          </div>
        </div>

      </div>
    </Section>
  );
}
