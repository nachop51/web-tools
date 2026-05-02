import { useSearchParams } from "@solidjs/router";
import { createMemo, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldInput } from "~/components/ui/text-field";
import { describeCron, nextRuns, parseCron } from "~/lib/utils/datetime/cron";
import { setToolPageMeta } from "~/lib/seo";

export default function CronPreview() {
  setToolPageMeta("datetime", "cron");
  const [params, setParams] = useSearchParams<{ expr?: string }>();

  const expr = createMemo(() => params.expr ?? "0 * * * *");

  const parsed = createMemo(() => {
    try {
      return { fields: parseCron(expr()), error: null };
    } catch (e) {
      return { fields: null, error: e instanceof Error ? e.message : "Invalid cron expression" };
    }
  });

  const description = createMemo(() => {
    const { fields } = parsed();
    if (!fields) return "";
    return describeCron(fields);
  });

  const runs = createMemo(() => {
    const { fields } = parsed();
    if (!fields) return [];
    return nextRuns(fields, new Date(), 10);
  });

  const localFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const utcFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="datetime"
        name="Cron preview"
        description="Parse a cron expression and preview the next run times in local and UTC."
      />

      <div class="mx-auto max-w-3xl space-y-6">
        <section class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <TextField
            value={expr()}
            onChange={(v) => setParams({ expr: v })}
            validationState={parsed().error ? "invalid" : "valid"}
          >
            <TextFieldInput
              type="text"
              class="font-mono text-base"
              placeholder="0 * * * *"
            />
            <TextFieldErrorMessage>{parsed().error}</TextFieldErrorMessage>
          </TextField>

          <Show when={description()}>
            <p class="mt-3 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">Meaning: </span>
              {description()}
            </p>
          </Show>

          <p class="mt-2 text-xs text-muted-foreground">
            5-field standard cron: minute hour day-of-month month day-of-week
          </p>
        </section>

        <Show when={parsed().fields !== null && runs().length > 0}>
          <section class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-border">
              <h2 class="text-base font-semibold">Next 10 runs</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border bg-muted/30">
                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-8">#</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Local time</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground">UTC</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={runs()}>
                    {(date, i) => (
                      <tr class="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{i() + 1}</td>
                        <td class="px-4 py-2.5 font-mono">{localFormatter.format(date)}</td>
                        <td class="px-4 py-2.5 font-mono text-muted-foreground">{utcFormatter.format(date)}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </section>
        </Show>
      </div>
    </main>
  );
}
