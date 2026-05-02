import { createEffect, createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { decodeBase64, encodeBase64 } from "~/lib/utils/encoding/base64";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  setToolPageMeta("encoding", "base64");
  const [input, setInput] = createSignal("");
  const [mode, setMode] = createSignal<Mode>("encode");
  const [error, setError] = createSignal<string | null>(null);

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return mode() === "encode" ? encodeBase64(input()) : decodeBase64(input());
    } catch {
      return "";
    }
  });

  createEffect(() => {
    if (!input()) {
      setError(null);
      return;
    }
    try {
      mode() === "encode" ? encodeBase64(input()) : decodeBase64(input());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Base64"
        description="Encode and decode Base64 text, with full Unicode/UTF-8 support."
      />

      <div class="mb-4 flex gap-2">
        <For each={["encode", "decode"] as Mode[]}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                mode() === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setMode(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? "invalid" : "valid"}
          >
            <TextFieldTextArea
              rows={8}
              class="font-mono"
              placeholder="Enter text to encode or base64 to decode…"
            />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextField>
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
              rows={8}
              class="font-mono"
              placeholder="Result will appear here"
            />
          </TextField>
        </section>
      </div>
    </main>
  );
}
