import { createEffect, createResource, createSignal, onMount, Show } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar } from '~/components/tool-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { hashAlgorithms, hashText, type HashAlgorithm } from '~/lib/utils/encoding/hash'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'

export default function HashTool() {
  setToolPageMeta('encoding', 'hash')
  const [params, setParams] = useSearchParams<{ algo?: string; t?: string }>()
  const initialAlgo: HashAlgorithm = (hashAlgorithms as readonly string[]).includes(params.algo ?? '')
    ? (params.algo as HashAlgorithm)
    : 'SHA-256'
  const [inputValue, setInputValueSignal] = createSignal(params.t ?? '')
  const [algorithm, setAlgorithmSignal] = createSignal<HashAlgorithm>(initialAlgo)

  function setInputValue(v: string) {
    setInputValueSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  function setAlgorithm(v: HashAlgorithm) {
    setAlgorithmSignal(v)
    setParams({ algo: v }, { replace: true })
  }
  const [source, setSource] = createSignal<[string, HashAlgorithm]>(['', 'SHA-256'])

  const [hash] = createResource(source, ([text, algo]) => (text ? hashText(text, algo) : Promise.resolve('')))

  createEffect(() => {
    setSource([inputValue(), algorithm()])
  })

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    // Defer past Suspense settling; createResource above causes Suspense to
    // re-flush focus on this route, so a synchronous focus() in onMount loses out.
    setTimeout(() => inputRef?.focus(), 0)
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Hash generator"
        description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from any text."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Algorithm</span>
          <Select
            value={algorithm()}
            onChange={(v) => v && setAlgorithm(v)}
            options={hashAlgorithms}
            itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
          >
            <SelectTrigger aria-label="Algorithm" class="h-8 w-40 font-mono text-sm">
              <SelectValue<HashAlgorithm>>{(state) => state.selectedOption()}</SelectValue>
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
            <TextField value={inputValue()} onChange={setInputValue}>
              <TextFieldTextArea
                ref={inputRef}
                class="min-h-[10rem] font-mono text-sm resize-y"
                placeholder="Enter text to hash…"
              />
            </TextField>
          </section>

          {/* Output */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hash</h2>
            </div>
            <div class="relative">
              <Show when={hash.loading}>
                <p class="absolute right-2 top-0 text-xs text-muted-foreground">Computing…</p>
              </Show>
              <Show
                when={hash()}
                fallback={
                  <div class="flex min-h-[8.25rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    Hash will appear here
                  </div>
                }
              >
                <div class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed break-all">
                  {hash()}
                </div>
                <CopyButton value={() => hash() ?? ''} class="absolute right-2 top-2" />
              </Show>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
