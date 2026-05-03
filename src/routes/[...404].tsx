import { A } from '@solidjs/router'
import { TbOutlineArrowLeft, TbOutlineMoodEmpty } from 'solid-icons/tb'

export default function NotFound() {
  return (
    <main class="flex flex-col items-center justify-center px-4 py-32 text-center">
      <TbOutlineMoodEmpty size={40} class="mb-4 text-muted-foreground/40" />
      <h1 class="font-mono text-3xl font-semibold tracking-tight">404</h1>
      <p class="mt-2 text-sm text-muted-foreground">That page doesn't exist.</p>
      <A
        href="/"
        class="mt-6 inline-flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
      >
        <TbOutlineArrowLeft size={12} /> Back to home
      </A>
    </main>
  )
}
