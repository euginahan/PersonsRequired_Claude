import { useState } from 'react'
import { getText } from './StatusCard'

const URGENCY_META = {
  high:   { color: 'urgency--high',   label: { korean: '긴급', english: 'Urgent', simple: 'Urgent' } },
  medium: { color: 'urgency--medium', label: { korean: '보통', english: 'Medium', simple: 'Medium' } },
  low:    { color: 'urgency--low',    label: { korean: '낮음', english: 'Low',    simple: 'Low'    } },
}

export default function DatesPanel({ dates, language }) {
  const [reminders, setReminders] = useState({})
  const [done, setDone] = useState({})
  const [asking, setAsking] = useState({})

  const isKorean = language === 'korean' || language === 'bilingual'

  function setReminder(id) {
    setReminders(prev => ({ ...prev, [id]: true }))
  }

  function markDone(id) {
    setDone(prev => ({ ...prev, [id]: true }))
  }

  function toggleAsk(id) {
    setAsking(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!dates || dates.length === 0) {
    return (
      <div className="dates-panel">
        <div className="dates-empty">
          {isKorean
            ? '이 이메일에서 감지된 날짜가 없어요.'
            : 'No specific dates detected in this email.'
          }
        </div>
      </div>
    )
  }

  return (
    <div className="dates-panel">
      <div className="summary-card__label" style={{ marginBottom: 8 }}>
        {isKorean ? '📅 감지된 날짜 / 기한' : '📅 Detected Dates & Deadlines'}
      </div>

      {dates.map((d) => {
        const dateText = getText(d.date, language)
        const meaning = getText(d.meaning, language)
        const action = getText(d.suggestedAction, language)
        const urgencyMeta = URGENCY_META[d.urgency] ?? URGENCY_META.low
        const urgencyLabel = getText(urgencyMeta.label, language)
        const isReminderSet = !!reminders[d.id]
        const isDone = !!done[d.id]
        const isAsking = !!asking[d.id]

        return (
          <div key={d.id} className={`date-card${isDone ? ' date-card--done' : ''}`}>
            <div className="date-card__top">
              <div className="date-card__date">{dateText.primary}</div>
              <span className={`urgency-badge ${urgencyMeta.color}`}>{urgencyLabel.primary}</span>
            </div>

            <p className="date-card__meaning">{meaning.primary}</p>
            {meaning.secondary && <p className="summary-card__text--secondary">{meaning.secondary}</p>}

            <div className="date-card__suggested">
              <span className="date-card__suggested-label">{isKorean ? '권장 행동:' : 'Suggested:'}</span>
              {' '}{action.primary}
            </div>

            <div className="date-card__btns">
              <button
                className={`date-btn date-btn--reminder${isReminderSet ? ' date-btn--set' : ''}`}
                onClick={() => setReminder(d.id)}
                disabled={isReminderSet || isDone}
              >
                {isReminderSet
                  ? (isKorean ? '✓ 알림 설정됨' : '✓ Reminder set')
                  : (isKorean ? '🔔 알림 추가' : '🔔 Add reminder')
                }
              </button>
              <button
                className={`date-btn date-btn--done${isDone ? ' date-btn--set' : ''}`}
                onClick={() => markDone(d.id)}
                disabled={isDone}
              >
                {isDone
                  ? (isKorean ? '✓ 완료됨' : '✓ Done')
                  : (isKorean ? '완료 표시' : 'Mark as done')
                }
              </button>
              <button className="date-btn date-btn--ask" onClick={() => toggleAsk(d.id)}>
                {isKorean ? '이게 뭔가요?' : 'What does this mean?'}
              </button>
            </div>

            {isAsking && (
              <div className="date-card__ask-answer">
                <p>{meaning.primary}</p>
                <p className="date-card__ask-action">{isKorean ? '→ ' : '→ '}{action.primary}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
