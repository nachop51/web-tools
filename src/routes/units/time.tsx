import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { timeUnitKeys, timeUnits } from '~/lib/utils/units/time'

const UNITS: UnitRow[] = timeUnitKeys.map((k) => ({
  key: k,
  label: timeUnits[k].label,
}))

function timeConvert(value: number, from: string, to: string): number {
  return convert(value, timeUnits[from].factor, timeUnits[to].factor)
}

export default function TimeConverter() {
  setToolPageMeta('units', 'time')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Time converter"
        description="Convert between milliseconds, seconds, minutes, hours, days, weeks, and years."
      />
      <UnitConverter
        units={UNITS}
        convert={timeConvert}
        defaultUnit="s"
        presets={['1', '60', '3600', '86400']}
      />
    </main>
  )
}
