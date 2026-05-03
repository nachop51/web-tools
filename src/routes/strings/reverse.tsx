import { useSearchParams } from '@solidjs/router'
import { createMemo, createSignal, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarSegmented } from '~/components/tool-toolbar'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { reverseChars, reverseLines, reverseWords } from '~/lib/utils/strings/reverse'
import { setToolPageMeta } from '~/lib/seo'

type Mode = 'chars' | 'words' | 'lines'

const modes: { value: Mode; label: string }[] = [
  { value: 'chars', label: 'Characters' },
  { value: 'words', label: 'Words' },
  { value: 'lines', label: 'Lines' },
]

export default function ReverseText() {
  setToolPageMeta('strings', 'reverse')
  const [params, setParams] = useSearchParams<{ mode?: string }>()
  const [input, setInput] = createSignal('')

  const mode = createMemo<Mode>(() => {
    const p = params.mode
    if (p === 'chars' || p === 'words' || p === 'lines') return p
    return 'chars'
  })

  const output = createMemo(() => {
    const s = input()
    switch (mode()) {
      case 'words':
        return reverseWords(s)
      case 'lines':
        return reverseLines(s)
      default:
        return reverseChars(s)
    }
  })

  return (
    <main class="w-full py-10">
      <ToolHeader category="strings" name="Reverse text" description="Reverse text by characters, words, or lines." />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Reverse" value={mode()} onChange={(v) => setParams({ mode: v })} options={modes} />
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
                autofocus
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
