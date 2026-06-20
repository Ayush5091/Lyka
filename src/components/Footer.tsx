"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: "Features", href: "#product" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Journal", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  };

  return (
    <footer className="w-full bg-void border-t border-white/5 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-16">
          
          {/* Logo & Tagline column */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            <span className="font-display text-2xl font-semibold tracking-tight text-moon">
              Lyka
            </span>
            <p className="font-body text-sm text-moon/50 max-w-sm leading-relaxed">
              A quiet, attentive listener in your workspace that remembers what was discussed, so no detail is lost to time.
            </p>
          </div>

          {/* Product links column */}
          <div className="md:col-span-3 flex flex-col space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
              Product
            </h4>
            <ul className="space-y-1">
              {links.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-moon/65 hover:text-moon transition-colors py-2.5 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links column */}
          <div className="md:col-span-3 flex flex-col space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-glacier-teal">
              Company
            </h4>
            <ul className="space-y-1">
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-moon/65 hover:text-moon transition-colors py-2.5 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom row */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="font-body text-xs text-moon/40">
            &copy; {currentYear} Lyka. All rights reserved.
          </p>
          <div className="font-body text-xs text-moon/50">
            To start a trial, request access at{" "}
            <a
              href="mailto:hello@lyka.app"
              className="text-ember-coral hover:underline"
            >
              hello@lyka.app
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
