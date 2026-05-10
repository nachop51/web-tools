import { createMemo, createSignal, For, Show } from 'solid-js'
import { TbOutlineChevronDown, TbOutlineRocket } from 'solid-icons/tb'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitConverterState, type UnitRow } from '~/components/unit-converter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { setToolPageMeta } from '~/lib/seo'
import { cn } from '~/lib/utils'
import { convert } from '~/lib/utils/units/converter'
import {
  funLengthUnitKeys,
  funLengthUnits,
  lengthUnitKeys,
  lengthUnits,
} from '~/lib/utils/units/length'

const UNITS: UnitRow[] = lengthUnitKeys.map((k) => ({
  key: k,
  label: lengthUnits[k].label,
}))

function lengthConvert(value: number, from: string, to: string): number {
  return convert(value, lengthUnits[from].factor, lengthUnits[to].factor)
}

function fmtFun(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e6 || abs < 0.001) return n.toExponential(3)
  return parseFloat(n.toPrecision(6)).toString()
}

export default function LengthConverter() {
  setToolPageMeta('units', 'length')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Length converter"
        description="Convert between meters, kilometers, miles, feet, inches, and more."
      />
      <UnitConverter
        units={UNITS}
        convert={lengthConvert}
        defaultUnit="km"
        presets={['1', '10', '100', '1000']}
        extras={(state) => <FunScale state={state} />}
      />
    </main>
  )
}

function FunScale(props: { state: UnitConverterState }) {
  const [open, setOpen] = createSignal(false)

  return (
    <section aria-label="Fun scale" class="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(!open())}
        aria-expanded={open()}
        class={cn(
          'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-left',
          'transition-colors duration-150 hover:border-violet/60 hover:bg-violet/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
      >
        <span class="flex items-center gap-2">
          <span aria-hidden class="size-1.5 rounded-full bg-violet" />
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fun scale
          </span>
          <TbOutlineRocket size={13} class="ml-1 text-violet" aria-hidden />
        </span>
        <TbOutlineChevronDown
          size={14}
          class={cn(
            'text-muted-foreground transition-transform duration-200',
            open() && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      <Show when={open()}>
        <Show
          when={props.state.hasValue()}
          fallback={
            <div class="flex min-h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
              Enter a value above to see fun comparisons
            </div>
          }
        >
          <div class="anim-fade-up overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-12" aria-label="Icon" />
                  <TableHead class="w-[34%]">Comparison</TableHead>
                  <TableHead>About</TableHead>
                  <TableHead class="text-right">Count</TableHead>
                  <TableHead class="w-[64px] text-right" aria-label="Copy" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <For each={funLengthUnitKeys}>
                  {(unit) => {
                    const value = createMemo(() =>
                      fmtFun(
                        convert(
                          props.state.numericValue(),
                          lengthUnits[props.state.fromUnit()].factor,
                          funLengthUnits[unit].factor
                        )
                      )
                    )
                    return (
                      <TableRow>
                        <TableCell class="text-base leading-none">
                          {funLengthUnits[unit].emoji}
                        </TableCell>
                        <TableCell class="font-sans text-sm font-medium text-foreground">
                          {funLengthUnits[unit].label}
                        </TableCell>
                        <TableCell class="text-xs text-muted-foreground/80">
                          {funLengthUnits[unit].description}
                        </TableCell>
                        <TableCell class="text-right text-sm tabular-nums">
                          {value()}
                        </TableCell>
                        <TableCell class="py-1 text-right hover:bg-transparent">
                          <CopyButton value={() => value()} />
                        </TableCell>
                      </TableRow>
                    )
                  }}
                </For>
              </TableBody>
            </Table>
          </div>
        </Show>
      </Show>
    </section>
  )
}
