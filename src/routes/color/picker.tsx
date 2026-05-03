import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorPicker as ColorPickerWidget } from '~/components/ui/color-picker'
import { hexToRgb, rgbToHsl, rgbToOklch } from '~/lib/utils/color/convert'
import { setToolPageMeta } from '~/lib/seo'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

export default function ColorPicker() {
  setToolPageMeta('color', 'picker')
  const [params, setParams] = useSearchParams<{ c?: string }>()
  const initial = HEX_RE.test(params.c ?? '') ? normalizeHex(params.c!) : '#3B82F6'

  const [hexValue, setHexValue] = createSignal(initial)

  const isValid = createMemo(() => HEX_RE.test(hexValue()))

  const rgb = createMemo(() => (isValid() ? hexToRgb(hexValue()) : null))
  const hsl = createMemo(() => {
    const r = rgb()
    return r ? rgbToHsl(r) : null
  })
  const oklch = createMemo(() => {
    const r = rgb()
    return r ? rgbToOklch(r) : null
  })

  const hexStr = createMemo(() => (isValid() ? normalizeHex(hexValue()) : ''))
  const rgbStr = createMemo(() => {
    const r = rgb()
    return r ? `rgb(${r.r}, ${r.g}, ${r.b})` : ''
  })
  const hslStr = createMemo(() => {
    const h = hsl()
    return h ? `hsl(${h.h}, ${h.s}%, ${h.l}%)` : ''
  })
  const oklchStr = createMemo(() => {
    const ok = oklch()
    return ok ? `oklch(${ok.l} ${ok.c} ${ok.h})` : ''
  })

  const formats = [
    { label: 'HEX', value: hexStr },
    { label: 'RGB', value: rgbStr },
    { label: 'HSL', value: hslStr },
    { label: 'OKLCH', value: oklchStr },
  ]

  function applyHex(v: string) {
    const norm = normalizeHex(v)
    setHexValue(norm)
    setParams({ c: norm.replace('#', '') })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color picker"
        description="Pick a color visually and copy it as HEX, RGB, HSL, or OKLCH."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Picker */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pick a color</h2>
          </div>

          <div class="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
            <ColorPickerWidget value={isValid() ? hexValue() : '#3B82F6'} onChange={(hex) => applyHex(hex)} />

            <div class="flex flex-col gap-4">
              <div
                class="h-32 w-full rounded-md border border-border shadow-inner transition-colors duration-200"
                style={{ 'background-color': isValid() ? hexValue() : '#3B82F6' }}
              />
              <TextField
                value={hexValue()}
                onChange={(v) => {
                  setHexValue(v)
                  if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', '') })
                }}
                validationState={hexValue().length > 0 && !isValid() ? 'invalid' : 'valid'}
                class="flex flex-col gap-1.5"
              >
                <label class="text-xs font-medium uppercase tracking-wider text-muted-foreground">HEX</label>
                <div class="relative">
                  <TextFieldInput
                    autofocus
                    type="text"
                    placeholder="#3B82F6"
                    class="h-12 pr-12 font-mono text-base uppercase"
                  />
                  <CopyButton value={() => hexValue()} class="absolute right-1.5 top-1/2 -translate-y-1/2" />
                </div>
                <Show when={hexValue().length > 0 && !isValid()}>
                  <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                </Show>
              </TextField>
            </div>
          </div>
        </section>

        {/* Formats */}
        <Show when={isValid()}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color formats</h2>
            </div>

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
          </section>
        </Show>
      </div>
    </main>
  )
}
