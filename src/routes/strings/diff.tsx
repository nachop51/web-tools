import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { computeDiff } from "~/lib/utils/strings/diff";
import { setToolPageMeta } from "~/lib/seo";

export default function TextDiff() {
  setToolPageMeta("strings", "diff");
  const [original, setOriginal] = createSignal("");
  const [modified, setModified] = createSignal("");

  const diff = createMemo(() => {
    if (!original() && !modified()) return null;
    return computeDiff(original(), modified());
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Text diff"
        description="Compare two pieces of text and highlight additions and deletions line by line."
      />

      <div class="grid gap-4 md:grid-cols-2 mb-6">
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-3 text-base font-semibold">Original</h2>
          <TextField value={original()} onChange={setOriginal}>
            <TextFieldTextArea rows={10} placeholder="Paste original text here…" class="resize-y font-mono text-sm" />
          </TextField>
        </section>
        <section class="rounded-xl border bg-card p-5 shadow-sm">
          <h2 class="mb-3 text-base font-semibold">Modified</h2>
          <TextField value={modified()} onChange={setModified}>
            <TextFieldTextArea rows={10} placeholder="Paste modified text here…" class="resize-y font-mono text-sm" />
          </TextField>
        </section>
      </div>

      <Show when={diff()}>
        {(d) => (
          <section class="rounded-xl border bg-card shadow-sm">
            <div class="flex items-center justify-between border-b px-5 py-3">
              <h2 class="text-base font-semibold">Diff</h2>
              <div class="flex gap-4 text-xs">
                <span class="text-green-600 dark:text-green-400">+{d().stats.added} added</span>
                <span class="text-red-600 dark:text-red-400">−{d().stats.removed} removed</span>
                <span class="text-muted-foreground">{d().stats.unchanged} unchanged</span>
              </div>
            </div>
            <div class="overflow-x-auto">
              <For each={d().lines}>
                {(line) => (
                  <div
                    class={cn(
                      "flex gap-2 px-4 py-0.5 font-mono text-sm",
                      line.type === "added" && "bg-green-500/10 text-green-700 dark:text-green-400",
                      line.type === "removed" && "bg-red-500/10 text-red-700 dark:text-red-400",
                      line.type === "unchanged" && "text-muted-foreground",
                    )}
                  >
                    <span class="select-none w-4 shrink-0">
                      {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                    </span>
                    <span class="whitespace-pre">{line.value || " "}</span>
                  </div>
                )}
              </For>
            </div>
          </section>
        )}
      </Show>
    </main>
  );
}
