import { useState } from 'react'
import { rgbToHsv } from '../lib/colorMath'
import type { RGB } from '../lib/sampleColor'

export default function ColorInfo({ color }: { color: RGB | null }) {
  const [show, setShow] = useState(false)

  return (
    <div className="absolute bottom-2 right-2 z-20 flex flex-col items-end gap-1">
      {show && color && (() => {
        const hsv = rgbToHsv(color)
        const bg = `rgb(${color.r},${color.g},${color.b})`
        return (
          <div className="bg-black/90 border border-white/10 rounded-xl p-3 text-xs shadow-xl min-w-[148px]">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded border border-white/20" style={{ background: bg }} />
              <span className="text-white/40 uppercase tracking-wide text-[10px]">Color values</span>
            </div>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-white/40">H</span>
                <span className="text-white font-semibold">{Math.round(hsv.h)}°</span>
                <span className="text-white/30 text-[10px]">slider pos</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-white/40">S</span>
                <span className="text-white font-semibold">{Math.round(hsv.s)}%</span>
                <span className="text-white/30 text-[10px]">box X</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-white/40">V</span>
                <span className="text-white font-semibold">{Math.round(hsv.v)}%</span>
                <span className="text-white/30 text-[10px]">box Y</span>
              </div>
              <div className="border-t border-white/10 pt-1.5 mt-1 text-white/40 space-y-1">
                <div className="flex justify-between">
                  <span>R</span><span>{color.r}</span>
                </div>
                <div className="flex justify-between">
                  <span>G</span><span>{color.g}</span>
                </div>
                <div className="flex justify-between">
                  <span>B</span><span>{color.b}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      <button
        onClick={() => setShow(v => !v)}
        className={`w-7 h-7 rounded-full border text-xs font-semibold flex items-center justify-center transition-colors ${
          show
            ? 'bg-white text-black border-white'
            : 'bg-black/50 text-white/60 border-white/30'
        } ${!color ? 'opacity-30 pointer-events-none' : ''}`}
      >
        i
      </button>
    </div>
  )
}
