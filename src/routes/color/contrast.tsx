import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import {
  TbOutlineArrowRight,
  TbOutlineCheck,
  TbOutlineEye,
  TbOutlineHexagon,
  TbOutlineLink,
  TbOutlineRocket,
  TbOutlineTag,
  TbOutlineX,
} from 'solid-icons/tb'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldInput, TextFieldErrorMessage } from '~/components/ui/text-field'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { ColorSwatchPicker } from '~/components/ui/color-picker'
import { hexToRgb, type RGB } from '~/lib/utils/color/convert'
import { contrastRatio, wcagLevel, type WcagLevel } from '~/lib/utils/color/contrast'
import { APCA_LEVELS, apcaContrast } from '~/lib/utils/color/apca'
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

function wcagLevelText(level: WcagLevel): string {
  if (level === 'AAA') return 'Best pass'
  if (level === 'AA') return 'Good pass'
  return 'Fail'
}

type ResultRow = {
  label: string
  threshold: string
  level: WcagLevel
}

type ContrastMode = 'wcag' | 'apca'

const modeOptions: { value: ContrastMode; label: string }[] = [
  { value: 'wcag', label: 'WCAG 2.x ratio' },
  { value: 'apca', label: 'APCA (Lc)' },
]

export default function ContrastChecker() {
  setToolPageMeta('color', 'contrast')
  const [params, setParams] = useSearchParams<{ fg?: string; bg?: string; mode?: string }>()

  // SSR always renders <html class="dark">; mirror that on the server to avoid hydration flicker for dark-mode users.
  const darkInitial = typeof document === 'undefined' || document.documentElement.classList.contains('dark')
  const initialFg = isValidHex(params.fg ?? '')
    ? `#${normalizeHex(params.fg!)}`
    : darkInitial ? '#FFFFFF' : '#000000'
  const initialBg = isValidHex(params.bg ?? '')
    ? `#${normalizeHex(params.bg!)}`
    : darkInitial ? '#000000' : '#FFFFFF'

  const [fgInput, setFgInput] = createSignal(initialFg)
  const [bgInput, setBgInput] = createSignal(initialBg)
  const [mode, setModeSignal] = createSignal<ContrastMode>(params.mode === 'apca' ? 'apca' : 'wcag')

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

  const lc = createMemo((): number | null => {
    if (!fgValid() || !bgValid()) return null
    return apcaContrast(fgInput(), bgInput())
  })

  const polarity = createMemo(() => {
    const value = lc()
    if (value === null) return ''
    if (value > 0) return 'Dark text on light background'
    if (value < 0) return 'Light text on dark background'
    return 'No contrast'
  })

  function updateFg(v: string) {
    setFgInput(v)
    if (isValidHex(v)) setParams({ fg: normalizeHex(v) }, { replace: true })
  }

  function updateBg(v: string) {
    setBgInput(v)
    if (isValidHex(v)) setParams({ bg: normalizeHex(v) }, { replace: true })
  }

  function setMode(v: ContrastMode) {
    setModeSignal(v)
    setParams({ mode: v === 'wcag' ? undefined : v }, { replace: true })
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

  const apcaRows = createMemo(() => {
    const value = lc()
    if (value === null) return []
    const abs = Math.abs(value)
    return APCA_LEVELS.map((level) => {
      const pass = abs >= level.threshold
      const accent = pass ? 'pass' : 'fail'
      const status = pass ? 'Pass' : 'Fail'
      return { ...level, pass, accent, status }
    })
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Contrast checker"
        description="Check text contrast using either WCAG 2.x ratio (AA/AAA) or APCA Lc readability scoring."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Method" value={mode()} onChange={setMode} options={modeOptions} />
        </ToolToolbar>

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

            <div
              class="rounded-md border border-border p-6 transition-colors duration-200 sm:p-8"
              style={previewStyle()}
            >
              {/* Top bar: small text + icon */}
              <div class="mb-6 flex items-center justify-between border-b border-current/20 pb-3">
                <div class="flex items-center gap-2">
                  <TbOutlineHexagon size={18} aria-hidden />
                  <span class="text-xs font-semibold uppercase tracking-wider">web-tools · v1</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <TbOutlineEye size={14} aria-hidden />
                  <span>2.1k views</span>
                </div>
              </div>

              {/* Large heading: covers "Large text" criteria */}
              <div class="mb-3 flex items-start gap-3">
                <TbOutlineRocket size={28} class="shrink-0 mt-0.5" aria-hidden />
                <h3 class="text-2xl font-bold leading-tight tracking-tight">Build with confidence.</h3>
              </div>

              {/* Body paragraph: covers "Normal text" criteria */}
              <p class="mb-5 text-sm leading-relaxed">
                Pick any two colors and instantly verify readability using{' '}
                <span class="font-semibold">{mode() === 'wcag' ? 'WCAG ratio' : 'APCA Lc'}</span> for both normal and
                large text scenarios.
              </p>

              {/* Feature list with pass/fail icons */}
              <ul class="mb-6 space-y-1.5 text-sm">
                <li class="flex items-center gap-2">
                  <TbOutlineCheck size={16} class="shrink-0" aria-hidden />
                  <span>Crystal clear at any size</span>
                </li>
                <li class="flex items-center gap-2">
                  <TbOutlineCheck size={16} class="shrink-0" aria-hidden />
                  <span>Fully WCAG 2.1 compliant</span>
                </li>
                <li class="flex items-center gap-2">
                  <TbOutlineX size={16} class="shrink-0" aria-hidden />
                  <span>No more guessing</span>
                </li>
              </ul>

              {/* Button + link */}
              <div class="mb-5 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-md border-2 border-current px-3.5 py-1.5 text-sm font-semibold"
                >
                  Get started
                  <TbOutlineArrowRight size={14} aria-hidden />
                </button>
                <a class="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
                  <TbOutlineLink size={14} aria-hidden />
                  Learn more
                </a>
              </div>

              {/* Footer: tag + monospace + sample sentence */}
              <div class="flex flex-wrap items-center gap-3 border-t border-current/20 pt-3 text-xs">
                <span class="inline-flex items-center gap-1 rounded border border-current/40 px-1.5 py-0.5 font-medium uppercase tracking-wider">
                  <TbOutlineTag size={12} aria-hidden />
                  new
                </span>
                <span class="font-mono">0123456789</span>
                <span class="opacity-80">The quick brown fox jumps over the lazy dog.</span>
              </div>
            </div>
          </section>

          {/* Results */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Results</h2>
              <Show when={mode() === 'wcag'}>
                <Tooltip>
                  <TooltipTrigger
                    as="button"
                    type="button"
                    class="inline-flex size-4 items-center justify-center rounded-full border border-border text-[10px] font-bold text-muted-foreground cursor-help"
                    aria-label="WCAG level explanation"
                  >
                    ?
                  </TooltipTrigger>
                  <TooltipContent>
                    WCAG levels: AA is the common accessibility target; AAA is a stricter target with higher readability.
                  </TooltipContent>
                </Tooltip>
              </Show>
            </div>

            <Show
              when={mode() === 'wcag'}
              fallback={
                <div class="flex flex-col gap-6">
                  <div class="anim-fade-up rounded-md border border-violet/30 bg-violet/5 p-6 text-center">
                    <p class="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">APCA Lc value</p>
                    <p class="font-mono text-4xl font-bold">{lc()!.toFixed(2)}</p>
                    <p class="mt-1 text-sm text-muted-foreground">{polarity()}</p>
                  </div>

                  <div class="anim-stagger grid gap-2 sm:grid-cols-2">
                    <For each={apcaRows()}>
                      {(row) => (
                        <div
                          class={cn(
                            'flex items-center justify-between rounded-md border px-3 py-2 transition-colors',
                            row.accent === 'pass'
                              ? 'border-green-500/30 bg-green-500/15 text-green-700 dark:text-green-400'
                              : 'border-destructive/30 bg-destructive/15 text-destructive'
                          )}
                        >
                          <div>
                            <p class="font-mono text-sm font-semibold">{row.label}</p>
                            <p class="text-xs opacity-80">{row.description}</p>
                          </div>
                          <span class="inline-flex items-center gap-1 text-xs font-bold uppercase">
                            <Show
                              when={row.pass}
                              fallback={
                                <>
                                  <TbOutlineX size={14} aria-hidden />
                                  {row.status}
                                </>
                              }
                            >
                              <TbOutlineCheck size={14} aria-hidden />
                              {row.status}
                            </Show>
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span class="inline-flex items-center gap-1.5">
                      <span class="size-2 rounded-full bg-green-500" aria-hidden />
                      <span>Green: passes this APCA threshold</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <span class="size-2 rounded-full bg-destructive" aria-hidden />
                      <span>Red: below recommended threshold</span>
                    </span>
                  </div>
                </div>
              }
            >
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
                            'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-sm font-semibold',
                            badgeClass(row.level)
                          )}
                        >
                          {row.level === 'Fail' ? (
                            <TbOutlineX size={14} aria-hidden />
                          ) : (
                            <TbOutlineCheck size={14} aria-hidden />
                          )}
                          {wcagLevelText(row.level)}
                        </span>
                        <p class="mt-1 text-xs text-muted-foreground">{row.threshold}</p>
                      </div>
                    )}
                  </For>
                </div>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full bg-green-500" aria-hidden />
                    <span>Green: best readability target (AAA)</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full bg-blue-500" aria-hidden />
                    <span>Blue: good readability target (AA)</span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full bg-destructive" aria-hidden />
                    <span>Red: fail</span>
                  </span>
                </div>
              </div>
            </Show>
          </section>
        </Show>
      </div>
    </main>
  )
}
