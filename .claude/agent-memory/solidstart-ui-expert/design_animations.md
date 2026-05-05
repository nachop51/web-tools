---
name: Animation utilities
description: Reusable CSS animations defined in app.css — fade-up, fade-in, copy-pulse, anim-stagger
type: project
---

Animation utilities live in `src/app.css` under `@layer utilities`:
- `.anim-fade-up` — 200ms entrance (opacity + 6px translateY); use on result reveals, header mounts.
- `.anim-fade-in` — 160ms simple opacity fade.
- `.anim-stagger` — combine with `.anim-fade-up` and inline `style={{ "--stagger": String(i()) }}` to delay grid items by `60ms + i * 40ms`. The 60ms base offset lets the page header lead the cascade so the title doesn't animate alone.
- `.anim-copy-pulse` — 380ms violet ring pulse; toggled on the CopyButton when `copied()` is true.
- `.accent-underline` — background-size grow from 0% to 100% used for tab/link underlines (transitions).

Durations sit in 120–220ms with `cubic-bezier(0.2, 0, 0.2, 1)` (snappy, not bouncy). Reduced-motion users get near-zero durations via the `@media (prefers-reduced-motion)` block.

**Why:** User asked for snappy, purposeful motion — not gratuitous. These utilities give consistent timing/easing across the app so individual tools don't reinvent durations.

**How to apply:** Use `.anim-fade-up` whenever a reactive output container becomes truthy via `<Show>`. Don't animate per-keystroke updates — only mount/unmount transitions. For grid stagger, set `--stagger` from the `<For>` index.
