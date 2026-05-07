import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { sampleColor } from '../lib/sampleColor'
import { drawCover } from '../lib/drawCover'
import Crosshair from './Crosshair'
import type { RGB } from '../lib/sampleColor'

type CameraState = 'requesting' | 'active' | 'denied' | 'unavailable'

export default function CameraPanel() {
  const { currentSample } = useAppStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  // RAF loop: draw video → sample cursor position
  useEffect(() => {
    if (cameraState !== 'active') return
    let raf: number
    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState >= 2) {
        const w = canvas.offsetWidth
        const h = canvas.offsetHeight
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w || 1
          canvas.height = h || 1
        }
        const ctx = canvas.getContext('2d')!
        drawCover(ctx, video, canvas.width, canvas.height)

        const pos = cursorRef.current
        if (pos) {
          const now = performance.now()
          if (now - lastUpdateRef.current > 80) {
            lastUpdateRef.current = now
            const color = sampleColor(pos.x, pos.y, canvas)
            const prev = prevColorRef.current
            if (!prev || Math.abs(color.r - prev.r) + Math.abs(color.g - prev.g) + Math.abs(color.b - prev.b) > 2) {
              prevColorRef.current = color
              useAppStore.getState().setCurrentSample(color)
            }
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cameraState])

  function updateCursor(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const pos = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) }
    setCursor(pos)
    cursorRef.current = pos
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updateCursor(e)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
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
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {cameraState === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
          Requesting camera…
        </div>
      )}
      {cursor && <Crosshair x={cursor.x} y={cursor.y} />}

      <div className="absolute top-2 right-2 bg-black/60 text-white/70 text-[10px] px-2 py-0.5 rounded pointer-events-none">
        CURRENT
      </div>
      {currentSample && (
        <div
          className="absolute top-2 left-2 w-5 h-5 rounded-full border border-white/40 shadow"
          style={{ background: `rgb(${currentSample.r},${currentSample.g},${currentSample.b})` }}
        />
      )}
      {!cursor && cameraState === 'active' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-white/40 text-xs">Tap to sample current color</p>
        </div>
      )}
    </div>
  )
}
