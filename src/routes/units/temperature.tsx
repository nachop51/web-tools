import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convertTemp, tempUnitDefs, tempUnits, type TempUnit } from '~/lib/utils/units/temperature'

const UNITS: UnitRow[] = tempUnits.map((k) => ({
  key: k,
  label: tempUnitDefs[k].label,
}))

function isTempUnit(v: string): v is TempUnit {
  return v === 'c' || v === 'f' || v === 'k'
}

function tempConvert(value: number, from: string, to: string): number {
  if (!isTempUnit(from) || !isTempUnit(to)) return NaN
  return convertTemp(value, from, to)
}

export default function TemperatureConverter() {
  setToolPageMeta('units', 'temperature')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Temperature converter"
        description="Convert between Celsius, Fahrenheit, and Kelvin."
      />
      <UnitConverter
        units={UNITS}
        convert={tempConvert}
        defaultUnit="c"
        presets={['0', '25', '100', '-40']}
      />
    </main>
  )
}
