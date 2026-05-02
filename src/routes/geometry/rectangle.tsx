import { createMemo } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import { rectangle } from "~/lib/utils/geometry/rectangle";
import { setToolPageMeta } from "~/lib/seo";

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toPrecision(10)).toString();
}

export default function RectangleCalculator() {
  setToolPageMeta("geometry", "rectangle");
  const [searchParams, setSearchParams] = useSearchParams<{
    w?: string;
    h?: string;
  }>();

  const wRaw = createMemo(() => searchParams.w ?? "");
  const hRaw = createMemo(() => searchParams.h ?? "");

  const result = createMemo(() => {
    const w = parseFloat(wRaw());
    const h = parseFloat(hRaw());
    if (!isFinite(w) || !isFinite(h) || wRaw().trim() === "" || hRaw().trim() === "") return null;
    if (w <= 0 || h <= 0) return null;
    return rectangle(w, h);
  });

  const areaStr     = createMemo(() => fmt(result()?.area ?? NaN));
  const perimStr    = createMemo(() => fmt(result()?.perimeter ?? NaN));
  const diagStr     = createMemo(() => fmt(result()?.diagonal ?? NaN));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Rectangle calculator"
        description="Calculate area, perimeter, and diagonal of a rectangle or square."
      />

      <div class="grid gap-6 md:grid-cols-2">
        {/* Input column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div class="mb-4 flex items-center gap-3">
            <h2 class="text-lg font-semibold">Dimensions</h2>
            <Show when={result()?.isSquare}>
              <span class="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                Square
              </span>
            </Show>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Width</label>
              <NumberField
                value={wRaw()}
                onChange={(v) => setSearchParams({ w: v })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter width" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Height</label>
              <NumberField
                value={hRaw()}
                onChange={(v) => setSearchParams({ h: v })}
                minValue={0}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Enter height" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>
        </section>

        {/* Results column */}
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          <div class="divide-y divide-border rounded-lg border">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Area</span>
                <span class="font-mono text-xs text-muted-foreground">A = w × h</span>
              </div>
              <span class="flex-1 font-mono text-sm">{areaStr()}</span>
              <CopyButton value={areaStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Perimeter</span>
                <span class="font-mono text-xs text-muted-foreground">P = 2(w + h)</span>
              </div>
              <span class="flex-1 font-mono text-sm">{perimStr()}</span>
              <CopyButton value={perimStr} />
            </div>

            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <div class="min-w-[130px]">
                <span class="block text-sm font-medium">Diagonal</span>
                <span class="font-mono text-xs text-muted-foreground">d = √(w² + h²)</span>
              </div>
              <span class="flex-1 font-mono text-sm">{diagStr()}</span>
              <CopyButton value={diagStr} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
