import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { setToolPageMeta } from "~/lib/seo";
import {
  compoundInterest,
  compoundingOptions,
  type CompoundingId,
} from "~/lib/utils/finance/compound-interest";

type CompoundingOption = { id: CompoundingId; label: string; n: number };

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(2);
}

const INITIAL_SHOW = 10;

export default function CompoundInterestCalculator() {
  setToolPageMeta("finance", "compound-interest");
  const [principal, setPrincipal] = createSignal("");
  const [rate, setRate] = createSignal("");
  const [years, setYears] = createSignal("");
  const [compounding, setCompounding] = createSignal<CompoundingOption>(
    compoundingOptions[3] as CompoundingOption, // monthly default
  );
  const [showAll, setShowAll] = createSignal(false);

  const result = createMemo(() => {
    const p = parseFloat(principal());
    const r = parseFloat(rate());
    const y = parseInt(years(), 10);
    if (!isFinite(p) || p <= 0 || !isFinite(r) || r < 0 || !isFinite(y) || y <= 0) {
      return null;
    }
    return compoundInterest(p, r, y, compounding().id);
  });

  const finalBalanceStr = createMemo(() =>
    result() ? fmt(result()!.finalBalance) : "—",
  );
  const totalInterestStr = createMemo(() =>
    result() ? fmt(result()!.totalInterest) : "—",
  );
  const gainPctStr = createMemo(() => {
    const r = result();
    if (!r) return "—";
    const p = parseFloat(principal());
    if (!isFinite(p) || p <= 0) return "—";
    return ((r.totalInterest / p) * 100).toFixed(2);
  });

  const visibleSchedule = createMemo(() => {
    const r = result();
    if (!r) return [];
    return showAll() ? r.schedule : r.schedule.slice(0, INITIAL_SHOW);
  });

  const hasMore = createMemo(() => {
    const r = result();
    return r ? r.schedule.length > INITIAL_SHOW : false;
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Compound interest"
        description="Calculate compound interest with yearly breakdown and multiple compounding frequencies."
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
                  <NumberFieldInput placeholder="e.g. 5000.00" />
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
                  <NumberFieldInput placeholder="e.g. 7" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Years</label>
              <NumberField
                value={years()}
                onChange={setYears}
                minValue={1}
                step={1}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="e.g. 10" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Compounding frequency</label>
              <Select<CompoundingOption>
                options={compoundingOptions as unknown as CompoundingOption[]}
                optionValue="id"
                optionTextValue="label"
                value={compounding()}
                onChange={(opt) => opt && setCompounding(opt)}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>
                    {itemProps.item.rawValue.label}
                  </SelectItem>
                )}
              >
                <SelectTrigger>
                  <SelectValue<CompoundingOption>>
                    {(state) => state.selectedOption()?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Results</h2>

          <div class="divide-y divide-border rounded-lg border mb-4">
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Final balance</span>
              <span class="flex-1 font-mono text-sm text-right">${finalBalanceStr()}</span>
              <CopyButton value={finalBalanceStr} />
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Total interest</span>
              <span class="flex-1 font-mono text-sm text-right">${totalInterestStr()}</span>
              <CopyButton value={totalInterestStr} />
            </div>
            <div class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="text-sm font-medium">Total gain</span>
              <span class="flex-1 font-mono text-sm text-right">{gainPctStr()}%</span>
              <CopyButton value={gainPctStr} />
            </div>
          </div>

          <Show when={result() && result()!.schedule.length > 0}>
            <h3 class="mb-2 text-sm font-semibold">Year-by-year breakdown</h3>
            <div class="rounded-lg border overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b bg-muted/50">
                    <th class="px-3 py-2 text-left font-medium text-muted-foreground">Year</th>
                    <th class="px-3 py-2 text-right font-medium text-muted-foreground">Balance</th>
                    <th class="px-3 py-2 text-right font-medium text-muted-foreground">Interest</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <For each={visibleSchedule()}>
                    {(row) => (
                      <tr>
                        <td class="px-3 py-2 font-mono">{row.year}</td>
                        <td class="px-3 py-2 font-mono text-right">${fmt(row.balance)}</td>
                        <td class="px-3 py-2 font-mono text-right text-primary">
                          +${fmt(row.interestEarned)}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            <Show when={hasMore() && !showAll()}>
              <button
                type="button"
                class="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/10"
                onClick={() => setShowAll(true)}
              >
                Show all {result()!.schedule.length} years
              </button>
            </Show>
          </Show>
        </section>
      </div>
    </main>
  );
}
