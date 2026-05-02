import { calcAPCA } from "apca-w3";

export function apcaContrast(fg: string, bg: string): number {
  const result = calcAPCA(fg, bg);
  return typeof result === "number" ? result : 0;
}

export type ApcaLevel = { threshold: number; label: string; description: string };

export const APCA_LEVELS: ApcaLevel[] = [
  { threshold: 90, label: "Lc 90+", description: "Body text (small)" },
  { threshold: 75, label: "Lc 75+", description: "Body text (normal)" },
  { threshold: 60, label: "Lc 60+", description: "Large text / headings" },
  { threshold: 45, label: "Lc 45+", description: "Non-text / icons" },
];
