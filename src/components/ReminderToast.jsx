import { useEffect } from 'react'

export default function ReminderToast({ toast, language, onViewReminders, onDismiss }) {
  const isKorean = language === 'korean' || language === 'bilingual'

  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast?.id, onDismiss])

  if (!toast) return null

  const title = typeof toast.title === 'object'
    ? (isKorean ? toast.title.korean : toast.title.english)
    : toast.title

  return (
    <div className="reminder-toast" role="status" aria-live="polite">
      <div className="reminder-toast__left">
        <span className="reminder-toast__icon">🔔</span>
        <div>
          <div className="reminder-toast__label">
            {isKorean ? '알림이 추가됐어요' : 'Reminder added'}
          </div>
          <div className="reminder-toast__title">{title}</div>
        </div>
      </div>
      <button className="reminder-toast__view" onClick={onViewReminders}>
        {isKorean ? '보기' : 'View'}
      </button>
    </div>
  )
}
