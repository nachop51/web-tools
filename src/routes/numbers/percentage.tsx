import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, Switch, Match } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
  NumberFieldLabel,
} from "~/components/ui/number-field";
import {
  percentOf,
  whatPercent,
  percentChange,
  percentError,
} from "~/lib/utils/numbers/percentage";
import { cn } from "~/lib/utils";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "of" | "what" | "change" | "error";

const modes: { value: Mode; label: string }[] = [
  { value: "of", label: "X% of Y" },
  { value: "what", label: "What %" },
  { value: "change", label: "% Change" },
  { value: "error", label: "% Error" },
];

function fmtResult(n: number): string {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toPrecision(8)).toString();
}

export default function PercentageCalculator() {
  setToolPageMeta("numbers", "percentage");
  const [params, setParams] = useSearchParams<{ mode?: string }>();

  const initialMode = (["of", "what", "change", "error"].includes(params.mode ?? "")
    ? params.mode
    : "of") as Mode;

  const [mode, setMode] = createSignal<Mode>(initialMode);
  const [a, setA] = createSignal("");
  const [b, setB] = createSignal("");

  const numA = createMemo(() => parseFloat(a()));
  const numB = createMemo(() => parseFloat(b()));

  const result = createMemo((): string => {
    const na = numA();
    const nb = numB();
    const m = mode();
    if (isNaN(na) || isNaN(nb)) return "—";
    if (m === "of") return fmtResult(percentOf(na, nb));
    if (m === "what") return fmtResult(whatPercent(na, nb));
    if (m === "change") return fmtResult(percentChange(na, nb));
    return fmtResult(percentError(na, nb));
  });

  function handleModeChange(m: Mode) {
    setMode(m);
    setParams({ mode: m });
    setA("");
    setB("");
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="Percentage calculator"
        description="Solve X% of Y, what % is X of Y, percentage change, and percent error."
      />

      <div class="space-y-6">
        <div class="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              type="button"
              class={cn(
                "px-4 py-2 text-sm font-medium border rounded-md transition-colors",
                "hover:border-primary/60 hover:bg-primary/10",
                mode() === m.value
                  ? "border-primary bg-primary/15"
                  : "border-input bg-background",
              )}
              onClick={() => handleModeChange(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Switch>
                <Match when={mode() === "of"}>X% of Y</Match>
                <Match when={mode() === "what"}>What % is X of Y?</Match>
                <Match when={mode() === "change"}>Percentage change</Match>
                <Match when={mode() === "error"}>Percentage error</Match>
              </Switch>
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Switch>
              <Match when={mode() === "of"}>
                <NumberField
                  value={a()}
                  onChange={setA}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Percentage (%)</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 25" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <NumberField
                  value={b()}
                  onChange={setB}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Of what number?</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 200" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </Match>
              <Match when={mode() === "what"}>
                <NumberField
                  value={a()}
                  onChange={setA}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Part</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 50" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <NumberField
                  value={b()}
                  onChange={setB}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Whole</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 200" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </Match>
              <Match when={mode() === "change"}>
                <NumberField
                  value={a()}
                  onChange={setA}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>From</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 100" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <NumberField
                  value={b()}
                  onChange={setB}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>To</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 150" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </Match>
              <Match when={mode() === "error"}>
                <NumberField
                  value={a()}
                  onChange={setA}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Measured value</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 9.8" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
                <NumberField
                  value={b()}
                  onChange={setB}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldLabel>Actual value</NumberFieldLabel>
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 10" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </Match>
            </Switch>

            <div class="mt-4 rounded-md bg-muted px-4 py-3">
              <p class="text-xs text-muted-foreground mb-1">Result</p>
              <p class="font-mono text-2xl font-semibold">
                <Switch>
                  <Match when={mode() === "of"}>
                    {result()}
                  </Match>
                  <Match when={mode() !== "of"}>
                    {result() !== "—" ? `${result()}%` : "—"}
                  </Match>
                </Switch>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
