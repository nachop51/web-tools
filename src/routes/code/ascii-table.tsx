import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldInput, TextFieldLabel } from "~/components/ui/text-field";
import { buildAsciiTable } from "~/lib/utils/code/ascii";
import { setToolPageMeta } from "~/lib/seo";

const TABLE = buildAsciiTable();

export default function AsciiTableTool() {
  setToolPageMeta("code", "ascii-table");
  const [search, setSearch] = createSignal("");
  const [copied, setCopied] = createSignal<string | null>(null);

  const filtered = createMemo(() => {
    const q = search().toLowerCase().trim();
    if (!q) return TABLE;
    return TABLE.filter((e) =>
      e.char.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      String(e.dec).includes(q) ||
      e.hex.toLowerCase().includes(q),
    );
  });

  function copyCell(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(null), 1000);
    });
  }

  return (
    <main class="w-full max-w-5xl py-10">
      <ToolHeader
        category="code"
        name="ASCII table"
        description="Full 0–127 ASCII reference. Click any cell to copy its value."
      />

      <div class="mb-4 max-w-xs">
        <TextField value={search()} onChange={setSearch}>
          <TextFieldLabel>Search</TextFieldLabel>
          <TextFieldInput placeholder="char, description, dec, hex…" />
        </TextField>
      </div>

      <div class="overflow-x-auto rounded-xl border shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th class="px-3 py-2 text-left">Dec</th>
              <th class="px-3 py-2 text-left">Hex</th>
              <th class="px-3 py-2 text-left">Oct</th>
              <th class="px-3 py-2 text-left">Bin</th>
              <th class="px-3 py-2 text-left">Char</th>
              <th class="px-3 py-2 text-left">HTML</th>
              <th class="px-3 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <For each={filtered()}>
              {(entry) => {
                const cells = [
                  String(entry.dec),
                  entry.hex,
                  entry.oct,
                  entry.bin,
                  entry.char,
                  entry.htmlEntity,
                  entry.description,
                ];
                return (
                  <tr class="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <For each={cells}>
                      {(cell) => (
                        <td
                          class="cursor-pointer px-3 py-1.5 font-mono hover:bg-primary/10 hover:text-primary transition-colors"
                          title={copied() === cell ? "Copied!" : "Click to copy"}
                          onClick={() => copyCell(cell)}
                        >
                          <Show when={copied() === cell} fallback={cell}>
                            <span class="text-primary font-semibold">✓</span>
                          </Show>
                        </td>
                      )}
                    </For>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
        <Show when={filtered().length === 0}>
          <p class="px-4 py-6 text-center text-sm text-muted-foreground">No entries match your search.</p>
        </Show>
      </div>
    </main>
  );
}
