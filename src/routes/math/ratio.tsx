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
import { simplifyRatio, solveRatio, ratioToPercent } from "~/lib/utils/math/ratio";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "simplify" | "solve";
const modes: Array<{ id: Mode; label: string }> = [
  { id: "simplify", label: "Simplify ratio" },
  { id: "solve",    label: "Solve proportion" },
];

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

export default function RatioSolver() {
  setToolPageMeta("math", "ratio");
  const [params, setParams] = useSearchParams<{ mode?: string }>();
  const mode = createMemo<Mode>(() => (params.mode === "solve" ? "solve" : "simplify"));

  const [a, setA] = createSignal("6");
  const [b, setB] = createSignal("4");
  const [c, setC] = createSignal("9");

  const simplified = createMemo(() => {
    const na = parseFloat(a()), nb = parseFloat(b());
    if (isNaN(na) || isNaN(nb) || na <= 0 || nb <= 0) return null;
    return simplifyRatio(na, nb);
  });

  const percents = createMemo(() => {
    const na = parseFloat(a()), nb = parseFloat(b());
    if (isNaN(na) || isNaN(nb) || na <= 0 || nb <= 0) return null;
    return ratioToPercent(na, nb);
  });

  const solved = createMemo(() => {
    const na = parseFloat(a()), nb = parseFloat(b()), nc = parseFloat(c());
    if (isNaN(na) || isNaN(nb) || isNaN(nc) || na === 0) return null;
    return solveRatio(na, nb, nc);
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Ratio solver"
        description="Simplify ratios to lowest terms or solve for a missing value in a proportion."
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
              {m.label}
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Input</h2>
          <Show when={mode() === "simplify"}>
            <div class="flex items-end gap-3">
              <NumberField
                value={a()}
                onChange={setA}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldLabel>A</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput class="w-24" placeholder="6" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
              <span class="pb-2 text-xl font-bold text-muted-foreground">:</span>
              <NumberField
                value={b()}
                onChange={setB}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldLabel>B</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput class="w-24" placeholder="4" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </Show>
          <Show when={mode() === "solve"}>
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground mb-3">A : B = C : ?</p>
              <div class="flex items-end gap-3">
                <NumberField
                  value={a()}
                  onChange={setA}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>A</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput class="w-20" placeholder="2" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <span class="pb-2 text-lg font-bold text-muted-foreground">:</span>
                <NumberField
                  value={b()}
                  onChange={setB}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>B</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput class="w-20" placeholder="3" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <span class="pb-2 text-lg font-bold text-muted-foreground">=</span>
                <NumberField
                  value={c()}
                  onChange={setC}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>C</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput class="w-20" placeholder="4" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <span class="pb-2 text-lg font-bold text-muted-foreground">: ?</span>
              </div>
            </div>
          </Show>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Result</h2>
          <Show when={mode() === "simplify"}>
            <Show
              when={simplified()}
              fallback={<p class="text-sm text-muted-foreground">Enter positive values.</p>}
            >
              {(s) => (
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-2xl font-semibold">{fmt(s().a)} : {fmt(s().b)}</span>
                    <CopyButton value={() => `${fmt(s().a)}:${fmt(s().b)}`} />
                  </div>
                  <Show when={percents()}>
                    {(p) => (
                      <div class="divide-y divide-border rounded-lg border text-sm">
                        <div class="flex justify-between px-4 py-2">
                          <span class="text-muted-foreground">A as % of total</span>
                          <span class="font-mono">{p().aPercent.toFixed(2)}%</span>
                        </div>
                        <div class="flex justify-between px-4 py-2">
                          <span class="text-muted-foreground">B as % of total</span>
                          <span class="font-mono">{p().bPercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    )}
                  </Show>
                </div>
              )}
            </Show>
          </Show>
          <Show when={mode() === "solve"}>
            <Show
              when={solved() !== null}
              fallback={<p class="text-sm text-muted-foreground">Enter values to solve.</p>}
            >
              <div class="flex items-center gap-2">
                <div class="rounded-lg bg-muted/50 p-4 font-mono text-2xl font-semibold flex-1 text-center">
                  {fmt(solved()!)}
                </div>
                <CopyButton value={() => fmt(solved()!)} />
              </div>
              <p class="mt-3 text-sm text-muted-foreground">
                {a()} : {b()} = {c()} : {fmt(solved()!)}
              </p>
            </Show>
          </Show>
        </section>
      </div>
    </main>
  );
}
