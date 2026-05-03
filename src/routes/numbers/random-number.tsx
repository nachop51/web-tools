import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Button } from '~/components/ui/button'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { randomBatch } from '~/lib/utils/numbers/random'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'int' | 'float'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'int', label: 'Integer' },
  { value: 'float', label: 'Float' },
]

export default function RandomNumberTool() {
  setToolPageMeta('numbers', 'random-number')
  const [params, setParams] = useSearchParams<{ mode?: string }>()

  const [min, setMin] = createSignal('-100')
  const [max, setMax] = createSignal('100')
  const [count, setCount] = createSignal('10')
  const [decimals, setDecimals] = createSignal('2')
  const [results, setResults] = createSignal<number[]>([])
  const [animKey, setAnimKey] = createSignal(0)

  const mode = createMemo<Mode>(() => {
    const p = params.mode
    return p === 'float' ? 'float' : 'int'
  })

  const outputText = createMemo(() => results().join('\n'))

  const isInvalid = createMemo(() => {
    const minN = parseFloat(min())
    const maxN = parseFloat(max())
    return isNaN(minN) || isNaN(maxN) || minN > maxN
  })

  const countNum = createMemo(() => {
    return Math.min(100, Math.max(1, parseInt(count(), 10) || 1))
  })

  function generate() {
    const minN = parseFloat(min())
    const maxN = parseFloat(max())
    const countN = countNum()
    const decN = Math.min(20, Math.max(0, parseInt(decimals(), 10) || 0))

    if (isNaN(minN) || isNaN(maxN) || minN > maxN) return
    setResults(randomBatch(minN, maxN, countN, mode(), decN))
    setAnimKey((k) => k + 1)
  }

  onMount(() => {
    generate()

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

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Random number generator"
        description="Generate random integers or floats within a range."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Number mode"
            value={mode()}
            onChange={(v) => setParams({ mode: v })}
            options={modeOptions}
          />
        </ToolToolbar>

        <div class="grid gap-6 lg:grid-cols-[22rem_1fr]">
          {/* Controls */}
          <section class="relative flex flex-col rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configuration</h2>
            </div>

            {/* Min / Max */}
            <div class="grid grid-cols-2 gap-3">
              <NumberField value={min()} onChange={setMin} format={false} class="flex flex-col gap-1.5">
                <NumberFieldLabel>Min</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="-100" class="h-11 font-mono text-sm" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <NumberField value={max()} onChange={setMax} format={false} class="flex flex-col gap-1.5">
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
              <NumberField
                value={count()}
                onChange={setCount}
                minValue={1}
                maxValue={100}
                format={false}
                class="flex flex-col gap-1.5"
              >
                <NumberFieldLabel>Count</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="10" class="h-11 font-mono text-sm" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>

              <Show when={mode() === 'float'} fallback={<div aria-hidden />}>
                <NumberField
                  value={decimals()}
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

            <div class="mt-auto pt-6">
              <hr class="mb-6 border-border" />
              <Show when={isInvalid()}>
                <p class="mb-3 text-xs text-destructive">Min must be a number less than or equal to max.</p>
              </Show>
              <Button class="w-full" onClick={generate} disabled={isInvalid()}>
                Generate
              </Button>
              <p class="mt-2 text-center text-xs text-muted-foreground">or press ↵ Enter</p>
            </div>
          </section>

          {/* Output */}
          <section class="relative flex flex-col rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
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
              <Show when={results().length > 1}>
                <CopyButton value={outputText} />
              </Show>
            </div>

            <Show
              when={results().length > 0}
              fallback={
                <div class="flex min-h-[20rem] flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Click Generate or press Enter
                </div>
              }
            >
              <Show
                when={results().length === 1}
                fallback={
                  <div class="anim-fade-up grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5" data-key={animKey()}>
                    <For each={results()}>
                      {(n) => (
                        <div class="rounded-md border border-border bg-muted/40 px-3 py-2 text-center font-mono text-sm">
                          {n}
                        </div>
                      )}
                    </For>
                  </div>
                }
              >
                <div
                  class="anim-fade-up flex min-h-[20rem] flex-1 flex-col items-center justify-center gap-6"
                  data-key={animKey()}
                >
                  <div class="break-all text-center font-mono text-7xl font-bold tracking-tight sm:text-8xl">
                    {results()[0]}
                  </div>
                  <CopyButton value={outputText} />
                </div>
              </Show>
            </Show>
          </section>
        </div>
      </div>
    </main>
  )
}
