Ready to code?

 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Rethink the decimal-precision page → "Precision workbench"

 Context

 src/routes/numbers/decimal-precision.tsx is functionally complete but flat: pick-one-mode + number + places
 → single result. Doesn't communicate what "precision" means — no error magnitude, no cross-mode comparison,
 no feel for how the value drifts with depth. Goal: turn it from a 1-shot calculator into a precision
 workbench that teaches & explores. Stylistic anchor: src/routes/numbers/float-inspector.tsx
 (visualization-heavy, multi-stat, comparison, "Try" palette).

 Recommendation

 Layout (top → bottom)

 1. ToolHeader — unchanged.
 2. ToolToolbar — boolean chips only: [Show ladder], [Show error stats] (both on by default). Mode picker
 moves into the comparison strip (#5).
 3. Input card
   - TextField (mono, large, autofocus). Accept sci notation (1.23e-4).
   - Range slider 0..15 ("depth") for live scrub + a NumberField mirror for keyboard precision. Slider is the
  star.
   - Subline: parsed-value note (e.g. 1.23 × 10⁻⁴) when input is sci or unusually big/small.
   - "Try" preset palette: π, e, √2, 1/3, $19.99, Avogadro's. Borrows SpecialValuesRow shape from
 float-inspector.
 4. Focused-result card (the hero)
   - Large mono display of focused-mode result at current depth + CopyButton.
   - Digit diff: original digits laid out one-by-one. Kept digits solid; dropped digits faded + line-through;
  ↑/↓/= indicator at the cut.
   - Three stat tiles (Stat-pattern from float-inspector): |abs error|, rel error %, direction.
 5. Mode comparison strip — 5 tiles (Round, Floor, Ceil, Trunc, Sig Figs). Each shows result for current
 value+depth. Clicking a tile makes it focused (drives #4). Focused tile gets border-violet. This replaces
 the old toolbar mode segmented.
 6. Precision ladder card (collapsible via toolbar chip)
   - Table: rows = depth 0..15, cols = Floor / Round / Ceil / Trunc / |error|.
   - Row matching current slider depth highlighted bg-violet/5.
   - Click row → set slider to that depth. Mono, tabular-nums.

 Logic additions (src/lib/utils/numbers/precision.ts)

 - absoluteError(original, rounded): number
 - relativeError(original, rounded): number (guard div-by-zero → return 0 when original is 0 and rounded is
 0; NaN otherwise — decide in spec)
 - direction(original, rounded): 'up' | 'down' | 'exact'
 - digitDiff(originalText, rounded, places, mode) → { kept: string; dropped: string; indicator: '↑' | '↓' |
 '=' } — string-level, pure, tested. Operates on the input text so we keep the user's exact digits (no
 float→string lossiness).
 - formatScientificNote(n) — short label for input subline.
 - Tests for each in precision.spec.ts.

 Files to touch

 - src/routes/numbers/decimal-precision.tsx — full rewrite.
 - src/lib/utils/numbers/precision.ts — add helpers.
 - src/lib/utils/numbers/precision.spec.ts — extend.
 - Registry description (src/lib/tools/registry.ts:378-384) — optionally tighten copy + add keywords (scrub,
 compare, error, digit).

 Patterns to reuse

 - ToolToolbar, ToolbarChip — src/components/tool-toolbar.tsx
 - Stat tile — copy inline from src/routes/numbers/float-inspector.tsx:591 (matches current convention; don't
  pre-extract).
 - "Try" palette — model after SpecialValuesRow in float-inspector.tsx:550.
 - CopyButton — src/components/copy-button.tsx.
 - Range slider: native <input type=range> styled w/ Tailwind (no ui/slider primitive exists yet — verify
 before redesign starts). NumberField mirror = existing ~/components/ui/number-field.

     - Range slider: native <input type=range> styled w/ Tailwind (no ui/slider primitive exists yet — verify
     before redesign starts). NumberField mirror = existing ~/components/ui/number-field.

     URL-state

     Params: n (number), mode (focused), d (depth, rename from places), ladder (1 open). Keep back-compat:
     read either d or places.

     Verification

     - bun run test — existing + new precision specs green.
     - bun run dev → /numbers/decimal-precision. Manual checks:
       - Type 3.14159; scrub slider 0→5; strip + ladder + digit-diff update live.
       - Click each strip tile → hero card swaps mode.
       - Click π preset → input + ladder repopulate.
       - 1.23e-4 parses; sub-line shows scientific form.
       - -3.999 w/ depth 2: round=−4.00, trunc=−3.99 — verify direction stat correct.
       - Toggle Show ladder / Show error stats chips.
       - Reload page with shared URL — state restored.
     - Light + dark mode visual pass.

     Unresolved questions

     1. Scope: full workbench (slider+strip+digit-diff+errors+ladder+presets) vs trimmed?
     2. Strip replaces toolbar mode segmented, or keep both?
     3. Slider cap: 15 places or higher (JS toFixed allows 100)?
