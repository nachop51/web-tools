import { createSignal, For, onMount } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldTextArea } from "~/components/ui/text-field";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
} from "~/components/ui/number-field";
import { generateUuid } from "~/lib/utils/code/uuid";
import { setToolPageMeta } from "~/lib/seo";

export default function UuidTool() {
  setToolPageMeta("code", "uuid");
  const [single, setSingle] = createSignal("");
  const [count, setCount] = createSignal(10);
  const [list, setList] = createSignal<string[]>([]);

  onMount(() => {
    setSingle(generateUuid());
  });

  function refreshSingle() {
    setSingle(generateUuid());
  }

  function generateList() {
    const n = Math.max(1, Math.min(count(), 1000));
    setList(Array.from({ length: n }, () => generateUuid()));
  }

  return (
    <main class="w-full max-w-2xl py-10">
      <ToolHeader
        category="code"
        name="UUID generator"
        description="Generate random UUID v4 values using the browser's crypto API."
      />

      <section class="mb-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Single UUID
        </h2>
        <div class="flex items-center gap-3">
          <code class="flex-1 rounded-md border border-input bg-muted px-4 py-2.5 font-mono text-sm tracking-wide">
            {single()}
          </code>
          <CopyButton value={() => single()} />
        </div>
        <button
          type="button"
          class="mt-3 rounded-md border-2 border-input px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent/30"
          onClick={refreshSingle}
        >
          Generate
        </button>
      </section>

      <section class="rounded-xl border bg-card p-6 shadow-sm">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Bulk generate
        </h2>
        <div class="mb-3 flex items-center gap-3">
          <NumberField
            rawValue={count()}
            onRawValueChange={(v) => setCount(Number.isFinite(v) ? v : 10)}
            minValue={1}
            maxValue={1000}
            format={false}
            class="w-24"
          >
            <NumberFieldGroup>
              <NumberFieldInput class="font-mono" />
              <NumberFieldIncrementTrigger />
              <NumberFieldDecrementTrigger />
            </NumberFieldGroup>
          </NumberField>
          <button
            type="button"
            class="rounded-md border-2 border-input px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent/30"
            onClick={generateList}
          >
            Generate
          </button>
          <CopyButton value={() => list().join("\n")} />
        </div>
        <TextField>
          <TextFieldTextArea
            readOnly
            value={list().join("\n")}
            rows={12}
            class="font-mono text-sm"
            placeholder="Generated UUIDs will appear here…"
          />
        </TextField>
        <p class="mt-2 text-xs text-muted-foreground">
          {list().length > 0 ? `${list().length} UUIDs` : "No UUIDs generated yet"}
        </p>
      </section>
    </main>
  );
}
