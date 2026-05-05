import { createMemo, createSignal, For, onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import { ToolHeader } from '~/components/tool-header'
import { setToolPageMeta } from '~/lib/seo'
import { urlText } from '~/lib/utils/url-state'
import {
  countBytes,
  countChars,
  countCharsNoSpaces,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
} from '~/lib/utils/strings/count'

const statDefs = [
  { key: 'chars' as const, label: 'Characters' },
  { key: 'noSpaces' as const, label: 'No spaces' },
  { key: 'words' as const, label: 'Words' },
  { key: 'lines' as const, label: 'Lines' },
  { key: 'bytes' as const, label: 'Bytes' },
  { key: 'sentences' as const, label: 'Sentences' },
  { key: 'paragraphs' as const, label: 'Paragraphs' },
]

export default function CharacterCount() {
  setToolPageMeta('strings', 'count')
  const [params, setParams] = useSearchParams<{ t?: string }>()
  const [text, setTextSignal] = createSignal(params.t ?? '')

  function setText(v: string) {
    setTextSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }

  const stats = createMemo(() => ({
    chars: countChars(text()),
    noSpaces: countCharsNoSpaces(text()),
    words: countWords(text()),
    lines: countLines(text()),
    bytes: countBytes(text()),
    sentences: countSentences(text()),
    paragraphs: countParagraphs(text()),
  }))

  let inputRef: HTMLTextAreaElement | undefined

  onMount(() => {
    inputRef?.focus()
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Character count"
        description="Count characters, words, lines, bytes, sentences, and paragraphs."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Input</h2>
          </div>

          <TextField value={text()} onChange={setText}>
            <TextFieldTextArea
              ref={inputRef}
              placeholder="Paste text here…"
              class="min-h-[10rem] w-full resize-y font-mono text-sm"
            />
          </TextField>
        </section>

        {/* Stats */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stats</h2>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <For each={statDefs}>
              {(def) => (
                <div class="rounded-md border border-violet/30 bg-violet/5 p-4 text-center">
                  <p class="font-mono text-2xl font-semibold tabular-nums tracking-tight">{stats()[def.key]}</p>
                  <p class="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{def.label}</p>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </main>
  )
}
