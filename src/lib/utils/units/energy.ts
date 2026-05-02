import type { UnitDef } from "./converter";

export const energyUnits: Record<string, UnitDef> = {
  j:    { label: "Joules (J)",           factor: 1 },
  kj:   { label: "Kilojoules (kJ)",      factor: 1000 },
  cal:  { label: "Calories (cal)",       factor: 4.184 },
  kcal: { label: "Kilocalories (kcal)",  factor: 4184 },
  wh:   { label: "Watt-hours (Wh)",      factor: 3600 },
  kwh:  { label: "Kilowatt-hours (kWh)", factor: 3600000 },
  btu:  { label: "BTU (BTU)",            factor: 1055.056 },
  ev:   { label: "Electronvolts (eV)",   factor: 1.60218e-19 },
};

export const energyUnitKeys = Object.keys(energyUnits) as (keyof typeof energyUnits)[];
