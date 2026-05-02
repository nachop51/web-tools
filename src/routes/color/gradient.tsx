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
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { ColorInput } from "~/components/ui/color-picker";
import { Button } from "~/components/ui/button";
import { setToolPageMeta } from "~/lib/seo";
import {
  generateGradientResult,
  type GradientSpace,
  type GradientType,
} from "~/lib/utils/color/gradient";

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

type SpaceOption = { label: string; value: GradientSpace };
type TypeOption = { label: string; value: GradientType };

const SPACE_OPTIONS: SpaceOption[] = [
  { label: "OKLCH", value: "oklch" },
  { label: "HSL", value: "hsl" },
  { label: "sRGB", value: "srgb" },
];

const TYPE_OPTIONS: TypeOption[] = [
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
  { label: "Conic", value: "conic" },
];

function isSpace(s: string): s is GradientSpace {
  return ["oklch", "hsl", "srgb"].includes(s);
}

function isType(s: string): s is GradientType {
  return ["linear", "radial", "conic"].includes(s);
}

export default function GradientBuilder() {
  setToolPageMeta("color", "gradient");
  const [params, setParams] = useSearchParams<{
    stops?: string;
    space?: string;
    type?: string;
    angle?: string;
  }>();

  const initialStops = (params.stops ?? "FF0000,0000FF")
    .split(",")
    .map((s) => normalizeHex(s));

  const [stops, setStops] = createSignal<string[]>(initialStops);
  const [space, setSpace] = createSignal<GradientSpace>(
    isSpace(params.space ?? "") ? (params.space as GradientSpace) : "oklch",
  );
  const [type, setType] = createSignal<GradientType>(
    isType(params.type ?? "") ? (params.type as GradientType) : "linear",
  );
  const [angle, setAngle] = createSignal<number>(
    Number.isFinite(parseInt(params.angle ?? "")) ? parseInt(params.angle!) : 90,
  );

  function syncParams() {
    setParams({
      stops: stops()
        .map((s) => s.replace("#", ""))
        .join(","),
      space: space(),
      type: type(),
      angle: String(angle()),
    });
  }

  function setStop(i: number, value: string) {
    const next = [...stops()];
    next[i] = normalizeHex(value);
    setStops(next);
    syncParams();
  }

  function addStop() {
    setStops([...stops(), "#888888"]);
    syncParams();
  }

  function removeStop(i: number) {
    if (stops().length <= 2) return;
    setStops(stops().filter((_, idx) => idx !== i));
    syncParams();
  }

  const result = createMemo(() => generateGradientResult(stops(), space(), type(), angle()));

  const selectedSpace = createMemo(() => SPACE_OPTIONS.find((o) => o.value === space()));
  const selectedType = createMemo(() => TYPE_OPTIONS.find((o) => o.value === type()));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Gradient builder"
        description="Build linear, radial, or conic gradients with color interpolation in OKLCH, HSL, or sRGB."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Color stops</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <For each={stops()}>
              {(stop, i) => (
                <div class="flex items-end gap-2">
                  <div class="flex-1">
                    <ColorInput
                      value={stop}
                      onChange={(v) => setStop(i(), v)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStop(i())}
                    disabled={stops().length <= 2}
                    class="inline-flex h-10 items-center rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              )}
            </For>
            <Button variant="outline" onClick={addStop} class="w-full">
              + Add stop
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-3 sm:grid-cols-3">
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
                <label class="text-sm font-medium">Gradient type</label>
                <Select<TypeOption>
                  options={TYPE_OPTIONS}
                  optionValue="value"
                  optionTextValue="label"
                  value={selectedType()}
                  onChange={(opt) => {
                    if (!opt) return;
                    setType(opt.value);
                    syncParams();
                  }}
                  itemComponent={(p) => <SelectItem item={p.item}>{p.item.rawValue.label}</SelectItem>}
                >
                  <SelectTrigger class="w-full">
                    <SelectValue<TypeOption>>{(s) => s.selectedOption()?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </div>

              <Show when={type() === "linear" || type() === "conic"}>
                <NumberField
                  value={String(angle())}
                  onChange={(v) => {
                    const n = parseInt(v, 10);
                    if (!isNaN(n)) {
                      setAngle(n);
                      syncParams();
                    }
                  }}
                  minValue={0}
                  maxValue={360}
                  step={1}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Angle (deg)</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput class="font-mono" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </Show>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="min-h-32 rounded-md border border-border transition-all duration-300"
              style={{ background: result().previewCss }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>CSS</CardTitle>
              <CopyButton value={() => result().css} />
            </div>
          </CardHeader>
          <CardContent>
            <pre class="overflow-auto rounded-md bg-muted p-3 text-xs font-mono">
              {result().css}
            </pre>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
