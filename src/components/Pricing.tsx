"use client";

import React from "react";
import Section from "./Section";
import Button from "./Button";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const tiers = [
    {
      name: "Free trial",
      price: "Free",
      period: "14 days",
      ctaLabel: "Request access",
      ctaHref: "mailto:hello@lyka.app?subject=Free Trial Access Request",
      isRecommended: false,
      features: [
        "14-day fully featured sandbox",
        "Up to 3 meetings processed",
        "Slack integration delivery",
        "7-day context retention",
        "Standard transcript parsing",
      ],
    },
    {
      name: "Individual",
      price: "₹1,499",
      period: "month",
      ctaLabel: "Get started",
      ctaHref: "#",
      isRecommended: true,
      features: [
        "Up to 10 meetings / month",
        "Slack + Gmail delivery channels",
        "30-day RAG memory index",
        "Drift warnings & agenda enforcement",
        "Standard processing speed",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored pricing",
      ctaLabel: "Talk to sales",
      ctaHref: "mailto:hello@lyka.app?subject=Enterprise Inquiry",
      isRecommended: false,
      features: [
        "Unlimited meetings",
        "All integrations (Teams, Jira, Discord)",
        "Dedicated permanent RAG memory",
        "Custom vector chunking policies",
        "SSO, SAML & audit logs",
        "Dedicated support & SLAs",
      ],
    },
  ];

  return (
    <Section className="bg-void border-t border-white/5" id="pricing">
      <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <span className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
          Pricing Tiers
        </span>
        <h2 className="font-display text-4xl md:text-5xl mt-2 mb-4 text-moon">
          Attentive support at any scale
        </h2>
        <p className="font-body text-base text-moon/60 max-w-lg mx-auto">
          Trials are handled personally by the engineering team to ensure context setup is correct.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col justify-between p-8 rounded-2xl bg-slate/50 border backdrop-blur-sm",
              !reduceMotion && "transition-all duration-300",
              tier.isRecommended
                ? cn(
                    "border-ember-coral/30 shadow-2xl shadow-ember-coral/5 z-10",
                    !reduceMotion ? "md:scale-[1.03] lg:scale-[1.05] hover:border-ember-coral/60" : "scale-100"
                  )
                : cn(
                    "border-white/5",
                    !reduceMotion && "hover:border-white/10 hover:bg-slate/60"
                  )
            )}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-moon font-medium">
                  {tier.name}
                </h3>
                {tier.isRecommended && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ember-coral px-2.5 py-0.5 rounded-full border border-ember-coral/20 bg-ember-coral/5">
                    Recommended
                  </span>
                )}
              </div>

              {/* Price block */}
              <div className="mb-6 flex items-baseline space-x-1.5">
                <span className="font-mono text-4xl md:text-5xl font-normal text-moon tracking-tight">
                  {tier.price}
                </span>
                <span className="font-body text-xs text-moon/40">
                  / {tier.period}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 border-t border-white/5 pt-6 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-moon/70">
                    <span className="text-glacier-teal mt-0.5 select-none">✓</span>
                    <span className="font-body leading-normal">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA button */}
            <a
              href={tier.ctaHref}
              onClick={(e) => {
                if (tier.ctaHref === "#") {
                  e.preventDefault();
                }
              }}
              className="w-full"
            >
              <Button
                variant={tier.isRecommended ? "primary" : "ghost"}
                className="w-full justify-center py-3.5"
              >
                {tier.ctaLabel}
              </Button>
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
}
