# CLAUDE.md

Orientation for Claude Code sessions in this repo.

## What this is

A growing collection of small, fast, **client-side** developer/utility tools —
number conversions, unit conversions, string transforms, encoding tools, etc. The
homepage and category indices are driven by a single registry, so adding a tool is
mostly: write the logic, write the route, add one entry.

## Stack

- **SolidStart** (2.0.0-alpha) on Vite 7 with the Nitro v2 plugin
- **TypeScript** (paths: `~/*` → `src/*`)
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **[solid-ui](https://www.solid-ui.com/)** — shadcn-style components owned in
  `src/components/ui/`, built on `@kobalte/core` + `class-variance-authority` +
  `clsx` + `tailwind-merge`. Add new primitives via the CLI:
  `bunx solidui-cli@latest add <component>` (e.g. `button`, `text-field`,
  `select`, `card`, `separator`). Config lives in `ui.config.json`.
- **Vitest** for pure-logic unit tests
- **bun** as the package manager (`bun.lock`)

Scripts: `bun run dev`, `bun run build`, `bun run test`.

## Folder map

```
src/
├── app.tsx                       Router root + Nav
├── app.css                       Tailwind import + theme tokens (oklch, light + dark)
├── entry-client.tsx              SolidStart client entry
├── entry-server.tsx              SolidStart server entry
├── components/
│   ├── ui/                       solid-ui primitives (button, card, label, separator, select, text-field, dialog, listbox, …)
│   ├── nav.tsx                   top nav (renders categories from registry, palette trigger)
│   ├── command-palette.tsx       global Ctrl+K palette (see docs/search.md)
│   ├── tool-header.tsx           tool page header (back link + title + description)
│   └── copy-button.tsx           copy-to-clipboard button
├── lib/
│   ├── utils.ts                  cn() helper
│   ├── tools/
│   │   └── registry.ts           single source of truth for categories + tools
│   ├── search/                   command palette: MiniSearch index, unit aliases, parser, recents (see docs/search.md)
│   ├── consts.ts
│   └── utils/
│       └── numbers/converter.ts  pure logic for the base converter
└── routes/                       SolidStart file-based routing
    ├── index.tsx                 homepage (renders categories)
    ├── numbers/
    │   ├── index.tsx             category index page
    │   └── base-converter.tsx
    ├── units/index.tsx
    ├── strings/index.tsx
    └── encoding/index.tsx
```

## Conventions

> **Read [docs/solid-standards.md](docs/solid-standards.md) before writing any
> Solid/SolidStart code.** It covers file naming (kebab-case), route structure
> (`index.tsx` holds the actual page, not a wrapper), reactivity rules (no
> destructured props, memo vs effect, `<Show>`/`<For>` over `&&`/`.map`), and
> what not to do.

- **File names are kebab-case** (`tool-header.tsx`, `base-converter.ts`). The
  exported component stays PascalCase; only the filename is kebab-case.
- **`index.tsx` contains the page itself** — never a one-line delegate to
  another component.
- **Pure logic lives in `src/lib/utils/<category>/<name>.ts`** — no Solid imports,
  no DOM. Each module gets a `<name>.spec.ts` next to it (Vitest).
- **Routes live in `src/routes/<category>/<slug>.tsx`** — they import the pure
  logic and bind it to the UI with signals/memos/effects.
- **One entry per tool in `src/lib/tools/registry.ts`** — the homepage and
  category index render from this. Don't hand-write tool links elsewhere.
- **Mode pickers go in the toolbar, not in a card.** Use `ToolToolbar` /
  `ToolbarSegmented` / `ToolbarChip` from `src/components/tool-toolbar.tsx`.
  Spec + decision tree + remaining sweep candidates in
  [docs/tool-toolbar.md](docs/tool-toolbar.md). Canonical example:
  `src/routes/encoding/html-entities.tsx`.
- **URL-as-state**: when a tool has small primitive config (selected unit, mode,
  base), use `useSearchParams()` from `@solidjs/router` so links are shareable.
  See `src/routes/numbers/base-converter.tsx` for the pattern.
- **Theme tokens**: use Tailwind classes that reference theme tokens
  (`bg-background`, `text-foreground`, `border-input`, `text-muted-foreground`,
  `bg-primary`, `text-destructive`, …). Don't hand-pick raw colors — that breaks
  dark mode and makes themeing painful later.
- **Clients-side only**: every tool runs in the browser. Don't add server-side
  logic for tools.

## Adding a tool

See [docs/adding-a-tool.md](docs/adding-a-tool.md) for the full recipe. TL;DR:

1. `src/lib/utils/<category>/<name>.ts` — pure functions
2. `src/lib/utils/<category>/<name>.spec.ts` — tests
3. `src/routes/<category>/<name>.tsx` — UI
4. Append a `Tool` entry in `src/lib/tools/registry.ts` — `keywords[]` is what
   the command palette FTS hits, make it rich

Adding a unit converter (or a unit to an existing one) also requires extending
the alias map — see [docs/search.md](docs/search.md).

## Command palette

Global `Ctrl+K` / `Cmd+K`. Indexes every tool + category landing page via
MiniSearch, plus smart `mb to gb` / `kg to lb` parsing. Architecture in
[docs/search.md](docs/search.md). When adding tools, the registry entry alone
is enough — the palette picks it up.

## SEO

Per-page `<title>`, meta description, og:*, twitter:*, and `<link rel=canonical>`
are SSR-rendered via `@solidjs/meta`. Routes call `setToolPageMeta(category, slug)`
or `setPageMeta(props)` from `~/lib/seo` during component setup; the helpers wrap
`useHead` so tags are present in the initial HTML for crawlers. JSON-LD schema is
injected client-side after hydration (modern crawlers run JS).

Public sitemap lives in `public/sitemap.xml` and must be kept in sync with the
registry — there's no auto-generator.
