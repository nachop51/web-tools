export type MarkdownOptions = {
  gfm?: boolean
  breaks?: boolean
  sanitize?: boolean
  highlight?: boolean
}

export type DocStats = {
  chars: number
  charsNoSpaces: number
  words: number
  lines: number
  readingMinutes: number
}

const HL_LANGS = [
  'javascript',
  'typescript',
  'xml',
  'python',
  'bash',
  'json',
  'yaml',
  'css',
  'sql',
  'go',
  'rust',
  'markdown',
] as const

let hlRegistered = false

async function ensureHighlight() {
  const hljs = (await import('highlight.js/lib/core')).default
  if (hlRegistered) return hljs
  const langs = await Promise.all([
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/typescript'),
    import('highlight.js/lib/languages/xml'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/bash'),
    import('highlight.js/lib/languages/json'),
    import('highlight.js/lib/languages/yaml'),
    import('highlight.js/lib/languages/css'),
    import('highlight.js/lib/languages/sql'),
    import('highlight.js/lib/languages/go'),
    import('highlight.js/lib/languages/rust'),
    import('highlight.js/lib/languages/markdown'),
  ])
  HL_LANGS.forEach((id, i) => hljs.registerLanguage(id, langs[i].default))
  hljs.registerAliases(['js', 'jsx'], { languageName: 'javascript' })
  hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' })
  hljs.registerAliases(['html', 'svg'], { languageName: 'xml' })
  hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' })
  hljs.registerAliases(['yml'], { languageName: 'yaml' })
  hljs.registerAliases(['md'], { languageName: 'markdown' })
  hlRegistered = true
  return hljs
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function renderMarkdown(input: string, opts: MarkdownOptions = {}): Promise<string> {
  if (!input) return ''
  const { gfm = true, breaks = false, sanitize = true, highlight = true } = opts

  const { Marked } = await import('marked')
  const m = new Marked({ gfm, breaks })

  let hljs: Awaited<ReturnType<typeof ensureHighlight>> | null = null
  if (highlight) hljs = await ensureHighlight()

  m.use({
    renderer: {
      code(token) {
        const { text, lang } = token as { text: string; lang?: string }
        const language = lang?.split(/\s+/)[0] ?? ''
        let body = escapeHtml(text)
        let cls = 'hljs'
        if (hljs && language && hljs.getLanguage(language)) {
          try {
            body = hljs.highlight(text, { language, ignoreIllegals: true }).value
            cls = `hljs language-${language}`
          } catch {
            // fall back to escaped text
          }
        } else if (language) {
          cls = `hljs language-${language}`
        }
        return `<pre><code class="${cls}">${body}</code></pre>\n`
      },
      link(token) {
        const { href, title, tokens } = token as {
          href: string
          title: string | null
          tokens: unknown[]
        }
        const text = (this as { parser: { parseInline: (t: unknown[]) => string } }).parser.parseInline(tokens)
        const t = title ? ` title="${escapeHtml(title)}"` : ''
        const isExternal = /^(https?:|mailto:)/i.test(href)
        const extra = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${escapeHtml(href)}"${t}${extra}>${text}</a>`
      },
    },
  })

  const html = await m.parse(input)

  if (!sanitize) return html

  const DOMPurify = (await import('dompurify')).default
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  })
}

export function getDocumentStats(input: string): DocStats {
  const chars = input.length
  const charsNoSpaces = input.replace(/\s/g, '').length
  const lines = input.length === 0 ? 0 : input.split('\n').length
  const words = input.trim().length === 0 ? 0 : input.trim().split(/\s+/).length
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.round(words / 220))
  return { chars, charsNoSpaces, words, lines, readingMinutes }
}

export const SAMPLE_MARKDOWN = `# Markdown preview

A live, sanitized renderer with **GitHub-flavored** extensions.

## Why this is fancy

- Split, stacked, or focus layouts
- Sync-scrolled gutter
- Real syntax highlighting in fenced blocks
- Strict XSS sanitization, on by default

> "The best way to predict the future is to invent it." — Alan Kay

## Code

Inline like \`const x = 42\`, then a fenced block:

\`\`\`ts
type Tool = {
  slug: string
  category: 'code' | 'encoding' | 'numbers'
  keywords: string[]
}

const md: Tool = {
  slug: 'markdown-preview',
  category: 'code',
  keywords: ['markdown', 'gfm', 'preview'],
}
\`\`\`

\`\`\`bash
bun run dev
# → http://localhost:3000/code/markdown-preview
\`\`\`

## Tables (GFM)

| Setting     | Default | Notes                          |
| ----------- | :-----: | ------------------------------ |
| GFM         |   on    | Tables, strikethrough, tasks   |
| Breaks      |   off   | Treat single \\n as <br>       |
| Sanitize    |   on    | DOMPurify after render         |
| Highlight   |   on    | Code blocks via highlight.js   |

## Task list

- [x] Plan
- [x] Implement
- [ ] Ship it

## Links and images

[Open SolidStart docs](https://docs.solidjs.com/solid-start)

---

That's it — type away and watch it render.
`
