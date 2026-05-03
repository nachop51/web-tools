export type DateUnit = 'days' | 'weeks' | 'months' | 'years'

export interface DateAddResult {
  result: Date
  resultIso: string
  weekday: string
  formatted: string
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function addToDate(baseIso: string, amount: number, unit: DateUnit): DateAddResult {
  const base = new Date(baseIso)
  if (isNaN(base.getTime())) throw new Error('Invalid date')

  const result = new Date(base)
  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + amount)
      break
    case 'weeks':
      result.setDate(result.getDate() + amount * 7)
      break
    case 'months':
      result.setMonth(result.getMonth() + amount)
      break
    case 'years':
      result.setFullYear(result.getFullYear() + amount)
      break
  }

  const iso = result.toISOString().split('T')[0]
  return {
    result,
    resultIso: iso,
    weekday: WEEKDAYS[result.getDay()],
    formatted: result.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  }
}
