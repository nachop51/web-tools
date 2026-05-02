import { createMemo, createResource, createSignal, For, Show, Suspense } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Slider, SliderFill, SliderThumb, SliderTrack } from "~/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "~/components/ui/text-field";
import { generateQrDataUrl, type QrOpts } from "~/lib/utils/code/qr";
import { setToolPageMeta } from "~/lib/seo";

type ECL = "L" | "M" | "Q" | "H";

type EclOption = { label: string; value: ECL };

const eclOptions: EclOption[] = [
  { label: "L: Low (7%)", value: "L" },
  { label: "M: Medium (15%)", value: "M" },
  { label: "Q: Quartile (25%)", value: "Q" },
  { label: "H: High (30%)", value: "H" },
];

const SIZES = [100, 150, 200, 256, 300, 400, 500, 600] as const;

export default function QrCodeTool() {
  setToolPageMeta("code", "qr-code");
  const [params, setParams] = useSearchParams<{
    text?: string;
    size?: string;
    ecl?: string;
  }>();

  const validEcl = (["L", "M", "Q", "H"] as ECL[]).includes(params.ecl as ECL)
    ? (params.ecl as ECL)
    : "M";
  const validSize = params.size ? parseInt(params.size, 10) : 256;

  const [text, setText] = createSignal(params.text ?? "");
  const [size, setSize] = createSignal(
    SIZES.includes(validSize as (typeof SIZES)[number]) ? validSize : 256,
  );
  const [ecl, setEcl] = createSignal<ECL>(validEcl);

  function handleText(v: string) {
    setText(v);
    setParams({ text: v });
  }

  function handleSize(v: number) {
    setSize(v);
    setParams({ size: String(v) });
  }

  function handleEcl(opt: EclOption | null) {
    if (!opt) return;
    setEcl(opt.value);
    setParams({ ecl: opt.value });
  }

  const opts = createMemo<QrOpts>(() => ({ size: size(), ecl: ecl() }));

  const [dataUrl] = createResource(
    () => ({ text: text(), opts: opts() }),
    ({ text, opts }) => {
      if (!text.trim()) return Promise.resolve("");
      return generateQrDataUrl(text, opts);
    },
  );

  const selectedEclOption = createMemo(
    () => eclOptions.find((o) => o.value === ecl()) ?? eclOptions[1],
  );

  function download() {
    const url = dataUrl();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="QR code generator"
        description="Generate QR codes from any text or URL with customizable size and error correction."
      />

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <TextField value={text()} onChange={handleText}>
                <TextFieldLabel>Text / URL</TextFieldLabel>
                <TextFieldInput
                  type="text"
                  placeholder="Enter text or URL to encode…"
                />
              </TextField>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Size</span>
                  <span class="text-sm font-medium">{size()}px</span>
                </div>
                <Slider
                  value={[size()]}
                  onChange={(v) => handleSize(v[0])}
                  minValue={100}
                  maxValue={600}
                  step={50}
                >
                  <SliderTrack>
                    <SliderFill />
                    <SliderThumb />
                  </SliderTrack>
                </Slider>
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>100px</span>
                  <span>600px</span>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Error correction level</label>
                <Select<EclOption>
                  options={eclOptions}
                  optionValue="value"
                  optionTextValue="label"
                  value={selectedEclOption()}
                  onChange={handleEcl}
                  itemComponent={(itemProps) => (
                    <SelectItem item={itemProps.item}>
                      {itemProps.item.rawValue.label}
                    </SelectItem>
                  )}
                >
                  <SelectTrigger class="w-full">
                    <SelectValue<EclOption>>
                      {(state) => state.selectedOption()?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div class="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Generating…
                </div>
              }
            >
              <Show
                when={dataUrl() && text().trim()}
                fallback={
                  <div class="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    Enter text to generate a QR code
                  </div>
                }
              >
                <div class="flex flex-col items-center gap-4">
                  <img
                    src={dataUrl()}
                    alt="QR code"
                    class="rounded-lg border"
                    style={{ width: `${Math.min(size(), 400)}px`, height: `${Math.min(size(), 400)}px` }}
                  />
                  <button
                    type="button"
                    onClick={download}
                    class="rounded-md border-2 border-primary bg-primary/15 px-6 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/25"
                  >
                    Download PNG
                  </button>
                </div>
              </Show>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
