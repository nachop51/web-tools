import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
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
import { calculatePercentage, percentageModes, type PercentageMode } from "~/lib/utils/math/percentage";
import { setToolPageMeta } from "~/lib/seo";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

export default function PercentageCalculator() {
  setToolPageMeta("math", "percentage");
  const [params, setParams] = useSearchParams<{ mode?: string }>();
  const [a, setA] = createSignal("");
  const [b, setB] = createSignal("");

  const mode = createMemo<PercentageMode>(() => {
    const p = params.mode;
    if (p && percentageModes.find((m) => m.id === p)) return p as PercentageMode;
    return "of";
  });

  const config = createMemo(() => percentageModes.find((m) => m.id === mode())!);

  const result = createMemo(() => {
    const na = parseFloat(a());
    const nb = parseFloat(b());
    if (isNaN(na) || isNaN(nb)) return null;
    try {
      return calculatePercentage(mode(), na, nb);
    } catch {
      return null;
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Percentage calculator"
        description="Calculate percentages: find % of a number, % change, increase, decrease, error, and reverse."
      />

      <div class="mb-6 flex flex-wrap gap-2">
        <For each={percentageModes}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                mode() === m.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => { setParams({ mode: m.id }); setA(""); setB(""); }}
            >
              {m.label}
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Input</h2>
          <div class="space-y-4">
            <NumberField
              value={a()}
              onChange={setA}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>{config().inputA}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="0" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={b()}
              onChange={setB}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>{config().inputB}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="0" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <p class="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-3 py-2">
              Formula: {config().formula}
            </p>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold">Result</h2>
            <Show when={result() !== null}>
              <CopyButton value={() => fmt(result()!)} />
            </Show>
          </div>
          <Show
            when={result() !== null}
            fallback={<p class="text-sm text-muted-foreground">Enter values to see result.</p>}
          >
            <div class="rounded-lg bg-muted/50 p-6 text-center font-mono text-3xl font-semibold">
              {fmt(result()!)}
            </div>
          </Show>
        </section>
      </div>
    </main>
  );
}
