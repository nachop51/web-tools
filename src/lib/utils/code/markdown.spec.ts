// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { getDocumentStats, renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('returns empty string for empty input', async () => {
    expect(await renderMarkdown('')).toBe('')
  })

  it('renders headings, bold, italic', async () => {
    const html = await renderMarkdown('# Title\n\nThis is **bold** and *italic*.')
    expect(html).toContain('<h1')
    expect(html).toContain('Title')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('renders external links with target=_blank and rel=noopener', async () => {
    const html = await renderMarkdown('[link](https://example.com)')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('renders GFM tables', async () => {
    const md = '| a | b |\n| --- | --- |\n| 1 | 2 |'
    const html = await renderMarkdown(md, { gfm: true })
    expect(html).toContain('<table>')
    expect(html).toContain('<th>a</th>')
    expect(html).toContain('<td>1</td>')
  })

  it('renders task lists with checkboxes', async () => {
    const html = await renderMarkdown('- [x] done\n- [ ] todo', { gfm: true })
    expect(html).toContain('type="checkbox"')
    expect(html).toMatch(/checked(="[^"]*")?/)
  })

  it('highlights fenced code blocks when language is registered', async () => {
    const html = await renderMarkdown('```ts\nconst x: number = 42\n```', { highlight: true })
    expect(html).toContain('class="hljs language-ts"')
    expect(html).toContain('hljs-keyword')
  })

  it('emits hljs class even when language is unknown', async () => {
    const html = await renderMarkdown('```unknownlang\nfoo\n```', { highlight: true })
    expect(html).toContain('hljs')
  })

  it('honours breaks option', async () => {
    const noBreaks = await renderMarkdown('a\nb', { breaks: false })
    const withBreaks = await renderMarkdown('a\nb', { breaks: true })
    expect(noBreaks).not.toContain('<br')
    expect(withBreaks).toContain('<br')
  })

  it('strips inline event handlers when sanitize is on', async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">', { sanitize: true })
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('alert(1)')
  })

  it('strips <script> tags when sanitize is on', async () => {
    const html = await renderMarkdown('text\n\n<script>alert(1)</script>', { sanitize: true })
    expect(html).not.toContain('<script')
    expect(html).toContain('text')
  })

  it('strips javascript: hrefs when sanitize is on', async () => {
    const html = await renderMarkdown('[click](javascript:alert(1))', { sanitize: true })
    expect(html).not.toContain('javascript:')
  })

  it('preserves dangerous attributes when sanitize is off', async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">', { sanitize: false })
    expect(html).toContain('onerror')
  })
})

describe('getDocumentStats', () => {
  it('counts zeros for empty input', () => {
    expect(getDocumentStats('')).toEqual({
      chars: 0,
      charsNoSpaces: 0,
      words: 0,
      lines: 0,
      readingMinutes: 0,
    })
  })

  it('counts words separated by whitespace', () => {
    const s = getDocumentStats('hello world')
    expect(s.words).toBe(2)
    expect(s.chars).toBe(11)
    expect(s.charsNoSpaces).toBe(10)
    expect(s.lines).toBe(1)
  })

  it('counts lines separated by newlines', () => {
    const s = getDocumentStats('one\ntwo\nthree')
    expect(s.lines).toBe(3)
  })

  it('treats emoji as one word', () => {
    const s = getDocumentStats('hello 👋 world')
    expect(s.words).toBe(3)
  })

  it('returns at least 1 reading minute for short text', () => {
    expect(getDocumentStats('one').readingMinutes).toBe(1)
  })

  it('scales reading time with word count', () => {
    const longText = Array(660).fill('word').join(' ')
    expect(getDocumentStats(longText).readingMinutes).toBe(3)
  })
})
