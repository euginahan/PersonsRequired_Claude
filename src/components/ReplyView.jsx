export default function ReplyView({ reply, language }) {
  const isKorean = language !== 'english'
  const isEnglish = language !== 'korean'

  return (
    <div className="reply-view">
      <div className={`reply-view__status ${reply.needed ? 'reply-view__status--needed' : 'reply-view__status--not-needed'}`}>
        {reply.needed ? '✉️ 답장이 필요해요' : '✓ 답장이 필요 없어요'}
      </div>

      <div className="summary-card">
        <div className="summary-card__label">
          {language === 'english' ? 'What this means' : '이유'}
        </div>
        {isKorean && <p className="summary-card__text">{reply.note.korean}</p>}
        {isEnglish && <p className="summary-card__text summary-card__text--secondary">{reply.note.english}</p>}
      </div>

      {reply.needed && (
        <div className="summary-card">
          <div className="summary-card__label">
            {language === 'english' ? '✏️ Suggested Reply' : '✏️ 답장 예시'}
          </div>
          <div className="reply-view__draft">
            <p className="reply-view__draft-text">{reply.draft}</p>
            <button className="reply-view__copy-btn">
              {language === 'english' ? 'Copy to clipboard' : '복사하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
