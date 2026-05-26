import { useState } from 'react'
import { getText } from './StatusCard'

const VERDICT_META = {
  safe:    { icon: '✅', color: 'safety-verdict--safe',    bg: 'safety-verdict--safe-bg' },
  caution: { icon: '⚠️', color: 'safety-verdict--caution', bg: 'safety-verdict--caution-bg' },
  scam:    { icon: '🚫', color: 'safety-verdict--scam',    bg: 'safety-verdict--scam-bg' },
}

const IGNORE_META = {
  'safe-to-ignore':     { icon: '😌', color: 'ignore-verdict--ok' },
  'respond-later':      { icon: '🕐', color: 'ignore-verdict--later' },
  'needs-action-today': { icon: '⚡', color: 'ignore-verdict--today' },
  'do-not-ignore':      { icon: '🚨', color: 'ignore-verdict--danger' },
  'ask-someone':        { icon: '🤝', color: 'ignore-verdict--ask' },
}

const FINDING_ICON = { safe: '✓', caution: '⚠', danger: '✗', note: 'ℹ' }
const FINDING_CLASS = { safe: 'finding--safe', caution: 'finding--caution', danger: 'finding--danger', note: 'finding--note' }

export default function SafetyView({ safety, ignore, language }) {
  const [showDetails, setShowDetails] = useState(false)
  const isKorean = language === 'korean' || language === 'bilingual'

  const verdict = VERDICT_META[safety.verdict] ?? VERDICT_META.safe
  const ignoreMeta = IGNORE_META[ignore.verdict] ?? IGNORE_META['do-not-ignore']

  const verdictLabel = getText(safety.verdictLabel, language)
  const explanation = getText(safety.explanation, language)
  const ignoreLabel = getText(ignore.verdictLabel, language)
  const reasoning = getText(ignore.reasoning, language)
  const consequence = getText(ignore.consequence, language)
  const safestStep = getText(ignore.safestStep, language)

  return (
    <div className="safety-view">

      {/* Safety Trust Verdict */}
      <div className={`safety-verdict ${verdict.bg}`}>
        <span className="safety-verdict__icon">{verdict.icon}</span>
        <div className="safety-verdict__body">
          <div className={`safety-verdict__label ${verdict.color}`}>
            {isKorean ? '신뢰도 분석' : 'Trust Analysis'}
          </div>
          <div className="safety-verdict__result">{verdictLabel.primary}</div>
          <p className="safety-verdict__explanation">{explanation.primary}</p>
          {explanation.secondary && <p className="summary-card__text--secondary">{explanation.secondary}</p>}
        </div>
      </div>

      {/* Sender + Links */}
      <div className="summary-card">
        <div className="summary-card__label">
          {isKorean ? '📧 발신자 정보' : '📧 Sender Info'}
        </div>
        <div className="safety-meta">
          <div className="safety-meta__row">
            <span className="safety-meta__key">{isKorean ? '발신자' : 'Sender'}</span>
            <span className="safety-meta__val safety-meta__val--mono">{safety.senderEmail}</span>
          </div>
          <div className="safety-meta__row">
            <span className="safety-meta__key">{isKorean ? '도메인' : 'Domain'}</span>
            <span className="safety-meta__val safety-meta__val--mono">{safety.senderDomain}</span>
          </div>
          <div className="safety-meta__row">
            <span className="safety-meta__key">{isKorean ? '링크' : 'Links'}</span>
            <span className="safety-meta__val safety-meta__val--mono">
              {safety.linkDomains.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="summary-card">
        <button className="expand-toggle" onClick={() => setShowDetails(v => !v)}>
          <span className="summary-card__label" style={{ margin: 0 }}>
            {isKorean ? '🔍 상세 분석' : '🔍 Detailed Findings'}
          </span>
          <span className="expand-toggle__caret">{showDetails ? '▲' : '▼'}</span>
        </button>
        {showDetails && (
          <ul className="findings-list">
            {safety.findings.map((f, i) => {
              const ft = getText(f.text, language)
              return (
                <li key={i} className={`finding-item ${FINDING_CLASS[f.type] ?? ''}`}>
                  <span className="finding-item__icon">{FINDING_ICON[f.type]}</span>
                  <span>{ft.primary}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Ignore Decision */}
      <div className="summary-card summary-card--ignore">
        <div className="summary-card__label">
          {isKorean ? '🤔 무시해도 될까요?' : '🤔 Can I ignore this?'}
        </div>
        <div className={`ignore-verdict ${ignoreMeta.color}`}>
          <span className="ignore-verdict__icon">{ignoreMeta.icon}</span>
          <span className="ignore-verdict__label">{ignoreLabel.primary}</span>
        </div>

        <div className="ignore-detail">
          <div className="ignore-detail__section">
            <span className="ignore-detail__key">{isKorean ? '이유:' : 'Why:'}</span>
            <span className="ignore-detail__val">{reasoning.primary}</span>
            {reasoning.secondary && <span className="summary-card__text--secondary"> — {reasoning.secondary}</span>}
          </div>
          <div className="ignore-detail__section">
            <span className="ignore-detail__key">{isKorean ? '무시하면:' : 'If ignored:'}</span>
            <span className="ignore-detail__val">{consequence.primary}</span>
          </div>
          <div className="ignore-detail__section ignore-detail__section--action">
            <span className="ignore-detail__key">{isKorean ? '가장 안전한 다음 단계:' : 'Safest next step:'}</span>
            <span className="ignore-detail__val ignore-detail__val--action">{safestStep.primary}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
