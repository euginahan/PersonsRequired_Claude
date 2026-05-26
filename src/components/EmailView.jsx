function Icon({ name, size = 20 }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size }}>
      {name}
    </span>
  )
}

export default function EmailView({ email, isPanelOpen, onHelp }) {
  return (
    <div className="email-view">

      {/* ── Gmail email toolbar ───────────────────────────── */}
      <div className="ev-toolbar">
        <div className="ev-toolbar__left">
          <button className="gc-icon-btn" title="Back to Inbox">
            <Icon name="arrow_back" />
          </button>
          <button className="gc-icon-btn" title="Archive">
            <Icon name="archive" />
          </button>
          <button className="gc-icon-btn" title="Report spam">
            <Icon name="report" />
          </button>
          <button className="gc-icon-btn" title="Delete">
            <Icon name="delete" />
          </button>
          <button className="gc-icon-btn" title="Mark as unread">
            <Icon name="mark_email_unread" />
          </button>
          <button className="gc-icon-btn" title="Snooze">
            <Icon name="schedule" />
          </button>
          <div className="ev-toolbar__divider" />
          <button className="gc-icon-btn" title="Move to">
            <Icon name="drive_file_move" />
          </button>
          <button className="gc-icon-btn" title="Labels">
            <Icon name="label" />
          </button>
          <button className="gc-icon-btn" title="More">
            <Icon name="more_vert" />
          </button>
        </div>

        <div className="ev-toolbar__right">
          {/* Extension-injected help button lives in the toolbar */}
          <button
            className={`help-btn${isPanelOpen ? ' help-btn--active' : ''}`}
            onClick={onHelp}
            disabled={isPanelOpen}
          >
            <span className="help-btn__flag">🇰🇷</span>
            <span>이해하기 도와주세요</span>
          </button>

          <div className="ev-toolbar__divider" />
          <span className="ev-toolbar__count">1 of 247</span>
          <button className="gc-icon-btn" title="Older">
            <Icon name="chevron_left" />
          </button>
          <button className="gc-icon-btn" title="Newer">
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

      {/* ── Email subject ─────────────────────────────────── */}
      <div className="ev-subject-row">
        <h1 className="ev-subject">{email.subject}</h1>
        <button className="gc-icon-btn ev-print-btn" title="Print all">
          <Icon name="print" />
        </button>
      </div>

      {/* ── Email message card ────────────────────────────── */}
      <div className="ev-message-card">

        {/* Message header */}
        <div className="ev-msg-header">
          <div className="ev-sender-avatar">G</div>

          <div className="ev-sender-info">
            <div className="ev-sender-line">
              <span className="ev-sender-name">{email.from.name}</span>
              <span className="ev-sender-email">&lt;{email.from.email}&gt;</span>
            </div>
            <div className="ev-recipient-line">
              to me
              <button className="ev-expand-btn" aria-label="Show details">
                <Icon name="arrow_drop_down" size={18} />
              </button>
            </div>
          </div>

          <div className="ev-msg-header-right">
            <span className="ev-msg-date">{email.date}</span>
            <button className="gc-icon-btn" title="Star">
              <Icon name="star_border" />
            </button>
            <button className="gc-icon-btn" title="Reply">
              <Icon name="reply" />
            </button>
            {/* Gmail's per-message ⋮ menu (contains Forward among other options) */}
            <button className="gc-icon-btn" title="More">
              <Icon name="more_vert" />
            </button>
          </div>
        </div>

        {/* Message body */}
        <div className="ev-msg-body">
          {email.body.map((para, i) => (
            <p
              key={i}
              className="ev-msg-para"
              data-guide-id={i === 3 ? 'email-dds-link' : undefined}
            >
              {para}
            </p>
          ))}
        </div>

        {/* ── Bottom reply/forward actions (exactly like Gmail) ── */}
        <div className="ev-msg-actions">
          <button className="ev-action-btn">
            <Icon name="reply" size={18} />
            Reply
          </button>
          <button className="ev-action-btn">
            <Icon name="reply_all" size={18} />
            Reply all
          </button>
          <button
            className="ev-action-btn"
            data-guide-id="email-forward-btn"
          >
            <Icon name="forward" size={18} />
            Forward
          </button>
        </div>

      </div>
    </div>
  )
}
