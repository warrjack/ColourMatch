import { describe, it, expect } from 'vitest'
import { computeDirections } from './directions'

describe('computeDirections', () => {
  it('spec acceptance case: goal h:60 s:80 v:90 vs current h:30 s:50 v:70', () => {
    const result = computeDirections({ h: 60, s: 80, v: 90 }, { h: 30, s: 50, v: 70 })
    expect(result.hue.direction).toBe('right')
    expect(result.hue.magnitude).toBe('medium')
    expect(result.hue.targetColorName).toBe('yellow')
    expect(result.saturation.direction).toBe('right')
    expect(result.saturation.magnitude).toBe('medium')
    expect(result.value.direction).toBe('up')
    expect(result.value.magnitude).toBe('medium')
  })

  it('circular hue: goal 10, current 350 → tiny right', () => {
    const result = computeDirections({ h: 10, s: 50, v: 50 }, { h: 350, s: 50, v: 50 })
    expect(result.hue.direction).toBe('right')
    expect(['tiny', 'small']).toContain(result.hue.magnitude)
  })

  it('all none when goal matches current', () => {
    const result = computeDirections({ h: 180, s: 50, v: 50 }, { h: 180, s: 50, v: 50 })
    expect(result.hue.direction).toBe('none')
    expect(result.saturation.direction).toBe('none')
    expect(result.value.direction).toBe('none')
  })
})
