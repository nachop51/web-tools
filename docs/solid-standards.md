# Solid + SolidStart standards

Read this before touching any `.tsx` in `src/`. Rules here override defaults.

## File and folder naming

- **All component files are kebab-case**: `tool-header.tsx`, `copy-button.tsx`,
  `category-index.tsx`. Never `ToolHeader.tsx`. The component _export_ stays
  PascalCase (`export function ToolHeader`); only the filename is kebab-case.
- Pure-logic modules are kebab-case too: `base-converter.ts`, `kebab-case.ts`.
- Test files sit next to source: `<name>.spec.ts`.
- Folders are lowercase, single-word where possible (`numbers`, `strings`,
  `encoding`). Multi-word folders use kebab-case.

## Route structure

- **`index.tsx` must contain the actual page structure.** Do not write
  `index.tsx` as a one-line wrapper that delegates to another component
  (e.g. `return <CategoryIndex id="numbers" />`). The page lives in the route
  file. Shared building blocks belong in `src/components/`, but the _page_
  (layout, headings, data wiring) is authored in `index.tsx` itself.
- One route file = one default-exported page component.
- Co-locate route-specific helpers in the same file unless they're reused.
- File-based routing rules: `src/routes/<category>/<slug>.tsx` →
  `/<category>/<slug>`. Route groups use `(name)` parens to organize without
  affecting the URL.
- Use `<A>` from `@solidjs/router` for internal links, never raw `<a href>`.

## Reactivity rules

These are the ones that actually bite in Solid. Internalize them.

### Never destructure props

Destructuring breaks reactivity: you capture the value at render time and lose
the live binding.

```tsx
// BAD: `value` is frozen at first render
function Field({ value, label }: Props) {
  return <input value={value} />
}

// GOOD: read through props, or alias to an accessor
function Field(props: Props) {
  return <input value={props.value} />
}
```

If you need to pass a prop into a helper that expects a function, wrap it:
`const value = () => props.value`. The same applies to `splitProps` /
`mergeProps`. Use those instead of `{ ...rest }` destructuring when forwarding.

### Signals, memos, derived values

- **`createSignal`** for local mutable state.
- **Inline derived values** (`() => a() + b()`) are fine for cheap, single-use
  reads.
- **`createMemo`** when the derivation is expensive _or_ read in multiple places
  (memos cache; plain derived functions re-run per call site).
- **`createEffect`** only for side effects (DOM imperative work, syncing to
  storage, logging). Never for deriving values; use a memo.
- **`createStore`** when state is a nested object/array you mutate granularly.
  For flat primitives, prefer signals.
- **`batch(() => { ... })`** when updating multiple signals together so
  dependent memos/effects fire once.
- **`untrack(() => ...)`** to read a signal inside an effect/memo without
  subscribing to it.

### Control flow components

Don't use `&&`, ternaries, or `.map()` in JSX for reactive content; they
re-execute the entire branch on each change and lose Solid's fine-grained
updates.

| Need               | Use                                              |
| ------------------ | ------------------------------------------------ |
| Conditional render | `<Show when={cond()} fallback={...}>`            |
| Multi-branch       | `<Switch><Match when={...}>...</Match></Switch>` |
| List               | `<For each={items()}>{(item) => ...}</For>`      |
| Keyed list (rare)  | `<Index each={items()}>{(item) => ...}</Index>`  |
| Lazy component     | `lazy(() => import("./x"))` + `<Suspense>`       |

`<For>` keys by reference (efficient for stable lists). `<Index>` keys by
position (use when items mutate in place).

### Event handlers

- `onClick={fn}`: `fn` runs as written; do not wrap in `() => fn()` unless you
  need a closure.
- For inputs use `onInput` (fires per keystroke), not `onChange` (fires on
  blur, different from React).
- `e.currentTarget.value` is properly typed; prefer it over `e.target.value`.

### Refs

`let el!: HTMLDivElement; <div ref={el}>`: refs are assigned synchronously
_after_ mount. Read them inside `onMount` or an effect, not during render.

## Async and data

- **`createAsync(() => getX())`** + **`query(...)`** for route-level data.
- **`createResource`** for component-local async.
- Wrap async reads in **`<Suspense fallback={...}>`**; never read an unresolved
  resource into a string.
- **`<ErrorBoundary>`** around resources you don't trust to succeed.

This codebase is client-side-only (tools don't fetch from a backend), so most
pages won't need any of this. Use it only when a tool genuinely needs async
work (e.g. importing a heavy library on demand).

## URL-as-state

When tool config is small and primitive (selected unit, mode, base), use
`useSearchParams()` from `@solidjs/router` so the URL is shareable. Keep
free-form blobs (long text, JSON payloads) in local signals; URLs are the
wrong place for those.

## Styling

- Use Tailwind classes that reference theme tokens (`bg-background`,
  `text-foreground`, `border-input`, `text-muted-foreground`, `bg-primary`,
  `text-destructive`). Don't hand-pick raw colors; that breaks dark mode.
- `class={cn("base", flag() && "extra")}`: `cn` from `~/lib/utils`.
- Solid uses `class`, not `className`. Multiple class sources: `classList={{}}`.

## What not to do

- Don't add server-side logic (`"use server"`, server functions, API routes).
  Tools run in the browser.
- Don't introduce a state-management library; signals + stores cover it.
- Don't reach for `createEffect` to derive values; that's a memo.
- Don't `console.log` inside render; it'll run every reactive update.
- Don't add a UI primitive to `src/components/ui/` unless ≥2 tools will use it.
