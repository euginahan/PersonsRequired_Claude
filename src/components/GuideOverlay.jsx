import { useEffect, useState } from 'react'

export default function GuideOverlay({ targetId, label, onDismiss, enhanced = false }) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!targetId) { setRect(null); return }

    const el = document.querySelector(`[data-guide-id="${targetId}"]`)
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      setTimeout(() => setRect(el.getBoundingClientRect()), 80)
    }

    // Enhanced mode: no auto-dismiss so user can take more time
    if (!enhanced) {
      const timer = setTimeout(onDismiss, 6000)
      return () => clearTimeout(timer)
    }
  }, [targetId, onDismiss, enhanced])

  if (!rect || !targetId) return null

  const pad = enhanced ? 14 : 8
  const spaceBelow = window.innerHeight - rect.bottom
  const tooltipAbove = spaceBelow < 100

  // Arrow positioned above the element, bouncing downward
  const arrowLeft = rect.left + rect.width / 2 - 14
  const arrowTop  = rect.top - pad - 44

  return (
    <div className="guide-root" onClick={onDismiss} role="presentation">
      {/* Spotlight */}
      <div
        className={`guide-highlight${enhanced ? ' guide-highlight--enhanced' : ''}`}
        style={{
          top:    rect.top  - pad,
          left:   rect.left - pad,
          width:  rect.width  + pad * 2,
          height: rect.height + pad * 2,
        }}
      />

      {/* Bouncing arrow in enhanced mode */}
      {enhanced && arrowTop > 0 && (
        <div
          className="guide-arrow"
          style={{ top: arrowTop, left: arrowLeft }}
          aria-hidden="true"
        >
          ▼
        </div>
      )}

      {/* Tooltip */}
      <div
        className={`guide-tooltip${enhanced ? ' guide-tooltip--enhanced' : ''}`}
        style={{
          top:       tooltipAbove ? rect.top - pad - 8 : rect.bottom + pad + 8,
          left:      Math.min(Math.max(rect.left, 12), window.innerWidth - 240),
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
