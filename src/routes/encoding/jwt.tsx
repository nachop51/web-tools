import { createMemo, createSignal, For, Show } from "solid-js";
import { ToolHeader } from "~/components/tool-header";
import { TextField, TextFieldErrorMessage, TextFieldTextArea } from "~/components/ui/text-field";
import { decodeJwt, formatJwtDate } from "~/lib/utils/encoding/jwt";
import { setToolPageMeta } from "~/lib/seo";

const DATE_FIELDS = new Set(["iat", "exp", "nbf"]);

export default function JwtTool() {
  setToolPageMeta("encoding", "jwt");
  const [input, setInput] = createSignal("");

  const result = createMemo(() => {
    const token = input().trim();
    if (!token) return null;
    try {
      return { data: decodeJwt(token), error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Failed to decode JWT" };
    }
  });

  return (
    <main class="w-full max-w-3xl mx-auto py-10">
      <ToolHeader
        category="encoding"
        name="JWT decoder"
        description="Inspect JWT header, payload, and signature. Decodes without verification."
      />

      <section class="rounded-xl border bg-card p-6 shadow-sm mb-6">
        <h2 class="mb-4 text-xl font-semibold">Token</h2>
        <TextField
          value={input()}
          onChange={setInput}
          validationState={result()?.error ? "invalid" : "valid"}
        >
          <TextFieldTextArea
            rows={4}
            class="font-mono text-sm"
            placeholder="Paste a JWT token above to inspect it"
          />
          <TextFieldErrorMessage>{result()?.error}</TextFieldErrorMessage>
        </TextField>
      </section>

      <Show
        when={result()?.data}
        fallback={
          <Show when={!input()}>
            <p class="text-center text-muted-foreground text-sm py-8">
              Paste a JWT token above to inspect it
            </p>
          </Show>
        }
      >
        {(parts) => (
          <div class="flex flex-col gap-6">
            <section class="rounded-xl border bg-card p-6 shadow-sm">
              <h2 class="mb-4 text-xl font-semibold">Header</h2>
              <pre class="font-mono text-sm bg-muted rounded-md p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(parts().header, null, 2)}
              </pre>
            </section>

            <section class="rounded-xl border bg-card p-6 shadow-sm">
              <h2 class="mb-4 text-xl font-semibold">Payload</h2>
              <pre class="font-mono text-sm bg-muted rounded-md p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(parts().payload, null, 2)}
              </pre>
              <Show when={Object.keys(parts().payload).some((k) => DATE_FIELDS.has(k))}>
                <div class="mt-4 flex flex-col gap-2">
                  <For each={Object.entries(parts().payload).filter(([k]) => DATE_FIELDS.has(k))}>
                    {([key, val]) => (
                      <Show when={typeof val === "number"}>
                        <div class="flex items-center gap-2 text-sm">
                          <span class="font-mono text-muted-foreground">{key}:</span>
                          <span class="text-foreground">{formatJwtDate(val as number)}</span>
                        </div>
                      </Show>
                    )}
                  </For>
                </div>
              </Show>
            </section>

            <section class="rounded-xl border bg-card p-6 shadow-sm">
              <h2 class="mb-4 text-xl font-semibold">Signature</h2>
              <p class="mb-3 text-sm text-muted-foreground">
                Not verified. Raw base64url string only
              </p>
              <pre class="font-mono text-sm bg-muted rounded-md p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {parts().signature}
              </pre>
            </section>
          </div>
        )}
      </Show>
    </main>
  );
}
