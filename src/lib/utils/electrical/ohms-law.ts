export type OhmsVariable = "v" | "i" | "r";

export function solveVoltage(i: number, r: number): number {
  return i * r;
}

export function solveCurrent(v: number, r: number): number {
  return v / r;
}

export function solveResistance(v: number, i: number): number {
  return v / i;
}

export type OhmsResult = {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
};

export function solveOhms(solve: OhmsVariable, a: number, b: number): OhmsResult {
  let voltage: number;
  let current: number;
  let resistance: number;

  if (solve === "v") {
    // a = I, b = R
    current = a;
    resistance = b;
    voltage = solveVoltage(current, resistance);
  } else if (solve === "i") {
    // a = V, b = R
    voltage = a;
    resistance = b;
    current = solveCurrent(voltage, resistance);
  } else {
    // solve = "r", a = V, b = I
    voltage = a;
    current = b;
    resistance = solveResistance(voltage, current);
  }

  const power = voltage * current;

  return { voltage, current, resistance, power };
}
