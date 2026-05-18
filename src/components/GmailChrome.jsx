export default function GmailChrome({ isExtensionActive }) {
  return (
    <header className="gmail-chrome">
      <div className="gmail-chrome__left">
        <button className="gmail-chrome__menu" aria-label="Main menu">
          <span /><span /><span />
        </button>
        <div className="gmail-chrome__logo">
          <span className="gmail-chrome__logo-g">G</span>
          <span className="gmail-chrome__logo-m">m</span>
          <span className="gmail-chrome__logo-a">a</span>
          <span className="gmail-chrome__logo-i">i</span>
          <span className="gmail-chrome__logo-l">l</span>
        </div>
      </div>

      <div className="gmail-chrome__search">
        <span className="gmail-chrome__search-icon">🔍</span>
        <input
          type="text"
          placeholder="Mail 검색"
          className="gmail-chrome__search-input"
          readOnly
        />
      </div>

      <div className="gmail-chrome__right">
        {isExtensionActive && (
          <div className="gmail-chrome__extension-badge">
            이메일 도우미 활성화됨
          </div>
        )}
        <button className="gmail-chrome__icon-btn" aria-label="Settings">⚙️</button>
        <div className="gmail-chrome__avatar">E</div>
      </div>
    </header>
  )
}
