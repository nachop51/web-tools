import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Index, Show } from 'solid-js'
import { TbOutlineX } from 'solid-icons/tb'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { Button } from '~/components/ui/button'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { Separator } from '~/components/ui/separator'
import { gcdMany, lcmMany, gcdSteps } from '~/lib/utils/numbers/gcf-lcm'
import { setToolPageMeta } from '~/lib/seo'

function parseNums(s: string): number[] {
  return s
    .split(',')
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !isNaN(n) && n !== 0)
}

export default function GcfLcm() {
  setToolPageMeta('numbers', 'gcf-lcm')
  const [params, setParams] = useSearchParams<{ nums?: string }>()

  const initialNums = params.nums ? parseNums(params.nums) : [12, 8]

  const [nums, setNums] = createSignal<string[]>(initialNums.map(String))
  const [showSteps, setShowSteps] = createSignal(false)

  const parsedNums = createMemo(() =>
    nums()
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n !== 0)
  )

  const gcf = createMemo(() => {
    const ns = parsedNums()
    if (ns.length < 1) return null
    return gcdMany(ns)
  })

  const lcm = createMemo(() => {
    const ns = parsedNums()
    if (ns.length < 1) return null
    return lcmMany(ns)
  })

  const steps = createMemo(() => {
    const ns = parsedNums()
    if (ns.length < 2) return []
    return gcdSteps(ns[0], ns[1])
  })

  function updateNum(i: number, val: string) {
    const updated = nums().map((n, idx) => (idx === i ? val : n))
    setNums(updated)
    const valid = updated.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n !== 0)
    setParams({ nums: valid.join(',') })
  }

  function addNum() {
    setNums([...nums(), ''])
  }

  function removeNum(i: number) {
    if (nums().length <= 1) return
    const updated = nums().filter((_, idx) => idx !== i)
    setNums(updated)
    const valid = updated.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n !== 0)
    setParams({ nums: valid.join(',') })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="GCF / LCM"
        description="Find the Greatest Common Factor and Least Common Multiple of two or more integers."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Numbers input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Numbers</h2>
            </div>
            <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {parsedNums().length} valid
            </span>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Index each={nums()}>
              {(val, i) => (
                <div class="relative">
                  <NumberField
                    value={val()}
                    onChange={(v) => updateNum(i, v)}
                    step={1}
                    format={false}
                    class="flex flex-col gap-2"
                  >
                    <NumberFieldGroup>
                      <NumberFieldInput
                        autofocus={i === 0}
                        placeholder={`Number ${i + 1}`}
                        class="h-12 pr-16 font-mono text-base"
                      />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                  <Show when={nums().length > 1}>
                    <button
                      type="button"
                      onClick={() => removeNum(i)}
                      aria-label={`Remove number ${i + 1}`}
                      class="absolute right-7 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                      <TbOutlineX size={14} />
                    </button>
                  </Show>
                </div>
              )}
            </Index>
          </div>

          <Button variant="outline" size="sm" class="mt-4" onClick={addNum}>
            + Add number
          </Button>
        </section>

        {/* Results */}
        <Show when={parsedNums().length > 0}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
            </div>

            <div class="overflow-hidden rounded-md border border-border">
              <div class="flex items-center gap-3 px-4 py-3 text-sm">
                <span class="w-52 shrink-0 text-muted-foreground">Greatest Common Factor</span>
                <span class="flex-1 text-right font-mono tabular-nums text-2xl font-bold">{gcf() ?? '—'}</span>
                <CopyButton value={() => String(gcf() ?? '')} />
              </div>
              <div class="flex items-center gap-3 border-t border-border/50 px-4 py-3 text-sm">
                <span class="w-52 shrink-0 text-muted-foreground">Least Common Multiple</span>
                <span class="flex-1 text-right font-mono tabular-nums text-2xl font-bold">{lcm() ?? '—'}</span>
                <CopyButton value={() => String(lcm() ?? '')} />
              </div>
            </div>
          </section>
        </Show>

        {/* Euclidean steps */}
        <Show when={parsedNums().length >= 2}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Euclidean steps</h2>
                <span class="text-xs text-muted-foreground">
                  GCD({parsedNums()[0]}, {parsedNums()[1]})
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSteps((s) => !s)}>
                {showSteps() ? 'Hide' : 'Show'}
              </Button>
            </div>

            <Show when={showSteps()}>
              <div class="anim-fade-up">
                <Show
                  when={steps().length > 0}
                  fallback={
                    <div class="flex min-h-[3rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                      No steps (one divides the other).
                    </div>
                  }
                >
                  <div class="rounded-md border border-border bg-muted/30 p-4">
                    <For each={steps()}>
                      {(step) => (
                        <div class="font-mono text-sm leading-7 text-muted-foreground">
                          <span class="text-foreground">{step.a}</span> = {Math.floor(step.a / step.b)} ×{' '}
                          <span class="text-foreground">{step.b}</span> +{' '}
                          <span class="text-foreground">{step.remainder}</span>
                        </div>
                      )}
                    </For>
                    <Separator class="my-3" />
                    <p class="text-sm text-muted-foreground">
                      GCD = <span class="font-mono font-semibold text-foreground">{gcf()}</span>
                    </p>
                  </div>
                </Show>
              </div>
            </Show>
          </section>
        </Show>
      </div>
    </main>
  )
}
