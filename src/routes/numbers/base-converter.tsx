import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import { setToolPageMeta } from "~/lib/seo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldTextArea,
} from "~/components/ui/text-field";
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import {
  computeOutputNumber,
  NumberMode,
  validateNumberBase,
} from "~/lib/utils/numbers/converter";
import { cn } from "~/lib/utils";

type BaseOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

const baseOptions: BaseOption[] = [
  { label: "Binary", value: "2" },
  { label: "Octal", value: "8" },
  { label: "Decimal", value: "10" },
  { label: "Hexadecimal", value: "16" },
  { label: "Custom", value: "custom" },
];

const modeOptions = [
  {
    title: "Integer only",
    description: "Accepts any integer numbers.",
    mode: NumberMode.INT,
  },
  {
    title: "32-bit Integer only",
    description: "Only 32-bit integer numbers.",
    mode: NumberMode.INT32,
  },
  {
    title: "Float 32 (Decimal & Binary)",
    description: "Floats with single precision.",
    mode: NumberMode.FLOAT32,
  },
  {
    title: "Float 64 (Decimal & Binary)",
    description: "Double precision floats.",
    mode: NumberMode.FLOAT64,
  },
];

function parseSelectedParam(param: string | undefined, fallback: string): string {
  if (!param) return fallback;
  if (baseOptions.some((o) => o.value === param)) return param;
  return "custom";
}

function parseValueParam(param: string | undefined, fallback: number): number {
  if (!param) return fallback;
  const parsed = Number(param);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

export default function BaseConverter() {
  setToolPageMeta("numbers", "base-converter");

  const [searchParams] = useSearchParams<{
    valueBase?: string;
    targetBase?: string;
  }>();

  const [value, setValue] = createSignal("");
  const [inputError, setInputError] = createSignal<string | null>(null);

  const [selectedValueBase, setSelectedValueBase] = createSignal(
    parseSelectedParam(searchParams.valueBase, "10"),
  );
  const [selectedTargetBase, setSelectedTargetBase] = createSignal(
    parseSelectedParam(searchParams.targetBase, "2"),
  );
  const [valueBase, setValueBase] = createSignal(
    parseValueParam(searchParams.valueBase, 10),
  );
  const [targetBase, setTargetBase] = createSignal(
    parseValueParam(searchParams.targetBase, 2),
  );
  const [selectedMode, setSelectedMode] = createSignal<NumberMode>(NumberMode.INT);

  const outputNumber = createMemo(() =>
    computeOutputNumber(value(), valueBase(), targetBase(), selectedMode()),
  );

  // Validation feedback for the input number.
  createEffect(() => {
    const isValid = validateNumberBase(value(), valueBase(), selectedMode());
    setInputError(isValid === true ? null : isValid);
  });

  // Reflect select choices into numeric base values.
  createEffect(() => {
    const sel = selectedValueBase();
    if (sel !== "custom") setValueBase(parseInt(sel, 10));
  });

  createEffect(() => {
    const sel = selectedTargetBase();
    if (sel !== "custom") setTargetBase(parseInt(sel, 10));
  });

  // If both bases collide on a non-custom value, swap the target.
  createEffect(() => {
    if (
      selectedValueBase() === selectedTargetBase() &&
      selectedValueBase() !== "custom"
    ) {
      setSelectedTargetBase("10");
      setTargetBase(valueBase() === 2 ? 10 : 2);
    }
  });

  const valueBaseOption = createMemo(() =>
    baseOptions.find((o) => o.value === selectedValueBase()),
  );

  // Target options carry a per-option disabled flag that mirrors the input base.
  const targetOptionsForSelect = createMemo<BaseOption[]>(() =>
    baseOptions.map((o) => ({
      ...o,
      disabled: o.value !== "custom" && o.value === selectedValueBase(),
    })),
  );

  const targetBaseOption = createMemo(() =>
    targetOptionsForSelect().find((o) => o.value === selectedTargetBase()),
  );

  const valueBaseOutOfRange = () => valueBase() < 2 || valueBase() > 36;
  const targetBaseOutOfRange = () => targetBase() < 2 || targetBase() > 36;
  const isFloatModeDisabled = () => targetBase() !== 2 || valueBase() !== 10;

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Base converter"
        description="Convert numbers between binary, octal, decimal, hexadecimal, and any custom base from 2 to 36."
      />

      <div class="anim-fade-up grid gap-6 md:grid-cols-2" style={{ "animation-delay": "60ms" }}>
        {/* Input column */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-lg font-semibold tracking-tight">Input number</h2>
          </div>

          <TextField
            value={value()}
            onChange={setValue}
            validationState={inputError() ? "invalid" : "valid"}
          >
            <TextFieldTextArea
              rows={4}
              class="font-mono"
              placeholder="Insert your number"
            />
            <TextFieldErrorMessage>{inputError()}</TextFieldErrorMessage>
          </TextField>

          <Separator class="my-6" />

          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Input settings
          </h3>

          <div class="space-y-4">
            <div class="space-y-2">
              <Select<BaseOption>
                options={baseOptions}
                optionValue="value"
                optionTextValue="label"
                value={valueBaseOption()}
                onChange={(opt) => opt && setSelectedValueBase(opt.value)}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>
                    {itemProps.item.rawValue.label}
                  </SelectItem>
                )}
              >
                <label class="mb-1 block text-sm font-medium">Input base</label>
                <SelectTrigger>
                  <SelectValue<BaseOption>>
                    {(state) => state.selectedOption()?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>

              <Show when={selectedValueBase() === "custom"}>
                <NumberField
                  rawValue={valueBase()}
                  onRawValueChange={(v) =>
                    setValueBase(Number.isNaN(v) ? 0 : v)
                  }
                  minValue={2}
                  maxValue={36}
                  step={1}
                  format={false}
                  validationState={valueBaseOutOfRange() ? "invalid" : "valid"}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="Enter custom base" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                  <Show when={valueBaseOutOfRange()}>
                    <NumberFieldErrorMessage>
                      Input base must be between 2 and 36
                    </NumberFieldErrorMessage>
                  </Show>
                </NumberField>
              </Show>
            </div>

            <div class="space-y-2">
              <Select<BaseOption>
                options={targetOptionsForSelect()}
                optionValue="value"
                optionTextValue="label"
                optionDisabled="disabled"
                value={targetBaseOption()}
                onChange={(opt) => opt && setSelectedTargetBase(opt.value)}
                itemComponent={(itemProps) => (
                  <SelectItem item={itemProps.item}>
                    {itemProps.item.rawValue.label}
                  </SelectItem>
                )}
              >
                <label class="mb-1 block text-sm font-medium">Target base</label>
                <SelectTrigger>
                  <SelectValue<BaseOption>>
                    {(state) => state.selectedOption()?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>

              <Show when={selectedTargetBase() === "custom"}>
                <NumberField
                  rawValue={targetBase()}
                  onRawValueChange={(v) =>
                    setTargetBase(Number.isNaN(v) ? 0 : v)
                  }
                  minValue={2}
                  maxValue={36}
                  step={1}
                  format={false}
                  validationState={targetBaseOutOfRange() ? "invalid" : "valid"}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="Enter custom base" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                  <Show when={targetBaseOutOfRange()}>
                    <NumberFieldErrorMessage>
                      Target base must be between 2 and 36
                    </NumberFieldErrorMessage>
                  </Show>
                </NumberField>
              </Show>
            </div>
          </div>

          <Separator class="my-6" />

          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Mode
          </h3>
          <div class="space-y-2">
            <For each={modeOptions}>
              {(option) => {
                const isDisabled = () =>
                  isFloatModeDisabled() &&
                  (option.mode === NumberMode.FLOAT32 ||
                    option.mode === NumberMode.FLOAT64);
                return (
                  <button
                    type="button"
                    class={cn(
                      "block w-full rounded-md border-2 px-4 py-2 text-left text-sm",
                      "transition-[border-color,background-color,transform] duration-150 ease-out",
                      "hover:border-violet/60 hover:bg-violet/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input disabled:hover:bg-transparent",
                      selectedMode() === option.mode
                        ? "border-violet bg-violet/10"
                        : "border-input",
                    )}
                    onClick={() => setSelectedMode(option.mode)}
                    disabled={isDisabled()}
                  >
                    <span class="block text-base font-semibold">{option.title}</span>
                    <span class="text-muted-foreground">{option.description}</span>
                  </button>
                );
              }}
            </For>
          </div>
        </section>

        {/* Output column */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-lg font-semibold tracking-tight">Output number</h2>
            </div>
            <CopyButton value={() => outputNumber()} />
          </div>
          <Show
            when={outputNumber()}
            fallback={
              <div class="flex min-h-[7rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Result will appear here
              </div>
            }
          >
            <div
              class="anim-fade-up rounded-md border border-violet/30 bg-violet/5 p-4 font-mono text-base break-all"
              // re-mount the animation when the output value changes
              data-output={outputNumber()}
            >
              {outputNumber()}
            </div>
          </Show>
        </section>
      </div>
    </main>
  );
}
