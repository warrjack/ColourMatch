import type { RGB } from './sampleColor'

export interface HSV {
  h: number
  s: number
  v: number
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 }
}

export function applyWhiteBalance(s: RGB, w: RGB): RGB {
  return {
    r: Math.min(255, Math.round(s.r * (255 / w.r))),
    g: Math.min(255, Math.round(s.g * (255 / w.g))),
    b: Math.min(255, Math.round(s.b * (255 / w.b))),
  }
}

export function correctedHsv(sample: RGB, whiteRef: RGB): HSV {
  return rgbToHsv(applyWhiteBalance(sample, whiteRef))
}
