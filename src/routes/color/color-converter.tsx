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
  type RGB,
  type HSL,
  type HSV,
  type OKLCH,
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

  // Sync display fields when hex changes externally
  createEffect(() => {
    const r = rgb()
    if (!r) return
    setRInput(String(r.r))
    setGInput(String(r.g))
    setBInput(String(r.b))
  })

  createEffect(() => {
    const h = hsl()
    if (!h) return
    setHslH(String(h.h))
    setHslS(String(h.s))
    setHslL(String(h.l))
  })

  createEffect(() => {
    const h = hsv()
    if (!h) return
    setHsvH(String(h.h))
    setHsvS(String(h.s))
    setHsvV(String(h.v))
  })

  createEffect(() => {
    const ok = oklch()
    if (!ok) return
    setOklchL(String(ok.l))
    setOklchC(String(ok.c))
    setOklchH(String(ok.h))
  })

  function applyHex(h: string) {
    setHexInput(h)
    setParams({ hex: h.replace(/^#/, '') })
  }

  function applyRgb() {
    const r = parseInt(rInput(), 10)
    const g = parseInt(gInput(), 10)
    const b = parseInt(bInput(), 10)
    if ([r, g, b].some(isNaN)) return
    const hex = rgbToHex({ r, g, b })
    applyHex(hex)
  }

  function applyHsl() {
    const h = parseFloat(hslH())
    const s = parseFloat(hslS())
    const l = parseFloat(hslL())
    if ([h, s, l].some(isNaN)) return
    const hex = rgbToHex(hslToRgb({ h, s, l }))
    applyHex(hex)
  }

  function applyHsv() {
    const h = parseFloat(hsvH())
    const s = parseFloat(hsvS())
    const v = parseFloat(hsvV())
    if ([h, s, v].some(isNaN)) return
    const hex = rgbToHex(hsvToRgb({ h, s, v }))
    applyHex(hex)
  }

  function applyOklch() {
    const l = parseFloat(oklchL())
    const c = parseFloat(oklchC())
    const h = parseFloat(oklchH())
    if ([l, c, h].some(isNaN)) return
    const hex = rgbToHex(oklchToRgb({ l, c, h }))
    applyHex(hex)
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

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Color converter"
        description="Convert a color between HEX, RGB, HSL, HSV, and OKLCH formats with a live preview."
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
                setHexInput(v)
                if (isValidHex(v)) {
                  setParams({ hex: normalizeHex(v).replace(/^#/, '') })
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
              onChange={setRInput}
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
                <NumberFieldInput class="font-mono" onBlur={applyRgb} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={gInput()}
              onChange={setGInput}
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
                <NumberFieldInput class="font-mono" onBlur={applyRgb} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={bInput()}
              onChange={setBInput}
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
                <NumberFieldInput class="font-mono" onBlur={applyRgb} />
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
              onChange={setHslH}
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
                <NumberFieldInput class="font-mono" onBlur={applyHsl} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hslS()}
              onChange={setHslS}
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
                <NumberFieldInput class="font-mono" onBlur={applyHsl} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hslL()}
              onChange={setHslL}
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
                <NumberFieldInput class="font-mono" onBlur={applyHsl} />
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
              onChange={setHsvH}
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
                <NumberFieldInput class="font-mono" onBlur={applyHsv} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hsvS()}
              onChange={setHsvS}
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
                <NumberFieldInput class="font-mono" onBlur={applyHsv} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={hsvV()}
              onChange={setHsvV}
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
                <NumberFieldInput class="font-mono" onBlur={applyHsv} />
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
              onChange={setOklchL}
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
                <NumberFieldInput class="font-mono" onBlur={applyOklch} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={oklchC()}
              onChange={setOklchC}
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
                <NumberFieldInput class="font-mono" onBlur={applyOklch} />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <NumberField
              value={oklchH()}
              onChange={setOklchH}
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
                <NumberFieldInput class="font-mono" onBlur={applyOklch} />
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
