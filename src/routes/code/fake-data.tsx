import { createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore, produce, reconcile, unwrap } from "solid-js/store";
import { useSearchParams } from "@solidjs/router";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";
import {
  generateRows,
  parseSchema,
  serializeSchema,
  toCsv,
  toJson,
  toSql,
  type FieldDef,
  type FieldType,
} from "~/lib/utils/code/fake-data";

type Format = "json" | "csv" | "sql";
type Indent = 0 | 2 | 4;
type Tab = "visual" | "schema";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "uuid", label: "UUID" },
  { value: "boolean", label: "Boolean" },
  { value: "integer", label: "Integer" },
  { value: "float", label: "Float" },
  { value: "string", label: "String" },
  { value: "firstName", label: "First name" },
  { value: "lastName", label: "Last name" },
  { value: "fullName", label: "Full name" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "color", label: "Color" },
  { value: "ipv4", label: "IPv4" },
  { value: "enum", label: "Enum" },
];

const DEFAULT_FIELDS: FieldDef[] = [
  { name: "id", type: "uuid" },
  { name: "name", type: "fullName" },
  { name: "email", type: "email" },
  { name: "age", type: "integer", min: 18, max: 99 },
  { name: "active", type: "boolean" },
];

const inputClass =
  "rounded border border-input bg-background px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function FakeDataTool() {
  setToolPageMeta("code", "fake-data");
  const [params, setParams] = useSearchParams();

  const [fields, setFields] = createStore<FieldDef[]>(
    DEFAULT_FIELDS.map((f) => ({ ...f })),
  );
  const [schemaText, setSchemaText] = createSignal(
    serializeSchema(DEFAULT_FIELDS),
  );
  const [schemaError, setSchemaError] = createSignal("");
  const [count, setCount] = createSignal(10);
  const [format, setFormat] = createSignal<Format>(
    (params.format as Format) || "json",
  );
  const [tableName, setTableName] = createSignal("records");
  const [indent, setIndent] = createSignal<Indent>(2);
  const [activeTab, setActiveTab] = createSignal<Tab>(
    (params.tab as Tab) || "visual",
  );
  const [output, setOutput] = createSignal("");

  function switchTab(tab: Tab) {
    if (tab === "schema") {
      setSchemaText(serializeSchema(unwrap(fields)));
      setSchemaError("");
    }
    setActiveTab(tab);
    setParams({ tab });
  }

  function handleSchemaChange(text: string) {
    setSchemaText(text);
    try {
      setFields(reconcile(parseSchema(text)));
      setSchemaError("");
    } catch (e) {
      setSchemaError(e instanceof Error ? e.message : "Invalid schema");
    }
  }

  function addField() {
    setFields(
      produce((d) =>
        d.push({ name: `field${d.length + 1}`, type: "string" as FieldType }),
      ),
    );
  }

  function removeField(index: number) {
    setFields(produce((d) => d.splice(index, 1)));
  }

  function generate() {
    const plain = unwrap(fields);
    const rows = generateRows(plain, Math.max(1, Math.min(count(), 10_000)));
    const fmt = format();
    if (fmt === "json") setOutput(toJson(rows, indent()));
    else if (fmt === "csv") setOutput(toCsv(rows, plain));
    else setOutput(toSql(rows, tableName() || "records", plain));
  }

  function download() {
    const text = output();
    if (!text) return;
    const ext = format();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main class="w-full max-w-5xl py-10">
      <ToolHeader
        category="code"
        name="Fake data generator"
        description="Generate mock JSON, CSV, or SQL from a visual schema or a JSON template."
      />

      <div class="mb-6 flex gap-2">
        <For
          each={
            [
              { value: "visual", label: "Visual" },
              { value: "schema", label: "JSON Schema" },
            ] as { value: Tab; label: string }[]
          }
        >
          {(tab) => (
            <button
              type="button"
              class={cn(
                "rounded-md border-2 px-4 py-1.5 text-sm font-medium transition-colors",
                activeTab() === tab.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => switchTab(tab.value)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>

      <Show when={activeTab() === "visual"}>
        <section class="mb-6 rounded-xl border bg-card p-6 shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                        <input
                          type="text"
                          value={field.name}
                          onInput={(e) =>
                            setFields(index(), "name", e.currentTarget.value)
                          }
                          class={cn(inputClass, "w-full")}
                          placeholder="field name"
                        />
                      </td>
                      <td class="py-2 pr-4">
                        <select
                          value={field.type}
                          onChange={(e) =>
                            setFields(
                              index(),
                              "type",
                              e.currentTarget.value as FieldType,
                            )
                          }
                          class={cn(inputClass, "w-full")}
                        >
                          <For each={FIELD_TYPES}>
                            {(opt) => (
                              <option value={opt.value}>{opt.label}</option>
                            )}
                          </For>
                        </select>
                      </td>
                      <td class="py-2 pr-2">
                        <Switch>
                          <Match
                            when={
                              field.type === "integer" ||
                              field.type === "float"
                            }
                          >
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-muted-foreground">
                                min
                              </span>
                              <NumberField
                                rawValue={field.min}
                                onRawValueChange={(v) =>
                                  setFields(
                                    index(),
                                    "min",
                                    Number.isFinite(v) ? v : undefined,
                                  )
                                }
                                format={false}
                                class="w-20"
                              >
                                <NumberFieldInput
                                  class={cn(inputClass, "h-auto w-full pr-2")}
                                  placeholder="0"
                                />
                              </NumberField>
                              <span class="text-xs text-muted-foreground">
                                max
                              </span>
                              <NumberField
                                rawValue={field.max}
                                onRawValueChange={(v) =>
                                  setFields(
                                    index(),
                                    "max",
                                    Number.isFinite(v) ? v : undefined,
                                  )
                                }
                                format={false}
                                class="w-20"
                              >
                                <NumberFieldInput
                                  class={cn(inputClass, "h-auto w-full pr-2")}
                                  placeholder="100"
                                />
                              </NumberField>
                            </div>
                          </Match>
                          <Match when={field.type === "string"}>
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-muted-foreground">
                                len
                              </span>
                              <NumberField
                                rawValue={field.minLength}
                                onRawValueChange={(v) =>
                                  setFields(
                                    index(),
                                    "minLength",
                                    Number.isFinite(v) ? v : undefined,
                                  )
                                }
                                format={false}
                                class="w-20"
                              >
                                <NumberFieldInput
                                  class={cn(inputClass, "h-auto w-full pr-2")}
                                  placeholder="4"
                                />
                              </NumberField>
                              <span class="text-xs text-muted-foreground">
                                –
                              </span>
                              <NumberField
                                rawValue={field.maxLength}
                                onRawValueChange={(v) =>
                                  setFields(
                                    index(),
                                    "maxLength",
                                    Number.isFinite(v) ? v : undefined,
                                  )
                                }
                                format={false}
                                class="w-20"
                              >
                                <NumberFieldInput
                                  class={cn(inputClass, "h-auto w-full pr-2")}
                                  placeholder="20"
                                />
                              </NumberField>
                            </div>
                          </Match>
                          <Match when={field.type === "enum"}>
                            <input
                              type="text"
                              value={(field.values ?? []).join(", ")}
                              onInput={(e) =>
                                setFields(
                                  index(),
                                  "values",
                                  e.currentTarget.value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter(Boolean),
                                )
                              }
                              class={cn(inputClass, "w-48")}
                              placeholder="a, b, c"
                            />
                          </Match>
                          <Match when={field.type === "date"}>
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-muted-foreground">
                                format
                              </span>
                              <input
                                type="text"
                                value={field.format ?? ""}
                                onInput={(e) =>
                                  setFields(
                                    index(),
                                    "format",
                                    e.currentTarget.value || undefined,
                                  )
                                }
                                class={cn(inputClass, "w-36")}
                                placeholder="YYYY-MM-DD"
                              />
                            </div>
                          </Match>
                          <Match when={true}>
                            <span class="text-xs text-muted-foreground">—</span>
                          </Match>
                        </Switch>
                      </td>
                      <td class="py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeField(index())}
                          class="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove field"
                        >
                          ✕
                        </button>
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
            class="mt-4 rounded-md border-2 border-dashed border-input px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            + Add field
          </button>
        </section>
      </Show>

      <Show when={activeTab() === "schema"}>
        <section class="mb-6 rounded-xl border bg-card p-6 shadow-sm">
          <p class="mb-3 text-xs text-muted-foreground">
            Edit the JSON schema directly. Valid changes sync to the visual
            table.
          </p>
          <TextField value={schemaText()} onChange={handleSchemaChange}>
            <TextFieldTextArea
              rows={16}
              class="font-mono text-sm"
              placeholder="[]"
            />
          </TextField>
          <Show when={schemaError()}>
            <p class="mt-2 text-xs text-destructive">{schemaError()}</p>
          </Show>
        </section>
      </Show>

      <div class="mb-6 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-foreground">Rows</label>
          <NumberField
            rawValue={count()}
            onRawValueChange={(v) =>
              setCount(Number.isFinite(v) ? v : 10)
            }
            minValue={1}
            maxValue={10000}
            format={false}
            class="w-24"
          >
            <NumberFieldGroup>
              <NumberFieldInput class="font-mono" />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-foreground">Format</label>
          <select
            value={format()}
            onChange={(e) => {
              setFormat(e.currentTarget.value as Format);
              setParams({ format: e.currentTarget.value });
            }}
            class={cn(inputClass, "w-24")}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <Show when={format() === "json"}>
          <div class="flex items-center gap-1">
            <For
              each={
                [
                  { value: 0, label: "Min" },
                  { value: 2, label: "2" },
                  { value: 4, label: "4" },
                ] as { value: Indent; label: string }[]
              }
            >
              {(opt) => (
                <button
                  type="button"
                  class={cn(
                    "rounded border px-2.5 py-1 text-xs font-medium transition-colors",
                    indent() === opt.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                  onClick={() => setIndent(opt.value)}
                >
                  {opt.label}
                </button>
              )}
            </For>
          </div>
        </Show>
        <Show when={format() === "sql"}>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-foreground">Table</label>
            <input
              type="text"
              value={tableName()}
              onInput={(e) => setTableName(e.currentTarget.value)}
              class={cn(inputClass, "w-32")}
              placeholder="records"
            />
          </div>
        </Show>
        <button
          type="button"
          onClick={generate}
          class="rounded-md border-2 border-primary bg-primary/10 px-5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Generate
        </button>
      </div>

      <Show when={output()}>
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Output
            </h2>
            <div class="flex gap-2">
              <CopyButton value={() => output()} />
              <button
                type="button"
                onClick={download}
                class="inline-flex cursor-pointer items-center gap-1.5 border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                Download
              </button>
            </div>
          </div>
          <TextField>
            <TextFieldTextArea
              readOnly
              value={output()}
              rows={16}
              class="font-mono text-sm"
            />
          </TextField>
          <p class="mt-2 text-xs text-muted-foreground">
            {output().split("\n").length} lines ·{" "}
            {(output().length / 1024).toFixed(1)} KB
          </p>
        </section>
      </Show>
    </main>
  );
}
