import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { Checkbox, CheckboxLabel } from "~/components/ui/checkbox";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";
import {
  decodeHTMLEntities,
  encodeHTMLEntities,
} from "~/lib/utils/encoding/html-entities";

type Mode = "encode" | "decode";

export default function HTMLEntitiesTool() {
  setToolPageMeta("encoding", "html-entities");
  const [params, setParams] = useSearchParams<{ mode?: string }>();

  const [input, setInput] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [extended, setExtended] = createSignal(false);

  const [mode, setModeSignal] = createSignal<Mode>(
    params.mode === "decode" ? "decode" : "encode",
  );

  function setMode(m: Mode) {
    setModeSignal(m);
    setParams({ mode: m });
  }

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return mode() === "encode"
        ? encodeHTMLEntities(input(), extended())
        : decodeHTMLEntities(input());
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
      mode() === "encode"
        ? encodeHTMLEntities(input(), extended())
        : decodeHTMLEntities(input());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="HTML entities"
        description="Encode and decode HTML entities, including &amp;, &lt;, &gt;, and numeric entities."
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

      <Show when={mode() === "encode"}>
        <div class="mt-3 mb-4">
          <Checkbox checked={extended()} onChange={setExtended}>
            <CheckboxLabel>Encode non-ASCII characters as numeric entities</CheckboxLabel>
          </Checkbox>
        </div>
      </Show>

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
              placeholder="Enter HTML to encode or entities to decode…"
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
