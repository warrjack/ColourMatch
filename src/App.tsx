import { useState } from 'react'
import CameraView from './components/CameraView'
import WorkflowOverlay from './components/WorkflowOverlay'
import ResultDisplay from './components/ResultDisplay'
import Onboarding from './components/Onboarding'
import Footer from './components/Footer'
import { sampleColor } from './lib/sampleColor'
import { useAppStore } from './store/useAppStore'
import { useWakeLock } from './lib/useWakeLock'

const DIM_THRESHOLD = 180

export default function App() {
  const { step, advanceStep, whiteSample } = useAppStore()
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null)
  const [dimWarning, setDimWarning] = useState(false)
  useWakeLock()

  function handleTap(x: number, y: number, canvas: HTMLCanvasElement) {
    if (step === 'result') return
    const color = sampleColor(x, y, canvas)

    // Show crosshair at display-space coords
    const rect = canvas.getBoundingClientRect()
    const dispX = (x / canvas.width) * rect.width + rect.left
    const dispY = (y / canvas.height) * rect.height + rect.top
    setCrosshair({ x: dispX, y: dispY })

    // Lighting warning after white sample
    if (step === 'white') {
      const isDim = color.r < DIM_THRESHOLD || color.g < DIM_THRESHOLD || color.b < DIM_THRESHOLD
      setDimWarning(isDim)
    }

    advanceStep(color)
  }

  // Also warn when existing whiteSample is dim
  const showDimWarning = dimWarning || (
    whiteSample != null && (whiteSample.r < DIM_THRESHOLD || whiteSample.g < DIM_THRESHOLD || whiteSample.b < DIM_THRESHOLD)
  )

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black"
      style={{ touchAction: 'none' }}
    >
      <CameraView onTap={handleTap} />
      <WorkflowOverlay />
      {step === 'result' && <ResultDisplay />}

      {/* Crosshair */}
      {crosshair && step !== 'result' && (
        <div
          className="absolute z-40 pointer-events-none"
          style={{ left: crosshair.x - 12, top: crosshair.y - 12 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <line x1="12" y1="0" x2="12" y2="9" />
            <line x1="12" y1="15" x2="12" y2="24" />
            <line x1="0" y1="12" x2="9" y2="12" />
            <line x1="15" y1="12" x2="24" y2="12" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      )}

      {/* Lighting warning */}
      {showDimWarning && step !== 'result' && (
        <div className="absolute bottom-24 inset-x-4 z-40 bg-yellow-500/90 text-black text-xs text-center px-4 py-2 rounded-xl pointer-events-none">
          Lighting may be too dim — try a brighter spot.
        </div>
      )}

      <Onboarding />
      <Footer />
    </div>
  )
}
