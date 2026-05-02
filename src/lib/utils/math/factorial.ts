export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error("Must be a non-negative integer");
  if (n > 170) throw new Error("n too large (max 170)");
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function permutation(n: number, r: number): number {
  if (r > n) throw new Error("r cannot be greater than n");
  return factorial(n) / factorial(n - r);
}

export function combination(n: number, r: number): number {
  if (r > n) throw new Error("r cannot be greater than n");
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function factorialSteps(n: number): string[] {
  if (n === 0) return ["0! = 1"];
  const steps: string[] = [];
  let running = 1;
  for (let i = 1; i <= n && i <= 10; i++) {
    running *= i;
    const nums = Array.from({ length: i }, (_, j) => j + 1).join(" × ");
    steps.push(`${nums} = ${running}`);
  }
  if (n > 10) steps.push(`... × ${n} = ${factorial(n)}`);
  return steps;
}
