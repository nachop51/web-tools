---
name: Screenshots folder
description: Playwright screenshots go in /screenshots and are gitignored
type: feedback
---

Save all Playwright screenshots and design previews to `/screenshots/` at the repo root. The folder is gitignored (`.gitignore` excludes `/screenshots/` and `.playwright-mcp/`).

**Why:** User wants design captures kept locally as scratch — not committed. Confirmed by explicit instruction.

**How to apply:** Always pass `filename: "/home/nachop/dev/web-tools/screenshots/<name>.png"` to `browser_take_screenshot`. Never write screenshots to repo root or to documentation folders. After a Playwright session, delete `.playwright-mcp/` if it was created.
