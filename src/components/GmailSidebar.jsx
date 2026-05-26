import { GIcon } from './GmailIcons'

const NAV = [
  { icon: 'inbox',    label: 'Inbox',   count: 3,    active: true  },
  { icon: 'star',     label: 'Starred', count: null, active: false },
  { icon: 'schedule', label: 'Snoozed', count: null, active: false },
  { icon: 'send',     label: 'Sent',    count: null, active: false },
  { icon: 'drafts',   label: 'Drafts',  count: 1,    active: false },
  { icon: 'report',   label: 'Spam',    count: null, active: false },
]

export default function GmailSidebar() {
  return (
    <aside className="gmail-sidebar">

      <button className="gs-compose">
        <GIcon name="edit" size={20} />
        <span>Compose</span>
      </button>

      <nav className="gs-nav">
        {NAV.map(item => (
          <div
            key={item.label}
            className={`gs-nav-item${item.active ? ' gs-nav-item--active' : ''}`}
          >
            <GIcon name={item.icon} size={20} color={item.active ? '#001d35' : '#444746'} />
            <span className="gs-nav-label">{item.label}</span>
            {item.count != null && (
              <span className="gs-nav-count">{item.count}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="gs-section-label">Labels</div>
      <div className="gs-label-item">
        <span className="gs-label-dot" style={{ background: '#16a34a' }} />
        Work
      </div>
      <div className="gs-label-item">
        <span className="gs-label-dot" style={{ background: '#dc2626' }} />
        Important
      </div>

    </aside>
  )
}
