---
name: Design tokens — violet accent
description: Sharp violet accent layered over monochromatic neutrals; oklch-based theme tokens added to app.css
type: project
---

Theme adopts a sharp, saturated violet (~oklch 0.55 0.245 295 light / 0.66 0.235 295 dark) layered over a monochromatic base. Violet tokens: `--violet`, `--violet-foreground`, `--violet-muted`. The `--ring` token is bound to violet so all `focus-visible:ring-ring` focus rings render violet automatically. The Button `default` variant is violet-on-white; outline variant picks up violet on hover.

**Why:** User asked for a sharp purple-violet pop, not pastel — violet should feel like an accent, not a dominant color. All other neutrals stay pure (no blue/violet hue tint in foreground/background) so the accent reads cleanly.

**How to apply:** When adding hover/active/focus states, reach for `text-violet`, `bg-violet`, `border-violet/40`, `bg-violet-muted/40`. For primary CTAs use `<Button>` default. For inert decoration (rails, dots), `bg-violet` is fine but use sparingly — one or two violet beats per screen, max. Keep the rest of the surface monochromatic so violet keeps its sharpness.
