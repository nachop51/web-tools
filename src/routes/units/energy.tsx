import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { energyUnitKeys, energyUnits } from '~/lib/utils/units/energy'

const UNITS: UnitRow[] = energyUnitKeys.map((k) => ({
  key: k,
  label: energyUnits[k].label,
}))

function energyConvert(value: number, from: string, to: string): number {
  return convert(value, energyUnits[from].factor, energyUnits[to].factor)
}

export default function EnergyConverter() {
  setToolPageMeta('units', 'energy')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Energy converter"
        description="Convert between joules, calories, kilowatt-hours, BTU, and more."
      />
      <UnitConverter
        units={UNITS}
        convert={energyConvert}
        defaultUnit="j"
        presets={['1', '100', '1000', '1000000']}
      />
    </main>
  )
}
