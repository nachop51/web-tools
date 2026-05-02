import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
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
} from "~/components/ui/number-field";
import { Separator } from "~/components/ui/separator";
import { gcdMany, lcmMany, gcdSteps } from "~/lib/utils/numbers/gcf-lcm";
import { setToolPageMeta } from "~/lib/seo";

function parseNums(s: string): number[] {
  return s
    .split(",")
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !isNaN(n) && n !== 0);
}

export default function GcfLcm() {
  setToolPageMeta("numbers", "gcf-lcm");
  const [params, setParams] = useSearchParams<{ nums?: string }>();

  const initialNums = params.nums
    ? parseNums(params.nums)
    : [12, 8];

  const [nums, setNums] = createSignal<string[]>(
    initialNums.map(String),
  );
  const [showSteps, setShowSteps] = createSignal(false);

  const parsedNums = createMemo(() =>
    nums()
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n !== 0),
  );

  const gcf = createMemo(() => {
    const ns = parsedNums();
    if (ns.length < 1) return null;
    return gcdMany(ns);
  });

  const lcm = createMemo(() => {
    const ns = parsedNums();
    if (ns.length < 1) return null;
    return lcmMany(ns);
  });

  const steps = createMemo(() => {
    const ns = parsedNums();
    if (ns.length < 2) return [];
    return gcdSteps(ns[0], ns[1]);
  });

  function updateNum(i: number, val: string) {
    const updated = nums().map((n, idx) => (idx === i ? val : n));
    setNums(updated);
    const valid = updated.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n !== 0);
    setParams({ nums: valid.join(",") });
  }

  function addNum() {
    setNums([...nums(), ""]);
  }

  function removeNum(i: number) {
    if (nums().length <= 1) return;
    const updated = nums().filter((_, idx) => idx !== i);
    setNums(updated);
    const valid = updated.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n !== 0);
    setParams({ nums: valid.join(",") });
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="numbers"
        name="GCF / LCM"
        description="Find the Greatest Common Factor and Least Common Multiple of two or more integers."
      />

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Numbers</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <For each={nums()}>
              {(val, i) => (
                <div class="flex items-center gap-2">
                  <NumberField
                    value={val}
                    onChange={(v) => updateNum(i(), v)}
                    step={1}
                    format={false}
                    class="flex flex-1 flex-col gap-1"
                  >
                    <NumberFieldGroup>
                      <NumberFieldInput placeholder={`Number ${i() + 1}`} />
                      <NumberFieldIncrementTrigger />
                      <NumberFieldDecrementTrigger />
                    </NumberFieldGroup>
                  </NumberField>
                  <Show when={nums().length > 1}>
                    <button
                      type="button"
                      class="text-sm text-muted-foreground hover:text-destructive transition-colors px-2"
                      onClick={() => removeNum(i())}
                    >
                      Remove
                    </button>
                  </Show>
                </div>
              )}
            </For>
            <button
              type="button"
              class="text-sm text-primary hover:underline"
              onClick={addNum}
            >
              + Add number
            </button>
          </CardContent>
        </Card>

        <Show when={parsedNums().length > 0}>
          <div class="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle class="text-base">Greatest Common Factor (GCF)</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="font-mono text-3xl font-bold text-primary">
                  {gcf() ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle class="text-base">Least Common Multiple (LCM)</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="font-mono text-3xl font-bold text-primary">
                  {lcm() ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        </Show>

        <Show when={parsedNums().length >= 2}>
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-base">
                  Euclidean steps for GCD({parsedNums()[0]}, {parsedNums()[1]})
                </CardTitle>
                <button
                  type="button"
                  class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowSteps((s) => !s)}
                >
                  {showSteps() ? "Hide" : "Show"}
                </button>
              </div>
            </CardHeader>
            <Show when={showSteps()}>
              <CardContent>
                <Show
                  when={steps().length > 0}
                  fallback={<p class="text-sm text-muted-foreground">No steps (one divides the other).</p>}
                >
                  <div class="space-y-1">
                    <For each={steps()}>
                      {(step) => (
                        <div class="font-mono text-sm py-1 flex gap-2">
                          <span class="text-muted-foreground">
                            {step.a} = {Math.floor(step.a / step.b)} × {step.b} + {step.remainder}
                          </span>
                        </div>
                      )}
                    </For>
                    <Separator class="my-2" />
                    <p class="text-sm text-muted-foreground">
                      GCD = <span class="font-mono font-semibold text-foreground">{gcf()}</span>
                    </p>
                  </div>
                </Show>
              </CardContent>
            </Show>
          </Card>
        </Show>
      </div>
    </main>
  );
}
