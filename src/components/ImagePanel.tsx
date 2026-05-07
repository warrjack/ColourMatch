import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { sampleColor } from '../lib/sampleColor'
import { drawCover } from '../lib/drawCover'
import Crosshair from './Crosshair'
import ColorInfo from './ColorInfo'

export default function ImagePanel() {
  const { uploadedImage, goalSample, setUploadedImage } = useAppStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  // Redraw image when it loads or canvas mounts
  useEffect(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    requestAnimationFrame(() => {
      canvas.width = canvas.offsetWidth || 1
      canvas.height = canvas.offsetHeight || 1
      drawCover(canvas.getContext('2d')!, img, canvas.width, canvas.height)
    })
  }, [uploadedImage])

  function loadFile(file: File) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setUploadedImage(url)
      setCursor(null)
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        const canvas = canvasRef.current
        if (!canvas) return
        requestAnimationFrame(() => {
          canvas.width = canvas.offsetWidth || 1
          canvas.height = canvas.offsetHeight || 1
          drawCover(canvas.getContext('2d')!, img, canvas.width, canvas.height)
        })
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) loadFile(file)
  }

  function updateCursor(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    setCursor({ x, y })
    useAppStore.getState().setGoalSample(sampleColor(x, y, canvas))
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

  if (!uploadedImage) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 gap-3"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-white/50 text-xs text-center px-4">Upload or drop a reference image</p>
        <label className="px-5 py-2.5 bg-white text-black font-semibold rounded-full text-sm cursor-pointer min-h-[44px] flex items-center">
          Choose Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {cursor && <Crosshair x={cursor.x} y={cursor.y} />}

      <div className="absolute top-2 left-2 bg-black/60 text-white/70 text-[10px] px-2 py-0.5 rounded pointer-events-none">
        GOAL
      </div>
      {goalSample && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full border border-white/40 shadow"
          style={{ background: `rgb(${goalSample.r},${goalSample.g},${goalSample.b})` }}
        />
      )}
      {!cursor && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-white/40 text-xs">Tap to sample goal color</p>
        </div>
      )}

      <label className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/60 text-white/60 text-xs rounded-full cursor-pointer min-h-[44px] flex items-center">
        Change
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
      <ColorInfo color={goalSample} />
    </div>
  )
}
