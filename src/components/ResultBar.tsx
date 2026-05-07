import { useAppStore } from '../store/useAppStore'
import { rgbToHsv } from '../lib/colorMath'
import { computeDirections } from '../lib/directions'
import type { Directions } from '../lib/directions'

const MAG: Record<string, string> = {
  tiny: 'very slightly', small: 'slightly', medium: '', large: 'a lot',
}

function hueText(d: Directions['hue']): string {
  if (d.direction === 'none') return ''
  const m = MAG[d.magnitude]
  return `Hue: slide ${m ? m + ' ' : ''}${d.direction} toward ${d.targetColorName}`
}

function boxText(d: Directions): string {
  const { saturation: s, value: v } = d
  const dirs = [
    v.direction !== 'none' ? (v.direction === 'up' ? 'up' : 'down') : '',
    s.direction !== 'none' ? (s.direction === 'right' ? 'right' : 'left') : '',
  ].filter(Boolean)
  if (!dirs.length) return ''
  const descs = [
    v.direction !== 'none' ? (v.direction === 'up' ? 'lighter' : 'darker') : '',
    s.direction !== 'none' ? (s.direction === 'right' ? 'more sat.' : 'less sat.') : '',
  ].filter(Boolean)
  return `Box: move ${dirs.join(' & ')} — ${descs.join(', ')}`
}

export default function ResultBar() {
  const { goalSample, currentSample } = useAppStore()

  if (!goalSample || !currentSample) {
    return (
      <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm px-4 py-2 flex items-center justify-center min-h-[36px] pointer-events-none">
        <p className="text-white/40 text-xs">
          {!goalSample ? 'Tap the reference image to set goal color' : 'Tap the camera view to set current color'}
        </p>
      </div>
    )
  }

  const dir = computeDirections(rgbToHsv(goalSample), rgbToHsv(currentSample))
  const isMatch = dir.hue.direction === 'none' && dir.saturation.direction === 'none' && dir.value.direction === 'none'
  const hue = hueText(dir.hue)
  const box = boxText(dir)

  return (
    <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-sm px-3 py-2 flex items-center gap-3 min-h-[44px]">
      {/* Swatches */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-7 h-7 rounded border border-white/20" style={{ background: `rgb(${goalSample.r},${goalSample.g},${goalSample.b})` }} />
        <div className="w-7 h-7 rounded border border-white/20" style={{ background: `rgb(${currentSample.r},${currentSample.g},${currentSample.b})` }} />
      </div>
      {/* Divider */}
      <div className="w-px h-6 bg-white/20 shrink-0" />
      {/* Result */}
      {isMatch ? (
        <p className="text-green-400 font-bold text-base">✓ Match!</p>
      ) : (
        <div className="flex flex-col gap-0.5 min-w-0">
          {hue && <p className="text-white text-xs leading-tight">{hue}</p>}
          {box && <p className="text-white/80 text-xs leading-tight">{box}</p>}
        </div>
      )}
    </div>
  )
}
