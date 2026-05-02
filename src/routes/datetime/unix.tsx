import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldInput } from "~/components/ui/text-field";
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { formatRelative, isoToUnix, unixToInfo } from "~/lib/utils/datetime/unix";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "toDate" | "toTimestamp";

export default function UnixTool() {
  setToolPageMeta("datetime", "unix");
  const [mode, setMode] = createSignal<Mode>("toDate");
  const [tsInput, setTsInput] = createSignal("");
  const [isoInput, setIsoInput] = createSignal("");

  onMount(() => {
    setTsInput(String(Math.floor(Date.now() / 1000)));
  });

  const tsInfo = createMemo(() => {
    const raw = tsInput().trim();
    if (!raw) return null;
    const n = Number(raw);
    if (isNaN(n)) return null;
    try {
      return unixToInfo(n);
    } catch {
      return null;
    }
  });

  const relativeLabel = createMemo(() => {
    const raw = tsInput().trim();
    if (!raw) return "";
    const n = Number(raw);
    if (isNaN(n)) return "";
    try {
      return formatRelative(n);
    } catch {
      return "";
    }
  });

  const tsError = createMemo(() => {
    const raw = tsInput().trim();
    if (!raw) return null;
    if (isNaN(Number(raw))) return "Must be a number";
    return null;
  });

  const isoResult = createMemo<{ unix: number; ms: number } | null>(() => {
    const raw = isoInput().trim();
    if (!raw) return null;
    try {
      const unix = isoToUnix(raw);
      return { unix, ms: unix * 1000 };
    } catch {
      return null;
    }
  });

  const isoError = createMemo(() => {
    const raw = isoInput().trim();
    if (!raw) return null;
    try {
      isoToUnix(raw);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid date string";
    }
  });

  const infoRows = createMemo(() => {
    const info = tsInfo();
    if (!info) return [];
    return [
      { label: "ISO 8601", value: info.iso },
      { label: "UTC", value: info.utc },
      { label: "Local", value: info.local },
      { label: "Weekday", value: info.weekday },
      { label: "Milliseconds", value: String(info.unixMs) },
    ];
  });

  const modes: { id: Mode; label: string }[] = [
    { id: "toDate", label: "Timestamp → Date" },
    { id: "toTimestamp", label: "Date → Timestamp" },
  ];

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Unix timestamp"
        description="Convert Unix timestamps to human-readable dates and ISO strings, or parse a date back to a Unix timestamp."
      />

      <div class="mb-4 flex gap-2">
        <For each={modes}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                mode() === m.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          )}
        </For>
      </div>

      <Show when={mode() === "toDate"}>
        <div class="grid gap-6 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-6 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold">Unix timestamp (seconds)</h2>
            <NumberField
              value={tsInput()}
              onChange={setTsInput}
              format={false}
              validationState={tsError() ? "invalid" : "valid"}
              class="flex flex-col gap-1"
            >
              <NumberFieldGroup>
                <NumberFieldInput
                  class="font-mono"
                  placeholder="e.g. 1705315800"
                />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
              <NumberFieldErrorMessage>{tsError()}</NumberFieldErrorMessage>
            </NumberField>
            <button
              type="button"
              class="mt-3 rounded-md border-2 border-input px-3 py-1 text-sm hover:border-primary/50 hover:bg-accent/30 transition-colors"
              onClick={() => {
                if (typeof window !== "undefined") {
                  setTsInput(String(Math.floor(Date.now() / 1000)));
                }
              }}
            >
              Now
            </button>
            <Show when={relativeLabel()}>
              <p class="mt-3 text-sm text-muted-foreground">{relativeLabel()}</p>
            </Show>
          </section>

          <section class="rounded-xl border bg-card p-6 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold">Date breakdown</h2>
            <Show
              when={tsInfo()}
              fallback={<p class="text-sm text-muted-foreground">Enter a timestamp to see results.</p>}
            >
              <div class="divide-y divide-border rounded-lg border">
                <For each={infoRows()}>
                  {(row) => (
                    <div class="flex items-center justify-between gap-4 px-4 py-3">
                      <span class="min-w-[90px] text-sm font-medium text-muted-foreground">{row.label}</span>
                      <span class="flex-1 truncate font-mono text-sm">{row.value}</span>
                      <CopyButton value={() => row.value} />
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </section>
        </div>
      </Show>

      <Show when={mode() === "toTimestamp"}>
        <div class="grid gap-6 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-6 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold">Date / ISO string</h2>
            <TextField
              value={isoInput()}
              onChange={setIsoInput}
              validationState={isoError() ? "invalid" : "valid"}
            >
              <TextFieldInput
                type="text"
                class="font-mono"
                placeholder="e.g. 2024-01-15T10:30:00Z"
              />
              <TextFieldErrorMessage>{isoError()}</TextFieldErrorMessage>
            </TextField>
          </section>

          <section class="rounded-xl border bg-card p-6 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold">Unix timestamp</h2>
            <Show
              when={isoResult()}
              fallback={<p class="text-sm text-muted-foreground">Enter a date to see results.</p>}
            >
              {(result) => (
                <div class="divide-y divide-border rounded-lg border">
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="min-w-[90px] text-sm font-medium text-muted-foreground">Seconds</span>
                    <span class="flex-1 truncate font-mono text-sm">{result().unix}</span>
                    <CopyButton value={() => String(result().unix)} />
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="min-w-[90px] text-sm font-medium text-muted-foreground">Milliseconds</span>
                    <span class="flex-1 truncate font-mono text-sm">{result().ms}</span>
                    <CopyButton value={() => String(result().ms)} />
                  </div>
                </div>
              )}
            </Show>
          </section>
        </div>
      </Show>
    </main>
  );
}
