import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { TbOutlineChevronDown, TbOutlineRocket } from "solid-icons/tb";
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
import {
  funLengthUnitKeys,
  funLengthUnits,
  lengthUnitKeys,
  lengthUnits,
} from "~/lib/utils/units/length";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";

type UnitOption = { label: string; value: string };

const unitOptions: UnitOption[] = lengthUnitKeys.map((key) => ({
  label: lengthUnits[key].label,
  value: key,
}));

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toPrecision(8)).toString();
}

function fmtFun(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e6 || abs < 0.001) return n.toExponential(3);
  return parseFloat(n.toPrecision(6)).toString();
}

export default function LengthConverter() {
  setToolPageMeta("units", "length");
  const [params, setParams] = useSearchParams<{ from?: string }>();

  const initialFrom =
    params.from && lengthUnits[params.from] ? params.from : "km";

  const [inputValue, setInputValue] = createSignal("");
  const [fromUnit, setFromUnit] = createSignal(initialFrom);
  const [showFun, setShowFun] = createSignal(false);

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
        name="Length converter"
        description="Convert between meters, kilometers, miles, feet, inches, and more."
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
              <For each={lengthUnitKeys}>
                {(unit) => {
                  const converted = createMemo(() => {
                    const n = numericValue();
                    if (isNaN(n)) return "—";
                    return fmt(
                      convert(
                        n,
                        lengthUnits[fromUnit()].factor,
                        lengthUnits[unit].factor,
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
                        {lengthUnits[unit].label}
                      </span>
                      <span class="font-mono">{converted()}</span>
                    </div>
                  );
                }}
              </For>
            </div>
          </CardContent>
        </Card>

        {/* Fun section toggle */}
        <button
          type="button"
          onClick={() => setShowFun((v) => !v)}
          class="flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <span class="flex items-center gap-2">
            <TbOutlineRocket size={15} />
            Fun scale
          </span>
          <TbOutlineChevronDown
            size={14}
            class={cn(
              "transition-transform duration-200",
              showFun() && "rotate-180",
            )}
          />
        </button>

        <Show when={showFun()}>
          <div class="-mt-3 rounded-b-lg border border-t-0 border-primary/20 bg-card">
            <div class="space-y-0.5 p-3">
              <For each={funLengthUnitKeys}>
                {(unit) => {
                  const converted = createMemo(() => {
                    const n = numericValue();
                    if (isNaN(n)) return "—";
                    return fmtFun(
                      convert(
                        n,
                        lengthUnits[fromUnit()].factor,
                        funLengthUnits[unit].factor,
                      ),
                    );
                  });

                  return (
                    <div class="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/40">
                      <div class="flex items-center gap-3">
                        <span class="text-base leading-none">
                          {funLengthUnits[unit].emoji}
                        </span>
                        <div>
                          <div class="font-medium">
                            {funLengthUnits[unit].label}
                          </div>
                          <div class="text-xs text-muted-foreground">
                            {funLengthUnits[unit].description}
                          </div>
                        </div>
                      </div>
                      <span class="font-mono text-sm">{converted()}</span>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </main>
  );
}
