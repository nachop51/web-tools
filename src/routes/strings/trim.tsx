import { createMemo, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { Checkbox, CheckboxLabel } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem, RadioGroupItemLabel } from "~/components/ui/radio-group";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { applyTrimOps, type TrimOptions } from "~/lib/utils/strings/trim";
import { setToolPageMeta } from "~/lib/seo";

type LineEndingOption = {
  value: "none" | "lf" | "crlf" | "cr";
  label: string;
};

const lineEndingOptions: LineEndingOption[] = [
  { value: "none", label: "No change" },
  { value: "lf", label: "LF (Unix)" },
  { value: "crlf", label: "CRLF (Windows)" },
  { value: "cr", label: "CR (Classic Mac)" },
];

const checkboxDefs = [
  { key: "trimEdges" as const, label: "Trim leading/trailing whitespace" },
  { key: "collapseSpaces" as const, label: "Collapse multiple spaces" },
  { key: "trimLines" as const, label: "Trim each line" },
  { key: "removeBlank" as const, label: "Remove blank lines" },
  { key: "dedupe" as const, label: "Deduplicate lines" },
];

export default function TrimClean() {
  setToolPageMeta("strings", "trim");
  const [input, setInput] = createSignal("");

  const [opts, setOpts] = createStore<TrimOptions>({
    trimEdges: true,
    collapseSpaces: false,
    trimLines: false,
    removeBlank: false,
    lineEndings: "none",
    dedupe: false,
  });

  const output = createMemo(() => applyTrimOps(input(), opts));

  const linesRemoved = createMemo(() => {
    const inLines = input() === "" ? 0 : input().split("\n").length;
    const outLines = output() === "" ? 0 : output().split("\n").length;
    return Math.max(0, inLines - outLines);
  });

  const charsSaved = createMemo(() =>
    Math.max(0, input().length - output().length),
  );

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Trim & clean"
        description="Trim whitespace, collapse spaces, normalize line endings, and deduplicate lines."
      />

      <div class="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div class="grid gap-4 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 class="mb-3 text-base font-semibold">Input</h2>
            <TextField value={input()} onChange={setInput}>
              <TextFieldTextArea
                rows={16}
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
                rows={16}
                class="resize-y bg-muted/30"
                placeholder="Result will appear here"
              />
            </TextField>
            <p class="mt-2 text-xs text-muted-foreground">
              {linesRemoved()} lines removed · {charsSaved()} chars saved
            </p>
          </section>
        </div>

        <aside class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Options</h2>

          <div class="mb-6 space-y-3">
            <For each={checkboxDefs}>
              {(def) => (
                <Checkbox
                  checked={opts[def.key] as boolean}
                  onChange={(v) => setOpts(def.key, v)}
                >
                  <CheckboxLabel>{def.label}</CheckboxLabel>
                </Checkbox>
              )}
            </For>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">Line endings</p>
            <RadioGroup value={opts.lineEndings} onChange={(v) => setOpts("lineEndings", v as TrimOptions["lineEndings"])}>
              <For each={lineEndingOptions}>
                {(opt) => (
                  <RadioGroupItem value={opt.value}>
                    <RadioGroupItemLabel>{opt.label}</RadioGroupItemLabel>
                  </RadioGroupItem>
                )}
              </For>
            </RadioGroup>
          </div>
        </aside>
      </div>
    </main>
  );
}
