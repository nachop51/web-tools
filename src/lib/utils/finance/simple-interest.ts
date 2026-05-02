export interface SimpleInterestResult {
  interest: number;
  totalAmount: number;
  effectiveRate: number; // total interest / principal as %
}

export function simpleInterest(
  principal: number,
  ratePercent: number,
  years: number,
): SimpleInterestResult {
  const interest = principal * (ratePercent / 100) * years;
  const totalAmount = principal + interest;
  return { interest, totalAmount, effectiveRate: (interest / principal) * 100 };
}
