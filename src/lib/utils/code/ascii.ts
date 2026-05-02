export type AsciiEntry = {
  dec: number;
  hex: string;
  oct: string;
  bin: string;
  char: string;
  htmlEntity: string;
  description: string;
};

const CONTROL_NAMES: Record<number, string> = {
  0:  "NUL", 1:  "SOH", 2:  "STX", 3:  "ETX", 4:  "EOT",
  5:  "ENQ", 6:  "ACK", 7:  "BEL", 8:  "BS",  9:  "HT",
  10: "LF",  11: "VT",  12: "FF",  13: "CR",  14: "SO",
  15: "SI",  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3",
  20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB", 24: "CAN",
  25: "EM",  26: "SUB", 27: "ESC", 28: "FS",  29: "GS",
  30: "RS",  31: "US",  127: "DEL",
};

const CONTROL_DESCRIPTIONS: Record<number, string> = {
  0:  "Null",                  1:  "Start of Heading",
  2:  "Start of Text",         3:  "End of Text",
  4:  "End of Transmission",   5:  "Enquiry",
  6:  "Acknowledge",           7:  "Bell",
  8:  "Backspace",             9:  "Horizontal Tab",
  10: "Line Feed",             11: "Vertical Tab",
  12: "Form Feed",             13: "Carriage Return",
  14: "Shift Out",             15: "Shift In",
  16: "Data Link Escape",      17: "Device Control 1",
  18: "Device Control 2",      19: "Device Control 3",
  20: "Device Control 4",      21: "Negative Acknowledge",
  22: "Synchronous Idle",      23: "End of Transmission Block",
  24: "Cancel",                25: "End of Medium",
  26: "Substitute",            27: "Escape",
  28: "File Separator",        29: "Group Separator",
  30: "Record Separator",      31: "Unit Separator",
  32: "Space",                 127: "Delete",
};

const NAMED_ENTITIES: Record<number, string> = {
  34: "&quot;",
  38: "&amp;",
  39: "&apos;",
  60: "&lt;",
  62: "&gt;",
};

function toHtmlEntity(dec: number, isPrintable: boolean): string {
  if (NAMED_ENTITIES[dec]) return NAMED_ENTITIES[dec];
  return `&#${dec};`;
}

export function buildAsciiTable(): AsciiEntry[] {
  const entries: AsciiEntry[] = [];
  for (let dec = 0; dec <= 127; dec++) {
    const isControl = dec < 32 || dec === 127;
    const isPrintable = !isControl;
    const char = isPrintable ? String.fromCharCode(dec) : (CONTROL_NAMES[dec] ?? "");
    const description = CONTROL_DESCRIPTIONS[dec] ?? String.fromCharCode(dec);
    entries.push({
      dec,
      hex: dec.toString(16).toUpperCase().padStart(2, "0"),
      oct: dec.toString(8).padStart(3, "0"),
      bin: dec.toString(2).padStart(7, "0"),
      char,
      htmlEntity: toHtmlEntity(dec, isPrintable),
      description,
    });
  }
  return entries;
}
