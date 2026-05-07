export default function Crosshair({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x - 14, top: y - 14 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <line x1="14" y1="2" x2="14" y2="11" stroke="black" strokeWidth="2.5"/>
        <line x1="14" y1="17" x2="14" y2="26" stroke="black" strokeWidth="2.5"/>
        <line x1="2" y1="14" x2="11" y2="14" stroke="black" strokeWidth="2.5"/>
        <line x1="17" y1="14" x2="26" y2="14" stroke="black" strokeWidth="2.5"/>
        <line x1="14" y1="2" x2="14" y2="11" stroke="white" strokeWidth="1.5"/>
        <line x1="14" y1="17" x2="14" y2="26" stroke="white" strokeWidth="1.5"/>
        <line x1="2" y1="14" x2="11" y2="14" stroke="white" strokeWidth="1.5"/>
        <line x1="17" y1="14" x2="26" y2="14" stroke="white" strokeWidth="1.5"/>
        <circle cx="14" cy="14" r="3.5" stroke="black" strokeWidth="2.5"/>
        <circle cx="14" cy="14" r="3.5" stroke="white" strokeWidth="1.5"/>
      </svg>
    </div>
  )
}
