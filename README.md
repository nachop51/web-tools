# web-tools

A collection of small, fast, client-side developer utilities. Every tool runs
entirely in the browser; deep links via URL search params make tool
configurations shareable.

Built with **SolidStart** + **Tailwind CSS 4**.

## Quickstart

```bash
bun install
bun run dev      # http://localhost:5173
```

Other scripts:

```bash
bun run build    # production build
bun run test     # vitest unit tests for pure logic modules
```

Requires Node ≥ 22 (or bun ≥ 1.x).

## Tools

Eighty-plus tools across eleven categories:

- **Numbers** — base converter, Roman numerals, number-to-words, random number,
  decimal precision, percentage, GCF/LCM
- **Units** — length, mass, temperature, time, data, speed, volume, area,
  energy, pressure, angle, power
- **Strings** — count, case, slugify, trim, sort lines, find/replace, escape,
  reverse, diff
- **Encoding** — Base64, Base32, Base58, URL, HTML entities, hash, JWT, binary,
  Morse, Caesar
- **Datetime** — Unix timestamp, duration, cron preview, date diff, date add
- **Code** — JSON, UUID, fake data, regex, secret/passphrase, ASCII table, URL
  parser, YAML ↔ JSON, QR code
- **Color** — converter, contrast, picker, tint/shade, palette, gradient, color
  blindness, APCA, mixer, named colors
- **Math** — percentage, fractions, ratio, factorial/combinations, quadratic,
  scientific notation, modulo
- **Finance** — tip, discount, simple interest, compound interest, salary
- **Geometry** — circle, rectangle, triangle, Pythagorean
- **Electrical** — Ohm's law, power, amps/watts/volts

The registry at `src/lib/tools/registry.ts` is the single source of truth.

## Project layout

See [CLAUDE.md](CLAUDE.md) for conventions and folder structure, and
[docs/adding-a-tool.md](docs/adding-a-tool.md) for the step-by-step recipe to add
a new tool.

## License

MIT.
