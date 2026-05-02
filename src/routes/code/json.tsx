import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { processJson } from "~/lib/utils/code/json";
import { setToolPageMeta } from "~/lib/seo";

type IndentMode = 2 | 4 | 0;

export default function JsonTool() {
  setToolPageMeta("code", "json");
  const [input, setInput] = createSignal("");
  const [indent, setIndent] = createSignal<IndentMode>(2);

  const result = createMemo(() => processJson(input(), indent()));

  const output = createMemo(() => {
    const r = result();
    if (!input().trim()) return "";
    if (!r.ok) return "";
    return indent() === 0 ? r.minified : r.formatted;
  });

  const stats = createMemo(() => {
    const r = result();
    const out = output();
    if (!r.ok || !out) return null;
    const inputSize = input().length;
    const outputSize = out.length;
    const diff = inputSize === 0 ? 0 : Math.round((1 - outputSize / inputSize) * 100);
    return { inputSize, outputSize, diff };
  });

  const error = createMemo(() => {
    if (!input().trim()) return null;
    const r = result();
    return r.ok ? null : r;
  });

  const indentOptions: { label: string; value: IndentMode }[] = [
    { label: "2 spaces", value: 2 },
    { label: "4 spaces", value: 4 },
    { label: "Minify", value: 0 },
  ];

  return (
    <main class="w-full max-w-5xl py-10">
      <ToolHeader
        category="code"
        name="JSON formatter"
        description="Format, minify, and validate JSON. Errors show line and column."
      />

      <div class="mb-4 flex gap-2">
        <For each={indentOptions}>
          {(opt) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
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

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField value={input()} onChange={setInput}>
            <TextFieldTextArea
              rows={16}
              class="font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </TextField>
          <Show when={error()}>
            {(err) => (
              <div class="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <span class="font-semibold">Parse error:</span> {err().error}
                <Show when={err().line}>
                  {" "}
                  <span class="opacity-70">
                    (line {err().line}
                    <Show when={err().column}>, col {err().column}</Show>)
                  </span>
                </Show>
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
              placeholder="Formatted JSON will appear here"
            />
          </TextField>
          <Show when={stats()}>
            {(s) => (
              <p class="mt-2 text-xs text-muted-foreground">
                {s().inputSize} bytes in &rarr; {s().outputSize} bytes out
                {s().diff > 0 && <span class="ml-1 text-primary">({s().diff}% smaller)</span>}
                {s().diff < 0 && <span class="ml-1 text-destructive">({Math.abs(s().diff)}% larger)</span>}
                {s().diff === 0 && <span class="ml-1">(no change)</span>}
              </p>
            )}
          </Show>
        </section>
      </div>
    </main>
  );
}
