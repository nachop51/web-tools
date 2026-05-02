import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { convert } from "~/lib/utils/units/converter";
import { massUnitKeys, massUnits } from "~/lib/utils/units/mass";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";

type UnitOption = { label: string; value: string };

const unitOptions: UnitOption[] = massUnitKeys.map((key) => ({
  label: massUnits[key].label,
  value: key,
}));

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  const s = parseFloat(n.toPrecision(8)).toString();
  return s;
}

export default function MassConverter() {
  setToolPageMeta("units", "mass");
  const [params, setParams] = useSearchParams<{ from?: string }>();

  const initialFrom =
    params.from && massUnits[params.from] ? params.from : "kg";

  const [inputValue, setInputValue] = createSignal("");
  const [fromUnit, setFromUnit] = createSignal(initialFrom);

  const numericValue = createMemo(() => parseFloat(inputValue()));

  const isInvalid = createMemo(
    () => inputValue().length > 0 && isNaN(numericValue()),
  );

  const selectedOption = createMemo(
    () => unitOptions.find((o) => o.value === fromUnit()) ?? unitOptions[1],
  );

  function handleFromChange(opt: UnitOption | null) {
    if (!opt) return;
    setFromUnit(opt.value);
    setParams({ from: opt.value });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Mass converter"
        description="Convert between grams, kilograms, pounds, ounces, and more."
      />

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <NumberField
              value={inputValue()}
              onChange={setInputValue}
              format={false}
              validationState={isInvalid() ? "invalid" : "valid"}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>Value</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="Enter a value..." />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
              <Show when={isInvalid()}>
                <NumberFieldErrorMessage>
                  Enter a valid number
                </NumberFieldErrorMessage>
              </Show>
            </NumberField>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">From unit</label>
              <Select<UnitOption>
                options={unitOptions}
                optionValue="value"
                optionTextValue="label"
                value={selectedOption()}
                onChange={handleFromChange}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>
                    {itemProps.item.rawValue.label}
                  </SelectItem>
                )}
              >
                <SelectTrigger class="w-full">
                  <SelectValue<UnitOption>>
                    {(state) => state.selectedOption()?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-0.5">
              <For each={massUnitKeys}>
                {(unit) => {
                  const converted = createMemo(() => {
                    const n = numericValue();
                    if (isNaN(n)) return "—";
                    return fmt(
                      convert(
                        n,
                        massUnits[fromUnit()].factor,
                        massUnits[unit].factor,
                      ),
                    );
                  });

                  return (
                    <div
                      class={cn(
                        "flex justify-between py-1.5 px-3 rounded-md text-sm",
                        unit === fromUnit() && "bg-muted font-medium",
                      )}
                    >
                      <span class="text-muted-foreground">
                        {massUnits[unit].label}
                      </span>
                      <span class="font-mono">{converted()}</span>
                    </div>
                  );
                }}
              </For>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
