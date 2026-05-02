import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { Checkbox, CheckboxLabel } from "~/components/ui/checkbox";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { sortLines, type SortOptions } from "~/lib/utils/strings/sort";
import { setToolPageMeta } from "~/lib/seo";

type Order = "asc" | "desc";
type SortMode = "alpha" | "numeric" | "length";

const sortModeDefs: Array<{ key: SortMode; label: string }> = [
  { key: "alpha", label: "Alpha" },
  { key: "numeric", label: "Numeric" },
  { key: "length", label: "Length" },
];

export default function SortLinesPage() {
  setToolPageMeta("strings", "sort-lines");
  const [params, setParams] = useSearchParams<{ order?: string; mode?: string }>();

  const [input, setInput] = createSignal("");
  const [dedupe, setDedupe] = createSignal(false);
  const [caseSensitive, setCaseSensitive] = createSignal(false);

  const order = createMemo<Order>(() => {
    const p = params.order;
    return p === "desc" ? "desc" : "asc";
  });

  const mode = createMemo<SortMode>(() => {
    const p = params.mode;
    if (p && sortModeDefs.some((m) => m.key === p)) return p as SortMode;
    return "alpha";
  });

  const opts = createMemo<SortOptions>(() => ({
    order: order(),
    mode: mode(),
    dedupe: dedupe(),
    caseSensitive: caseSensitive(),
  }));

  const output = createMemo(() => sortLines(input(), opts()));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Sort lines"
        description="Sort lines alphabetically, numerically, or by length, with optional deduplication."
      />

      <div class="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div class="grid gap-4 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 class="mb-3 text-base font-semibold">Input</h2>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea rows={16} placeholder="Paste lines here…" class="resize-y" />
            </TextField>
          </section>

          <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-semibold">Output</h2>
              <CopyButton value={output} />
            </div>
            <TextField value={output()}>
              <TextFieldTextArea readOnly rows={16} class="resize-y bg-muted/30" placeholder="Sorted result will appear here" />
            </TextField>
          </section>
        </div>

        <aside class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Options</h2>

          <div class="mb-5">
            <p class="mb-2 text-sm font-medium">Order</p>
            <div class="flex gap-2">
              <For each={[{ key: "asc" as Order, label: "A→Z" }, { key: "desc" as Order, label: "Z→A" }]}>
                {(o) => (
                  <button
                    type="button"
                    class={cn(
                      "flex-1 rounded-md border-2 px-2 py-1 text-sm font-medium transition-colors",
                      order() === o.key
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-input hover:border-primary/50",
                    )}
                    onClick={() => setParams({ order: o.key })}
                  >
                    {o.label}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="mb-5">
            <p class="mb-2 text-sm font-medium">Sort by</p>
            <div class="flex gap-2">
              <For each={sortModeDefs}>
                {(m) => (
                  <button
                    type="button"
                    class={cn(
                      "flex-1 rounded-md border-2 px-2 py-1 text-sm font-medium transition-colors",
                      mode() === m.key
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-input hover:border-primary/50",
                    )}
                    onClick={() => setParams({ mode: m.key })}
                  >
                    {m.label}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="space-y-3">
            <Checkbox checked={dedupe()} onChange={setDedupe}>
              <CheckboxLabel>Remove duplicates</CheckboxLabel>
            </Checkbox>
            <Checkbox checked={caseSensitive()} onChange={setCaseSensitive}>
              <CheckboxLabel>Case sensitive</CheckboxLabel>
            </Checkbox>
          </div>
        </aside>
      </div>
    </main>
  );
}
