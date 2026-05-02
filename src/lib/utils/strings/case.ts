function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function splitWords(s: string): string[] {
  return s
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 0);
}

export const caseConverters = {
  upper: (s: string) => s.toUpperCase(),
  lower: (s: string) => s.toLowerCase(),
  title: (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
  sentence: (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  camel: (s: string) => {
    const words = splitWords(s);
    return words
      .map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w)))
      .join("");
  },
  pascal: (s: string) => {
    const words = splitWords(s);
    return words.map((w) => capitalize(w)).join("");
  },
  snake: (s: string) => {
    const words = splitWords(s);
    return words.map((w) => w.toLowerCase()).join("_");
  },
  kebab: (s: string) => {
    const words = splitWords(s);
    return words.map((w) => w.toLowerCase()).join("-");
  },
  constant: (s: string) => {
    const words = splitWords(s);
    return words.map((w) => w.toUpperCase()).join("_");
  },
  proper: (s: string) =>
    s
      .toLowerCase()
      .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase())
      .replace(/\bi\b/g, "I"),
} as const;

export type CaseKey = keyof typeof caseConverters;

export const caseDefs: Array<{ key: CaseKey; label: string; example: string }> =
  [
    { key: "upper", label: "UPPER CASE", example: "HELLO WORLD" },
    { key: "lower", label: "lower case", example: "hello world" },
    { key: "title", label: "Title Case", example: "Hello World" },
    { key: "sentence", label: "Sentence case", example: "Hello world" },
    { key: "camel", label: "camelCase", example: "helloWorld" },
    { key: "pascal", label: "PascalCase", example: "HelloWorld" },
    { key: "snake", label: "snake_case", example: "hello_world" },
    { key: "kebab", label: "kebab-case", example: "hello-world" },
    { key: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
    { key: "proper", label: "Proper case", example: "Hello world. I am here." },
  ];
