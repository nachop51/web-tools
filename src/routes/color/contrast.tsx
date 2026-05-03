import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { hexToRgb, type RGB } from '~/lib/utils/color/convert'
import { contrastRatio, wcagLevel, type WcagLevel } from '~/lib/utils/color/contrast'
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function isValidHex(h: string): boolean {
  return HEX_RE.test(h)
}

function normalizeHex(h: string): string {
  return h.replace(/^#/, '').toUpperCase()
}

function toRgb(hex: string): RGB | null {
  if (!isValidHex(hex)) return null
  return hexToRgb(hex)
}

function badgeClass(level: WcagLevel): string {
  if (level === 'AAA') return 'border-green-500/30 bg-green-500/15 text-green-700 dark:text-green-400'
  if (level === 'AA') return 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400'
  return 'border-destructive/30 bg-destructive/15 text-destructive'
}

type ResultRow = {
  label: string
  threshold: string
  level: WcagLevel
}

export default function ContrastChecker() {
  setToolPageMeta('color', 'contrast')
  const [params, setParams] = useSearchParams<{ fg?: string; bg?: string }>()

  const initialFg = isValidHex(params.fg ?? '') ? `#${normalizeHex(params.fg!)}` : '#000000'
  const initialBg = isValidHex(params.bg ?? '') ? `#${normalizeHex(params.bg!)}` : '#FFFFFF'

  const [fgInput, setFgInput] = createSignal(initialFg)
  const [bgInput, setBgInput] = createSignal(initialBg)

  const fgValid = createMemo(() => isValidHex(fgInput()))
  const bgValid = createMemo(() => isValidHex(bgInput()))

  const fgInvalidShown = createMemo(() => fgInput().length > 0 && !fgValid())
  const bgInvalidShown = createMemo(() => bgInput().length > 0 && !bgValid())

  const fgRgb = createMemo(() => toRgb(fgInput()))
  const bgRgb = createMemo(() => toRgb(bgInput()))

  const ratio = createMemo((): number | null => {
    const fg = fgRgb()
    const bg = bgRgb()
    if (!fg || !bg) return null
    return contrastRatio(fg, bg)
  })

  function updateFg(v: string) {
    setFgInput(v)
    if (isValidHex(v)) setParams({ fg: normalizeHex(v) })
  }

  function updateBg(v: string) {
    setBgInput(v)
    if (isValidHex(v)) setParams({ bg: normalizeHex(v) })
  }

  const previewStyle = createMemo(() => {
    const fg = fgValid() ? fgInput() : '#000000'
    const bg = bgValid() ? bgInput() : '#FFFFFF'
    return { color: fg, 'background-color': bg }
  })

  const rows = createMemo<ResultRow[]>(() => {
    const r = ratio()
    if (r === null) return []
    return [
      { label: 'AA · Normal text', threshold: '≥ 4.5:1', level: wcagLevel(r, 'normal') },
      { label: 'AA · Large text', threshold: '≥ 3:1', level: wcagLevel(r, 'large') },
      { label: 'AAA · Normal text', threshold: '≥ 7:1', level: r >= 7 ? 'AAA' : 'Fail' },
      { label: 'AAA · Large text', threshold: '≥ 4.5:1', level: r >= 4.5 ? 'AAA' : 'Fail' },
    ]
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Contrast checker"
        description="Calculate the WCAG 2.1 contrast ratio between two colors and show AA/AAA pass/fail badges."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Colors */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Colors</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Foreground</span>
              <div class="flex items-center gap-3">
                <ColorSwatchPicker value={fgInput()} onChange={updateFg} ariaLabel="Open foreground color picker" />
                <TextField
                  value={fgInput()}
                  onChange={updateFg}
                  validationState={fgInvalidShown() ? 'invalid' : 'valid'}
                  class="flex-1"
                >
                  <TextFieldInput
                    autofocus
                    type="text"
                    placeholder="#000000"
                    class="h-12 font-mono text-base uppercase"
                  />
                  <Show when={fgInvalidShown()}>
                    <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Background</span>
              <div class="flex items-center gap-3">
                <ColorSwatchPicker value={bgInput()} onChange={updateBg} ariaLabel="Open background color picker" />
                <TextField
                  value={bgInput()}
                  onChange={updateBg}
                  validationState={bgInvalidShown() ? 'invalid' : 'valid'}
                  class="flex-1"
                >
                  <TextFieldInput type="text" placeholder="#FFFFFF" class="h-12 font-mono text-base uppercase" />
                  <Show when={bgInvalidShown()}>
                    <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>
            </div>
          </div>
        </section>

        <Show when={ratio() !== null}>
          {/* Preview */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
            </div>

            <div class="rounded-md border border-border p-6 transition-colors duration-200" style={previewStyle()}>
              <p class="mb-1 text-2xl font-bold">The quick brown fox</p>
              <p class="text-sm">Jumps over the lazy dog. 0123456789</p>
            </div>
          </section>

          {/* Results */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
            </div>

            <div class="flex flex-col gap-6">
              <div class="anim-fade-up rounded-md border border-violet/30 bg-violet/5 p-6 text-center">
                <p class="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Contrast ratio</p>
                <p class="font-mono text-4xl font-bold">{ratio()!.toFixed(2)}:1</p>
              </div>

              <div class="anim-stagger grid grid-cols-2 gap-3">
                <For each={rows()}>
                  {(row) => (
                    <div class="rounded-md border border-border bg-background p-3 text-center">
                      <p class="mb-2 text-xs text-muted-foreground">{row.label}</p>
                      <span
                        class={cn(
                          'inline-block rounded border px-2 py-0.5 text-sm font-semibold',
                          badgeClass(row.level)
                        )}
                      >
                        {row.level}
                      </span>
                      <p class="mt-1 text-xs text-muted-foreground">{row.threshold}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}
