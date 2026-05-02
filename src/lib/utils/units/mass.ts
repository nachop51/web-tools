import type { UnitDef } from "./converter";

export const massUnits: Record<string, UnitDef> = {
  g:   { label: "Grams (g)",       factor: 1 },
  kg:  { label: "Kilograms (kg)",  factor: 1_000 },
  mg:  { label: "Milligrams (mg)", factor: 0.001 },
  t:   { label: "Metric tons (t)", factor: 1_000_000 },
  lb:  { label: "Pounds (lb)",     factor: 453.59237 },
  oz:  { label: "Ounces (oz)",     factor: 28.349523125 },
  st:  { label: "Stone (st)",      factor: 6350.29318 },
};

export const massUnitKeys = Object.keys(massUnits) as (keyof typeof massUnits)[];
