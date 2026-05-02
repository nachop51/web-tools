import { converter, clampGamut, formatHex } from "culori";
import type { OKLCH } from "./convert";

const toOklch = converter("oklch");

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const L_MAP: Record<number, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.86,
  300: 0.77,
  400: 0.65,
  500: -1,
  600: 0.47,
  700: 0.38,
  800: 0.28,
  900: 0.18,
  950: 0.1,
};

export type ScaleStop = { step: number; hex: string; oklch: OKLCH };

export function generateScale(hex: string): ScaleStop[] {
  const base = toOklch(hex)!;
  const baseL = base.l ?? 0.5;
  const baseC = base.c ?? 0;
  const baseH = base.h ?? 0;

  return STEPS.map((step) => {
    const targetL = L_MAP[step] === -1 ? baseL : L_MAP[step];
    const chromaScale = Math.sin(targetL * Math.PI);
    const targetC = Math.max(0, baseC * chromaScale * 1.2);

    const oklchColor = { mode: "oklch" as const, l: targetL, c: targetC, h: baseH };
    const clamped = clampGamut("rgb")(oklchColor);
    const hexOut = formatHex(clamped)!.toUpperCase();
    const final = toOklch(clamped)!;

    return {
      step,
      hex: hexOut,
      oklch: {
        l: Math.round((final.l ?? 0) * 10000) / 10000,
        c: Math.round((final.c ?? 0) * 10000) / 10000,
        h: Math.round((final.h ?? 0) * 10) / 10,
      },
    };
  });
}
