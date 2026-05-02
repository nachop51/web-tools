import { colorsNamed, parse, formatHex, converter } from "culori";

const toRgb = converter("rgb");

export type NamedColor = { name: string; hex: string; rgb: string };

export const CSS_NAMED_COLORS: NamedColor[] = Object.entries(colorsNamed)
  .map(([name]) => {
    const color = parse(name)!;
    const rgb = toRgb(color)!;
    const hex = formatHex(color)!.toUpperCase();
    const r = Math.round((rgb.r ?? 0) * 255);
    const g = Math.round((rgb.g ?? 0) * 255);
    const b = Math.round((rgb.b ?? 0) * 255);
    return { name, hex, rgb: `rgb(${r}, ${g}, ${b})` };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
