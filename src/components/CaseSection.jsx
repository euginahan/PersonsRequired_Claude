import { useState } from 'react'
import { getText } from './StatusCard'

export default function CaseSection({ caseData, language }) {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(
    Object.fromEntries(caseData.progress.map(p => [p.id, p.done]))
  )
  const isKorean = language === 'korean' || language === 'bilingual'

  const caseName = getText(caseData.name, language)
  const doneCount = Object.values(progress).filter(Boolean).length
  const total = caseData.progress.length

  function toggleStep(id) {
    setProgress(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="expand-section">
      <button className="expand-section__toggle" onClick={() => setOpen(v => !v)}>
        <span>
          🗂 {isKorean ? '관련 케이스' : 'Case Memory'}
          {' '}
          <span className="case-progress-pill">{doneCount}/{total}</span>
        </span>
        <span className="expand-section__caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="expand-section__body">
          <div className="case-name">{caseName.primary}</div>

          <div className="case-emails">
            <div className="case-section-label">{isKorean ? '관련 이메일' : 'Related emails'}</div>
            {caseData.emails.map(email => {
              const label = getText(email.label, language)
              return (
                <div key={email.id} className={`case-email${email.status === 'current' ? ' case-email--current' : ''}`}>
                  <span className="case-email__subject">{email.subject}</span>
                  <span className="case-email__meta">{email.date} · {label.primary}</span>
                </div>
              )
            })}
          </div>

          <div className="case-progress">
            <div className="case-section-label">{isKorean ? '진행 상황' : 'Progress'}</div>
            {caseData.progress.map(step => {
              const stepText = getText(step.step, language)
              const isDone = progress[step.id]
              return (
                <button
                  key={step.id}
                  className={`case-step${isDone ? ' case-step--done' : ''}`}
                  onClick={() => toggleStep(step.id)}
                >
                  <span className="case-step__check">{isDone ? '✓' : ''}</span>
                  <span className="case-step__label">{stepText.primary}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
