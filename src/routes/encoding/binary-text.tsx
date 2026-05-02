import { createEffect, createMemo, createSignal, For } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";
import {
  type BinaryMode,
  textToBinary, binaryToText,
  textToHex, hexToText,
  textToDecimal, decimalToText,
} from "~/lib/utils/encoding/binary-text";

type Dir = "encode" | "decode";

const modes: { label: string; value: BinaryMode }[] = [
  { label: "Binary", value: "binary" },
  { label: "Hex", value: "hex" },
  { label: "Decimal", value: "decimal" },
];

function encode(s: string, mode: BinaryMode): string {
  if (mode === "binary") return textToBinary(s);
  if (mode === "hex") return textToHex(s);
  return textToDecimal(s);
}

function decode(s: string, mode: BinaryMode): string {
  if (mode === "binary") return binaryToText(s);
  if (mode === "hex") return hexToText(s);
  return decimalToText(s);
}

export default function BinaryTextTool() {
  setToolPageMeta("encoding", "binary-text");
  const [params, setParams] = useSearchParams<{ mode?: string; dir?: string }>();

  const initialMode = (["binary", "hex", "decimal"] as BinaryMode[]).includes(
    params.mode as BinaryMode,
  )
    ? (params.mode as BinaryMode)
    : "binary";

  const [input, setInput] = createSignal("");
  const [binaryMode, setBinaryMode] = createSignal<BinaryMode>(initialMode);
  const [dir, setDir] = createSignal<Dir>(params.dir === "decode" ? "decode" : "encode");
  const [error, setError] = createSignal<string | null>(null);

  const output = createMemo(() => {
    if (!input()) return "";
    try {
      return dir() === "encode"
        ? encode(input(), binaryMode())
        : decode(input(), binaryMode());
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
      dir() === "encode"
        ? encode(input(), binaryMode())
        : decode(input(), binaryMode());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    }
  });

  function handleMode(m: BinaryMode) {
    setBinaryMode(m);
    setParams({ mode: m });
  }

  function handleDir(d: Dir) {
    setDir(d);
    setParams({ dir: d });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="encoding"
        name="Binary / Text"
        description="Convert text to binary, hexadecimal, or decimal byte representations and back."
      />

      <div class="mb-4 flex flex-wrap gap-3">
        <div class="flex gap-2">
          <For each={modes}>
            {(m) => (
              <button
                type="button"
                class={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                  binaryMode() === m.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input hover:border-primary/50 hover:bg-accent/30",
                )}
                onClick={() => handleMode(m.value)}
              >
                {m.label}
              </button>
            )}
          </For>
        </div>

        <div class="flex gap-2">
          <For each={["encode", "decode"] as Dir[]}>
            {(d) => (
              <button
                type="button"
                class={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                  dir() === d
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-input hover:border-primary/50 hover:bg-accent/30",
                )}
                onClick={() => handleDir(d)}
              >
                {d === "encode" ? "Text → Encoding" : "Encoding → Text"}
              </button>
            )}
          </For>
        </div>
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
              placeholder={
                dir() === "encode"
                  ? "Enter text to encode…"
                  : `Enter space-separated ${binaryMode()} values…`
              }
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
