import { describe, it, expect } from "vitest";
import { modulo } from "./modulo";

describe("modulo", () => {
  it("7 mod 3 → quotient 2, remainder 1", () => {
    const r = modulo(7, 3);
    expect(r.quotient).toBe(2);
    expect(r.remainder).toBe(1);
  });

  it("-7 mod 3 → JS remainder -1, Python remainder 2", () => {
    const r = modulo(-7, 3);
    expect(r.remainder).toBe(-1);
    expect(r.remainderPython).toBe(2);
  });

  it("0 mod 5 → remainder 0", () => {
    const r = modulo(0, 5);
    expect(r.remainder).toBe(0);
  });

  it("modulus 0 throws", () => {
    expect(() => modulo(7, 0)).toThrow();
  });
});
