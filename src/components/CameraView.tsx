import { useEffect, useRef, useState } from 'react'

type CameraState = 'requesting' | 'active' | 'denied' | 'unavailable'
type FreezeState = 'live' | 'frozen'

interface CameraViewProps {
  onTap?: (x: number, y: number, canvas: HTMLCanvasElement) => void
}

export default function CameraView({ onTap }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraState, setCameraState] = useState<CameraState>('requesting')
  const [freezeState, setFreezeState] = useState<FreezeState>('live')

  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('unavailable')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraState('active')
      } catch (err) {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setCameraState('denied')
        } else {
          setCameraState('unavailable')
        }
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function freeze() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    setFreezeState('frozen')
  }

  function unfreeze() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setFreezeState('live')
  }

  function handleCanvasTap(e: React.PointerEvent<HTMLCanvasElement>) {
    if (freezeState !== 'frozen') return
    const canvas = canvasRef.current
    if (!canvas || !onTap) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.round((e.clientX - rect.left) * scaleX)
    const y = Math.round((e.clientY - rect.top) * scaleY)
    onTap(x, y, canvas)
  }

  if (cameraState === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 px-6 text-center">
        <p className="text-lg">Camera access was denied.</p>
        <p className="text-sm text-gray-400">Allow camera access in your browser settings, then try again.</p>
        <button
          onClick={() => setCameraState('requesting')}
          className="mt-2 px-6 py-3 bg-white text-black rounded-full text-sm font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  if (cameraState === 'unavailable') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4 px-6 text-center">
        <p className="text-lg">Camera not available.</p>
        <p className="text-sm text-gray-400">Make sure your device has a camera and you're using HTTPS.</p>
      </div>
    )
  }

  return (
    <>
      {/* Portrait warning */}
      <div className="hidden portrait:flex items-center justify-center min-h-screen bg-black text-white text-center px-6">
        <p className="text-lg">Rotate your phone to landscape mode.</p>
      </div>

      <div className="portrait:hidden relative w-full h-full bg-black overflow-hidden">
        {cameraState === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm z-10">
            Requesting camera…
          </div>
        )}

        {/* Live video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: freezeState === 'live' ? 'block' : 'none' }}
        />

        {/* Frozen canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: freezeState === 'frozen' ? 'block' : 'none' }}
          onPointerDown={handleCanvasTap}
        />

        {/* Freeze/Unfreeze button */}
        {cameraState === 'active' && (
          <button
            onClick={freezeState === 'live' ? freeze : unfreeze}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-8 py-4 bg-white/90 text-black font-semibold rounded-full text-base shadow-lg min-h-[60px]"
          >
            {freezeState === 'live' ? 'Freeze' : 'Unfreeze'}
          </button>
        )}
      </div>
    </>
  )
}
