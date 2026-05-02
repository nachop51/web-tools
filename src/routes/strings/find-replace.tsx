import { createMemo, createSignal } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { Checkbox, CheckboxLabel } from "~/components/ui/checkbox";
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from "~/components/ui/text-field";
import { findReplace } from "~/lib/utils/strings/find-replace";
import { setToolPageMeta } from "~/lib/seo";

export default function FindReplacePage() {
  setToolPageMeta("strings", "find-replace");
  const [text, setText] = createSignal("");
  const [find, setFind] = createSignal("");
  const [replace, setReplace] = createSignal("");
  const [useRegex, setUseRegex] = createSignal(false);
  const [caseSensitive, setCaseSensitive] = createSignal(true);
  const [wholeWord, setWholeWord] = createSignal(false);

  const processed = createMemo(() =>
    findReplace(text(), find(), replace(), {
      useRegex: useRegex(),
      caseSensitive: caseSensitive(),
      wholeWord: wholeWord(),
    }),
  );

  const output = createMemo(() => processed().result);
  const matchCount = createMemo(() => processed().count);

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Find & replace"
        description="Find and replace text with optional regex, case, and whole-word controls."
      />

      <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div class="space-y-4">
          <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <h2 class="mb-3 text-base font-semibold">Input</h2>
            <TextField value={text()} onChange={setText}>
              <TextFieldTextArea rows={10} placeholder="Paste text here…" class="resize-y" />
            </TextField>
          </section>

          <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-base font-semibold">
                Output{" "}
                {find() && text() && (
                  <span class="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-normal text-primary">
                    {matchCount()} match{matchCount() !== 1 ? "es" : ""}
                  </span>
                )}
              </h2>
              <CopyButton value={output} />
            </div>
            <TextField value={output()}>
              <TextFieldTextArea readOnly rows={10} class="resize-y bg-muted/30" placeholder="Result will appear here" />
            </TextField>
          </section>
        </div>

        <aside class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-base font-semibold">Find & Replace</h2>

          <div class="space-y-4">
            <TextField value={find()} onChange={setFind}>
              <TextFieldLabel>Find</TextFieldLabel>
              <TextFieldInput type="text" placeholder={useRegex() ? "regex pattern" : "search text"} class="font-mono" />
            </TextField>

            <TextField value={replace()} onChange={setReplace}>
              <TextFieldLabel>Replace with</TextFieldLabel>
              <TextFieldInput type="text" placeholder="replacement" class="font-mono" />
            </TextField>
          </div>

          <div class="mt-6 space-y-3">
            <p class="text-sm font-medium">Options</p>
            <Checkbox checked={useRegex()} onChange={setUseRegex}>
              <CheckboxLabel>Use regex</CheckboxLabel>
            </Checkbox>
            <Checkbox checked={caseSensitive()} onChange={setCaseSensitive}>
              <CheckboxLabel>Case sensitive</CheckboxLabel>
            </Checkbox>
            <Checkbox checked={wholeWord()} onChange={setWholeWord}>
              <CheckboxLabel>Whole word</CheckboxLabel>
            </Checkbox>
          </div>
        </aside>
      </div>
    </main>
  );
}
