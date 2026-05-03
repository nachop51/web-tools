import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
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
import { volumeUnitKeys, volumeUnits } from '~/lib/utils/units/volume'
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'

type UnitOption = { label: string; value: string }

const unitOptions: UnitOption[] = volumeUnitKeys.map((key) => ({
  label: volumeUnits[key].label,
  value: key,
}))

function fmt(n: number): string {
  if (!isFinite(n)) return '—'
  return parseFloat(n.toPrecision(8)).toString()
}

export default function VolumeConverter() {
  setToolPageMeta('units', 'volume')
  const [params, setParams] = useSearchParams<{ from?: string; to?: string }>()

  const initialFrom = params.from && volumeUnits[params.from] ? params.from : 'l'

  const [inputValue, setInputValue] = createSignal('')
  const [fromUnit, setFromUnit] = createSignal(initialFrom)

  const numericValue = createMemo(() => parseFloat(inputValue()))

  const isInvalid = createMemo(() => inputValue().length > 0 && isNaN(numericValue()))

  const hasValue = createMemo(() => inputValue().length > 0 && !isNaN(numericValue()))

  const selectedOption = createMemo(() => unitOptions.find((o) => o.value === fromUnit()) ?? unitOptions[0])

  function handleFromChange(opt: UnitOption | null) {
    if (!opt) return
    setFromUnit(opt.value)
    setParams({ from: opt.value })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Volume converter"
        description="Convert between liters, gallons, cups, fluid ounces, and more."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
            <NumberField
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
              <For each={volumeUnitKeys}>
                {(unit) => {
                  const converted = createMemo(() =>
                    fmt(convert(numericValue(), volumeUnits[fromUnit()].factor, volumeUnits[unit].factor))
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
                        {volumeUnits[unit].label}
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
      </div>
    </main>
  )
}
