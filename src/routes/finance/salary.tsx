import { createMemo, createSignal, For } from "solid-js";
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
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";
import {
  convertSalary,
  salaryPeriods,
  type SalaryBreakdown,
} from "~/lib/utils/finance/salary";

type PeriodOption = { id: keyof SalaryBreakdown; label: string };

function fmtCurrency(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(2);
}

export default function SalaryConverter() {
  setToolPageMeta("finance", "salary");
  const [amount, setAmount] = createSignal("");
  const [period, setPeriod] = createSignal<PeriodOption>(salaryPeriods[0]);
  const [hoursPerWeek, setHoursPerWeek] = createSignal("40");

  const result = createMemo(() => {
    const a = parseFloat(amount());
    const h = parseFloat(hoursPerWeek());
    if (!isFinite(a) || a < 0 || !isFinite(h) || h <= 0) return null;
    return convertSalary(a, period().id, h);
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Salary converter"
        description="Convert between annual, monthly, bi-weekly, weekly, daily, and hourly pay rates."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold">Inputs</h2>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Amount ($)</label>
              <NumberField
                value={amount()}
                onChange={setAmount}
                minValue={0}
                step={0.01}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="e.g. 75000" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Pay period</label>
              <Select<PeriodOption>
                options={salaryPeriods}
                optionValue="id"
                optionTextValue="label"
                value={period()}
                onChange={(opt) => opt && setPeriod(opt)}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>
                    {itemProps.item.rawValue.label}
                  </SelectItem>
                )}
              >
                <SelectTrigger>
                  <SelectValue<PeriodOption>>
                    {(state) => state.selectedOption()?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium">Hours per week</label>
              <NumberField
                value={hoursPerWeek()}
                onChange={setHoursPerWeek}
                minValue={1}
                maxValue={168}
                step={1}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="40" />
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
            <For each={salaryPeriods}>
              {(p) => {
                const value = createMemo(() => {
                  const r = result();
                  if (!r) return "—";
                  return fmtCurrency(r[p.id]);
                });
                const isSelected = () => period().id === p.id;
                return (
                  <div
                    class={cn(
                      "flex items-center justify-between gap-4 px-4 py-3 transition-colors",
                      isSelected() && "bg-primary/10",
                    )}
                  >
                    <span
                      class={cn(
                        "min-w-[110px] text-sm font-medium",
                        isSelected() && "text-primary",
                      )}
                    >
                      {p.label}
                    </span>
                    <span class="flex-1 font-mono text-sm text-right">
                      ${value()}
                    </span>
                    <CopyButton value={value} />
                  </div>
                );
              }}
            </For>
          </div>
        </section>
      </div>
    </main>
  );
}
