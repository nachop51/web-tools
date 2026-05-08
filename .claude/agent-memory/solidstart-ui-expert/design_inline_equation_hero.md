---
name: Inline-equation + hero-result calculator pattern
description: Pattern for calculator tools where the answer must dominate; inputs styled as inline prose, result rendered at text-6xl/7xl violet
type: feedback
---

For "ask a question, see an answer" tools (percentage, conversions, single-value calculators), strip form chrome and render the result as the hero.

**Why:** User reaction on percentage tool: chrome-heavy NumberFields with arrows + a small bordered result box made the answer the *least* important visual element. Form looked like a form, not an answer.

**How to apply:**
- Use plain `<input type="text" inputmode="decimal">` — not NumberField — when inputs sit inside a sentence. No spinner arrows, no visible border. Style: `border-0 border-b-2 border-dotted border-border`, `text-center font-mono font-semibold`, width sized to content via `style={{ width: \`${len}ch\` }}`.
- Hero result: `font-mono text-6xl sm:text-7xl font-bold tabular-nums text-violet`. Pair with a smaller dimmed `=` glyph (`text-5xl text-muted-foreground/40`) for relational anchoring.
- Pivot/mode picker: tiny secondary toolbar above the question card (uppercase tracking-wide label + mono-font phrasing buttons). Don't pack pivot affordances onto each input — that needs a legend, which means it failed.
- Quick-fill chips for primary numeric inputs: render as a popover anchored under the focused input (open on focusIn, close on focusOut, click via `onMouseDown` + `preventDefault` to fire before blur).
- Steps disclosure: `<details>` with naked `Show steps ›` text trigger — no bordered box.
- Part/whole indicator: thin `h-1` violet bar, no caption (the hero already shows the number).
- Tested on light + dark — `text-violet` on `bg-card` reads strong in both. `bg-warning-foreground` is the right token for "overflow" indicators.
