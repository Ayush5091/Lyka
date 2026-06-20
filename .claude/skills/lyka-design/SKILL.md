---
name: lyka-design
description: The Lyka design system — color states, typography, motion, and the orb signature element. Use this for any work on the Lyka marketing site frontend, including the hero, scroll sequence, pricing, and footer.
---
 
# Lyka design system
 
Lyka is a meeting-listener product, positioned as a quiet, attentive presence
("the wolf that listens") rather than a dashboard. One persistent orb — "the
Core" — appears in the hero and throughout the scroll sequence. Its color
state IS the product demo; never introduce a second hero graphic.
 
## Color tokens (CSS variables, define in globals.css)
--void: #0A0B10        background only
--slate: #14161D       card/surface fill
--moon: #EDEBE6         text only, never a background
--dusk-indigo: #5B4FE8  Core state: listening
--glacier-teal: #19B8A6 Core state: recalling context (RAG)
--ember-coral: #FF7A59  Core state: synthesizing/delivering — use sparingly,
                        only for the primary CTA and the active "delivering"
                        moment. Never as a generic accent.
 
## Type
Display: Fraunces (variable), large headlines only, restrained use.
Body/UI: Geist.
Utility/data (timestamps, tags, transcript chips): Geist Mono.
Never default to Inter, Roboto, Arial, or Space Grotesk.
 
## Motion
"Breathing, not bouncing." Idle orb animation: ~4s sine pulse. All easing
uses organic cubic-beziers like cubic-bezier(0.45, 0, 0.15, 1) — never
default ease-in-out, never spring/bounce/elastic curves. Scroll-linked
animation must be scrubbed (tied directly and reversibly to scroll
position), never autoplaying.
 
## Layout
The Core sits slightly off-center; content orbits around it rather than
the Core illustrating a centered headline. Mobile collapses to a single
column with the Core anchored at the top of each section.
 
## Copy voice
Plain, specific, slightly literary. No "empower your team" SaaS-speak.
Active voice. Name things by what the user controls, not by internal
system names.
 
## Always do
- Derive every color from the tokens above, never a hardcoded hex.
- Respect prefers-reduced-motion: replace scrubbed/pinned animation with a
  simple cross-fade.
- Check mobile behavior in the same response — don't defer it.
