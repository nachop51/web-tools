import type { UnitDef } from './converter'

export const dataUnits: Record<string, UnitDef> = {
  B: { label: 'Bytes (B)', factor: 1 },
  KB: { label: 'Kilobytes (KB)', factor: 1_000 },
  MB: { label: 'Megabytes (MB)', factor: 1_000_000 },
  GB: { label: 'Gigabytes (GB)', factor: 1_000_000_000 },
  TB: { label: 'Terabytes (TB)', factor: 1_000_000_000_000 },
  KiB: { label: 'Kibibytes (KiB)', factor: 1024 },
  MiB: { label: 'Mebibytes (MiB)', factor: 1_048_576 },
  GiB: { label: 'Gibibytes (GiB)', factor: 1_073_741_824 },
  TiB: { label: 'Tebibytes (TiB)', factor: 1_099_511_627_776 },
}

export const dataUnitKeys = Object.keys(dataUnits) as (keyof typeof dataUnits)[]
