import { createMemo, createSignal, For, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { solveQuadratic, type QuadraticRoot } from '~/lib/utils/math/quadratic'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number, places = 6): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return parseFloat(n.toPrecision(places)).toString()
}

function formatRoot(root: QuadraticRoot): string {
  if (root.type === 'real') return fmt(root.value)
  const re = fmt(root.real)
  const im = fmt(Math.abs(root.imaginary))
  return root.imaginary >= 0 ? `${re} + ${im}i` : `${re} − ${im}i`
}

export default function QuadraticFormula() {
  setToolPageMeta('math', 'quadratic')
  const [a, setA] = createSignal('1')
  const [b, setB] = createSignal('-5')
  const [c, setC] = createSignal('6')

  const result = createMemo(() => {
    const na = parseFloat(a()),
      nb = parseFloat(b()),
      nc = parseFloat(c())
    if ([na, nb, nc].some(isNaN)) return null
    try {
      return solveQuadratic(na, nb, nc)
    } catch {
      return null
    }
  })

  const equationPreview = createMemo(() => {
    const na = parseFloat(a()),
      nb = parseFloat(b()),
      nc = parseFloat(c())
    if ([na, nb, nc].some(isNaN)) return 'ax² + bx + c = 0'
    const bSign = nb >= 0 ? '+' : '−'
    const cSign = nc >= 0 ? '+' : '−'
    return `${na}x² ${bSign} ${Math.abs(nb)}x ${cSign} ${Math.abs(nc)} = 0`
  })

  const natureLabel = createMemo(() => {
    const r = result()
    if (!r) return ''
    if (r.nature === 'two-real') return 'Two distinct real roots (Δ > 0)'
    if (r.nature === 'one-real') return 'One repeated real root (Δ = 0)'
    return 'Two complex conjugate roots (Δ < 0)'
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="math"
        name="Quadratic formula"
        description="Solve ax² + bx + c = 0. Shows discriminant and real or complex roots."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Coefficients */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Coefficients</h2>
          </div>

          <div class="mb-4 rounded-md border border-border bg-muted/30 px-4 py-3 text-center font-mono text-base">
            {equationPreview()}
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <NumberField value={a()} onChange={setA} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>a (x²)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput autofocus placeholder="1" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField value={b()} onChange={setB} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>b (x)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="-5" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField value={c()} onChange={setC} format={false} class="flex flex-col gap-1.5">
              <NumberFieldLabel>c (constant)</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="6" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* Solution */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Solution</h2>
          </div>

          <Show
            when={result()}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter coefficients to solve
              </div>
            }
          >
            {(res) => (
              <div class="anim-fade-up flex flex-col gap-3">
                <div class="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Discriminant Δ
                    </span>
                    <span class="font-mono text-base">{fmt(res().discriminant)}</span>
                  </div>
                  <span class="text-xs text-muted-foreground">{natureLabel()}</span>
                </div>

                <div class="overflow-hidden rounded-md border border-border">
                  <For each={res().roots}>
                    {(root, i) => {
                      const label = () => (res().roots.length > 1 ? `x${i() + 1}` : 'x')
                      const value = () => formatRoot(root)
                      return (
                        <div class="flex items-center gap-3 border-t border-border/50 px-4 py-3 text-sm first:border-t-0">
                          <span class="w-16 shrink-0 font-mono text-violet">{label()} =</span>
                          <span class="flex-1 text-right font-mono tabular-nums text-base font-semibold break-all">
                            {value()}
                          </span>
                          <CopyButton value={value} />
                        </div>
                      )
                    }}
                  </For>
                </div>
              </div>
            )}
          </Show>
        </section>
      </div>
    </main>
  )
}
