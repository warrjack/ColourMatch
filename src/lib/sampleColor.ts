export interface RGB {
  r: number
  g: number
  b: number
}

const SAMPLE_RADIUS = 7 // 15×15 region

export function sampleColor(x: number, y: number, canvas: HTMLCanvasElement): RGB {
  const ctx = canvas.getContext('2d')!
  const size = SAMPLE_RADIUS * 2 + 1
  const sx = Math.max(0, x - SAMPLE_RADIUS)
  const sy = Math.max(0, y - SAMPLE_RADIUS)
  const { data } = ctx.getImageData(sx, sy, size, size)

  let r = 0, g = 0, b = 0
  const pixels = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  return {
    r: Math.round(r / pixels),
    g: Math.round(g / pixels),
    b: Math.round(b / pixels),
  }
}
