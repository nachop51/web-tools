# Adding a tool

Step-by-step recipe. Every tool follows the same pattern, so the marginal cost of
adding the next one stays small.

We'll use a hypothetical **kebab-case** string converter under
`/strings/kebab-case` as the running example.

## 1. Pure logic + tests

`src/lib/utils/strings/kebab-case.ts`:

```ts
export function toKebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}
```

`src/lib/utils/strings/kebab-case.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toKebabCase } from './kebab-case'

describe('toKebabCase', () => {
  it('converts camelCase', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world')
  })
  it('converts snake_case', () => {
    expect(toKebabCase('hello_world')).toBe('hello-world')
  })
  it('collapses whitespace', () => {
    expect(toKebabCase('Hello   World')).toBe('hello-world')
  })
})
```

Run `bun run test` to confirm it passes.

**Rule:** the logic module imports nothing from `solid-js`, `@solidjs/router`, or
the DOM. Pure functions only. This makes them trivial to test and reusable from
other tools.

## 2. Route

`src/routes/strings/kebab-case.tsx`:

```tsx
import { createMemo, createSignal } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { toKebabCase } from '~/lib/utils/strings/kebab-case'

export default function KebabCase() {
  const [input, setInput] = createSignal('')
  const output = createMemo(() => toKebabCase(input()))

  return (
    <main class="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader category="strings" name="Kebab case" description="Convert text to kebab-case." />
      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField value={input()} onChange={setInput}>
            <TextFieldTextArea rows={6} placeholder="Type here…" />
          </TextField>
        </section>
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Output</h2>
            <CopyButton value={() => output()} />
          </div>
          <TextField>
            <TextFieldTextArea readOnly value={output()} rows={6} />
          </TextField>
        </section>
      </div>
    </main>
  )
}
```

Need a primitive that isn't already in `src/components/ui/`?
`bunx solidui-cli@latest add <name>` (e.g. `dialog`, `tabs`, `tooltip`). The
component file lands in `src/components/ui/` and you own it from there.

### Idioms cheat sheet

| Need            | Pattern                                                            |
| --------------- | ------------------------------------------------------------------ |
| Local state     | `const [x, setX] = createSignal(initial)`                          |
| Derived value   | `const y = createMemo(() => f(x()))`                               |
| Side effect     | `createEffect(() => { ... })`                                      |
| Read URL params | `const [params] = useSearchParams<{...}>()` from `@solidjs/router` |
| List rendering  | `<For each={items}>{(item) => ...}</For>`                          |
| Conditional     | `<Show when={cond()}>...</Show>`                                   |
| Style classes   | `class={cn("base", flag() && "extra")}` (`cn` from `~/lib/utils`)  |

## 3. Register

Append to `src/lib/tools/registry.ts`:

```ts
{
  slug: "kebab-case",
  category: "strings",
  name: "Kebab case",
  description: "Convert text to kebab-case.",
  href: "/strings/kebab-case",
  keywords: ["case", "kebab", "string", "transform"],
}
```

The homepage, `/strings` index, AND the global Ctrl+K palette will pick it up
automatically. `keywords[]` is the highest-boosted FTS field in the palette
after `name` — make it rich (synonyms, common abbreviations, alternate
spellings). See [search.md](search.md) for the index details.

If the tool is a unit converter, also extend `src/lib/search/unit-aliases.ts`
so queries like `mb to gb` resolve to it; the alias spec will fail until you
do.

## 4. Verify

```bash
bun run dev
```

- Open `/strings` — your new tool shows up in the category index
- Open `/strings/kebab-case` — the tool loads
- Run `bun run test` — your spec runs alongside the others
- Run `bun run build` — production build succeeds

## When the tool has a mode picker

If your tool has a primary mode toggle (encode/decode, calculation mode, "solve
for", operation, etc.), put it in the **chromeless toolbar** above the
Input/Output cards — never in its own full-width card. See
[tool-toolbar.md](tool-toolbar.md) for the primitives, decision tree (segmented
vs Select vs chip), and visual rules. Canonical example:
`src/routes/encoding/html-entities.tsx`.

## When to add a UI primitive

Add solid-ui components on demand with `bunx solidui-cli@latest add <name>` —
each one lands in `src/components/ui/` as plain TSX you own. Don't hand-write a
custom primitive when solid-ui has it. The shared bits already wired up
(`Button`, `Card`, `Label`, `Separator`, `Select`, `TextField`, plus
`CopyButton` and `ToolHeader`) cover most cases.

## When to use URL params

If the tool's config is small and primitive (a few selected options, a mode), put
it in the URL via `useSearchParams()` — links become shareable. If the input is
a free-form blob (a long text, a JSON payload), keep it local; URLs aren't the
right place for that.
