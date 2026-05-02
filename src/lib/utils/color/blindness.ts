import {
  parse,
  formatHex,
  filterDeficiencyProt,
  filterDeficiencyDeuter,
  filterDeficiencyTrit,
  filterGrayscale,
} from "culori";

export type BlindnessType =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export type BlindnessResult = Record<BlindnessType, string>;

const protFilter = filterDeficiencyProt(1);
const deutFilter = filterDeficiencyDeuter(1);
const tritFilter = filterDeficiencyTrit(1);
const grayFilter = filterGrayscale(1);

export function simulateBlindness(hex: string): BlindnessResult {
  const color = parse(hex);
  if (!color) {
    return {
      normal: hex,
      protanopia: hex,
      deuteranopia: hex,
      tritanopia: hex,
      achromatopsia: hex,
    };
  }

  return {
    normal: formatHex(color)!.toUpperCase(),
    protanopia: formatHex(protFilter(color))!.toUpperCase(),
    deuteranopia: formatHex(deutFilter(color))!.toUpperCase(),
    tritanopia: formatHex(tritFilter(color))!.toUpperCase(),
    achromatopsia: formatHex(grayFilter(color))!.toUpperCase(),
  };
}
