import { useState } from 'react'
import { getText } from './StatusCard'

const FILTERS = [
  { id: 'all',          korean: '전체',   english: 'All'          },
  { id: 'urgent',       korean: '긴급',   english: 'Urgent'       },
  { id: 'renewal',      korean: '갱신',   english: 'Renewals'     },
  { id: 'appointment',  korean: '예약',   english: 'Appointments' },
  { id: 'payment',      korean: '납부',   english: 'Bills'        },
]

const URGENCY_COLORS = {
  high:   { bg: '#fce8e6', text: '#c5221f', label: { korean: '긴급', english: 'Urgent' } },
  medium: { bg: '#fff8e1', text: '#f9a825', label: { korean: '보통', english: 'Medium' } },
  low:    { bg: '#e6f4ea', text: '#188038', label: { korean: '낮음', english: 'Low'    } },
}

function getCountdown(reminder, language) {
  const isKorean = language === 'korean' || language === 'bilingual'
  if (!reminder.dueDate) {
    return { label: isKorean ? '날짜 미정' : 'No date set', level: 'none' }
  }
  const now = new Date()
  const due = new Date(reminder.dueDate)
  const diffMs = due - now
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays < 0)  return { label: isKorean ? '⚠ 기한 초과' : '⚠ Overdue',          level: 'overdue'   }
  if (diffDays === 0) return { label: isKorean ? '오늘까지'    : 'Due today',           level: 'today'     }
  if (diffDays === 1) return { label: isKorean ? '내일까지'    : 'Due tomorrow',        level: 'tomorrow'  }
  return { label: isKorean ? `${diffDays}일 후` : `Due in ${diffDays} days`, level: 'upcoming' }
}

function groupReminders(reminders) {
  const now = new Date()
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const endWeek  = new Date(now.getTime() + 7 * 86400000)

  const active = reminders.filter(r => !r.completed && !r.snoozed)
  return {
    overdue:   active.filter(r => r.dueDate && new Date(r.dueDate) < now),
    today:     active.filter(r => r.dueDate && new Date(r.dueDate) >= now && new Date(r.dueDate) <= endToday),
    thisWeek:  active.filter(r => r.dueDate && new Date(r.dueDate) > endToday && new Date(r.dueDate) <= endWeek),
    upcoming:  active.filter(r => !r.dueDate || new Date(r.dueDate) > endWeek),
    completed: reminders.filter(r => r.completed),
  }
}

function ReminderCard({ reminder, language, onComplete, onSnooze, onWalkthrough }) {
  const isKorean = language === 'korean' || language === 'bilingual'
  const title = getText(reminder.title, language)
  const countdown = getCountdown(reminder, language)
  const urgencyMeta = URGENCY_COLORS[reminder.urgency] ?? URGENCY_COLORS.low
  const urgencyLabel = getText(urgencyMeta.label, language)

  return (
    <div className={`rc-card rc-card--${countdown.level}`}>
      <div className="rc-card__top">
        <div className="rc-card__title">{title.primary}</div>
        <span
          className="rc-card__urgency"
          style={{ background: urgencyMeta.bg, color: urgencyMeta.text }}
        >
          {urgencyLabel.primary}
        </span>
      </div>

      <div className="rc-card__countdown">
        <span className={`rc-countdown rc-countdown--${countdown.level}`}>
          {countdown.label}
        </span>
        {reminder.emailSubject && (
          <span className="rc-card__source">· {reminder.emailSubject.slice(0, 32)}…</span>
        )}
      </div>

      <div className="rc-card__actions">
        <button className="rc-action-btn rc-action-btn--done" onClick={() => onComplete(reminder.id)}>
          {isKorean ? '✓ 완료' : '✓ Done'}
        </button>
        <button className="rc-action-btn rc-action-btn--snooze" onClick={() => onSnooze(reminder.id)}>
          {isKorean ? '🔕 하루 미루기' : '🔕 Snooze 1 day'}
        </button>
        {reminder.walkthroughId && (
          <button className="rc-action-btn rc-action-btn--wt" onClick={() => onWalkthrough(reminder.walkthroughId)}>
            {isKorean ? '▶ 안내 다시보기' : '▶ Restart guide'}
          </button>
        )}
      </div>
    </div>
  )
}

function SectionGroup({ label, reminders, language, onComplete, onSnooze, onWalkthrough }) {
  if (reminders.length === 0) return null
  return (
    <div className="rc-group">
      <div className="rc-group__label">{label}</div>
      {reminders.map(r => (
        <ReminderCard
          key={r.id}
          reminder={r}
          language={language}
          onComplete={onComplete}
          onSnooze={onSnooze}
          onWalkthrough={onWalkthrough}
        />
      ))}
    </div>
  )
}

export default function ReminderCenter({ reminders, language, onClose, onComplete, onSnooze, onWalkthrough }) {
  const [filter, setFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const isKorean = language === 'korean' || language === 'bilingual'

  const filtered = filter === 'all'
    ? reminders
    : reminders.filter(r => r.category === filter || (filter === 'urgent' && r.urgency === 'high'))

  const groups = groupReminders(filtered)
  const hasActive = groups.overdue.length + groups.today.length + groups.thisWeek.length + groups.upcoming.length > 0

  return (
    <div className="reminder-center">
      <div className="rc-header">
        <div className="rc-header__title">
          <span>🔔</span>
          {isKorean ? '알림 센터' : 'Reminder Center'}
        </div>
        <button className="rc-header__close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="rc-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`rc-filter-btn${filter === f.id ? ' rc-filter-btn--active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {isKorean ? f.korean : f.english}
          </button>
        ))}
      </div>

      <div className="rc-body">
        {!hasActive && groups.completed.length === 0 && (
          <div className="rc-empty">
            <div className="rc-empty__icon">🗓</div>
            <div className="rc-empty__title">
              {isKorean ? '알림이 없어요' : 'No reminders yet'}
            </div>
            <div className="rc-empty__sub">
              {isKorean
                ? '이메일에서 "알림 추가" 버튼을 눌러 알림을 설정하세요'
                : 'Tap "Add reminder" on a date in the Summary tab to get started'}
            </div>
          </div>
        )}

        {groups.overdue.length > 0 && (
          <SectionGroup
            label={isKorean ? '⚠ 기한 초과' : '⚠ Overdue'}
            reminders={groups.overdue}
            language={language}
            onComplete={onComplete}
            onSnooze={onSnooze}
            onWalkthrough={onWalkthrough}
          />
        )}

        <SectionGroup
          label={isKorean ? '오늘' : 'Today'}
          reminders={groups.today}
          language={language}
          onComplete={onComplete}
          onSnooze={onSnooze}
          onWalkthrough={onWalkthrough}
        />

        <SectionGroup
          label={isKorean ? '이번 주' : 'This Week'}
          reminders={groups.thisWeek}
          language={language}
          onComplete={onComplete}
          onSnooze={onSnooze}
          onWalkthrough={onWalkthrough}
        />

        <SectionGroup
          label={isKorean ? '다가오는 일정' : 'Upcoming'}
          reminders={groups.upcoming}
          language={language}
          onComplete={onComplete}
          onSnooze={onSnooze}
          onWalkthrough={onWalkthrough}
        />

        {groups.completed.length > 0 && (
          <div className="rc-group">
            <button
              className="rc-completed-toggle"
              onClick={() => setShowCompleted(v => !v)}
            >
              {isKorean ? `완료됨 (${groups.completed.length})` : `Completed (${groups.completed.length})`}
              <span>{showCompleted ? ' ▲' : ' ▼'}</span>
            </button>
            {showCompleted && groups.completed.map(r => (
              <div key={r.id} className="rc-card rc-card--completed">
                <div className="rc-card__title rc-card__title--done">
                  ✓ {getText(r.title, language).primary}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
