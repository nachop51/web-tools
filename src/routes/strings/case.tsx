import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, onMount, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar } from '~/components/tool-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { caseDefs, caseConverters, type CaseKey } from '~/lib/utils/strings/case'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

type CaseDef = (typeof caseDefs)[number]

export default function CaseConverter() {
  setToolPageMeta('strings', 'case')
  const [params, setParams] = useSearchParams<{ mode?: string; t?: string }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const mode = createMemo<CaseKey>(() => {
    const p = params.mode
    if (p && p in caseConverters) return p as CaseKey
    return 'upper'
  })

  const selectedDef = createMemo<CaseDef>(() => caseDefs.find((d) => d.key === mode()) ?? caseDefs[0])

  const output = createMemo(() => caseConverters[mode()](input()))

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Case converter"
        description="Convert text between upper, lower, title, camel, snake, kebab, and other cases."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Case</span>
          <Select<CaseDef>
            options={caseDefs}
            optionValue="key"
            optionTextValue="label"
            value={selectedDef()}
            onChange={(v) => v && setParams({ mode: v.key }, { replace: true })}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>
                <span class="flex flex-col">
                  <span class="font-mono text-sm">{itemProps.item.rawValue.label}</span>
                  <span class="font-mono text-xs text-muted-foreground">{itemProps.item.rawValue.example}</span>
                </span>
              </SelectItem>
            )}
          >
            <SelectTrigger aria-label="Case" class="h-8 w-56 font-mono text-sm">
              <SelectValue<CaseDef>>{(state) => state.selectedOption()?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
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
      </div>
    </main>
  )
}
