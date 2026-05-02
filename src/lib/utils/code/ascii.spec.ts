import { describe, it, expect } from "vitest";
import { buildAsciiTable } from "./ascii";

describe("buildAsciiTable", () => {
  const table = buildAsciiTable();

  it("has 128 entries", () => {
    expect(table).toHaveLength(128);
  });

  it("NUL entry is correct", () => {
    const nul = table[0];
    expect(nul.dec).toBe(0);
    expect(nul.hex).toBe("00");
    expect(nul.oct).toBe("000");
    expect(nul.bin).toBe("0000000");
    expect(nul.char).toBe("NUL");
    expect(nul.description).toBe("Null");
  });

  it("Space entry is correct", () => {
    const space = table[32];
    expect(space.dec).toBe(32);
    expect(space.description).toBe("Space");
  });

  it("printable char 'A' is correct", () => {
    const a = table[65];
    expect(a.dec).toBe(65);
    expect(a.char).toBe("A");
    expect(a.hex).toBe("41");
    expect(a.oct).toBe("101");
    expect(a.bin).toBe("1000001");
  });

  it("named HTML entity for ampersand", () => {
    const amp = table[38];
    expect(amp.htmlEntity).toBe("&amp;");
  });

  it("named HTML entity for less-than", () => {
    const lt = table[60];
    expect(lt.htmlEntity).toBe("&lt;");
  });

  it("DEL entry", () => {
    const del = table[127];
    expect(del.char).toBe("DEL");
    expect(del.description).toBe("Delete");
  });
});
