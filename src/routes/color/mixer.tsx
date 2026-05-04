import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { Slider, SliderFill, SliderThumb, SliderTrack } from '~/components/ui/slider'
import { mixColors, getGradientStrip, type MixSpace } from '~/lib/utils/color/mixer'
import { setToolPageMeta } from '~/lib/seo'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

function isValid(h: string): boolean {
  return HEX_RE.test(h)
}

const SPACE_OPTIONS: { value: MixSpace; label: string }[] = [
  { value: 'oklch', label: 'OKLCH' },
  { value: 'hsl', label: 'HSL' },
  { value: 'srgb', label: 'sRGB' },
]

function isSpace(s: string): s is MixSpace {
  return ['oklch', 'hsl', 'srgb'].includes(s)
}

export default function ColorMixer() {
  setToolPageMeta('color', 'mixer')
  const [params, setParams] = useSearchParams<{
    a?: string
    b?: string
    r?: string
    space?: string
  }>()

  const initialA = isValid(params.a ?? '') ? normalizeHex(params.a!) : '#FF6B6B'
  const initialB = isValid(params.b ?? '') ? normalizeHex(params.b!) : '#4ECDC4'
  const initialR = Number.isFinite(parseInt(params.r ?? '')) ? Math.max(0, Math.min(100, parseInt(params.r!))) : 50
  const initialSpace: MixSpace = isSpace(params.space ?? '') ? (params.space as MixSpace) : 'oklch'

  const [colorA, setColorA] = createSignal(initialA)
  const [colorB, setColorB] = createSignal(initialB)
  const [ratio, setRatio] = createSignal(initialR)
  const [space, setSpace] = createSignal<MixSpace>(initialSpace)

  function syncParams() {
    setParams({
      a: colorA().replace('#', ''),
      b: colorB().replace('#', ''),
      r: String(ratio()),
      space: space(),
    }, { replace: true })
  }

  const aValid = createMemo(() => isValid(colorA()))
  const bValid = createMemo(() => isValid(colorB()))

  const aInvalidShown = createMemo(() => colorA().length > 0 && !aValid())
  const bInvalidShown = createMemo(() => colorB().length > 0 && !bValid())

  const result = createMemo(() => {
    if (!aValid() || !bValid()) return null
    return mixColors(colorA(), colorB(), ratio(), space())
  })

  const strip = createMemo(() => {
    if (!aValid() || !bValid()) return []
    return getGradientStrip(colorA(), colorB(), space(), 7)
  })

  const hexStr = createMemo(() => result()?.hex ?? '')
  const rgbStr = createMemo(() => {
    const r = result()
    return r ? `rgb(${r.rgb.r}, ${r.rgb.g}, ${r.rgb.b})` : ''
  })
  const hslStr = createMemo(() => {
    const r = result()
    return r ? `hsl(${r.hsl.h}, ${r.hsl.s}%, ${r.hsl.l}%)` : ''
  })
  const oklchStr = createMemo(() => {
    const r = result()
    return r ? `oklch(${r.oklch.l} ${r.oklch.c} ${r.oklch.h})` : ''
  })

  const formats = [
    { label: 'HEX', value: hexStr },
    { label: 'RGB', value: rgbStr },
    { label: 'HSL', value: hslStr },
    { label: 'OKLCH', value: oklchStr },
  ]

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color mixer"
        description="Mix two colors at any ratio in OKLCH, HSL, or sRGB with a live gradient preview."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
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

        {/* Colors */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Colors</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Color A</span>
              <div class="flex items-center gap-3">
                <ColorSwatchPicker
                  value={colorA()}
                  onChange={(v) => {
                    setColorA(v)
                    if (isValid(v)) syncParams()
                  }}
                  ariaLabel="Open color A picker"
                />
                <TextField
                  value={colorA()}
                  onChange={(v) => {
                    setColorA(v)
                    if (isValid(v)) syncParams()
                  }}
                  validationState={aInvalidShown() ? 'invalid' : 'valid'}
                  class="flex-1"
                >
                  <TextFieldInput
                    autofocus
                    type="text"
                    placeholder="#FF6B6B"
                    class="h-12 font-mono text-base uppercase"
                  />
                  <Show when={aInvalidShown()}>
                    <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Color B</span>
              <div class="flex items-center gap-3">
                <ColorSwatchPicker
                  value={colorB()}
                  onChange={(v) => {
                    setColorB(v)
                    if (isValid(v)) syncParams()
                  }}
                  ariaLabel="Open color B picker"
                />
                <TextField
                  value={colorB()}
                  onChange={(v) => {
                    setColorB(v)
                    if (isValid(v)) syncParams()
                  }}
                  validationState={bInvalidShown() ? 'invalid' : 'valid'}
                  class="flex-1"
                >
                  <TextFieldInput type="text" placeholder="#4ECDC4" class="h-12 font-mono text-base uppercase" />
                  <Show when={bInvalidShown()}>
                    <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>
            </div>
          </div>
        </section>

        {/* Mix controls */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Mix</h2>
          </div>

          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mix ratio</span>
                <span class="font-mono text-sm">
                  {100 - ratio()}% A · {ratio()}% B
                </span>
              </div>
              <Slider
                value={[ratio()]}
                onChange={(v) => {
                  setRatio(v[0])
                  syncParams()
                }}
                minValue={0}
                maxValue={100}
                step={1}
              >
                <SliderTrack>
                  <SliderFill />
                  <SliderThumb />
                </SliderTrack>
              </Slider>
            </div>

            <Show when={strip().length > 0}>
              <div class="flex h-8 overflow-hidden rounded-md border border-border">
                <For each={strip()}>{(c) => <div class="flex-1" style={{ 'background-color': c }} />}</For>
              </div>
            </Show>
          </div>
        </section>

        {/* Result */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
          </div>

          <Show
            when={result() !== null}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter two valid colors to see the mix
              </div>
            }
          >
            <div class="flex flex-col gap-4">
              <div
                class="anim-fade-up h-24 rounded-md border border-border shadow-sm transition-colors duration-200"
                style={{ 'background-color': result()!.hex }}
              />
              <div class="anim-stagger flex flex-col gap-3">
                <For each={formats}>
                  {(fmt) => (
                    <div class="grid grid-cols-[4rem_1fr] items-center gap-3 sm:grid-cols-[5rem_1fr]">
                      <span class="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {fmt.label}
                      </span>
                      <div class="relative">
                        <div class="min-h-[3rem] rounded-md border border-violet/30 bg-violet/5 px-4 py-3 pr-14 font-mono text-sm leading-relaxed break-all">
                          {fmt.value()}
                        </div>
                        <CopyButton value={fmt.value} class="absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
