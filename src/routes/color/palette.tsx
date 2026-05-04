import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
import { ToolToolbar } from '~/components/tool-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { generatePalette, type PaletteMode } from '~/lib/utils/color/palette'
import { setToolPageMeta } from '~/lib/seo'

type ModeOption = { label: string; value: PaletteMode }

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, '').toUpperCase()}`
}

const MODE_OPTIONS: ModeOption[] = [
  { label: 'Complementary', value: 'complementary' },
  { label: 'Triadic', value: 'triadic' },
  { label: 'Analogous', value: 'analogous' },
  { label: 'Split-complementary', value: 'split-complementary' },
  { label: 'Tetradic', value: 'tetradic' },
  { label: 'Monochromatic', value: 'monochromatic' },
]

const MODES: PaletteMode[] = MODE_OPTIONS.map((o) => o.value)

function isMode(s: string): s is PaletteMode {
  return (MODES as string[]).includes(s)
}

export default function PaletteGenerator() {
  setToolPageMeta('color', 'palette')
  const [params, setParams] = useSearchParams<{ c?: string; mode?: string }>()
  const initialHex = HEX_RE.test(params.c ?? '') ? normalizeHex(params.c!) : '#3B82F6'
  const initialMode: PaletteMode = isMode(params.mode ?? '') ? (params.mode as PaletteMode) : 'complementary'

  const [hexInput, setHexInput] = createSignal(initialHex)
  const [mode, setMode] = createSignal<PaletteMode>(initialMode)

  const selectedMode = createMemo(() => MODE_OPTIONS.find((o) => o.value === mode()) ?? MODE_OPTIONS[0])

  const isValid = createMemo(() => HEX_RE.test(hexInput()))
  const isInvalidShown = createMemo(() => hexInput().length > 0 && !isValid())

  const palette = createMemo(() => (isValid() ? generatePalette(hexInput(), mode()) : []))

  function applyMode(m: PaletteMode) {
    setMode(m)
    setParams({ c: hexInput().replace('#', ''), mode: m }, { replace: true })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Palette generator"
        description="Generate complementary, triadic, analogous, and other color harmony palettes."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Harmony</span>
          <Select<ModeOption>
            options={MODE_OPTIONS}
            optionValue="value"
            optionTextValue="label"
            value={selectedMode()}
            onChange={(opt) => opt && applyMode(opt.value)}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
            )}
          >
            <SelectTrigger aria-label="Harmony" class="h-8 w-52 text-sm">
              <SelectValue<ModeOption>>{(state) => state.selectedOption()?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </ToolToolbar>

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
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', ''), mode: mode() }, { replace: true })
              }}
            />
            <TextField
              value={hexInput()}
              onChange={(v) => {
                setHexInput(v)
                if (HEX_RE.test(v)) setParams({ c: normalizeHex(v).replace('#', ''), mode: mode() }, { replace: true })
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

        {/* Palette */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Palette</h2>
          </div>

          <Show
            when={palette().length > 0}
            fallback={
              <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Enter a valid color to see the palette
              </div>
            }
          >
            <div class="anim-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <For each={palette()}>
                {(color) => (
                  <div class="overflow-hidden rounded-md border border-border bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div class="h-28" style={{ 'background-color': color.hex }} />
                    <div class="relative space-y-1 p-3 pr-12">
                      <code class="block font-mono text-sm font-semibold">{color.hex}</code>
                      <code class="block font-mono text-xs text-muted-foreground">
                        oklch({color.oklch.l} {color.oklch.c} {color.oklch.h})
                      </code>
                      <CopyButton value={() => color.hex} class="absolute right-2 top-2" />
                    </div>
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
