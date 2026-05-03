export interface DiscountResult {
  discountAmount: number
  finalPrice: number
  savings: number
}

export interface TaxResult {
  taxAmount: number
  totalPrice: number
}

export function applyDiscount(originalPrice: number, discountPercent: number): DiscountResult {
  const discountAmount = originalPrice * (discountPercent / 100)
  const finalPrice = originalPrice - discountAmount
  return { discountAmount, finalPrice, savings: discountAmount }
}

export function applyTax(prePrice: number, taxPercent: number): TaxResult {
  const taxAmount = prePrice * (taxPercent / 100)
  return { taxAmount, totalPrice: prePrice + taxAmount }
}

export function applyDiscountThenTax(
  originalPrice: number,
  discountPercent: number,
  taxPercent: number
): {
  discountedPrice: number
  taxAmount: number
  finalPrice: number
  totalSavings: number
} {
  const discountedPrice = originalPrice * (1 - discountPercent / 100)
  const taxAmount = discountedPrice * (taxPercent / 100)
  const finalPrice = discountedPrice + taxAmount
  return { discountedPrice, taxAmount, finalPrice, totalSavings: originalPrice - finalPrice }
}
