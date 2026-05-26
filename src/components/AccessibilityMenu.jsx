import { useState, useRef, useEffect } from 'react'

const READ_SELECTORS = [
  '.status-card__action',
  '.summary-card__text',
  '.summary-card__list-item',
  '.checklist-item__text',
  '.date-card__meaning',
  '.walkthrough-bar__instruction',
  '.safety-verdict__result',
  '.safety-verdict__explanation',
  '.esc-mode-text',
]

export default function AccessibilityMenu({ settings, onChange, language }) {
  const [open, setOpen]           = useState(false)
  const [readState, setReadState] = useState('idle') // 'idle' | 'reading' | 'paused'
  const menuRef      = useRef(null)
  const highlightRef = useRef(null)
  const isActiveRef  = useRef(false)
  const isKorean = language === 'korean' || language === 'bilingual'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      window.speechSynthesis?.cancel()
      clearHighlight()
    }
  }, [])

  function clearHighlight() {
    if (highlightRef.current) {
      highlightRef.current.classList.remove('read-aloud-highlight')
      highlightRef.current = null
    }
  }

  function highlightEl(el) {
    clearHighlight()
    if (!el) return
    el.classList.add('read-aloud-highlight')
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    highlightRef.current = el
  }

  function gatherReadables() {
    const seen  = new Set()
    const items = []
    READ_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        const text = el.textContent?.trim()
        if (text && text.length > 2) items.push({ el, text })
      })
    })
    return items
  }

  function startReading() {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const items = gatherReadables()
    if (!items.length) return

    isActiveRef.current = true
    setReadState('reading')
    let idx = 0

    function speakNext() {
      if (!isActiveRef.current) return
      if (idx >= items.length) {
        clearHighlight()
        setReadState('idle')
        return
      }
      const { el, text } = items[idx]
      highlightEl(el)

      const utt   = new SpeechSynthesisUtterance(text)
      utt.lang    = language === 'korean' ? 'ko-KR' : 'en-US'
      utt.rate    = 0.9
      utt.onend   = () => { idx++; speakNext() }
      utt.onerror = () => { idx++; speakNext() }
      window.speechSynthesis.speak(utt)
    }

    speakNext()
  }

  function pauseReading() {
    window.speechSynthesis.pause()
    setReadState('paused')
  }

  function resumeReading() {
    window.speechSynthesis.resume()
    setReadState('reading')
  }

  function stopReading() {
    isActiveRef.current = false
    window.speechSynthesis.cancel()
    clearHighlight()
    setReadState('idle')
  }

  function toggle(key) {
    onChange({ ...settings, [key]: !settings[key] })
  }

  function setFontSize(size) {
    onChange({ ...settings, fontSize: size })
  }

  const isReading = readState !== 'idle'

  return (
    <div className="a11y-menu" ref={menuRef}>
      <button
        className={`a11y-toggle${open ? ' a11y-toggle--open' : ''}${isReading ? ' a11y-toggle--reading' : ''}`}
        onClick={() => setOpen(v => !v)}
        title={isKorean ? '접근성 설정' : 'Accessibility settings'}
        aria-label={isKorean ? '접근성 설정' : 'Accessibility settings'}
      >
        {isReading ? '🔊' : '⚙'}
      </button>

      {open && (
        <div className="a11y-dropdown">
          <div className="a11y-dropdown__title">
            {isKorean ? '화면 설정' : 'Display Settings'}
          </div>

          {/* Font size */}
          <div className="a11y-row">
            <span className="a11y-row__label">{isKorean ? '글자 크기' : 'Text size'}</span>
            <div className="a11y-row__btns">
              {['normal', 'large', 'xl'].map(size => (
                <button
                  key={size}
                  className={`a11y-size-btn${settings.fontSize === size ? ' a11y-size-btn--active' : ''}`}
                  onClick={() => setFontSize(size)}
                >
                  {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <label className="a11y-toggle-row">
            <span className="a11y-row__label">{isKorean ? '고대비 모드' : 'High contrast'}</span>
            <button
              className={`a11y-switch${settings.highContrast ? ' a11y-switch--on' : ''}`}
              onClick={() => toggle('highContrast')}
              role="switch"
              aria-checked={settings.highContrast}
            >
              <span className="a11y-switch__thumb" />
            </button>
          </label>

          {/* Reduce motion */}
          <label className="a11y-toggle-row">
            <span className="a11y-row__label">{isKorean ? '모션 줄이기' : 'Reduce motion'}</span>
            <button
              className={`a11y-switch${settings.reduceMotion ? ' a11y-switch--on' : ''}`}
              onClick={() => toggle('reduceMotion')}
              role="switch"
              aria-checked={settings.reduceMotion}
            >
              <span className="a11y-switch__thumb" />
            </button>
          </label>

          {/* Simplified view */}
          <label className="a11y-toggle-row">
            <span className="a11y-row__label">{isKorean ? '간단히 보기' : 'Simplified view'}</span>
            <button
              className={`a11y-switch${settings.simplified ? ' a11y-switch--on' : ''}`}
              onClick={() => toggle('simplified')}
              role="switch"
              aria-checked={settings.simplified}
            >
              <span className="a11y-switch__thumb" />
            </button>
          </label>

          {/* Read aloud — idle: start button | active: controls */}
          {readState === 'idle' ? (
            <button className="a11y-read-btn" onClick={startReading}>
              🔊 {isKorean ? '소리로 읽기' : 'Read aloud'}
            </button>
          ) : (
            <div className="a11y-read-controls">
              <div className="a11y-read-controls__status">
                <span className={`a11y-read-controls__dot${readState === 'reading' ? ' a11y-read-controls__dot--active' : ''}`} />
                {isKorean
                  ? (readState === 'paused' ? '⏸ 일시정지됨' : '🔊 읽는 중...')
                  : (readState === 'paused' ? '⏸ Paused' : '🔊 Reading...')}
              </div>
              <div className="a11y-read-controls__btns">
                {readState === 'reading' ? (
                  <button className="a11y-read-ctrl-btn" onClick={pauseReading}>
                    ⏸ {isKorean ? '일시정지' : 'Pause'}
                  </button>
                ) : (
                  <button className="a11y-read-ctrl-btn" onClick={resumeReading}>
                    ▶ {isKorean ? '재개' : 'Resume'}
                  </button>
                )}
                <button className="a11y-read-ctrl-btn a11y-read-ctrl-btn--stop" onClick={stopReading}>
                  ⏹ {isKorean ? '중지' : 'Stop'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
