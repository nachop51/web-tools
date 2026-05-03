import { createSignal, onMount } from 'solid-js'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { Button } from '~/components/ui/button'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
} from '~/components/ui/number-field'
import { generateUuid } from '~/lib/utils/code/uuid'
import { setToolPageMeta } from '~/lib/seo'

export default function UuidTool() {
  setToolPageMeta('code', 'uuid')
  const [single, setSingle] = createSignal('')
  const [count, setCount] = createSignal(10)
  const [list, setList] = createSignal<string[]>([])

  onMount(() => {
    setSingle(generateUuid())
  })

  function refreshSingle() {
    setSingle(generateUuid())
  }

  function generateList() {
    const n = Math.max(1, Math.min(count(), 1000))
    setList(Array.from({ length: n }, () => generateUuid()))
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="UUID generator"
        description="Generate random UUID v4 values using the browser's crypto API."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Single UUID</h2>
          </div>

          <div class="relative">
            <div class="anim-fade-up min-h-[3.5rem] rounded-md border border-violet/30 bg-violet/5 px-4 py-4 pr-14 font-mono text-sm leading-relaxed break-words flex items-center">
              {single()}
            </div>
            <CopyButton value={() => single()} class="absolute right-2 top-2" />
          </div>

          <Button class="mt-4" onClick={refreshSingle}>
            Generate new
          </Button>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bulk generate</h2>
          </div>

          <div class="mb-4 flex flex-wrap items-center gap-3">
            <NumberField
              rawValue={count()}
              onRawValueChange={(v) => setCount(Number.isFinite(v) ? v : 10)}
              minValue={1}
              maxValue={1000}
              format={false}
              class="w-32"
            >
              <NumberFieldGroup>
                <NumberFieldInput class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
            <Button onClick={generateList}>Generate</Button>
            <CopyButton value={() => list().join('\n')} />
          </div>

          <div class="relative">
            <TextField>
              <TextFieldTextArea
                readOnly
                value={list().join('\n')}
                class="min-h-[16rem] font-mono text-sm resize-y"
                placeholder="Generated UUIDs will appear here…"
              />
            </TextField>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">
            {list().length > 0 ? `${list().length} UUIDs` : 'No UUIDs generated yet'}
          </p>
        </section>
      </div>
    </main>
  )
}
