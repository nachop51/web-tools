export type PowerMode = "iv" | "vr" | "ir";

export function powerFromIV(i: number, v: number): number {
  return i * v;
}

export function powerFromVR(v: number, r: number): number {
  return (v * v) / r;
}

export function powerFromIR(i: number, r: number): number {
  return i * i * r;
}

export type PowerResult = {
  watts: number;
  kilowatts: number;
  horsepower: number;
};

export function calcPower(mode: PowerMode, a: number, b: number): PowerResult {
  let watts: number;

  if (mode === "iv") {
    // a = I, b = V
    watts = powerFromIV(a, b);
  } else if (mode === "vr") {
    // a = V, b = R
    watts = powerFromVR(a, b);
  } else {
    // mode = "ir", a = I, b = R
    watts = powerFromIR(a, b);
  }

  return {
    watts,
    kilowatts: watts / 1000,
    horsepower: watts / 745.69987,
  };
}
