import { generateUuid } from "./uuid";

export type FieldType =
  | "uuid"
  | "boolean"
  | "integer"
  | "float"
  | "string"
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "url"
  | "phone"
  | "date"
  | "color"
  | "ipv4"
  | "enum";

export type FieldDef = {
  name: string;
  type: FieldType;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  format?: string;
  minDate?: string;
  maxDate?: string;
  values?: string[];
};

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Barbara", "William", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Kenneth", "Donna",
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Sophia", "Lucas", "Isabella",
  "Mason", "Mia", "Logan", "Charlotte", "Ethan", "Amelia", "Aiden", "Harper",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
];

const EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
  "example.com", "mail.com", "protonmail.com", "live.com", "aol.com",
];

const URL_HOSTS = ["example.com", "demo.io", "test.dev", "sample.org", "mock.net"];
const URL_PATHS = [
  "/", "/about", "/contact", "/blog", "/products",
  "/services", "/users", "/api/v1", "/docs", "/help",
];

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "reprehenderit", "voluptate", "velit",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function applyDateFormat(date: Date, format?: string): string {
  if (!format || format === "ISO") return date.toISOString();
  const Y = date.getFullYear().toString();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const H = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return format
    .replace("YYYY", Y)
    .replace("MM", M)
    .replace("DD", D)
    .replace("HH", H)
    .replace("mm", m)
    .replace("ss", s);
}

export function generateValue(field: FieldDef): unknown {
  switch (field.type) {
    case "uuid":
      return generateUuid();

    case "boolean":
      return Math.random() > 0.5;

    case "integer":
      return randInt(field.min ?? 0, field.max ?? 1000);

    case "float":
      return randFloat(field.min ?? 0, field.max ?? 100);

    case "string": {
      const len = randInt(field.minLength ?? 4, field.maxLength ?? 20);
      const words: string[] = [];
      while (words.join(" ").length < len) words.push(pick(LOREM_WORDS));
      return words.join(" ").slice(0, len).trimEnd();
    }

    case "firstName":
      return pick(FIRST_NAMES);

    case "lastName":
      return pick(LAST_NAMES);

    case "fullName":
      return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

    case "email": {
      const first = pick(FIRST_NAMES).toLowerCase();
      const last = pick(LAST_NAMES).toLowerCase();
      return `${first}.${last}${randInt(1, 99)}@${pick(EMAIL_DOMAINS)}`;
    }

    case "url":
      return `https://${pick(URL_HOSTS)}${pick(URL_PATHS)}`;

    case "phone": {
      const area = randInt(200, 999);
      const prefix = randInt(200, 999);
      const line = randInt(1000, 9999);
      return `+1-${area}-${prefix}-${line}`;
    }

    case "date": {
      const minMs = field.minDate
        ? new Date(field.minDate).getTime()
        : new Date("2000-01-01").getTime();
      const maxMs = field.maxDate
        ? new Date(field.maxDate).getTime()
        : new Date("2030-12-31").getTime();
      return applyDateFormat(new Date(minMs + Math.random() * (maxMs - minMs)), field.format);
    }

    case "color": {
      const r = randInt(0, 255).toString(16).padStart(2, "0");
      const g = randInt(0, 255).toString(16).padStart(2, "0");
      const b = randInt(0, 255).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }

    case "ipv4":
      return `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;

    case "enum": {
      const vals = field.values?.length ? field.values : ["a", "b", "c"];
      return pick(vals);
    }

    default:
      return null;
  }
}

export function generateRow(fields: FieldDef[]): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of fields) {
    row[field.name || "field"] = generateValue(field);
  }
  return row;
}

export function generateRows(
  fields: FieldDef[],
  count: number,
): Record<string, unknown>[] {
  return Array.from({ length: count }, () => generateRow(fields));
}

export function toJson(rows: Record<string, unknown>[], indent = 2): string {
  return JSON.stringify(rows, null, indent);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(rows: Record<string, unknown>[], fields: FieldDef[]): string {
  if (rows.length === 0) return "";
  const headers = fields.map((f) => csvEscape(f.name || "field"));
  const lines = [headers.join(",")];
  for (const row of rows) {
    const cells = fields.map((f) => {
      const v = row[f.name || "field"];
      return csvEscape(v === null || v === undefined ? "" : String(v));
    });
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

export function toSql(
  rows: Record<string, unknown>[],
  tableName: string,
  fields: FieldDef[],
): string {
  if (rows.length === 0 || fields.length === 0) return "";
  const safeName = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const cols = fields.map((f) => safeName(f.name || "field")).join(", ");
  return rows
    .map((row) => {
      const vals = fields.map((f) => {
        const v = row[f.name || "field"];
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
        if (typeof v === "number") return String(v);
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      return `INSERT INTO ${safeName(tableName)} (${cols}) VALUES (${vals.join(", ")});`;
    })
    .join("\n");
}

export function serializeSchema(fields: FieldDef[]): string {
  return JSON.stringify(fields, null, 2);
}

export function parseSchema(json: string): FieldDef[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Schema must be an array");
  return parsed.map((item: unknown, i: number) => {
    if (typeof item !== "object" || item === null) {
      throw new Error(`Field ${i} must be an object`);
    }
    const f = item as Record<string, unknown>;
    if (typeof f.name !== "string") throw new Error(`Field ${i} missing string "name"`);
    if (typeof f.type !== "string") throw new Error(`Field ${i} missing string "type"`);
    return f as unknown as FieldDef;
  });
}
