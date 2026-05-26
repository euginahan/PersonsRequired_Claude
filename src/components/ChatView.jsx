import { useRef, useEffect } from 'react'

export default function ChatView({ presets, language, chatHistory, onSelect }) {
  const askedIds = new Set(chatHistory.filter(m => m.role === 'user').map(m => m.presetId))
  const showKorean = language === 'korean' || language === 'bilingual'
  const showEnglish = language === 'english' || language === 'bilingual' || language === 'simple'
  const historyRef = useRef(null)

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [chatHistory])

  return (
    <div className="chat-view">
      {chatHistory.length === 0 && (
        <div className="chat-view__greeting">
          <span className="chat-view__greeting-icon">👋</span>
          {showKorean && <p>궁금한 점이 있으면 아래에서 질문을 선택하세요.</p>}
          {showEnglish && (
            <p className="summary-card__text--secondary">
              {language === 'simple'
                ? 'Tap a question below to get help.'
                : 'Select a question below if you need more help.'
              }
            </p>
          )}
        </div>
      )}

      <div className="chat-view__history" ref={historyRef}>
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-view__presets">
        <div className="chat-view__presets-label">
          {showKorean && '자주 하는 질문'}
          {language === 'bilingual' && ' / '}
          {showEnglish && (language === 'simple' ? 'Common questions' : 'Common questions')}
        </div>

        <div className="chat-chips">
          {presets.map(preset => (
            <button
              key={preset.id}
              className={`chat-chip${askedIds.has(preset.id) ? ' chat-chip--asked' : ''}`}
              onClick={() => onSelect(preset)}
            >
              {showKorean && <span className="chat-chip__text">{preset.question.korean}</span>}
              {language === 'bilingual' && <br />}
              {showEnglish && (
                <span className={`chat-chip__text${language === 'bilingual' ? ' summary-card__text--secondary' : ''}`}>
                  {preset.question.english}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
