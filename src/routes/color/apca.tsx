import { onMount } from 'solid-js'
import { useSearchParams } from '@solidjs/router'
import { ToolHeader } from '~/components/tool-header'
import { setToolPageMeta } from '~/lib/seo'

export default function ApcaContrast() {
  setToolPageMeta('color', 'apca')
  const [params] = useSearchParams<{ fg?: string; bg?: string }>()

  onMount(() => {
    const next = new URLSearchParams()
    if (params.fg) next.set('fg', params.fg)
    if (params.bg) next.set('bg', params.bg)
    next.set('mode', 'apca')
    window.location.replace(`/color/contrast?${next.toString()}`)
  })

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="color"
        name="APCA contrast moved"
        description="APCA is now part of the unified contrast checker."
      />
      <div class="anim-fade-up rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm sm:p-8">
        Redirecting to <a class="underline underline-offset-4" href="/color/contrast?mode=apca">Contrast checker</a>...
      </div>
    </main>
  )
}
