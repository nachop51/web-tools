---
name: Dual-pane bidirectional converter pattern
description: Layout/state recipe for Google-Translate-style dual editable panes replacing encode/decode mode toggles.
type: project
---

Prototyped on `src/routes/encoding/html-entities.tsx` (2026-05-03). Replaces the explicit Mode card with two side-by-side editable cards and a swap pivot (matches `src/routes/numbers/base-converter.tsx` visual language: `TbOutlineArrowsExchange`, lg:rotate-0 rotate-90, `lg:grid-cols-[1fr_auto_1fr]` grid).

**Why:** encode/decode (and similar binary inverses) read more naturally as direction between two values than as a multi-select flip. Saves a whole card of vertical space, matches the established swap-pivot pattern, surfaces both representations at once.

**How to apply:** State model = single `source` signal + `direction` signal (`"encode" | "decode"`). The non-active pane is a memo that runs the transform on `source`. When user types in the inactive pane, `batch(() => { setDirection(other); setSource(next); })` to flip atomically. URL param: `?dir=encode|decode`. Copy button only on the *derived* (inactive) pane. Active pane gets `border-violet/60 bg-violet/[0.03]`, inactive gets `border-border`. Dot indicator: `bg-violet` active vs `bg-muted-foreground/30` inactive.

Inline sub-options (e.g. encode-only "non-ASCII as numeric" checkbox) live in the active pane's header top-right via inline `<Show when={direction() === "encode"}>` — do NOT extract into a sub-component that receives JSX via prop (causes hydration mismatch with Kobalte primitives — see `feedback_hydration_jsx_props.md`).

Awkward bits noted during prototype: (1) For tools where the two operations aren't pure inverses (e.g. URL encoding `%20` vs `+`, or hashing which is one-way), this pattern doesn't apply — keep an explicit mode toggle. (2) On initial empty state, swap is a no-op visually but does flip URL/direction — fine, but the pivot button then feels less "discoverable" until something is typed. Consider an empty-state hint or a "Try a sample" affordance.
