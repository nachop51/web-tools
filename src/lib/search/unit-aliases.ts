import { dataUnits } from '~/lib/utils/units/data'
import { lengthUnits } from '~/lib/utils/units/length'
import { massUnits } from '~/lib/utils/units/mass'
import { tempUnitDefs } from '~/lib/utils/units/temperature'
import { timeUnits } from '~/lib/utils/units/time'
import { volumeUnits } from '~/lib/utils/geometry/volume'
import { speedUnits } from '~/lib/utils/units/speed'
import { areaUnits } from '~/lib/utils/geometry/area'
import { angleUnits } from '~/lib/utils/geometry/angle'
import { pressureUnits } from '~/lib/utils/units/pressure'
import { energyUnits } from '~/lib/utils/units/energy'
import { powerUnits } from '~/lib/utils/units/power'

export type UnitCategory =
  | 'data'
  | 'length'
  | 'mass'
  | 'temperature'
  | 'time'
  | 'volume'
  | 'speed'
  | 'area'
  | 'angle'
  | 'pressure'
  | 'energy'
  | 'power-unit'

export type UnitAliasEntry = {
  category: UnitCategory
  routeHref: string
  unitKey: string
  unitLabel: string
  aliases: string[]
}

type Source = {
  category: UnitCategory
  routeHref: string
  units: Record<string, { label: string }>
  overrides: Record<string, string[]>
}

const sources: Source[] = [
  {
    category: 'data',
    routeHref: '/units/data',
    units: dataUnits,
    overrides: {
      B: ['byte', 'bytes'],
      KB: ['kilobyte', 'kilobytes'],
      MB: ['megabyte', 'megabytes', 'meg', 'megs'],
      GB: ['gigabyte', 'gigabytes', 'gig', 'gigs'],
      TB: ['terabyte', 'terabytes'],
      KiB: ['kibibyte', 'kibibytes'],
      MiB: ['mebibyte', 'mebibytes'],
      GiB: ['gibibyte', 'gibibytes'],
      TiB: ['tebibyte', 'tebibytes'],
    },
  },
  {
    category: 'length',
    routeHref: '/units/length',
    units: lengthUnits,
    overrides: {
      m: ['meter', 'metre', 'meters', 'metres'],
      km: ['kilometer', 'kilometre', 'kilometers', 'kilometres'],
      cm: ['centimeter', 'centimetre', 'centimeters', 'centimetres'],
      mm: ['millimeter', 'millimetre', 'millimeters', 'millimetres'],
      um: ['micrometer', 'micrometre', 'micrometers', 'µm', 'micron', 'microns'],
      mi: ['mile', 'miles'],
      yd: ['yard', 'yards'],
      ft: ['foot', 'feet'],
      in: ['inch', 'inches'],
      nm: ['nautical mile', 'nautical miles', 'nautical-mile'],
    },
  },
  {
    category: 'mass',
    routeHref: '/units/mass',
    units: massUnits,
    overrides: {
      g: ['gram', 'grams'],
      kg: ['kilogram', 'kilograms', 'kilo', 'kilos'],
      mg: ['milligram', 'milligrams'],
      t: ['ton', 'tons', 'tonne', 'tonnes', 'metric ton', 'metric tons'],
      lb: ['pound', 'pounds', 'lbs'],
      oz: ['ounce', 'ounces'],
      st: ['stone', 'stones'],
    },
  },
  {
    category: 'temperature',
    routeHref: '/units/temperature',
    units: tempUnitDefs as unknown as Record<string, { label: string }>,
    overrides: {
      c: ['celsius', 'centigrade', '°c'],
      f: ['fahrenheit', '°f'],
      k: ['kelvin'],
    },
  },
  {
    category: 'time',
    routeHref: '/units/time',
    units: timeUnits,
    overrides: {
      ms: ['millisecond', 'milliseconds'],
      s: ['second', 'seconds', 'sec', 'secs'],
      min: ['minute', 'minutes', 'mins'],
      h: ['hour', 'hours', 'hr', 'hrs'],
      day: ['days'],
      week: ['weeks', 'wk', 'wks'],
      year: ['years', 'yr', 'yrs'],
    },
  },
  {
    category: 'volume',
    routeHref: '/geometry/volume',
    units: volumeUnits,
    overrides: {
      l: ['liter', 'litre', 'liters', 'litres'],
      ml: ['milliliter', 'millilitre', 'milliliters', 'millilitres'],
      m3: ['cubic meter', 'cubic meters', 'cubic metre', 'cubic metres', 'm³'],
      cm3: ['cubic centimeter', 'cubic centimeters', 'cm³'],
      in3: ['cubic inch', 'cubic inches', 'in³'],
      ft3: ['cubic foot', 'cubic feet', 'ft³'],
      us_gal: ['gal', 'gallon', 'gallons', 'us gallon', 'us gallons'],
      us_qt: ['qt', 'quart', 'quarts'],
      us_pt: ['pt', 'pint', 'pints'],
      us_cup: ['cup', 'cups'],
      fl_oz: ['fl oz', 'fluid ounce', 'fluid ounces'],
      tsp: ['teaspoon', 'teaspoons'],
      tbsp: ['tablespoon', 'tablespoons'],
      imp_gal: ['imperial gallon', 'imperial gallons', 'uk gallon', 'uk gallons'],
    },
  },
  {
    category: 'speed',
    routeHref: '/units/speed',
    units: speedUnits,
    overrides: {
      'm/s': ['meters per second', 'metres per second', 'mps'],
      'km/h': ['kmh', 'kph', 'kilometers per hour', 'kilometres per hour'],
      mph: ['miles per hour'],
      'ft/s': ['feet per second', 'fps'],
      kn: ['knot', 'knots'],
      mach: [],
    },
  },
  {
    category: 'area',
    routeHref: '/geometry/area',
    units: areaUnits,
    overrides: {
      m2: ['square meter', 'square meters', 'sqm', 'm²'],
      km2: ['square kilometer', 'square kilometers', 'km²'],
      cm2: ['square centimeter', 'square centimeters', 'cm²'],
      mm2: ['square millimeter', 'square millimeters', 'mm²'],
      ft2: ['square foot', 'square feet', 'sqft', 'ft²'],
      in2: ['square inch', 'square inches', 'in²'],
      yd2: ['square yard', 'square yards', 'yd²'],
      mi2: ['square mile', 'square miles', 'mi²'],
      acre: ['acres'],
      ha: ['hectare', 'hectares'],
    },
  },
  {
    category: 'angle',
    routeHref: '/geometry/angle',
    units: angleUnits,
    overrides: {
      deg: ['degree', 'degrees', '°'],
      rad: ['radian', 'radians'],
      grad: ['gradian', 'gradians'],
      arcmin: ['arcminute', 'arcminutes', '′'],
      arcsec: ['arcsecond', 'arcseconds', '″'],
      turn: ['turns', 'revolution', 'revolutions'],
      mrad: ['milliradian', 'milliradians'],
    },
  },
  {
    category: 'pressure',
    routeHref: '/units/pressure',
    units: pressureUnits,
    overrides: {
      pa: ['pascal', 'pascals'],
      kpa: ['kilopascal', 'kilopascals'],
      mpa: ['megapascal', 'megapascals'],
      bar: [],
      psi: ['pounds per square inch'],
      atm: ['atmosphere', 'atmospheres'],
      mmhg: ['mm hg', 'millimeters of mercury'],
      inhg: ['in hg', 'inches of mercury'],
    },
  },
  {
    category: 'energy',
    routeHref: '/units/energy',
    units: energyUnits,
    overrides: {
      j: ['joule', 'joules'],
      kj: ['kilojoule', 'kilojoules'],
      cal: ['calorie', 'calories'],
      kcal: ['kilocalorie', 'kilocalories'],
      wh: ['watt-hour', 'watt hour', 'watt hours'],
      kwh: ['kilowatt-hour', 'kilowatt hour', 'kilowatt hours'],
      btu: ['british thermal unit'],
      ev: ['electronvolt', 'electronvolts'],
    },
  },
  {
    category: 'power-unit',
    routeHref: '/units/power-unit',
    units: powerUnits,
    overrides: {
      w: ['watt', 'watts'],
      kw: ['kilowatt', 'kilowatts'],
      mw: ['megawatt', 'megawatts'],
      gw: ['gigawatt', 'gigawatts'],
      hp_mech: ['hp', 'horsepower', 'mechanical horsepower'],
      hp_elec: ['electrical horsepower'],
      btu_hr: ['btu/hr', 'btu per hour'],
      ft_lb_s: ['foot-pound/sec', 'foot pounds per second'],
      cal_s: ['calorie/sec', 'calories per second'],
    },
  },
]

function deriveFromLabel(label: string): string[] {
  // e.g. "Megabytes (MB)" → "megabytes" + "megabyte"
  const stripped = label
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
    .toLowerCase()
  if (!stripped) return []
  const out = new Set<string>([stripped])
  if (stripped.endsWith('ies')) out.add(stripped.slice(0, -3) + 'y')
  else if (stripped.endsWith('es') && stripped.length > 3) out.add(stripped.slice(0, -2))
  else if (stripped.endsWith('s') && stripped.length > 2) out.add(stripped.slice(0, -1))
  return [...out]
}

function buildIndex(): UnitAliasEntry[] {
  const entries: UnitAliasEntry[] = []
  for (const src of sources) {
    for (const [unitKey, unit] of Object.entries(src.units)) {
      const aliases = new Set<string>()
      aliases.add(unitKey.toLowerCase())
      for (const a of deriveFromLabel(unit.label)) aliases.add(a)
      const overrideAliases = src.overrides[unitKey] ?? []
      for (const a of overrideAliases) aliases.add(a.toLowerCase())
      entries.push({
        category: src.category,
        routeHref: src.routeHref,
        unitKey,
        unitLabel: unit.label,
        aliases: [...aliases],
      })
    }
  }
  return entries
}

export const unitAliasIndex: UnitAliasEntry[] = buildIndex()

const aliasLookup: Map<string, UnitAliasEntry[]> = (() => {
  const map = new Map<string, UnitAliasEntry[]>()
  for (const entry of unitAliasIndex) {
    for (const alias of entry.aliases) {
      const list = map.get(alias) ?? []
      list.push(entry)
      map.set(alias, list)
    }
  }
  return map
})()

export function findUnitByAlias(alias: string): UnitAliasEntry[] {
  return aliasLookup.get(alias.trim().toLowerCase()) ?? []
}
