import { createEffect, createMemo, createSignal, For } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { decodeBase58, encodeBase58 } from "~/lib/utils/encoding/base58";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "encode" | "decode";

export default function Base58Tool() {
  setToolPageMeta("encoding", "base58");
  const [params, setParams] = useSearchParams<{ dir?: string }>();
  const [input, setInput] = createSignal("");
  const [mode, setMode] = createSignal<Mode>(
    params.dir === "decode" ? "decode" : "encode",
  );
  const [error, setError] = createSignal<string | null>(null);

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return mode() === "encode" ? encodeBase58(input()) : decodeBase58(input());
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
      mode() === "encode" ? encodeBase58(input()) : decodeBase58(input());
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
        name="Base58"
        description="Encode and decode Bitcoin Base58 (excludes 0, O, I, l to avoid ambiguity)."
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
              placeholder="Enter text to encode or Base58 to decode…"
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
