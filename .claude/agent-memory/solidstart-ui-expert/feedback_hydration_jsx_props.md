---
name: Hydration mismatch from JSX-as-prop with Show
description: Passing JSX-element children through a prop while wrapping them in <Show> caused getNextElement hydration failure on a Kobalte-using page.
type: feedback
---

When prototyping the html-entities dual-pane, factoring a `<Pane>` sub-component that received JSX via a `headerExtra?: JSX.Element` prop and rendered it via `<Show when={props.headerExtra}>{props.headerExtra}</Show>` produced a hydration crash deep inside Kobalte's TextFieldRoot (`getNextElement` failure in `createDynamic`). The page rendered on SSR but blanked out on hydration.

**Why:** Solid's hydration walks SSR markers in tree order. Wrapping a JSX child in an inner Show *and* passing that JSX through a separate component boundary creates an extra createComponent context whose marker layout doesn't always line up with what SSR emitted — especially when the inner component (Kobalte primitive) itself uses Show/Switch.

**How to apply:** When a sub-component might host conditionally-rendered Kobalte/solid-ui primitives, prefer inlining the JSX in the parent over passing JSX-children through a prop. If you do need a sub-component, render the prop directly (`{props.headerExtra}`) without an enclosing `<Show>` — let the *caller* wrap with Show if needed. This applies to any tool route mixing Kobalte primitives with conditional layout.

Detected via: in dev, the @solidjs/start dev-overlay logs an opaque `Error @ dev-overlay/index.jsx:14` plus a `SourceMapConsumer` syntax error (the overlay's source-map-js import is broken under Vite 7). To get the real stack, wrap the page body in a temporary `<ErrorBoundary fallback={(err) => <pre>{err.stack}</pre>}>` — the dev-overlay's own bug masks the real error otherwise.
