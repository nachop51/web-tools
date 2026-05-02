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
import { calcPower, type PowerMode } from "~/lib/utils/electrical/power";
import { setToolPageMeta } from "~/lib/seo";

type ModeOption = {
  value: PowerMode;
  label: string;
  labelA: string;
  labelB: string;
  formula: string;
};

const modeOptions: ModeOption[] = [
  {
    value: "iv",
    label: "P = IV",
    labelA: "Current (A)",
    labelB: "Voltage (V)",
    formula: "P = I × V",
  },
  {
    value: "vr",
    label: "P = V²/R",
    labelA: "Voltage (V)",
    labelB: "Resistance (Ω)",
    formula: "P = V² ÷ R",
  },
  {
    value: "ir",
    label: "P = I²R",
    labelA: "Current (A)",
    labelB: "Resistance (Ω)",
    formula: "P = I² × R",
  },
];

function fmtNum(n: number): string {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toPrecision(8)).toString();
}

function fmtHP(n: number): string {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toFixed(6)).toString();
}

export default function PowerCalculator() {
  setToolPageMeta("electrical", "power");
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string;
    a?: string;
    b?: string;
  }>();

  const mode = createMemo<PowerMode>(() => {
    const m = searchParams.mode;
    if (m === "iv" || m === "vr" || m === "ir") return m;
    return "iv";
  });

  const aRaw = createMemo(() => searchParams.a ?? "");
  const bRaw = createMemo(() => searchParams.b ?? "");

  const result = createMemo(() => {
    const a = parseFloat(aRaw());
    const b = parseFloat(bRaw());
    if (!isFinite(a) || !isFinite(b) || aRaw().trim() === "" || bRaw().trim() === "") {
      return null;
    }
    return calcPower(mode(), a, b);
  });

  const option = createMemo(() => modeOptions.find((o) => o.value === mode())!);

  const wattsStr = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.watts) : "—";
  });
  const kilowattsStr = createMemo(() => {
    const r = result();
    return r ? fmtNum(r.kilowatts) : "—";
  });
  const horsepowerStr = createMemo(() => {
    const r = result();
    return r ? fmtHP(r.horsepower) : "—";
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="electrical"
        name="Power calculator"
        description="Calculate electrical power in watts, kilowatts, and horsepower using three common formulas."
      />

      <div class="grid gap-6 md:grid-cols-2">
        {/* Input column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Formula</h2>

          <div class="mb-6 flex flex-wrap gap-2">
            {modeOptions.map((opt) => (
              <button
                type="button"
                class={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  "hover:border-primary/60 hover:bg-primary/10",
                  mode() === opt.value
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-input text-muted-foreground",
                )}
                onClick={() =>
                  setSearchParams({ mode: opt.value, a: "", b: "" })
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
                <span class="block text-sm font-medium">Watts</span>
                <span class="font-mono text-xs text-muted-foreground">{option().formula}</span>
              </div>
              <span class="flex-1 font-mono text-sm">{wattsStr()} W</span>
              <CopyButton value={wattsStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[110px]">
                <span class="block text-sm font-medium">Kilowatts</span>
                <span class="font-mono text-xs text-muted-foreground">kW = W ÷ 1000</span>
              </div>
              <span class="flex-1 font-mono text-sm">{kilowattsStr()} kW</span>
              <CopyButton value={kilowattsStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[110px]">
                <span class="block text-sm font-medium">Horsepower</span>
                <span class="font-mono text-xs text-muted-foreground">hp = W ÷ 745.7</span>
              </div>
              <span class="flex-1 font-mono text-sm">{horsepowerStr()} hp</span>
              <CopyButton value={horsepowerStr} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
