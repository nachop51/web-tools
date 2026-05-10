import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { volumeUnitKeys, volumeUnits } from '~/lib/utils/geometry/volume'

const UNITS: UnitRow[] = volumeUnitKeys.map((k) => ({
  key: k,
  label: volumeUnits[k].label,
}))

function volumeConvert(value: number, from: string, to: string): number {
  return convert(value, volumeUnits[from].factor, volumeUnits[to].factor)
}

export default function VolumeConverter() {
  setToolPageMeta('geometry', 'volume')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Volume converter"
        description="Convert between liters, milliliters, gallons, cups, fluid ounces, and more."
      />
      <UnitConverter
        units={UNITS}
        convert={volumeConvert}
        defaultUnit="l"
        presets={['1', '10', '100', '1000']}
      />
    </main>
  )
}
