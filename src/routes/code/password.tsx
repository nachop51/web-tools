import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { Checkbox, CheckboxLabel } from "~/components/ui/checkbox";
import { Slider, SliderFill, SliderThumb, SliderTrack } from "~/components/ui/slider";
import { cn } from "~/lib/utils";
import { calcEntropy, generatePassword, strengthLabel } from "~/lib/utils/code/password";
import { setToolPageMeta } from "~/lib/seo";

const STRENGTH_COLORS: Record<string, string> = {
  "Weak": "text-destructive",
  "Fair": "text-yellow-500",
  "Strong": "text-green-500",
  "Very strong": "text-primary",
};

export default function PasswordGenerator() {
  setToolPageMeta("code", "password");
  const [params, setParams] = useSearchParams<{
    len?: string;
    upper?: string;
    lower?: string;
    digits?: string;
    symbols?: string;
  }>();

  const [length, setLength] = createSignal(Number(params.len) || 16);
  const [upper, setUpper] = createSignal(params.upper !== "0");
  const [lower, setLower] = createSignal(params.lower !== "0");
  const [digits, setDigits] = createSignal(params.digits !== "0");
  const [symbols, setSymbols] = createSignal(params.symbols === "1");
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [password, setPassword] = createSignal("");

  function syncParams() {
    setParams({
      len: String(length()),
      upper: upper() ? "1" : "0",
      lower: lower() ? "1" : "0",
      digits: digits() ? "1" : "0",
      symbols: symbols() ? "1" : "0",
    });
  }

  function generate() {
    setPassword(
      generatePassword({
        length: length(),
        upper: upper(),
        lower: lower(),
        digits: digits(),
        symbols: symbols(),
      }),
    );
  }

  createEffect(() => {
    if (autoRefresh()) {
      length(); upper(); lower(); digits(); symbols();
      generate();
    }
  });

  const charsetSize = createMemo(() => {
    let n = 0;
    if (upper()) n += 26;
    if (lower()) n += 26;
    if (digits()) n += 10;
    if (symbols()) n += 28;
    return n;
  });

  const entropy = createMemo(() => calcEntropy(charsetSize(), length()));
  const strength = createMemo(() => strengthLabel(entropy()));

  const checkboxDefs = [
    { label: "Uppercase A–Z", get: upper, set: setUpper },
    { label: "Lowercase a–z", get: lower, set: setLower },
    { label: "Digits 0–9",    get: digits, set: setDigits },
    { label: "Symbols !@#$",  get: symbols, set: setSymbols },
  ];

  return (
    <main class="w-full max-w-xl py-10">
      <ToolHeader
        category="code"
        name="Password generator"
        description="Generate secure passwords with configurable length and character sets."
      />

      <div class="space-y-6">
        <div class="rounded-xl border bg-card p-5 shadow-sm space-y-5">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Length</span>
              <span class="font-mono text-sm font-semibold">{length()}</span>
            </div>
            <Slider
              value={[length()]}
              onChange={(v) => { setLength(v[0]); syncParams(); }}
              minValue={8}
              maxValue={128}
            >
              <SliderTrack>
                <SliderFill />
                <SliderThumb />
              </SliderTrack>
            </Slider>
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>8</span>
              <span>128</span>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium">Character sets</p>
            <For each={checkboxDefs}>
              {(def) => (
                <Checkbox
                  checked={def.get()}
                  onChange={(v) => { def.set(v); syncParams(); }}
                >
                  <CheckboxLabel>{def.label}</CheckboxLabel>
                </Checkbox>
              )}
            </For>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={generate}
            >
              Generate
            </button>
            <button
              type="button"
              class={cn(
                "rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors",
                autoRefresh()
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50",
              )}
              onClick={() => setAutoRefresh((v) => !v)}
            >
              Auto-refresh
            </button>
          </div>
        </div>

        <div class="rounded-xl border bg-card p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold">Password</h2>
            <CopyButton value={() => password()} />
          </div>
          <Show
            when={password()}
            fallback={
              <p class="text-sm text-muted-foreground">Click Generate to create a password.</p>
            }
          >
            <p class="break-all rounded-md bg-muted/40 px-3 py-2 font-mono text-sm">{password()}</p>
          </Show>
          <Show when={charsetSize() > 0 && password()}>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-muted-foreground">Entropy:</span>
              <span class="font-mono">{entropy().toFixed(1)} bits</span>
              <span class={cn("font-semibold", STRENGTH_COLORS[strength()])}>
                {strength()}
              </span>
            </div>
          </Show>
        </div>
      </div>
    </main>
  );
}
