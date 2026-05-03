import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { apcaContrast, APCA_LEVELS } from '~/lib/utils/color/apca'
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

function isValidHex(h: string): boolean {
  return HEX_RE.test(h)
}

export default function ApcaContrast() {
  setToolPageMeta('color', 'apca')
  const [params, setParams] = useSearchParams<{ fg?: string; bg?: string }>()

  const initialFg = isValidHex(params.fg ?? '') ? normalizeHex(params.fg!) : '#000000'
  const initialBg = isValidHex(params.bg ?? '') ? normalizeHex(params.bg!) : '#FFFFFF'

  const [fgInput, setFgInput] = createSignal(initialFg)
  const [bgInput, setBgInput] = createSignal(initialBg)

  const isFgValid = createMemo(() => isValidHex(fgInput()))
  const isBgValid = createMemo(() => isValidHex(bgInput()))

  const isFgInvalidShown = createMemo(() => fgInput().length > 0 && !isFgValid())
  const isBgInvalidShown = createMemo(() => bgInput().length > 0 && !isBgValid())

  const lc = createMemo(() => {
    if (!isFgValid() || !isBgValid()) return null
    return apcaContrast(fgInput(), bgInput())
  })

  const polarity = createMemo(() => {
    const v = lc()
    if (v === null) return ''
    if (v > 0) return 'Dark text on light background'
    if (v < 0) return 'Light text on dark background'
    return 'No contrast'
  })

  function updateFg(v: string) {
    const norm = v.startsWith('#') ? v.toUpperCase() : v
    setFgInput(norm)
    if (isValidHex(norm)) setParams({ fg: norm.replace(/^#/, ''), bg: bgInput().replace(/^#/, '') })
  }

  function updateBg(v: string) {
    const norm = v.startsWith('#') ? v.toUpperCase() : v
    setBgInput(norm)
    if (isValidHex(norm)) setParams({ fg: fgInput().replace(/^#/, ''), bg: norm.replace(/^#/, '') })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="APCA contrast"
        description="Calculate the APCA (WCAG 3 draft) Lc contrast value for text readability."
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
              <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Foreground (text)</span>
              <div class="flex items-center gap-3">
                <ColorSwatchPicker value={fgInput()} onChange={updateFg} ariaLabel="Open foreground color picker" />
                <TextField
                  value={fgInput()}
                  onChange={updateFg}
                  validationState={isFgInvalidShown() ? 'invalid' : 'valid'}
                  class="flex-1"
                >
                  <TextFieldInput
                    autofocus
                    type="text"
                    placeholder="#000000"
                    class="h-12 font-mono text-base uppercase"
                  />
                  <Show when={isFgInvalidShown()}>
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
                  validationState={isBgInvalidShown() ? 'invalid' : 'valid'}
                  class="flex-1"
                >
                  <TextFieldInput type="text" placeholder="#FFFFFF" class="h-12 font-mono text-base uppercase" />
                  <Show when={isBgInvalidShown()}>
                    <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
                  </Show>
                </TextField>
              </div>
            </div>
          </div>
        </section>

        <Show when={lc() !== null}>
          {/* Preview */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
            </div>

            <div
              class="rounded-md border border-border p-6 transition-colors duration-200"
              style={{ color: fgInput(), 'background-color': bgInput() }}
            >
              <p class="mb-1 text-2xl font-bold">Sample text on background</p>
              <p class="text-sm">The quick brown fox jumps over the lazy dog. 0123456789</p>
            </div>
          </section>

          {/* Result */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</h2>
            </div>

            <div class="flex flex-col gap-6">
              <div class="anim-fade-up rounded-md border border-violet/30 bg-violet/5 p-6 text-center">
                <p class="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">APCA Lc value</p>
                <p class="font-mono text-4xl font-bold">{lc()!.toFixed(2)}</p>
                <p class="mt-1 text-sm text-muted-foreground">{polarity()}</p>
              </div>

              <div class="anim-stagger grid gap-2 sm:grid-cols-2">
                <For each={APCA_LEVELS}>
                  {(level) => {
                    const passes = createMemo(() => Math.abs(lc()!) >= level.threshold)
                    return (
                      <div
                        class={cn(
                          'flex items-center justify-between rounded-md border px-3 py-2 transition-colors',
                          passes()
                            ? 'border-green-500/30 bg-green-500/15 text-green-700 dark:text-green-400'
                            : 'border-destructive/30 bg-destructive/15 text-destructive'
                        )}
                      >
                        <div>
                          <p class="font-mono text-sm font-semibold">{level.label}</p>
                          <p class="text-xs opacity-80">{level.description}</p>
                        </div>
                        <span class="text-xs font-bold uppercase">{passes() ? 'Pass' : 'Fail'}</span>
                      </div>
                    )
                  }}
                </For>
              </div>
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}
