import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { massUnitKeys, massUnits } from '~/lib/utils/units/mass'

const UNITS: UnitRow[] = massUnitKeys.map((k) => ({
  key: k,
  label: massUnits[k].label,
}))

function massConvert(value: number, from: string, to: string): number {
  return convert(value, massUnits[from].factor, massUnits[to].factor)
}

export default function MassConverter() {
  setToolPageMeta('units', 'mass')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Mass converter"
        description="Convert between grams, kilograms, pounds, ounces, and more."
      />
      <UnitConverter
        units={UNITS}
        convert={massConvert}
        defaultUnit="kg"
        presets={['1', '10', '100', '1000']}
      />
    </main>
  )
}
