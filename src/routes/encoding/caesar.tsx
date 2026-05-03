import { createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { cn } from '~/lib/utils'
import { caesarShift } from '~/lib/utils/encoding/caesar'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'encode' | 'decode'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'encode', label: 'Encode' },
  { value: 'decode', label: 'Decode' },
]

function clampShift(n: number): number {
  if (!Number.isFinite(n)) return 0
  const i = Math.trunc(n)
  if (i < 0) return 0
  if (i > 25) return 25
  return i
}

export default function CaesarTool() {
  setToolPageMeta('encoding', 'caesar')
  const [params, setParams] = useSearchParams<{
    dir?: string
    shift?: string
  }>()

  const initialShift = clampShift(Number.parseInt(params.shift ?? '3', 10) || 0)

  const [input, setInput] = createSignal('')
  const [mode, setMode] = createSignal<Mode>(params.dir === 'decode' ? 'decode' : 'encode')
  const [shift, setShift] = createSignal<number>(initialShift)

  const output = createMemo(() => caesarShift(input(), shift(), mode()))

  const shiftedAlphabet = createMemo(() => {
    const effective = mode() === 'decode' ? ((-shift() % 26) + 26) % 26 : shift() % 26
    return Array.from({ length: 26 }, (_, i) => ({
      from: String.fromCharCode(65 + i),
      to: String.fromCharCode(((i + effective) % 26) + 65),
    }))
  })

  function handleMode(m: Mode) {
    setMode(m)
    setParams({ dir: m })
  }

  function handleShift(n: number) {
    const v = clampShift(n)
    setShift(v)
    setParams({ shift: String(v) })
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Caesar cipher"
        description="Shift each letter by a fixed amount. ROT13 is the classic shift=13 case."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Direction" value={mode()} onChange={handleMode} options={modeOptions} />
        </ToolToolbar>

        {/* Settings */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Settings</h2>
          </div>

          <div class="flex flex-wrap items-end gap-6">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Shift</span>
              <NumberField
                value={String(shift())}
                onChange={(v) => {
                  const n = Number.parseInt(v, 10)
                  if (Number.isFinite(n)) handleShift(n)
                }}
                minValue={0}
                maxValue={25}
                format={false}
                class="w-32"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="h-10 font-mono" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preset</span>
              <button
                type="button"
                onClick={() => handleShift(13)}
                title="Set shift to 13 (ROT13)"
                class={cn(
                  'rounded-md border px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  shift() === 13
                    ? 'border-violet bg-violet text-white'
                    : 'border-border bg-background hover:border-violet/60 hover:bg-violet/5'
                )}
              >
                ROT13
              </button>
            </div>

            <div class="ml-auto flex items-baseline gap-2 text-sm text-muted-foreground">
              <span>Effective shift</span>
              <span class="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {mode() === 'decode' ? '-' : '+'}
                {shift()}
              </span>
            </div>
          </div>
        </section>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                autofocus
                class="min-h-[10rem] font-mono text-sm resize-y"
                placeholder={mode() === 'encode' ? 'Enter plaintext to encrypt…' : 'Enter ciphertext to decrypt…'}
              />
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
                <div class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {output()}
                </div>
                <CopyButton value={() => output()} class="absolute right-2 top-2" />
              </Show>
            </div>
          </section>
        </div>

        {/* Shift table */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Shift table</h2>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <For each={shiftedAlphabet()}>
              {(entry) => (
                <div class="flex flex-col items-center gap-0.5 rounded-md border border-border bg-background px-2 py-1.5 font-mono">
                  <span class="text-xs font-semibold text-muted-foreground">{entry.from}</span>
                  <span
                    class={cn(
                      'text-xs font-semibold transition-colors duration-150',
                      entry.from !== entry.to ? 'text-violet' : 'text-muted-foreground/50'
                    )}
                  >
                    {entry.to}
                  </span>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </main>
  )
}
