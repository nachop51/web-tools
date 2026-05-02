import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ColorInput } from "~/components/ui/color-picker";
import { simulateBlindness, type BlindnessType } from "~/lib/utils/color/blindness";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

const TYPES: { key: BlindnessType; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "protanopia", label: "Protanopia" },
  { key: "deuteranopia", label: "Deuteranopia" },
  { key: "tritanopia", label: "Tritanopia" },
  { key: "achromatopsia", label: "Achromatopsia" },
];

export default function ColorBlindness() {
  setToolPageMeta("color", "color-blindness");
  const [params, setParams] = useSearchParams<{ c?: string }>();
  const initial = HEX_RE.test(params.c ?? "") ? normalizeHex(params.c!) : "#3B82F6";

  const [hexInput, setHexInput] = createSignal(initial);

  const isValid = createMemo(() => HEX_RE.test(hexInput()));

  const result = createMemo(() => (isValid() ? simulateBlindness(hexInput()) : null));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color blindness"
        description="Simulate how a color appears with protanopia, deuteranopia, tritanopia, and achromatopsia."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Source color</CardTitle>
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

        <Show when={result() !== null}>
          <Card>
            <CardHeader>
              <CardTitle>Simulations</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <For each={TYPES}>
                  {(t) => (
                    <div class="space-y-1">
                      <div
                        class="h-24 rounded-md border border-border transition-transform duration-150 hover:-translate-y-0.5"
                        style={{ "background-color": result()![t.key] }}
                      />
                      <div class="text-center text-xs font-medium">{t.label}</div>
                      <div class="text-center text-[10px] font-mono text-muted-foreground">
                        {result()![t.key]}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </CardContent>
          </Card>
        </Show>
      </div>
    </main>
  );
}
