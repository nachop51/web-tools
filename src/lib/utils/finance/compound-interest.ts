export interface CompoundPeriod {
  year: number;
  balance: number;
  interestEarned: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalInterest: number;
  schedule: CompoundPeriod[];
}

export const compoundingOptions = [
  { id: "annually",     label: "Annually",      n: 1   },
  { id: "semiannually", label: "Semi-annually",  n: 2   },
  { id: "quarterly",    label: "Quarterly",      n: 4   },
  { id: "monthly",      label: "Monthly",        n: 12  },
  { id: "daily",        label: "Daily",          n: 365 },
] as const;

export type CompoundingId = typeof compoundingOptions[number]["id"];

export function compoundInterest(
  principal: number,
  ratePercent: number,
  years: number,
  compoundingId: CompoundingId,
): CompoundInterestResult {
  const n = compoundingOptions.find((o) => o.id === compoundingId)?.n ?? 1;
  const r = ratePercent / 100;
  const finalBalance = principal * Math.pow(1 + r / n, n * years);
  const totalInterest = finalBalance - principal;

  const schedule: CompoundPeriod[] = [];
  let prev = principal;
  for (let y = 1; y <= Math.min(years, 30); y++) {
    const balance = principal * Math.pow(1 + r / n, n * y);
    schedule.push({ year: y, balance, interestEarned: balance - prev });
    prev = balance;
  }

  return { finalBalance, totalInterest, schedule };
}
