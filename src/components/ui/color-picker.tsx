import { createMemo, Show, splitProps } from "solid-js"
import * as ColorAreaPrimitive from "@kobalte/core/color-area"
import * as ColorSliderPrimitive from "@kobalte/core/color-slider"
import { parseColor } from "@kobalte/core/colors"
import type { Color } from "@kobalte/core/colors"

import { cn } from "~/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field"

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/

function isValidHex(h: string): boolean {
  return HEX_RE.test(h)
}

function normalizeHex(h: string): string {
  return `#${h.replace(/^#/, "").toUpperCase()}`
}

function parseToHsb(hex: string): Color {
  try {
    return parseColor(normalizeHex(hex)).toFormat("hsb")
  } catch {
    return parseColor("#3B82F6").toFormat("hsb")
  }
}

type ColorPickerProps = {
  value: string
  onChange: (hex: string) => void
  class?: string
}

const ColorPicker = (props: ColorPickerProps) => {
  const [local, others] = splitProps(props, ["value", "onChange", "class"])

  const color = createMemo(() => parseToHsb(local.value))

  function emit(c: Color) {
    local.onChange(c.toString("hex").toUpperCase())
  }

  return (
    <div class={cn("flex w-full flex-col gap-3", local.class)} {...others}>
      <ColorAreaPrimitive.Root
        value={color()}
        onChange={emit}
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        class="w-full"
      >
        <ColorAreaPrimitive.Background class="relative h-48 w-full overflow-hidden rounded-md border border-border shadow-inner cursor-crosshair touch-none">
          <ColorAreaPrimitive.Thumb class="absolute size-5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.25)] cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-shadow">
            <ColorAreaPrimitive.HiddenInputX />
            <ColorAreaPrimitive.HiddenInputY />
          </ColorAreaPrimitive.Thumb>
        </ColorAreaPrimitive.Background>
      </ColorAreaPrimitive.Root>

      <ColorSliderPrimitive.Root
        value={color()}
        onChange={emit}
        channel="hue"
        colorSpace="hsb"
        class="relative flex w-full touch-none select-none flex-col"
      >
        <ColorSliderPrimitive.Track class="relative h-3 w-full rounded-full border border-border">
          <ColorSliderPrimitive.Thumb class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_2px_4px_rgba(0,0,0,0.2)] cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <ColorSliderPrimitive.Input />
          </ColorSliderPrimitive.Thumb>
        </ColorSliderPrimitive.Track>
      </ColorSliderPrimitive.Root>

      <div
        class="h-8 w-full rounded-md border border-border transition-colors duration-150"
        style={{ "background-color": isValidHex(local.value) ? normalizeHex(local.value) : "#888" }}
      />
    </div>
  )
}

type ColorInputProps = {
  value: string
  onChange: (hex: string) => void
  label?: string
  placeholder?: string
  class?: string
}

const ColorInput = (props: ColorInputProps) => {
  const [local, others] = splitProps(props, [
    "value",
    "onChange",
    "label",
    "placeholder",
    "class",
  ])

  const isValid = createMemo(() => isValidHex(local.value))
  const swatchColor = createMemo(() =>
    isValid() ? normalizeHex(local.value) : "#888888"
  )

  return (
    <div class={cn("flex items-end gap-2", local.class)} {...others}>
      <Popover>
        <PopoverTrigger
          aria-label="Open color picker"
          class={cn(
            "h-10 w-12 flex-shrink-0 rounded-md border border-border shadow-sm transition-all duration-150",
            "hover:border-violet/50 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-[expanded]:ring-2 data-[expanded]:ring-ring data-[expanded]:ring-offset-2 data-[expanded]:ring-offset-background"
          )}
          style={{ "background-color": swatchColor() }}
        />
        <PopoverContent class="w-64 p-3">
          <ColorPicker
            value={isValid() ? normalizeHex(local.value) : "#3B82F6"}
            onChange={(hex) => local.onChange(hex)}
          />
        </PopoverContent>
      </Popover>

      <TextField
        value={local.value}
        onChange={(v) => local.onChange(v)}
        class="flex-1"
        validationState={local.value.length > 0 && !isValid() ? "invalid" : "valid"}
      >
        <Show when={local.label}>
          <TextFieldLabel>{local.label}</TextFieldLabel>
        </Show>
        <TextFieldInput
          type="text"
          placeholder={local.placeholder ?? "#3B82F6"}
          class="font-mono uppercase"
        />
      </TextField>
    </div>
  )
}

export { ColorPicker, ColorInput }
