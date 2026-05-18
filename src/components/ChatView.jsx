export default function ChatView({ presets, language, chatHistory, onSelect }) {
  const askedIds = new Set(chatHistory.filter(m => m.role === 'user').map(m => m.presetId))
  const isKorean = language !== 'english'
  const isEnglish = language !== 'korean'

  return (
    <div className="chat-view">
      {chatHistory.length === 0 && (
        <div className="chat-view__greeting">
          <span className="chat-view__greeting-icon">👋</span>
          <p>{isKorean && '궁금한 점이 있으면 아래에서 질문을 선택하세요.'}</p>
          {isEnglish && <p className="summary-card__text--secondary">Select a question below if you need more help.</p>}
        </div>
      )}

      <div className="chat-view__history">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-view__presets">
        <div className="chat-view__presets-label">
          {isKorean && '자주 하는 질문'}
          {language === 'bilingual' && ' / '}
          {isEnglish && 'Common questions'}
        </div>
        {presets.map(preset => (
          <button
            key={preset.id}
            className={`chat-preset-btn${askedIds.has(preset.id) ? ' chat-preset-btn--asked' : ''}`}
            onClick={() => onSelect(preset)}
          >
            {isKorean && <span className="chat-preset-btn__text">{preset.question.korean}</span>}
            {language === 'bilingual' && <br />}
            {isEnglish && <span className={`chat-preset-btn__text${language === 'bilingual' ? ' summary-card__text--secondary' : ''}`}>{preset.question.english}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
