# Lyka marketing site
 
Next.js App Router + TypeScript + Tailwind. Animation: GSAP/ScrollTrigger
for scroll-scrubbed sequences, Lenis for smooth scroll, Framer Motion for
component-level interactions. The orb is SVG/Canvas2D, not WebGL.
 
Always consult the `lyka-design` skill before writing or changing any UI.
Component files live in /components, one component per file, PascalCase.
Build mobile behavior in the same pass as desktop — don't leave it for a
separate cleanup phase unless explicitly told to.
