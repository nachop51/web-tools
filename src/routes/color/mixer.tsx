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
import { Slider, SliderFill, SliderThumb, SliderTrack } from "~/components/ui/slider";
import { mixColors, getGradientStrip, type MixSpace } from "~/lib/utils/color/mixer";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

function isValid(h: string): boolean {
  return HEX_RE.test(h);
}

type SpaceOption = { label: string; value: MixSpace };

const SPACE_OPTIONS: SpaceOption[] = [
  { label: "OKLCH (perceptual)", value: "oklch" },
  { label: "HSL", value: "hsl" },
  { label: "sRGB", value: "srgb" },
];

function isSpace(s: string): s is MixSpace {
  return ["oklch", "hsl", "srgb"].includes(s);
}

export default function ColorMixer() {
  setToolPageMeta("color", "mixer");
  const [params, setParams] = useSearchParams<{
    a?: string;
    b?: string;
    r?: string;
    space?: string;
  }>();

  const initialA = isValid(params.a ?? "") ? normalizeHex(params.a!) : "#FF6B6B";
  const initialB = isValid(params.b ?? "") ? normalizeHex(params.b!) : "#4ECDC4";
  const initialR = Number.isFinite(parseInt(params.r ?? ""))
    ? Math.max(0, Math.min(100, parseInt(params.r!)))
    : 50;
  const initialSpace: MixSpace = isSpace(params.space ?? "")
    ? (params.space as MixSpace)
    : "oklch";

  const [colorA, setColorA] = createSignal(initialA);
  const [colorB, setColorB] = createSignal(initialB);
  const [ratio, setRatio] = createSignal(initialR);
  const [space, setSpace] = createSignal<MixSpace>(initialSpace);

  function syncParams() {
    setParams({
      a: colorA().replace("#", ""),
      b: colorB().replace("#", ""),
      r: String(ratio()),
      space: space(),
    });
  }

  const aValid = createMemo(() => isValid(colorA()));
  const bValid = createMemo(() => isValid(colorB()));

  const result = createMemo(() => {
    if (!aValid() || !bValid()) return null;
    return mixColors(colorA(), colorB(), ratio(), space());
  });

  const strip = createMemo(() => {
    if (!aValid() || !bValid()) return [];
    return getGradientStrip(colorA(), colorB(), space(), 7);
  });

  const selectedSpace = createMemo(() => SPACE_OPTIONS.find((o) => o.value === space()));

  const hexStr = createMemo(() => result()?.hex ?? "");
  const rgbStr = createMemo(() => {
    const r = result();
    return r ? `rgb(${r.rgb.r}, ${r.rgb.g}, ${r.rgb.b})` : "";
  });
  const hslStr = createMemo(() => {
    const r = result();
    return r ? `hsl(${r.hsl.h}, ${r.hsl.s}%, ${r.hsl.l}%)` : "";
  });
  const oklchStr = createMemo(() => {
    const r = result();
    return r ? `oklch(${r.oklch.l} ${r.oklch.c} ${r.oklch.h})` : "";
  });

  const formats = [
    { label: "HEX", value: hexStr },
    { label: "RGB", value: rgbStr },
    { label: "HSL", value: hslStr },
    { label: "OKLCH", value: oklchStr },
  ];

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color mixer"
        description="Mix two colors at any ratio in OKLCH, HSL, or sRGB with a live gradient preview."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 sm:grid-cols-2">
              <ColorInput
                label="Color A"
                placeholder="#FF6B6B"
                value={colorA()}
                onChange={(v) => {
                  setColorA(v);
                  if (isValid(v)) syncParams();
                }}
              />
              <ColorInput
                label="Color B"
                placeholder="#4ECDC4"
                value={colorB()}
                onChange={(v) => {
                  setColorB(v);
                  if (isValid(v)) syncParams();
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mix</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Color space</label>
              <Select<SpaceOption>
                options={SPACE_OPTIONS}
                optionValue="value"
                optionTextValue="label"
                value={selectedSpace()}
                onChange={(opt) => {
                  if (!opt) return;
                  setSpace(opt.value);
                  syncParams();
                }}
                itemComponent={(p) => <SelectItem item={p.item}>{p.item.rawValue.label}</SelectItem>}
              >
                <SelectTrigger class="w-full">
                  <SelectValue<SpaceOption>>{(s) => s.selectedOption()?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Mix ratio</span>
                <span class="font-mono text-sm">
                  {100 - ratio()}% A · {ratio()}% B
                </span>
              </div>
              <Slider
                value={[ratio()]}
                onChange={(v) => {
                  setRatio(v[0]);
                  syncParams();
                }}
                minValue={0}
                maxValue={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFill />
                  <SliderThumb />
                </SliderTrack>
              </Slider>
            </div>

            <Show when={strip().length > 0}>
              <div class="flex h-8 overflow-hidden rounded-md border border-border">
                <For each={strip()}>
                  {(c) => <div class="flex-1" style={{ "background-color": c }} />}
                </For>
              </div>
            </Show>
          </CardContent>
        </Card>

        <Show when={result() !== null}>
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div
                class="h-24 rounded-md border border-border transition-colors duration-200"
                style={{ "background-color": result()!.hex }}
              />
              <div class="space-y-2">
                <For each={formats}>
                  {(fmt) => (
                    <div class="flex items-center justify-between gap-4">
                      <span class="w-16 text-sm font-mono text-muted-foreground">
                        {fmt.label}
                      </span>
                      <code class="flex-1 rounded bg-muted px-2 py-1 text-sm font-mono">
                        {fmt.value()}
                      </code>
                      <CopyButton value={fmt.value} />
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
