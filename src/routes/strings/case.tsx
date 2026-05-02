import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { caseDefs, caseConverters, type CaseKey } from "~/lib/utils/strings/case";
import { setToolPageMeta } from "~/lib/seo";

export default function CaseConverter() {
  setToolPageMeta("strings", "case");
  const [params, setParams] = useSearchParams<{ mode?: string }>();

  const [input, setInput] = createSignal("");

  const mode = createMemo<CaseKey>(() => {
    const p = params.mode;
    if (p && p in caseConverters) return p as CaseKey;
    return "upper";
  });

  const output = createMemo(() => caseConverters[mode()](input()));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Case converter"
        description="Convert text between upper, lower, title, camel, snake, kebab, and other cases."
      />

      <div class="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <For each={caseDefs}>
          {(def) => (
            <button
              type="button"
              class={cn(
                "rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors",
                "hover:border-primary/60 hover:bg-primary/10",
                mode() === def.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input",
              )}
              onClick={() => setParams({ mode: def.key })}
            >
              <span class="block font-medium">{def.label}</span>
              <span class="text-xs text-muted-foreground">{def.example}</span>
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 class="mb-3 text-base font-semibold">Input</h2>
          <TextField value={input()} onChange={setInput}>
            <TextFieldTextArea
              rows={12}
              placeholder="Paste text here…"
              class="resize-y"
            />
          </TextField>
        </section>

        <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-base font-semibold">Output</h2>
            <CopyButton value={output} />
          </div>
          <TextField value={output()}>
            <TextFieldTextArea
              readOnly
              rows={12}
              class="resize-y bg-muted/30"
              placeholder="Result will appear here"
            />
          </TextField>
        </section>
      </div>
    </main>
  );
}
