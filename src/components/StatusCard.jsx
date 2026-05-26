export function getText(item, language) {
  if (!item) return { primary: '', secondary: null }
  if (language === 'simple') return { primary: item.simple ?? item.english, secondary: null }
  if (language === 'english') return { primary: item.english, secondary: null }
  if (language === 'korean') return { primary: item.korean, secondary: null }
  return { primary: item.korean, secondary: item.english }
}

const PRIORITY_COLORS = { low: 'status-card__badge--low', medium: 'status-card__badge--medium', high: 'status-card__badge--high' }
const RISK_COLORS = { safe: 'status-card__risk--safe', caution: 'status-card__risk--caution', danger: 'status-card__risk--danger' }

export default function StatusCard({ classifier, language }) {
  const action = getText(classifier.actionSummary, language)
  const priority = getText(classifier.priority, language)
  const deadline = getText(classifier.deadline, language)
  const risk = getText(classifier.risk, language)

  return (
    <div className="status-card">
      <div className="status-card__top">
        <span className="status-card__icon">{classifier.icon}</span>
        <span className="status-card__action">{action.primary}</span>
      </div>
      <div className="status-card__row">
        <span className="status-card__meta-label">
          {language === 'korean' || language === 'bilingual' ? '우선순위' : 'Priority'}
        </span>
        <span className={`status-card__badge ${PRIORITY_COLORS[classifier.priorityLevel]}`}>
          {priority.primary}
        </span>
      </div>
      <div className="status-card__row">
        <span className="status-card__meta-label">
          {language === 'korean' || language === 'bilingual' ? '기한' : 'Deadline'}
        </span>
        <span className="status-card__deadline">{deadline.primary}</span>
      </div>
      <div className="status-card__row">
        <span className="status-card__meta-label">
          {language === 'korean' || language === 'bilingual' ? '안전도' : 'Risk'}
        </span>
        <span className={`status-card__risk ${RISK_COLORS[classifier.riskLevel]}`}>
          {risk.primary}
        </span>
      </div>
    </div>
  )
}
