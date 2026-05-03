import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { generateScale } from '~/lib/utils/color/scale'
import { setToolPageMeta } from '~/lib/seo'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

export default function TintShade() {
  setToolPageMeta('color', 'tint-shade')
  const [params, setParams] = useSearchParams<{ c?: string }>()
  const initial = HEX_RE.test(params.c ?? '') ? normalizeHex(params.c!) : '#3B82F6'

  const [hexInput, setHexInput] = createSignal(initial)

  const isValid = createMemo(() => HEX_RE.test(hexInput()))
  const isInvalidShown = createMemo(() => hexInput().length > 0 && !isValid())

  const scale = createMemo(() => (isValid() ? generateScale(hexInput()) : []))

  const jsObject = createMemo(() => {
    const stops = scale()
    if (stops.length === 0) return ''
    const lines = stops.map((s) => `  ${s.step}: "${s.hex}",`).join('\n')
    return `{\n${lines}\n}`
  })

  const cssVars = createMemo(() => {
    const stops = scale()
    if (stops.length === 0) return ''
    return stops.map((s) => `  --color-${s.step}: ${s.hex};`).join('\n')
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Tint / shade scale"
        description="Generate a Tailwind-style 11-step tint and shade scale in OKLCH colorspace."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Base color */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Base color</h2>
          </div>

          <div class="flex items-center gap-3">
            <ColorSwatchPicker
              value={hexInput()}
              onChange={(v) => {
                setHexInput(v)
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', '') })
              }}
            />
            <TextField
              value={hexInput()}
              onChange={(v) => {
                setHexInput(v)
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', '') })
              }}
              validationState={isInvalidShown() ? 'invalid' : 'valid'}
              class="flex-1"
            >
              <TextFieldInput autofocus type="text" placeholder="#3B82F6" class="h-12 font-mono text-base uppercase" />
              <Show when={isInvalidShown()}>
                <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
              </Show>
            </TextField>
          </div>
        </section>

        {/* Scale */}
        <Show when={scale().length > 0}>
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Scale</h2>
            </div>

            <div class="anim-stagger grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
              <For each={scale()}>
                {(stop) => (
                  <div class="flex flex-col gap-1.5">
                    <div
                      class="h-20 rounded-md border border-border shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
                      style={{ 'background-color': stop.hex }}
                    />
                    <div class="text-center font-mono text-xs font-semibold">{stop.step}</div>
                    <div class="text-center font-mono text-[10px] text-muted-foreground">{stop.hex}</div>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* Export */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Export</h2>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">JS object</span>
                <div class="relative">
                  <pre class="anim-fade-up min-h-[8.25rem] overflow-auto rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-xs leading-relaxed">
                    {jsObject()}
                  </pre>
                  <CopyButton value={jsObject} class="absolute right-2 top-2" />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">CSS variables</span>
                <div class="relative">
                  <pre class="anim-fade-up min-h-[8.25rem] overflow-auto rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-xs leading-relaxed">
                    {cssVars()}
                  </pre>
                  <CopyButton value={cssVars} class="absolute right-2 top-2" />
                </div>
              </div>
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}
