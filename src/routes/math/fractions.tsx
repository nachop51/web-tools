import { createMemo, createSignal, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { NumberField, NumberFieldGroup, NumberFieldInput } from '~/components/ui/number-field'
import { fractionOp, type FractionOp } from '~/lib/utils/math/fractions'
import { setToolPageMeta } from '~/lib/seo'

const opOptions: { value: FractionOp; label: string }[] = [
  { value: 'add', label: '+ Add' },
  { value: 'subtract', label: '− Subtract' },
  { value: 'multiply', label: '× Multiply' },
  { value: 'divide', label: '÷ Divide' },
]

const opSymbols: Record<FractionOp, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
}

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return parseFloat(n.toPrecision(10)).toString()
}

export default function FractionCalculator() {
  setToolPageMeta('math', 'fractions')
  const [op, setOp] = createSignal<FractionOp>('add')
  const [aN, setAN] = createSignal('1')
  const [aD, setAD] = createSignal('2')
  const [bN, setBN] = createSignal('1')
  const [bD, setBD] = createSignal('3')

  const result = createMemo(() => {
    const an = parseInt(aN()),
      ad = parseInt(aD())
    const bn = parseInt(bN()),
      bd = parseInt(bD())
    if ([an, ad, bn, bd].some(isNaN)) return null
    if (ad === 0 || bd === 0) return null
    try {
      return fractionOp({ num: an, den: ad }, op(), { num: bn, den: bd })
    } catch {
      return null
    }
  })

  const activeSymbol = createMemo(() => opSymbols[op()])

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="math"
        name="Fraction calculator"
        description="Add, subtract, multiply, and divide fractions with automatic simplification."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Operation" value={op()} onChange={setOp} options={opOptions} />
        </ToolToolbar>

        {/* Fractions input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Fractions</h2>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-6 py-2">
            {/* Fraction A */}
            <div class="flex flex-col items-center gap-1.5">
              <NumberField value={aN()} onChange={setAN} format={false} class="flex flex-col">
                <NumberFieldGroup>
                  <NumberFieldInput autofocus class="h-12 w-24 text-center font-mono text-base" placeholder="1" />
                </NumberFieldGroup>
              </NumberField>
              <div class="h-px w-24 bg-foreground" />
              <NumberField value={aD()} onChange={setAD} format={false} class="flex flex-col">
                <NumberFieldGroup>
                  <NumberFieldInput class="h-12 w-24 text-center font-mono text-base" placeholder="2" />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <span class="font-mono text-3xl font-bold text-violet">{activeSymbol()}</span>

            {/* Fraction B */}
            <div class="flex flex-col items-center gap-1.5">
              <NumberField value={bN()} onChange={setBN} format={false} class="flex flex-col">
                <NumberFieldGroup>
                  <NumberFieldInput class="h-12 w-24 text-center font-mono text-base" placeholder="1" />
                </NumberFieldGroup>
              </NumberField>
              <div class="h-px w-24 bg-foreground" />
              <NumberField value={bD()} onChange={setBD} format={false} class="flex flex-col">
                <NumberFieldGroup>
                  <NumberFieldInput class="h-12 w-24 text-center font-mono text-base" placeholder="3" />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter fractions to see result
              </div>
            }
          >
            {(r) => (
              <div class="anim-fade-up flex flex-col gap-3">
                <div class="flex items-center gap-3 overflow-hidden rounded-md border border-border px-4 py-3">
                  <div class="flex flex-1 flex-col items-center gap-1.5 py-2 font-mono">
                    <span class="text-3xl font-semibold">{r().num}</span>
                    <div class="h-0.5 w-16 bg-foreground" />
                    <span class="text-3xl font-semibold">{r().den}</span>
                  </div>
                  <CopyButton value={() => `${r().num}/${r().den}`} />
                </div>
                <div class="overflow-hidden rounded-md border border-border text-sm">
                  <div class="flex items-center gap-3 px-4 py-3">
                    <span class="w-32 shrink-0 text-muted-foreground">Decimal</span>
                    <span class="flex-1 text-right font-mono tabular-nums">{fmt(r().decimal)}</span>
                    <CopyButton value={() => fmt(r().decimal)} />
                  </div>
                  <Show when={r().mixed}>
                    <div class="flex items-center gap-3 border-t border-border/50 px-4 py-3">
                      <span class="w-32 shrink-0 text-muted-foreground">Mixed</span>
                      <span class="flex-1 text-right font-mono">{r().mixed}</span>
                      <CopyButton value={() => r().mixed!} />
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
