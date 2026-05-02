import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { decodeURL, encodeURL, type URLMode } from "~/lib/utils/encoding/url";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "encode" | "decode";

const scopeDescriptions: Record<URLMode, string> = {
  component: "Encodes all special chars including &, =, #. Use for query param values",
  full: "Preserves URI structure (://, /, ?, #). Use for complete URLs",
};

export default function URLTool() {
  setToolPageMeta("encoding", "url");
  const [params, setParams] = useSearchParams<{ mode?: string; scope?: string }>();

  const [input, setInput] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);

  const [mode, setModeSignal] = createSignal<Mode>(
    params.mode === "decode" ? "decode" : "encode",
  );
  const [scope, setScopeSignal] = createSignal<URLMode>(
    params.scope === "full" ? "full" : "component",
  );

  function setMode(m: Mode) {
    setModeSignal(m);
    setParams({ mode: m });
  }

  function setScope(s: URLMode) {
    setScopeSignal(s);
    setParams({ scope: s });
  }

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return mode() === "encode"
        ? encodeURL(input(), scope())
        : decodeURL(input(), scope());
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
        ? encodeURL(input(), scope())
        : decodeURL(input(), scope());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="URL encode"
        description="URL-encode and decode strings with encodeURIComponent or encodeURI."
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

      <div class="mb-6">
        <div class="flex gap-2">
          <For each={["component", "full"] as URLMode[]}>
            {(s) => (
              <button
                type="button"
                class={cn(
                  "rounded-md px-3 py-1 text-xs font-medium border-2 transition-colors",
                  scope() === s
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input hover:border-primary/50 hover:bg-accent/30",
                )}
                onClick={() => setScope(s)}
              >
                <Show when={s === "component"}>encodeURIComponent</Show>
                <Show when={s === "full"}>encodeURI</Show>
              </button>
            )}
          </For>
        </div>
        <p class="mt-2 text-sm text-muted-foreground">{scopeDescriptions[scope()]}</p>
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
              placeholder="Enter text to encode or encoded string to decode…"
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
