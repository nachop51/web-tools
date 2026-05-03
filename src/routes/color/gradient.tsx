import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from '~/components/ui/number-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { setToolPageMeta } from '~/lib/seo'
import { generateGradientResult, type GradientSpace, type GradientType } from '~/lib/utils/color/gradient'
import { cn } from '~/lib/utils'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

function isValidHex(h: string): boolean {
  return HEX_RE.test(h)
}

const SPACE_OPTIONS: { value: GradientSpace; label: string }[] = [
  { value: 'oklch', label: 'OKLCH' },
  { value: 'hsl', label: 'HSL' },
  { value: 'srgb', label: 'sRGB' },
]

const TYPE_OPTIONS: { value: GradientType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
]

function isSpace(s: string): s is GradientSpace {
  return ['oklch', 'hsl', 'srgb'].includes(s)
}

function isType(s: string): s is GradientType {
  return ['linear', 'radial', 'conic'].includes(s)
}

export default function GradientBuilder() {
  setToolPageMeta('color', 'gradient')
  const [params, setParams] = useSearchParams<{
    stops?: string
    space?: string
    type?: string
    angle?: string
  }>()

  const initialStops = (params.stops ?? 'FF0000,0000FF').split(',').map((s) => normalizeHex(s))

  const [stops, setStops] = createSignal<string[]>(initialStops)
  const [space, setSpace] = createSignal<GradientSpace>(
    isSpace(params.space ?? '') ? (params.space as GradientSpace) : 'oklch'
  )
  const [type, setType] = createSignal<GradientType>(
    isType(params.type ?? '') ? (params.type as GradientType) : 'linear'
  )
  const [angle, setAngle] = createSignal<number>(
    Number.isFinite(parseInt(params.angle ?? '')) ? parseInt(params.angle!) : 90
  )

  function syncParams() {
    setParams({
      stops: stops()
        .map((s) => s.replace('#', ''))
        .join(','),
      space: space(),
      type: type(),
      angle: String(angle()),
    })
  }

  function setStop(i: number, value: string) {
    const next = [...stops()]
    next[i] = value.startsWith('#') ? value.toUpperCase() : value
    setStops(next)
    if (isValidHex(next[i])) {
      next[i] = normalizeHex(next[i])
      setStops([...next])
      syncParams()
    }
  }

  function addStop() {
    setStops([...stops(), '#888888'])
    syncParams()
  }

  function removeStop(i: number) {
    if (stops().length <= 2) return
    setStops(stops().filter((_, idx) => idx !== i))
    syncParams()
  }

  const result = createMemo(() => generateGradientResult(stops(), space(), type(), angle()))

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Gradient builder"
        description="Build linear, radial, or conic gradients with color interpolation in OKLCH, HSL, or sRGB."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Type"
            value={type()}
            onChange={(v) => {
              setType(v)
              syncParams()
            }}
            options={TYPE_OPTIONS}
          />
          <ToolbarSegmented
            label="Color space"
            value={space()}
            onChange={(v) => {
              setSpace(v)
              syncParams()
            }}
            options={SPACE_OPTIONS}
          />
        </ToolToolbar>

        {/* Color stops */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color stops</h2>
          </div>

          <div class="flex flex-col gap-3">
            <For each={stops()}>
              {(stop, i) => {
                const valid = createMemo(() => isValidHex(stop))
                const invalidShown = createMemo(() => stop.length > 0 && !valid())
                return (
                  <div class="flex items-start gap-3">
                    <ColorSwatchPicker
                      value={stop}
                      onChange={(v) => setStop(i(), v)}
                      ariaLabel={`Open color picker for stop ${i() + 1}`}
                    />
                    <TextField
                      value={stop}
                      onChange={(v) => setStop(i(), v)}
                      validationState={invalidShown() ? 'invalid' : 'valid'}
                      class="flex-1"
                    >
                      <TextFieldInput
                        autofocus={i() === 0}
                        type="text"
                        placeholder="#3B82F6"
                        class="h-12 font-mono text-base uppercase"
                      />
                      <Show when={invalidShown()}>
                        <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                      </Show>
                    </TextField>
                    <button
                      type="button"
                      onClick={() => removeStop(i())}
                      disabled={stops().length <= 2}
                      aria-label="Remove stop"
                      class={cn(
                        'h-12 rounded-md border px-3 text-sm font-medium cursor-pointer',
                        'transition-[border-color,color,background-color] duration-150 ease-out',
                        'border-border bg-background text-muted-foreground',
                        'hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-muted-foreground disabled:hover:bg-background'
                      )}
                    >
                      Remove
                    </button>
                  </div>
                )
              }}
            </For>

            <button
              type="button"
              onClick={addStop}
              class={cn(
                'h-10 w-full rounded-md border border-dashed border-border bg-background text-sm font-medium text-muted-foreground cursor-pointer',
                'transition-[border-color,background-color,color] duration-150 ease-out',
                'hover:border-violet/60 hover:bg-violet/5 hover:text-violet',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              )}
            >
              + Add stop
            </button>
          </div>
        </section>

        {/* Angle (linear/conic only) */}
        <Show when={type() === 'linear' || type() === 'conic'}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Angle</h2>
            </div>
            <NumberField
              value={String(angle())}
              onChange={(v) => {
                const n = parseInt(v, 10)
                if (!isNaN(n)) {
                  setAngle(n)
                  syncParams()
                }
              }}
              minValue={0}
              maxValue={360}
              step={1}
              format={false}
              class="flex flex-col gap-2 sm:max-w-xs"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Degrees
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </section>
        </Show>

        {/* Preview */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
          </div>

          <div
            class="min-h-40 rounded-md border border-border shadow-inner transition-all duration-300"
            style={{ background: result().previewCss }}
          />
        </section>

        {/* CSS */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">CSS</h2>
          </div>

          <div class="relative">
            <pre class="anim-fade-up min-h-[8.25rem] overflow-auto rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
              {result().css}
            </pre>
            <CopyButton value={() => result().css} class="absolute right-2 top-2" />
          </div>
        </section>
      </div>
    </main>
  )
}
