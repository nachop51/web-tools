export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals: number): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

export function randomBatch(
  min: number,
  max: number,
  count: number,
  mode: "int" | "float",
  decimals: number,
): number[] {
  return Array.from({ length: count }, () =>
    mode === "int" ? randomInt(min, max) : randomFloat(min, max, decimals),
  );
}
