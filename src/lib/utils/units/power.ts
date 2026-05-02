import type { UnitDef } from "./converter";

export const powerUnits: Record<string, UnitDef> = {
  w:       { label: "Watts (W)",                  factor: 1 },
  kw:      { label: "Kilowatts (kW)",             factor: 1000 },
  mw:      { label: "Megawatts (MW)",             factor: 1_000_000 },
  gw:      { label: "Gigawatts (GW)",             factor: 1_000_000_000 },
  hp_mech: { label: "Horsepower - mech (hp)",     factor: 745.69987 },
  hp_elec: { label: "Horsepower - elec (hp)",     factor: 746 },
  btu_hr:  { label: "BTU/hour (BTU/hr)",          factor: 0.29307107 },
  ft_lb_s: { label: "Foot-pounds/sec (ft·lb/s)",  factor: 1.35581795 },
  cal_s:   { label: "Calories/sec (cal/s)",       factor: 4.184 },
};

export const powerUnitKeys = Object.keys(powerUnits) as (keyof typeof powerUnits)[];
