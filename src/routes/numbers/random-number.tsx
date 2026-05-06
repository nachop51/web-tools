import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { TbOutlineCheck, TbOutlineCopy } from 'solid-icons/tb'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented, ToolbarChip } from '~/components/tool-toolbar'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { computeStats, generateBatch, rollDice } from '~/lib/utils/numbers/random'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'

type Mode = 'int' | 'float' | 'gaussian' | 'dice'
type DieSides = 4 | 6 | 8 | 10 | 12 | 20 | 100
type SortOrder = 'none' | 'asc' | 'desc'
type SepId = 'newline' | 'comma' | 'space' | 'tab'

type SearchParams = {
  mode?: string
  min?: string
  max?: string
  count?: string
  decimals?: string
  mean?: string
  std?: string
  die?: string
  ndice?: string
  unique?: string
  sort?: string
  sep?: string
}

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'int', label: 'Integer' },
  { value: 'float', label: 'Float' },
  { value: 'gaussian', label: 'Gaussian' },
  { value: 'dice', label: 'Dice' },
]

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'asc', label: 'Asc ↑' },
  { value: 'desc', label: 'Desc ↓' },
]

const DIE_TYPES: DieSides[] = [4, 6, 8, 10, 12, 20, 100]

const SEP_OPTIONS: { id: SepId; label: string; char: string }[] = [
  { id: 'newline', label: '↵', char: '\n' },
  { id: 'comma', label: ',', char: ', ' },
  { id: 'space', label: '·', char: ' ' },
  { id: 'tab', label: '⇥', char: '\t' },
]

const isMode = (v?: string): v is Mode => ['int', 'float', 'gaussian', 'dice'].includes(v ?? '')
const isSortOrder = (v?: string): v is SortOrder => ['none', 'asc', 'desc'].includes(v ?? '')
const isSepId = (v?: string): v is SepId => ['newline', 'comma', 'space', 'tab'].includes(v ?? '')
const isDieSides = (v?: string): v is DieSides => [4, 6, 8, 10, 12, 20, 100].includes(Number(v ?? '0'))

export default function RandomNumberTool() {
  setToolPageMeta('numbers', 'random-number')
  const [params, setParams] = useSearchParams<SearchParams>()

  // Mode
  const mode = createMemo<Mode>(() => (isMode(params.mode) ? params.mode : 'int'))

  // Shared
  const [count, setCountSignal] = createSignal(params.count ?? '5')
  const [unique, setUniqueSignal] = createSignal(params.unique === '1')
  const [sortOrder, setSortOrderSignal] = createSignal<SortOrder>(isSortOrder(params.sort) ? params.sort : 'none')
  const [sep, setSepSignal] = createSignal<SepId>(isSepId(params.sep) ? params.sep : 'newline')
  const [bypassWarning, setBypassWarningSignal] = createSignal(false)

  // Int/Float
  const [min, setMinSignal] = createSignal(params.min ?? '0')
  const [max, setMaxSignal] = createSignal(params.max ?? '10')
  const [decimals, setDecimalsSignal] = createSignal(params.decimals ?? '2')

  // Gaussian
  const [mean, setMeanSignal] = createSignal(params.mean ?? '0')
  const [std, setStdSignal] = createSignal(params.std ?? '1')

  // Dice
  const [dieSides, setDieSidesSignal] = createSignal<DieSides>(isDieSides(params.die) ? (Number(params.die) as DieSides) : 6)
  const [ndice, setNdiceSignal] = createSignal(params.ndice ?? '1')

  // Output
  const [results, setResults] = createSignal<number[]>([])
  const [animKey, setAnimKey] = createSignal(0)

  // Setters that sync URL params
  function setMin(v: string) {
    setMinSignal(v)
    setParams({ min: v || undefined }, { replace: true })
  }
  function setMax(v: string) {
    setMaxSignal(v)
    setParams({ max: v || undefined }, { replace: true })
  }
  function setCount(v: string) {
    setCountSignal(v)
    setParams({ count: v || undefined }, { replace: true })
  }
  function setDecimals(v: string) {
    setDecimalsSignal(v)
    setParams({ decimals: v || undefined }, { replace: true })
  }
  function setMean(v: string) {
    setMeanSignal(v)
    setParams({ mean: v || undefined }, { replace: true })
  }
  function setStd(v: string) {
    setStdSignal(v)
    setParams({ std: v || undefined }, { replace: true })
  }
  function setDieSides(v: DieSides) {
    setDieSidesSignal(v)
    setParams({ die: String(v) }, { replace: true })
  }
  function setNdice(v: string) {
    setNdiceSignal(v)
    setParams({ ndice: v || undefined }, { replace: true })
  }
  function setUnique(v: boolean) {
    setUniqueSignal(v)
    setParams({ unique: v ? '1' : undefined }, { replace: true })
  }
  function setSortOrder(v: SortOrder) {
    setSortOrderSignal(v)
    setParams({ sort: v === 'none' ? undefined : v }, { replace: true })
  }
  function setSep(v: SepId) {
    setSepSignal(v)
    setParams({ sep: v === 'newline' ? undefined : v }, { replace: true })
  }

  // Memos
  const countNum = createMemo(() => Math.max(1, parseInt(count(), 10) || 1))
  const decimalsNum = createMemo(() => Math.min(20, Math.max(0, parseInt(decimals(), 10) || 0)))
  const ndiceNum = createMemo(() => Math.min(20, Math.max(1, parseInt(ndice(), 10) || 1)))

  const isDangerousCount = createMemo(() => countNum() > 100000 && !bypassWarning())

  const isInvalid = createMemo(() => {
    if (mode() === 'int' || mode() === 'float') {
      const minN = parseFloat(min())
      const maxN = parseFloat(max())
      return isNaN(minN) || isNaN(maxN) || minN > maxN
    }
    if (mode() === 'gaussian') {
      const stdN = parseFloat(std())
      return isNaN(parseFloat(mean())) || isNaN(stdN) || stdN <= 0
    }
    return false
  })

  const sepChar = createMemo(() => SEP_OPTIONS.find((s) => s.id === sep())?.char ?? '\n')
  const outputText = createMemo(() => results().join(sepChar()))
  const stats = createMemo(() => (results().length > 1 ? computeStats(results()) : null))

  function generate() {
    if (isInvalid() || isDangerousCount()) return

    let raw: number[]

    if (mode() === 'dice') {
      raw = Array.from({ length: countNum() }, () => rollDice(dieSides(), ndiceNum()).reduce((a, b) => a + b, 0))
    } else {
      raw = generateBatch({
        mode: mode() as 'int' | 'float' | 'gaussian',
        min: parseFloat(min()),
        max: parseFloat(max()),
        count: countNum(),
        decimals: decimalsNum(),
        unique: unique(),
        mean: parseFloat(mean()),
        std: parseFloat(std()),
      })
    }

    const sorted =
      sortOrder() === 'asc'
        ? [...raw].sort((a, b) => a - b)
        : sortOrder() === 'desc'
          ? [...raw].sort((a, b) => b - a)
          : raw

    setResults(sorted)
    setAnimKey((k) => k + 1)
  }

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement | null
        if (target?.tagName === 'TEXTAREA') return
        e.preventDefault()
        generate()
      }
    }
    document.addEventListener('keydown', handler)
    onCleanup(() => document.removeEventListener('keydown', handler))
  })

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader category="numbers" name="Random number generator" description="Generate random values from uniform, Gaussian, or dice distributions." />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Toolbar */}
        <ToolToolbar>
          <ToolbarSegmented label="Mode" value={mode()} onChange={(v) => setParams({ mode: v }, { replace: true })} options={MODE_OPTIONS} />

          <div class="flex-1" aria-hidden />

          <Show when={mode() === 'int' || mode() === 'float'}>
            <ToolbarChip checked={unique()} onChange={setUnique}>
              Unique
            </ToolbarChip>
          </Show>

          <ToolbarSegmented label="Sort" value={sortOrder()} onChange={setSortOrder} options={SORT_OPTIONS} />
        </ToolToolbar>

        {/* Two-column grid */}
        <div class="grid items-stretch gap-6 lg:grid-cols-[22rem_1fr]">
          {/* Config card */}
          <section class="relative flex max-h-[60vh] flex-col overflow-hidden rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configuration</h2>
            </div>

            {/* INT / FLOAT mode */}
            <Show when={mode() === 'int' || mode() === 'float'}>
              {/* Min / Max */}
              <div class="grid grid-cols-2 gap-3">
                <NumberField value={min() || undefined} onChange={setMin} format={false} class="flex flex-col gap-1.5">
                  <NumberFieldLabel>Min</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput ref={inputRef} placeholder="-100" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>

                <NumberField value={max() || undefined} onChange={setMax} format={false} class="flex flex-col gap-1.5">
                  <NumberFieldLabel>Max</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="100" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>

              {/* Count / Decimals */}
              <div class="mt-3 grid grid-cols-2 gap-3">
                <NumberField value={count() || undefined} onChange={setCount} minValue={1} maxValue={1000000} format={false} class="flex flex-col gap-1.5">
                  <NumberFieldLabel>Count</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="10" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>

                <Show when={mode() === 'float'} fallback={<div aria-hidden />}>
                  <NumberField
                    value={decimals() || undefined}
                    onChange={setDecimals}
                    minValue={0}
                    maxValue={20}
                    format={false}
                    class="flex flex-col gap-1.5"
                  >
                    <NumberFieldLabel>Decimals</NumberFieldLabel>
                    <NumberFieldGroup>
                      <NumberFieldInput placeholder="2" class="h-11 font-mono text-sm" />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                </Show>
              </div>
            </Show>

            {/* GAUSSIAN mode */}
            <Show when={mode() === 'gaussian'}>
              {/* Mean / Std */}
              <div class="grid grid-cols-2 gap-3">
                <NumberField value={mean() || undefined} onChange={setMean} format={false} class="flex flex-col gap-1.5">
                  <NumberFieldLabel>Mean</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="0" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>

                <NumberField value={std() || undefined} onChange={setStd} format={false} class="flex flex-col gap-1.5">
                  <NumberFieldLabel>Std Dev</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="1" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>

              {/* Count / Decimals */}
              <div class="mt-3 grid grid-cols-2 gap-3">
                <NumberField value={count() || undefined} onChange={setCount} minValue={1} maxValue={1000000} format={false} class="flex flex-col gap-1.5">
                  <NumberFieldLabel>Count</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="10" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>

                <NumberField
                  value={decimals() || undefined}
                  onChange={setDecimals}
                  minValue={0}
                  maxValue={20}
                  format={false}
                  class="flex flex-col gap-1.5"
                >
                  <NumberFieldLabel>Decimals</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="2" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>

              {/* Int/Float output toggle */}
              <div class="mt-3">
                <ToolbarSegmented
                  label="Output"
                  value={decimalsNum() === 0 ? 'int' : 'float'}
                  onChange={(v) => setDecimals(v === 'int' ? '0' : '2')}
                  options={[
                    { value: 'int', label: 'Integer' },
                    { value: 'float', label: 'Float' },
                  ]}
                />
              </div>
            </Show>

            {/* DICE mode */}
            <Show when={mode() === 'dice'}>
              {/* Die type picker */}
              <div class="space-y-2">
                <p class="text-sm font-medium">Die type</p>
                <div role="radiogroup" aria-label="Die type" class="grid grid-cols-4 gap-2">
                  <For each={DIE_TYPES}>
                    {(sides) => {
                      const isSelected = () => dieSides() === sides
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected()}
                          onClick={() => setDieSides(sides)}
                          class={cn(
                            'border py-2 text-sm font-mono font-medium cursor-pointer transition-[border-color,background-color,color] duration-150',
                            isSelected() ? 'border-violet bg-violet text-white' : 'border-border bg-background text-foreground hover:border-violet/60 hover:bg-violet/5'
                          )}
                        >
                          d{sides}
                        </button>
                      )
                    }}
                  </For>
                </div>
              </div>

              {/* N dice + roll count */}
              <div class="mt-3 grid grid-cols-2 gap-3">
                <NumberField
                  value={ndice() || undefined}
                  onChange={setNdice}
                  minValue={1}
                  maxValue={20}
                  format={false}
                  class="flex flex-col gap-1.5"
                >
                  <NumberFieldLabel>Dice/roll (N)</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="1" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>

                <NumberField
                  value={count() || undefined}
                  onChange={setCount}
                  minValue={1}
                  maxValue={1000000}
                  format={false}
                  class="flex flex-col gap-1.5"
                >
                  <NumberFieldLabel>Rolls</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="10" class="h-11 font-mono text-sm" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>

              {/* NdX notation */}
              <p class="mt-2 text-xs text-muted-foreground">
                Rolling <span class="font-mono text-foreground">{ndiceNum()}d{dieSides()}</span> × {countNum()} times
              </p>
            </Show>

            {/* Action row (pinned to bottom so config matches results height) */}
            <div class="mt-auto pt-6">
              <hr class="mb-6 border-border" />
              <Show when={isInvalid()}>
                <p class="mb-3 text-xs text-destructive">
                  <Show when={mode() === 'gaussian'} fallback="Min must be less than or equal to max.">
                    Std dev must be a positive number.
                  </Show>
                </p>
              </Show>
              <Show when={countNum() > 100000}>
                <label
                  class={cn(
                    'group mb-3 flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors',
                    bypassWarning()
                      ? 'border-warning/40 bg-warning/5'
                      : 'border-warning/60 bg-warning/10 hover:bg-warning/15'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={bypassWarning()}
                    onChange={(e) => setBypassWarningSignal(e.currentTarget.checked)}
                    class="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    class={cn(
                      'flex size-4 flex-shrink-0 items-center justify-center rounded-sm border transition-colors',
                      bypassWarning()
                        ? 'border-warning-foreground bg-warning-foreground text-warning'
                        : 'border-warning-foreground/60 bg-background'
                    )}
                  >
                    <Show when={bypassWarning()}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="size-3"
                      >
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </Show>
                  </span>
                  <span class="flex flex-1 items-center gap-2 text-xs leading-snug text-warning-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="size-4 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M12 9v4" />
                      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                      <path d="M12 16h.01" />
                    </svg>
                    <span>Count &gt; 100,000 may freeze this tab; acknowledge to proceed</span>
                  </span>
                </label>
              </Show>
              <Button class="w-full" onClick={generate} disabled={isInvalid() || isDangerousCount()}>
                Generate
              </Button>
              <p class="mt-2 text-center text-xs text-muted-foreground">or press ↵ Enter</p>
            </div>
          </section>

          {/* Output card */}
          <section class="relative flex max-h-[60vh] flex-col rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Show when={countNum() === 1} fallback="Results">
                    Result
                  </Show>
                </h2>
                <Show when={results().length > 1}>
                  <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {results().length} values
                  </span>
                </Show>
              </div>

              {/* Separator chips + copy button */}
              <div class="flex items-center gap-2">
                <Show when={results().length > 1}>
                  <div role="radiogroup" aria-label="Copy separator" class="flex gap-1">
                    <For each={SEP_OPTIONS}>
                      {(s) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={sep() === s.id}
                          onClick={() => setSep(s.id)}
                          title={s.id}
                          class={cn(
                            'border px-2 py-0.5 font-mono text-xs cursor-pointer transition-[border-color,background-color,color] duration-150',
                            sep() === s.id ? 'border-violet bg-violet text-white' : 'border-border bg-background text-muted-foreground hover:border-violet/60 hover:text-violet'
                          )}
                        >
                          {s.label}
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
                <CopyButton value={outputText} disabled={results().length === 0} />
              </div>
            </div>

            {/* Results display */}
            <div class="flex min-h-[20rem] flex-1 flex-col overflow-hidden">
              <Show
                when={results().length > 0}
                fallback={
                  <div class="flex flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Click Generate or press Enter
                  </div>
                }
              >
                <Show
                  when={results().length === 1}
                  fallback={<VirtualResultsGrid items={results()} animKey={animKey()} />}
                >
                  <div class="anim-fade-up flex flex-1 flex-col items-center justify-center gap-6" data-key={animKey()}>
                    <div class="break-all text-center font-mono text-7xl font-bold tracking-tight sm:text-8xl">{results()[0]}</div>
                    <CopyButton value={outputText} />
                  </div>
                </Show>
              </Show>
            </div>
          </section>
        </div>

        {/* Stats card */}
        <Show when={stats() !== null}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Statistics</h2>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              <For
                each={[
                  { label: 'Count', value: () => String(stats()!.count), tip: 'Number of values generated.' },
                  { label: 'Sum', value: () => String(stats()!.sum), tip: 'Total of all values added together.' },
                  { label: 'Min', value: () => String(stats()!.min), tip: 'Smallest value in the set.' },
                  { label: 'Max', value: () => String(stats()!.max), tip: 'Largest value in the set.' },
                  { label: 'Mean', value: () => stats()!.mean.toFixed(decimalsNum() || 2), tip: 'Average: sum divided by count.' },
                  { label: 'Median', value: () => String(stats()!.median), tip: 'Middle value when sorted (or average of the two middle values).' },
                  { label: 'Std Dev', value: () => stats()!.stdDev.toFixed(decimalsNum() || 2), tip: 'Population standard deviation: measure of spread around the mean.' },
                ]}
              >
                {(stat) => <StatCard label={stat.label} value={stat.value} tip={stat.tip} />}
              </For>
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}

type StatCardProps = {
  label: string
  value: () => string
  tip: string
}

function StatCard(props: StatCardProps) {
  const [copied, setCopied] = createSignal(false)

  async function handleCopy(e: MouseEvent) {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(props.value())
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Tooltip openDelay={250}>
      <TooltipTrigger
        as="div"
        class="group relative flex cursor-help flex-col gap-1 rounded-md border border-border bg-muted/30 px-3 py-2 transition-colors hover:border-violet/40"
      >
        <span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{props.label}</span>
        <span class="font-mono text-sm font-semibold tabular-nums">{props.value()}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${props.label}`}
          class={cn(
            'absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-[opacity,color,background-color] duration-150',
            'opacity-0 group-hover:opacity-100 hover:bg-violet/10 hover:text-violet focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
            copied() && 'opacity-100 text-violet'
          )}
        >
          <Show when={copied()} fallback={<TbOutlineCopy size={12} />}>
            <TbOutlineCheck size={12} />
          </Show>
        </button>
      </TooltipTrigger>
      <TooltipContent class="max-w-xs text-xs">{props.tip}</TooltipContent>
    </Tooltip>
  )
}

type VirtualResultsGridProps = {
  items: number[]
  animKey: number
}

const ROW_HEIGHT = 44 // 36px cell + 8px gap

function VirtualResultsGrid(props: VirtualResultsGridProps) {
  let scrollRef!: HTMLDivElement
  const [cols, setCols] = createSignal(5)

  onMount(() => {
    const updateCols = () => {
      const w = scrollRef?.clientWidth ?? 0
      if (w >= 1024) setCols(5)
      else if (w >= 540) setCols(4)
      else setCols(3)
    }
    updateCols()
    const observer = new ResizeObserver(updateCols)
    observer.observe(scrollRef)
    onCleanup(() => observer.disconnect())
  })

  const rowCount = createMemo(() => Math.ceil(props.items.length / cols()))

  const virtualizer = createVirtualizer({
    get count() {
      return rowCount()
    },
    getScrollElement: () => scrollRef,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  // Reset scroll to top whenever a new generation arrives
  createEffect(() => {
    props.animKey
    if (scrollRef) scrollRef.scrollTop = 0
  })

  return (
    <div ref={scrollRef} class="anim-fade-up flex-1 overflow-y-auto rounded-md" data-key={props.animKey}>
      <div class="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <For each={virtualizer.getVirtualItems()}>
          {(vRow) => {
            const rowItems = createMemo(() => {
              const c = cols()
              const start = vRow.index * c
              return props.items.slice(start, start + c)
            })
            return (
              <div
                class="absolute left-0 top-0 grid w-full gap-2"
                style={{
                  transform: `translateY(${vRow.start}px)`,
                  'grid-template-columns': `repeat(${cols()}, minmax(0, 1fr))`,
                  height: `${ROW_HEIGHT}px`,
                }}
              >
                <For each={rowItems()}>
                  {(n) => (
                    <div class="flex h-9 items-center justify-center rounded-md border border-border bg-muted/40 px-3 text-center font-mono text-sm tabular-nums">
                      {n}
                    </div>
                  )}
                </For>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
