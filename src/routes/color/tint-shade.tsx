import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ColorInput } from "~/components/ui/color-picker";
import { generateScale } from "~/lib/utils/color/scale";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

export default function TintShade() {
  setToolPageMeta("color", "tint-shade");
  const [params, setParams] = useSearchParams<{ c?: string }>();
  const initial = HEX_RE.test(params.c ?? "") ? normalizeHex(params.c!) : "#3B82F6";

  const [hexInput, setHexInput] = createSignal(initial);

  const isValid = createMemo(() => HEX_RE.test(hexInput()));

  const scale = createMemo(() => (isValid() ? generateScale(hexInput()) : []));

  const jsObject = createMemo(() => {
    const stops = scale();
    if (stops.length === 0) return "";
    const lines = stops.map((s) => `  ${s.step}: "${s.hex}",`).join("\n");
    return `{\n${lines}\n}`;
  });

  const cssVars = createMemo(() => {
    const stops = scale();
    if (stops.length === 0) return "";
    return stops.map((s) => `  --color-${s.step}: ${s.hex};`).join("\n");
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Tint / shade scale"
        description="Generate a Tailwind-style 11-step tint and shade scale in OKLCH colorspace."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Base color</CardTitle>
          </CardHeader>
          <CardContent>
            <ColorInput
              label="HEX"
              value={hexInput()}
              onChange={(v) => {
                setHexInput(v);
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace("#", "") });
              }}
            />
          </CardContent>
        </Card>

        <Show when={scale().length > 0}>
          <Card>
            <CardHeader>
              <CardTitle>Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
                <For each={scale()}>
                  {(stop) => (
                    <div class="flex flex-col gap-1">
                      <div
                        class="h-20 rounded-md border border-border transition-transform duration-150 hover:scale-[1.03]"
                        style={{ "background-color": stop.hex }}
                      />
                      <div class="text-center font-mono text-xs font-semibold">{stop.step}</div>
                      <div class="text-center font-mono text-[10px] text-muted-foreground">
                        {stop.hex}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">JS object</span>
                  <CopyButton value={jsObject} />
                </div>
                <pre class="overflow-auto rounded-md bg-muted p-3 text-xs font-mono">
                  {jsObject()}
                </pre>
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">CSS variables</span>
                  <CopyButton value={cssVars} />
                </div>
                <pre class="overflow-auto rounded-md bg-muted p-3 text-xs font-mono">
                  {cssVars()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </Show>
      </div>
    </main>
  );
}
