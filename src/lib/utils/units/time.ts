import type { UnitDef } from "./converter";

export const timeUnits: Record<string, UnitDef> = {
  ms:   { label: "Milliseconds (ms)", factor: 0.001 },
  s:    { label: "Seconds (s)",        factor: 1 },
  min:  { label: "Minutes (min)",      factor: 60 },
  h:    { label: "Hours (h)",          factor: 3600 },
  day:  { label: "Days (day)",         factor: 86400 },
  week: { label: "Weeks (week)",       factor: 604800 },
  year: { label: "Years (year)",       factor: 31_557_600 },
};

export const timeUnitKeys = Object.keys(timeUnits) as (keyof typeof timeUnits)[];
