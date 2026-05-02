import { createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { solveAWV, type AWVSolve } from "~/lib/utils/electrical/amps-watts-volts";
import { setToolPageMeta } from "~/lib/seo";

type SolveOption = {
  value: AWVSolve;
  label: string;
  labelA: string;
  labelB: string;
};

const solveOptions: SolveOption[] = [
  {
    value: "amps",
    label: "Amps",
    labelA: "Watts (W)",
    labelB: "Volts (V)",
  },
  {
    value: "watts",
    label: "Watts",
    labelA: "Amps (A)",
    labelB: "Volts (V)",
  },
  {
    value: "volts",
    label: "Volts",
    labelA: "Watts (W)",
    labelB: "Amps (A)",
  },
];

function fmtNum(n: number): string {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toPrecision(8)).toString();
}

export default function AmpsWattsVolts() {
  setToolPageMeta("electrical", "amps-watts-volts");
  const [searchParams, setSearchParams] = useSearchParams<{
    solve?: string;
    a?: string;
    b?: string;
  }>();

  const solve = createMemo<AWVSolve>(() => {
    const s = searchParams.solve;
    if (s === "amps" || s === "watts" || s === "volts") return s;
    return "amps";
  });

  const aRaw = createMemo(() => searchParams.a ?? "");
  const bRaw = createMemo(() => searchParams.b ?? "");

  const result = createMemo(() => {
    const a = parseFloat(aRaw());
    const b = parseFloat(bRaw());
    if (!isFinite(a) || !isFinite(b) || aRaw().trim() === "" || bRaw().trim() === "") {
      return null;
    }
    return solveAWV(solve(), a, b);
  });

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!);

  const resultValue = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.value) : "—";
  });

  const resultUnit = createMemo(() => result()?.unit ?? "");
  const resultFormula = createMemo(() => result()?.formula ?? "");

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="electrical"
        name="Amps / watts / volts"
        description="Convert between amps, watts, and volts. Provide any two known values to calculate the third."
      />

      <div class="grid gap-6 md:grid-cols-2">
        {/* Input column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Calculate</h2>

          <div class="mb-6 flex flex-wrap gap-2">
            {solveOptions.map((opt) => (
              <button
                type="button"
                class={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  "hover:border-primary/60 hover:bg-primary/10",
                  solve() === opt.value
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-input text-muted-foreground",
                )}
                onClick={() =>
                  setSearchParams({ solve: opt.value, a: "", b: "" })
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium">
                {option().labelA}
              </label>
              <NumberField
                value={aRaw()}
                onChange={(v) => setSearchParams({ a: v })}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter value" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">
                {option().labelB}
              </label>
              <NumberField
                value={bRaw()}
                onChange={(v) => setSearchParams({ b: v })}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter value" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>
        </section>

        {/* Result column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Result</h2>

          <div class="flex flex-col items-center justify-center rounded-lg bg-muted/50 py-10">
            <span class="font-mono text-4xl font-bold tracking-tight">
              {resultValue()}
              {resultUnit() ? <span class="ml-2 text-2xl text-muted-foreground">{resultUnit()}</span> : null}
            </span>

            <p class="mt-3 font-mono text-sm text-muted-foreground">
              {resultFormula() || <span class="text-muted-foreground/50">Enter values to calculate</span>}
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between rounded-lg border px-4 py-3">
            <span class="font-mono text-sm">{resultValue()} {resultUnit()}</span>
            <CopyButton value={resultValue} />
          </div>
        </section>
      </div>
    </main>
  );
}
