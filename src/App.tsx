import ImagePanel from './components/ImagePanel'
import CameraPanel from './components/CameraPanel'
import ResultBar from './components/ResultBar'
import Onboarding from './components/Onboarding'
import Footer from './components/Footer'
import { useWakeLock } from './lib/useWakeLock'

export default function App() {
  useWakeLock()

  return (
    <>
      {/* Portrait warning */}
      <div className="hidden portrait:flex items-center justify-center w-screen h-screen bg-black text-white text-center px-6">
        <p>Rotate your phone to landscape mode.</p>
      </div>

      <div className="portrait:hidden flex w-screen h-screen overflow-hidden bg-black" style={{ paddingBottom: 44 }}>
        <div className="flex-1 border-r border-white/10 min-w-0">
          <ImagePanel />
        </div>
        <div className="flex-1 min-w-0">
          <CameraPanel />
        </div>
      </div>

      <ResultBar />
      <Onboarding />
      <Footer />
    </>
  )
}
