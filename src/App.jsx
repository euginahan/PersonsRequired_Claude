import { useState, useCallback, useEffect, useRef } from 'react'
import GmailChrome from './components/GmailChrome'
import GmailSidebar from './components/GmailSidebar'
import EmailView from './components/EmailView'
import HelperPanel from './components/HelperPanel'
import FloatingPanel from './components/FloatingPanel'
import GuideOverlay from './components/GuideOverlay'
import {
  mockEmail,
  emailAnalysis,
  emailClassifier,
  detectedDates,
  actionChecklist,
  safetyAnalysis,
  ignoreDecision,
  glossary,
  caseMemory,
  replyOptions,
  chatPresets,
  walkthroughs,
  guideLabels,
} from './data/mockEmail'

const DEFAULT_A11Y = { fontSize: 'normal', highContrast: false, reduceMotion: false, simplified: false }

export default function App() {
  const [isPanelOpen, setIsPanelOpen]     = useState(false)
  const [activeTab, setActiveTab]         = useState('summary')
  const [language, setLanguage]           = useState('korean')
  const [chatHistory, setChatHistory]     = useState([])
  const [guideTarget, setGuideTarget]     = useState(null)
  const [a11y, setA11y]                   = useState(DEFAULT_A11Y)

  // Walkthrough state
  const [walkthroughId, setWalkthroughId]         = useState(null)
  const [walkthroughStep, setWalkthroughStep]     = useState(0)
  const [walkthroughPaused, setWalkthroughPaused] = useState(false)

  // Escalation state
  const [escalationOpen, setEscalationOpen] = useState(false)
  const [escalationMode, setEscalationMode] = useState(null)
  const [slowMode, setSlowMode]             = useState(false)
  const [enhancedGuide, setEnhancedGuide]   = useState(false)

  // Reminder state
  const [reminders, setReminders]                   = useState([])
  const [reminderCenterOpen, setReminderCenterOpen] = useState(false)
  const [reminderToast, setReminderToast]           = useState(null)
  const reminderBellRef                             = useRef(null)

  const questionsAsked = chatHistory.filter(m => m.role === 'user').length
  const reminderCount  = reminders.filter(r => !r.completed).length

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    root.className = [
      a11y.fontSize === 'large' ? 'a11y--large-text'    : '',
      a11y.fontSize === 'xl'    ? 'a11y--xl-text'       : '',
      a11y.highContrast         ? 'a11y--high-contrast' : '',
      a11y.reduceMotion         ? 'a11y--reduce-motion' : '',
    ].filter(Boolean).join(' ')
  }, [a11y])

  function triggerGuide(targetId, forceEnhanced = false) {
    const labels = guideLabels[targetId]
    if (!labels) return
    setGuideTarget({
      id: targetId,
      label: language === 'english' || language === 'simple' ? labels.english : labels.korean,
      enhanced: forceEnhanced || enhancedGuide,
    })
  }

  function openPanel() {
    setIsPanelOpen(true)
    setActiveTab('summary')
  }

  function closePanel() {
    setIsPanelOpen(false)
    setGuideTarget(null)
    exitWalkthrough()
    setReminderCenterOpen(false)
  }

  function handleChatSelect(preset) {
    const showEnglish = language === 'english' || language === 'simple'
    setChatHistory(prev => [
      ...prev,
      { role: 'user',      presetId: preset.id, text: showEnglish ? preset.question.english : preset.question.korean },
      { role: 'assistant', presetId: preset.id, text: showEnglish ? preset.answer.english   : preset.answer.korean   },
    ])

    if (preset.guideTarget === 'tab-reply')  setActiveTab('reply')
    if (preset.guideTarget === 'tab-safety') setActiveTab('safety')

    if (preset.guideTarget && guideLabels[preset.guideTarget]) {
      triggerGuide(preset.guideTarget)
    }
  }

  // ── Walkthrough ──────────────────────────────────────────────────────────

  function startWalkthrough(id) {
    const wt = walkthroughs[id]
    if (!wt) return
    setWalkthroughId(id)
    setWalkthroughStep(0)
    setWalkthroughPaused(false)
    setSlowMode(false)
    setEnhancedGuide(false)
    setEscalationOpen(false)
    setEscalationMode(null)
    const firstStep = wt.steps[0]
    if (firstStep.guideTarget) triggerGuide(firstStep.guideTarget)
    else setGuideTarget(null)
  }

  function advanceWalkthrough() {
    const wt = walkthroughs[walkthroughId]
    if (!wt) return
    const next = walkthroughStep + 1
    if (next >= wt.steps.length) { exitWalkthrough(); return }
    setWalkthroughStep(next)
    const step = wt.steps[next]
    if (step.guideTarget) triggerGuide(step.guideTarget)
    else setGuideTarget(null)
  }

  function backWalkthrough() {
    if (walkthroughStep === 0) return
    const prev = walkthroughStep - 1
    setWalkthroughStep(prev)
    const wt = walkthroughs[walkthroughId]
    if (!wt) return
    const step = wt.steps[prev]
    if (step.guideTarget) triggerGuide(step.guideTarget)
    else setGuideTarget(null)
  }

  function exitWalkthrough() {
    setWalkthroughId(null)
    setWalkthroughStep(0)
    setWalkthroughPaused(false)
    setSlowMode(false)
    setEnhancedGuide(false)
    setEscalationOpen(false)
    setEscalationMode(null)
    setGuideTarget(null)
  }

  // ── Escalation ───────────────────────────────────────────────────────────

  function openEscalation() {
    setEscalationOpen(true)
    setEscalationMode(null)
  }

  function handleEscalationChoice(mode) {
    setEscalationMode(mode)
    if (mode === 'slower') setSlowMode(true)
    if (mode === 'cant-find') {
      setEnhancedGuide(true)
      const wt = walkthroughs[walkthroughId]
      if (wt) {
        const step = wt.steps[walkthroughStep]
        if (step?.guideTarget) triggerGuide(step.guideTarget, true)
      }
    }
  }

  function handleEscalationReturn() {
    setEscalationOpen(false)
    setEscalationMode(null)
  }

  // ── Reminders ────────────────────────────────────────────────────────────

  function addReminder(reminderData) {
    const newReminder = {
      ...reminderData,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: false,
      snoozed: false,
    }
    setReminders(prev => [newReminder, ...prev])
    setReminderToast({ id: newReminder.id, title: reminderData.title })
  }

  function handleReminderComplete(id) {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r))
  }

  function handleReminderSnooze(id) {
    const snoozeDate = new Date()
    snoozeDate.setDate(snoozeDate.getDate() + 1)
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, snoozed: false, dueDate: snoozeDate.toISOString() } : r
    ))
  }

  function handleReminderWalkthrough(wtId) {
    setReminderCenterOpen(false)
    startWalkthrough(wtId)
  }

  function handleViewReminderToast() {
    setReminderToast(null)
    setReminderCenterOpen(true)
  }

  const dismissGuide = useCallback(() => setGuideTarget(null), [])

  const activeWalkthrough = walkthroughId ? walkthroughs[walkthroughId] : null
  const currentStep       = activeWalkthrough ? activeWalkthrough.steps[walkthroughStep] : null

  return (
    <div className="app">
      <GmailChrome isExtensionActive={isPanelOpen} />
      <div className="main-content">
        <GmailSidebar />
        <EmailView
          email={mockEmail}
          isPanelOpen={isPanelOpen}
          onHelp={openPanel}
        />
      </div>

      {isPanelOpen && (
        <FloatingPanel
          onClose={closePanel}
          language={language}
          actionCount={questionsAsked}
          reminderCount={reminderCount}
        >
          <HelperPanel
            analysis={emailAnalysis}
            classifier={emailClassifier}
            checklist={actionChecklist}
            dates={detectedDates}
            glossary={glossary}
            caseData={caseMemory}
            safety={safetyAnalysis}
            ignore={ignoreDecision}
            replyOptions={replyOptions}
            presets={chatPresets}
            activeTab={activeTab}
            language={language}
            chatHistory={chatHistory}
            a11y={a11y}
            reminders={reminders}
            reminderCenterOpen={reminderCenterOpen}
            reminderToast={reminderToast}
            reminderBellRef={reminderBellRef}
            escalationOpen={escalationOpen}
            escalationMode={escalationMode}
            currentStep={currentStep}
            onTabChange={setActiveTab}
            onLanguageChange={setLanguage}
            onChatSelect={handleChatSelect}
            onClose={closePanel}
            onGuide={triggerGuide}
            onA11yChange={setA11y}
            onAddReminder={addReminder}
            onOpenReminderCenter={() => setReminderCenterOpen(true)}
            onCloseReminderCenter={() => setReminderCenterOpen(false)}
            onReminderComplete={handleReminderComplete}
            onReminderSnooze={handleReminderSnooze}
            onReminderWalkthrough={handleReminderWalkthrough}
            onViewReminderToast={handleViewReminderToast}
            onDismissToast={() => setReminderToast(null)}
            onEscalate={openEscalation}
            onEscalationChoice={handleEscalationChoice}
            onEscalationReturn={handleEscalationReturn}
            onExitWalkthrough={exitWalkthrough}
            walkthrough={activeWalkthrough}
            walkthroughStep={walkthroughStep}
            walkthroughPaused={walkthroughPaused}
            slowMode={slowMode}
            onStartWalkthrough={startWalkthrough}
            onNextWalkthroughStep={advanceWalkthrough}
            onBackWalkthroughStep={backWalkthrough}
            onPauseWalkthrough={() => setWalkthroughPaused(v => !v)}
          />
        </FloatingPanel>
      )}

      {guideTarget && (
        <GuideOverlay
          targetId={guideTarget.id}
          label={guideTarget.label}
          onDismiss={dismissGuide}
          enhanced={!!guideTarget.enhanced}
        />
      )}
    </div>
  )
}
