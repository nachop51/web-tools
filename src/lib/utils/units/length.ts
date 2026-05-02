import type { UnitDef } from "./converter";

export const lengthUnits: Record<string, UnitDef> = {
  m:   { label: "Meters (m)",          factor: 1 },
  km:  { label: "Kilometers (km)",     factor: 1_000 },
  cm:  { label: "Centimeters (cm)",    factor: 0.01 },
  mm:  { label: "Millimeters (mm)",    factor: 0.001 },
  um:  { label: "Micrometers (µm)",    factor: 0.000001 },
  mi:  { label: "Miles (mi)",          factor: 1609.344 },
  yd:  { label: "Yards (yd)",          factor: 0.9144 },
  ft:  { label: "Feet (ft)",           factor: 0.3048 },
  in:  { label: "Inches (in)",         factor: 0.0254 },
  nm:  { label: "Nautical miles (nm)", factor: 1852 },
};

export const lengthUnitKeys = Object.keys(lengthUnits) as (keyof typeof lengthUnits)[];

export type FunUnitDef = UnitDef & { emoji: string; description: string };

// All factors in meters (same base as lengthUnits).
export const funLengthUnits: Record<string, FunUnitDef> = {
  "human-hair":     { label: "Human hair widths", emoji: "💇", description: "≈ 70 µm wide",         factor: 0.00007     },
  banana:           { label: "Bananas",            emoji: "🍌", description: "≈ 20 cm each",         factor: 0.2         },
  "hot-dog":        { label: "Hot dogs",           emoji: "🌭", description: "≈ 15 cm long",         factor: 0.15        },
  "school-bus":     { label: "School buses",       emoji: "🚌", description: "≈ 12.2 m long",        factor: 12.19       },
  "blue-whale":     { label: "Blue whales",        emoji: "🐋", description: "≈ 30 m long",          factor: 30          },
  "football-field": { label: "Football fields",    emoji: "🏈", description: "91.44 m end-to-end",   factor: 91.44       },
  "eiffel-tower":   { label: "Eiffel Towers",      emoji: "🗼", description: "330 m tall",           factor: 330         },
  "moon-distance":  { label: "Moon distances",     emoji: "🌕", description: "≈ 384,400 km",        factor: 3.844e8     },
  au:               { label: "Astronomical units", emoji: "☀️", description: "Earth–Sun distance",   factor: 1.496e11    },
  "light-year":     { label: "Light years",        emoji: "✨", description: "9.461 × 10¹⁵ m",      factor: 9.461e15    },
};

export const funLengthUnitKeys = Object.keys(funLengthUnits) as (keyof typeof funLengthUnits)[];
