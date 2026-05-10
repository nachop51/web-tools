import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { pressureUnitKeys, pressureUnits } from '~/lib/utils/units/pressure'

const UNITS: UnitRow[] = pressureUnitKeys.map((k) => ({
  key: k,
  label: pressureUnits[k].label,
}))

function pressureConvert(value: number, from: string, to: string): number {
  return convert(value, pressureUnits[from].factor, pressureUnits[to].factor)
}

export default function PressureConverter() {
  setToolPageMeta('units', 'pressure')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Pressure converter"
        description="Convert between pascals, bar, PSI, atmospheres, mmHg, and torr."
      />
      <UnitConverter
        units={UNITS}
        convert={pressureConvert}
        defaultUnit="kpa"
        presets={['1', '100', '1000']}
      />
    </main>
  )
}
