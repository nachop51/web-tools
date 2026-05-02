// Encode the 5 core HTML entities + optionally all non-ASCII
export function encodeHTMLEntities(str: string, extended = false): string {
  if (str === "") return "";
  let s = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  if (extended) {
    // Encode non-ASCII chars as numeric entities
    s = s.replace(/[^\x00-\x7F]/g, (c) => `&#${c.codePointAt(0)};`);
  }
  return s;
}

export function decodeHTMLEntities(str: string): string {
  if (str === "") return "";
  return str
    .replace(/&#0*(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
    .replace(/&trade;/g, "™")
    .replace(/&euro;/g, "€")
    .replace(/&pound;/g, "£");
}
