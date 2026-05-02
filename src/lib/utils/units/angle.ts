import type { UnitDef } from "./converter";

export const angleUnits: Record<string, UnitDef> = {
  deg:    { label: "Degrees (°)",       factor: 1 },
  rad:    { label: "Radians (rad)",     factor: 180 / Math.PI },
  grad:   { label: "Gradians (grad)",   factor: 0.9 },
  arcmin: { label: "Arcminutes (′)",    factor: 1 / 60 },
  arcsec: { label: "Arcseconds (″)",    factor: 1 / 3600 },
  turn:   { label: "Turns (turn)",      factor: 360 },
  mrad:   { label: "Milliradians (mrad)", factor: (180 / Math.PI) / 1000 },
};

export const angleUnitKeys = Object.keys(angleUnits) as (keyof typeof angleUnits)[];
