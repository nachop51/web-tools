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
import { factorial, factorialSteps, permutation, combination } from "~/lib/utils/math/factorial";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "factorial" | "permutation" | "combination";
const modes: Array<{ id: Mode; label: string; symbol: string }> = [
  { id: "factorial",   label: "Factorial",   symbol: "n!" },
  { id: "permutation", label: "Permutation", symbol: "nPr" },
  { id: "combination", label: "Combination", symbol: "nCr" },
];

export default function FactorialCalculator() {
  setToolPageMeta("math", "factorial");
  const [params, setParams] = useSearchParams<{ mode?: string }>();
  const mode = createMemo<Mode>(() => {
    const p = params.mode;
    if (p === "permutation" || p === "combination") return p;
    return "factorial";
  });

  const [n, setN] = createSignal("5");
  const [r, setR] = createSignal("2");

  const result = createMemo(() => {
    const nv = parseInt(n());
    if (isNaN(nv) || nv < 0) return null;
    try {
      if (mode() === "factorial") return { value: factorial(nv), steps: factorialSteps(nv) };
      const rv = parseInt(r());
      if (isNaN(rv) || rv < 0) return null;
      const value = mode() === "permutation" ? permutation(nv, rv) : combination(nv, rv);
      return { value, steps: [] };
    } catch {
      return null;
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Factorial & combinations"
        description="Calculate n!, permutations (nPr), and combinations (nCr)."
      />

      <div class="mb-6 flex gap-2">
        <For each={modes}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                mode() === m.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setParams({ mode: m.id })}
            >
              <span class="font-mono">{m.symbol}</span>
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Input</h2>
          <div class="space-y-4">
            <NumberField
              value={n()}
              onChange={setN}
              minValue={0}
              maxValue={170}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>n (non-negative integer, max 170)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="5" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <Show when={mode() !== "factorial"}>
              <NumberField
                value={r()}
                onChange={setR}
                minValue={0}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldLabel>r (items chosen)</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="2" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </Show>
            <Show when={mode() === "permutation"}>
              <p class="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-3 py-2">
                nPr = n! ÷ (n−r)!. Ordered selections
              </p>
            </Show>
            <Show when={mode() === "combination"}>
              <p class="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-3 py-2">
                nCr = n! ÷ (r! × (n−r)!). Unordered selections
              </p>
            </Show>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold">Result</h2>
            <Show when={result()}>
              <CopyButton value={() => String(result()!.value)} />
            </Show>
          </div>
          <Show
            when={result()}
            fallback={<p class="text-sm text-muted-foreground">Enter a value to calculate.</p>}
          >
            {(r) => (
              <div class="space-y-4">
                <div class="rounded-lg bg-muted/50 p-4 text-center font-mono text-2xl font-semibold break-all">
                  {r().value.toLocaleString()}
                </div>
                <Show when={r().steps.length > 0}>
                  <div class="space-y-1">
                    <p class="text-xs font-medium text-muted-foreground">Steps:</p>
                    <For each={r().steps}>
                      {(step) => (
                        <p class="font-mono text-xs text-muted-foreground">{step}</p>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  );
}
