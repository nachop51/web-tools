import { Resvg } from '@resvg/resvg-js'
import pngToIco from 'png-to-ico'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const publicDir = join(root, 'public')

function render(svg: string, width: number): Buffer {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()
}

const iconSvg = readFileSync(join(publicDir, 'icon.svg'), 'utf8')
const ogSvg = readFileSync(join(__dirname, 'og-image.svg.template'), 'utf8')

const targets: Array<{ name: string; size: number }> = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 },
]

for (const t of targets) {
  const png = render(iconSvg, t.size)
  writeFileSync(join(publicDir, t.name), png)
  console.log(`wrote ${t.name} (${t.size}x${t.size}, ${png.length} bytes)`)
}

const og = new Resvg(ogSvg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
writeFileSync(join(publicDir, 'og-image.png'), og)
console.log(`wrote og-image.png (1200x630, ${og.length} bytes)`)

const ico16 = render(iconSvg, 16)
const ico32 = render(iconSvg, 32)
const ico48 = render(iconSvg, 48)
const ico = await pngToIco([ico16, ico32, ico48])
writeFileSync(join(publicDir, 'favicon.ico'), ico)
console.log(`wrote favicon.ico (multi-res 16/32/48, ${ico.length} bytes)`)
