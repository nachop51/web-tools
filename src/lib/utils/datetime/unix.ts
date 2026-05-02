export type UnixInfo = {
  iso: string;
  utc: string;
  local: string;
  weekday: string;
  unixMs: number;
};

export function unixToInfo(seconds: number): UnixInfo {
  const date = new Date(seconds * 1000);
  return {
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    weekday: date.toLocaleDateString(undefined, { weekday: "long" }),
    unixMs: seconds * 1000,
  };
}

export function isoToUnix(isoString: string): number {
  const trimmed = isoString.trim();
  if (!trimmed) throw new Error("Empty input");
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) throw new Error("Invalid date string");
  return Math.floor(date.getTime() / 1000);
}

export function formatRelative(seconds: number): string {
  const nowSeconds = Date.now() / 1000;
  const diff = seconds - nowSeconds;
  const abs = Math.abs(diff);
  const past = diff < 0;

  const intervals: [number, string][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [86400 * 30, "day"],
    [86400 * 365, "month"],
    [Infinity, "year"],
  ];

  let value: number;
  let unit: string;

  if (abs < 60) {
    value = Math.round(abs);
    unit = "second";
  } else if (abs < 3600) {
    value = Math.round(abs / 60);
    unit = "minute";
  } else if (abs < 86400) {
    value = Math.round(abs / 3600);
    unit = "hour";
  } else if (abs < 86400 * 30) {
    value = Math.round(abs / 86400);
    unit = "day";
  } else if (abs < 86400 * 365) {
    value = Math.round(abs / (86400 * 30));
    unit = "month";
  } else {
    value = Math.round(abs / (86400 * 365));
    unit = "year";
  }

  const label = value === 1 ? unit : `${unit}s`;
  return past ? `${value} ${label} ago` : `${value} ${label} from now`;
}
