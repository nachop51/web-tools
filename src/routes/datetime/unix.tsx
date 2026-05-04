import { createMemo, createSignal, For, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldErrorMessage, TextFieldInput } from '~/components/ui/text-field'
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from '~/components/ui/number-field'
import { formatRelative, isoToUnix, unixToInfo } from '~/lib/utils/datetime/unix'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'toDate' | 'toTimestamp'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'toDate', label: 'Timestamp → Date' },
  { value: 'toTimestamp', label: 'Date → Timestamp' },
]

export default function UnixTool() {
  setToolPageMeta('datetime', 'unix')
  const [params, setParams] = useSearchParams<{ mode?: string; ts?: string; iso?: string }>()
  const [mode, setModeSignal] = createSignal<Mode>(params.mode === 'toTimestamp' ? 'toTimestamp' : 'toDate')
  const [tsInput, setTsInputSignal] = createSignal(params.ts ?? '')
  const [isoInput, setIsoInputSignal] = createSignal(params.iso ?? '')

  function setMode(v: Mode) { setModeSignal(v); setParams({ mode: v }, { replace: true }) }
  function setTsInput(v: string) { setTsInputSignal(v); setParams({ ts: v || undefined }, { replace: true }) }
  function setIsoInput(v: string) { setIsoInputSignal(v); setParams({ iso: v || undefined }, { replace: true }) }

  const tsInfo = createMemo(() => {
    const raw = tsInput().trim()
    if (!raw) return null
    const n = Number(raw)
    if (isNaN(n)) return null
    try {
      return unixToInfo(n)
    } catch {
      return null
    }
  })

  const relativeLabel = createMemo(() => {
    const raw = tsInput().trim()
    if (!raw) return ''
    const n = Number(raw)
    if (isNaN(n)) return ''
    try {
      return formatRelative(n)
    } catch {
      return ''
    }
  })

  const tsError = createMemo(() => {
    const raw = tsInput().trim()
    if (!raw) return null
    if (isNaN(Number(raw))) return 'Must be a number'
    return null
  })

  const isoResult = createMemo<{ unix: number; ms: number } | null>(() => {
    const raw = isoInput().trim()
    if (!raw) return null
    try {
      const unix = isoToUnix(raw)
      return { unix, ms: unix * 1000 }
    } catch {
      return null
    }
  })

  const isoError = createMemo(() => {
    const raw = isoInput().trim()
    if (!raw) return null
    try {
      isoToUnix(raw)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid date string'
    }
  })

  const infoRows = createMemo(() => {
    const info = tsInfo()
    if (!info) return []
    return [
      { label: 'ISO 8601', value: info.iso },
      { label: 'UTC', value: info.utc },
      { label: 'Local', value: info.local },
      { label: 'Weekday', value: info.weekday },
      { label: 'Milliseconds', value: String(info.unixMs) },
    ]
  })

  function setNow() {
    if (typeof window !== 'undefined') {
      setTsInput(String(Math.floor(Date.now() / 1000)))
    }
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Unix timestamp"
        description="Convert Unix timestamps to human-readable dates and ISO strings, or parse a date back to a Unix timestamp."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Mode" value={mode()} onChange={setMode} options={modeOptions} />
        </ToolToolbar>

        <Show when={mode() === 'toDate'}>
          {/* Timestamp input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Unix timestamp (seconds)
                </h2>
              </div>
              <button
                type="button"
                onClick={setNow}
                class="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:border-violet/60 hover:text-violet cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Now
              </button>
            </div>

            <NumberField
              value={tsInput()}
              onChange={setTsInput}
              format={false}
              validationState={tsError() ? 'invalid' : 'valid'}
              class="flex flex-col gap-2"
            >
              <NumberFieldGroup>
                <NumberFieldInput autofocus class="h-12 font-mono text-base" placeholder="e.g. 1705315800" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
              <NumberFieldErrorMessage>{tsError()}</NumberFieldErrorMessage>
            </NumberField>

            <Show when={relativeLabel()}>
              <p class="mt-3 text-sm text-muted-foreground">{relativeLabel()}</p>
            </Show>
          </section>

          {/* Date breakdown */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Date breakdown</h2>
            </div>

            <Show
              when={tsInfo()}
              fallback={
                <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Result will appear here
                </div>
              }
            >
              <div class="anim-fade-up overflow-hidden rounded-md border border-violet/30 bg-violet/5">
                <div class="divide-y divide-violet/15">
                  <For each={infoRows()}>
                    {(row) => (
                      <div class="flex items-center gap-3 px-4 py-2.5">
                        <span class="min-w-[6rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {row.label}
                        </span>
                        <span class="flex-1 truncate font-mono text-sm">{row.value}</span>
                        <CopyButton value={() => row.value} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </section>
        </Show>

        <Show when={mode() === 'toTimestamp'}>
          {/* ISO input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Date / ISO string</h2>
            </div>

            <TextField
              value={isoInput()}
              onChange={setIsoInput}
              validationState={isoError() ? 'invalid' : 'valid'}
              class="flex flex-col gap-2"
            >
              <TextFieldInput
                autofocus
                type="text"
                class="h-12 font-mono text-base"
                placeholder="e.g. 2024-01-15T10:30:00Z"
              />
              <TextFieldErrorMessage>{isoError()}</TextFieldErrorMessage>
            </TextField>
          </section>

          {/* Timestamp output */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Unix timestamp</h2>
            </div>

            <Show
              when={isoResult()}
              fallback={
                <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Result will appear here
                </div>
              }
            >
              {(result) => (
                <div class="anim-fade-up overflow-hidden rounded-md border border-violet/30 bg-violet/5">
                  <div class="divide-y divide-violet/15">
                    <div class="flex items-center gap-3 px-4 py-2.5">
                      <span class="min-w-[6rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Seconds
                      </span>
                      <span class="flex-1 truncate font-mono text-sm">{result().unix}</span>
                      <CopyButton value={() => String(result().unix)} />
                    </div>
                    <div class="flex items-center gap-3 px-4 py-2.5">
                      <span class="min-w-[6rem] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Milliseconds
                      </span>
                      <span class="flex-1 truncate font-mono text-sm">{result().ms}</span>
                      <CopyButton value={() => String(result().ms)} />
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </section>
        </Show>
      </div>
    </main>
  )
}
