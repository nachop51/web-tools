import { ToolHeader } from '~/components/tool-header'
import { UnitConverter, type UnitRow } from '~/components/unit-converter'
import { setToolPageMeta } from '~/lib/seo'
import { convert } from '~/lib/utils/units/converter'
import { dataUnits } from '~/lib/utils/units/data'

const SI_KEYS = ['B', 'KB', 'MB', 'GB', 'TB']
const IEC_KEYS = ['KiB', 'MiB', 'GiB', 'TiB']
const ALL_KEYS = [...SI_KEYS, ...IEC_KEYS]

const UNITS: UnitRow[] = ALL_KEYS.map((k) => ({
  key: k,
  label: dataUnits[k].label,
}))

const GROUPS = [
  { label: 'SI · decimal · powers of 1000', keys: SI_KEYS },
  { label: 'IEC · binary · powers of 1024', keys: IEC_KEYS },
]

function dataConvert(value: number, from: string, to: string): number {
  return convert(value, dataUnits[from].factor, dataUnits[to].factor)
}

export default function DataConverter() {
  setToolPageMeta('units', 'data')

  return (
    <main class="w-full py-10">
      <ToolHeader
        category="units"
        name="Data size converter"
        description="Convert between bytes, kilobytes, megabytes, gigabytes, and binary equivalents."
      />
      <UnitConverter
        units={UNITS}
        groups={GROUPS}
        convert={dataConvert}
        defaultUnit="MB"
        presets={['1', '1000', '1024', '1000000']}
      />
    </main>
  )
}
