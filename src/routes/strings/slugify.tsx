import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { RadioGroup, RadioGroupItem, RadioGroupItemLabel } from "~/components/ui/radio-group";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { slugify, type SlugifyOptions } from "~/lib/utils/strings/slugify";
import { setToolPageMeta } from "~/lib/seo";

type Separator = "-" | "_" | ".";

const separatorOptions: Array<{ value: Separator; label: string }> = [
  { value: "-", label: "Hyphen (-)" },
  { value: "_", label: "Underscore (_)" },
  { value: ".", label: "Dot (.)" },
];

export default function SlugifyTool() {
  setToolPageMeta("strings", "slugify");
  const [params, setParams] = useSearchParams<{ sep?: string; lc?: string }>();

  const [input, setInput] = createSignal("");

  const separator = createMemo<Separator>(() => {
    const s = params.sep;
    if (s === "-" || s === "_" || s === ".") return s;
    return "-";
  });

  const lowercase = createMemo(() => params.lc !== "0");

  const output = createMemo(() => {
    const opts: SlugifyOptions = {
      separator: separator(),
      lowercase: lowercase(),
    };
    return slugify(input(), opts);
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Slugify"
        description="Convert text to a URL-friendly slug."
      />

      <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div class="space-y-4">
          <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 class="mb-3 text-base font-semibold">Input</h2>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                rows={6}
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
                rows={6}
                class="resize-y bg-muted/30 font-mono"
                placeholder="Slug will appear here"
              />
            </TextField>
          </section>
        </div>

        <aside class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Options</h2>

          <div class="mb-6">
            <p class="mb-2 text-sm font-medium">Separator</p>
            <RadioGroup value={separator()} onChange={(v) => setParams({ sep: v })}>
              <For each={separatorOptions}>
                {(opt) => (
                  <RadioGroupItem value={opt.value}>
                    <RadioGroupItemLabel>{opt.label}</RadioGroupItemLabel>
                  </RadioGroupItem>
                )}
              </For>
            </RadioGroup>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">Case</p>
            <button
              type="button"
              class={cn(
                "w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors",
                "hover:border-primary/60 hover:bg-primary/10",
                lowercase()
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input",
              )}
              onClick={() => setParams({ lc: lowercase() ? "0" : "1" })}
            >
              {lowercase() ? "Lowercase enabled" : "Lowercase disabled"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
