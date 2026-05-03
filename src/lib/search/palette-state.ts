import { createSignal } from 'solid-js'

export const [paletteOpen, setPaletteOpen] = createSignal(false)

export function togglePalette() {
  setPaletteOpen((o) => !o)
}
