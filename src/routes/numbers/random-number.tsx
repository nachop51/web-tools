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
import { randomBatch } from "~/lib/utils/numbers/random";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "int" | "float";

export default function RandomNumberTool() {
  setToolPageMeta("numbers", "random-number");
  const [params, setParams] = useSearchParams<{ mode?: string }>();

  const [min, setMin] = createSignal("-100");
  const [max, setMax] = createSignal("100");
  const [count, setCount] = createSignal("10");
  const [decimals, setDecimals] = createSignal("2");
  const [results, setResults] = createSignal<number[]>([]);

  const mode = createMemo<Mode>(() => {
    const p = params.mode;
    return p === "float" ? "float" : "int";
  });

  const outputText = createMemo(() => results().join("\n"));

  function generate() {
    const minN = parseFloat(min());
    const maxN = parseFloat(max());
    const countN = Math.min(100, Math.max(1, parseInt(count(), 10) || 1));
    const decN = Math.min(20, Math.max(0, parseInt(decimals(), 10) || 0));

    if (isNaN(minN) || isNaN(maxN) || minN > maxN) return;
    setResults(randomBatch(minN, maxN, countN, mode(), decN));
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Random number generator"
        description="Generate random integers or floats within a range."
      />

      <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Options</h2>

          <div class="mb-4 flex gap-2">
            <For each={["int", "float"] as Mode[]}>
              {(m) => (
                <button
                  type="button"
                  class={cn(
                    "flex-1 rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors",
                    mode() === m
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input hover:border-primary/50 hover:bg-accent/30",
                  )}
                  onClick={() => setParams({ mode: m })}
                >
                  {m === "int" ? "Integer" : "Float"}
                </button>
              )}
            </For>
          </div>

          <div class="space-y-4">
            <NumberField
              value={min()}
              onChange={setMin}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>Min</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="-100" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={max()}
              onChange={setMax}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>Max</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="100" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <NumberField
              value={count()}
              onChange={setCount}
              minValue={1}
              maxValue={100}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>Count (1–100)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="10" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <Show when={mode() === "float"}>
              <NumberField
                value={decimals()}
                onChange={setDecimals}
                minValue={0}
                maxValue={20}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldLabel>Decimal places</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="2" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </Show>
          </div>

          <button
            type="button"
            class="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            onClick={generate}
          >
            Generate
          </button>
        </aside>

        <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-base font-semibold">
              Results{" "}
              <Show when={results().length > 0}>
                <span class="text-sm font-normal text-muted-foreground">({results().length})</span>
              </Show>
            </h2>
            <Show when={results().length > 0}>
              <CopyButton value={outputText} />
            </Show>
          </div>
          <div class="min-h-[200px] rounded-lg border bg-muted/20 p-4 font-mono text-sm">
            <Show when={results().length > 0} fallback={<p class="text-muted-foreground">Click Generate to produce numbers.</p>}>
              <For each={results()}>
                {(n) => <div class="leading-6">{n}</div>}
              </For>
            </Show>
          </div>
        </section>
      </div>
    </main>
  );
}
