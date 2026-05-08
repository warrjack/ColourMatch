import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { sampleColor } from '../lib/sampleColor'
import Crosshair from './Crosshair'
import ColorInfo from './ColorInfo'
import type { RGB } from '../lib/sampleColor'

type CameraState = 'requesting' | 'active' | 'denied' | 'unavailable'

// Maps a display-space point (from an object-cover video) back to video natural coords
function displayToVideo(
  px: number, py: number,
  displayW: number, displayH: number,
  videoW: number, videoH: number
): { x: number; y: number } {
  const scale = Math.max(displayW / videoW, displayH / videoH)
  const dx = (displayW - videoW * scale) / 2
  const dy = (displayH - videoH * scale) / 2
  return {
    x: Math.round((px - dx) / scale),
    y: Math.round((py - dy) / scale),
  }
}

export default function CameraPanel() {
  const { currentSample } = useAppStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const samplingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraState, setCameraState] = useState<CameraState>('requesting')
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const cursorRef = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const prevColorRef = useRef<RGB | null>(null)
  const lastUpdateRef = useRef(0)

  useEffect(() => {
    let stream: MediaStream | null = null
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) { setCameraState('unavailable'); return }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraState('active')
      } catch (err) {
        setCameraState(err instanceof DOMException && err.name === 'NotAllowedError' ? 'denied' : 'unavailable')
      }
    }
    start()
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  // RAF loop: only runs sampling — video renders itself natively
  useEffect(() => {
    if (cameraState !== 'active') return
    let raf: number

    function tick() {
      const video = videoRef.current
      const canvas = samplingCanvasRef.current
      const container = containerRef.current
      const pos = cursorRef.current

      if (pos && video && canvas && container && video.readyState >= 2 && video.videoWidth > 0) {
        const now = performance.now()
        if (now - lastUpdateRef.current > 80) {
          lastUpdateRef.current = now

          // Keep sampling canvas matched to video's natural resolution
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
          }
          canvas.getContext('2d')!.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

          // Map display cursor coords → video pixel coords
          const { width: dw, height: dh } = container.getBoundingClientRect()
          const mapped = displayToVideo(pos.x, pos.y, dw, dh, video.videoWidth, video.videoHeight)
          const cx = Math.max(7, Math.min(canvas.width - 8, mapped.x))
          const cy = Math.max(7, Math.min(canvas.height - 8, mapped.y))

          const color = sampleColor(cx, cy, canvas)
          const prev = prevColorRef.current
          if (!prev || Math.abs(color.r - prev.r) + Math.abs(color.g - prev.g) + Math.abs(color.b - prev.b) > 2) {
            prevColorRef.current = color
            useAppStore.getState().setCurrentSample(color)
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cameraState])

  function updateCursor(e: React.PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current!.getBoundingClientRect()
    const pos = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) }
    setCursor(pos)
    cursorRef.current = pos
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateCursor(e)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (isDragging.current) updateCursor(e)
  }

  function handlePointerUp() { isDragging.current = false }

  if (cameraState === 'denied') return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white gap-2 text-center px-4">
      <p className="text-sm">Camera access denied.</p>
      <p className="text-xs text-white/40">Allow camera in browser settings and reload.</p>
    </div>
  )

  if (cameraState === 'unavailable') return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white gap-2 text-center px-4">
      <p className="text-sm">Camera unavailable.</p>
      <p className="text-xs text-white/40">Use HTTPS and ensure your device has a camera.</p>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Video rendered natively — never display:none, so mobile keeps decoding frames */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }}
      />

      {/* Off-screen canvas used only for pixel sampling — not displayed */}
      <canvas ref={samplingCanvasRef} style={{ display: 'none' }} />

      {cameraState === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs z-10">
          Requesting camera…
        </div>
      )}

      {cursor && <Crosshair x={cursor.x} y={cursor.y} />}

      <div className="absolute top-2 right-2 bg-black/60 text-white/70 text-[10px] px-2 py-0.5 rounded pointer-events-none z-10">
        CURRENT
      </div>
      {currentSample && (
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-full border border-white/40 shadow z-10"
          style={{ background: `rgb(${currentSample.r},${currentSample.g},${currentSample.b})` }}
        />
      )}
      {!cursor && cameraState === 'active' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p className="text-white/40 text-xs">Tap to sample current color</p>
        </div>
      )}
      <ColorInfo color={currentSample} />
    </div>
  )
}
