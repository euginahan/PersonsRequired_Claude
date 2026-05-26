import { useState, useRef, cloneElement } from 'react'
import { Rnd } from 'react-rnd'

const INITIAL_W = 400
const INITIAL_H = 580
const MIN_W = 320
const MIN_H = 400

function getInitialPos() {
  return {
    x: Math.max(0, window.innerWidth - INITIAL_W - 24),
    y: 72,
  }
}

export default function FloatingPanel({ children, onClose, language, actionCount, reminderCount = 0 }) {
  const [pos, setPos]           = useState(getInitialPos)
  const [size, setSize]         = useState({ width: INITIAL_W, height: INITIAL_H })
  const [minimized, setMinimized] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const savedSize = useRef({ width: INITIAL_W, height: INITIAL_H })

  const langLabel = { korean: '한국어', english: 'English', bilingual: '둘 다', simple: '쉬운 English' }[language] ?? '한국어'

  function handleMinimize() {
    savedSize.current = size
    setIsExiting(true)
    setTimeout(() => { setIsExiting(false); setMinimized(true) }, 180)
  }

  function handleExpand() {
    setMinimized(false)
    setSize(savedSize.current)
  }

  const totalBadge = actionCount + reminderCount

  if (minimized) {
    return (
      <Rnd
        position={pos}
        size={{ width: 200, height: 44 }}
        onDragStop={(_, d) => setPos({ x: d.x, y: d.y })}
        disableResizing
        bounds="window"
        dragHandleClassName="fp-pill"
        style={{ zIndex: 900 }}
      >
        <button className="fp-pill" onClick={handleExpand} title="이메일 도우미 열기">
          <span className="fp-pill__icon">🇰🇷</span>
          <span className="fp-pill__lang">{langLabel}</span>
          {reminderCount > 0 && (
            <span className="fp-pill__bell">🔔</span>
          )}
          {totalBadge > 0
            ? <span className="fp-pill__badge">{totalBadge}</span>
            : <span className="fp-pill__dot" />
          }
        </button>
      </Rnd>
    )
  }

  return (
    <Rnd
      position={pos}
      size={size}
      onDragStop={(_, d) => setPos({ x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, position) => {
        setSize({ width: ref.offsetWidth, height: ref.offsetHeight })
        setPos(position)
      }}
      bounds="window"
      dragHandleClassName="helper-panel__header"
      minWidth={MIN_W}
      minHeight={MIN_H}
      style={{ zIndex: 900 }}
    >
      <div className={`fp-window${isExiting ? ' fp-window--exiting' : ''}`}>
        {cloneElement(children, { onMinimize: handleMinimize })}
      </div>
    </Rnd>
  )
}
