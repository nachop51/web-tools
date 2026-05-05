import { useSearchParams } from '@solidjs/router'
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import {
  TbOutlineBold,
  TbOutlineCode,
  TbOutlineDownload,
  TbOutlineH1,
  TbOutlineItalic,
  TbOutlineLink,
  TbOutlineList,
  TbOutlineQuote,
  TbOutlineSparkles,
} from 'solid-icons/tb'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { ToolToolbar, ToolbarChip, ToolbarSegmented } from '~/components/tool-toolbar'
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'
import {
  getDocumentStats,
  renderMarkdown,
  SAMPLE_MARKDOWN,
  type MarkdownOptions,
} from '~/lib/utils/code/markdown'
import { urlText } from '~/lib/utils/url-state'

type Layout = 'split' | 'stacked' | 'editor' | 'preview'
type Style = 'default' | 'github' | 'article'

const LAYOUT_OPTIONS: { value: Layout; label: string }[] = [
  { value: 'split', label: 'Split' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'editor', label: 'Editor' },
  { value: 'preview', label: 'Preview' },
]

const STYLE_OPTIONS: { value: Style; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'github', label: 'GitHub' },
  { value: 'article', label: 'Article' },
]

const PREVIEW_BASE =
  'min-h-[24rem] max-w-none overflow-auto break-words ' +
  '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:font-mono [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight ' +
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold ' +
  '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold ' +
  '[&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-base [&_h4]:font-semibold ' +
  '[&_p]:my-3 [&_p]:leading-relaxed ' +
  '[&_a]:text-violet [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-violet/80 ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 ' +
  '[&_li]:my-1 [&_li>p]:my-0 ' +
  '[&_li_input[type=checkbox]]:mr-1.5 [&_li_input[type=checkbox]]:translate-y-[1px] ' +
  '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-violet [&_blockquote]:bg-violet/5 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-muted-foreground ' +
  '[&_hr]:my-6 [&_hr]:border-border ' +
  '[&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.875em] [&_code:not(pre_code)]:text-violet ' +
  '[&_pre]:my-4 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre]:font-mono [&_pre]:text-sm ' +
  '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm ' +
  '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold ' +
  '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 ' +
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border ' +
  '[&_strong]:font-semibold [&_em]:italic'

const PREVIEW_GITHUB =
  PREVIEW_BASE +
  ' [&_h1]:!font-sans [&_h1]:!border-b [&_h1]:!border-border [&_h1]:!pb-2 ' +
  '[&_h2]:!border-b [&_h2]:!border-border [&_h2]:!pb-1 ' +
  '[&_a]:!text-info-foreground'

const PREVIEW_ARTICLE =
  PREVIEW_BASE +
  ' font-serif text-[1.0625rem] leading-[1.75] ' +
  '[&_h1]:!font-serif [&_h1]:!text-3xl [&_h1]:!tracking-tight ' +
  '[&_h2]:!font-serif [&_h2]:!text-2xl ' +
  '[&_p:first-of-type::first-letter]:float-left [&_p:first-of-type::first-letter]:mr-2 [&_p:first-of-type::first-letter]:font-serif [&_p:first-of-type::first-letter]:text-5xl [&_p:first-of-type::first-letter]:font-bold [&_p:first-of-type::first-letter]:leading-none [&_p:first-of-type::first-letter]:text-violet'

function previewClass(style: Style): string {
  if (style === 'github') return PREVIEW_GITHUB
  if (style === 'article') return PREVIEW_ARTICLE
  return PREVIEW_BASE
}

function bool(v: string | undefined, dflt: boolean): boolean {
  if (v === undefined) return dflt
  return v === '1'
}

function boolParam(v: boolean, dflt: boolean): '0' | '1' | undefined {
  return v === dflt ? undefined : v ? '1' : '0'
}

function isLayout(v: string | undefined): v is Layout {
  return v === 'split' || v === 'stacked' || v === 'editor' || v === 'preview'
}

function isStyle(v: string | undefined): v is Style {
  return v === 'default' || v === 'github' || v === 'article'
}

export default function MarkdownPreviewTool() {
  setToolPageMeta('code', 'markdown-preview')

  const [params, setParams] = useSearchParams<{
    layout?: string
    style?: string
    gfm?: string
    br?: string
    sanitize?: string
    hl?: string
    sync?: string
    t?: string
  }>()

  const [input, setInputSignal] = createSignal(params.t ?? '')
  const [layout, setLayoutSignal] = createSignal<Layout>(isLayout(params.layout) ? params.layout : 'split')
  const [style, setStyleSignal] = createSignal<Style>(isStyle(params.style) ? params.style : 'default')
  const [gfm, setGfm] = createSignal(bool(params.gfm, true))
  const [breaks, setBreaks] = createSignal(bool(params.br, false))
  const [sanitize, setSanitize] = createSignal(bool(params.sanitize, true))
  const [highlight, setHighlight] = createSignal(bool(params.hl, true))
  const [syncScroll, setSyncScroll] = createSignal(bool(params.sync, true))

  function setInput(v: string) {
    setInputSignal(v)
    setParams({ t: urlText(v) }, { replace: true })
  }
  function setLayout(v: Layout) {
    setLayoutSignal(v)
    setParams({ layout: v === 'split' ? undefined : v }, { replace: true })
  }
  function setStyle(v: Style) {
    setStyleSignal(v)
    setParams({ style: v === 'default' ? undefined : v }, { replace: true })
  }
  function setGfmParam(v: boolean) {
    setGfm(v)
    setParams({ gfm: boolParam(v, true) }, { replace: true })
  }
  function setBreaksParam(v: boolean) {
    setBreaks(v)
    setParams({ br: boolParam(v, false) }, { replace: true })
  }
  function setSanitizeParam(v: boolean) {
    setSanitize(v)
    setParams({ sanitize: boolParam(v, true) }, { replace: true })
  }
  function setHighlightParam(v: boolean) {
    setHighlight(v)
    setParams({ hl: boolParam(v, true) }, { replace: true })
  }
  function setSyncScrollParam(v: boolean) {
    setSyncScroll(v)
    setParams({ sync: boolParam(v, true) }, { replace: true })
  }

  const opts = createMemo<MarkdownOptions>(() => ({
    gfm: gfm(),
    breaks: breaks(),
    sanitize: sanitize(),
    highlight: highlight(),
  }))

  const stats = createMemo(() => getDocumentStats(input()))

  const [html, setHtml] = createSignal('')
  let renderId = 0
  createEffect(
    on([input, opts], ([text, o]) => {
      const id = ++renderId
      if (!text) {
        setHtml('')
        return
      }
      renderMarkdown(text, o).then((result) => {
        if (id === renderId) setHtml(result)
      })
    })
  )

  let editorRef: HTMLTextAreaElement | undefined
  let gutterRef: HTMLDivElement | undefined
  let previewRef: HTMLDivElement | undefined
  let dropZoneRef: HTMLDivElement | undefined
  const [dragging, setDragging] = createSignal(false)

  onMount(() => {
    editorRef?.focus()
  })

  // Sync gutter scroll to editor scroll
  function onEditorScroll() {
    if (gutterRef && editorRef) gutterRef.scrollTop = editorRef.scrollTop
    if (!syncScroll() || layout() !== 'split') return
    if (!editorRef || !previewRef) return
    const max = editorRef.scrollHeight - editorRef.clientHeight
    if (max <= 0) return
    const ratio = editorRef.scrollTop / max
    const pmax = previewRef.scrollHeight - previewRef.clientHeight
    if (pmax <= 0) return
    previewRef.scrollTop = ratio * pmax
  }

  function lineCount() {
    const v = input()
    if (!v) return 1
    return v.split('\n').length
  }

  function setEditorValue(next: string, caret: number) {
    if (!editorRef) return
    editorRef.value = next
    setInput(next)
    editorRef.selectionStart = caret
    editorRef.selectionEnd = caret
  }

  function wrapSelection(before: string, after = before) {
    if (!editorRef) return
    const ta = editorRef
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = ta.value.slice(start, end)
    const next = ta.value.slice(0, start) + before + sel + after + ta.value.slice(end)
    ta.focus()
    ta.value = next
    ta.selectionStart = start + before.length
    ta.selectionEnd = end + before.length
    setInput(next)
  }

  function prefixLine(prefix: string) {
    if (!editorRef) return
    const ta = editorRef
    const value = ta.value
    const start = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    ta.focus()
    ta.value = next
    const newCaret = start + prefix.length
    ta.selectionStart = newCaret
    ta.selectionEnd = newCaret
    setInput(next)
  }

  function onKeyDown(e: KeyboardEvent) {
    const ta = e.currentTarget as HTMLTextAreaElement

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const start = ta.selectionStart
      const end = ta.selectionEnd
      if (start === end) {
        const next = ta.value.slice(0, start) + '  ' + ta.value.slice(end)
        ta.value = next
        ta.selectionStart = ta.selectionEnd = start + 2
        setInput(next)
      } else {
        const before = ta.value.slice(0, start)
        const sel = ta.value.slice(start, end)
        const after = ta.value.slice(end)
        const indented = sel.replace(/(^|\n)/g, '$1  ')
        const next = before + indented + after
        ta.value = next
        ta.selectionStart = start
        ta.selectionEnd = start + indented.length
        setInput(next)
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const value = ta.value
      const start = ta.selectionStart
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const line = value.slice(lineStart, start)
      const m =
        /^(\s*)(- \[[ x]\] |[-*+] |> |(\d+)\. )(.*)$/.exec(line)
      if (m) {
        const [, indent, marker, num, rest] = m
        if (rest.length === 0) {
          // Clear empty list/quote item.
          e.preventDefault()
          const next = value.slice(0, lineStart) + value.slice(start)
          ta.value = next
          ta.selectionStart = ta.selectionEnd = lineStart
          setInput(next)
          return
        }
        e.preventDefault()
        let nextMarker = marker
        if (num) nextMarker = `${parseInt(num, 10) + 1}. `
        else if (marker.startsWith('- [')) nextMarker = '- [ ] '
        const insert = '\n' + indent + nextMarker
        const next = value.slice(0, start) + insert + value.slice(ta.selectionEnd)
        ta.value = next
        const caret = start + insert.length
        ta.selectionStart = ta.selectionEnd = caret
        setInput(next)
        return
      }
    }

    if (
      ta.selectionStart !== ta.selectionEnd &&
      (e.key === '*' || e.key === '_' || e.key === '`')
    ) {
      e.preventDefault()
      wrapSelection(e.key)
      return
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }
  function onDragLeave(e: DragEvent) {
    if (e.currentTarget !== dropZoneRef) return
    setDragging(false)
  }
  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) ?? ''
      setInput(text)
      if (editorRef) editorRef.value = text
    }
    reader.readAsText(file)
  }

  function loadSample() {
    setInput(SAMPLE_MARKDOWN)
    if (editorRef) {
      editorRef.value = SAMPLE_MARKDOWN
      editorRef.focus()
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([input()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  // Hydrate textarea value once mounted (controlled-vs-defaultValue gotcha for SSR'd textareas).
  onMount(() => {
    if (editorRef && input() && editorRef.value !== input()) editorRef.value = input()
  })

  onCleanup(() => {
    /* noop */
  })

  const showEditor = createMemo(() => layout() !== 'preview')
  const showPreview = createMemo(() => layout() !== 'editor')
  const splitClass = createMemo(() => {
    const l = layout()
    if (l === 'stacked') return 'flex flex-col gap-6'
    if (l === 'editor' || l === 'preview') return 'flex flex-col gap-6'
    return 'grid gap-6 md:grid-cols-2'
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="Markdown preview"
        description="Live, sanitized markdown editor with GitHub-flavored extensions, syntax highlighting, and shareable links."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <ToolToolbar>
          <ToolbarSegmented label="Layout" value={layout()} onChange={setLayout} options={LAYOUT_OPTIONS} />
          <ToolbarSegmented label="Style" value={style()} onChange={setStyle} options={STYLE_OPTIONS} />
          <div class="ml-auto" />
          <ToolbarChip checked={gfm()} onChange={setGfmParam}>
            GFM
          </ToolbarChip>
          <ToolbarChip checked={breaks()} onChange={setBreaksParam}>
            Breaks
          </ToolbarChip>
          <ToolbarChip checked={sanitize()} onChange={setSanitizeParam}>
            Sanitize
          </ToolbarChip>
          <ToolbarChip checked={highlight()} onChange={setHighlightParam}>
            Highlight
          </ToolbarChip>
          <Show when={layout() === 'split'}>
            <ToolbarChip checked={syncScroll()} onChange={setSyncScrollParam}>
              Sync scroll
            </ToolbarChip>
          </Show>
        </ToolToolbar>

        <Show when={!sanitize()}>
          <div class="flex items-center gap-2 border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <span class="font-semibold uppercase tracking-wider">Warning</span>
            <span>Sanitization is off — raw HTML in the input will be rendered as-is.</span>
          </div>
        </Show>

        <div class={splitClass()}>
          <Show when={showEditor()}>
            <section
              ref={dropZoneRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              class={cn(
                'relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md',
                dragging() ? 'border-violet ring-2 ring-violet/30' : 'border-border'
              )}
            >
              <header class="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Editor</h2>
                <div class="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSample}
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-violet"
                  >
                    <TbOutlineSparkles size={12} /> Load sample
                  </button>
                  <button
                    type="button"
                    onClick={downloadMarkdown}
                    disabled={!input()}
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 cursor-pointer hover:text-violet disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground"
                  >
                    <TbOutlineDownload size={12} /> .md
                  </button>
                  <CopyButton value={() => input()}>Copy</CopyButton>
                </div>
              </header>

              <div class="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 py-1">
                <EditorToolbarButton title="Bold (wrap selection)" onClick={() => wrapSelection('**')}>
                  <TbOutlineBold size={14} />
                </EditorToolbarButton>
                <EditorToolbarButton title="Italic (wrap selection)" onClick={() => wrapSelection('_')}>
                  <TbOutlineItalic size={14} />
                </EditorToolbarButton>
                <EditorToolbarButton title="Inline code" onClick={() => wrapSelection('`')}>
                  <TbOutlineCode size={14} />
                </EditorToolbarButton>
                <span class="mx-1 h-4 w-px bg-border" />
                <EditorToolbarButton title="Heading" onClick={() => prefixLine('# ')}>
                  <TbOutlineH1 size={14} />
                </EditorToolbarButton>
                <EditorToolbarButton title="Bullet list" onClick={() => prefixLine('- ')}>
                  <TbOutlineList size={14} />
                </EditorToolbarButton>
                <EditorToolbarButton title="Quote" onClick={() => prefixLine('> ')}>
                  <TbOutlineQuote size={14} />
                </EditorToolbarButton>
                <span class="mx-1 h-4 w-px bg-border" />
                <EditorToolbarButton title="Link" onClick={() => wrapSelection('[', '](url)')}>
                  <TbOutlineLink size={14} />
                </EditorToolbarButton>
                <EditorToolbarButton title="Code block" onClick={() => wrapSelection('\n```\n', '\n```\n')}>
                  <span class="font-mono text-[11px] font-semibold">{'</>'}</span>
                </EditorToolbarButton>
              </div>

              <div class="relative flex flex-1">
                <div
                  ref={gutterRef}
                  aria-hidden
                  class="select-none overflow-hidden border-r border-border bg-muted/30 px-2 py-3 text-right font-mono text-xs leading-6 text-muted-foreground/60"
                >
                  <For each={Array.from({ length: lineCount() }, (_, i) => i + 1)}>
                    {(n) => <div>{n}</div>}
                  </For>
                </div>
                <textarea
                  ref={editorRef}
                  value={input()}
                  onInput={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={onKeyDown}
                  onScroll={onEditorScroll}
                  spellcheck={false}
                  placeholder={'# Hello, markdown\n\nType, paste, or drop a `.md` file here…'}
                  class="flex-1 min-h-[28rem] resize-none bg-transparent px-3 py-3 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <footer class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2 font-mono text-xs text-muted-foreground">
                <span>{stats().words} <span class="text-muted-foreground/60">words</span></span>
                <span class="text-border">·</span>
                <span>{stats().chars} <span class="text-muted-foreground/60">chars</span></span>
                <span class="text-border">·</span>
                <span>{stats().lines} <span class="text-muted-foreground/60">lines</span></span>
                <span class="text-border">·</span>
                <span>~{stats().readingMinutes} <span class="text-muted-foreground/60">min read</span></span>
                <Show when={dragging()}>
                  <span class="ml-auto text-violet">Drop a .md file…</span>
                </Show>
              </footer>
            </section>
          </Show>

          <Show when={showPreview()}>
            <section class="relative flex flex-col rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md">
              <header class="flex items-center gap-2 border-b border-border px-4 py-2">
                <span aria-hidden class="size-2 rounded-full bg-violet" />
                <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
                <span class="ml-2 text-xs text-muted-foreground/60">
                  {style() === 'default' ? 'Default style' : style() === 'github' ? 'GitHub style' : 'Article style'}
                </span>
                <div class="ml-auto">
                  <CopyButton value={() => html()} disabled={!html()}>
                    Copy HTML
                  </CopyButton>
                </div>
              </header>
              <div class="flex-1 px-6 py-5">
                <Show
                  when={input()}
                  fallback={
                    <div class="flex min-h-[24rem] items-center justify-center text-center text-sm text-muted-foreground">
                      <div class="flex flex-col items-center gap-2">
                        <span>Write something on the left, or</span>
                        <button
                          type="button"
                          onClick={loadSample}
                          class="inline-flex items-center gap-1 text-violet hover:underline cursor-pointer"
                        >
                          <TbOutlineSparkles size={12} /> load the sample document
                        </button>
                      </div>
                    </div>
                  }
                >
                  <article ref={previewRef} class={previewClass(style())} innerHTML={html()} />
                </Show>
              </div>
            </section>
          </Show>
        </div>
      </div>
    </main>
  )
}

type EditorToolbarButtonProps = {
  title: string
  onClick: () => void
  children: import('solid-js').JSX.Element
}

function EditorToolbarButton(props: EditorToolbarButtonProps) {
  return (
    <button
      type="button"
      title={props.title}
      onClick={props.onClick}
      class="inline-flex size-7 items-center justify-center text-muted-foreground transition-colors duration-150 cursor-pointer hover:bg-violet/10 hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-1 focus-visible:ring-offset-background"
    >
      {props.children}
    </button>
  )
}
