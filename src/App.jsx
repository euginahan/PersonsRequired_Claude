import { useState } from 'react'
import GmailChrome from './components/GmailChrome'
import GmailSidebar from './components/GmailSidebar'
import EmailView from './components/EmailView'
import HelperPanel from './components/HelperPanel'
import { mockEmail, emailAnalysis, chatPresets } from './data/mockEmail'

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [language, setLanguage] = useState('korean')
  const [chatHistory, setChatHistory] = useState([])

  function openPanel() {
    setIsPanelOpen(true)
    setActiveTab('summary')
  }

  function closePanel() {
    setIsPanelOpen(false)
  }

  function handleChatSelect(preset) {
    const isEnglish = language === 'english'
    setChatHistory(prev => [
      ...prev,
      { role: 'user', presetId: preset.id, text: isEnglish ? preset.question.english : preset.question.korean },
      { role: 'assistant', presetId: preset.id, text: isEnglish ? preset.answer.english : preset.answer.korean },
    ])
  }

  return (
    <div className="app">
      <GmailChrome isExtensionActive={isPanelOpen} />
      <div className="main-content">
        <GmailSidebar />
        <div className="email-area">
          <EmailView
            email={mockEmail}
            isPanelOpen={isPanelOpen}
            onHelp={openPanel}
          />
          {isPanelOpen && (
            <HelperPanel
              analysis={emailAnalysis}
              presets={chatPresets}
              activeTab={activeTab}
              language={language}
              chatHistory={chatHistory}
              onTabChange={setActiveTab}
              onLanguageChange={setLanguage}
              onChatSelect={handleChatSelect}
              onClose={closePanel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
