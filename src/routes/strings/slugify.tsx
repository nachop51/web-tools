import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { slugify, type SlugifyOptions } from '~/lib/utils/strings/slugify'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type Separator = '-' | '_' | '.'
type CaseOpt = 'lower' | 'preserve'

const separatorOptions: { value: Separator; label: string }[] = [
  { value: '-', label: 'Hyphen (-)' },
  { value: '_', label: 'Underscore (_)' },
  { value: '.', label: 'Dot (.)' },
]

const caseOptions: { value: CaseOpt; label: string }[] = [
  { value: 'lower', label: 'Lowercase' },
  { value: 'preserve', label: 'Preserve' },
]

export default function SlugifyTool() {
  setToolPageMeta('strings', 'slugify')
  const [params, setParams] = useSearchParams<{ sep?: string; lc?: string; t?: string }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const separator = createMemo<Separator>(() => {
    const s = params.sep
    if (s === '-' || s === '_' || s === '.') return s
    return '-'
  })

  const lowercase = createMemo(() => params.lc !== '0')
  const caseValue = createMemo<CaseOpt>(() => (lowercase() ? 'lower' : 'preserve'))

  const output = createMemo(() => {
    const opts: SlugifyOptions = {
      separator: separator(),
      lowercase: lowercase(),
    }
    return slugify(input(), opts)
  })

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader category="strings" name="Slugify" description="Convert text to a URL-friendly slug." />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented
            label="Separator"
            value={separator()}
            onChange={(v) => setParams({ sep: v }, { replace: true })}
            options={separatorOptions}
          />
          <ToolbarSegmented
            label="Case"
            value={caseValue()}
            onChange={(v) => setParams({ lc: v === 'lower' ? '1' : '0' }, { replace: true })}
            options={caseOptions}
          />
        </ToolToolbar>

        <div class="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
            </div>

            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                ref={inputRef}
                placeholder="Paste text here…"
                class="min-h-[10rem] resize-y font-mono text-sm"
              />
            </TextField>
          </section>

          {/* Output */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Slug</h2>
            </div>

            <div class="relative">
              <Show
                when={output()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Slug will appear here
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
