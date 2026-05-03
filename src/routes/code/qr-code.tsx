import { createEffect, createMemo, createSignal, For, on, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { Button } from '~/components/ui/button'
import { ColorInput } from '~/components/ui/color-picker'
import { Slider, SliderFill, SliderThumb, SliderTrack } from '~/components/ui/slider'
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { cn } from '~/lib/utils'
import { generateQrDataUrl, type QrOpts } from '~/lib/utils/code/qr'
import { setToolPageMeta } from '~/lib/seo'

type ECL = 'L' | 'M' | 'Q' | 'H'
type LogoShape = 'square' | 'circle'

type EclOption = { label: string; value: ECL }
type LogoShapeOption = { label: string; value: LogoShape }

const eclOptions: EclOption[] = [
  { label: 'L · 7%', value: 'L' },
  { label: 'M · 15%', value: 'M' },
  { label: 'Q · 25%', value: 'Q' },
  { label: 'H · 30%', value: 'H' },
]

const logoShapeOptions: LogoShapeOption[] = [
  { label: 'Square', value: 'square' },
  { label: 'Circle', value: 'circle' },
]

const MIN_SIZE = 100
const MAX_SIZE = 1000

export default function QrCodeTool() {
  setToolPageMeta('code', 'qr-code')
  const [params, setParams] = useSearchParams<{
    text?: string
    size?: string
    ecl?: string
    fg?: string
    bg?: string
    round?: string
  }>()

  const validEcl = (['L', 'M', 'Q', 'H'] as ECL[]).includes(params.ecl as ECL) ? (params.ecl as ECL) : 'M'
  const validSize = params.size ? parseInt(params.size, 10) : 256

  const [text, setText] = createSignal(params.text ?? '')
  const [size, setSize] = createSignal(validSize >= MIN_SIZE && validSize <= MAX_SIZE ? validSize : 256)
  const [ecl, setEcl] = createSignal<ECL>(validEcl)
  const [fgColor, setFgColor] = createSignal(params.fg ?? '#000000')
  const [bgColor, setBgColor] = createSignal(params.bg ?? '#ffffff')
  const [roundness, setRoundness] = createSignal(
    params.round ? Math.min(50, Math.max(0, parseInt(params.round, 10))) : 0
  )
  const [logoDataUrl, setLogoDataUrl] = createSignal<string | undefined>()
  const [logoShape, setLogoShape] = createSignal<LogoShape>('square')

  function handleText(v: string) {
    setText(v)
    setParams({ text: v })
  }

  function handleSize(v: number) {
    setSize(v)
    setParams({ size: String(v) })
  }

  function handleEcl(v: ECL) {
    if (logoDataUrl()) return
    setEcl(v)
    setParams({ ecl: v })
  }

  function handleFgColor(v: string) {
    setFgColor(v)
    setParams({ fg: v })
  }

  function handleBgColor(v: string) {
    setBgColor(v)
    setParams({ bg: v })
  }

  function handleRoundness(v: number) {
    setRoundness(v)
    setParams({ round: String(v) })
  }

  function handleLogoUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const opts = createMemo<QrOpts>(() => ({
    size: size(),
    ecl: logoDataUrl() ? 'H' : ecl(),
    fgColor: fgColor(),
    bgColor: bgColor(),
    roundness: roundness(),
    logo: logoDataUrl(),
    logoShape: logoShape(),
  }))

  let genId = 0
  const [dataUrl, setDataUrl] = createSignal('')
  const [generating, setGenerating] = createSignal(false)

  createEffect(
    on([text, opts], ([t, o]) => {
      const id = ++genId
      if (!t.trim()) {
        setDataUrl('')
        setGenerating(false)
        return
      }
      setGenerating(true)
      generateQrDataUrl(t, o).then((url) => {
        if (id === genId) {
          setDataUrl(url)
          setGenerating(false)
        }
      })
    })
  )

  function download() {
    const url = dataUrl()
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="QR code generator"
        description="Generate QR codes from any text or URL with customizable size and error correction."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Options</h2>
            </div>

            <div class="space-y-6">
              <TextField value={text()} onChange={handleText}>
                <TextFieldLabel>Text / URL</TextFieldLabel>
                <TextFieldInput
                  autofocus
                  type="text"
                  placeholder="Enter text or URL to encode…"
                  class="h-12 font-mono text-base"
                />
              </TextField>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Size</span>
                  <span class="font-mono text-sm font-semibold text-violet">{size()}px</span>
                </div>
                <Slider
                  value={[size()]}
                  onChange={(v) => handleSize(v[0])}
                  minValue={MIN_SIZE}
                  maxValue={MAX_SIZE}
                  step={50}
                >
                  <SliderTrack>
                    <SliderFill />
                    <SliderThumb />
                  </SliderTrack>
                </Slider>
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>100px</span>
                  <span>1000px</span>
                </div>
              </div>

              <div
                class={cn(
                  'space-y-2 transition-opacity',
                  logoDataUrl() && 'pointer-events-none opacity-50 select-none'
                )}
              >
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">Error correction</p>
                  <Show when={logoDataUrl()}>
                    <span class="text-xs text-muted-foreground">forced to H (logo)</span>
                  </Show>
                </div>
                <div role="radiogroup" aria-label="Error correction level" class="flex flex-wrap gap-2">
                  <For each={eclOptions}>
                    {(opt) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={ecl() === opt.value}
                        onClick={() => handleEcl(opt.value)}
                        class={cn(
                          'rounded-md border px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          ecl() === opt.value
                            ? 'border-violet bg-violet text-white'
                            : 'border-border bg-background hover:border-violet/60 hover:bg-violet/5'
                        )}
                      >
                        {opt.label}
                      </button>
                    )}
                  </For>
                </div>
              </div>

              <hr class="border-border" />

              <div class="space-y-6">
                <div class="flex items-center gap-2">
                  <span aria-hidden class="size-2 rounded-full bg-violet/60" />
                  <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Style</h3>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <ColorInput value={fgColor()} onChange={handleFgColor} label="Foreground" placeholder="#000000" />
                  <ColorInput value={bgColor()} onChange={handleBgColor} label="Background" placeholder="#ffffff" />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Roundness</span>
                    <span class="font-mono text-sm font-semibold text-violet">{roundness()}%</span>
                  </div>
                  <Slider
                    value={[roundness()]}
                    onChange={(v) => handleRoundness(v[0])}
                    minValue={0}
                    maxValue={50}
                    step={5}
                  >
                    <SliderTrack>
                      <SliderFill />
                      <SliderThumb />
                    </SliderTrack>
                  </Slider>
                  <div class="flex justify-between text-xs text-muted-foreground">
                    <span>Sharp</span>
                    <span>Soft</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-medium">Logo</p>
                  <Show
                    when={logoDataUrl()}
                    fallback={
                      <label class="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground transition-colors hover:border-violet/50 hover:bg-violet/5">
                        <span class="font-medium">Click to upload image</span>
                        <span class="text-xs">PNG, JPG, SVG, WEBP</span>
                        <input type="file" accept="image/*" class="hidden" onChange={handleLogoUpload} />
                      </label>
                    }
                  >
                    <div class="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                      <img src={logoDataUrl()} alt="Logo preview" class="size-10 rounded object-contain" />
                      <span class="flex-1 text-sm text-muted-foreground">Logo loaded</span>
                      <button
                        type="button"
                        class="text-sm text-destructive hover:underline cursor-pointer"
                        onClick={() => setLogoDataUrl(undefined)}
                      >
                        Remove
                      </button>
                    </div>
                  </Show>

                  <Show when={logoDataUrl()}>
                    <p class="text-xs text-muted-foreground">Logo forces ECL to H (30% recovery)</p>
                  </Show>
                </div>

                <Show when={logoDataUrl()}>
                  <div class="space-y-2">
                    <p class="text-sm font-medium">Logo shape</p>
                    <div role="radiogroup" aria-label="Logo shape" class="flex gap-2">
                      <For each={logoShapeOptions}>
                        {(opt) => (
                          <button
                            type="button"
                            role="radio"
                            aria-checked={logoShape() === opt.value}
                            onClick={() => setLogoShape(opt.value)}
                            class={cn(
                              'rounded-md border px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                              logoShape() === opt.value
                                ? 'border-violet bg-violet text-white'
                                : 'border-border bg-background hover:border-violet/60 hover:bg-violet/5'
                            )}
                          >
                            {opt.label}
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </section>

          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
            </div>

            <Show
              when={!generating()}
              fallback={
                <div class="flex min-h-[16rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Generating…
                </div>
              }
            >
              <Show
                when={dataUrl()}
                fallback={
                  <div class="flex min-h-[16rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Enter text to generate a QR code
                  </div>
                }
              >
                <div class="anim-fade-up flex flex-col items-center gap-4 rounded-md border border-violet/30 bg-violet/5 p-6">
                  <img
                    src={dataUrl()}
                    alt="QR code"
                    class="rounded-md border border-border"
                    style={{
                      width: `${Math.min(size(), 400)}px`,
                      height: `${Math.min(size(), 400)}px`,
                      'background-color': bgColor(),
                    }}
                  />
                  <Button onClick={download}>Download PNG</Button>
                </div>
              </Show>
            </Show>
          </section>
        </div>
      </div>
    </main>
  )
}
