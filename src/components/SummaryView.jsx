function getText(item, language) {
  if (language === 'english') return { primary: item.english, secondary: null }
  if (language === 'korean') return { primary: item.korean, secondary: null }
  return { primary: item.korean, secondary: item.english }
}

export default function SummaryView({ analysis, language }) {
  const summary = getText(analysis.summary, language)

  return (
    <div className="summary-view">
      <div className="summary-card summary-card--blue">
        <div className="summary-card__label">
          {language === 'english' ? 'What is this email?' : '이 이메일은 무엇인가요?'}
        </div>
        <p className="summary-card__text">{summary.primary}</p>
        {summary.secondary && (
          <p className="summary-card__text summary-card__text--secondary">{summary.secondary}</p>
        )}
      </div>

      <div className="summary-card">
        <div className="summary-card__label">
          {language === 'english' ? '🔑 Key Details' : '🔑 중요한 내용'}
        </div>
        <ul className="summary-card__list">
          {analysis.keyDetails.map((item, i) => {
            const t = getText(item, language)
            return (
              <li key={i} className="summary-card__list-item">
                <span>{t.primary}</span>
                {t.secondary && <span className="summary-card__text--secondary"> — {t.secondary}</span>}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="summary-card summary-card--steps">
        <div className="summary-card__label">
          {language === 'english' ? '✅ What to Do Next' : '✅ 다음에 해야 할 일'}
        </div>
        <ol className="summary-card__steps">
          {analysis.nextSteps.map((item, i) => {
            const t = getText(item, language)
            return (
              <li key={i} className="summary-card__step">
                <span className="summary-card__step-num">{i + 1}</span>
                <span>
                  {t.primary}
                  {t.secondary && <span className="summary-card__text--secondary"><br />{t.secondary}</span>}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="summary-card summary-card--warning">
        <div className="summary-card__label">
          {language === 'english' ? '⚠️ Important Warnings' : '⚠️ 주의할 점'}
        </div>
        <ul className="summary-card__list">
          {analysis.warnings.map((item, i) => {
            const t = getText(item, language)
            return (
              <li key={i} className="summary-card__list-item">
                {t.primary}
                {t.secondary && <span className="summary-card__text--secondary"> — {t.secondary}</span>}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
