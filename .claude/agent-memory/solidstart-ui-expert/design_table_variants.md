---
name: Table component variants
description: Three table variants (default/accent/form) in src/components/ui/table.tsx — pick by content type, not by tool category.
type: project
---

`src/components/ui/table.tsx` exposes three cva variants via `<Table variant="...">`. Variant context propagates via `TableVariantContext` so children read the parent's variant — no need to thread props.

- **default** — standard data tables (lookup, parsed components, key/value). Mono cells, violet row hover, violet cell hover (cell hover lights the cell + text). Use for tabular *data* with no interactive controls inside cells.
- **accent** — highlighted result tables on a violet-tinted card surface (compound-interest schedule). Violet header bg, violet dividers, subtler violet row hover, no per-cell hover (because the whole surface is already accented). Use when the table is the marquee output and is wrapped in a `bg-violet/5` container.
- **form** — interactive editor tables where cells host inputs/selects/buttons (fake-data field editor). No row/cell hover (would interfere with input focus/typing), no mono on cells (form controls keep their typography), sentence-case sans-serif headers, looser vertical padding.

**Why:** Default-variant cell hover paints text violet — that's actively wrong inside a `<TextField>` or `<Select>`. Accent variant exists because compound-interest had a violet-themed result that would have looked muted on the default neutral surface.

**How to apply:** New table → ask "is the cell content static data, a highlighted result, or a form control?" Map to default/accent/form. Don't add a new variant unless the existing three genuinely don't fit. `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>` all read context — never reach for raw `<tr>/<td>`, even inside `<TableHeader>` (caught two regressions in ascii-table and decimal-precision that already imported the wrapper).
