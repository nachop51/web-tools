export type DateDiffResult = {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalSeconds: number
}

export function dateDiff(from: Date, to: Date): DateDiffResult {
  // Always work with absolute difference
  let start = from < to ? from : to
  let end = from < to ? to : from

  const totalMs = end.getTime() - start.getTime()
  const totalSeconds = Math.floor(totalMs / 1000)
  const totalMinutes = Math.floor(totalMs / 60_000)
  const totalHours = Math.floor(totalMs / 3_600_000)
  const totalDays = Math.floor(totalMs / 86_400_000)

  // Calendar-accurate breakdown
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()
  let hours = end.getHours() - start.getHours()
  let minutes = end.getMinutes() - start.getMinutes()
  let seconds = end.getSeconds() - start.getSeconds()

  if (seconds < 0) {
    seconds += 60
    minutes--
  }
  if (minutes < 0) {
    minutes += 60
    hours--
  }
  if (hours < 0) {
    hours += 24
    days--
  }
  if (days < 0) {
    // Days in the previous month relative to end
    months--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    months += 12
    years--
  }

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  }
}

export function ageFrom(birthdate: Date, asOf: Date): DateDiffResult {
  return dateDiff(birthdate, asOf)
}
