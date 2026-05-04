import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { TbOutlineChevronDown, TbOutlineRocket } from 'solid-icons/tb'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { convert } from '~/lib/utils/units/converter'
import { funLengthUnitKeys, funLengthUnits, lengthUnitKeys, lengthUnits } from '~/lib/utils/units/length'
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'

type UnitOption = { label: string; value: string }

const unitOptions: UnitOption[] = lengthUnitKeys.map((key) => ({
  label: lengthUnits[key].label,
  value: key,
}))

function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  return parseFloat(n.toPrecision(8)).toString()
}

function fmtFun(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e6 || abs < 0.001) return n.toExponential(3)
  return parseFloat(n.toPrecision(6)).toString()
}

export default function LengthConverter() {
  setToolPageMeta('units', 'length')
  const [params, setParams] = useSearchParams<{ from?: string; to?: string; v?: string }>()

  const initialFrom = params.from && lengthUnits[params.from] ? params.from : 'km'

  const [inputValue, setInputValueSignal] = createSignal(params.v ?? '')
  const [fromUnit, setFromUnit] = createSignal(initialFrom)
  const [showFun, setShowFun] = createSignal(false)

  function setInputValue(v: string) {
    setInputValueSignal(v)
    setParams({ v: v || undefined }, { replace: true })
  }

  const numericValue = createMemo(() => parseFloat(inputValue()))

  const isInvalid = createMemo(() => inputValue().length > 0 && isNaN(numericValue()))

  const hasValue = createMemo(() => inputValue().length > 0 && !isNaN(numericValue()))

  const selectedOption = createMemo(() => unitOptions.find((o) => o.value === fromUnit()) ?? unitOptions[1])

  function handleFromChange(opt: UnitOption | null) {
    if (!opt) return
    setFromUnit(opt.value)
    setParams({ from: opt.value }, { replace: true })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Length converter"
        description="Convert between meters, kilometers, miles, feet, inches, and more."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
            <NumberField
              value={inputValue()}
              onChange={setInputValue}
              format={false}
              validationState={isInvalid() ? 'invalid' : 'valid'}
              class="flex flex-col gap-2"
            >
              <NumberFieldGroup>
                <NumberFieldInput autofocus placeholder="Enter a value..." class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
              <Show when={isInvalid()}>
                <NumberFieldErrorMessage>Enter a valid number</NumberFieldErrorMessage>
              </Show>
            </NumberField>

            <Select<UnitOption>
              options={unitOptions}
              optionValue="value"
              optionTextValue="label"
              value={selectedOption()}
              onChange={handleFromChange}
              itemComponent={(itemProps) => (
                <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
              )}
            >
              <SelectTrigger aria-label="From unit" class="h-12 w-full md:w-56">
                <SelectValue<UnitOption>>{(state) => state.selectedOption()?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Conversions</h2>
          </div>

          <Show
            when={hasValue()}
            fallback={<div class="px-4 py-10 text-center text-sm text-muted-foreground">Enter a value above</div>}
          >
            <div class="anim-fade-up overflow-hidden rounded-md border border-border">
              <For each={lengthUnitKeys}>
                {(unit) => {
                  const converted = createMemo(() =>
                    fmt(convert(numericValue(), lengthUnits[fromUnit()].factor, lengthUnits[unit].factor))
                  )

                  return (
                    <div
                      class={cn(
                        'flex items-center gap-3 border-t border-border/50 px-4 py-2.5 text-sm transition-colors hover:bg-violet/5',
                        unit === fromUnit() && 'bg-violet/5'
                      )}
                    >
                      <span
                        class={cn(
                          'w-44 shrink-0',
                          unit === fromUnit() ? 'font-semibold text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {lengthUnits[unit].label}
                      </span>
                      <span class="flex-1 text-right font-mono tabular-nums">{converted()}</span>
                      <CopyButton value={() => converted()} />
                    </div>
                  )
                }}
              </For>
            </div>
          </Show>
        </section>

        {/* Fun scale */}
        <section class="relative rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
          <button
            type="button"
            onClick={() => setShowFun((v) => !v)}
            aria-expanded={showFun()}
            class={cn(
              'flex w-full items-center justify-between gap-3 p-6 sm:p-8 text-left cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg'
            )}
          >
            <span class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fun scale</h2>
              <TbOutlineRocket size={15} class="ml-1 text-violet" aria-hidden />
            </span>
            <TbOutlineChevronDown
              size={16}
              class={cn('text-muted-foreground transition-transform duration-200', showFun() && 'rotate-180')}
              aria-hidden
            />
          </button>

          <Show when={showFun()}>
            <div class="border-t border-border px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
              <Show
                when={hasValue()}
                fallback={
                  <div class="px-4 py-10 text-center text-sm text-muted-foreground">
                    Enter a value to see fun comparisons
                  </div>
                }
              >
                <div class="anim-fade-up overflow-hidden rounded-md border border-border">
                  <For each={funLengthUnitKeys}>
                    {(unit) => {
                      const converted = createMemo(() =>
                        fmtFun(convert(numericValue(), lengthUnits[fromUnit()].factor, funLengthUnits[unit].factor))
                      )

                      return (
                        <div class="flex items-center gap-3 border-t border-border/50 px-4 py-2.5 text-sm transition-colors hover:bg-violet/5">
                          <span class="shrink-0 text-base leading-none">{funLengthUnits[unit].emoji}</span>
                          <div class="w-40 shrink-0">
                            <div class="font-medium text-foreground">{funLengthUnits[unit].label}</div>
                            <div class="text-xs text-muted-foreground">{funLengthUnits[unit].description}</div>
                          </div>
                          <span class="flex-1 text-right font-mono tabular-nums">{converted()}</span>
                          <CopyButton value={() => converted()} />
                        </div>
                      )
                    }}
                  </For>
                </div>
              </Show>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
