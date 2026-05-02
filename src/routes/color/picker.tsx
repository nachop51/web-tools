import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
  TextFieldErrorMessage,
} from "~/components/ui/text-field";
import { ColorPicker as ColorPickerWidget } from "~/components/ui/color-picker";
import { hexToRgb, rgbToHsl, rgbToOklch } from "~/lib/utils/color/convert";
import { setToolPageMeta } from "~/lib/seo";

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`;
}

export default function ColorPicker() {
  setToolPageMeta("color", "picker");
  const [params, setParams] = useSearchParams<{ c?: string }>();
  const initial = HEX_RE.test(params.c ?? "") ? normalizeHex(params.c!) : "#3B82F6";

  const [hexValue, setHexValue] = createSignal(initial);

  const isValid = createMemo(() => HEX_RE.test(hexValue()));

  const rgb = createMemo(() => (isValid() ? hexToRgb(hexValue()) : null));
  const hsl = createMemo(() => {
    const r = rgb();
    return r ? rgbToHsl(r) : null;
  });
  const oklch = createMemo(() => {
    const r = rgb();
    return r ? rgbToOklch(r) : null;
  });

  const hexStr = createMemo(() => (isValid() ? normalizeHex(hexValue()) : ""));
  const rgbStr = createMemo(() => {
    const r = rgb();
    return r ? `rgb(${r.r}, ${r.g}, ${r.b})` : "";
  });
  const hslStr = createMemo(() => {
    const h = hsl();
    return h ? `hsl(${h.h}, ${h.s}%, ${h.l}%)` : "";
  });
  const oklchStr = createMemo(() => {
    const ok = oklch();
    return ok ? `oklch(${ok.l} ${ok.c} ${ok.h})` : "";
  });

  const formats = [
    { label: "HEX", value: hexStr },
    { label: "RGB", value: rgbStr },
    { label: "HSL", value: hslStr },
    { label: "OKLCH", value: oklchStr },
  ];

  function applyHex(v: string) {
    const norm = normalizeHex(v);
    setHexValue(norm);
    setParams({ c: norm.replace("#", "") });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color picker"
        description="Pick a color visually and copy it as HEX, RGB, HSL, or OKLCH."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pick a color</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <ColorPickerWidget
              value={isValid() ? hexValue() : "#3B82F6"}
              onChange={(hex) => applyHex(hex)}
            />
            <TextField
              value={hexValue()}
              onChange={(v) => {
                setHexValue(v);
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace("#", "") });
              }}
              validationState={hexValue().length > 0 && !isValid() ? "invalid" : "valid"}
            >
              <TextFieldLabel>HEX</TextFieldLabel>
              <div class="flex items-center gap-2">
                <TextFieldInput type="text" placeholder="#3B82F6" class="font-mono uppercase" />
                <CopyButton value={() => hexValue()} />
              </div>
              <Show when={hexValue().length > 0 && !isValid()}>
                <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
              </Show>
            </TextField>
          </CardContent>
        </Card>

        <Show when={isValid()}>
          <Card>
            <CardHeader>
              <CardTitle>Color formats</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <For each={formats}>
                {(fmt) => (
                  <div class="flex items-center justify-between gap-4">
                    <span class="w-16 text-sm font-mono text-muted-foreground">{fmt.label}</span>
                    <code class="flex-1 rounded bg-muted px-2 py-1 text-sm font-mono">
                      {fmt.value()}
                    </code>
                    <CopyButton value={fmt.value} />
                  </div>
                )}
              </For>
            </CardContent>
          </Card>
        </Show>
      </div>
    </main>
  );
}
