import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldInput } from "~/components/ui/text-field";
import { formatDuration, parseDuration, type DurationParts } from "~/lib/utils/datetime/duration";
import { setToolPageMeta } from "~/lib/seo";

export default function DurationTool() {
  setToolPageMeta("datetime", "duration");
  const [input, setInput] = createSignal("");

  const result = createMemo<DurationParts | null>(() => {
    const raw = input().trim();
    if (!raw) return null;
    try {
      return parseDuration(raw);
    } catch {
      return null;
    }
  });

  const error = createMemo<string | null>(() => {
    const raw = input().trim();
    if (!raw) return null;
    try {
      parseDuration(raw);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid duration";
    }
  });

  const humanString = createMemo(() => {
    const r = result();
    if (!r) return "";
    return formatDuration(r);
  });

  const totalMinutes = createMemo(() => {
    const r = result();
    if (!r) return null;
    return (r.totalSeconds / 60).toFixed(4).replace(/\.?0+$/, "");
  });

  const totalHours = createMemo(() => {
    const r = result();
    if (!r) return null;
    return (r.totalSeconds / 3600).toFixed(6).replace(/\.?0+$/, "");
  });

  type Row = { label: string; value: string };

  const breakdownRows = createMemo<Row[]>(() => {
    const r = result();
    if (!r) return [];
    return [
      { label: "Years", value: String(r.years) },
      { label: "Days", value: String(r.days) },
      { label: "Hours", value: String(r.hours) },
      { label: "Minutes", value: String(r.minutes) },
      { label: "Seconds", value: String(r.seconds) },
    ];
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Duration calculator"
        description='Parse durations like "1d 2h 30m", "1:30:00", or raw seconds into a full breakdown.'
      />

      <div class="mx-auto max-w-2xl space-y-6">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <h2 class="mb-4 text-xl font-semibold">Input</h2>
          <TextField
            value={input()}
            onChange={setInput}
            validationState={error() ? "invalid" : "valid"}
          >
            <TextFieldInput
              type="text"
              class="font-mono"
              placeholder='e.g. "1d 2h 30m", "1:30:00", or "3600"'
            />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextField>
          <p class="mt-2 text-xs text-muted-foreground">
            Supports: y/yr/year, d/day, h/hr/hour, m/min/minute, s/sec/second, HH:MM:SS, or plain seconds
          </p>
        </section>

        <Show when={result() !== null && !error()}>
          <section class="rounded-xl border bg-card p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-semibold">Breakdown</h2>
              <CopyButton value={() => humanString()} />
            </div>

            <div class="mb-4 rounded-lg bg-muted/50 px-4 py-3">
              <p class="font-mono text-sm">{humanString()}</p>
            </div>

            <div class="divide-y divide-border rounded-lg border">
              <For each={breakdownRows()}>
                {(row) => (
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="min-w-[80px] text-sm font-medium text-muted-foreground">{row.label}</span>
                    <span class="flex-1 font-mono text-sm">{row.value}</span>
                  </div>
                )}
              </For>
            </div>

            <div class="mt-4 space-y-1">
              <h3 class="mb-2 text-sm font-semibold text-muted-foreground">Totals</h3>
              <div class="divide-y divide-border rounded-lg border">
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="min-w-[100px] text-sm font-medium text-muted-foreground">Total seconds</span>
                  <span class="flex-1 font-mono text-sm">{result()?.totalSeconds}</span>
                  <CopyButton value={() => String(result()?.totalSeconds ?? "")} />
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="min-w-[100px] text-sm font-medium text-muted-foreground">Total minutes</span>
                  <span class="flex-1 font-mono text-sm">{totalMinutes()}</span>
                  <CopyButton value={() => String(totalMinutes() ?? "")} />
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="min-w-[100px] text-sm font-medium text-muted-foreground">Total hours</span>
                  <span class="flex-1 font-mono text-sm">{totalHours()}</span>
                  <CopyButton value={() => String(totalHours() ?? "")} />
                </div>
              </div>
            </div>
          </section>
        </Show>
      </div>
    </main>
  );
}
