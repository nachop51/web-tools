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
import { solveOhms, type OhmsVariable } from "~/lib/utils/electrical/ohms-law";
import { setToolPageMeta } from "~/lib/seo";

type SolveOption = {
  value: OhmsVariable;
  label: string;
  labelA: string;
  labelB: string;
  formula: string;
};

const solveOptions: SolveOption[] = [
  {
    value: "v",
    label: "Voltage (V)",
    labelA: "Current (A)",
    labelB: "Resistance (Ω)",
    formula: "V = I × R",
  },
  {
    value: "i",
    label: "Current (I)",
    labelA: "Voltage (V)",
    labelB: "Resistance (Ω)",
    formula: "I = V ÷ R",
  },
  {
    value: "r",
    label: "Resistance (R)",
    labelA: "Voltage (V)",
    labelB: "Current (A)",
    formula: "R = V ÷ I",
  },
];

function fmtNum(n: number): string {
  if (!isFinite(n)) return "—";
  const s = parseFloat(n.toPrecision(8)).toString();
  return s;
}

export default function OhmsLaw() {
  setToolPageMeta("electrical", "ohms-law");
  const [searchParams, setSearchParams] = useSearchParams<{
    solve?: string;
    a?: string;
    b?: string;
  }>();

  const solve = createMemo<OhmsVariable>(() => {
    const s = searchParams.solve;
    if (s === "v" || s === "i" || s === "r") return s;
    return "v";
  });

  const aRaw = createMemo(() => searchParams.a ?? "");
  const bRaw = createMemo(() => searchParams.b ?? "");

  const result = createMemo(() => {
    const a = parseFloat(aRaw());
    const b = parseFloat(bRaw());
    if (!isFinite(a) || !isFinite(b) || aRaw().trim() === "" || bRaw().trim() === "") {
      return null;
    }
    return solveOhms(solve(), a, b);
  });

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!);

  const voltageStr = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.voltage) : "—";
  });
  const currentStr = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.current) : "—";
  });
  const resistanceStr = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.resistance) : "—";
  });
  const powerStr = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.power) : "—";
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="electrical"
        name="Ohm's law"
        description="Solve for voltage, current, or resistance given any two known values. Bonus: power is always shown."
      />

      <div class="grid gap-6 md:grid-cols-2">
        {/* Input column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Solve for</h2>

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

          <p class="mt-4 text-xs text-muted-foreground">
            Formula: <span class="font-mono">{option().formula}</span>
          </p>
        </section>

        {/* Results column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          <div class="divide-y divide-border rounded-lg border">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[110px]">
                <span class="block text-sm font-medium">Voltage</span>
                <span class="font-mono text-xs text-muted-foreground">V = I × R</span>
              </div>
              <span class="flex-1 font-mono text-sm">{voltageStr()} V</span>
              <CopyButton value={voltageStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[110px]">
                <span class="block text-sm font-medium">Current</span>
                <span class="font-mono text-xs text-muted-foreground">I = V ÷ R</span>
              </div>
              <span class="flex-1 font-mono text-sm">{currentStr()} A</span>
              <CopyButton value={currentStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[110px]">
                <span class="block text-sm font-medium">Resistance</span>
                <span class="font-mono text-xs text-muted-foreground">R = V ÷ I</span>
              </div>
              <span class="flex-1 font-mono text-sm">{resistanceStr()} Ω</span>
              <CopyButton value={resistanceStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[110px]">
                <span class="block text-sm font-medium">Power</span>
                <span class="font-mono text-xs text-muted-foreground">P = V × I</span>
              </div>
              <span class="flex-1 font-mono text-sm">{powerStr()} W</span>
              <CopyButton value={powerStr} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
