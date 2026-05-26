import { useState, useCallback, useEffect } from 'react'
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
  const [walkthroughId, setWalkthroughId]     = useState(null)
  const [walkthroughStep, setWalkthroughStep] = useState(0)
  const [walkthroughPaused, setWalkthroughPaused] = useState(false)

  const questionsAsked = chatHistory.filter(m => m.role === 'user').length

  // Apply accessibility classes to root
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    root.className = [
      a11y.fontSize === 'large'   ? 'a11y--large-text'  : '',
      a11y.fontSize === 'xl'      ? 'a11y--xl-text'     : '',
      a11y.highContrast           ? 'a11y--high-contrast' : '',
      a11y.reduceMotion           ? 'a11y--reduce-motion' : '',
    ].filter(Boolean).join(' ')
  }, [a11y])

  function triggerGuide(targetId) {
    const labels = guideLabels[targetId]
    if (!labels) return
    setGuideTarget({
      id: targetId,
      label: language === 'english' || language === 'simple' ? labels.english : labels.korean,
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
  }

  function handleChatSelect(preset) {
    const showEnglish = language === 'english' || language === 'simple'
    setChatHistory(prev => [
      ...prev,
      { role: 'user',      presetId: preset.id, text: showEnglish ? preset.question.english : preset.question.korean },
      { role: 'assistant', presetId: preset.id, text: showEnglish ? preset.answer.english   : preset.answer.korean   },
    ])

    if (preset.guideTarget === 'tab-reply') setActiveTab('reply')
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
    const firstStep = wt.steps[0]
    if (firstStep.guideTarget) triggerGuide(firstStep.guideTarget)
    else setGuideTarget(null)
  }

  function advanceWalkthrough() {
    const wt = walkthroughs[walkthroughId]
    if (!wt) return
    const next = walkthroughStep + 1
    if (next >= wt.steps.length) {
      exitWalkthrough()
      return
    }
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
    setGuideTarget(null)
  }

  const dismissGuide = useCallback(() => setGuideTarget(null), [])

  const activeWalkthrough = walkthroughId ? walkthroughs[walkthroughId] : null

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
            onTabChange={setActiveTab}
            onLanguageChange={setLanguage}
            onChatSelect={handleChatSelect}
            onClose={closePanel}
            onGuide={triggerGuide}
            onA11yChange={setA11y}
            walkthrough={activeWalkthrough}
            walkthroughStep={walkthroughStep}
            walkthroughPaused={walkthroughPaused}
            onStartWalkthrough={startWalkthrough}
            onNextWalkthroughStep={advanceWalkthrough}
            onBackWalkthroughStep={backWalkthrough}
            onPauseWalkthrough={() => setWalkthroughPaused(v => !v)}
            onExitWalkthrough={exitWalkthrough}
          />
        </FloatingPanel>
      )}

      {guideTarget && (
        <GuideOverlay
          targetId={guideTarget.id}
          label={guideTarget.label}
          onDismiss={dismissGuide}
        />
      )}
    </div>
  )
}
