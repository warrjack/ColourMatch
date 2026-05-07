import { useState } from 'react'

const SEEN_KEY = 'colorcoach-onboarding-seen'

export default function Onboarding() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(SEEN_KEY))

  function dismiss() {
    localStorage.setItem(SEEN_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-6 text-white text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome to ColorCoach</h1>
      <ol className="text-sm text-white/80 space-y-3 text-left max-w-xs list-decimal list-inside mb-6">
        <li>Print your reference image with a <strong>~1 cm pure-white border</strong>.</li>
        <li>Prop your phone so the camera sees both the paper and your Switch.</li>
        <li>Freeze the frame, then tap the white border to calibrate.</li>
        <li>Tap your goal color on the paper.</li>
        <li>Tap the current color on the Switch screen.</li>
        <li>Follow the on-screen directions to nudge the HSV picker.</li>
      </ol>
      <p className="text-xs text-white/50 mb-6">Good lighting = better results. Neutral white light is ideal.</p>
      <button
        onClick={dismiss}
        className="px-8 py-3 bg-white text-black font-semibold rounded-full text-base min-h-[44px] min-w-[44px]"
      >
        Got it
      </button>
    </div>
  )
}
