import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { fractionOp, type FractionOp } from "~/lib/utils/math/fractions";
import { setToolPageMeta } from "~/lib/seo";

const ops: Array<{ id: FractionOp; symbol: string; label: string }> = [
  { id: "add",      symbol: "+", label: "Add" },
  { id: "subtract", symbol: "−", label: "Subtract" },
  { id: "multiply", symbol: "×", label: "Multiply" },
  { id: "divide",   symbol: "÷", label: "Divide" },
];

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

export default function FractionCalculator() {
  setToolPageMeta("math", "fractions");
  const [op, setOp] = createSignal<FractionOp>("add");
  const [aN, setAN] = createSignal("1");
  const [aD, setAD] = createSignal("2");
  const [bN, setBN] = createSignal("1");
  const [bD, setBD] = createSignal("3");

  const result = createMemo(() => {
    const an = parseInt(aN()), ad = parseInt(aD());
    const bn = parseInt(bN()), bd = parseInt(bD());
    if ([an, ad, bn, bd].some(isNaN)) return null;
    if (ad === 0 || bd === 0) return null;
    try {
      return fractionOp({ num: an, den: ad }, op(), { num: bn, den: bd });
    } catch {
      return null;
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Fraction calculator"
        description="Add, subtract, multiply, and divide fractions with automatic simplification."
      />

      <div class="mb-6 flex gap-3">
        <For each={ops}>
          {(o) => (
            <button
              type="button"
              class={cn(
                "w-14 rounded-lg border-2 py-2 text-center text-xl font-bold transition-colors",
                op() === o.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setOp(o.id)}
              title={o.label}
            >
              {o.symbol}
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Fractions</h2>

          <div class="flex items-center gap-4">
            {/* Fraction A */}
            <div class="flex flex-col items-center gap-1">
              <NumberField
                value={aN()}
                onChange={setAN}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="w-20 text-center font-mono" placeholder="1" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
              <div class="h-px w-20 bg-foreground" />
              <NumberField
                value={aD()}
                onChange={setAD}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="w-20 text-center font-mono" placeholder="2" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <span class="text-2xl font-bold text-muted-foreground">
              {ops.find((o) => o.id === op())?.symbol}
            </span>

            {/* Fraction B */}
            <div class="flex flex-col items-center gap-1">
              <NumberField
                value={bN()}
                onChange={setBN}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="w-20 text-center font-mono" placeholder="1" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
              <div class="h-px w-20 bg-foreground" />
              <NumberField
                value={bD()}
                onChange={setBD}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="w-20 text-center font-mono" placeholder="3" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold">Result</h2>
            <Show when={result()}>
              <CopyButton value={() => `${result()!.num}/${result()!.den}`} />
            </Show>
          </div>
          <Show
            when={result()}
            fallback={<p class="text-sm text-muted-foreground">Enter fractions to see result.</p>}
          >
            {(r) => (
              <div class="space-y-4">
                <div class="flex flex-col items-center gap-1 py-2">
                  <span class="font-mono text-3xl font-semibold">{r().num}</span>
                  <div class="h-0.5 w-16 bg-foreground" />
                  <span class="font-mono text-3xl font-semibold">{r().den}</span>
                </div>
                <div class="divide-y divide-border rounded-lg border text-sm">
                  <div class="flex justify-between px-4 py-2">
                    <span class="text-muted-foreground">Decimal</span>
                    <span class="font-mono">{fmt(r().decimal)}</span>
                  </div>
                  <Show when={r().mixed}>
                    <div class="flex justify-between px-4 py-2">
                      <span class="text-muted-foreground">Mixed number</span>
                      <span class="font-mono">{r().mixed}</span>
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  );
}
