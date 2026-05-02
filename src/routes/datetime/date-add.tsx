import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "~/components/ui/text-field";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { addToDate, type DateUnit } from "~/lib/utils/datetime/date-add";
import { setToolPageMeta } from "~/lib/seo";

const units: Array<{ id: DateUnit; label: string }> = [
  { id: "days",   label: "Days" },
  { id: "weeks",  label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "years",  label: "Years" },
];

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DateAdd() {
  setToolPageMeta("datetime", "date-add");
  const [date, setDate] = createSignal(today());
  const [amount, setAmount] = createSignal("7");
  const [unit, setUnit] = createSignal<DateUnit>("days");

  const selectedUnit = createMemo(() => units.find((u) => u.id === unit()) ?? units[0]);

  const result = createMemo(() => {
    const d = date(), a = parseInt(amount());
    if (!d || isNaN(a)) return null;
    try {
      return addToDate(d, a, unit());
    } catch {
      return null;
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Add / subtract from date"
        description="Add or subtract days, weeks, months, or years from any date."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Input</h2>
          <div class="space-y-4">
            <TextField value={date()} onChange={setDate}>
              <TextFieldLabel>Base date</TextFieldLabel>
              <TextFieldInput type="date" class="font-mono" />
            </TextField>
            <div class="flex gap-3">
              <div class="flex-1">
                <NumberField
                  value={amount()}
                  onChange={setAmount}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Amount (negative to subtract)</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="7" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
              <div class="w-36">
                <label class="text-sm font-medium">Unit</label>
                <Select<{ id: DateUnit; label: string }>
                  options={units}
                  optionValue="id"
                  optionTextValue="label"
                  value={selectedUnit()}
                  onChange={(opt) => opt && setUnit(opt.id)}
                  itemComponent={(p) => (
                    <SelectItem item={p.item}>{p.item.rawValue.label}</SelectItem>
                  )}
                >
                  <SelectTrigger class="mt-1.5 w-full">
                    <SelectValue<{ id: DateUnit; label: string }>>
                      {(s) => s.selectedOption()?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Result</h2>
          <Show
            when={result()}
            fallback={<p class="text-sm text-muted-foreground">Enter a date and amount.</p>}
          >
            {(r) => (
              <div class="divide-y divide-border rounded-lg border text-sm">
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="min-w-[90px] text-muted-foreground">Date</span>
                  <span class="flex-1 font-mono">{r().resultIso}</span>
                  <CopyButton value={() => r().resultIso} />
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="min-w-[90px] text-muted-foreground">Weekday</span>
                  <span class="flex-1">{r().weekday}</span>
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="min-w-[90px] text-muted-foreground">Full date</span>
                  <span class="flex-1 text-xs">{r().formatted}</span>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  );
}
