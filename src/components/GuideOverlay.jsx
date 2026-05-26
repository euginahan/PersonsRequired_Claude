import { useEffect, useState } from 'react'

export default function GuideOverlay({ targetId, label, onDismiss }) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!targetId) { setRect(null); return }

    const el = document.querySelector(`[data-guide-id="${targetId}"]`)
    if (el) {
      // Scroll element into view first, then measure
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      setTimeout(() => setRect(el.getBoundingClientRect()), 80)
    }

    const timer = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timer)
  }, [targetId, onDismiss])

  if (!rect || !targetId) return null

  const pad = 8
  const spaceBelow = window.innerHeight - rect.bottom
  const tooltipAbove = spaceBelow < 80

  return (
    <div className="guide-root" onClick={onDismiss} role="presentation">
      {/* Spotlight: box-shadow creates the dim effect around the highlighted element */}
      <div
        className="guide-highlight"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />

      {/* Tooltip with step instructions */}
      <div
        className="guide-tooltip"
        style={{
          top: tooltipAbove ? rect.top - pad - 8 : rect.bottom + pad + 8,
          left: Math.min(Math.max(rect.left, 12), window.innerWidth - 220),
          transform: tooltipAbove ? 'translateY(-100%)' : 'none',
        }}
        onClick={e => { e.stopPropagation(); onDismiss() }}
      >
        <div className="guide-tooltip__steps">
          {label.split('\n').map((line, i) => (
            <div key={i} className="guide-tooltip__line">{line}</div>
          ))}
        </div>
        <button className="guide-tooltip__dismiss" aria-label="닫기">✕</button>
      </div>
    </div>
  )
}
