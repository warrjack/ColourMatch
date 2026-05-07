import { useAppStore, type Step } from '../store/useAppStore'
import type { RGB } from '../lib/sampleColor'

const INSTRUCTIONS: Record<Step, string> = {
  white: 'Freeze frame, then tap the white border on your reference paper',
  goal: 'Tap the color you want to match',
  current: 'Tap the color currently on your Switch',
  result: '',
}

function Swatch({ label, color, onClick }: { label: string; color: RGB | null; onClick?: () => void }) {
  const bg = color ? `rgb(${color.r},${color.g},${color.b})` : undefined
  return (
    <button
      onClick={onClick}
      disabled={!color || !onClick}
      className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center disabled:opacity-40"
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-white/50 shadow"
        style={bg ? { background: bg } : { background: 'rgba(255,255,255,0.1)' }}
      />
      <span className="text-[10px] text-white/60">{label}</span>
    </button>
  )
}

export default function WorkflowOverlay() {
  const { step, whiteSample, goalSample, currentSample, reset, resampleCurrent, setStep } = useAppStore()

  return (
    <div className="absolute inset-x-0 top-0 z-30 pointer-events-none">
      {/* Instruction banner */}
      {step !== 'result' && (
        <div className="pointer-events-auto mx-4 mt-4 px-4 py-3 bg-black/70 rounded-xl text-white text-sm text-center backdrop-blur-sm">
          {INSTRUCTIONS[step]}
        </div>
      )}

      {/* Sample chips — tappable to re-do individual samples */}
      <div className="pointer-events-auto flex gap-2 justify-center mt-2 px-4">
        <Swatch
          label="White"
          color={whiteSample}
          onClick={whiteSample ? () => setStep('white') : undefined}
        />
        <Swatch
          label="Goal"
          color={goalSample}
          onClick={goalSample ? () => setStep('goal') : undefined}
        />
        <Swatch
          label="Current"
          color={currentSample}
          onClick={step === 'result' ? resampleCurrent : undefined}
        />
      </div>

      {/* Action buttons */}
      <div className="pointer-events-auto flex gap-3 justify-center mt-2 px-4">
        <button
          onClick={reset}
          className="px-4 py-2 min-h-[44px] bg-black/60 text-white/80 text-xs rounded-full backdrop-blur-sm"
        >
          Reset
        </button>
        {step === 'result' && (
          <button
            onClick={resampleCurrent}
            className="px-4 py-2 min-h-[44px] bg-white/90 text-black text-xs font-semibold rounded-full"
          >
            Re-sample Current
          </button>
        )}
      </div>
    </div>
  )
}
