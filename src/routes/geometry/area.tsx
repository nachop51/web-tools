import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { areaUnitKeys, areaUnits } from '~/lib/utils/geometry/area'

const UNITS: UnitRow[] = areaUnitKeys.map((k) => ({
  key: k,
  label: areaUnits[k].label,
}))

function areaConvert(value: number, from: string, to: string): number {
  return convert(value, areaUnits[from].factor, areaUnits[to].factor)
}

export default function AreaConverter() {
  setToolPageMeta('geometry', 'area')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Area converter"
        description="Convert between square meters, acres, hectares, square feet, and more."
      />
      <UnitConverter
        units={UNITS}
        convert={areaConvert}
        defaultUnit="m2"
        presets={['1', '100', '1000', '10000']}
      />
    </main>
  )
}
