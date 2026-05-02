import { createMemo, createSignal } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { ToolHeader } from "~/components/tool-header";
import { CopyButton } from "~/components/copy-button";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldDecrementTrigger,
  NumberFieldInput,
} from "~/components/ui/number-field";
import { cn } from "~/lib/utils";
import { applyDiscount, applyTax } from "~/lib/utils/finance/discount";
import { setToolPageMeta } from "~/lib/seo";

type Mode = "discount" | "tax";

const modes: { value: Mode; label: string }[] = [
  { value: "discount", label: "Discount" },
  { value: "tax",      label: "Sales tax" },
];

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(2);
}

export default function DiscountCalculator() {
  setToolPageMeta("finance", "discount");
  const [params, setParams] = useSearchParams<{ mode?: string }>();

  const mode = createMemo<Mode>(() =>
    params.mode === "tax" ? "tax" : "discount",
  );

  const [price, setPrice] = createSignal("");
  const [pct, setPct] = createSignal("");

  const discountResult = createMemo(() => {
    if (mode() !== "discount") return null;
    const p = parseFloat(price());
    const d = parseFloat(pct());
    if (!isFinite(p) || p < 0 || !isFinite(d) || d < 0) return null;
    return applyDiscount(p, d);
  });

  const taxResult = createMemo(() => {
    if (mode() !== "tax") return null;
    const p = parseFloat(price());
    const t = parseFloat(pct());
    if (!isFinite(p) || p < 0 || !isFinite(t) || t < 0) return null;
    return applyTax(p, t);
  });

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="finance"
        name="Discount & sales tax"
        description="Apply a percentage discount or sales tax to a price."
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
              onClick={() => {
                setParams({ mode: m.value });
                setPrice("");
                setPct("");
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <section class="rounded-xl border bg-card p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold">
              {mode() === "discount" ? "Discount" : "Sales tax"}
            </h2>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-sm font-medium">
                  {mode() === "discount" ? "Original price ($)" : "Pre-tax price ($)"}
                </label>
                <NumberField
                  value={price()}
                  onChange={setPrice}
                  minValue={0}
                  step={0.01}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 100.00" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>

              <div class="space-y-1.5">
                <label class="block text-sm font-medium">
                  {mode() === "discount" ? "Discount (%)" : "Tax rate (%)"}
                </label>
                <NumberField
                  value={pct()}
                  onChange={setPct}
                  minValue={0}
                  maxValue={100}
                  step={0.1}
                  format={false}
                  class="flex flex-col gap-1"
                >
                  <NumberFieldGroup>
                    <NumberFieldInput placeholder="e.g. 20" />
                    <NumberFieldIncrementTrigger />
                    <NumberFieldDecrementTrigger />
                  </NumberFieldGroup>
                </NumberField>
              </div>
            </div>
          </section>

          <section class="rounded-xl border bg-card p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-semibold">Results</h2>

            {mode() === "discount" ? (
              <div class="divide-y divide-border rounded-lg border">
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="text-sm font-medium">Discount amount</span>
                  <span class="flex-1 font-mono text-sm text-right">
                    ${discountResult() ? fmt(discountResult()!.discountAmount) : "—"}
                  </span>
                  <CopyButton
                    value={() =>
                      discountResult() ? fmt(discountResult()!.discountAmount) : "—"
                    }
                  />
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="text-sm font-medium">Final price</span>
                  <span class="flex-1 font-mono text-sm text-right">
                    ${discountResult() ? fmt(discountResult()!.finalPrice) : "—"}
                  </span>
                  <CopyButton
                    value={() =>
                      discountResult() ? fmt(discountResult()!.finalPrice) : "—"
                    }
                  />
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="text-sm font-medium">You save</span>
                  <span class="flex-1 font-mono text-sm text-right">
                    ${discountResult() ? fmt(discountResult()!.savings) : "—"}
                  </span>
                  <CopyButton
                    value={() =>
                      discountResult() ? fmt(discountResult()!.savings) : "—"
                    }
                  />
                </div>
              </div>
            ) : (
              <div class="divide-y divide-border rounded-lg border">
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="text-sm font-medium">Tax amount</span>
                  <span class="flex-1 font-mono text-sm text-right">
                    ${taxResult() ? fmt(taxResult()!.taxAmount) : "—"}
                  </span>
                  <CopyButton
                    value={() =>
                      taxResult() ? fmt(taxResult()!.taxAmount) : "—"
                    }
                  />
                </div>
                <div class="flex items-center justify-between gap-4 px-4 py-3">
                  <span class="text-sm font-medium">Total price</span>
                  <span class="flex-1 font-mono text-sm text-right">
                    ${taxResult() ? fmt(taxResult()!.totalPrice) : "—"}
                  </span>
                  <CopyButton
                    value={() =>
                      taxResult() ? fmt(taxResult()!.totalPrice) : "—"
                    }
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
