export type CronFields = {
  minutes: number[];
  hours: number[];
  dom: number[];
  month: number[];
  dow: number[];
};

function parseField(field: string, min: number, max: number): number[] {
  if (field === "*") {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  const result = new Set<number>();

  for (const part of field.split(",")) {
    const stepMatch = part.match(/^(\*|(\d+)(?:-(\d+))?)\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[4], 10);
      const from = stepMatch[2] !== undefined ? parseInt(stepMatch[2], 10) : min;
      const to = stepMatch[3] !== undefined ? parseInt(stepMatch[3], 10) : max;
      for (let i = from; i <= to; i += step) {
        if (i >= min && i <= max) result.add(i);
      }
      continue;
    }

    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const from = parseInt(rangeMatch[1], 10);
      const to = parseInt(rangeMatch[2], 10);
      for (let i = from; i <= to; i++) {
        if (i >= min && i <= max) result.add(i);
      }
      continue;
    }

    if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n >= min && n <= max) result.add(n);
      continue;
    }

    throw new Error(`Invalid cron field value: "${part}"`);
  }

  return Array.from(result).sort((a, b) => a - b);
}

export function parseCron(expr: string): CronFields {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Expected 5 fields, got ${parts.length}`);
  }

  return {
    minutes: parseField(parts[0], 0, 59),
    hours: parseField(parts[1], 0, 23),
    dom: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    dow: parseField(parts[4], 0, 6),
  };
}

export function nextRuns(fields: CronFields, from: Date, count: number): Date[] {
  const results: Date[] = [];
  // Start from the next minute
  let d = new Date(from);
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);

  const maxIter = 366 * 24 * 60 * 2; // guard against infinite loop
  let iter = 0;

  while (results.length < count && iter < maxIter) {
    iter++;
    const month = d.getMonth() + 1; // 1-12
    const dom = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const dow = d.getDay(); // 0-6

    if (!fields.month.includes(month)) {
      // advance to next month
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      continue;
    }

    if (!fields.dom.includes(dom) || !fields.dow.includes(dow)) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }

    if (!fields.hours.includes(hour)) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
      continue;
    }

    if (!fields.minutes.includes(minute)) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
      continue;
    }

    results.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1, 0, 0);
  }

  return results;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function describeCron(fields: CronFields): string {
  const { minutes, hours, dom, month, dow } = fields;

  const allMinutes = minutes.length === 60;
  const allHours = hours.length === 24;
  const allDom = dom.length === 31;
  const allMonth = month.length === 12;
  const allDow = dow.length === 7;

  // Time description
  let timePart = "";
  if (allMinutes && allHours) {
    timePart = "every minute";
  } else if (allMinutes) {
    timePart = `every minute of hour ${hours.length === 1 ? hours[0] : hours.join(", ")}`;
  } else if (allHours) {
    const minStr = minutes.length === 1 ? `minute ${minutes[0]}` : `minutes ${minutes.join(", ")}`;
    timePart = `every hour at ${minStr}`;
  } else {
    const h = hours.length === 1 ? String(hours[0]).padStart(2, "0") : hours.join(",");
    const m = minutes.length === 1 ? String(minutes[0]).padStart(2, "0") : minutes.join(",");
    timePart = `at ${h}:${m}`;
  }

  // Day description
  let dayPart = "";
  if (allDom && allDow) {
    dayPart = "every day";
  } else if (!allDom && allDow) {
    dayPart = dom.length === 1 ? `on the ${ordinal(dom[0])}` : `on days ${dom.join(", ")}`;
  } else if (allDom && !allDow) {
    dayPart = dow.length === 1 ? `on ${DOW_NAMES[dow[0]]}` : `on ${dow.map((d) => DOW_NAMES[d]).join(", ")}`;
  } else {
    dayPart = `on day ${dom.join(",")} if ${dow.map((d) => DOW_NAMES[d]).join("/")}`;
  }

  // Month description
  let monthPart = "";
  if (!allMonth) {
    monthPart = `in ${month.map((m) => MONTH_NAMES[m - 1]).join(", ")}`;
  }

  const parts = [timePart, dayPart, monthPart].filter(Boolean);
  return parts.join(", ") || "every minute";
}
