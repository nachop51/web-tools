export interface TipResult {
  tipAmount: number;
  totalAmount: number;
  perPerson: number;
}

export function calculateTip(bill: number, tipPercent: number, people: number): TipResult {
  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;
  return { tipAmount, totalAmount, perPerson: totalAmount / Math.max(people, 1) };
}
