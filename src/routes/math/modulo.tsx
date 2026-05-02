import { createMemo, createSignal, Show } from "solid-js";
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
import { modulo } from "~/lib/utils/math/modulo";
import { setToolPageMeta } from "~/lib/seo";

export default function ModuloCalculator() {
  setToolPageMeta("math", "modulo");
  const [a, setA] = createSignal("17");
  const [m, setM] = createSignal("5");

  const result = createMemo(() => {
    const na = parseFloat(a()), nm = parseFloat(m());
    if (isNaN(na) || isNaN(nm) || nm === 0) return null;
    try {
      return modulo(na, nm);
    } catch {
      return null;
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Modulo calculator"
        description="Compute a mod m with quotient and remainder. Shows JavaScript, Python, and mathematical conventions."
      />

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
              <NumberFieldLabel>Dividend (a)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="17" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={m()}
              onChange={setM}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>Modulus (m)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="5" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Result</h2>
          <Show
            when={result()}
            fallback={
              <p class="text-sm text-muted-foreground">
                {m() === "0" ? "Modulus cannot be zero." : "Enter values to calculate."}
              </p>
            }
          >
            {(r) => (
              <div class="space-y-4">
                <div class="rounded-lg bg-muted/50 px-4 py-2 font-mono text-sm">
                  {r().proof}
                </div>
                <div class="divide-y divide-border rounded-lg border text-sm">
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Quotient</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono">{r().quotient}</span>
                      <CopyButton value={() => String(r().quotient)} />
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Remainder (JS / C)</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono">{r().remainder}</span>
                      <CopyButton value={() => String(r().remainder)} />
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Remainder (Python)</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono">{r().remainderPython}</span>
                      <CopyButton value={() => String(r().remainderPython)} />
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Remainder (math, ≥0)</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono">{r().remainderMath}</span>
                      <CopyButton value={() => String(r().remainderMath)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  );
}
