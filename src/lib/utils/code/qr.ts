import QRCode from 'qrcode'

export type QrOpts = {
  size: number
  ecl: 'L' | 'M' | 'Q' | 'H'
  fgColor: string
  bgColor: string
  roundness: number
  logo?: string
  logoShape: 'square' | 'circle'
}

function isFinderZone(row: number, col: number, n: number): boolean {
  return (row < 7 && col < 7) || (row < 7 && col >= n - 7) || (row >= n - 7 && col < 7)
}

export async function generateQrDataUrl(text: string, opts: QrOpts): Promise<string> {
  if (typeof document === 'undefined') return ''
  const qr = QRCode.create(text, { errorCorrectionLevel: opts.ecl })
  const n = qr.modules.size
  const margin = 4
  const cell = opts.size / (n + margin * 2)

  const canvas = document.createElement('canvas')
  canvas.width = opts.size
  canvas.height = opts.size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = opts.bgColor
  ctx.fillRect(0, 0, opts.size, opts.size)

  ctx.fillStyle = opts.fgColor
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c)) continue
      const x = (c + margin) * cell
      const y = (r + margin) * cell
      const radius = isFinderZone(r, c, n) ? 0 : (opts.roundness / 100) * cell
      ctx.beginPath()
      ctx.roundRect(x, y, cell, cell, radius)
      ctx.fill()
    }
  }

  if (opts.logo) {
    await drawLogo(ctx, opts.logo, opts.logoShape, opts.size)
  }

  return canvas.toDataURL('image/png')
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoDataUrl: string,
  shape: 'square' | 'circle',
  size: number
): Promise<void> {
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = logoDataUrl
  })

  const maxLogoSize = size * 0.22
  const scale = Math.min(maxLogoSize / img.naturalWidth, maxLogoSize / img.naturalHeight)
  const lw = img.naturalWidth * scale
  const lh = img.naturalHeight * scale
  const pad = 8
  const cx = size / 2
  const cy = size / 2

  if (shape === 'square') {
    const pw = lw + pad * 2
    const ph = lh + pad * 2
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, 6)
    ctx.fill()
    ctx.drawImage(img, cx - lw / 2, cy - lh / 2, lw, lh)
  } else {
    const r = Math.max(lw, lh) / 2 + pad
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, cx - lw / 2, cy - lh / 2, lw, lh)
    ctx.restore()
  }
}
