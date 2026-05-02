import type { UnitDef } from "./converter";

export const pressureUnits: Record<string, UnitDef> = {
  pa:   { label: "Pascals (Pa)",            factor: 1 },
  kpa:  { label: "Kilopascals (kPa)",       factor: 1000 },
  mpa:  { label: "Megapascals (MPa)",       factor: 1e6 },
  bar:  { label: "Bar (bar)",               factor: 100000 },
  psi:  { label: "Pounds per sq. in (psi)", factor: 6894.757 },
  atm:  { label: "Atmospheres (atm)",       factor: 101325 },
  mmhg: { label: "Millimeters Hg (mmHg)",   factor: 133.322 },
  inhg: { label: "Inches Hg (inHg)",        factor: 3386.389 },
};

export const pressureUnitKeys = Object.keys(pressureUnits) as (keyof typeof pressureUnits)[];
