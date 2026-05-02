import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ColorInput } from "~/components/ui/color-picker";
import { apcaContrast, APCA_LEVELS } from "~/lib/utils/color/apca";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

function isValidHex(h: string): boolean {
  return HEX_RE.test(h);
}

export default function ApcaContrast() {
  setToolPageMeta("color", "apca");
  const [params, setParams] = useSearchParams<{ fg?: string; bg?: string }>();

  const initialFg = isValidHex(params.fg ?? "") ? normalizeHex(params.fg!) : "#000000";
  const initialBg = isValidHex(params.bg ?? "") ? normalizeHex(params.bg!) : "#FFFFFF";

  const [fgInput, setFgInput] = createSignal(initialFg);
  const [bgInput, setBgInput] = createSignal(initialBg);

  const isFgValid = createMemo(() => isValidHex(fgInput()));
  const isBgValid = createMemo(() => isValidHex(bgInput()));

  const lc = createMemo(() => {
    if (!isFgValid() || !isBgValid()) return null;
    return apcaContrast(fgInput(), bgInput());
  });

  const polarity = createMemo(() => {
    const v = lc();
    if (v === null) return "";
    if (v > 0) return "Dark text on light background";
    if (v < 0) return "Light text on dark background";
    return "No contrast";
  });

  function updateFg(v: string) {
    const norm = v.startsWith("#") ? v.toUpperCase() : v;
    setFgInput(norm);
    if (isValidHex(norm)) setParams({ fg: norm.replace(/^#/, ""), bg: bgInput().replace(/^#/, "") });
  }

  function updateBg(v: string) {
    const norm = v.startsWith("#") ? v.toUpperCase() : v;
    setBgInput(norm);
    if (isValidHex(norm)) setParams({ fg: fgInput().replace(/^#/, ""), bg: norm.replace(/^#/, "") });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="APCA contrast"
        description="Calculate the APCA (WCAG 3 draft) Lc contrast value for text readability."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 sm:grid-cols-2">
              <ColorInput
                label="Foreground (text)"
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

        <Show when={lc() !== null}>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                class="rounded-md border border-border p-6"
                style={{ color: fgInput(), "background-color": bgInput() }}
              >
                <p class="mb-1 text-2xl font-bold">Sample text on background</p>
                <p class="text-sm">The quick brown fox jumps over the lazy dog. 0123456789</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="py-4 text-center">
                <p class="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  APCA Lc value
                </p>
                <p class="font-mono text-4xl font-bold">{lc()!.toFixed(2)}</p>
                <p class="mt-1 text-sm text-muted-foreground">{polarity()}</p>
              </div>

              <div class="grid gap-2 sm:grid-cols-2">
                <For each={APCA_LEVELS}>
                  {(level) => {
                    const passes = createMemo(() => Math.abs(lc()!) >= level.threshold);
                    return (
                      <div
                        class={cn(
                          "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
                          passes()
                            ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                            : "bg-destructive/15 text-destructive border-destructive/30",
                        )}
                      >
                        <div>
                          <p class="font-mono text-sm font-semibold">{level.label}</p>
                          <p class="text-xs opacity-80">{level.description}</p>
                        </div>
                        <span class="text-xs font-bold uppercase">
                          {passes() ? "Pass" : "Fail"}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </div>
            </CardContent>
          </Card>
        </Show>
      </div>
    </main>
  );
}
