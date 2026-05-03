---
name: Pattern E toolbar primitives
description: Chromeless mode/option toolbar above input/output cards — ToolToolbar, ToolbarSegmented, ToolbarChip live in src/components/tool-toolbar.tsx
type: project
---

Pattern E replaces the dedicated "Mode" card with a chromeless flex strip above Input/Output. Three primitives in `src/components/tool-toolbar.tsx`:

- `ToolToolbar` — outer flex strip (`mb-3 flex flex-wrap items-center gap-3 px-1`).
- `ToolbarSegmented<T>` — uppercase tracked label + pill segmented control. Active = `bg-violet text-white shadow-sm`. Inactive = `text-muted-foreground hover:bg-violet/5`. Self-renders its label inline. Returns nothing if `options.length < 2`.
- `ToolbarChip` — pill with `sr-only` checkbox + custom checkbox-square (`TbOutlineCheck` size 10 stroke-width 3). Active border-violet bg-violet/5.

For 5+ option pickers, swap the segmented for a `<Select>` from `~/components/ui/select` placed inside the same `ToolToolbar`, with its own `<span>` uppercase label preceding it (the segmented label rendering is tied to ToolbarSegmented, not the toolbar itself).

Layout convention: left segmented(s), `<div class="ml-auto" />` spacer, right chips/options. Example shapes:
- 1 mode-only: `<ToolToolbar><ToolbarSegmented .../></ToolToolbar>`
- mode + chips: segmented, `ml-auto`, `<ToolbarChip>`s gated by `<Show when={mode() === "encode"}>` for mode-specific options.
- 2 segmented: first segmented, `ml-auto`, second segmented (e.g. binary-text Encoding/Direction).

**Why:** consistent vocabulary across all encoder tools, kills the bulky Mode card, leaves Input/Output as the visual focus.

**How to apply:** when adding a tool with primitive mode/direction config, default to ToolToolbar above the two-column Input/Output grid. Don't put mode in its own card unless it needs to share space with non-toggle controls (caesar's Settings card is the exception — Shift NumberField + Preset + Effective live there because they're not chips).
