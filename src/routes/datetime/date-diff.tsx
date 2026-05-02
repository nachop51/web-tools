import { createMemo, createSignal, For, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { TextField, TextFieldInput, TextFieldLabel } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { dateDiff, ageFrom, type DateDiffResult } from "~/lib/utils/datetime/date-diff";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "diff" | "age";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DateDiffTool() {
  setToolPageMeta("datetime", "date-diff");
  const [params, setParams] = useSearchParams<{
    from?: string;
    to?: string;
    mode?: string;
  }>();

  const [mode, setMode] = createSignal<Mode>(
    params.mode === "age" ? "age" : "diff",
  );
  const [from, setFrom] = createSignal(params.from ?? "");
  const [to, setTo] = createSignal(params.to ?? "");

  function handleFrom(v: string) {
    setFrom(v);
    setParams({ from: v });
  }

  function handleTo(v: string) {
    setTo(v);
    setParams({ to: v });
  }

  function handleMode(m: Mode) {
    setMode(m);
    setParams({ mode: m });
  }

  function useToday() {
    handleTo(todayStr());
  }

  const result = createMemo<DateDiffResult | null>(() => {
    const f = from();
    const t = to();
    if (!f || !t) return null;
    const dFrom = new Date(f);
    const dTo = new Date(t);
    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) return null;
    try {
      return mode() === "age" ? ageFrom(dFrom, dTo) : dateDiff(dFrom, dTo);
    } catch {
      return null;
    }
  });

  type BreakdownRow = { label: string; value: number };

  const breakdownRows = createMemo<BreakdownRow[]>(() => {
    const r = result();
    if (!r) return [];
    return [
      { label: "Years", value: r.years },
      { label: "Months", value: r.months },
      { label: "Days", value: r.days },
      { label: "Hours", value: r.hours },
      { label: "Minutes", value: r.minutes },
      { label: "Seconds", value: r.seconds },
    ];
  });

  const summaryText = createMemo(() => {
    const r = result();
    if (!r) return "";
    const parts: string[] = [];
    if (r.years) parts.push(`${r.years} year${r.years !== 1 ? "s" : ""}`);
    if (r.months) parts.push(`${r.months} month${r.months !== 1 ? "s" : ""}`);
    if (r.days) parts.push(`${r.days} day${r.days !== 1 ? "s" : ""}`);
    if (parts.length === 0) parts.push("0 days");
    return parts.join(", ");
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Date difference"
        description="Calculate the exact difference between two dates, or compute someone's age."
      />

      <div class="mb-6 flex gap-2">
        <For each={["diff", "age"] as Mode[]}>
          {(m) => (
            <button
              type="button"
              class={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium border-2 transition-colors",
                mode() === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-input hover:border-primary/50 hover:bg-accent/30",
              )}
              onClick={() => handleMode(m)}
            >
              {m === "diff" ? "Date difference" : "Age calculator"}
            </button>
          )}
        </For>
      </div>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-2">
            <TextField value={from()} onChange={handleFrom}>
              <TextFieldLabel>
                {mode() === "age" ? "Birthdate" : "From"}
              </TextFieldLabel>
              <TextFieldInput type="date" />
            </TextField>

            <div class="space-y-1.5">
              <TextField value={to()} onChange={handleTo}>
                <TextFieldLabel>To</TextFieldLabel>
                <TextFieldInput type="date" />
              </TextField>
              <button
                type="button"
                class="text-xs text-muted-foreground underline-offset-2 hover:underline"
                onClick={useToday}
              >
                Use today
              </button>
            </div>
          </CardContent>
        </Card>

        <Show when={result() !== null}>
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Breakdown</CardTitle>
                <CopyButton value={() => summaryText()} />
              </div>
            </CardHeader>
            <CardContent>
              <div class="mb-4 rounded-lg bg-muted/50 px-4 py-3">
                <p class="font-mono text-sm">{summaryText()}</p>
              </div>

              <div class="divide-y divide-border rounded-lg border">
                <For each={breakdownRows()}>
                  {(row) => (
                    <div class="flex items-center justify-between gap-4 px-4 py-3">
                      <span class="min-w-[80px] text-sm font-medium text-muted-foreground">
                        {row.label}
                      </span>
                      <span class="flex-1 font-mono text-sm">{row.value}</span>
                    </div>
                  )}
                </For>
              </div>

              <div class="mt-4">
                <h3 class="mb-2 text-sm font-semibold text-muted-foreground">Totals</h3>
                <div class="divide-y divide-border rounded-lg border">
                  <For
                    each={[
                      { label: "Total days", value: () => String(result()?.totalDays ?? "") },
                      { label: "Total hours", value: () => String(result()?.totalHours ?? "") },
                      { label: "Total minutes", value: () => String(result()?.totalMinutes ?? "") },
                      { label: "Total seconds", value: () => String(result()?.totalSeconds ?? "") },
                    ]}
                  >
                    {(row) => (
                      <div class="flex items-center justify-between gap-4 px-4 py-3">
                        <span class="min-w-[120px] text-sm font-medium text-muted-foreground">
                          {row.label}
                        </span>
                        <span class="flex-1 font-mono text-sm">{row.value()}</span>
                        <CopyButton value={row.value} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </CardContent>
          </Card>
        </Show>
      </div>
    </main>
  );
}
