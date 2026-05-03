import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { createStore, produce, reconcile, unwrap } from 'solid-js/store'
import { useSearchParams } from '@solidjs/router'
import { CopyButton } from '~/components/copy-button'
import { ToolHeader } from '~/components/tool-header'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import { TextField, TextFieldInput, TextFieldTextArea } from '~/components/ui/text-field'
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
} from '~/components/ui/number-field'
import { cn } from '~/lib/utils'
import { setToolPageMeta } from '~/lib/seo'
import {
  generateRows,
  parseSchema,
  serializeSchema,
  toCsv,
  toJson,
  toSql,
  type FieldDef,
  type FieldType,
} from '~/lib/utils/code/fake-data'

type Format = 'json' | 'csv' | 'sql'
type Indent = 0 | 2 | 4
type Tab = 'visual' | 'schema'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'uuid', label: 'UUID' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'integer', label: 'Integer' },
  { value: 'float', label: 'Float' },
  { value: 'string', label: 'String' },
  { value: 'firstName', label: 'First name' },
  { value: 'lastName', label: 'Last name' },
  { value: 'fullName', label: 'Full name' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'phone', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'color', label: 'Color' },
  { value: 'ipv4', label: 'IPv4' },
  { value: 'enum', label: 'Enum' },
]

const DEFAULT_FIELDS: FieldDef[] = [
  { name: 'id', type: 'uuid' },
  { name: 'name', type: 'fullName' },
  { name: 'email', type: 'email' },
  { name: 'age', type: 'integer', min: 18, max: 99 },
  { name: 'active', type: 'boolean' },
]

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'sql', label: 'SQL' },
]

const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'visual', label: 'Visual' },
  { value: 'schema', label: 'JSON Schema' },
]

const INDENT_OPTIONS: { value: Indent; label: string }[] = [
  { value: 0, label: 'Min' },
  { value: 2, label: '2' },
  { value: 4, label: '4' },
]

const segmentBtn =
  'rounded-md border px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export default function FakeDataTool() {
  setToolPageMeta('code', 'fake-data')
  const [params, setParams] = useSearchParams()

  const [fields, setFields] = createStore<FieldDef[]>(DEFAULT_FIELDS.map((f) => ({ ...f })))
  const [schemaText, setSchemaText] = createSignal(serializeSchema(DEFAULT_FIELDS))
  const [schemaError, setSchemaError] = createSignal('')
  const [count, setCount] = createSignal(10)
  const [format, setFormat] = createSignal<Format>((params.format as Format) || 'json')
  const [tableName, setTableName] = createSignal('records')
  const [indent, setIndent] = createSignal<Indent>(2)
  const [activeTab, setActiveTab] = createSignal<Tab>((params.tab as Tab) || 'visual')
  const [output, setOutput] = createSignal('')

  function switchTab(tab: Tab) {
    if (tab === 'schema') {
      setSchemaText(serializeSchema(unwrap(fields)))
      setSchemaError('')
    }
    setActiveTab(tab)
    setParams({ tab })
  }

  function handleSchemaChange(text: string) {
    setSchemaText(text)
    try {
      setFields(reconcile(parseSchema(text)))
      setSchemaError('')
    } catch (e) {
      setSchemaError(e instanceof Error ? e.message : 'Invalid schema')
    }
  }

  function addField() {
    setFields(produce((d) => d.push({ name: `field${d.length + 1}`, type: 'string' as FieldType })))
  }

  function removeField(index: number) {
    setFields(produce((d) => d.splice(index, 1)))
  }

  function generate() {
    const plain = unwrap(fields)
    const rows = generateRows(plain, Math.max(1, Math.min(count(), 10_000)))
    const fmt = format()
    if (fmt === 'json') setOutput(toJson(rows, indent()))
    else if (fmt === 'csv') setOutput(toCsv(rows, plain))
    else setOutput(toSql(rows, tableName() || 'records', plain))
  }

  function download() {
    const text = output()
    if (!text) return
    const ext = format()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="code"
        name="Fake data generator"
        description="Generate mock JSON, CSV, or SQL from a visual schema or a JSON template."
      />

      <div class="anim-fade-up flex flex-col gap-6" style={{ 'animation-delay': '60ms' }}>
        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Editor</h2>
          </div>

          <div role="radiogroup" aria-label="Editor mode" class="mb-5 flex flex-wrap gap-2">
            <For each={TAB_OPTIONS}>
              {(tab) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={activeTab() === tab.value}
                  onClick={() => switchTab(tab.value)}
                  class={cn(
                    segmentBtn,
                    activeTab() === tab.value
                      ? 'border-violet bg-violet text-white'
                      : 'border-border bg-background hover:border-violet/60 hover:bg-violet/5'
                  )}
                >
                  {tab.label}
                </button>
              )}
            </For>
          </div>

          <Show when={activeTab() === 'visual'}>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th class="pb-2 pr-4 w-40">Field name</th>
                    <th class="pb-2 pr-4 w-36">Type</th>
                    <th class="pb-2 pr-2">Options</th>
                    <th class="pb-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  <For each={fields}>
                    {(field, index) => (
                      <tr class="border-b border-border/40 last:border-0">
                        <td class="py-2 pr-4">
                          <TextField value={field.name} onChange={(v) => setFields(index(), 'name', v)}>
                            <TextFieldInput class="h-9 w-full font-mono text-sm" placeholder="field name" />
                          </TextField>
                        </td>
                        <td class="py-2 pr-4">
                          <Select<{ value: FieldType; label: string }>
                            options={FIELD_TYPES}
                            optionValue="value"
                            optionTextValue="label"
                            value={FIELD_TYPES.find((t) => t.value === field.type) ?? null}
                            onChange={(opt) => opt && setFields(index(), 'type', opt.value)}
                            itemComponent={(itemProps) => (
                              <SelectItem item={itemProps.item}>{itemProps.item.rawValue.label}</SelectItem>
                            )}
                          >
                            <SelectTrigger class="h-9 w-full font-mono text-sm">
                              <SelectValue<{
                                value: FieldType
                                label: string
                              }>>
                                {(state) => state.selectedOption()?.label}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent />
                          </Select>
                        </td>
                        <td class="py-2 pr-2">
                          <Switch>
                            <Match when={field.type === 'integer' || field.type === 'float'}>
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-muted-foreground">min</span>
                                <NumberField
                                  rawValue={field.min}
                                  onRawValueChange={(v) =>
                                    setFields(index(), 'min', Number.isFinite(v) ? v : undefined)
                                  }
                                  format={false}
                                  class="w-20"
                                >
                                  <NumberFieldInput class="h-9 w-full font-mono text-sm" placeholder="0" />
                                </NumberField>
                                <span class="text-xs text-muted-foreground">max</span>
                                <NumberField
                                  rawValue={field.max}
                                  onRawValueChange={(v) =>
                                    setFields(index(), 'max', Number.isFinite(v) ? v : undefined)
                                  }
                                  format={false}
                                  class="w-20"
                                >
                                  <NumberFieldInput class="h-9 w-full font-mono text-sm" placeholder="100" />
                                </NumberField>
                              </div>
                            </Match>
                            <Match when={field.type === 'string'}>
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-muted-foreground">len</span>
                                <NumberField
                                  rawValue={field.minLength}
                                  onRawValueChange={(v) =>
                                    setFields(index(), 'minLength', Number.isFinite(v) ? v : undefined)
                                  }
                                  format={false}
                                  class="w-20"
                                >
                                  <NumberFieldInput class="h-9 w-full font-mono text-sm" placeholder="4" />
                                </NumberField>
                                <span class="text-xs text-muted-foreground">–</span>
                                <NumberField
                                  rawValue={field.maxLength}
                                  onRawValueChange={(v) =>
                                    setFields(index(), 'maxLength', Number.isFinite(v) ? v : undefined)
                                  }
                                  format={false}
                                  class="w-20"
                                >
                                  <NumberFieldInput class="h-9 w-full font-mono text-sm" placeholder="20" />
                                </NumberField>
                              </div>
                            </Match>
                            <Match when={field.type === 'enum'}>
                              <TextField
                                value={(field.values ?? []).join(', ')}
                                onChange={(v) =>
                                  setFields(
                                    index(),
                                    'values',
                                    v
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  )
                                }
                              >
                                <TextFieldInput class="h-9 w-48 font-mono text-sm" placeholder="a, b, c" />
                              </TextField>
                            </Match>
                            <Match when={field.type === 'date'}>
                              <div class="flex items-center gap-2">
                                <span class="text-xs text-muted-foreground">format</span>
                                <TextField
                                  value={field.format ?? ''}
                                  onChange={(v) => setFields(index(), 'format', v || undefined)}
                                >
                                  <TextFieldInput class="h-9 w-36 font-mono text-sm" placeholder="YYYY-MM-DD" />
                                </TextField>
                              </div>
                            </Match>
                            <Match when={true}>
                              <span class="text-xs text-muted-foreground">—</span>
                            </Match>
                          </Switch>
                        </td>
                        <td class="py-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            class="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeField(index())}
                            aria-label="Remove field"
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addField}
              class="mt-4 w-full rounded-md border-2 border-dashed border-border bg-background py-2 text-sm text-muted-foreground transition-colors duration-150 cursor-pointer hover:border-violet/60 hover:bg-violet/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              + Add field
            </button>
          </Show>

          <Show when={activeTab() === 'schema'}>
            <p class="mb-3 text-xs text-muted-foreground">
              Edit the JSON schema directly. Valid changes sync to the visual table.
            </p>
            <TextField value={schemaText()} onChange={handleSchemaChange}>
              <TextFieldTextArea autofocus class="min-h-[16rem] font-mono text-sm resize-y" placeholder="[]" />
            </TextField>
            <Show when={schemaError()}>
              <p class="mt-2 text-xs text-destructive">{schemaError()}</p>
            </Show>
          </Show>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center gap-2">
            <span aria-hidden class="size-2 rounded-full bg-violet" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Generate</h2>
          </div>

          <div class="flex flex-wrap items-end gap-4">
            <div class="flex flex-col gap-1.5">
              <Label>Rows</Label>
              <NumberField
                rawValue={count()}
                onRawValueChange={(v) => setCount(Number.isFinite(v) ? v : 10)}
                minValue={1}
                maxValue={10000}
                format={false}
                class="w-28"
              >
                <NumberFieldGroup>
                  <NumberFieldInput class="h-10 font-mono text-sm" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>

            <div class="flex flex-col gap-1.5">
              <Label>Format</Label>
              <div role="radiogroup" aria-label="Format" class="flex gap-2">
                <For each={FORMAT_OPTIONS}>
                  {(opt) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={format() === opt.value}
                      onClick={() => {
                        setFormat(opt.value)
                        setParams({ format: opt.value })
                      }}
                      class={cn(
                        segmentBtn,
                        'h-10',
                        format() === opt.value
                          ? 'border-violet bg-violet text-white'
                          : 'border-border bg-background hover:border-violet/60 hover:bg-violet/5'
                      )}
                    >
                      {opt.label}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <Show when={format() === 'json'}>
              <div class="flex flex-col gap-1.5">
                <Label>Indent</Label>
                <div role="radiogroup" aria-label="Indent" class="flex gap-2">
                  <For each={INDENT_OPTIONS}>
                    {(opt) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={indent() === opt.value}
                        onClick={() => setIndent(opt.value)}
                        class={cn(
                          segmentBtn,
                          'h-10',
                          indent() === opt.value
                            ? 'border-violet bg-violet text-white'
                            : 'border-border bg-background hover:border-violet/60 hover:bg-violet/5'
                        )}
                      >
                        {opt.label}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={format() === 'sql'}>
              <div class="flex flex-col gap-1.5">
                <Label>Table</Label>
                <TextField value={tableName()} onChange={setTableName}>
                  <TextFieldInput class="h-10 w-36 font-mono text-sm" placeholder="records" />
                </TextField>
              </div>
            </Show>

            <Button class="h-10" onClick={generate}>
              Generate
            </Button>
          </div>
        </section>

        <section class="relative rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span aria-hidden class="size-2 rounded-full bg-violet" />
              <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Output</h2>
            </div>
            <Show when={output()}>
              <Button
                variant="outline"
                size="xs"
                class="text-muted-foreground hover:text-foreground"
                onClick={download}
              >
                Download
              </Button>
            </Show>
          </div>

          <div class="relative">
            <Show
              when={output()}
              fallback={
                <div class="flex min-h-[16rem] items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Click Generate to produce data
                </div>
              }
            >
              <div class="anim-fade-up min-h-[16rem] max-h-[32rem] overflow-auto whitespace-pre rounded-md border border-violet/30 bg-violet/5 p-4 pr-14 font-mono text-sm leading-relaxed">
                {output()}
              </div>
              <CopyButton value={() => output()} class="absolute right-2 top-2" />
            </Show>
          </div>

          <Show when={output()}>
            <p class="mt-3 text-xs text-muted-foreground">
              {output().split('\n').length} lines · {(output().length / 1024).toFixed(1)} KB
            </p>
          </Show>
        </section>
      </div>
    </main>
  )
}
