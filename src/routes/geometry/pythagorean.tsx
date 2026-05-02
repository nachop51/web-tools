import { createMemo, Show } from "solid-js";
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
import { solveRightTriangle, type RightTriangleSolveFor, type RightTriangleResult } from "~/lib/utils/geometry/triangle";
import { setToolPageMeta } from "~/lib/seo";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

type SolveOption = {
  value: RightTriangleSolveFor;
  label: string;
  label1: string;
  label2: string;
  placeholder1: string;
  placeholder2: string;
};

const solveOptions: SolveOption[] = [
  {
    value: "c",
    label: "Find c (hypotenuse)",
    label1: "Leg a",
    label2: "Leg b",
    placeholder1: "Enter a",
    placeholder2: "Enter b",
  },
  {
    value: "a",
    label: "Find a (leg)",
    label1: "Leg b",
    label2: "Hypotenuse c",
    placeholder1: "Enter b",
    placeholder2: "Enter c",
  },
  {
    value: "b",
    label: "Find b (leg)",
    label1: "Leg a",
    label2: "Hypotenuse c",
    placeholder1: "Enter a",
    placeholder2: "Enter c",
  },
];

function buildEquation(solve: RightTriangleSolveFor, data: RightTriangleResult): string {
  const aVal = fmt(data.a);
  const bVal = fmt(data.b);
  const cVal = fmt(data.c);
  const aDisp = solve === "a" ? "?" : aVal;
  const bDisp = solve === "b" ? "?" : bVal;
  const cDisp = solve === "c" ? "?" : cVal;
  return `${aDisp}² + ${bDisp}² = ${cDisp}²`;
}

function getMissingLabel(solve: RightTriangleSolveFor): string {
  if (solve === "c") return "c (hypotenuse)";
  if (solve === "a") return "a (leg)";
  return "b (leg)";
}

function getMissingValue(solve: RightTriangleSolveFor, data: RightTriangleResult): string {
  if (solve === "c") return fmt(data.c);
  if (solve === "a") return fmt(data.a);
  return fmt(data.b);
}

function PyResult(props: { solve: RightTriangleSolveFor; data: RightTriangleResult }) {
  const d = props.data;
  const equation = buildEquation(props.solve, d);
  const missingLabel = getMissingLabel(props.solve);
  const missingValue = getMissingValue(props.solve, d);

  return (
    <div class="space-y-4">
      {/* Equation display */}
      <div class="rounded-lg border bg-muted/40 px-4 py-3 text-center font-mono text-base">
        {equation}
      </div>

      {/* Missing side highlight */}
      <div class="flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
        <span class="text-sm font-semibold">{missingLabel}</span>
        <span class="flex-1 text-right font-mono text-lg font-bold text-primary">
          {missingValue}
        </span>
        <CopyButton value={() => missingValue} />
      </div>

      <div class="divide-y divide-border rounded-lg border">
        <div class="flex items-center justify-between gap-4 px-4 py-3">
          <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Angle A</span>
          <span class="flex-1 font-mono text-sm">{fmt(d.angleA)}°</span>
          <CopyButton value={() => fmt(d.angleA)} />
        </div>
        <div class="flex items-center justify-between gap-4 px-4 py-3">
          <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Angle B</span>
          <span class="flex-1 font-mono text-sm">{fmt(d.angleB)}°</span>
          <CopyButton value={() => fmt(d.angleB)} />
        </div>
        <div class="flex items-center justify-between gap-4 px-4 py-3">
          <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Area</span>
          <span class="flex-1 font-mono text-sm">{fmt(d.area)}</span>
          <CopyButton value={() => fmt(d.area)} />
        </div>
      </div>
    </div>
  );
}

export default function PythagoreanTheorem() {
  setToolPageMeta("geometry", "pythagorean");
  const [searchParams, setSearchParams] = useSearchParams<{
    solve?: string;
    v1?: string;
    v2?: string;
  }>();

  const solve = createMemo<RightTriangleSolveFor>(() => {
    const s = searchParams.solve;
    if (s === "a" || s === "b" || s === "c") return s;
    return "c";
  });

  const v1Raw = createMemo(() => searchParams.v1 ?? "");
  const v2Raw = createMemo(() => searchParams.v2 ?? "");

  const result = createMemo<RightTriangleResult | null>(() => {
    const v1 = parseFloat(v1Raw());
    const v2 = parseFloat(v2Raw());
    if (!isFinite(v1) || !isFinite(v2) || v1Raw().trim() === "" || v2Raw().trim() === "") return null;
    if (v1 <= 0 || v2 <= 0) return null;
    try {
      return solveRightTriangle(solve(), v1, v2);
    } catch {
      return null;
    }
  });

  const errorMsg = createMemo<string | null>(() => {
    const v1 = parseFloat(v1Raw());
    const v2 = parseFloat(v2Raw());
    if (!isFinite(v1) || !isFinite(v2) || v1Raw().trim() === "" || v2Raw().trim() === "") return null;
    if (v1 <= 0 || v2 <= 0) return null;
    try {
      solveRightTriangle(solve(), v1, v2);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  });

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!);

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Pythagorean theorem"
        description="Solve for any side of a right triangle using a² + b² = c²."
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
                onClick={() => setSearchParams({ solve: opt.value, v1: "", v2: "" })}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium">{option().label1}</label>
              <NumberField
                value={v1Raw()}
                onChange={(v) => setSearchParams({ v1: v })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder={option().placeholder1} />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">{option().label2}</label>
              <NumberField
                value={v2Raw()}
                onChange={(v) => setSearchParams({ v2: v })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder={option().placeholder2} />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>

          <p class="mt-4 font-mono text-xs text-muted-foreground">a² + b² = c²</p>
        </section>

        {/* Results column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Result</h2>

          <Show when={errorMsg()}>
            {(err) => (
              <p class="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {err()}
              </p>
            )}
          </Show>

          <Show
            when={result()}
            fallback={
              <Show when={!errorMsg()}>
                <p class="text-sm text-muted-foreground">Enter both known values to solve.</p>
              </Show>
            }
          >
            {(res) => <PyResult solve={solve()} data={res()} />}
          </Show>
        </section>
      </div>
    </main>
  );
}
