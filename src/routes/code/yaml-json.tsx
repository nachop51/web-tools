import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { jsonToYaml, yamlToJson } from "~/lib/utils/code/yaml";
import { setToolPageMeta } from "~/lib/seo";

type Dir = "json-to-yaml" | "yaml-to-json";

const DIRS: { key: Dir; label: string }[] = [
  { key: "json-to-yaml", label: "JSON → YAML" },
  { key: "yaml-to-json", label: "YAML → JSON" },
];

const INDENT_OPTS: { label: string; value: number }[] = [
  { label: "Minify", value: 0 },
  { label: "2 spaces", value: 2 },
  { label: "4 spaces", value: 4 },
];

export default function YamlJsonTool() {
  setToolPageMeta("code", "yaml-json");
  const [params, setParams] = useSearchParams<{ dir?: string }>();

  const [input, setInput] = createSignal("");

  const dir = createMemo<Dir>(() => {
    const p = params.dir;
    if (p === "json-to-yaml" || p === "yaml-to-json") return p;
    return "json-to-yaml";
  });

  const [indent, setIndent] = createSignal(2);

  const result = createMemo(() => {
    const s = input().trim();
    if (!s) return null;
    return dir() === "json-to-yaml"
      ? jsonToYaml(s)
      : yamlToJson(s, indent());
  });

  const output = createMemo(() => {
    const r = result();
    if (!r) return "";
    return r.ok ? r.output : "";
  });

  const error = createMemo(() => {
    const r = result();
    if (!r) return null;
    return r.ok ? null : r.error;
  });

  const showIndent = createMemo(() => dir() === "yaml-to-json");

  return (
    <main class="w-full max-w-5xl py-10">
      <ToolHeader
        category="code"
        name="YAML ↔ JSON"
        description="Convert between YAML and JSON formats."
      />

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <For each={DIRS}>
          {(d) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                dir() === d.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setParams({ dir: d.key })}
            >
              {d.label}
            </button>
          )}
        </For>

        <Show when={showIndent()}>
          <div class="flex gap-1 ml-2">
            <For each={INDENT_OPTS}>
              {(opt) => (
                <button
                  type="button"
                  class={cn(
                    "rounded-md px-3 py-1.5 text-sm border-2 transition-colors",
                    indent() === opt.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input hover:border-primary/50 hover:bg-accent/30",
                  )}
                  onClick={() => setIndent(opt.value)}
                >
                  {opt.label}
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField value={input()} onChange={setInput}>
            <TextFieldTextArea
              rows={16}
              class="font-mono text-sm"
              placeholder={dir() === "json-to-yaml" ? '{"key": "value"}' : "key: value"}
            />
          </TextField>
          <Show when={error()}>
            {(err) => (
              <div class="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <span class="font-semibold">Error:</span> {err()}
              </div>
            )}
          </Show>
        </section>

        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Output</h2>
            <CopyButton value={() => output()} />
          </div>
          <TextField>
            <TextFieldTextArea
              readOnly
              value={output()}
              rows={16}
              class="font-mono text-sm"
              placeholder="Result will appear here"
            />
          </TextField>
        </section>
      </div>
    </main>
  );
}
