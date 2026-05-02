export interface CircleProperties {
  radius: number;
  diameter: number;
  circumference: number;
  area: number;
}

export type CircleInput = "radius" | "diameter" | "circumference" | "area";

export function circleFrom(input: CircleInput, value: number): CircleProperties {
  let radius: number;
  switch (input) {
    case "radius":        radius = value; break;
    case "diameter":      radius = value / 2; break;
    case "circumference": radius = value / (2 * Math.PI); break;
    case "area":          radius = Math.sqrt(value / Math.PI); break;
  }
  return {
    radius,
    diameter: 2 * radius,
    circumference: 2 * Math.PI * radius,
    area: Math.PI * radius * radius,
  };
}

export const circleInputs: Array<{ id: CircleInput; label: string; unit: string }> = [
  { id: "radius",        label: "Radius",        unit: "r" },
  { id: "diameter",      label: "Diameter",       unit: "d" },
  { id: "circumference", label: "Circumference",  unit: "C" },
  { id: "area",          label: "Area",           unit: "A" },
];
