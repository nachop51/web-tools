import { A, useLocation } from "@solidjs/router";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import {
  TbOutlineCode,
  TbOutlineSun,
  TbOutlineMoon,
  TbOutlineMenu2,
  TbOutlineX,
  TbOutlineHash,
  TbOutlineRuler,
  TbOutlineLetterCase,
  TbOutlineLock,
  TbOutlineCalendar,
  TbOutlineTerminal,
  TbOutlinePalette,
  TbOutlineBolt,
  TbOutlineCalculator,
  TbOutlineCurrencyDollar,
  TbOutlineVector,
} from "solid-icons/tb";
import { categories, type CategoryId } from "~/lib/tools/registry";

const categoryIcons: Record<CategoryId, (props: { size?: number; class?: string }) => any> = {
  numbers: TbOutlineHash,
  units: TbOutlineRuler,
  strings: TbOutlineLetterCase,
  encoding: TbOutlineLock,
  datetime: TbOutlineCalendar,
  code: TbOutlineTerminal,
  color: TbOutlinePalette,
  electrical: TbOutlineBolt,
  math: TbOutlineCalculator,
  finance: TbOutlineCurrencyDollar,
  geometry: TbOutlineVector,
};

export default function Nav() {
  const [dark, setDark] = createSignal(true);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const location = useLocation();

  onMount(() => {
    setDark(document.documentElement.classList.contains("dark"));
  });

  createEffect(() => {
    location.pathname;
    setMenuOpen(false);
  });

  const toggleTheme = () => {
    const next = !dark();
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <nav class="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div class="mx-auto flex h-12 max-w-5xl items-center gap-4 px-4">
        <A
          href="/"
          class="group flex shrink-0 items-center gap-2 font-mono text-sm font-semibold tracking-tight"
        >
          <span class="relative inline-flex size-6 items-center justify-center">
            <span
              aria-hidden
              class="absolute inset-0 rounded-md bg-violet/0 transition-colors duration-150 group-hover:bg-violet/10"
            />
            <TbOutlineCode
              size={15}
              class="relative text-foreground transition-colors duration-150 group-hover:text-violet"
            />
          </span>
          <span class="transition-colors duration-150 group-hover:text-violet">web-tools</span>
        </A>

        {/* Desktop nav links (hidden on mobile) */}
        <ul class="hidden flex-1 items-center gap-0.5 text-sm xl:flex">
          <For each={categories}>
            {(c) => (
              <li>
                <A
                  href={c.href}
                  class="group relative inline-block px-3 py-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  activeClass="!text-foreground [&_.nav-underline]:scale-x-100"
                >
                  {c.name}
                  <span
                    aria-hidden
                    class="nav-underline pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-left scale-x-0 bg-violet transition-transform duration-200 ease-out group-hover:scale-x-100"
                  />
                </A>
              </li>
            )}
          </For>
        </ul>

        {/* Right side controls */}
        <div class="ml-auto flex items-center gap-1">
          <button
            onClick={toggleTheme}
            aria-label={dark() ? "Switch to light theme" : "Switch to dark theme"}
            class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Show when={dark()} fallback={<TbOutlineMoon size={16} />}>
              <TbOutlineSun size={16} />
            </Show>
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen() ? "Close menu" : "Open menu"}
            class="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
          >
            <Show when={menuOpen()} fallback={<TbOutlineMenu2 size={16} />}>
              <TbOutlineX size={16} />
            </Show>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <Show when={menuOpen()}>
        <div class="anim-fade-up border-t border-border bg-background/95 backdrop-blur-md xl:hidden">
          <ul class="mx-auto grid max-w-5xl grid-cols-2 gap-2 p-4 sm:grid-cols-3">
            <For each={categories}>
              {(c) => {
                const Icon = categoryIcons[c.id];
                return (
                  <li>
                    <A
                      href={c.href}
                      class="group flex items-center gap-3 rounded-lg p-3 transition-colors duration-150 hover:bg-muted"
                      activeClass="active bg-violet-muted"
                    >
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-150 group-hover:text-violet [.active_&]:bg-violet/10 [.active_&]:text-violet">
                        <Icon size={16} />
                      </span>
                      <span class="text-sm font-medium text-muted-foreground transition-colors duration-150 group-hover:text-foreground [.active_&]:text-foreground">
                        {c.name}
                      </span>
                    </A>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </Show>
    </nav>
  );
}
