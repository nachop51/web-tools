import { createMemo, For, Show, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import {
  inverseTrig,
  toRadians,
  trigOf,
  formatRadAsPi,
  type AngleUnit,
  type InverseFn,
} from '~/lib/utils/geometry/trig'
import { setToolPageMeta } from '~/lib/seo'

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) {
    if (n === Infinity || n === -Infinity) return '±∞'
    return '-'
  }
  return parseFloat(n.toPrecision(10)).toString()
}

type CalcMode = 'forward' | 'inverse'

const modeOptions: { value: CalcMode; label: string }[] = [
  { value: 'forward', label: 'Forward' },
  { value: 'inverse', label: 'Inverse' },
]

const unitOptions: { value: AngleUnit; label: string }[] = [
  { value: 'deg', label: 'Degrees' },
  { value: 'rad', label: 'Radians' },
  { value: 'grad', label: 'Gradians' },
  { value: 'turn', label: 'Turns' },
]

const inverseOptions: { value: InverseFn; label: string }[] = [
  { value: 'asin', label: 'asin' },
  { value: 'acos', label: 'acos' },
  { value: 'atan', label: 'atan' },
]

export default function TrigCalculator() {
  setToolPageMeta('geometry', 'trig-calculator')
  const [searchParams, setSearchParams] = useSearchParams<{
    mode?: string
    unit?: string
    angle?: string
    inv?: string
    val?: string
  }>()

  const mode = createMemo<CalcMode>(() => (searchParams.mode === 'inverse' ? 'inverse' : 'forward'))
  const unit = createMemo<AngleUnit>(() => {
    const u = searchParams.unit
    if (u === 'rad' || u === 'grad' || u === 'turn') return u
    return 'deg'
  })
  const inv = createMemo<InverseFn>(() => {
    const i = searchParams.inv
    if (i === 'acos' || i === 'atan') return i
    return 'asin'
  })

  const angleRaw = createMemo(() => searchParams.angle ?? '')
  const valRaw = createMemo(() => searchParams.val ?? '')

  const forwardResult = createMemo(() => {
    if (mode() !== 'forward') return null
    const v = parseFloat(angleRaw())
    if (!isFinite(v) || angleRaw().trim() === '') return null
    return trigOf(toRadians(v, unit()))
  })

  const inverseResult = createMemo(() => {
    if (mode() !== 'inverse') return null
    const v = parseFloat(valRaw())
    if (!isFinite(v) || valRaw().trim() === '') return null
    return inverseTrig(inv(), v)
  })

  const forwardRows = createMemo(() => {
    const r = forwardResult()
    if (!r) return []
    return r.values.map((v) => ({
      fn: v.fn,
      exact: v.exact,
      decimal: fmt(v.decimal),
    }))
  })

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  const piLabel = createMemo(() => {
    const r = forwardResult()
    if (!r) return null
    return formatRadAsPi(r.radians)
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Trig calculator"
        description="Sine, cosine, tangent and their reciprocals — with exact values for special angles, and inverse mode."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Mode"
            value={mode() || undefined}
            onChange={(v) => setSearchParams({ mode: v }, { replace: true })}
            options={modeOptions}
          />
          <Show when={mode() === 'forward'}>
            <ToolbarSegmented
              label="Unit"
              value={unit() || undefined}
              onChange={(v) => setSearchParams({ unit: v }, { replace: true })}
              options={unitOptions}
            />
          </Show>
          <Show when={mode() === 'inverse'}>
            <ToolbarSegmented
              label="Function"
              value={inv() || undefined}
              onChange={(v) => setSearchParams({ inv: v }, { replace: true })}
              options={inverseOptions}
            />
          </Show>
        </ToolToolbar>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {mode() === 'forward' ? 'Angle' : 'Value'}
            </h2>
          </div>

          <Show when={mode() === 'forward'}>
            <NumberField
              value={angleRaw() || undefined}
              onChange={(v) => setSearchParams({ angle: v }, { replace: true })}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>Angle in {unit() === 'deg' ? 'degrees' : unit() === 'rad' ? 'radians' : unit() === 'grad' ? 'gradians' : 'turns'}</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="Enter angle" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>

            <Show when={piLabel() && unit() !== 'rad'}>
              <p class="mt-2 text-xs text-muted-foreground">
                = <span class="font-mono text-violet">{piLabel()}</span> rad
              </p>
            </Show>
          </Show>

          <Show when={mode() === 'inverse'}>
            <NumberField
              value={valRaw() || undefined}
              onChange={(v) => setSearchParams({ val: v }, { replace: true })}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel>{inv()}(x) where x =</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput ref={inputRef} placeholder="Enter value" class="h-12 font-mono text-base" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </Show>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
          </div>

          <Show when={mode() === 'forward'}>
            <Show
              when={forwardResult()}
              fallback={
                <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Enter an angle to see all six trig functions
                </div>
              }
            >
              <div class="anim-fade-in overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Function</TableHead>
                      <TableHead>Exact</TableHead>
                      <TableHead>Decimal</TableHead>
                      <TableHead class="w-16 text-right">Copy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={forwardRows()}>
                      {(row) => (
                        <TableRow>
                          <TableCell class="font-sans font-semibold text-violet">
                            {row.fn}({fmt(forwardResult()!.degrees)}°)
                          </TableCell>
                          <TableCell>
                            <Show when={row.exact} fallback={<span class="text-muted-foreground">—</span>}>
                              <span class="font-semibold">{row.exact}</span>
                            </Show>
                          </TableCell>
                          <TableCell>{row.decimal}</TableCell>
                          <TableCell class="text-right">
                            <CopyButton value={row.decimal} />
                          </TableCell>
                        </TableRow>
                      )}
                    </For>
                  </TableBody>
                </Table>
              </div>
            </Show>
          </Show>

          <Show when={mode() === 'inverse'}>
            <Show
              when={inverseResult()?.valid}
              fallback={
                <Show
                  when={inverseResult() && !inverseResult()!.valid}
                  fallback={
                    <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                      Enter a value to compute {inv()}(x)
                    </div>
                  }
                >
                  <div class="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Out of domain. {inv() === 'asin' || inv() === 'acos' ? 'asin/acos require −1 ≤ x ≤ 1.' : 'Invalid input.'}
                  </div>
                </Show>
              }
            >
              {(_) => {
                const r = inverseResult()!
                const allUnitRows = [
                  { label: 'Degrees', val: () => `${fmt(r.deg)}°` },
                  { label: 'Radians', val: () => fmt(r.rad) },
                  { label: 'Radians (π)', val: () => formatRadAsPi(r.rad) ?? fmt(r.rad / Math.PI) + 'π' },
                  { label: 'Gradians', val: () => `${fmt(r.grad)} g` },
                  { label: 'Turns', val: () => fmt(r.turn) },
                ]
                return (
                  <div class="anim-fade-in overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unit</TableHead>
                          <TableHead>Angle</TableHead>
                          <TableHead class="w-16 text-right">Copy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <For each={allUnitRows}>
                          {(row) => (
                            <TableRow>
                              <TableCell class="font-sans font-medium">{row.label}</TableCell>
                              <TableCell class="font-semibold">{row.val()}</TableCell>
                              <TableCell class="text-right">
                                <CopyButton value={row.val} />
                              </TableCell>
                            </TableRow>
                          )}
                        </For>
                      </TableBody>
                    </Table>
                  </div>
                )
              }}
            </Show>
          </Show>
        </section>
      </div>
    </main>
  )
}
