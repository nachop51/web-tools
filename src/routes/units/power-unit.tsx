import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { powerUnitKeys, powerUnits } from '~/lib/utils/units/power'

const UNITS: UnitRow[] = powerUnitKeys.map((k) => ({
  key: k,
  label: powerUnits[k].label,
}))

function powerConvert(value: number, from: string, to: string): number {
  return convert(value, powerUnits[from].factor, powerUnits[to].factor)
}

export default function PowerConverter() {
  setToolPageMeta('units', 'power-unit')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Power converter"
        description="Convert between watts, kilowatts, horsepower, BTU/hour, and more."
      />
      <UnitConverter
        units={UNITS}
        convert={powerConvert}
        defaultUnit="w"
        presets={['1', '100', '1000', '1000000']}
      />
    </main>
  )
}
