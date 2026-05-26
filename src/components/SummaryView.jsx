import StatusCard from './StatusCard'
import ActionChecklist from './ActionChecklist'
import DatesPanel from './DatesPanel'
import GlossarySection from './GlossarySection'
import CaseSection from './CaseSection'
import { getText } from './StatusCard'

export default function SummaryView({
  analysis, classifier, checklist, dates, glossary, caseData,
  language, simplified, onGuide, onStartWalkthrough, walkthroughId,
}) {
  const summary = getText(analysis.summary, language)
  const isKorean = language === 'korean' || language === 'bilingual'

  return (
    <div className="summary-view">

      {/* Email type classifier card — always at top */}
      <StatusCard classifier={classifier} language={language} />

      {/* What is this email */}
      <div className="summary-card summary-card--blue">
        <div className="summary-card__label">
          {isKorean ? '이 이메일은 무엇인가요?' : 'What is this email?'}
        </div>
        <p className="summary-card__text">{summary.primary}</p>
        {summary.secondary && (
          <p className="summary-card__text summary-card__text--secondary">{summary.secondary}</p>
        )}
      </div>

      {/* Key details — hidden in simplified view */}
      {!simplified && (
        <div className="summary-card">
          <div className="summary-card__label">
            {isKorean ? '🔑 중요한 내용' : '🔑 Key Details'}
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
      )}

      {/* Interactive action checklist */}
      <ActionChecklist
        checklist={checklist}
        language={language}
        onGuide={onGuide}
        onStartWalkthrough={onStartWalkthrough}
        walkthroughId={walkthroughId}
      />

      {/* Detected dates — compact inline in summary */}
      <DatesPanel dates={dates} language={language} />

      {/* Warnings */}
      {!simplified && (
        <div className="summary-card summary-card--warning">
          <div className="summary-card__label">
            {isKorean ? '⚠️ 주의할 점' : '⚠️ Important Warnings'}
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
      )}

      {/* Expandable sections */}
      <GlossarySection glossary={glossary} language={language} />
      <CaseSection caseData={caseData} language={language} />

    </div>
  )
}
