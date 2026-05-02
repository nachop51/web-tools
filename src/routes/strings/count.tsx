import { createMemo, createSignal, For } from "solid-js";
import { Card, CardContent } from "~/components/ui/card";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import { ToolHeader } from "~/components/tool-header";
import { setToolPageMeta } from "~/lib/seo";
import {
  countBytes,
  countChars,
  countCharsNoSpaces,
  countLines,
  countParagraphs,
  countSentences,
  countWords,
} from "~/lib/utils/strings/count";

const statDefs = [
  { key: "chars" as const, label: "Characters" },
  { key: "noSpaces" as const, label: "No spaces" },
  { key: "words" as const, label: "Words" },
  { key: "lines" as const, label: "Lines" },
  { key: "bytes" as const, label: "Bytes" },
  { key: "sentences" as const, label: "Sentences" },
  { key: "paragraphs" as const, label: "Paragraphs" },
];

export default function CharacterCount() {
  setToolPageMeta("strings", "count");
  const [text, setText] = createSignal("");

  const stats = createMemo(() => ({
    chars: countChars(text()),
    noSpaces: countCharsNoSpaces(text()),
    words: countWords(text()),
    lines: countLines(text()),
    bytes: countBytes(text()),
    sentences: countSentences(text()),
    paragraphs: countParagraphs(text()),
  }));

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="strings"
        name="Character count"
        description="Count characters, words, lines, bytes, sentences, and paragraphs."
      />

      <TextField value={text()} onChange={setText}>
        <TextFieldTextArea
          rows={10}
          placeholder="Paste text here…"
          class="w-full resize-y"
        />
      </TextField>

      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <For each={statDefs}>
          {(def) => (
            <Card>
              <CardContent class="pt-4 text-center">
                <p class="text-3xl font-semibold tabular-nums">
                  {stats()[def.key]}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">{def.label}</p>
              </CardContent>
            </Card>
          )}
        </For>
      </div>
    </main>
  );
}
