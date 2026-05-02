import type { UnitDef } from "./converter";

export const volumeUnits: Record<string, UnitDef> = {
  l:       { label: "Liters (L)",              factor: 1 },
  ml:      { label: "Milliliters (mL)",         factor: 0.001 },
  m3:      { label: "Cubic meters (m³)",        factor: 1000 },
  cm3:     { label: "Cubic centimeters (cm³)",  factor: 0.001 },
  in3:     { label: "Cubic inches (in³)",       factor: 0.0163871 },
  ft3:     { label: "Cubic feet (ft³)",         factor: 28.3168 },
  us_gal:  { label: "US gallons (gal)",         factor: 3.78541 },
  us_qt:   { label: "US quarts (qt)",           factor: 0.946353 },
  us_pt:   { label: "US pints (pt)",            factor: 0.473176 },
  us_cup:  { label: "US cups (cup)",            factor: 0.236588 },
  fl_oz:   { label: "Fluid ounces (fl oz)",     factor: 0.0295735 },
  tsp:     { label: "Teaspoons (tsp)",          factor: 0.00492892 },
  tbsp:    { label: "Tablespoons (tbsp)",       factor: 0.0147868 },
  imp_gal: { label: "Imperial gallons (gal)",   factor: 4.54609 },
};

export const volumeUnitKeys = Object.keys(volumeUnits) as (keyof typeof volumeUnits)[];
