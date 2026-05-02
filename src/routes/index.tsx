import { A } from "@solidjs/router";
import { For } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  TbOutlineArrowUpRight,
  TbOutlineBraces,
  TbOutlineClock,
  TbOutlineHash,
  TbOutlineRuler,
  TbOutlineLetterCase,
  TbOutlineTerminal,
  TbOutlinePalette,
  TbOutlineBolt,
  TbOutlineMathFunction,
  TbOutlineCoin,
  TbOutlineHexagon,
} from "solid-icons/tb";
import type { Component } from "solid-js";
import { categories, toolsByCategory, type CategoryId } from "~/lib/tools/registry";
import { setPageMeta, getHomeMeta, getHomepageSchema } from "~/lib/seo";

const categoryIcons: Record<CategoryId, Component<{ size?: number; class?: string }>> = {
  numbers: TbOutlineHash,
  units: TbOutlineRuler,
  strings: TbOutlineLetterCase,
  encoding: TbOutlineBraces,
  datetime: TbOutlineClock,
  code: TbOutlineTerminal,
  color: TbOutlinePalette,
  electrical: TbOutlineBolt,
  math: TbOutlineMathFunction,
  finance: TbOutlineCoin,
  geometry: TbOutlineHexagon,
};

export default function Home() {
  const meta = getHomeMeta();
  const toolsCount = categories.reduce((sum, cat) => sum + toolsByCategory(cat.id).length, 0);
  setPageMeta({
    ...meta,
    schema: getHomepageSchema(categories, toolsCount),
  });

  return (
    <main class="w-full py-16">
      {/* Hero */}
      <div class="anim-fade-up mb-14">
        <p class="mb-3 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-violet">
          <span aria-hidden class="size-1.5 rounded-full bg-violet" />
          Developer utilities
        </p>
        <h1 class="font-mono text-5xl font-semibold tracking-tight sm:text-6xl">
          web<span class="text-violet">-</span>tools
        </h1>
        <p class="mt-4 max-w-xl text-base text-muted-foreground">
          Fast, browser-native utilities for everyday dev work. No installs, no
          accounts, no tracking.
        </p>
      </div>

      {/* Category grid: single bordered box, hairline dividers between cells */}
      <div class="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
        <For each={categories}>
          {(category, i) => {
            const count = toolsByCategory(category.id).length;
            const isComing = count === 0;
            return (
              <A
                href={category.href}
                class="anim-fade-up anim-stagger group relative block bg-background"
                style={{ "--stagger": String(i()) }}
              >
                {/* Violet hover wash */}
                <span
                  aria-hidden
                  class="pointer-events-none absolute inset-0 bg-violet-muted/0 transition-colors duration-200 ease-out group-hover:bg-violet-muted/40"
                />
                {/* Top accent line */}
                <span
                  aria-hidden
                  class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-violet transition-transform duration-300 ease-out group-hover:scale-x-100"
                />

                <div class="relative h-full p-6">
                  <div
                    class={
                      "mb-5 inline-flex size-10 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-all duration-200 ease-out " +
                      "group-hover:-translate-y-0.5 group-hover:border-violet/60 group-hover:bg-violet/5 group-hover:text-violet"
                    }
                  >
                    <Dynamic component={categoryIcons[category.id]} size={19} />
                  </div>

                  <h2 class="font-mono text-base font-semibold tracking-tight transition-colors duration-150 group-hover:text-foreground">
                    {category.name}
                  </h2>
                  <p class="mt-1.5 text-sm text-muted-foreground">
                    {category.description}
                  </p>

                  <div class="mt-4 flex items-center gap-2 font-mono text-xs">
                    <span
                      class={
                        isComing
                          ? "text-muted-foreground"
                          : "text-violet"
                      }
                    >
                      {isComing ? "Coming soon" : `${count} tool${count === 1 ? "" : "s"}`}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div class="absolute right-4 top-4 text-border transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet">
                    <TbOutlineArrowUpRight size={14} />
                  </div>
                </div>
              </A>
            );
          }}
        </For>
      </div>

      <footer class="mt-14 flex items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span class="size-1.5 rounded-full bg-violet/70" />
        Open source · client-side only · no tracking
      </footer>
    </main>
  );
}
