import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ColorInput } from "~/components/ui/color-picker";
import {
  hexToRgb,
  type RGB,
} from "~/lib/utils/color/convert";
import {
  contrastRatio,
  wcagLevel,
  type WcagLevel,
} from "~/lib/utils/color/contrast";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function isValidHex(h: string): boolean {
  return HEX_RE.test(h);
}

function normalizeHex(h: string): string {
  return h.replace(/^#/, "").toUpperCase();
}

function toRgb(hex: string): RGB | null {
  if (!isValidHex(hex)) return null;
  return hexToRgb(hex);
}

function badgeClass(level: WcagLevel): string {
  if (level === "AAA") return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30";
  if (level === "AA") return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

export default function ContrastChecker() {
  setToolPageMeta("color", "contrast");
  const [params, setParams] = useSearchParams<{ fg?: string; bg?: string }>();

  const initialFg = isValidHex(params.fg ?? "") ? `#${normalizeHex(params.fg!)}` : "#000000";
  const initialBg = isValidHex(params.bg ?? "") ? `#${normalizeHex(params.bg!)}` : "#FFFFFF";

  const [fgInput, setFgInput] = createSignal(initialFg);
  const [bgInput, setBgInput] = createSignal(initialBg);

  const fgRgb = createMemo(() => toRgb(fgInput()));
  const bgRgb = createMemo(() => toRgb(bgInput()));

  const ratio = createMemo((): number | null => {
    const fg = fgRgb();
    const bg = bgRgb();
    if (!fg || !bg) return null;
    return contrastRatio(fg, bg);
  });

  function updateFg(v: string) {
    setFgInput(v);
    if (isValidHex(v)) setParams({ fg: normalizeHex(v) });
  }

  function updateBg(v: string) {
    setBgInput(v);
    if (isValidHex(v)) setParams({ bg: normalizeHex(v) });
  }

  const previewStyle = createMemo(() => {
    const fg = isValidHex(fgInput()) ? fgInput() : "#000000";
    const bg = isValidHex(bgInput()) ? bgInput() : "#FFFFFF";
    return { color: fg, "background-color": bg };
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Contrast checker"
        description="Calculate the WCAG 2.1 contrast ratio between two colors and show AA/AAA pass/fail badges."
      />

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <ColorInput
                label="Foreground"
                placeholder="#000000"
                value={fgInput()}
                onChange={updateFg}
              />
              <ColorInput
                label="Background"
                placeholder="#FFFFFF"
                value={bgInput()}
                onChange={updateBg}
              />
            </div>
          </CardContent>
        </Card>

        <Show when={ratio() !== null}>
          {(_) => {
            const r = ratio()!;
            const aaLarge = wcagLevel(r, "large");
            const aaaNormal = wcagLevel(r, "normal");
            const aaaNormalIs = aaaNormal === "AAA";
            const aaNormal = wcagLevel(r, "normal");

            return (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      class="rounded-md p-6 border border-border"
                      style={previewStyle()}
                    >
                      <p class="text-2xl font-bold mb-1">The quick brown fox</p>
                      <p class="text-sm">Jumps over the lazy dog. 0123456789</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-4">
                    <div class="text-center py-4">
                      <p class="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contrast ratio</p>
                      <p class="font-mono text-4xl font-bold">{r.toFixed(2)}:1</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div class="rounded-md border p-3 text-center">
                        <p class="text-xs text-muted-foreground mb-2">AA: Normal text</p>
                        <span
                          class={cn(
                            "inline-block rounded border px-2 py-0.5 text-sm font-semibold",
                            badgeClass(wcagLevel(r, "normal")),
                          )}
                        >
                          {wcagLevel(r, "normal") === "Fail" ? "Fail" : wcagLevel(r, "normal")}
                        </span>
                        <p class="mt-1 text-xs text-muted-foreground">≥ 4.5:1</p>
                      </div>
                      <div class="rounded-md border p-3 text-center">
                        <p class="text-xs text-muted-foreground mb-2">AA: Large text</p>
                        <span
                          class={cn(
                            "inline-block rounded border px-2 py-0.5 text-sm font-semibold",
                            badgeClass(wcagLevel(r, "large")),
                          )}
                        >
                          {wcagLevel(r, "large") === "Fail" ? "Fail" : wcagLevel(r, "large")}
                        </span>
                        <p class="mt-1 text-xs text-muted-foreground">≥ 3:1</p>
                      </div>
                      <div class="rounded-md border p-3 text-center">
                        <p class="text-xs text-muted-foreground mb-2">AAA: Normal text</p>
                        <span
                          class={cn(
                            "inline-block rounded border px-2 py-0.5 text-sm font-semibold",
                            badgeClass(r >= 7 ? "AAA" : "Fail"),
                          )}
                        >
                          {r >= 7 ? "AAA" : "Fail"}
                        </span>
                        <p class="mt-1 text-xs text-muted-foreground">≥ 7:1</p>
                      </div>
                      <div class="rounded-md border p-3 text-center">
                        <p class="text-xs text-muted-foreground mb-2">AAA: Large text</p>
                        <span
                          class={cn(
                            "inline-block rounded border px-2 py-0.5 text-sm font-semibold",
                            badgeClass(r >= 4.5 ? "AAA" : "Fail"),
                          )}
                        >
                          {r >= 4.5 ? "AAA" : "Fail"}
                        </span>
                        <p class="mt-1 text-xs text-muted-foreground">≥ 4.5:1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          }}
        </Show>
      </div>
    </main>
  );
}
