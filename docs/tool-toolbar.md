# Tool toolbar pattern

Replaces the old "Mode card" (full-width card with radio-styled buttons) at the
top of tool pages. Chromeless strip above the Input/Output cards.

Canonical reference: `src/routes/encoding/html-entities.tsx`. Read it first.

## Primitives

Live in `src/components/tool-toolbar.tsx`. Three exports:

```tsx
<ToolToolbar>
  <ToolbarSegmented<T>
    label="Direction" // shown as uppercase tracked, no violet dot
    value={mode()}
    onChange={setMode}
    options={[
      { value: 'encode', label: 'Encode' },
      { value: 'decode', label: 'Decode' },
    ]}
  />
  <div class="ml-auto" /> {/* push chips right */}
  <ToolbarChip checked={extended()} onChange={setExtended}>
    non-ASCII as numeric
  </ToolbarChip>
</ToolToolbar>
```

- `ToolToolbar`: flex strip. Wraps on mobile. No card chrome.
- `ToolbarSegmented<T extends string>`: primary mode picker, 2–4 options.
  Auto-hides if `options.length < 2`.
- `ToolbarChip`: boolean toggle with checkbox-square (NOT a status dot; the
  square is the affordance that reads as "click me").

## Decision tree

| Picker shape                                       | Use                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Binary or 3–4 mutually-exclusive modes             | `<ToolbarSegmented>`                                                                          |
| 5+ modes, or long labels                           | `<Select>` from `~/components/ui/select` inside `<ToolToolbar>` with a sibling `<span>` label |
| Two independent axes (e.g. format × direction)     | Two `<ToolbarSegmented>` (or one Select + one segmented) in the same `<ToolToolbar>`          |
| Boolean option that fits "one line"                | `<ToolbarChip>`, right-aligned via `<div class="ml-auto" />` spacer                           |
| Numeric input, formula readout, multi-line setting | NOT toolbar. Keep its own card (see `caesar.tsx` Settings card for shift).                    |

If a mode-specific chip should disappear in other modes, wrap in
`<Show when={mode() === "encode"}>`. The chip's own `anim-fade-in` handles the
entrance.

## Visual rules

- Toolbar is **chromeless**: no border, no shadow, no background. Just
  `mb-3 flex flex-wrap items-center gap-3 px-1`. Don't wrap it in a card.
- Label: `text-xs font-semibold uppercase tracking-wider text-muted-foreground`.
  No violet dot; dots are reserved for **card** headings, this is a control.
- Active segment: `bg-violet text-white shadow-sm`. Inactive:
  `text-muted-foreground hover:text-foreground hover:bg-violet/5`.
- Chip-square: empty `border-foreground/30` → on click fills `bg-violet` with
  white `TbOutlineCheck`. Hover bumps border to `border-violet/60` to signal
  affordance.
- Theme tokens only, no raw colors.

## Anti-patterns

- Don't reintroduce the dedicated "Mode" card (full card chrome around two
  buttons). That's the whole reason this exists.
- Don't bidirectionally swap input/output panes (the dual-pane "Google
  Translate" prototype). It loses the input → output direction and confuses
  users. Single input → single output, mode picker on top.
- Don't put NumberFields, sliders, formula previews, or anything multi-line
  inside the toolbar. Those go in their own card.
- Don't use `bg-muted-foreground/40` dots as chip indicators; the checkbox
  square reads as toggleable, the dot reads as passive status.
- Don't add a violet dot before the toolbar label. That's card heading
  vocabulary, not control vocabulary.

## Sweep candidates (not yet migrated)

Files with `role="radiogroup"` outside the encoding/strings sweep. Each is a
judgment call; apply Pattern E only when the picker is a primary mode that
deserves to live above the cards. Calculation-mode pickers ("Solve for",
"Operation", "Calculation mode") usually qualify; obscure secondary options
(error correction level inside a settings panel) usually don't.

**Likely fits (primary mode pickers above cards):**

- `numbers/percentage.tsx`, `numbers/random-number.tsx`,
  `numbers/decimal-precision.tsx`, `numbers/base-converter.tsx` (its `Number
mode` picker; leave the swap pivot intact, it's separate)
- `electrical/{ohms-law,power,amps-watts-volts}.tsx` ("Solve for", "Formula")
- `math/{percentage,fractions,factorial,scientific-notation,ratio}.tsx`
- `finance/{discount,salary,compound-interest}.tsx`
- `geometry/{pythagorean,triangle,circle}.tsx`
- `datetime/{date-add,date-diff,unix}.tsx`
- `strings/{case,trim,sort-lines,slugify}.tsx`
- `code/{fake-data,password,qr-code}.tsx`: bigger pages, multiple radiogroups,
  read carefully before sweeping
- `color/{mixer,gradient,palette}.tsx`

**Probably keep as-is** (radiogroup is inside an option panel, not a primary
mode):

- Anything inside a `<details>` / settings panel
- `code/qr-code.tsx` "Logo shape" / "Error correction": secondary options
- `code/password.tsx` word-count / separator radiogroups: inside the passphrase
  config

When in doubt: if the radiogroup currently lives at the **top** of the page in
its own card-like section, sweep it. If it lives **inside** another card next
to other inputs, leave it.

## Per-tool checklist for a sweep

1. Read the file. Identify which radiogroup(s) are primary modes vs nested
   options.
2. Replace the primary picker's surrounding card section with `<ToolToolbar>` +
   `<ToolbarSegmented>` (or `<Select>` for 5+).
3. Move any boolean options that were also at the top into `<ToolbarChip>`s on
   the right of the same toolbar. Gate mode-specific chips with `<Show>`.
4. Don't change pure-logic imports, URL param keys, animations, `ToolHeader`,
   `CopyButton`, or `setToolPageMeta`.
5. Run `bun run test` (must stay green) and click through the page in
   `bun run dev`. Verify the toolbar replaces the old card and the
   input → output flow is unchanged.
