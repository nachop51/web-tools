# Command palette & search

Global `Ctrl+K` / `Cmd+K` opens a command palette over every route. Type to FTS
across tools + category landing pages; type `mb to gb` (or `5 mb to gb`,
`celsius to fahrenheit`) to deep-link a unit converter with `?from=…&to=…`.

Also reachable via the search button in the nav (`⌘K` badge).

## Files

```
src/components/
├── command-palette.tsx          dialog + textfield + listbox + global Ctrl+K listener
└── ui/listbox.tsx               styled <ul role="listbox"> primitive

src/lib/search/
├── search-index.ts              MiniSearch over tools + categories
├── unit-aliases.ts              alias index for the 12 unit converters
├── parse-query.ts               "X to Y" / "5 mb to gb" parser
├── recents.ts                   localStorage recents (last 6)
├── palette-state.ts             open signal, shared between palette + nav button
└── *.spec.ts                    coverage for the pure modules
```

Mounted once in `src/app.tsx` next to `<Nav />`. Nav button lives in
`src/components/nav.tsx` and toggles `paletteOpen` from `palette-state.ts`.

## What gets indexed

`search-index.ts` builds one MiniSearch over **every** entry:

- 69 tools from `src/lib/tools/registry.ts`
- 11 category landing pages

For each entry, fields are weighted:

| Field          | Boost | Source                                        |
| -------------- | ----- | --------------------------------------------- |
| `name`         | 4     | `Tool.name` / `Category.name`                 |
| `keywords`     | 3     | `Tool.keywords[]`                             |
| `aliases`      | 3     | injected for unit-converter tools (see below) |
| `categoryName` | 2     | resolved from `Tool.category`                 |
| `description`  | 1     | `Tool.description`                            |

MiniSearch options: `prefix: true`, `fuzzy: 0.2`, `combineWith: "AND"`. So
`hexa` prefix-matches `hexadecimal` in `base-converter`'s keywords, and `jzon`
fuzzy-matches `json`.

## Smart "X to Y" parsing

`parse-query.ts` returns either `{ kind: "unit", entry, toEntry?, value? }` or
`{ kind: "fuzzy" }`.

Algorithm:

1. Lowercase + collapse whitespace.
2. Strip leading numeric token (`5 mb to gb` → value=`"5"`).
3. Match `/^(.+?)\s+(?:to|->|→|in)\s+(.+)$/`.
4. Both halves must resolve via `findUnitByAlias` AND share a category, else
   fall through to fuzzy. (`feet to dollars` → fuzzy.)

When kind is `unit`, the palette pins a violet "Convert X → Y" row above the
fuzzy results that navigates to `<routeHref>?from=<key>&to=<key>`.

The `value` field is captured but unused in v1 (the route doesn't read a
`value` param). Future enhancement.

## Unit aliases

`unit-aliases.ts` builds an alias index across all 12 unit categories. Two
sources:

1. **Auto-derived from `label`**: `"Megabytes (MB)"` → `["megabytes",
"megabyte"]`. Naive singularization (`-ies` / `-es` / `-s`).
2. **Hand-authored override map**: inline at the top of the file, keyed by
   category and unit key. Add irregulars and short forms here:
   `lb → ["pound","pounds","lbs"]`, `c → ["celsius","centigrade","°c"]`, etc.

`findUnitByAlias("mb")` → `[{ category: "data", unitKey: "MB", … }]` (always
returns canonical-cased `unitKey` for URL use).

Disambiguators:

- `gal` → `us_gal` (US default).
- `imperial gallon` / `uk gallon` → `imp_gal`.

A spec asserts every key in every unit `Record` has at least one alias entry;
adding a new unit fails CI until the override is extended.

## `?to=` row highlight on unit converters

Every unit-converter route reads `useSearchParams<{ from?: string; to?: string }>()`
and applies `ring-1 ring-violet/60 bg-violet/10` to the row whose unit matches
`params.to`, in addition to the existing `bg-muted` highlight on `params.from`.
This is what makes "mb to gb" land you on a page where the GB row is visibly
flagged as the answer.

## Recents

`recents.ts` keeps the last 6 navigated entry IDs in
`localStorage["web-tools:recent-entries"]`. The palette interleaves them as the
top rows when the input is empty. `pushRecent` is called from `navigateTo`
(skipped for unit-shortcut rows since they're parametric).

Storage access is wrapped in try/catch and `isServer` checks; disabled
storage / SSR returns `[]`.

## When you add a tool

The tool's registry entry is enough to index it. **Make `keywords` rich**;
that's the field most users hit. Examples:

```ts
{
  slug: "regex",
  category: "code",
  name: "Regex tester",
  description: "Test regular expressions against sample input.",
  href: "/code/regex",
  keywords: ["regex", "regexp", "regular expression", "pattern", "match"],
}
```

No other touchpoints. The palette picks it up next reload.

## When you add a unit converter

If you add a new unit to an existing converter (e.g. a new entry to
`dataUnits`), or a whole new converter:

1. **For an existing converter**: add the unit's aliases to the override map
   in `unit-aliases.ts` under the right category. The spec
   (`unit-aliases.spec.ts`) will fail until you do.
2. **For a new converter**: add a new `Source` block to the `sources` array in
   `unit-aliases.ts`: `category`, `routeHref`, `units` import, `overrides`.
   Then make sure the route reads both `from` and `to` query params, and apply
   the same row-highlight pattern as the existing converters.

## Gotchas

- **Unit keys keep their casing** in URLs (`?from=MB`, `?from=KiB`). Aliases
  are matched lowercased, but `unitKey` is preserved and used as-is in the
  query string. Routes look unit objects up by exact key.
- **Power tool slug is `power-unit`** (not `power`); the `routeHref` in
  `unit-aliases.ts` for that category must be `/units/power-unit`.
- **Speed units have slashes** (`m/s`, `km/h`). `URLSearchParams` encodes them
  to `%2F`. Routes decode automatically when reading via `useSearchParams`.
- **Browser Ctrl+K**: Firefox uses Ctrl+K for its search bar.
  `e.preventDefault()` in the global handler suppresses it. Any future tool
  that wants to consume Ctrl+K inside its own input must `e.stopPropagation()`.
- **Number-prefix queries** (`5 mb to gb`) parse correctly but the captured
  `value` is currently dropped; the user lands on the converter and re-types
  the value. Future: pre-fill via a `value` query param (route change required).
