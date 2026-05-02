export interface SciNotation {
  coefficient: number;
  exponent: number;
  formatted: string;
  engineering: string;
}

export function toScientific(value: number): SciNotation {
  if (!isFinite(value) || value === 0) {
    return { coefficient: 0, exponent: 0, formatted: "0", engineering: "0" };
  }
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const coeff = value / Math.pow(10, exp);
  const roundedCoeff = parseFloat(coeff.toPrecision(10));

  const engExp = Math.floor(exp / 3) * 3;
  const engCoeff = parseFloat((value / Math.pow(10, engExp)).toPrecision(10));

  return {
    coefficient: roundedCoeff,
    exponent: exp,
    formatted: `${roundedCoeff} × 10^${exp}`,
    engineering: `${engCoeff} × 10^${engExp}`,
  };
}

export function fromScientific(coefficient: number, exponent: number): number {
  return coefficient * Math.pow(10, exponent);
}
