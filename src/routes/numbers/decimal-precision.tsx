import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { ceilTo, floorTo, roundTo, toSigFigs, truncateTo } from "~/lib/utils/numbers/precision";
import { setToolPageMeta } from "~/lib/seo";

type PrecisionMode = "round" | "floor" | "ceil" | "trunc" | "sigfigs";

const modes: Array<{ key: PrecisionMode; label: string }> = [
  { key: "round", label: "Round" },
  { key: "floor", label: "Floor" },
  { key: "ceil", label: "Ceil" },
  { key: "trunc", label: "Truncate" },
  { key: "sigfigs", label: "Sig Figs" },
];

export default function DecimalPrecision() {
  setToolPageMeta("numbers", "decimal-precision");
  const [params, setParams] = useSearchParams<{ mode?: string; places?: string }>();

  const [input, setInput] = createSignal("");

  const mode = createMemo<PrecisionMode>(() => {
    const p = params.mode;
    if (p && modes.some((m) => m.key === p)) return p as PrecisionMode;
    return "round";
  });

  const places = createMemo(() => {
    const p = parseInt(params.places ?? "2", 10);
    return isNaN(p) ? 2 : Math.min(20, Math.max(0, p));
  });

  const result = createMemo(() => {
    const n = parseFloat(input());
    if (input() === "" || isNaN(n)) return "";
    const p = places();
    switch (mode()) {
      case "round": return String(roundTo(n, p));
      case "floor": return String(floorTo(n, p));
      case "ceil": return String(ceilTo(n, p));
      case "trunc": return String(truncateTo(n, p));
      case "sigfigs": return String(toSigFigs(n, Math.max(1, p)));
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Decimal precision"
        description="Round, floor, ceil, truncate, or apply significant figures to a number."
      />

      <div class="mx-auto max-w-xl space-y-6">
        <div class="flex flex-wrap gap-2">
          <For each={modes}>
            {(m) => (
              <button
                type="button"
                class={cn(
                  "rounded-md border-2 px-4 py-1.5 text-sm font-medium transition-colors",
                  mode() === m.key
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input hover:border-primary/50 hover:bg-accent/30",
                )}
                onClick={() => setParams({ mode: m.key })}
              >
                {m.label}
              </button>
            )}
          </For>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <NumberField
            value={input()}
            onChange={setInput}
            format={false}
            class="flex flex-col gap-1"
          >
            <NumberFieldLabel>Number</NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput
                placeholder="e.g. 3.14159"
                class="font-mono"
              />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>

          <NumberField
            value={String(places())}
            onChange={(v) => setParams({ places: v })}
            minValue={0}
            maxValue={20}
            format={false}
            class="flex flex-col gap-1"
          >
            <NumberFieldLabel>
              {mode() === "sigfigs" ? "Significant figures" : "Decimal places"}
            </NumberFieldLabel>
            <NumberFieldGroup>
              <NumberFieldInput />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
        </div>

        <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-base font-semibold">Result</h2>
            <CopyButton value={result} />
          </div>
          <p class="font-mono text-2xl font-semibold tracking-tight">
            {result() || <span class="text-muted-foreground text-base font-normal">Enter a number above</span>}
          </p>
        </section>
      </div>
    </main>
  );
}
