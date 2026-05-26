import { GIcon } from './GmailIcons'

export default function GmailChrome({ isExtensionActive }) {
  return (
    <header className="gmail-chrome">

      {/* Left — hamburger + logo */}
      <div className="gmail-chrome__left">
        <button className="gc-icon-btn" aria-label="Main menu">
          <GIcon name="menu" />
        </button>
        <div className="gmail-chrome__logo">
          {/* Gmail M logo SVG */}
          <svg width="40" height="28" viewBox="0 0 40 28" aria-hidden="true">
            <path d="M0 4.5v19A4.5 4.5 0 004.5 28H9V14l10 7.5L29 14v14h4.5A4.5 4.5 0 0038 23.5v-19C38 2.015 35.985 0 33.5 0h-.02L19 10.5 5.52 0H5.5A4.5 4.5 0 000 4.5Z" fill="#EA4335"/>
            <path d="M0 4.5v19A4.5 4.5 0 004.5 28H9V14L0 8V4.5Z" fill="#C5221F"/>
            <path d="M38 4.5v19A4.5 4.5 0 0133.5 28H29V14l9-6V4.5Z" fill="#C5221F"/>
            <path d="M9 14v14h20V14L19 21.5 9 14Z" fill="#1A73E8"/>
          </svg>
          <span className="gmail-chrome__logo-text">Gmail</span>
        </div>
      </div>

      {/* Center — search bar */}
      <div className="gmail-chrome__search">
        <button className="gc-icon-btn gc-icon-btn--sm" aria-label="Search mail">
          <GIcon name="search" size={18} />
        </button>
        <input
          type="text"
          placeholder="Mail 검색"
          className="gmail-chrome__search-input"
          readOnly
        />
        <button className="gc-icon-btn gc-icon-btn--sm" aria-label="Search options">
          <GIcon name="tune" size={18} />
        </button>
      </div>

      {/* Right — icons + avatar */}
      <div className="gmail-chrome__right">
        {isExtensionActive && (
          <div className="gmail-chrome__ext-badge">이메일 도우미 활성화됨</div>
        )}
        <button className="gc-icon-btn" aria-label="Support">
          <GIcon name="help" />
        </button>
        <button className="gc-icon-btn" aria-label="Settings">
          <GIcon name="settings" />
        </button>
        <button className="gc-icon-btn" aria-label="Google apps">
          <GIcon name="apps" />
        </button>
        <div className="gmail-chrome__avatar" aria-label="Google Account">E</div>
      </div>

    </header>
  )
}
