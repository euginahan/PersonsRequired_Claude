import SummaryView from './SummaryView'
import SafetyView from './SafetyView'
import ReplyView from './ReplyView'
import ChatView from './ChatView'
import AccessibilityMenu from './AccessibilityMenu'
import WalkthroughBar from './WalkthroughBar'

const TABS = [
  { id: 'summary', korean: '요약',  english: 'Summary' },
  { id: 'safety',  korean: '안전',  english: 'Safety'  },
  { id: 'reply',   korean: '답장',  english: 'Reply'   },
  { id: 'chat',    korean: '질문',  english: 'Ask'     },
]

const LANGUAGES = [
  { id: 'korean',    label: '한국어' },
  { id: 'english',   label: 'English' },
  { id: 'bilingual', label: '둘 다' },
  { id: 'simple',    label: '쉬운 English' },
]

export default function HelperPanel({
  analysis, classifier, checklist, dates, glossary, caseData,
  safety, ignore, replyOptions, presets,
  activeTab, language, chatHistory, a11y,
  onTabChange, onLanguageChange, onChatSelect, onClose, onMinimize,
  onGuide, onA11yChange,
  walkthrough, walkthroughStep, walkthroughPaused,
  onStartWalkthrough, onNextWalkthroughStep, onBackWalkthroughStep,
  onPauseWalkthrough, onExitWalkthrough,
}) {
  const simplified = a11y.simplified

  return (
    <div className="helper-panel">
      <div className="helper-panel__header">
        <div className="helper-panel__title">
          <span className="helper-panel__title-icon">🇰🇷</span>
          이메일 도우미
        </div>
        <div className="helper-panel__header-actions">
          <AccessibilityMenu settings={a11y} onChange={onA11yChange} language={language} />
          <button
            className="helper-panel__icon-action"
            onClick={onMinimize}
            title="최소화"
            aria-label="최소화"
          >
            —
          </button>
          <button
            className="helper-panel__icon-action"
            onClick={onClose}
            title="닫기"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
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
            data-guide-id={`tab-${tab.id}`}
            className={`tab-btn${activeTab === tab.id ? ' tab-btn--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {language === 'english' || language === 'simple' ? tab.english : tab.korean}
          </button>
        ))}
      </div>

      <div className="helper-panel__body">
        {activeTab === 'summary' && (
          <SummaryView
            analysis={analysis}
            classifier={classifier}
            checklist={checklist}
            dates={dates}
            glossary={glossary}
            caseData={caseData}
            language={language}
            simplified={simplified}
            onGuide={onGuide}
            onStartWalkthrough={onStartWalkthrough}
            walkthroughId={walkthrough?.id ?? null}
          />
        )}
        {activeTab === 'safety' && (
          <SafetyView safety={safety} ignore={ignore} language={language} />
        )}
        {activeTab === 'reply' && (
          <ReplyView reply={analysis.reply} replyOptions={replyOptions} language={language} />
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

      {/* Walkthrough bar — slides up from bottom of panel when active */}
      {walkthrough && (
        <WalkthroughBar
          walkthrough={walkthrough}
          stepIdx={walkthroughStep}
          paused={walkthroughPaused}
          language={language}
          onNext={onNextWalkthroughStep}
          onBack={onBackWalkthroughStep}
          onPause={onPauseWalkthrough}
          onExit={onExitWalkthrough}
        />
      )}
    </div>
  )
}
