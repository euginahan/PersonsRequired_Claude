import SummaryView from './SummaryView'
import ReplyView from './ReplyView'
import ChatView from './ChatView'

const TABS = [
  { id: 'summary', korean: '요약', english: 'Summary' },
  { id: 'reply',   korean: '답장', english: 'Reply' },
  { id: 'chat',    korean: '질문하기', english: 'Ask' },
]

const LANGUAGES = [
  { id: 'korean',   label: '한국어' },
  { id: 'english',  label: 'English' },
  { id: 'bilingual', label: '둘 다' },
]

export default function HelperPanel({
  analysis, presets, activeTab, language, chatHistory,
  onTabChange, onLanguageChange, onChatSelect, onClose,
}) {
  return (
    <aside className="helper-panel">
      <div className="helper-panel__header">
        <div className="helper-panel__title">
          <span className="helper-panel__title-icon">🇰🇷</span>
          이메일 도우미
        </div>
        <button className="helper-panel__close" onClick={onClose} aria-label="Close panel">✕</button>
      </div>

      <div className="helper-panel__lang-bar">
        {LANGUAGES.map(lang => (
          <button
            key={lang.id}
            className={`lang-btn${language === lang.id ? ' lang-btn--active' : ''}`}
            onClick={() => onLanguageChange(lang.id)}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="helper-panel__tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' tab-btn--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {language === 'english' ? tab.english : tab.korean}
          </button>
        ))}
      </div>

      <div className="helper-panel__body">
        {activeTab === 'summary' && (
          <SummaryView analysis={analysis} language={language} />
        )}
        {activeTab === 'reply' && (
          <ReplyView reply={analysis.reply} language={language} />
        )}
        {activeTab === 'chat' && (
          <ChatView
            presets={presets}
            language={language}
            chatHistory={chatHistory}
            onSelect={onChatSelect}
          />
        )}
      </div>
    </aside>
  )
}
