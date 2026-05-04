import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { TbOutlineArrowsExchange } from 'solid-icons/tb'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar } from '~/components/tool-toolbar'
import { setToolPageMeta } from '~/lib/seo'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { computeOutputNumber, NumberMode, validateNumberBase } from '~/lib/utils/numbers/converter'
import { cn } from '~/lib/utils'

type BaseOption = {
  label: string
  value: string
  disabled?: boolean
}

type ModeOption = {
  mode: NumberMode
  label: string
  disabled?: boolean
}

const baseOptions: BaseOption[] = [
  { label: 'Binary', value: '2' },
  { label: 'Octal', value: '8' },
  { label: 'Decimal', value: '10' },
  { label: 'Hexadecimal', value: '16' },
  { label: 'Custom', value: 'custom' },
]

const modeOptions: ModeOption[] = [
  { mode: NumberMode.INT, label: 'Integer' },
  { mode: NumberMode.INT32, label: '32-bit integer' },
  { mode: NumberMode.FLOAT32, label: 'Float 32' },
  { mode: NumberMode.FLOAT64, label: 'Float 64' },
]

function parseSelectedParam(param: string | undefined, fallback: string): string {
  if (!param) return fallback
  if (baseOptions.some((o) => o.value === param)) return param
  return 'custom'
}

function parseValueParam(param: string | undefined, fallback: number): number {
  if (!param) return fallback
  const parsed = Number(param)
  if (Number.isNaN(parsed)) return fallback
  return parsed
}

function parseModeParam(param: string | undefined): NumberMode {
  const values = Object.values(NumberMode) as NumberMode[]
  return values.includes(param as NumberMode) ? (param as NumberMode) : NumberMode.INT
}

export default function BaseConverter() {
  setToolPageMeta('numbers', 'base-converter')

  const [searchParams, setParams] = useSearchParams<{
    value?: string
    mode?: string
    valueBase?: string
    targetBase?: string
  }>()

  const [value, setValue] = createSignal(searchParams.value ?? '')
  const [inputError, setInputError] = createSignal<string | null>(null)

  const [selectedValueBase, setSelectedValueBase] = createSignal(parseSelectedParam(searchParams.valueBase, '10'))
  const [selectedTargetBase, setSelectedTargetBase] = createSignal(parseSelectedParam(searchParams.targetBase, '2'))
  const [valueBase, setValueBase] = createSignal(parseValueParam(searchParams.valueBase, 10))
  const [targetBase, setTargetBase] = createSignal(parseValueParam(searchParams.targetBase, 2))
  const [selectedMode, setSelectedMode] = createSignal<NumberMode>(parseModeParam(searchParams.mode))

  const outputNumber = createMemo(() => computeOutputNumber(value(), valueBase(), targetBase(), selectedMode()))

  // Validation feedback for the input number.
  createEffect(() => {
    const isValid = validateNumberBase(value(), valueBase(), selectedMode())
    setInputError(isValid === true ? null : isValid)
  })

  // Reflect select choices into numeric base values.
  createEffect(() => {
    const sel = selectedValueBase()
    if (sel !== 'custom') setValueBase(parseInt(sel, 10))
  })

  createEffect(() => {
    const sel = selectedTargetBase()
    if (sel !== 'custom') setTargetBase(parseInt(sel, 10))
  })

  // Keep editable state in URL for shareable links and reload persistence.
  createEffect(() => {
    const valueBaseParam = selectedValueBase() === 'custom' ? String(valueBase()) : selectedValueBase()
    const targetBaseParam = selectedTargetBase() === 'custom' ? String(targetBase()) : selectedTargetBase()
    setParams(
      {
        value: value() || undefined,
        mode: selectedMode() === NumberMode.INT ? undefined : selectedMode(),
        valueBase: valueBaseParam === '10' ? undefined : valueBaseParam,
        targetBase: targetBaseParam === '2' ? undefined : targetBaseParam,
      },
      { replace: true }
    )
  })

  // If both bases collide on a non-custom value, pick a different target.
  createEffect(() => {
    const sel = selectedValueBase()
    if (sel !== 'custom' && sel === selectedTargetBase()) {
      const fallback = sel === '2' ? '10' : '2'
      setSelectedTargetBase(fallback)
      setTargetBase(parseInt(fallback, 10))
    }
  })

  const valueBaseOption = createMemo(() => baseOptions.find((o) => o.value === selectedValueBase()))

  // Target options carry a per-option disabled flag that mirrors the input base.
  const targetOptionsForSelect = createMemo<BaseOption[]>(() =>
    baseOptions.map((o) => ({
      ...o,
      disabled: o.value !== 'custom' && o.value === selectedValueBase(),
    }))
  )

  const targetBaseOption = createMemo(() => targetOptionsForSelect().find((o) => o.value === selectedTargetBase()))

  const valueBaseOutOfRange = () => valueBase() < 2 || valueBase() > 36
  const targetBaseOutOfRange = () => targetBase() < 2 || targetBase() > 36
  const isFloatModeDisabled = () => targetBase() !== 2 || valueBase() !== 10

  const modeOptionsForSelect = createMemo<ModeOption[]>(() =>
    modeOptions.map((o) => ({
      ...o,
      disabled: isFloatModeDisabled() && (o.mode === NumberMode.FLOAT32 || o.mode === NumberMode.FLOAT64),
    }))
  )

  const selectedModeOption = createMemo(() => modeOptionsForSelect().find((o) => o.mode === selectedMode()))

  function swapBases() {
    const fromSel = selectedValueBase()
    const toSel = selectedTargetBase()
    if (fromSel === toSel && fromSel !== 'custom') return
    const fromNum = valueBase()
    const toNum = targetBase()
    setSelectedValueBase(toSel)
    setValueBase(toNum)
    setSelectedTargetBase(fromSel)
    setTargetBase(fromNum)
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Base converter"
        description="Convert numbers between binary, octal, decimal, hexadecimal, and any custom base from 2 to 36."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Number mode</span>
          <Select<ModeOption>
            options={modeOptionsForSelect()}
            optionValue="mode"
            optionTextValue="label"
            optionDisabled="disabled"
            value={selectedModeOption()}
            onChange={(opt) => opt && setSelectedMode(opt.mode)}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
            )}
          >
            <SelectTrigger aria-label="Number mode" class="h-8 w-44 text-sm">
              <SelectValue<ModeOption>>{(state) => state.selectedOption()?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
          <Show when={isFloatModeDisabled()}>
            <span class="text-xs text-muted-foreground">Float modes require input 10 → target 2.</span>
          </Show>
        </ToolToolbar>

        {/* Converter card: input + bases + output, all together */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-8">
            {/* Input side */}
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span aria-hidden class="size-2 rounded-full bg-violet" />
                  <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
                </div>
                <BaseSelector
                  label="From"
                  options={baseOptions}
                  selected={valueBaseOption()}
                  onSelect={(v) => setSelectedValueBase(v)}
                />
              </div>

              <TextField
                value={value()}
                onChange={setValue}
                validationState={inputError() ? 'invalid' : 'valid'}
                class="flex flex-1 flex-col"
              >
                <div class="relative flex-1 min-h-[8.25rem]">
                  <TextFieldTextArea
                    autofocus
                    rows={5}
                    class="absolute inset-0 resize-none font-mono text-base leading-relaxed"
                    placeholder="Type or paste a number"
                  />
                  <TextFieldErrorMessage class="absolute top-full mt-1.5 left-0">{inputError()}</TextFieldErrorMessage>
                </div>
              </TextField>

              <Show when={selectedValueBase() === 'custom'}>
                <NumberField
                  rawValue={valueBase()}
                  onRawValueChange={(v) => setValueBase(Number.isNaN(v) ? 0 : v)}
                  minValue={2}
                  maxValue={36}
                  step={1}
                  format={false}
                  validationState={valueBaseOutOfRange() ? 'invalid' : 'valid'}
                  class="flex flex-col gap-2"
                >
                  <Label class="text-xs text-muted-foreground">Custom input base (2–36)</Label>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 12" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                  <Show when={valueBaseOutOfRange()}>
                    <NumberFieldErrorMessage>Input base must be between 2 and 36</NumberFieldErrorMessage>
                  </Show>
                </NumberField>
              </Show>
            </div>

            {/* Swap pivot */}
            <div class="flex items-center justify-center lg:pt-9">
              <button
                type="button"
                onClick={swapBases}
                aria-label="Swap input and target bases"
                class={cn(
                  'group inline-flex size-10 items-center justify-center border border-border bg-background text-muted-foreground',
                  'transition-[transform,border-color,color,background-color] duration-200 ease-out cursor-pointer',
                  'hover:rotate-180 hover:border-violet hover:text-violet hover:bg-violet/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <TbOutlineArrowsExchange size={18} class="lg:rotate-0 rotate-90" />
              </button>
            </div>

            {/* Output side */}
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span aria-hidden class="size-2 rounded-full bg-violet" />
                  <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
                </div>
                <BaseSelector
                  label="To"
                  options={targetOptionsForSelect()}
                  selected={targetBaseOption()}
                  onSelect={(v) => setSelectedTargetBase(v)}
                />
              </div>

              <Show
                when={outputNumber()}
                fallback={
                  <div class="flex min-h-[8.25rem] flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div
                  class="anim-fade-up flex flex-1 items-start gap-3 overflow-hidden rounded-md border border-border px-4 py-3"
                  data-output={outputNumber()}
                >
                  <span class="flex-1 font-mono text-base leading-relaxed break-all">{outputNumber()}</span>
                  <CopyButton value={() => outputNumber()} />
                </div>
              </Show>

              <Show when={selectedTargetBase() === 'custom'}>
                <NumberField
                  rawValue={targetBase()}
                  onRawValueChange={(v) => setTargetBase(Number.isNaN(v) ? 0 : v)}
                  minValue={2}
                  maxValue={36}
                  step={1}
                  format={false}
                  validationState={targetBaseOutOfRange() ? 'invalid' : 'valid'}
                  class="flex flex-col gap-2"
                >
                  <Label class="text-xs text-muted-foreground">Custom target base (2–36)</Label>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 12" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                  <Show when={targetBaseOutOfRange()}>
                    <NumberFieldErrorMessage>Target base must be between 2 and 36</NumberFieldErrorMessage>
                  </Show>
                </NumberField>
              </Show>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

type BaseSelectorProps = {
  label: string
  options: BaseOption[]
  selected: BaseOption | undefined
  onSelect: (value: string) => void
}

function BaseSelector(props: BaseSelectorProps) {
  return (
    <Select<BaseOption>
      options={props.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      value={props.selected}
      onChange={(opt) => opt && props.onSelect(opt.value)}
      itemComponent={(itemProps) => <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>}
    >
      <SelectTrigger aria-label={props.label} class="h-8 w-auto min-w-[8.5rem] gap-2 px-3 text-xs font-medium">
        <span class="text-muted-foreground">{props.label}</span>
        <SelectValue<BaseOption> class="ml-1">{(state) => state.selectedOption()?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  )
}
