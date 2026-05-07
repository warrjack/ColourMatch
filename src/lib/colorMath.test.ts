import { describe, it, expect } from 'vitest'
import { rgbToHsv, applyWhiteBalance } from './colorMath'

describe('rgbToHsv', () => {
  it('pure red → h:0 s:100 v:100', () => {
    const result = rgbToHsv({ r: 255, g: 0, b: 0 })
    expect(result.h).toBe(0)
    expect(result.s).toBeCloseTo(100)
    expect(result.v).toBeCloseTo(100)
  })

  it('pure green → h:120 s:100 v:100', () => {
    const result = rgbToHsv({ r: 0, g: 255, b: 0 })
    expect(result.h).toBe(120)
    expect(result.s).toBeCloseTo(100)
    expect(result.v).toBeCloseTo(100)
  })

  it('pure blue → h:240 s:100 v:100', () => {
    const result = rgbToHsv({ r: 0, g: 0, b: 255 })
    expect(result.h).toBe(240)
    expect(result.s).toBeCloseTo(100)
    expect(result.v).toBeCloseTo(100)
  })

  it('white → h:0 s:0 v:100', () => {
    const result = rgbToHsv({ r: 255, g: 255, b: 255 })
    expect(result.h).toBe(0)
    expect(result.s).toBe(0)
    expect(result.v).toBeCloseTo(100)
  })

  it('black → h:0 s:0 v:0', () => {
    const result = rgbToHsv({ r: 0, g: 0, b: 0 })
    expect(result.h).toBe(0)
    expect(result.s).toBe(0)
    expect(result.v).toBe(0)
  })

  it('mid gray → s:0', () => {
    const result = rgbToHsv({ r: 128, g: 128, b: 128 })
    expect(result.s).toBe(0)
  })
})

describe('applyWhiteBalance', () => {
  it('scales channels so white ref maps to 255', () => {
    const sample = { r: 128, g: 128, b: 128 }
    const white = { r: 200, g: 200, b: 200 }
    const result = applyWhiteBalance(sample, white)
    expect(result.r).toBe(163)
    expect(result.g).toBe(163)
    expect(result.b).toBe(163)
  })

  it('clamps at 255', () => {
    const result = applyWhiteBalance({ r: 255, g: 255, b: 255 }, { r: 100, g: 100, b: 100 })
    expect(result.r).toBe(255)
    expect(result.g).toBe(255)
    expect(result.b).toBe(255)
  })

  it('neutral white ref leaves sample unchanged', () => {
    const sample = { r: 100, g: 150, b: 200 }
    const result = applyWhiteBalance(sample, { r: 255, g: 255, b: 255 })
    expect(result).toEqual(sample)
  })
})
