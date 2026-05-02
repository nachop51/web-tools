import { createMemo, createSignal } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import { simpleInterest } from "~/lib/utils/finance/simple-interest";
import { setToolPageMeta } from "~/lib/seo";

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(2);
}

function fmtPct(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(4);
}

export default function SimpleInterestCalculator() {
  setToolPageMeta("finance", "simple-interest");
  const [principal, setPrincipal] = createSignal("");
  const [rate, setRate] = createSignal("");
  const [years, setYears] = createSignal("");

  const result = createMemo(() => {
    const p = parseFloat(principal());
    const r = parseFloat(rate());
    const y = parseFloat(years());
    if (!isFinite(p) || p <= 0 || !isFinite(r) || r < 0 || !isFinite(y) || y <= 0) {
      return null;
    }
    return simpleInterest(p, r, y);
  });

  const interestStr = createMemo(() => (result() ? fmt(result()!.interest) : "—"));
  const totalStr = createMemo(() => (result() ? fmt(result()!.totalAmount) : "—"));
  const rateStr = createMemo(() =>
    result() ? fmtPct(result()!.effectiveRate) : "—",
  );

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Simple interest"
        description="Calculate interest earned using I = P × r × t."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Inputs</h2>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Principal ($)</label>
              <NumberField
                value={principal()}
                onChange={setPrincipal}
                minValue={0}
                step={0.01}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="e.g. 1000.00" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Annual rate (%)</label>
              <NumberField
                value={rate()}
                onChange={setRate}
                minValue={0}
                step={0.01}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="e.g. 5" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Time (years)</label>
              <NumberField
                value={years()}
                onChange={setYears}
                minValue={0}
                step={0.5}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="e.g. 3" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>

          <p class="mt-4 text-xs text-muted-foreground">
            Formula: <span class="font-mono">I = P × r × t</span>
          </p>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          <div class="divide-y divide-border rounded-lg border">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Interest earned</span>
              <span class="flex-1 font-mono text-sm text-right">${interestStr()}</span>
              <CopyButton value={interestStr} />
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Total amount</span>
              <span class="flex-1 font-mono text-sm text-right">${totalStr()}</span>
              <CopyButton value={totalStr} />
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Effective total rate</span>
              <span class="flex-1 font-mono text-sm text-right">{rateStr()}%</span>
              <CopyButton value={rateStr} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
