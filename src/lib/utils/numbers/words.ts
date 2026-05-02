const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

function convertBelow1000(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const ten = TENS[Math.floor(n / 10)];
    const one = ONES[n % 10];
    return one ? `${ten}-${one}` : ten;
  }
  const hundreds = ONES[Math.floor(n / 100)];
  const rest = convertBelow1000(n % 100);
  return rest ? `${hundreds} hundred ${rest}` : `${hundreds} hundred`;
}

export function numberToWords(n: number): string {
  if (!Number.isFinite(n) || !Number.isInteger(n)) return "";

  if (n === 0) return "zero";

  const isNegative = n < 0;
  let abs = Math.abs(n);

  if (abs > 999_999_999_999) return "";

  const billions = Math.floor(abs / 1_000_000_000);
  abs %= 1_000_000_000;
  const millions = Math.floor(abs / 1_000_000);
  abs %= 1_000_000;
  const thousands = Math.floor(abs / 1_000);
  const remainder = abs % 1_000;

  const parts: string[] = [];

  if (billions) parts.push(`${convertBelow1000(billions)} billion`);
  if (millions) parts.push(`${convertBelow1000(millions)} million`);
  if (thousands) parts.push(`${convertBelow1000(thousands)} thousand`);
  if (remainder) parts.push(convertBelow1000(remainder));

  const words = parts.join(" ");
  return isNegative ? `negative ${words}` : words;
}
