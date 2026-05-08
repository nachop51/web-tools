import * as HoverCardPrimitive from '@kobalte/core/hover-card'
import { Link } from '@solidjs/meta'
import { A } from '@solidjs/router'
import { FiArrowUpRight, FiGithub, FiGlobe, FiLinkedin, FiMail } from 'solid-icons/fi'
import { TbOutlineCode } from 'solid-icons/tb'
import { tools } from '~/lib/tools/registry'

const GITHUB_USER = 'nachop51'
const GITHUB_REPO = 'web-tools'
const EMAIL = 'ithbtnmur@gmail.com'
const LINKEDIN = 'https://mu.linkedin.com/in/ignacio-pankowski-dev'
const PERSONAL = 'https://nachop.dev'

const REPO_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`
const SUGGEST_URL = `${REPO_URL}/issues/new?labels=tool-suggestion&title=${encodeURIComponent('Tool suggestion: ')}`
const COMMIT_URL = `${REPO_URL}/commit/${__BUILD_SHA__}`
const AVATAR_URL = `https://avatars.githubusercontent.com/u/79727818?v=4`

const TOOL_COUNT = tools.length
const YEAR = new Date().getFullYear()

const socials = [
  { href: REPO_URL, label: 'GitHub', Icon: FiGithub, external: true },
  { href: `mailto:${EMAIL}`, label: 'Email', Icon: FiMail, external: false },
  { href: LINKEDIN, label: 'LinkedIn', Icon: FiLinkedin, external: true },
  { href: PERSONAL, label: 'Personal site', Icon: FiGlobe, external: true },
] as const

function ProfileCard() {
  return (
    <div class="anim-profile-card relative w-72 overflow-hidden rounded-lg border border-border bg-popover/95 shadow-lg shadow-black/30 backdrop-blur-md">
      <div
        aria-hidden
        class="pointer-events-none absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-violet/20 via-violet/5 to-transparent"
      >
        <div class="absolute -top-8 -left-8 size-40 rounded-full bg-[radial-gradient(circle,oklch(var(--violet)/0.35),transparent_70%)] blur-xl" />
        <div class="absolute -top-4 right-0 size-24 rounded-full bg-[radial-gradient(circle,oklch(var(--violet)/0.18),transparent_70%)] blur-lg" />
      </div>
      <div
        aria-hidden
        class="anim-profile-shine pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-gradient-to-r from-transparent via-violet/25 to-transparent mix-blend-screen"
      />
      <div class="relative z-10 px-4 pt-4 pb-4">
        <div class="flex items-center gap-3">
          <img
            src={AVATAR_URL}
            alt="Ignacio Pankowski"
            width={64}
            height={64}
            class="anim-avatar-pop size-14 shrink-0 rounded-full border-2 border-popover bg-muted shadow-sm shadow-black/20 ring-1 ring-violet/20"
          />
          <div class="anim-row-in flex flex-col" style={{ '--i': 0 }}>
            <span class="text-sm font-semibold text-foreground">Ignacio Pankowski</span>
            <span class="font-mono text-[11px] text-muted-foreground">@{GITHUB_USER}</span>
          </div>
        </div>
        <p class="anim-row-in mt-3 text-xs leading-relaxed text-muted-foreground" style={{ '--i': 1 }}>
          Software engineer building tiny, fast, client-side dev tools. TypeScript, Solid, and the open web.
        </p>
        <div class="anim-row-in mt-3 flex items-center gap-1 border-t border-border/60 pt-3" style={{ '--i': 2 }}>
          {socials.map(({ href, label, Icon, external }) => (
            <a
              href={href}
              aria-label={label}
              title={label}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              class="group flex size-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:bg-muted hover:text-violet active:scale-95"
            >
              <Icon size={14} />
            </a>
          ))}
          <a
            href={PERSONAL}
            target="_blank"
            rel="noopener noreferrer"
            class="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors duration-150 hover:text-violet"
          >
            nachop.dev
            <FiArrowUpRight size={11} class="transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer class="mt-16 border-t border-border bg-background">
      <Link rel="preload" as="image" href={AVATAR_URL} fetchpriority="low" />
      <div class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-3">
          <A href="/" class="group flex w-fit items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span class="relative inline-flex size-6 items-center justify-center">
              <span
                aria-hidden
                class="absolute inset-0 rounded-md bg-violet/0 transition-colors duration-200 group-hover:bg-violet/10"
              />
              <TbOutlineCode
                size={15}
                class="relative text-foreground transition-all duration-200 group-hover:rotate-[-6deg] group-hover:text-violet"
              />
            </span>
            <span class="transition-colors duration-200 group-hover:text-violet">web-tools</span>
          </A>
          <p class="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Tiny, fast, client-side dev utilities. Open source · no tracking.
          </p>
          <div class="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/80">
            <span class="relative inline-flex size-1.5">
              <span class="absolute inset-0 animate-ping rounded-full bg-violet/60" />
              <span class="relative inline-flex size-1.5 rounded-full bg-violet/80" />
            </span>
            <span class="font-mono tabular-nums">{TOOL_COUNT} tools</span>
            <span class="text-border">·</span>
            <a
              href={SUGGEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-violet"
            >
              Suggest a tool
              <FiArrowUpRight
                size={11}
                class="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>

        <div class="flex flex-col items-start gap-3 sm:items-end">
          <span class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Built by{' '}
            <HoverCardPrimitive.Root openDelay={120} closeDelay={120} gutter={8}>
              <HoverCardPrimitive.Trigger
                as="a"
                href={PERSONAL}
                target="_blank"
                rel="noopener noreferrer"
                class="group relative inline-block text-foreground/90 transition-colors duration-200 hover:text-violet focus-visible:text-violet focus-visible:outline-none"
              >
                Ignacio Pankowski
                <span
                  aria-hidden
                  class="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-violet transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </HoverCardPrimitive.Trigger>
              <HoverCardPrimitive.Portal>
                <HoverCardPrimitive.Content class="z-50 outline-none">
                  <ProfileCard />
                </HoverCardPrimitive.Content>
              </HoverCardPrimitive.Portal>
            </HoverCardPrimitive.Root>
          </span>
          <ul class="flex items-center gap-1">
            {socials.map(({ href, label, Icon, external }) => (
              <li>
                <a
                  href={href}
                  aria-label={label}
                  title={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  class="group flex size-8 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:text-foreground active:scale-95"
                >
                  <Icon size={16} class="transition-colors duration-200 group-hover:text-violet" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div class="border-t border-border/60">
        <div class="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 font-mono text-[11px] text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <span>© {YEAR} Ignacio Pankowski</span>
          <a
            href={COMMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="View this build on GitHub"
            class="group inline-flex items-center gap-1.5 tabular-nums transition-colors duration-150 hover:text-violet"
          >
            <span>{__BUILD_SHA__}</span>
            <span class="text-border">·</span>
            <span>{__BUILD_DATE__}</span>
            <FiArrowUpRight
              size={10}
              class="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
