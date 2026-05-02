import { converter, clampGamut, formatHex } from "culori";
import type { OKLCH } from "./convert";

const toOklch = converter("oklch");

export type PaletteMode =
  | "complementary"
  | "triadic"
  | "analogous"
  | "split-complementary"
  | "tetradic"
  | "monochromatic";

export type PaletteColor = { hex: string; oklch: OKLCH };

const HUE_OFFSETS: Record<PaletteMode, number[]> = {
  complementary: [0, 180],
  triadic: [0, 120, 240],
  analogous: [-30, 0, 30],
  "split-complementary": [0, 150, 210],
  tetradic: [0, 90, 180, 270],
  monochromatic: [0],
};

export function generatePalette(hex: string, mode: PaletteMode): PaletteColor[] {
  const base = toOklch(hex)!;
  const baseL = base.l ?? 0.5;
  const baseC = base.c ?? 0;
  const baseH = base.h ?? 0;

  if (mode === "monochromatic") {
    const lValues = [
      baseL * 0.4,
      baseL * 0.6,
      baseL,
      Math.min(1, baseL * 1.3),
      Math.min(1, baseL * 1.6),
    ].filter((l) => l > 0.05 && l < 0.98);
    return lValues.map((l) => colorFromOklch(l, baseC * 0.85, baseH));
  }

  return HUE_OFFSETS[mode].map((offset) => {
    const h = (((baseH + offset) % 360) + 360) % 360;
    return colorFromOklch(baseL, baseC, h);
  });
}

function colorFromOklch(l: number, c: number, h: number): PaletteColor {
  const oklchColor = { mode: "oklch" as const, l, c, h };
  const clamped = clampGamut("rgb")(oklchColor);
  const hexOut = formatHex(clamped)!.toUpperCase();
  const final = toOklch(clamped)!;
  return {
    hex: hexOut,
    oklch: {
      l: Math.round((final.l ?? 0) * 10000) / 10000,
      c: Math.round((final.c ?? 0) * 10000) / 10000,
      h: Math.round((final.h ?? 0) * 10) / 10,
    },
  };
}
