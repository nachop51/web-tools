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
import { cn } from "~/lib/utils";
import { calculateTip } from "~/lib/utils/finance/tip";
import { setToolPageMeta } from "~/lib/seo";

const quickTips = [10, 15, 18, 20, 25];

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(2);
}

export default function TipCalculator() {
  setToolPageMeta("finance", "tip");
  const [bill, setBill] = createSignal("");
  const [tipPct, setTipPct] = createSignal("18");
  const [people, setPeople] = createSignal("1");

  const result = createMemo(() => {
    const b = parseFloat(bill());
    const t = parseFloat(tipPct());
    const p = parseInt(people(), 10);
    if (!isFinite(b) || b <= 0 || !isFinite(t) || t < 0) return null;
    return calculateTip(b, t, p >= 1 ? p : 1);
  });

  const tipAmountStr = createMemo(() => {
    const r = result();
    return r ? fmt(r.tipAmount) : "—";
  });
  const totalStr = createMemo(() => {
    const r = result();
    return r ? fmt(r.totalAmount) : "—";
  });
  const perPersonStr = createMemo(() => {
    const r = result();
    return r ? fmt(r.perPerson) : "—";
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Tip calculator"
        description="Calculate tip amount, total, and per-person split for any bill."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Bill details</h2>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Bill amount ($)</label>
              <NumberField
                value={bill()}
                onChange={setBill}
                minValue={0}
                step={0.01}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="e.g. 85.00" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium">Tip percentage (%)</label>
              <div class="flex flex-wrap gap-2 mb-2">
                {quickTips.map((pct) => (
                  <button
                    type="button"
                    class={cn(
                      "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                      "hover:border-primary/60 hover:bg-primary/10",
                      tipPct() === String(pct)
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-input text-muted-foreground",
                    )}
                    onClick={() => setTipPct(String(pct))}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <NumberField
                value={tipPct()}
                onChange={setTipPct}
                minValue={0}
                maxValue={100}
                step={1}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="Custom %" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Number of people</label>
              <NumberField
                value={people()}
                onChange={setPeople}
                minValue={1}
                step={1}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="1" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          <div class="divide-y divide-border rounded-lg border">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Tip amount</span>
              <span class="flex-1 font-mono text-sm text-right">${tipAmountStr()}</span>
              <CopyButton value={tipAmountStr} />
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Total amount</span>
              <span class="flex-1 font-mono text-sm text-right">${totalStr()}</span>
              <CopyButton value={totalStr} />
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Per person</span>
              <span class="flex-1 font-mono text-sm text-right">${perPersonStr()}</span>
              <CopyButton value={perPersonStr} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
