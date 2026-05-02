import { For, Show } from "solid-js";
import {
  TbOutlineCoin,
  TbOutlineReceipt,
  TbOutlineTag,
  TbOutlineCoins,
  TbOutlineTrendingUp,
  TbOutlineCash,
} from "solid-icons/tb";
import type { Component } from "solid-js";
import { Breadcrumb } from "~/components/breadcrumb";
import { ToolCard } from "~/components/tool-card";
import { categoryById, toolsByCategory } from "~/lib/tools/registry";
import { setPageMeta, getCategoryMeta, getCategoryIndexSchema } from "~/lib/seo";

const toolIcons = {
  tip:               TbOutlineReceipt,
  discount:          TbOutlineTag,
  "simple-interest": TbOutlineCoins,
  "compound-interest": TbOutlineTrendingUp,
  salary:            TbOutlineCash,
};

export default function FinanceIndex() {
  const category = categoryById("finance")!;
  const tools = toolsByCategory("finance");
  const categoryMeta = getCategoryMeta(category);
  setPageMeta({
    title: categoryMeta.title,
    description: categoryMeta.description,
    canonical: categoryMeta.canonical,
    schema: getCategoryIndexSchema(category, tools),
  });

  return (
    <main class="w-full py-10">
      <Breadcrumb />

      <header class="mb-8 flex items-center gap-3">
        <div class="flex size-9 items-center justify-center border border-border bg-card text-primary">
          <TbOutlineCoin size={18} />
        </div>
        <div>
          <h1 class="font-mono text-2xl font-semibold tracking-tight">
            {category.name}
          </h1>
          <p class="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </header>

      <Show
        when={tools.length > 0}
        fallback={
          <p class="text-sm text-muted-foreground">Tools coming soon.</p>
        }
      >
        <div class="grid gap-2 sm:grid-cols-2">
          <For each={tools}>
            {(tool) => (
              <ToolCard
                tool={tool}
                icon={toolIcons[tool.slug] ?? TbOutlineCoin}
              />
            )}
          </For>
        </div>
      </Show>
    </main>
  );
}
