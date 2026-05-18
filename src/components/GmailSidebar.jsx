const navItems = [
  { label: 'Inbox', count: 3 },
  { label: 'Starred', count: null },
  { label: 'Sent', count: null },
  { label: 'Drafts', count: 1 },
]

export default function GmailSidebar() {
  return (
    <aside className="gmail-sidebar">
      <button className="gmail-sidebar__compose">
        <span>✏️</span> Compose
      </button>
      <nav className="gmail-sidebar__nav">
        {navItems.map((item, i) => (
          <div
            key={item.label}
            className={`gmail-sidebar__nav-item${i === 0 ? ' gmail-sidebar__nav-item--active' : ''}`}
          >
            <span className="gmail-sidebar__nav-label">{item.label}</span>
            {item.count && <span className="gmail-sidebar__nav-count">{item.count}</span>}
          </div>
        ))}
      </nav>
    </aside>
  )
}
