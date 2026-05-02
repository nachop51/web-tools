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
import { circleFrom, circleInputs, type CircleInput } from "~/lib/utils/geometry/circle";
import { setToolPageMeta } from "~/lib/seo";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

const modeLabels: Record<CircleInput, string> = {
  radius:        "Give radius",
  diameter:      "Give diameter",
  circumference: "Give circumference",
  area:          "Give area",
};

export default function CircleCalculator() {
  setToolPageMeta("geometry", "circle");
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string;
    v?: string;
  }>();

  const mode = createMemo<CircleInput>(() => {
    const m = searchParams.mode;
    if (m === "radius" || m === "diameter" || m === "circumference" || m === "area") return m;
    return "radius";
  });

  const raw = createMemo(() => searchParams.v ?? "");

  const result = createMemo(() => {
    const v = parseFloat(raw());
    if (!isFinite(v) || raw().trim() === "" || v < 0) return null;
    return circleFrom(mode(), v);
  });

  const inputLabel = createMemo(() => circleInputs.find((c) => c.id === mode())!);

  const radiusStr    = createMemo(() => fmt(result()?.radius ?? NaN));
  const diameterStr  = createMemo(() => fmt(result()?.diameter ?? NaN));
  const circumStr    = createMemo(() => fmt(result()?.circumference ?? NaN));
  const areaStr      = createMemo(() => fmt(result()?.area ?? NaN));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Circle calculator"
        description="Find radius, diameter, circumference, and area from any one property."
      />

      <div class="grid gap-6 md:grid-cols-2">
        {/* Input column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Known value</h2>

          <div class="mb-6 flex flex-wrap gap-2">
            {(Object.keys(modeLabels) as CircleInput[]).map((m) => (
              <button
                type="button"
                class={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  "hover:border-primary/60 hover:bg-primary/10",
                  mode() === m
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-input text-muted-foreground",
                )}
                onClick={() => setSearchParams({ mode: m, v: "" })}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>

          <div class="space-y-1.5">
            <label class="block text-sm font-medium">
              {inputLabel().label}
            </label>
            <NumberField
              value={raw()}
              onChange={(v) => setSearchParams({ v })}
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
        </section>

        {/* Results column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          <div class="divide-y divide-border rounded-lg border">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Radius</span>
                <span class="font-mono text-xs text-muted-foreground">r</span>
              </div>
              <span class="flex-1 font-mono text-sm">{radiusStr()}</span>
              <CopyButton value={radiusStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Diameter</span>
                <span class="font-mono text-xs text-muted-foreground">d = 2r</span>
              </div>
              <span class="flex-1 font-mono text-sm">{diameterStr()}</span>
              <CopyButton value={diameterStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Circumference</span>
                <span class="font-mono text-xs text-muted-foreground">C = 2πr</span>
              </div>
              <span class="flex-1 font-mono text-sm">{circumStr()}</span>
              <CopyButton value={circumStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Area</span>
                <span class="font-mono text-xs text-muted-foreground">A = πr²</span>
              </div>
              <span class="flex-1 font-mono text-sm">{areaStr()}</span>
              <CopyButton value={areaStr} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
