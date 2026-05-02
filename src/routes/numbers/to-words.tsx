import { createMemo, createSignal } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldTextArea,
} from "~/components/ui/text-field";
import { numberToWords } from "~/lib/utils/numbers/words";
import { setToolPageMeta } from "~/lib/seo";

export default function ToWords() {
  setToolPageMeta("numbers", "to-words");
  const [input, setInput] = createSignal("");

  const result = createMemo((): { output: string; error: string } => {
    const trimmed = input().trim();
    if (!trimmed) return { output: "", error: "" };

    const n = Number(trimmed);
    const words = numberToWords(n);
    if (words === "") {
      return {
        output: "",
        error: "Enter a valid integer (e.g. 42, -7, 1000000). Fractions, NaN, and values beyond ±999,999,999,999 are not supported.",
      };
    }
    return { output: words, error: "" };
  });

  const output = createMemo(() => result().output);
  const error = createMemo(() => result().error);

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Number to words"
        description="Convert any integer up to ±999 billion into its English word representation."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? "invalid" : "valid"}
          >
            <TextFieldInput
              type="text"
              placeholder="Enter an integer, e.g. 42 or -1000"
            />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextField>
        </section>

        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold">Output</h2>
            <CopyButton value={() => output()} />
          </div>
          <TextField>
            <TextFieldTextArea
              readOnly
              value={output()}
              rows={4}
              placeholder="Words will appear here"
            />
          </TextField>
        </section>
      </div>
    </main>
  );
}
