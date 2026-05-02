import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { toScientific, fromScientific } from "~/lib/utils/math/scientific-notation";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "toSci" | "fromSci";
const modes: Array<{ id: Mode; label: string }> = [
  { id: "toSci",   label: "Standard → Scientific" },
  { id: "fromSci", label: "Scientific → Standard" },
];

export default function ScientificNotation() {
  setToolPageMeta("math", "scientific-notation");
  const [params, setParams] = useSearchParams<{ mode?: string }>();
  const mode = createMemo<Mode>(() => (params.mode === "fromSci" ? "fromSci" : "toSci"));

  const [standard, setStandard] = createSignal("299792458");
  const [coeff, setCoeff] = createSignal("2.99792458");
  const [exp, setExp] = createSignal("8");

  const sciResult = createMemo(() => {
    const v = parseFloat(standard());
    if (isNaN(v)) return null;
    return toScientific(v);
  });

  const stdResult = createMemo(() => {
    const c = parseFloat(coeff()), e = parseFloat(exp());
    if (isNaN(c) || isNaN(e)) return null;
    return fromScientific(c, e);
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Scientific notation"
        description="Convert numbers between standard decimal and scientific notation."
      />

      <div class="mb-6 flex gap-2">
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
              onClick={() => setParams({ mode: m.id })}
            >
              {m.label}
            </button>
          )}
        </For>
      </div>

      <Show when={mode() === "toSci"}>
        <div class="grid gap-6 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-5 shadow-sm">
            <h2 class="mb-4 text-base font-semibold">Standard number</h2>
            <NumberField
              value={standard()}
              onChange={setStandard}
              format={false}
              class="flex flex-col gap-1"
            >
              <NumberFieldLabel>Value</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput placeholder="299792458" class="font-mono" />
                <NumberFieldIncrementTrigger />
                <NumberFieldDecrementTrigger />
              </NumberFieldGroup>
            </NumberField>
          </section>
          <section class="rounded-xl border bg-card p-5 shadow-sm">
            <h2 class="mb-4 text-base font-semibold">Scientific notation</h2>
            <Show
              when={sciResult()}
              fallback={<p class="text-sm text-muted-foreground">Enter a number.</p>}
            >
              {(r) => (
                <div class="divide-y divide-border rounded-lg border text-sm">
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Coefficient</span>
                    <span class="font-mono">{r().coefficient}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Exponent</span>
                    <span class="font-mono">{r().exponent}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Scientific</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono">{r().formatted}</span>
                      <CopyButton value={() => r().formatted} />
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4 px-4 py-3">
                    <span class="text-muted-foreground">Engineering</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono">{r().engineering}</span>
                      <CopyButton value={() => r().engineering} />
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </section>
        </div>
      </Show>

      <Show when={mode() === "fromSci"}>
        <div class="grid gap-6 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-5 shadow-sm">
            <h2 class="mb-4 text-base font-semibold">Scientific notation</h2>
            <div class="flex items-end gap-3">
              <NumberField
                value={coeff()}
                onChange={setCoeff}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldLabel>Coefficient</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="2.998" class="font-mono w-32" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
              <span class="pb-2 font-mono text-muted-foreground">× 10^</span>
              <NumberField
                value={exp()}
                onChange={setExp}
                format={false}
                class="flex flex-col gap-1"
              >
                <NumberFieldLabel>Exponent</NumberFieldLabel>
                <NumberFieldGroup>
                  <NumberFieldInput placeholder="8" class="font-mono w-20" />
                  <NumberFieldIncrementTrigger />
                  <NumberFieldDecrementTrigger />
                </NumberFieldGroup>
              </NumberField>
            </div>
          </section>
          <section class="rounded-xl border bg-card p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-base font-semibold">Standard number</h2>
              <Show when={stdResult() !== null}>
                <CopyButton value={() => String(stdResult())} />
              </Show>
            </div>
            <Show
              when={stdResult() !== null}
              fallback={<p class="text-sm text-muted-foreground">Enter values.</p>}
            >
              <div class="rounded-lg bg-muted/50 p-4 font-mono text-xl break-all">
                {stdResult()}
              </div>
            </Show>
          </section>
        </div>
      </Show>
    </main>
  );
}
