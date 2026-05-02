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
import { setToolPageMeta } from "~/lib/seo";
import {
  solveRightTriangle,
  triangleFromSSS,
  type RightTriangleSolveFor,
  type RightTriangleResult,
  type TriangleResult,
} from "~/lib/utils/geometry/triangle";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

type TabMode = "right" | "sss";

type SolveOption = {
  value: RightTriangleSolveFor;
  label: string;
  label1: string;
  label2: string;
};

const solveOptions: SolveOption[] = [
  { value: "c", label: "Find hypotenuse (c)", label1: "Leg a", label2: "Leg b" },
  { value: "a", label: "Find leg (a)",         label1: "Leg b", label2: "Hypotenuse c" },
  { value: "b", label: "Find leg (b)",         label1: "Leg a", label2: "Hypotenuse c" },
];

function RightResults(props: { data: RightTriangleResult }) {
  const d = props.data;
  return (
    <div class="divide-y divide-border rounded-lg border">
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Leg a</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.a)}</span>
        <CopyButton value={() => fmt(d.a)} />
      </div>
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Leg b</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.b)}</span>
        <CopyButton value={() => fmt(d.b)} />
      </div>
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Hypotenuse c</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.c)}</span>
        <CopyButton value={() => fmt(d.c)} />
      </div>
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
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Perimeter</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.perimeter)}</span>
        <CopyButton value={() => fmt(d.perimeter)} />
      </div>
    </div>
  );
}

function SSSResults(props: { data: TriangleResult }) {
  const d = props.data;
  return (
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
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Angle C</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.angleC)}°</span>
        <CopyButton value={() => fmt(d.angleC)} />
      </div>
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Area</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.area)}</span>
        <CopyButton value={() => fmt(d.area)} />
      </div>
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">Perimeter</span>
        <span class="flex-1 font-mono text-sm">{fmt(d.perimeter)}</span>
        <CopyButton value={() => fmt(d.perimeter)} />
      </div>
    </div>
  );
}

export default function TriangleCalculator() {
  setToolPageMeta("geometry", "triangle");
  const [searchParams, setSearchParams] = useSearchParams<{
    tab?: string;
    solve?: string;
    v1?: string;
    v2?: string;
    a?: string;
    b?: string;
    c?: string;
  }>();

  const tab = createMemo<TabMode>(() => {
    const t = searchParams.tab;
    return t === "sss" ? "sss" : "right";
  });

  const solve = createMemo<RightTriangleSolveFor>(() => {
    const s = searchParams.solve;
    if (s === "a" || s === "b" || s === "c") return s;
    return "c";
  });

  const v1Raw = createMemo(() => searchParams.v1 ?? "");
  const v2Raw = createMemo(() => searchParams.v2 ?? "");
  const aRaw  = createMemo(() => searchParams.a ?? "");
  const bRaw  = createMemo(() => searchParams.b ?? "");
  const cRaw  = createMemo(() => searchParams.c ?? "");

  const rightOk = createMemo<{ data: RightTriangleResult } | null>(() => {
    if (tab() !== "right") return null;
    const v1 = parseFloat(v1Raw());
    const v2 = parseFloat(v2Raw());
    if (!isFinite(v1) || !isFinite(v2) || v1Raw().trim() === "" || v2Raw().trim() === "") return null;
    if (v1 <= 0 || v2 <= 0) return null;
    try {
      return { data: solveRightTriangle(solve(), v1, v2) };
    } catch {
      return null;
    }
  });

  const rightError = createMemo<string | null>(() => {
    if (tab() !== "right") return null;
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

  const sssResult = createMemo<TriangleResult | null>(() => {
    if (tab() !== "sss") return null;
    const a = parseFloat(aRaw());
    const b = parseFloat(bRaw());
    const c = parseFloat(cRaw());
    if (!isFinite(a) || !isFinite(b) || !isFinite(c)) return null;
    if (aRaw().trim() === "" || bRaw().trim() === "" || cRaw().trim() === "") return null;
    if (a <= 0 || b <= 0 || c <= 0) return null;
    return triangleFromSSS(a, b, c);
  });

  const sssValid = createMemo(() => sssResult()?.valid ?? false);

  const option = createMemo(() => solveOptions.find((o) => o.value === solve())!);

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Triangle calculator"
        description="Solve right triangles and general triangles from sides and angles."
      />

      {/* Tab buttons */}
      <div class="mb-6 flex gap-2">
        {(["right", "sss"] as TabMode[]).map((t) => (
          <button
            type="button"
            class={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              "hover:border-primary/60 hover:bg-primary/10",
              tab() === t
                ? "border-primary bg-primary/15 text-foreground"
                : "border-input text-muted-foreground",
            )}
            onClick={() => setSearchParams({ tab: t, v1: "", v2: "", a: "", b: "", c: "" })}
          >
            {t === "right" ? "Right triangle" : "All sides (SSS)"}
          </button>
        ))}
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        {/* Input column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <Show when={tab() === "right"}>
            <h2 class="mb-4 text-lg font-semibold">Solve for</h2>

            <div class="mb-6 flex flex-wrap gap-2">
              {solveOptions.map((opt) => (
                <button
                  type="button"
                  class={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
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
                    <NumberFieldInput placeholder="Enter value" />
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
                    <NumberFieldInput placeholder="Enter value" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            </div>
          </Show>

          <Show when={tab() === "sss"}>
            <h2 class="mb-4 text-lg font-semibold">Three sides</h2>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium">Side a</label>
                <NumberField
                  value={aRaw()}
                  onChange={(v) => setSearchParams({ a: v })}
                  minValue={0}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="Enter side a" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium">Side b</label>
                <NumberField
                  value={bRaw()}
                  onChange={(v) => setSearchParams({ b: v })}
                  minValue={0}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="Enter side b" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
              <div class="space-y-1.5">
                <label class="block text-sm font-medium">Side c</label>
                <NumberField
                  value={cRaw()}
                  onChange={(v) => setSearchParams({ c: v })}
                  minValue={0}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="Enter side c" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            </div>
          </Show>
        </section>

        {/* Results column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          {/* Right triangle results */}
          <Show when={tab() === "right"}>
            <Show when={rightError()}>
              {(err) => (
                <p class="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {err()}
                </p>
              )}
            </Show>
            <Show
              when={rightOk()}
              fallback={
                <Show when={!rightError()}>
                  <p class="text-sm text-muted-foreground">Enter both values to see results.</p>
                </Show>
              }
            >
              {(res) => <RightResults data={res().data} />}
            </Show>
          </Show>

          {/* SSS results */}
          <Show when={tab() === "sss"}>
            <Show
              when={sssResult() && !sssValid()}
            >
              <p class="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Not a valid triangle. The sum of any two sides must be greater than the third.
              </p>
            </Show>
            <Show
              when={sssResult() && sssValid()}
              fallback={
                <Show when={!sssResult()}>
                  <p class="text-sm text-muted-foreground">Enter all three sides to see results.</p>
                </Show>
              }
            >
              <SSSResults data={sssResult()!} />
            </Show>
          </Show>
        </section>
      </div>
    </main>
  );
}
