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
import { solveQuadratic, type QuadraticRoot } from "~/lib/utils/math/quadratic";
import { setToolPageMeta } from "~/lib/seo";

function fmt(n: number, places = 6): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(places)).toString();
}

function formatRoot(root: QuadraticRoot): string {
  if (root.type === "real") return fmt(root.value);
  const re = fmt(root.real);
  const im = fmt(Math.abs(root.imaginary));
  return root.imaginary >= 0 ? `${re} + ${im}i` : `${re} − ${im}i`;
}

export default function QuadraticFormula() {
  setToolPageMeta("math", "quadratic");
  const [a, setA] = createSignal("1");
  const [b, setB] = createSignal("-5");
  const [c, setC] = createSignal("6");

  const result = createMemo(() => {
    const na = parseFloat(a()), nb = parseFloat(b()), nc = parseFloat(c());
    if ([na, nb, nc].some(isNaN)) return null;
    try {
      return solveQuadratic(na, nb, nc);
    } catch {
      return null;
    }
  });

  const equationPreview = createMemo(() => {
    const na = parseFloat(a()), nb = parseFloat(b()), nc = parseFloat(c());
    if ([na, nb, nc].some(isNaN)) return "ax² + bx + c = 0";
    const bSign = nb >= 0 ? "+" : "−";
    const cSign = nc >= 0 ? "+" : "−";
    return `${na}x² ${bSign} ${Math.abs(nb)}x ${cSign} ${Math.abs(nc)} = 0`;
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Quadratic formula"
        description="Solve ax² + bx + c = 0. Shows discriminant and real or complex roots."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Coefficients</h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-muted/50 px-4 py-2 font-mono text-sm text-center">
              {equationPreview()}
            </div>
            <NumberField
              value={a()}
              onChange={setA}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>a (coefficient of x²)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="1" />
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
              <NumberFieldLabel>b (coefficient of x)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="-5" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={c()}
              onChange={setC}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>c (constant)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="6" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Solution</h2>
          <Show
            when={result()}
            fallback={<p class="text-sm text-muted-foreground">Enter coefficients to solve.</p>}
          >
            {(res) => (
              <div class="space-y-4">
                <div class="divide-y divide-border rounded-lg border text-sm">
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Discriminant (Δ)</span>
                    <span class="font-mono">{fmt(res().discriminant)}</span>
                  </div>
                  <div class="px-4 py-3">
                    <span class="text-xs text-muted-foreground">
                      {res().nature === "two-real"
                        ? "Two distinct real roots (Δ > 0)"
                        : res().nature === "one-real"
                          ? "One repeated real root (Δ = 0)"
                          : "Two complex conjugate roots (Δ < 0)"}
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium">
                    {res().roots.length === 1 ? "Root:" : "Roots:"}
                  </p>
                  <For each={res().roots}>
                    {(root, i) => (
                      <div class="flex items-center gap-2">
                        <div class="flex-1 rounded-lg bg-muted/50 px-4 py-3 font-mono text-sm">
                          x{res().roots.length > 1 ? `${i() + 1}` : ""} = {formatRoot(root)}
                        </div>
                        <CopyButton value={() => formatRoot(root)} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  );
}
