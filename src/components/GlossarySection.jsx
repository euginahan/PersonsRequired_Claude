import { useState } from 'react'
import { getText } from './StatusCard'

export default function GlossarySection({ glossary, language }) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const isKorean = language === 'korean' || language === 'bilingual'

  function toggle(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="expand-section">
      <button className="expand-section__toggle" onClick={() => setOpen(v => !v)}>
        <span>📖 {isKorean ? '용어 설명' : 'Glossary'}</span>
        <span className="expand-section__caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="expand-section__body">
          {glossary.map((item) => {
            const term = getText(item.term, language)
            const def = getText(item.definition, language)
            const ctx = getText(item.emailContext, language)
            const isOpen = expandedId === item.id

            return (
              <div key={item.id} className="glossary-item">
                <button className="glossary-item__term" onClick={() => toggle(item.id)}>
                  <span>{term.primary}</span>
                  <span className="glossary-item__caret">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="glossary-item__body">
                    <p className="glossary-item__def">{def.primary}</p>
                    {def.secondary && <p className="summary-card__text--secondary">{def.secondary}</p>}
                    <div className="glossary-item__context">
                      <span className="glossary-item__context-label">
                        {isKorean ? '이 이메일에서:' : 'In this email:'}
                      </span>
                      {' '}{ctx.primary}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
