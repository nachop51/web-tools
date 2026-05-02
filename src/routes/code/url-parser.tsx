import { useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { CopyButton } from "~/components/copy-button";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldInput, TextFieldLabel } from "~/components/ui/text-field";
import { parseUrl, type ParsedUrl } from "~/lib/utils/code/url-parser";
import { setToolPageMeta } from "~/lib/seo";

type RowDef = { label: string; key: keyof Omit<ParsedUrl, "params"> };

const ROWS: RowDef[] = [
  { label: "Protocol", key: "protocol" },
  { label: "Username", key: "username" },
  { label: "Password", key: "password" },
  { label: "Host",     key: "hostname" },
  { label: "Port",     key: "port" },
  { label: "Path",     key: "pathname" },
  { label: "Search",   key: "search" },
  { label: "Hash",     key: "hash" },
];

function encodeToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function decodeFromBase64(s: string): string {
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return "";
  }
}

export default function UrlParserTool() {
  setToolPageMeta("code", "url-parser");
  const [params, setParams] = useSearchParams<{ url?: string }>();

  const initialUrl = params.url ? decodeFromBase64(params.url) : "";
  const [input, setInput] = createSignal(initialUrl);

  function handleInput(val: string) {
    setInput(val);
    setParams({ url: val ? encodeToBase64(val) : undefined });
  }

  const parsed = createMemo<ParsedUrl | null>(() => {
    const val = input().trim();
    if (!val) return null;
    try {
      return parseUrl(val);
    } catch {
      return null;
    }
  });

  const error = createMemo(() => {
    const val = input().trim();
    if (!val) return null;
    try {
      parseUrl(val);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid URL";
    }
  });

  return (
    <main class="w-full max-w-3xl py-10">
      <ToolHeader
        category="code"
        name="URL parser"
        description="Break down any URL into its components: protocol, host, path, params, and more."
      />

      <div class="mb-6">
        <TextField value={input()} onChange={handleInput}>
          <TextFieldLabel>URL</TextFieldLabel>
          <TextFieldInput
            placeholder="https://user:pass@example.com:8080/path?key=val#hash"
            class="font-mono text-sm"
          />
        </TextField>
        <Show when={error()}>
          {(err) => (
            <p class="mt-2 text-sm text-destructive">{err()}</p>
          )}
        </Show>
      </div>

      <Show when={parsed()}>
        {(p) => (
          <div class="space-y-4">
            <div class="rounded-xl border shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th class="px-4 py-2 text-left w-28">Field</th>
                    <th class="px-4 py-2 text-left">Value</th>
                    <th class="px-4 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  <For each={ROWS}>
                    {(row) => {
                      const value = createMemo(() => p()[row.key]);
                      return (
                        <Show when={value()}>
                          <tr class="border-t border-border/50">
                            <td class="px-4 py-2 text-muted-foreground font-medium">{row.label}</td>
                            <td class="px-4 py-2 font-mono">{value()}</td>
                            <td class="px-4 py-2 text-right">
                              <CopyButton value={() => value() ?? ""} />
                            </td>
                          </tr>
                        </Show>
                      );
                    }}
                  </For>
                </tbody>
              </table>
            </div>

            <Show when={Object.keys(p().params).length > 0}>
              <div class="rounded-xl border shadow-sm overflow-hidden">
                <div class="bg-muted/50 px-4 py-2 text-xs uppercase text-muted-foreground font-semibold">
                  Query parameters
                </div>
                <table class="w-full text-sm">
                  <thead class="bg-muted/30 text-xs text-muted-foreground">
                    <tr>
                      <th class="px-4 py-2 text-left">Key</th>
                      <th class="px-4 py-2 text-left">Value</th>
                      <th class="px-4 py-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={Object.entries(p().params)}>
                      {([k, v]) => (
                        <tr class="border-t border-border/50">
                          <td class="px-4 py-2 font-mono text-primary">{k}</td>
                          <td class="px-4 py-2 font-mono">{v}</td>
                          <td class="px-4 py-2 text-right">
                            <CopyButton value={() => v} />
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        )}
      </Show>
    </main>
  );
}
