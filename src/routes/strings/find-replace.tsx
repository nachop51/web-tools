import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { Checkbox, CheckboxLabel } from '~/components/ui/checkbox'
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from '~/components/ui/text-field'
import { findReplace } from '~/lib/utils/strings/find-replace'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

export default function FindReplacePage() {
  setToolPageMeta('strings', 'find-replace')
  const [params, setParams] = useSearchParams<{ t?: string; f?: string; r?: string }>()
  const [text, setTextSignal] = createSignal(params.t ?? '')
  const [find, setFindSignal] = createSignal(params.f ?? '')
  const [replace, setReplaceSignal] = createSignal(params.r ?? '')
  const [useRegex, setUseRegex] = createSignal(false)
  const [caseSensitive, setCaseSensitive] = createSignal(true)
  const [wholeWord, setWholeWord] = createSignal(false)

  function setText(v: string) {
    setTextSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  function setFind(v: string) {
    setFindSignal(v)
    setParams({ f: urlText(v) }, { replace: true })
  }
  function setReplace(v: string) {
    setReplaceSignal(v)
    setParams({ r: urlText(v) }, { replace: true })
  }

  const processed = createMemo(() =>
    findReplace(text(), find(), replace(), {
      useRegex: useRegex(),
      caseSensitive: caseSensitive(),
      wholeWord: wholeWord(),
    })
  )

  const output = createMemo(() => processed().result)
  const matchCount = createMemo(() => processed().count)
  const hasMatches = createMemo(() => find() !== '' && text() !== '')

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Find & replace"
        description="Find and replace text with optional regex, case, and whole-word controls."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Find & replace controls */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Find &amp; replace</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <TextField value={find()} onChange={setFind} class="flex flex-col gap-1.5">
              <TextFieldLabel>Find</TextFieldLabel>
              <TextFieldInput
                ref={inputRef}
                type="text"
                placeholder={useRegex() ? 'regex pattern' : 'search text'}
                class="h-12 font-mono text-base"
              />
            </TextField>

            <TextField value={replace()} onChange={setReplace} class="flex flex-col gap-1.5">
              <TextFieldLabel>Replace with</TextFieldLabel>
              <TextFieldInput type="text" placeholder="replacement" class="h-12 font-mono text-base" />
            </TextField>
          </div>

          <div class="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <Checkbox checked={useRegex()} onChange={setUseRegex}>
              <CheckboxLabel>Use regex</CheckboxLabel>
            </Checkbox>
            <Checkbox checked={caseSensitive()} onChange={setCaseSensitive}>
              <CheckboxLabel>Case sensitive</CheckboxLabel>
            </Checkbox>
            <Checkbox checked={wholeWord()} onChange={setWholeWord}>
              <CheckboxLabel>Whole word</CheckboxLabel>
            </Checkbox>
          </div>
        </section>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>

            <TextField value={text()} onChange={setText}>
              <TextFieldTextArea placeholder="Paste text here…" class="min-h-[10rem] resize-y font-mono text-sm" />
            </TextField>
          </section>

          {/* Output */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
              </div>
              <Show when={hasMatches()}>
                <span class="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {matchCount()} match{matchCount() !== 1 ? 'es' : ''}
                </span>
              </Show>
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
      </div>
    </main>
  )
}
