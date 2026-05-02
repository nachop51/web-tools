import { createEffect, createResource, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { hashAlgorithms, hashText, type HashAlgorithm } from "~/lib/utils/encoding/hash";
import { setToolPageMeta } from "~/lib/seo";

export default function HashTool() {
  setToolPageMeta("encoding", "hash");
  const [inputValue, setInputValue] = createSignal("");
  const [algorithm, setAlgorithm] = createSignal<HashAlgorithm>("SHA-256");
  const [source, setSource] = createSignal<[string, HashAlgorithm]>(["", "SHA-256"]);

  const [hash] = createResource(source, ([text, algo]) =>
    text ? hashText(text, algo) : Promise.resolve(""),
  );

  createEffect(() => {
    setSource([inputValue(), algorithm()]);
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Hash generator"
        description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from any text."
      />

      <div class="mb-6 flex gap-2">
        <For each={hashAlgorithms}>
          {(algo) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                algorithm() === algo
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setAlgorithm(algo)}
            >
              {algo}
            </button>
          )}
        </For>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField value={inputValue()} onChange={setInputValue}>
            <TextFieldTextArea
              rows={8}
              class="font-mono"
              placeholder="Enter text to hash…"
            />
          </TextField>
        </section>

        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Hash</h2>
            <CopyButton value={() => hash() ?? ""} />
          </div>
          <Show when={hash.loading}>
            <p class="text-sm text-muted-foreground">Computing…</p>
          </Show>
          <TextField>
            <TextFieldTextArea
              readOnly
              value={hash() ?? ""}
              rows={8}
              class="font-mono"
              placeholder="Hash will appear here"
            />
          </TextField>
        </section>
      </div>
    </main>
  );
}
