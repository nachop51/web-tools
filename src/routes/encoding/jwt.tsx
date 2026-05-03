import { createMemo, createSignal, For, Show } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from '~/components/ui/text-field'
import { decodeJwt, formatJwtDate } from '~/lib/utils/encoding/jwt'
import { setToolPageMeta } from '~/lib/seo'

const DATE_FIELDS = new Set(['iat', 'exp', 'nbf'])

export default function JwtTool() {
  setToolPageMeta('encoding', 'jwt')
  const [input, setInput] = createSignal('')

  const result = createMemo(() => {
    const token = input().trim()
    if (!token) return null
    try {
      return { data: decodeJwt(token), error: null }
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : 'Failed to decode JWT',
      }
    }
  })

  const headerJson = createMemo(() => {
    const data = result()?.data
    return data ? JSON.stringify(data.header, null, 2) : ''
  })

  const payloadJson = createMemo(() => {
    const data = result()?.data
    return data ? JSON.stringify(data.payload, null, 2) : ''
  })

  const signature = createMemo(() => result()?.data?.signature ?? '')

  const dateEntries = createMemo(() => {
    const data = result()?.data
    if (!data) return [] as [string, number][]
    return Object.entries(data.payload).filter(([k, v]) => DATE_FIELDS.has(k) && typeof v === 'number') as [
      string,
      number,
    ][]
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="JWT decoder"
        description="Inspect JWT header, payload, and signature. Decodes without verification."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        {/* Token input */}
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Token</h2>
          </div>
          <TextField
            value={input()}
            onChange={setInput}
            validationState={result()?.error ? 'invalid' : 'valid'}
            class="flex flex-col gap-2"
          >
            <TextFieldTextArea
              autofocus
              class="min-h-[10rem] font-mono text-sm resize-y"
              placeholder="Paste a JWT token to inspect it…"
            />
            <TextFieldErrorMessage>{result()?.error}</TextFieldErrorMessage>
          </TextField>
        </section>

        <Show
          when={result()?.data}
          fallback={
            <Show when={!input()}>
              <section class="relative rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground sm:p-8">
                Paste a JWT token above to inspect its header, payload, and signature.
              </section>
            </Show>
          }
        >
          {/* Header */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Header</h2>
            </div>
            <div class="relative">
              <pre class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                {headerJson()}
              </pre>
              <CopyButton value={() => headerJson()} class="absolute right-2 top-2" />
            </div>
          </section>

          {/* Payload */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payload</h2>
            </div>
            <div class="relative">
              <pre class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                {payloadJson()}
              </pre>
              <CopyButton value={() => payloadJson()} class="absolute right-2 top-2" />
            </div>
            <Show when={dateEntries().length > 0}>
              <div class="mt-4 flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-4">
                <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Decoded timestamps
                </span>
                <For each={dateEntries()}>
                  {([key, val]) => (
                    <div class="flex items-baseline gap-2 text-sm">
                      <span class="font-mono text-muted-foreground">{key}:</span>
                      <span class="text-foreground">{formatJwtDate(val)}</span>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </section>

          {/* Signature */}
          <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
            <div class="mb-4 flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Signature</h2>
            </div>
            <p class="mb-3 text-sm text-muted-foreground">Not verified. Raw base64url string only.</p>
            <div class="relative">
              <pre class="anim-fade-up min-h-[8.25rem] rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                {signature()}
              </pre>
              <CopyButton value={() => signature()} class="absolute right-2 top-2" />
            </div>
          </section>
        </Show>
      </div>
    </main>
  )
}
