import SummaryView from './SummaryView'
import SafetyView from './SafetyView'
import ReplyView from './ReplyView'
import ChatView from './ChatView'
import AccessibilityMenu from './AccessibilityMenu'
import WalkthroughBar from './WalkthroughBar'
import EscalationOverlay from './EscalationOverlay'
import ReminderCenter from './ReminderCenter'
import ReminderToast from './ReminderToast'

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
  reminders, reminderCenterOpen, reminderToast, reminderBellRef,
  escalationOpen, escalationMode, currentStep,
  onTabChange, onLanguageChange, onChatSelect, onClose, onMinimize,
  onGuide, onA11yChange, onAddReminder,
  onOpenReminderCenter, onCloseReminderCenter,
  onReminderComplete, onReminderSnooze, onReminderWalkthrough,
  onViewReminderToast, onDismissToast,
  onEscalate, onEscalationChoice, onEscalationReturn, onExitWalkthrough,
  walkthrough, walkthroughStep, walkthroughPaused, slowMode,
  onStartWalkthrough, onNextWalkthroughStep, onBackWalkthroughStep,
  onPauseWalkthrough,
}) {
  const simplified = a11y.simplified
  const showEnglish = language === 'english' || language === 'simple'
  const reminderCount = reminders.filter(r => !r.completed).length

  return (
    <div className="helper-panel">

      {/* Header */}
      <div className="helper-panel__header" style={{ position: 'relative', zIndex: 2 }}>
        <div className="helper-panel__title">
          <span className="helper-panel__title-icon">🇰🇷</span>
          이메일 도우미
        </div>
        <div className="helper-panel__header-actions">
          {/* Bell / Reminder Center toggle */}
          <button
            ref={reminderBellRef}
            className={`helper-panel__bell${reminderCenterOpen ? ' helper-panel__bell--active' : ''}`}
            onClick={reminderCenterOpen ? onCloseReminderCenter : onOpenReminderCenter}
            title={language === 'english' || language === 'simple' ? 'Reminders' : '알림'}
            aria-label="Reminders"
          >
            🔔
            {reminderCount > 0 && (
              <span className="helper-panel__bell-badge">{reminderCount}</span>
            )}
          </button>
          <AccessibilityMenu settings={a11y} onChange={onA11yChange} language={language} />
          <button className="helper-panel__icon-action" onClick={onMinimize} title="최소화" aria-label="최소화">—</button>
          <button className="helper-panel__icon-action" onClick={onClose} title="닫기" aria-label="닫기">✕</button>
        </div>
      </div>

      {/* Escalation overlay — covers everything below header regardless of scroll */}
      {escalationOpen && (
        <EscalationOverlay
          step={currentStep}
          mode={escalationMode}
          language={language}
          onChoice={onEscalationChoice}
          onReturn={onEscalationReturn}
          onExit={onExitWalkthrough}
          onAddReminder={() => onAddReminder({
            title: { korean: '운전면허 갱신', english: "Driver's License Renewal" },
            dueDate: null,
            dueDateLabel: { korean: '날짜 미정', english: 'No date set' },
            urgency: 'high',
            category: 'renewal',
            emailSubject: "Quick Reminder: Your Driver's License will expire soon!",
            walkthroughId: 'renew-license',
          })}
        />
      )}

      {/* Reminder Center view */}
      {reminderCenterOpen ? (
        <div className="helper-panel__body">
          <ReminderCenter
            reminders={reminders}
            language={language}
            onClose={onCloseReminderCenter}
            onComplete={onReminderComplete}
            onSnooze={onReminderSnooze}
            onWalkthrough={onReminderWalkthrough}
          />
        </div>
      ) : (
        <>
          {/* Language bar */}
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

          {/* Tabs */}
          <div className="helper-panel__tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                data-guide-id={`tab-${tab.id}`}
                className={`tab-btn${activeTab === tab.id ? ' tab-btn--active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {showEnglish ? tab.english : tab.korean}
              </button>
            ))}
          </div>

          {/* Panel body */}
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
                onAddReminder={onAddReminder}
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
        </>
      )}

      {/* Walkthrough bar */}
      {walkthrough && !reminderCenterOpen && (
        <WalkthroughBar
          walkthrough={walkthrough}
          stepIdx={walkthroughStep}
          paused={walkthroughPaused}
          slowMode={slowMode}
          language={language}
          onNext={onNextWalkthroughStep}
          onBack={onBackWalkthroughStep}
          onPause={onPauseWalkthrough}
          onExit={onExitWalkthrough}
          onEscalate={onEscalate}
        />
      )}

      {/* Reminder toast */}
      {reminderToast && (
        <ReminderToast
          toast={reminderToast}
          language={language}
          onViewReminders={onViewReminderToast}
          onDismiss={onDismissToast}
        />
      )}
    </div>
  )
}
