import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'
import {
  type BinaryMode,
  textToBinary,
  binaryToText,
  textToHex,
  hexToText,
  textToDecimal,
  decimalToText,
} from '~/lib/utils/encoding/binary-text'

type Dir = 'encode' | 'decode'

const modes: { label: string; value: BinaryMode }[] = [
  { label: 'Binary', value: 'binary' },
  { label: 'Hex', value: 'hex' },
  { label: 'Decimal', value: 'decimal' },
]

const dirOptions: { value: Dir; label: string }[] = [
  { value: 'encode', label: 'Text → Encoding' },
  { value: 'decode', label: 'Encoding → Text' },
]

function encode(s: string, mode: BinaryMode): string {
  if (mode === 'binary') return textToBinary(s)
  if (mode === 'hex') return textToHex(s)
  return textToDecimal(s)
}

function decode(s: string, mode: BinaryMode): string {
  if (mode === 'binary') return binaryToText(s)
  if (mode === 'hex') return hexToText(s)
  return decimalToText(s)
}

export default function BinaryTextTool() {
  setToolPageMeta('encoding', 'binary-text')
  const [params, setParams] = useSearchParams<{ mode?: string; dir?: string; t?: string }>()

  const initialMode = (['binary', 'hex', 'decimal'] as BinaryMode[]).includes(params.mode as BinaryMode)
    ? (params.mode as BinaryMode)
    : 'binary'

  const [input, setInputSignal] = createSignal(params.t ?? '')
  const [binaryMode, setBinaryMode] = createSignal<BinaryMode>(initialMode)

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  const [dir, setDir] = createSignal<Dir>(params.dir === 'decode' ? 'decode' : 'encode')
  const [error, setError] = createSignal<string | null>(null)

  const output = createMemo(() => {
    if (!input()) return ''
    try {
      return dir() === 'encode' ? encode(input(), binaryMode()) : decode(input(), binaryMode())
    } catch {
      return ''
    }
  })

  createEffect(() => {
    if (!input()) {
      setError(null)
      return
    }
    try {
      dir() === 'encode' ? encode(input(), binaryMode()) : decode(input(), binaryMode())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
    }
  })

  function handleMode(m: BinaryMode) {
    setBinaryMode(m)
    setParams({ mode: m }, { replace: true })
  }

  function handleDir(d: Dir) {
    setDir(d)
    setParams({ dir: d }, { replace: true })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Binary / Text"
        description="Convert text to binary, hexadecimal, or decimal byte representations and back."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Encoding" value={binaryMode()} onChange={handleMode} options={modes} />
          <div class="ml-auto" />
          <ToolbarSegmented label="Direction" value={dir()} onChange={handleDir} options={dirOptions} />
        </ToolToolbar>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <TextField
              value={input()}
              onChange={setInput}
              validationState={error() ? 'invalid' : 'valid'}
              class="flex flex-col gap-2"
            >
              <TextFieldTextArea
                autofocus
                class="min-h-[10rem] font-mono text-sm resize-y"
                placeholder={
                  dir() === 'encode' ? 'Enter text to encode…' : `Enter space-separated ${binaryMode()} values…`
                }
              />
              <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
            </TextField>
          </section>

          {/* Output */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
            </div>
            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Result will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-words">
                  {output()}
                </div>
                <CopyButton value={() => output()} class="absolute right-2 top-2" />
              </Show>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
