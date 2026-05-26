import { useState } from 'react'
import { getText } from './StatusCard'

export default function ReplyHelper({ reply, replyOptions, language }) {
  const [selectedId, setSelectedId] = useState(null)
  const [draftText, setDraftText] = useState('')
  const [copied, setCopied] = useState(false)

  const isKorean = language === 'korean' || language === 'bilingual'
  const showKorean = language === 'korean' || language === 'bilingual'
  const showEnglish = language === 'english' || language === 'bilingual' || language === 'simple'

  function selectOption(opt) {
    setSelectedId(opt.id)
    const draft = language === 'korean' ? opt.draft.korean : opt.draft.english
    setDraftText(draft)
    setCopied(false)
  }

  function copyDraft() {
    if (!draftText) return
    navigator.clipboard.writeText(draftText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const note = getText(reply.note, language)

  return (
    <div className="reply-helper">
      {/* Reply needed status */}
      <div className={`reply-view__status ${reply.needed ? 'reply-view__status--needed' : 'reply-view__status--not-needed'}`}>
        {reply.needed
          ? (isKorean ? '✉️ 답장이 필요해요' : '✉️ Reply needed')
          : (isKorean ? '✓ 답장이 필요 없어요' : '✓ No reply needed')
        }
      </div>

      <div className="summary-card">
        <div className="summary-card__label">{isKorean ? '이유' : 'What this means'}</div>
        {showKorean && <p className="summary-card__text">{reply.note.korean}</p>}
        {showEnglish && <p className="summary-card__text summary-card__text--secondary">{reply.note.english}</p>}
      </div>

      {/* Reply templates */}
      <div className="summary-card">
        <div className="summary-card__label">
          {isKorean ? '✏️ 답장 예시 (필요한 경우)' : '✏️ Reply templates (if needed)'}
        </div>
        <div className="reply-options">
          {replyOptions.map(opt => {
            const label = getText(opt.label, language)
            return (
              <button
                key={opt.id}
                className={`reply-opt-btn${selectedId === opt.id ? ' reply-opt-btn--selected' : ''}`}
                onClick={() => selectOption(opt)}
              >
                {label.primary}
              </button>
            )
          })}
        </div>

        {selectedId && (
          <div className="reply-draft">
            <textarea
              className="reply-draft__textarea"
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              rows={6}
            />
            <div className="reply-draft__footer">
              <span className="reply-draft__hint">
                {isKorean ? '위의 내용을 수정할 수 있어요' : 'You can edit the text above'}
              </span>
              <button className={`reply-copy-btn${copied ? ' reply-copy-btn--copied' : ''}`} onClick={copyDraft}>
                {copied
                  ? (isKorean ? '✓ 복사됨!' : '✓ Copied!')
                  : (isKorean ? '복사하기' : 'Copy reply')
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
