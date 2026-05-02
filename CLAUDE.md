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
│   ├── ui/                       solid-ui primitives (button, card, label, separator, select, text-field, …)
│   ├── nav.tsx                   top nav (renders categories from registry)
│   ├── tool-header.tsx           tool page header (back link + title + description)
│   └── copy-button.tsx           copy-to-clipboard button
├── lib/
│   ├── utils.ts                  cn() helper
│   ├── tools/
│   │   └── registry.ts           single source of truth for categories + tools
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
4. Append a `Tool` entry in `src/lib/tools/registry.ts`

## Roadmap

[docs/roadmap.md](docs/roadmap.md) is the working backlog of tools by category.
