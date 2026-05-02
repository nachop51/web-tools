import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from "~/components/ui/text-field";
import { cn } from "~/lib/utils";
import { testRegex } from "~/lib/utils/code/regex";
import { setToolPageMeta } from "~/lib/seo";

const FLAG_DEFS = [
  { key: "g", label: "g", title: "Global" },
  { key: "i", label: "i", title: "Case insensitive" },
  { key: "m", label: "m", title: "Multiline" },
  { key: "s", label: "s", title: "Dot all" },
] as const;

type FlagKey = "g" | "i" | "m" | "s";

export default function RegexTester() {
  setToolPageMeta("code", "regex");
  const [params, setParams] = useSearchParams<{ p?: string; flags?: string }>();

  const [pattern, setPattern] = createSignal(params.p ?? "");
  const [flags, setFlags] = createSignal<Set<FlagKey>>(
    new Set((params.flags ?? "g").split("").filter((f): f is FlagKey =>
      ["g", "i", "m", "s"].includes(f)
    ) as FlagKey[])
  );
  const [input, setInput] = createSignal("");

  function toggleFlag(f: FlagKey) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      setParams({ flags: [...next].join("") });
      return next;
    });
  }

  function handlePatternChange(val: string) {
    setPattern(val);
    setParams({ p: val });
  }

  const flagStr = createMemo(() => [...flags()].join(""));

  const result = createMemo(() => testRegex(pattern(), flagStr(), input()));

  return (
    <main class="w-full max-w-4xl py-10">
      <ToolHeader
        category="code"
        name="Regex tester"
        description="Test regular expressions with live match highlighting and group capture."
      />

      <div class="mb-6 space-y-4">
        <div class="flex gap-3 items-end flex-wrap">
          <div class="flex-1 min-w-48">
            <TextField value={pattern()} onChange={handlePatternChange}>
              <TextFieldLabel>Pattern</TextFieldLabel>
              <TextFieldInput
                placeholder="e.g. \d+"
                class={cn("font-mono", result().error && "border-destructive")}
              />
            </TextField>
          </div>

          <div class="flex gap-2 pb-0.5">
            <For each={FLAG_DEFS}>
              {(f) => (
                <button
                  type="button"
                  title={f.title}
                  class={cn(
                    "rounded border-2 px-2.5 py-1.5 text-sm font-mono font-semibold transition-colors",
                    flags().has(f.key)
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input hover:border-primary/50 hover:bg-accent/30",
                  )}
                  onClick={() => toggleFlag(f.key)}
                >
                  {f.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <Show when={result().error}>
          {(err) => (
            <div class="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span class="font-semibold">Regex error:</span> {err()}
            </div>
          )}
        </Show>

        <TextField value={input()} onChange={setInput}>
          <TextFieldLabel>Test input</TextFieldLabel>
          <TextFieldTextArea
            rows={6}
            class="font-mono text-sm"
            placeholder="Enter text to test against…"
          />
        </TextField>
      </div>

      <div class="rounded-xl border bg-card p-5 shadow-sm">
        <div class="mb-3 flex items-center gap-3">
          <h2 class="text-base font-semibold">Matches</h2>
          <Show when={result().matches.length > 0}>
            <span class="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {result().matches.length}
            </span>
          </Show>
        </div>

        <Show
          when={result().matches.length > 0}
          fallback={
            <p class="text-sm text-muted-foreground">
              <Show when={pattern() && !result().error} fallback="Enter a pattern above to start matching.">
                No matches found.
              </Show>
            </p>
          }
        >
          <div class="space-y-2">
            <For each={result().matches}>
              {(match, i) => (
                <div class="rounded-md border bg-muted/30 px-3 py-2 text-sm font-mono">
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-muted-foreground">#{i() + 1}</span>
                    <span class="text-xs text-muted-foreground">index {match.index}</span>
                    <span class="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{match.fullMatch}</span>
                  </div>
                  <Show when={match.groups.length > 0}>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
                      <For each={match.groups}>
                        {(g, gi) => (
                          <span class="text-xs">
                            <span class="text-muted-foreground">group {gi() + 1}:</span>{" "}
                            <span class="rounded bg-muted px-1">{g === "" ? <em class="opacity-50">empty</em> : g}</span>
                          </span>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </main>
  );
}
