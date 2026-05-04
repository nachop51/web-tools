import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { simulateBlindness, type BlindnessType } from '~/lib/utils/color/blindness'
import { setToolPageMeta } from '~/lib/seo'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

const TYPES: { key: BlindnessType; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'protanopia', label: 'Protanopia' },
  { key: 'deuteranopia', label: 'Deuteranopia' },
  { key: 'tritanopia', label: 'Tritanopia' },
  { key: 'achromatopsia', label: 'Achromatopsia' },
]

export default function ColorBlindness() {
  setToolPageMeta('color', 'color-blindness')
  const [params, setParams] = useSearchParams<{ c?: string }>()
  const initial = HEX_RE.test(params.c ?? '') ? normalizeHex(params.c!) : '#3B82F6'

  const [hexInput, setHexInput] = createSignal(initial)

  const isValid = createMemo(() => HEX_RE.test(hexInput()))
  const isInvalidShown = createMemo(() => hexInput().length > 0 && !isValid())

  const result = createMemo(() => (isValid() ? simulateBlindness(hexInput()) : null))

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color blindness"
        description="Simulate how a color appears with protanopia, deuteranopia, tritanopia, and achromatopsia."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Source color */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Source color</h2>
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
              <TextFieldInput autofocus type="text" placeholder="#3B82F6" class="h-12 font-mono text-base uppercase" />
              <Show when={isInvalidShown()}>
                <TextFieldErrorMessage>Enter a valid 6-digit hex color</TextFieldErrorMessage>
              </Show>
            </TextField>
          </div>
        </section>

        {/* Simulations */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Simulations</h2>
          </div>

          <Show
            when={result() !== null}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a valid color to see simulations
              </div>
            }
          >
            <div class="anim-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <For each={TYPES}>
                {(t) => (
                  <div class="flex flex-col gap-1.5">
                    <div
                      class="h-24 rounded-md border border-border shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]"
                      style={{ 'background-color': result()![t.key] }}
                    />
                    <div class="text-center text-xs font-semibold">{t.label}</div>
                    <div class="text-center font-mono text-[10px] text-muted-foreground">{result()![t.key]}</div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>
      </div>
    </main>
  )
}
