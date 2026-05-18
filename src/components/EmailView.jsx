export default function EmailView({ email, isPanelOpen, onHelp }) {
  return (
    <div className={`email-view${isPanelOpen ? ' email-view--narrow' : ''}`}>
      <div className="email-view__toolbar">
        <button className="email-view__back">← 받은편지함</button>
        <div className="email-view__toolbar-actions">
          <button className="email-view__icon-btn" title="Archive">🗄️</button>
          <button className="email-view__icon-btn" title="Delete">🗑️</button>
          <button className="email-view__icon-btn" title="More">⋮</button>
        </div>
      </div>

      <div className="email-view__content">
        <div className="email-view__subject-row">
          <h1 className="email-view__subject">{email.subject}</h1>
          <button
            className={`help-btn${isPanelOpen ? ' help-btn--active' : ''}`}
            onClick={onHelp}
            disabled={isPanelOpen}
          >
            <span className="help-btn__icon">🇰🇷</span>
            <span>이해하기 도와주세요</span>
          </button>
        </div>

        <div className="email-view__meta">
          <div className="email-view__sender-avatar">
            {email.from.name.charAt(0)}
          </div>
          <div className="email-view__sender-info">
            <div className="email-view__sender-name">
              {email.from.name}
              <span className="email-view__sender-email"> &lt;{email.from.email}&gt;</span>
            </div>
            <div className="email-view__to">to {email.to}</div>
          </div>
          <div className="email-view__date">{email.date}</div>
        </div>

        <div className="email-view__body">
          {email.body.map((paragraph, i) => (
            <p key={i} className="email-view__paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
