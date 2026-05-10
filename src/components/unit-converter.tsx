import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { cn } from '~/lib/utils'

export type UnitRow = {
  /** Unit key, used for URL param `from` and to identify the active row. */
  key: string
  /** Display label, e.g. "Kilometers (km)". */
  label: string
}

type UnitConverterProps = {
  /** All units shown in the table & select. Order matches table row order. */
  units: UnitRow[]
  /**
   * Convert the numeric input from `from` unit to `to` unit.
   * Pure function — must be stable / referentially transparent for memos.
   */
  convert: (value: number, from: string, to: string) => number
  /** Default unit key when no `?from=` param present. */
  defaultUnit: string
  /** Optional default value for the input (for tools where 0 is meaningful, e.g. temp). */
  defaultValue?: string
  /** Quick-fill presets shown as chips under the input. e.g. ["1", "10", "100"]. */
  presets?: string[]
  /** Custom formatter for converted numbers. Defaults to 8-digit precision. */
  format?: (n: number) => string
  /** Optional label for the unit Select trigger (a11y). */
  selectLabel?: string
  /**
   * Optional grouping. When provided, a header row is rendered before each
   * group's units. Group keys must reference unit keys included in `units`.
   */
  groups?: { label: string; keys: string[] }[]
  /**
   * Optional content rendered beneath the conversions table. Receives the
   * current converter state so consumers (e.g. the length tool's fun scale)
   * can react to the same input/unit without re-wiring URL params.
   */
  extras?: (state: UnitConverterState) => JSX.Element
}

export type UnitConverterState = {
  /** Current from-unit key (live). */
  fromUnit: () => string
  /** Parsed numeric value of the input (NaN if empty/invalid). */
  numericValue: () => number
  /** Whether `numericValue()` is a usable finite number. */
  hasValue: () => boolean
}

function defaultFmt(n: number): string {
  if (!isFinite(n)) return '-'
  return parseFloat(n.toPrecision(8)).toString()
}

export function UnitConverter(props: UnitConverterProps) {
  const [params, setParams] = useSearchParams<{ from?: string; v?: string }>()

  const unitKeySet = createMemo(() => new Set(props.units.map((u) => u.key)))
  const initialFrom = props.units.some((u) => u.key === params.from)
    ? (params.from as string)
    : props.defaultUnit

  const [inputValue, setInputValueSignal] = createSignal(params.v ?? props.defaultValue ?? '')
  const [fromUnit, setFromUnitSignal] = createSignal(initialFrom)
  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  function setInputValue(v: string) {
    setInputValueSignal(v)
    setParams({ v: v || undefined }, { replace: true })
  }

  function setFromUnit(k: string) {
    if (!unitKeySet().has(k)) return
    setFromUnitSignal(k)
    setParams({ from: k === props.defaultUnit ? undefined : k }, { replace: true })
  }

  const numericValue = createMemo(() => parseFloat(inputValue()))
  const isInvalid = createMemo(() => inputValue().length > 0 && isNaN(numericValue()))
  const hasValue = createMemo(() => inputValue().length > 0 && !isNaN(numericValue()))

  type UnitOption = { label: string; value: string }
  const unitOptions = createMemo<UnitOption[]>(() =>
    props.units.map((u) => ({ label: u.label, value: u.key }))
  )
  const selectedOption = createMemo(
    () => unitOptions().find((o) => o.value === fromUnit()) ?? unitOptions()[0]
  )

  const fmt = (n: number) => (props.format ?? defaultFmt)(n)

  // Render rows — flat or grouped.
  const renderRows = () => {
    const byKey = new Map(props.units.map((u) => [u.key, u]))
    if (!props.groups) {
      return (
        <For each={props.units}>{(u) => <ConversionRow unit={u} {...rowState(u.key)} />}</For>
      )
    }
    return (
      <For each={props.groups}>
        {(group) => (
          <>
            <TableRow class="bg-muted/30 hover:bg-muted/30">
              <TableCell
                colSpan={3}
                class="px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
              >
                {group.label}
              </TableCell>
            </TableRow>
            <For each={group.keys}>
              {(k) => {
                const u = byKey.get(k)
                return (
                  <Show when={u}>
                    {(unit) => <ConversionRow unit={unit()} {...rowState(unit().key)} />}
                  </Show>
                )
              }}
            </For>
          </>
        )}
      </For>
    )
  }

  function rowState(unitKey: string) {
    const value = createMemo(() => {
      if (!hasValue()) return ''
      return fmt(props.convert(numericValue(), fromUnit(), unitKey))
    })
    return {
      active: () => unitKey === fromUnit(),
      value,
      onPivot: () => setFromUnit(unitKey),
    }
  }

  return (
    <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
      {/* Hero input row — chromeless, full-width */}
      <section aria-label="Input" class="flex flex-col gap-3">
        <div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
          <NumberField
            value={inputValue() || undefined}
            onChange={setInputValue}
            format={false}
            validationState={isInvalid() ? 'invalid' : 'valid'}
            class="flex flex-col gap-1.5"
          >
            <NumberFieldGroup>
              <NumberFieldInput
                ref={inputRef}
                placeholder="Enter a value…"
                class="h-14 font-mono text-2xl font-semibold tracking-tight md:text-3xl"
                inputMode="decimal"
              />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
            <Show when={isInvalid()}>
              <NumberFieldErrorMessage>Enter a valid number</NumberFieldErrorMessage>
            </Show>
          </NumberField>

          <Select<UnitOption>
            options={unitOptions()}
            optionValue="value"
            optionTextValue="label"
            value={selectedOption()}
            onChange={(opt) => opt && setFromUnit(opt.value)}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
            )}
          >
            <SelectTrigger
              aria-label={props.selectLabel ?? 'From unit'}
              class="h-14 w-full text-base font-medium md:w-64"
            >
              <SelectValue<UnitOption>>{(state) => state.selectedOption()?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </div>

        <Show when={props.presets && props.presets.length > 0}>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="mr-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">
              Quick fill
            </span>
            <For each={props.presets!}>
              {(p) => (
                <button
                  type="button"
                  onClick={() => setInputValue(p)}
                  class="cursor-pointer border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-violet/60 hover:bg-violet/5 hover:text-violet"
                >
                  {p}
                </button>
              )}
            </For>
          </div>
        </Show>
      </section>

      {/* Conversions table */}
      <section aria-label="Conversions" class="flex flex-col gap-3">
        <div class="flex items-baseline justify-between px-1">
          <div class="flex items-center gap-2">
            <span aria-hidden class="size-1.5 rounded-full bg-violet" />
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversions
            </h2>
          </div>
          <span class="text-[11px] text-muted-foreground/70">
            click a row to pivot
          </span>
        </div>

        <Show
          when={hasValue()}
          fallback={
            <div class="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
              Enter a value above to see conversions
            </div>
          }
        >
          <div class="anim-fade-up overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[55%]">Unit</TableHead>
                  <TableHead class="text-right">Value</TableHead>
                  <TableHead class="w-[64px] text-right" aria-label="Copy" />
                </TableRow>
              </TableHeader>
              <TableBody>{renderRows()}</TableBody>
            </Table>
          </div>
        </Show>
      </section>

      {props.extras?.({ fromUnit, numericValue, hasValue })}
    </div>
  )
}

type ConversionRowProps = {
  unit: UnitRow
  active: () => boolean
  value: () => string
  onPivot: () => void
}

function ConversionRow(props: ConversionRowProps) {
  return (
    <TableRow
      data-state={props.active() ? 'selected' : undefined}
      onClick={props.onPivot}
      class="cursor-pointer"
      title="Click to pivot to this unit"
    >
      <TableCell
        class={cn(
          'font-sans text-sm',
          props.active() ? 'font-semibold text-foreground' : 'text-foreground/80'
        )}
      >
        {props.unit.label}
      </TableCell>
      <TableCell
        class={cn(
          'text-right text-sm tabular-nums',
          props.active() ? 'font-semibold text-violet' : 'text-foreground'
        )}
      >
        {props.value()}
      </TableCell>
      <TableCell class="py-1 text-right hover:bg-transparent">
        <span onClick={(e) => e.stopPropagation()} class="inline-flex">
          <CopyButton value={() => props.value()} />
        </span>
      </TableCell>
    </TableRow>
  )
}
