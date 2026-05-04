import { useSearchParams } from '@solidjs/router'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { ToolHeader } from '~/components/tool-header'
import { CopyButton } from '~/components/copy-button'
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
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToOklch,
  oklchToRgb,
  rgbToCmyk,
  cmykToRgb,
  type RGB,
  type HSL,
  type HSV,
  type OKLCH,
  type CMYK,
} from '~/lib/utils/color/convert'

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function normalizeHex(h: string): string {
  const clean = h.replace(/^#/, '').toUpperCase()
  return `#${clean}`
}

function isValidHex(h: string): boolean {
  return HEX_RE.test(h)
}

export default function ColorConverter() {
  setToolPageMeta('color', 'color-converter')
  const [params, setParams] = useSearchParams<{ hex?: string }>()

  const initialHex = isValidHex(params.hex ?? '') ? normalizeHex(params.hex!) : '#3B82F6'

  const [hexInput, setHexInput] = createSignal(initialHex)

  type Space = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'oklch' | 'cmyk'
  const [lastEdited, setLastEdited] = createSignal<Space>('hex')

  const isValid = createMemo(() => isValidHex(hexInput()))
  const isInvalidShown = createMemo(() => hexInput().length > 0 && !isValid())

  // Derived RGB from current hex (only valid hex)
  const rgb = createMemo((): RGB | null => {
    const h = hexInput()
    if (!isValidHex(h)) return null
    return hexToRgb(h)
  })

  const hsl = createMemo((): HSL | null => {
    const r = rgb()
    return r ? rgbToHsl(r) : null
  })

  const hsv = createMemo((): HSV | null => {
    const r = rgb()
    return r ? rgbToHsv(r) : null
  })

  const oklch = createMemo((): OKLCH | null => {
    const r = rgb()
    return r ? rgbToOklch(r) : null
  })

  const cmyk = createMemo((): CMYK | null => {
    const r = rgb()
    return r ? rgbToCmyk(r) : null
  })

  // RGB edit signals
  const [rInput, setRInput] = createSignal('')
  const [gInput, setGInput] = createSignal('')
  const [bInput, setBInput] = createSignal('')

  // HSL edit signals
  const [hslH, setHslH] = createSignal('')
  const [hslS, setHslS] = createSignal('')
  const [hslL, setHslL] = createSignal('')

  // HSV edit signals
  const [hsvH, setHsvH] = createSignal('')
  const [hsvS, setHsvS] = createSignal('')
  const [hsvV, setHsvV] = createSignal('')

  // OKLCH edit signals
  const [oklchL, setOklchL] = createSignal('')
  const [oklchC, setOklchC] = createSignal('')
  const [oklchH, setOklchH] = createSignal('')

  // CMYK edit signals
  const [cmykC, setCmykC] = createSignal('')
  const [cmykM, setCmykM] = createSignal('')
  const [cmykY, setCmykY] = createSignal('')
  const [cmykK, setCmykK] = createSignal('')

  // Sync each space's display fields from the canonical hex, but skip the
  // space the user is currently editing — otherwise rounding (e.g. 180.5 → 180.4)
  // overwrites their in-progress keystrokes.
  createEffect(() => {
    const r = rgb()
    const skip = lastEdited() === 'rgb'
    if (!r || skip) return
    setRInput(String(r.r))
    setGInput(String(r.g))
    setBInput(String(r.b))
  })

  createEffect(() => {
    const h = hsl()
    const skip = lastEdited() === 'hsl'
    if (!h || skip) return
    setHslH(String(h.h))
    setHslS(String(h.s))
    setHslL(String(h.l))
  })

  createEffect(() => {
    const h = hsv()
    const skip = lastEdited() === 'hsv'
    if (!h || skip) return
    setHsvH(String(h.h))
    setHsvS(String(h.s))
    setHsvV(String(h.v))
  })

  createEffect(() => {
    const ok = oklch()
    const skip = lastEdited() === 'oklch'
    if (!ok || skip) return
    setOklchL(String(ok.l))
    setOklchC(String(ok.c))
    setOklchH(String(ok.h))
  })

  createEffect(() => {
    const cm = cmyk()
    const skip = lastEdited() === 'cmyk'
    if (!cm || skip) return
    setCmykC(String(cm.c))
    setCmykM(String(cm.m))
    setCmykY(String(cm.y))
    setCmykK(String(cm.k))
  })

  function applyHex(h: string) {
    setLastEdited('hex')
    setHexInput(h)
    setParams({ hex: h.replace(/^#/, '') }, { replace: true })
  }

  function applyRgb() {
    setLastEdited('rgb')
    const r = parseInt(rInput(), 10)
    const g = parseInt(gInput(), 10)
    const b = parseInt(bInput(), 10)
    if ([r, g, b].some(isNaN)) return
    const hex = rgbToHex({ r, g, b })
    setHexInput(hex)
    setParams({ hex: hex.replace(/^#/, '') }, { replace: true })
  }

  function applyHsl() {
    setLastEdited('hsl')
    const h = parseFloat(hslH())
    const s = parseFloat(hslS())
    const l = parseFloat(hslL())
    if ([h, s, l].some(isNaN)) return
    const hex = rgbToHex(hslToRgb({ h, s, l }))
    setHexInput(hex)
    setParams({ hex: hex.replace(/^#/, '') }, { replace: true })
  }

  function applyHsv() {
    setLastEdited('hsv')
    const h = parseFloat(hsvH())
    const s = parseFloat(hsvS())
    const v = parseFloat(hsvV())
    if ([h, s, v].some(isNaN)) return
    const hex = rgbToHex(hsvToRgb({ h, s, v }))
    setHexInput(hex)
    setParams({ hex: hex.replace(/^#/, '') }, { replace: true })
  }

  function applyOklch() {
    setLastEdited('oklch')
    const l = parseFloat(oklchL())
    const c = parseFloat(oklchC())
    const h = parseFloat(oklchH())
    if ([l, c, h].some(isNaN)) return
    const hex = rgbToHex(oklchToRgb({ l, c, h }))
    setHexInput(hex)
    setParams({ hex: hex.replace(/^#/, '') }, { replace: true })
  }

  function applyCmyk() {
    setLastEdited('cmyk')
    const c = parseFloat(cmykC())
    const m = parseFloat(cmykM())
    const y = parseFloat(cmykY())
    const k = parseFloat(cmykK())
    if ([c, m, y, k].some(isNaN)) return
    const hex = rgbToHex(cmykToRgb({ c, m, y, k }))
    setHexInput(hex)
    setParams({ hex: hex.replace(/^#/, '') }, { replace: true })
  }

  const rgbStr = createMemo(() => {
    const r = rgb()
    return r ? `rgb(${r.r}, ${r.g}, ${r.b})` : ''
  })

  const hslStr = createMemo(() => {
    const h = hsl()
    return h ? `hsl(${h.h}, ${h.s}%, ${h.l}%)` : ''
  })

  const hsvStr = createMemo(() => {
    const h = hsv()
    return h ? `hsv(${h.h}, ${h.s}%, ${h.v}%)` : ''
  })

  const oklchStr = createMemo(() => {
    const ok = oklch()
    return ok ? `oklch(${ok.l} ${ok.c} ${ok.h})` : ''
  })

  const cmykStr = createMemo(() => {
    const cm = cmyk()
    return cm ? `cmyk(${cm.c}%, ${cm.m}%, ${cm.y}%, ${cm.k}%)` : ''
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color converter"
        description="Convert a color between HEX, RGB, HSL, HSV, OKLCH, and CMYK formats with a live preview."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Color input + swatch */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Color</h2>
          </div>

          <div class="flex items-center gap-3">
            <ColorSwatchPicker value={hexInput()} onChange={applyHex} />
            <TextField
              value={hexInput()}
              onChange={(v) => {
                setLastEdited('hex')
                setHexInput(v)
                if (isValidHex(v)) {
                  setParams({ hex: normalizeHex(v).replace(/^#/, '') }, { replace: true })
                }
              }}
              validationState={isInvalidShown() ? 'invalid' : 'valid'}
              class="flex-1"
            >
              <div class="relative">
                <TextFieldInput
                  autofocus
                  type="text"
                  placeholder="#3B82F6"
                  class="h-12 pr-12 font-mono text-base uppercase"
                />
                <CopyButton value={() => hexInput()} class="absolute right-1.5 top-1/2 -translate-y-1/2" />
              </div>
              <Show when={isInvalidShown()}>
                <TextFieldErrorMessage>Enter a valid 6-digit hex color (e.g. #3B82F6)</TextFieldErrorMessage>
              </Show>
            </TextField>
          </div>
        </section>

        {/* RGB */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">RGB</h2>
            </div>
            <CopyButton value={rgbStr} />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <NumberField
              value={rInput()}
              onChange={(v) => {
                setRInput(v)
                applyRgb()
              }}
              minValue={0}
              maxValue={255}
              step={1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                R (0–255)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={gInput()}
              onChange={(v) => {
                setGInput(v)
                applyRgb()
              }}
              minValue={0}
              maxValue={255}
              step={1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                G (0–255)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={bInput()}
              onChange={(v) => {
                setBInput(v)
                applyRgb()
              }}
              minValue={0}
              maxValue={255}
              step={1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                B (0–255)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* HSL */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">HSL</h2>
            </div>
            <CopyButton value={hslStr} />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <NumberField
              value={hslH()}
              onChange={(v) => {
                setHslH(v)
                applyHsl()
              }}
              minValue={0}
              maxValue={360}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                H (0–360)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hslS()}
              onChange={(v) => {
                setHslS(v)
                applyHsl()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                S (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hslL()}
              onChange={(v) => {
                setHslL(v)
                applyHsl()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                L (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* HSV */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">HSV</h2>
            </div>
            <CopyButton value={hsvStr} />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <NumberField
              value={hsvH()}
              onChange={(v) => {
                setHsvH(v)
                applyHsv()
              }}
              minValue={0}
              maxValue={360}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                H (0–360)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hsvS()}
              onChange={(v) => {
                setHsvS(v)
                applyHsv()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                S (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hsvV()}
              onChange={(v) => {
                setHsvV(v)
                applyHsv()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                V (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* OKLCH */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">OKLCH</h2>
            </div>
            <CopyButton value={oklchStr} />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <NumberField
              value={oklchL()}
              onChange={(v) => {
                setOklchL(v)
                applyOklch()
              }}
              minValue={0}
              maxValue={1}
              step={0.001}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                L (0–1)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={oklchC()}
              onChange={(v) => {
                setOklchC(v)
                applyOklch()
              }}
              minValue={0}
              maxValue={0.4}
              step={0.001}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                C (0–0.4)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={oklchH()}
              onChange={(v) => {
                setOklchH(v)
                applyOklch()
              }}
              minValue={0}
              maxValue={360}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                H (0–360)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>

        {/* CMYK */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">CMYK</h2>
            </div>
            <CopyButton value={cmykStr} />
          </div>

          <p class="mb-4 text-xs text-muted-foreground">
            Screen-preview approximation. Accurate print output requires an ICC profile.
          </p>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField
              value={cmykC()}
              onChange={(v) => {
                setCmykC(v)
                applyCmyk()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                C (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={cmykM()}
              onChange={(v) => {
                setCmykM(v)
                applyCmyk()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                M (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={cmykY()}
              onChange={(v) => {
                setCmykY(v)
                applyCmyk()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Y (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={cmykK()}
              onChange={(v) => {
                setCmykK(v)
                applyCmyk()
              }}
              minValue={0}
              maxValue={100}
              step={0.1}
              format={false}
              class="flex flex-col gap-1.5"
            >
              <NumberFieldLabel class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                K (0–100)
              </NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </div>
        </section>
      </div>
    </main>
  )
}
