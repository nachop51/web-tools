import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ColorInput } from "~/components/ui/color-picker";
import { generatePalette, type PaletteMode } from "~/lib/utils/color/palette";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

type ModeOption = { label: string; value: PaletteMode };

const MODE_OPTIONS: ModeOption[] = [
  { label: "Complementary", value: "complementary" },
  { label: "Triadic", value: "triadic" },
  { label: "Analogous", value: "analogous" },
  { label: "Split-complementary", value: "split-complementary" },
  { label: "Tetradic", value: "tetradic" },
  { label: "Monochromatic", value: "monochromatic" },
];

const MODES: PaletteMode[] = MODE_OPTIONS.map((o) => o.value);

function isMode(s: string): s is PaletteMode {
  return (MODES as string[]).includes(s);
}

export default function PaletteGenerator() {
  setToolPageMeta("color", "palette");
  const [params, setParams] = useSearchParams<{ c?: string; mode?: string }>();
  const initialHex = HEX_RE.test(params.c ?? "") ? normalizeHex(params.c!) : "#3B82F6";
  const initialMode: PaletteMode = isMode(params.mode ?? "")
    ? (params.mode as PaletteMode)
    : "complementary";

  const [hexInput, setHexInput] = createSignal(initialHex);
  const [mode, setMode] = createSignal<PaletteMode>(initialMode);

  const isValid = createMemo(() => HEX_RE.test(hexInput()));

  const palette = createMemo(() => (isValid() ? generatePalette(hexInput(), mode()) : []));

  const selectedOption = createMemo(() => MODE_OPTIONS.find((o) => o.value === mode()));

  function applyMode(opt: ModeOption | null) {
    if (!opt) return;
    setMode(opt.value);
    setParams({ c: hexInput().replace("#", ""), mode: opt.value });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Palette generator"
        description="Generate complementary, triadic, analogous, and other color harmony palettes."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <ColorInput
              label="Base color"
              value={hexInput()}
              onChange={(v) => {
                setHexInput(v);
                if (HEX_RE.test(v))
                  setParams({ c: normalizeHex(v).replace("#", ""), mode: mode() });
              }}
            />

            <div class="space-y-2">
              <label class="text-sm font-medium">Harmony</label>
              <Select<ModeOption>
                options={MODE_OPTIONS}
                optionValue="value"
                optionTextValue="label"
                value={selectedOption()}
                onChange={applyMode}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
                )}
              >
                <SelectTrigger class="w-full">
                  <SelectValue<ModeOption>>
                    {(state) => state.selectedOption()?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
          </CardContent>
        </Card>

        <Show when={palette().length > 0}>
          <Card>
            <CardHeader>
              <CardTitle>Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <For each={palette()}>
                  {(color) => (
                    <div class="overflow-hidden rounded-md border border-border transition-transform duration-150 hover:-translate-y-0.5">
                      <div class="h-28" style={{ "background-color": color.hex }} />
                      <div class="space-y-1 bg-card p-3">
                        <div class="flex items-center justify-between">
                          <code class="font-mono text-sm font-semibold">{color.hex}</code>
                          <CopyButton value={() => color.hex} />
                        </div>
                        <code class="block text-xs font-mono text-muted-foreground">
                          oklch({color.oklch.l} {color.oklch.c} {color.oklch.h})
                        </code>
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
