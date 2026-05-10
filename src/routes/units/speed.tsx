import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { speedUnitKeys, speedUnits } from '~/lib/utils/units/speed'

const UNITS: UnitRow[] = speedUnitKeys.map((k) => ({
  key: k,
  label: speedUnits[k].label,
}))

function speedConvert(value: number, from: string, to: string): number {
  return convert(value, speedUnits[from].factor, speedUnits[to].factor)
}

export default function SpeedConverter() {
  setToolPageMeta('units', 'speed')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Speed converter"
        description="Convert between m/s, km/h, mph, ft/s, knots, and mach."
      />
      <UnitConverter
        units={UNITS}
        convert={speedConvert}
        defaultUnit="km/h"
        presets={['1', '10', '60', '100']}
      />
    </main>
  )
}
