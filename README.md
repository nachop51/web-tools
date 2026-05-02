# web-tools

A growing collection of small, fast, client-side developer utilities: number
conversions, unit conversions, string transforms, encoding tools, and more.

Built with **SolidStart** + **Tailwind CSS 4**. Every tool runs entirely in the
browser; deep links via URL search params make tool configurations shareable.

## Quickstart

```bash
bun install
bun run dev      # http://localhost:5173
```

Other scripts:

```bash
bun run build    # production build (SSR + SSG-ready)
bun run test     # vitest unit tests for pure logic modules
```

Requires Node ≥ 22 (or bun ≥ 1.x).

## Tools

### Numbers
- **[Base converter](/numbers/base-converter)**: convert between binary, octal,
  decimal, hexadecimal, and any custom base from 2 to 36. Supports INT, INT32,
  FLOAT32, and FLOAT64 modes.

More on the way. See [docs/roadmap.md](docs/roadmap.md) for the full backlog.

## Project layout

See [CLAUDE.md](CLAUDE.md) for conventions and folder structure, and
[docs/adding-a-tool.md](docs/adding-a-tool.md) for the step-by-step recipe to add
a new tool.

## License

MIT.
