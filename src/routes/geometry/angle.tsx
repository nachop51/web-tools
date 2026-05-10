import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { angleUnitKeys, angleUnits } from '~/lib/utils/geometry/angle'

const UNITS: UnitRow[] = angleUnitKeys.map((k) => ({
  key: k,
  label: angleUnits[k].label,
}))

function angleConvert(value: number, from: string, to: string): number {
  return convert(value, angleUnits[from].factor, angleUnits[to].factor)
}

export default function AngleConverter() {
  setToolPageMeta('geometry', 'angle')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="geometry"
        name="Angle converter"
        description="Convert between degrees, radians, gradians, arcminutes, arcseconds, and turns."
      />
      <UnitConverter
        units={UNITS}
        convert={angleConvert}
        defaultUnit="deg"
        presets={['1', '90', '180', '360']}
      />
    </main>
  )
}
