import type { HSV } from './colorMath'

type Magnitude = 'none' | 'tiny' | 'small' | 'medium' | 'large'

export interface Directions {
  hue: { direction: 'left' | 'right' | 'none'; magnitude: Magnitude; targetColorName: string }
  saturation: { direction: 'left' | 'right' | 'none'; magnitude: Magnitude }
  value: { direction: 'up' | 'down' | 'none'; magnitude: Magnitude }
}

const HUE_NAMES: [number, string][] = [
  [0, 'red'], [30, 'orange'], [60, 'yellow'], [120, 'green'],
  [180, 'cyan'], [240, 'blue'], [270, 'purple'], [300, 'magenta'], [360, 'red'],
]

function nearestHueName(h: number): string {
  let best = HUE_NAMES[0][1]
  let bestDist = 360
  for (const [angle, name] of HUE_NAMES) {
    const dist = Math.abs(h - angle)
    if (dist < bestDist) { bestDist = dist; best = name }
  }
  return best
}

function hueMagnitude(deg: number): Magnitude {
  const abs = Math.abs(deg)
  if (abs < 3) return 'none'
  if (abs < 10) return 'tiny'
  if (abs < 25) return 'small'
  if (abs < 60) return 'medium'
  return 'large'
}

function svMagnitude(delta: number): Magnitude {
  const abs = Math.abs(delta)
  if (abs < 2) return 'none'
  if (abs < 8) return 'tiny'
  if (abs < 20) return 'small'
  if (abs < 40) return 'medium'
  return 'large'
}

export function computeDirections(goal: HSV, current: HSV): Directions {
  const hueDelta = ((goal.h - current.h + 540) % 360) - 180
  const sMag = svMagnitude(goal.s - current.s)
  const vMag = svMagnitude(goal.v - current.v)

  return {
    hue: {
      direction: hueMagnitude(hueDelta) === 'none' ? 'none' : hueDelta > 0 ? 'right' : 'left',
      magnitude: hueMagnitude(hueDelta),
      targetColorName: nearestHueName(goal.h),
    },
    saturation: {
      direction: sMag === 'none' ? 'none' : goal.s > current.s ? 'right' : 'left',
      magnitude: sMag,
    },
    value: {
      direction: vMag === 'none' ? 'none' : goal.v > current.v ? 'up' : 'down',
      magnitude: vMag,
    },
  }
}
