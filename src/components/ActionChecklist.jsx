import { useState } from 'react'
import { getText } from './StatusCard'

export default function ActionChecklist({ checklist, language, onGuide, onStartWalkthrough, walkthroughId }) {
  const [checked, setChecked] = useState({})
  const [expanded, setExpanded] = useState({})

  const isKorean = language === 'korean' || language === 'bilingual'

  function toggleCheck(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="action-checklist">
      <div className="action-checklist__header">
        <span className="summary-card__label">
          {isKorean ? '✅ 해야 할 일' : '✅ Action Steps'}
        </span>
        <button
          className={`walkthrough-start-btn${walkthroughId ? ' walkthrough-start-btn--active' : ''}`}
          onClick={() => onStartWalkthrough('renew-license')}
          title={isKorean ? '단계별 안내 시작' : 'Start step-by-step walkthrough'}
        >
          {walkthroughId
            ? (isKorean ? '▶ 안내 중...' : '▶ In progress...')
            : (isKorean ? '▶ 단계별 안내' : '▶ Walkthrough')
          }
        </button>
      </div>

      <ol className="action-checklist__list">
        {checklist.map((item) => {
          const t = getText(item.text, language)
          const exp = getText(item.explanation, language)
          const why = getText(item.why, language)
          const isChecked = !!checked[item.id]
          const isOpen = !!expanded[item.id]

          return (
            <li key={item.id} className={`checklist-item${isChecked ? ' checklist-item--done' : ''}`}>
              <div className="checklist-item__main">
                <button
                  className={`checklist-item__checkbox${isChecked ? ' checklist-item__checkbox--checked' : ''}`}
                  onClick={() => toggleCheck(item.id)}
                  aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isChecked ? '✓' : ''}
                </button>
                <span className="checklist-item__text">{t.primary}</span>
                {t.secondary && <span className="summary-card__text--secondary"> — {t.secondary}</span>}
              </div>

              <div className="checklist-item__actions">
                {item.guideTarget && (
                  <button
                    className="checklist-action-btn checklist-action-btn--where"
                    onClick={() => onGuide(item.guideTarget)}
                  >
                    {isKorean ? '어디서?' : 'Show me where'}
                  </button>
                )}
                <button
                  className="checklist-action-btn checklist-action-btn--why"
                  onClick={() => toggleExpand(item.id)}
                >
                  {isOpen ? (isKorean ? '접기' : 'Hide') : (isKorean ? '왜?' : 'Why?')}
                </button>
              </div>

              {isOpen && (
                <div className="checklist-item__expand">
                  <p className="checklist-item__exp-text">{exp.primary}</p>
                  {exp.secondary && <p className="checklist-item__exp-text checklist-item__exp-text--sec">{exp.secondary}</p>}
                  <div className="checklist-item__why">
                    <span className="checklist-item__why-label">{isKorean ? '이유:' : 'Why:'}</span>
                    {' '}{why.primary}
                    {why.secondary && <span className="summary-card__text--secondary"> — {why.secondary}</span>}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
