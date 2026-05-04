import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { TbOutlineCheck } from 'solid-icons/tb'
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
  const [copied, setCopied] = createSignal<{ step: number; tick: number } | null>(null)
  let copyTick = 0

  async function copyStop(step: number, hex: string) {
    try {
      await navigator.clipboard.writeText(hex)
      copyTick += 1
      const tick = copyTick
      setCopied({ step, tick })
      setTimeout(() => setCopied((c) => (c?.tick === tick ? null : c)), 1100)
    } catch {
      // clipboard unavailable in non-secure contexts
    }
  }

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
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', '') }, { replace: true })
              }}
            />
            <TextField
              value={hexInput()}
              onChange={(v) => {
                setHexInput(v)
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', '') }, { replace: true })
              }}
              validationState={isInvalidShown() ? 'invalid' : 'valid'}
              class="flex-1"
            >
              <div class="relative">
                <TextFieldInput
                  autofocus
                  type="text"
                  placeholder="#3B82F6"
                  class="h-12 pr-20 font-mono text-base uppercase"
                />
                <CopyButton value={() => hexInput()} class="absolute right-1.5 top-1/2 -translate-y-1/2" />
              </div>
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
                {(stop) => {
                  const isCopied = () => copied()?.step === stop.step
                  return (
                    <div class="group flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyStop(stop.step, stop.hex)}
                        aria-label={`Copy ${stop.hex}`}
                        class="relative h-20 cursor-pointer overflow-visible rounded-md border border-border shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        style={{ 'background-color': stop.hex }}
                      >
                        <Show when={isCopied()} keyed>
                          <span class="anim-color-copied pointer-events-none absolute left-1/2 top-1/2 z-10 inline-flex items-center gap-1 rounded-full bg-violet px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-violet-foreground shadow-lg">
                            <TbOutlineCheck size={11} /> Copied
                          </span>
                        </Show>
                      </button>
                      <div class="text-center font-mono text-xs font-semibold transition-colors group-hover:text-violet">
                        {stop.step}
                      </div>
                      <div
                        class="text-center font-mono text-[10px] transition-colors group-hover:text-violet"
                        classList={{
                          'text-violet': isCopied(),
                          'text-muted-foreground': !isCopied(),
                        }}
                      >
                        {stop.hex}
                      </div>
                    </div>
                  )
                }}
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
