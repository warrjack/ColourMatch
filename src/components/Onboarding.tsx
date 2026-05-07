import { useState } from 'react'

const SEEN_KEY = 'colorcoach-onboarding-seen-v2'

export default function Onboarding() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(SEEN_KEY))

  function dismiss() {
    localStorage.setItem(SEEN_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-6 text-white text-center">
      <h1 className="text-xl font-bold mb-4">ColorCoach</h1>
      <ol className="text-sm text-white/80 space-y-2 text-left max-w-xs list-decimal list-inside mb-5">
        <li>Upload a reference image on the <strong>left panel</strong>.</li>
        <li>Point your camera at your Switch screen on the <strong>right panel</strong>.</li>
        <li>Drag the crosshair on the image to your <strong>goal color</strong>.</li>
        <li>Drag the crosshair on the camera to the <strong>current color</strong> on screen.</li>
        <li>Follow the direction bar at the bottom to nudge the HSV picker.</li>
        <li>Adjust on Switch, move the camera crosshair — repeat until matched.</li>
      </ol>
      <p className="text-xs text-white/40 mb-5">Good neutral lighting gives better color accuracy.</p>
      <button
        onClick={dismiss}
        className="px-8 py-3 bg-white text-black font-semibold rounded-full text-sm min-h-[44px]"
      >
        Got it
      </button>
    </div>
  )
}
