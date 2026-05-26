import { useState } from 'react'
import { getText } from './StatusCard'

const URGENCY_META = {
  high:   { color: 'urgency--high',   label: { korean: '긴급', english: 'Urgent', simple: 'Urgent' } },
  medium: { color: 'urgency--medium', label: { korean: '보통', english: 'Medium', simple: 'Medium' } },
  low:    { color: 'urgency--low',    label: { korean: '낮음', english: 'Low',    simple: 'Low'    } },
}

const DATE_QUICK = [
  { id: 'tomorrow', korean: '내일',    english: 'Tomorrow',   days: 1 },
  { id: 'week',     korean: '다음 주', english: 'Next week',  days: 7 },
  { id: 'custom',   korean: '날짜 선택', english: 'Pick date', days: null },
]

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export default function DatesPanel({ dates, language, onAddReminder }) {
  const [pickingFor,   setPickingFor]   = useState(null)
  const [customDate,   setCustomDate]   = useState('')
  const [confirmed,    setConfirmed]    = useState({})
  const [done,         setDone]         = useState({})
  const [asking,       setAsking]       = useState({})

  const isKorean = language === 'korean' || language === 'bilingual'

  function handleQuickPick(date, quickId) {
    if (quickId === 'custom') return // stay open for custom input
    const dueDate = addDays(quickId === 'tomorrow' ? 1 : 7)
    submitReminder(date, dueDate, quickId)
  }

  function handleCustomSubmit(date) {
    if (!customDate) return
    submitReminder(date, new Date(customDate), 'custom')
    setCustomDate('')
  }

  function submitReminder(date, dueDate, source) {
    const title = getText(date.meaning, language)
    onAddReminder?.({
      title:         date.meaning,
      dueDate:       dueDate?.toISOString() ?? null,
      dueDateLabel:  { korean: source === 'tomorrow' ? '내일' : source === 'week' ? '다음 주' : '선택한 날짜', english: source === 'tomorrow' ? 'Tomorrow' : source === 'week' ? 'Next week' : 'Custom date' },
      urgency:       date.urgency,
      category:      'renewal',
      emailSubject:  "Quick Reminder: Your Driver's License will expire soon!",
      walkthroughId: 'renew-license',
    })
    setConfirmed(prev => ({ ...prev, [date.id]: true }))
    setPickingFor(null)
  }

  function markDone(id)  { setDone(prev => ({ ...prev, [id]: true })) }
  function toggleAsk(id) { setAsking(prev => ({ ...prev, [id]: !prev[id] })) }

  if (!dates || dates.length === 0) {
    return (
      <div className="dates-panel">
        <div className="dates-empty">
          {isKorean ? '이 이메일에서 감지된 날짜가 없어요.' : 'No specific dates detected in this email.'}
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
        const dateText    = getText(d.date,    language)
        const meaning     = getText(d.meaning, language)
        const action      = getText(d.suggestedAction, language)
        const urgencyMeta = URGENCY_META[d.urgency] ?? URGENCY_META.low
        const urgencyLabel = getText(urgencyMeta.label, language)
        const isConfirmed = !!confirmed[d.id]
        const isDone      = !!done[d.id]
        const isAsking    = !!asking[d.id]
        const isPicking   = pickingFor === d.id

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

            {/* Date picker */}
            {isPicking && !isConfirmed && (
              <div className="date-picker">
                <div className="date-picker__label">
                  {isKorean ? '언제 알림을 받고 싶으세요?' : 'When should we remind you?'}
                </div>
                <div className="date-picker__quick">
                  {DATE_QUICK.map(q => (
                    <button
                      key={q.id}
                      className="date-picker__btn"
                      onClick={() => handleQuickPick(d, q.id)}
                    >
                      {isKorean ? q.korean : q.english}
                    </button>
                  ))}
                </div>
                <div className="date-picker__custom">
                  <input
                    type="date"
                    className="date-picker__input"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                  />
                  <button
                    className="date-picker__confirm"
                    onClick={() => handleCustomSubmit(d)}
                    disabled={!customDate}
                  >
                    {isKorean ? '확인' : 'Set'}
                  </button>
                </div>
                <button className="date-picker__cancel" onClick={() => setPickingFor(null)}>
                  {isKorean ? '취소' : 'Cancel'}
                </button>
              </div>
            )}

            <div className="date-card__btns">
              {!isConfirmed ? (
                <button
                  className="date-btn date-btn--reminder"
                  onClick={() => setPickingFor(d.id)}
                  disabled={isDone || isPicking}
                >
                  {isKorean ? '🔔 알림 추가' : '🔔 Add reminder'}
                </button>
              ) : (
                <span className="date-btn date-btn--reminder date-btn--set">
                  {isKorean ? '✓ 알림 설정됨' : '✓ Reminder set'}
                </span>
              )}
              <button
                className={`date-btn date-btn--done${isDone ? ' date-btn--set' : ''}`}
                onClick={() => markDone(d.id)}
                disabled={isDone}
              >
                {isDone ? (isKorean ? '✓ 완료됨' : '✓ Done') : (isKorean ? '완료 표시' : 'Mark as done')}
              </button>
              <button className="date-btn date-btn--ask" onClick={() => toggleAsk(d.id)}>
                {isKorean ? '이게 뭔가요?' : 'What does this mean?'}
              </button>
            </div>

            {isAsking && (
              <div className="date-card__ask-answer">
                <p>{meaning.primary}</p>
                <p className="date-card__ask-action">→ {action.primary}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
