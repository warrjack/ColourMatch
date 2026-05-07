import { computeDirections } from '../lib/directions'
import { correctedHsv } from '../lib/colorMath'
import type { RGB } from '../lib/sampleColor'
import type { HSV } from '../lib/colorMath'
import type { Directions } from '../lib/directions'
import { useAppStore } from '../store/useAppStore'

function SwatchCard({ label, color, hsv }: { label: string; color: RGB; hsv: HSV }) {
  const bg = `rgb(${color.r},${color.g},${color.b})`
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-lg border-2 border-white/30 shadow-lg" style={{ background: bg }} />
      <span className="text-white text-xs font-medium">{label}</span>
      <span className="text-white/50 text-[10px]">
        H:{Math.round(hsv.h)} S:{Math.round(hsv.s)} V:{Math.round(hsv.v)}
      </span>
    </div>
  )
}

const MAGNITUDE_WORDS: Record<string, string> = {
  tiny: 'very slightly',
  small: 'slightly',
  medium: '',
  large: 'a lot',
}

function hueText(d: Directions['hue']): string {
  if (d.direction === 'none') return ''
  const mag = MAGNITUDE_WORDS[d.magnitude]
  return `Slide ${mag ? mag + ' ' : ''}${d.direction} toward ${d.targetColorName}.`
}

function boxText(d: Directions): string {
  const { saturation: s, value: v } = d
  const parts: string[] = []

  if (v.direction !== 'none') parts.push(v.direction === 'up' ? 'up' : 'down')
  if (s.direction !== 'none') parts.push(s.direction === 'right' ? 'right' : 'left')

  if (parts.length === 0) return ''

  const vDesc = v.direction !== 'none' ? (v.direction === 'up' ? 'lighter' : 'darker') : ''
  const sDesc = s.direction !== 'none' ? (s.direction === 'right' ? 'more saturated' : 'less saturated') : ''
  const descs = [vDesc, sDesc].filter(Boolean).join(', ')

  return `Move ${parts.join(' and ')} — ${descs}.`
}

export default function ResultDisplay() {
  const { whiteSample, goalSample, currentSample, resampleCurrent } = useAppStore()
  if (!whiteSample || !goalSample || !currentSample) return null

  const goalHsv = correctedHsv(goalSample, whiteSample)
  const currentHsv = correctedHsv(currentSample, whiteSample)
  const dir = computeDirections(goalHsv, currentHsv)

  const isMatch = dir.hue.direction === 'none' && dir.saturation.direction === 'none' && dir.value.direction === 'none'
  const hue = hueText(dir.hue)
  const box = boxText(dir)

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 mx-3 mb-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4">
      {/* Swatches */}
      <div className="flex justify-center gap-8 mb-4">
        <SwatchCard label="Goal" color={goalSample} hsv={goalHsv} />
        <SwatchCard label="Current" color={currentSample} hsv={currentHsv} />
      </div>

      {isMatch ? (
        <p className="text-green-400 text-2xl font-bold text-center mb-3">✓ Match!</p>
      ) : (
        <div className="space-y-2 mb-3">
          {hue && (
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <span className="text-white/50 text-xs uppercase tracking-wide">Hue</span>
              <p className="text-white text-base font-medium leading-snug">{hue}</p>
            </div>
          )}
          {box && (
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <span className="text-white/50 text-xs uppercase tracking-wide">Box</span>
              <p className="text-white text-base font-medium leading-snug">{box}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={resampleCurrent}
        className="w-full py-3 bg-white text-black font-semibold rounded-xl text-sm"
      >
        Re-sample Current
      </button>
    </div>
  )
}
