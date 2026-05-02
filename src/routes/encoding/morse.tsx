import { createEffect, createMemo, createSignal, For } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { textToMorse, morseToText } from "~/lib/utils/encoding/morse";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "encode" | "decode";

export default function MorseTool() {
  setToolPageMeta("encoding", "morse");
  const [params, setParams] = useSearchParams<{ dir?: string }>();
  const [input, setInput] = createSignal("");
  const [mode, setMode] = createSignal<Mode>(
    params.dir === "decode" ? "decode" : "encode",
  );
  const [error, setError] = createSignal<string | null>(null);

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return mode() === "encode" ? textToMorse(input()) : morseToText(input());
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
      mode() === "encode" ? textToMorse(input()) : morseToText(input());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  });

  function handleMode(m: Mode) {
    setMode(m);
    setParams({ dir: m });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Morse code"
        description="Encode text to Morse code or decode Morse back to text (ITU-R standard)."
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
              onClick={() => handleMode(m)}
            >
              {m === "encode" ? "Text → Morse" : "Morse → Text"}
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
              placeholder={
                mode() === "encode"
                  ? "Enter text to convert to Morse…"
                  : "Enter Morse code (letters separated by spaces, words by ' / ')…"
              }
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
