import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { CSS_NAMED_COLORS } from "~/lib/utils/color/named";
import { setToolPageMeta } from "~/lib/seo";

export default function NamedColors() {
  setToolPageMeta("color", "named-colors");
  const [search, setSearch] = createSignal("");
  const [copied, setCopied] = createSignal<string | null>(null);

  const filtered = createMemo(() => {
    const q = search().trim().toLowerCase();
    if (q === "") return CSS_NAMED_COLORS;
    return CSS_NAMED_COLORS.filter(
      (c) => c.name.includes(q) || c.hex.toLowerCase().includes(q),
    );
  });

  async function copyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied((current) => (current === hex ? null : current)), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="Named colors"
        description="Browse and search all 148 CSS named colors with hex and RGB values."
      />
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <TextField value={search()} onChange={setSearch}>
              <TextFieldLabel>Filter</TextFieldLabel>
              <TextFieldInput type="text" placeholder="rebecca, #ff..., tomato" />
            </TextField>
            <p class="text-xs text-muted-foreground">
              Showing {filtered().length} of {CSS_NAMED_COLORS.length} colors
            </p>
          </CardContent>
        </Card>

        <Show
          when={filtered().length > 0}
          fallback={
            <p class="py-12 text-center text-sm text-muted-foreground">No colors match your search.</p>
          }
        >
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <For each={filtered()}>
              {(color) => (
                <button
                  type="button"
                  onClick={() => copyHex(color.hex)}
                  class="group overflow-hidden rounded-md border border-border bg-card text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-violet/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                >
                  <div
                    class="h-12 transition-transform duration-200 group-hover:scale-[1.02]"
                    style={{ "background-color": color.hex }}
                  />
                  <div class="space-y-0.5 p-2">
                    <p class="truncate text-xs font-mono font-medium">{color.name}</p>
                    <p class="text-xs text-muted-foreground font-mono">
                      {copied() === color.hex ? "Copied!" : color.hex}
                    </p>
                  </div>
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </main>
  );
}
