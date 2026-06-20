"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LiquidMetalBackground } from "@/components/liquid-metal-background";
import { InteractiveSphere } from "@/components/interactive-sphere";
import { FloatingNavbar } from "@/components/floating-navbar";
import { FeatureWithAdvantages } from "@/components/ui/feature-with-advantages";
import { BentoPricing } from "@/components/ui/bento-pricing";
import { AboutQuote } from "@/components/ui/about-quote";
import { ContactCard } from "@/components/ui/contact-card";
import { ShinyButton } from "@/components/ui/shiny-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      const delta = e.deltaY;
      const currentScroll = scrollContainer.scrollLeft;
      const containerWidth = scrollContainer.offsetWidth;
      const currentSection = Math.round(currentScroll / containerWidth);

      // Section 2: About (Scrollable)
      if (currentSection === 2 && aboutSectionRef.current) {
        const section = aboutSectionRef.current;
        const isAtTop = section.scrollTop === 0;
        const isAtBottom = section.scrollTop + section.clientHeight >= section.scrollHeight - 1;

        if (delta > 0 && !isAtBottom) return;
        if (delta < 0 && !isAtTop) return;
        if (delta < 0 && isAtTop) {
          e.preventDefault();
          scrollContainer.scrollTo({ left: 1 * containerWidth, behavior: "smooth" });
          return;
        }
        if (delta > 0 && isAtBottom) {
          e.preventDefault();
          scrollContainer.scrollTo({ left: 3 * containerWidth, behavior: "smooth" });
          return;
        }
      }

      // Section 3: Contact (Scrollable)
      if (currentSection === 3 && contactSectionRef.current) {
        const section = contactSectionRef.current;
        const isAtTop = section.scrollTop === 0;
        const isAtBottom = section.scrollTop + section.clientHeight >= section.scrollHeight - 1;

        if (delta > 0 && !isAtBottom) return;
        if (delta < 0 && !isAtTop) return;
        if (delta < 0 && isAtTop) {
          e.preventDefault();
          scrollContainer.scrollTo({ left: 2 * containerWidth, behavior: "smooth" });
          return;
        }
        if (delta > 0 && isAtBottom) {
          e.preventDefault();
          return;
        }
      }

      e.preventDefault();

      if (Math.abs(delta) > 10) {
        let targetSection = currentSection;
        if (delta > 0) {
          targetSection = Math.min(currentSection + 1, 3);
        } else {
          targetSection = Math.max(currentSection - 1, 0);
        }

        scrollContainer.scrollTo({
          left: targetSection * containerWidth,
          behavior: "smooth",
        });
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <main className="relative h-screen overflow-hidden selection:bg-primary/30">
      <LiquidMetalBackground />
      <InteractiveSphere />

      {/* Dynamic Overlay */}
      <div className="fixed inset-0 z-[5] bg-black/60 backdrop-blur-[6px]" />

      <FloatingNavbar />

      <div
        ref={scrollContainerRef}
        className="relative z-10 flex h-screen w-full overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Hero Section */}
        <section id="home" className="flex min-w-full snap-start items-center justify-center px-4 relative">
          <DotPattern className="opacity-20 translate-y-[-10%]" />
          <div className="container mx-auto relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-white/10 border-white/20 backdrop-blur-xl text-primary animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Version 2.0 is now live
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-bold tracking-tight mb-8"
              >
                Meet Lyka.
              </motion.h1>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-6 items-center"
              >
                <Link href="/login">
                  <ShinyButton className="px-10 py-6 text-lg">
                    Get Started Free
                  </ShinyButton>
                </Link>
                <button className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-2 group">
                  Watch the story
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-all">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                  </div>
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="flex min-w-full snap-start items-center justify-center px-4 relative">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <FeatureWithAdvantages />
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          ref={aboutSectionRef}
          className="relative min-w-full snap-start overflow-y-auto px-4 py-32 hide-scrollbar"
        >
          <div className="container mx-auto relative z-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
            >
              <AboutQuote />
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          ref={contactSectionRef}
          className="relative min-w-full snap-start overflow-y-auto px-4 py-32 hide-scrollbar"
        >
          <div className="container mx-auto relative z-20 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8 }}
            >
              <ContactCard />
            </motion.div>

            <footer className="mt-20 py-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Brain className="text-primary w-6 h-6" />
                <span className="font-bold text-xl tracking-tight">Lyka</span>
              </div>
              <p>© {new Date().getFullYear()} Lyka AI. Built with artificial intuition.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
