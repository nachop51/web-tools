export interface SalaryBreakdown {
  annual: number
  monthly: number
  biweekly: number
  weekly: number
  daily: number
  hourly: number
}

export function convertSalary(amount: number, period: keyof SalaryBreakdown, hoursPerWeek: number): SalaryBreakdown {
  const weeksPerYear = 52
  const workingDaysPerYear = 260

  let annual: number
  switch (period) {
    case 'annual':
      annual = amount
      break
    case 'monthly':
      annual = amount * 12
      break
    case 'biweekly':
      annual = amount * 26
      break
    case 'weekly':
      annual = amount * weeksPerYear
      break
    case 'daily':
      annual = amount * workingDaysPerYear
      break
    case 'hourly':
      annual = amount * hoursPerWeek * weeksPerYear
      break
    default:
      annual = amount
  }

  return {
    annual,
    monthly: annual / 12,
    biweekly: annual / 26,
    weekly: annual / weeksPerYear,
    daily: annual / workingDaysPerYear,
    hourly: annual / (hoursPerWeek * weeksPerYear),
  }
}

export const salaryPeriods: Array<{ id: keyof SalaryBreakdown; label: string }> = [
  { id: 'annual', label: 'Per year' },
  { id: 'monthly', label: 'Per month' },
  { id: 'biweekly', label: 'Every 2 weeks' },
  { id: 'weekly', label: 'Per week' },
  { id: 'daily', label: 'Per day' },
  { id: 'hourly', label: 'Per hour' },
]
