import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { escapeString, unescapeString, type EscapeMode } from "~/lib/utils/strings/escape";
import { setToolPageMeta } from "~/lib/seo";

type Dir = "escape" | "unescape";

const modes: Array<{ key: EscapeMode; label: string }> = [
  { key: "js", label: "JS" },
  { key: "json", label: "JSON" },
  { key: "regex", label: "Regex" },
  { key: "csv", label: "CSV" },
  { key: "sql", label: "SQL" },
];

export default function EscapeTool() {
  setToolPageMeta("strings", "escape");
  const [params, setParams] = useSearchParams<{ mode?: string; dir?: string }>();

  const [input, setInput] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const mode = createMemo<EscapeMode>(() => {
    const p = params.mode;
    if (p && modes.some((m) => m.key === p)) return p as EscapeMode;
    return "js";
  });

  const dir = createMemo<Dir>(() => {
    const p = params.dir;
    return p === "unescape" ? "unescape" : "escape";
  });

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return dir() === "escape"
        ? escapeString(input(), mode())
        : unescapeString(input(), mode());
    } catch {
      return "";
    }
  });

  createEffect(() => {
    if (!input()) { setError(null); return; }
    try {
      dir() === "escape" ? escapeString(input(), mode()) : unescapeString(input(), mode());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Escape / unescape"
        description="Escape or unescape strings for JS, JSON, regex, CSV, and SQL."
      />

      <div class="mb-4 flex flex-wrap gap-2">
        <For each={modes}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md border-2 px-4 py-1.5 text-sm font-medium transition-colors",
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

        <div class="ml-auto flex gap-2">
          <For each={["escape", "unescape"] as Dir[]}>
            {(d) => (
              <button
                type="button"
                class={cn(
                  "rounded-md border-2 px-4 py-1.5 text-sm font-medium transition-colors",
                  dir() === d
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input hover:border-primary/50 hover:bg-accent/30",
                )}
                onClick={() => setParams({ dir: d })}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Input</h2>
          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? "invalid" : "valid"}
          >
            <TextFieldTextArea rows={10} class="font-mono" placeholder="Enter text…" />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextField>
        </section>

        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold">Output</h2>
            <CopyButton value={output} />
          </div>
          <TextField value={output()}>
            <TextFieldTextArea readOnly rows={10} class="font-mono bg-muted/30" placeholder="Result will appear here" />
          </TextField>
        </section>
      </div>
    </main>
  );
}
