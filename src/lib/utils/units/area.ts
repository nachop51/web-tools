import type { UnitDef } from "./converter";

export const areaUnits: Record<string, UnitDef> = {
  m2:   { label: "Square meters (m²)",       factor: 1 },
  km2:  { label: "Square kilometers (km²)",  factor: 1e6 },
  cm2:  { label: "Square centimeters (cm²)", factor: 0.0001 },
  mm2:  { label: "Square millimeters (mm²)", factor: 0.000001 },
  ft2:  { label: "Square feet (ft²)",        factor: 0.092903 },
  in2:  { label: "Square inches (in²)",      factor: 0.00064516 },
  yd2:  { label: "Square yards (yd²)",       factor: 0.836127 },
  mi2:  { label: "Square miles (mi²)",       factor: 2589988.11 },
  acre: { label: "Acres",                    factor: 4046.856 },
  ha:   { label: "Hectares (ha)",            factor: 10000 },
};

export const areaUnitKeys = Object.keys(areaUnits) as (keyof typeof areaUnits)[];
