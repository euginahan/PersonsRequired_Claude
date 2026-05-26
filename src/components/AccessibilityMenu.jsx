import { useState, useRef, useEffect } from 'react'

export default function AccessibilityMenu({ settings, onChange, language }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isKorean = language === 'korean' || language === 'bilingual'

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(key) {
    onChange({ ...settings, [key]: !settings[key] })
  }

  function setFontSize(size) {
    onChange({ ...settings, fontSize: size })
  }

  return (
    <div className="a11y-menu" ref={ref}>
      <button
        className={`a11y-toggle${open ? ' a11y-toggle--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        title={isKorean ? '접근성 설정' : 'Accessibility settings'}
        aria-label={isKorean ? '접근성 설정' : 'Accessibility settings'}
      >
        ⚙
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

          {/* Read aloud */}
          <button
            className="a11y-read-btn"
            onClick={() => {
              const text = isKorean
                ? document.querySelector('.summary-card__text')?.textContent ?? ''
                : document.querySelector('.summary-card__text')?.textContent ?? ''
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel()
                const utt = new SpeechSynthesisUtterance(text)
                utt.lang = language === 'korean' ? 'ko-KR' : 'en-US'
                window.speechSynthesis.speak(utt)
              }
            }}
          >
            🔊 {isKorean ? '소리로 읽기' : 'Read aloud'}
          </button>
        </div>
      )}
    </div>
  )
}
