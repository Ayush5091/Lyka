import Hero from "@/components/Hero";
import ScrollDemo from "@/components/ScrollDemo";
import Pricing from "@/components/Pricing";

export default function Page() {
  return (
    <main className="relative bg-background min-h-screen">
      <Hero />
      <ScrollDemo />
      <Pricing />
    </main>
  );
}
