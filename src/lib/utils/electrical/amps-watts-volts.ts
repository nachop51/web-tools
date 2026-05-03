export type AWVSolve = 'amps' | 'watts' | 'volts'

export function ampsToWatts(amps: number, volts: number): number {
  return amps * volts
}

export function wattsToAmps(watts: number, volts: number): number {
  return watts / volts
}

export function voltsFromWattsAmps(watts: number, amps: number): number {
  return watts / amps
}

export function voltsFromAmpsResistance(amps: number, resistance: number): number {
  return amps * resistance
}

export type AWVResult = {
  value: number
  unit: string
  formula: string
}

export function solveAWV(solve: AWVSolve, a: number, b: number): AWVResult {
  if (solve === 'amps') {
    // a = watts, b = volts → I = P / V
    return {
      value: wattsToAmps(a, b),
      unit: 'A',
      formula: 'I = P ÷ V',
    }
  } else if (solve === 'watts') {
    // a = amps, b = volts → P = I * V
    return {
      value: ampsToWatts(a, b),
      unit: 'W',
      formula: 'P = I × V',
    }
  } else {
    // solve = "volts", a = watts, b = amps → V = P / I
    return {
      value: voltsFromWattsAmps(a, b),
      unit: 'V',
      formula: 'V = P ÷ I',
    }
  }
}
