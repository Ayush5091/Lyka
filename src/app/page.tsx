"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const ScrollDemo = dynamic(() => import("@/components/ScrollDemo"), {
  ssr: false,
});

export default function Page() {
  return (
    <main className="relative bg-background min-h-screen">
      <Hero />
      <ScrollDemo />
      <Pricing />
      <Footer />
    </main>
  );
}
