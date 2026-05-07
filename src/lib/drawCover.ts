export function drawCover(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLVideoElement,
  w: number,
  h: number
) {
  const sw = 'videoWidth' in source ? source.videoWidth : source.naturalWidth
  const sh = 'videoHeight' in source ? source.videoHeight : source.naturalHeight
  if (!sw || !sh) return
  const scale = Math.max(w / sw, h / sh)
  const dx = (w - sw * scale) / 2
  const dy = (h - sh * scale) / 2
  ctx.drawImage(source, dx, dy, sw * scale, sh * scale)
}
