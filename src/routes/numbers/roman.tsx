import { createMemo, createSignal, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldTextArea,
} from "~/components/ui/text-field";
import { fromRoman, isLikelyRoman, toRoman } from "~/lib/utils/numbers/roman";
import { setToolPageMeta } from "~/lib/seo";

export default function Roman() {
  setToolPageMeta("numbers", "roman");
  const [input, setInput] = createSignal("");

  const result = createMemo((): { output: string; error: string } => {
    const trimmed = input().trim();
    if (!trimmed) return { output: "", error: "" };

    if (isLikelyRoman(trimmed)) {
      const n = fromRoman(trimmed);
      if (isNaN(n)) {
        return { output: "", error: "Invalid Roman numeral" };
      }
      return { output: String(n), error: "" };
    }

    const n = Number(trimmed);
    if (!Number.isInteger(n)) {
      return { output: "", error: "Input must be a whole number between 1 and 3999" };
    }
    const roman = toRoman(n);
    if (!roman) {
      return { output: "", error: "Number must be between 1 and 3999" };
    }
    return { output: roman, error: "" };
  });

  const output = createMemo(() => result().output);
  const error = createMemo(() => result().error);

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Roman numerals"
        description="Convert between Arabic numbers and Roman numerals. Enter a number (1–3999) or a Roman numeral and the direction is detected automatically."
      />

      <div class="grid gap-6 md:grid-cols-2">
        <section class="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? "invalid" : "valid"}
          >
            <TextFieldTextArea
              rows={4}
              placeholder="Enter a number or Roman numeral"
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
              placeholder="Result will appear here"
            />
          </TextField>
          <Show when={!error() && input().trim()}>
            <p class="mt-3 text-sm text-muted-foreground">
              <Show
                when={isLikelyRoman(input().trim())}
                fallback={<span>Roman: <span class="font-mono font-semibold">{output()}</span></span>}
              >
                <span>Arabic: <span class="font-mono font-semibold">{output()}</span></span>
              </Show>
            </p>
          </Show>
        </section>
      </div>
    </main>
  );
}
