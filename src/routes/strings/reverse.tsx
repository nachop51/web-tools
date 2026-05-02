import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { reverseChars, reverseLines, reverseWords } from "~/lib/utils/strings/reverse";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "chars" | "words" | "lines";

const modes: { key: Mode; label: string }[] = [
  { key: "chars", label: "Characters" },
  { key: "words", label: "Words" },
  { key: "lines", label: "Lines" },
];

export default function ReverseText() {
  setToolPageMeta("strings", "reverse");
  const [params, setParams] = useSearchParams<{ mode?: string }>();
  const [input, setInput] = createSignal("");

  const mode = createMemo<Mode>(() => {
    const p = params.mode;
    if (p === "chars" || p === "words" || p === "lines") return p;
    return "chars";
  });

  const output = createMemo(() => {
    const s = input();
    switch (mode()) {
      case "words": return reverseWords(s);
      case "lines": return reverseLines(s);
      default: return reverseChars(s);
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Reverse text"
        description="Reverse text by characters, words, or lines."
      />

      <div class="mb-4 flex gap-2">
        <For each={modes}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                mode() === m.key
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setParams({ mode: m.key })}
            >
              {m.label}
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
