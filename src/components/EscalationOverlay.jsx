import { getText } from './StatusCard'

const CHOICES = [
  {
    id: 'cant-find',
    icon: '🔍',
    korean: '여전히 찾을 수 없어요',
    english: "I still can't find it",
  },
  {
    id: 'slower',
    icon: '🐢',
    korean: '더 천천히 보여주세요',
    english: 'Show me slower',
  },
  {
    id: 'scared',
    icon: '😰',
    korean: '잘못 클릭할까봐 걱정돼요',
    english: "I'm scared to click the wrong thing",
  },
  {
    id: 'dont-understand',
    icon: '🤔',
    korean: '이게 무슨 뜻인지 모르겠어요',
    english: "I don't understand what this means",
  },
  {
    id: 'human',
    icon: '🤝',
    korean: '다른 사람의 도움이 필요해요',
    english: 'I need someone to help me',
  },
]

const MODE_HEADERS = {
  'cant-find':       { icon: '🔍', korean: '강조 표시를 강화했어요',     english: "We've made the highlight stronger" },
  slower:            { icon: '🐢', korean: '더 천천히 진행할게요',        english: "We'll go slower now" },
  scared:            { icon: '😊', korean: '걱정하지 마세요',             english: "It's okay — you won't break anything" },
  'dont-understand': { icon: '📖', korean: '쉽게 설명해 드릴게요',        english: "Let us explain this step" },
  human:             { icon: '🤝', korean: '도움을 받을 수 있어요',       english: 'Here are ways to get more help' },
}

function ModeContent({ mode, step, language, onAddReminder }) {
  const isKorean = language === 'korean' || language === 'bilingual'

  if (mode === 'cant-find') {
    const simplified = step?.simplified
    return (
      <div className="esc-mode-body">
        <p className="esc-mode-text">
          {isKorean
            ? '이제 더 밝고 강하게 깜박이는 파란색 테두리를 찾으세요.'
            : 'Look for the stronger, brighter pulsing blue outline now.'}
        </p>
        {simplified && (
          <div className="esc-mode-simplified">
            <span className="esc-mode-simplified__label">
              {isKorean ? '간단하게:' : 'In simple terms:'}
            </span>
            <p>{isKorean ? simplified.korean : simplified.english}</p>
          </div>
        )}
      </div>
    )
  }

  if (mode === 'slower') {
    return (
      <div className="esc-mode-body">
        <p className="esc-mode-text">
          {isKorean
            ? '이제 각 단계가 더 천천히 진행돼요. 서두르지 않아도 괜찮아요. 준비가 되면 버튼을 눌러주세요.'
            : "Each step will move more slowly now. There's no rush. Press the button only when you're ready."}
        </p>
        <div className="esc-mode-tip">
          <span className="esc-mode-tip__icon">💡</span>
          {isKorean
            ? '확인 버튼을 누를 때만 다음 단계로 넘어가요.'
            : 'You only move forward when you press the confirm button.'}
        </div>
      </div>
    )
  }

  if (mode === 'scared') {
    const r = step?.reassurance
    return (
      <div className="esc-mode-body">
        {r ? (
          <>
            <div className="esc-reassure-row">
              <span className="esc-reassure-row__icon">▶</span>
              <div>
                <div className="esc-reassure-row__label">{isKorean ? '클릭하면 무슨 일이 일어나나요?' : 'What will happen when I click?'}</div>
                <p className="esc-reassure-row__val">{isKorean ? r.action.korean : r.action.english}</p>
              </div>
            </div>
            <div className="esc-reassure-row">
              <span className="esc-reassure-row__icon">↩</span>
              <div>
                <div className="esc-reassure-row__label">{isKorean ? '취소할 수 있나요?' : 'Can I undo this?'}</div>
                <p className="esc-reassure-row__val">{isKorean ? r.reversible.korean : r.reversible.english}</p>
              </div>
            </div>
            {r.safe && (
              <div className="esc-safe-badge">
                <span>✓</span>
                {isKorean ? '이 단계는 완전히 안전해요' : 'This step is completely safe'}
              </div>
            )}
          </>
        ) : (
          <p className="esc-mode-text">
            {isKorean ? '이 단계는 안전해요. 잘못된 것을 클릭해도 큰 문제가 생기지 않아요.' : "This step is safe. Clicking the wrong thing won't cause any serious problems."}
          </p>
        )}
      </div>
    )
  }

  if (mode === 'dont-understand') {
    const c = step?.context
    return (
      <div className="esc-mode-body">
        {c ? (
          <>
            <div className="esc-context-block">
              <div className="esc-context-block__label">{isKorean ? '쉽게 말하면:' : 'In plain words:'}</div>
              <p className="esc-context-block__text">{isKorean ? c.plain.korean : c.plain.english}</p>
            </div>
            <div className="esc-context-block esc-context-block--why">
              <div className="esc-context-block__label">{isKorean ? '왜 이 단계가 필요한가요?' : 'Why does this step matter?'}</div>
              <p className="esc-context-block__text">{isKorean ? c.why.korean : c.why.english}</p>
            </div>
          </>
        ) : (
          <p className="esc-mode-text">
            {isKorean ? '이 단계는 목표를 달성하기 위한 필수 단계예요.' : 'This step is necessary to complete your goal.'}
          </p>
        )}
      </div>
    )
  }

  if (mode === 'human') {
    const copied = false
    return (
      <div className="esc-mode-body">
        <p className="esc-mode-text esc-mode-text--sm">
          {isKorean ? '아래 옵션 중 하나를 선택하세요:' : 'Choose one of the options below:'}
        </p>
        <div className="esc-human-options">
          <button className="esc-human-btn" onClick={() => onAddReminder && onAddReminder()}>
            <span>🔖</span>
            <div>
              <div className="esc-human-btn__title">{isKorean ? '나중에 하기' : 'Save for later'}</div>
              <div className="esc-human-btn__sub">{isKorean ? '알림으로 저장해요' : 'Saves as a reminder'}</div>
            </div>
          </button>
          <button className="esc-human-btn" onClick={() => {
            const text = isKorean
              ? '운전면허 갱신 도움 요청\n이메일: Georgia DDS\n할 일: dds.drives.ga.gov에서 갱신 ($32)'
              : "Need help with Driver's License Renewal\nEmail: Georgia DDS\nTask: Renew at dds.drives.ga.gov ($32)"
            navigator.clipboard?.writeText(text)
          }}>
            <span>👨‍👩‍👧</span>
            <div>
              <div className="esc-human-btn__title">{isKorean ? '가족에게 내용 보내기' : 'Send to family member'}</div>
              <div className="esc-human-btn__sub">{isKorean ? '내용을 클립보드에 복사해요' : 'Copies task details to clipboard'}</div>
            </div>
          </button>
          <button className="esc-human-btn" onClick={() => {
            const text = isKorean
              ? '이메일: Georgia DDS 운전면허 갱신\n웹사이트: dds.drives.ga.gov\n비용: $32'
              : 'Email: Georgia DDS License Renewal\nWebsite: dds.drives.ga.gov\nCost: $32'
            navigator.clipboard?.writeText(text)
          }}>
            <span>📋</span>
            <div>
              <div className="esc-human-btn__title">{isKorean ? '세부 정보 복사' : 'Copy issue details'}</div>
              <div className="esc-human-btn__sub">{isKorean ? '도움 요청할 때 붙여넣으세요' : 'Paste this when asking for help'}</div>
            </div>
          </button>
          <div className="esc-human-note">
            {isKorean
              ? '📞 DDS 고객센터: 678-413-8400'
              : '📞 DDS Customer Service: 678-413-8400'}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function EscalationOverlay({ step, mode, language, onChoice, onReturn, onExit, onAddReminder }) {
  const isKorean = language === 'korean' || language === 'bilingual'
  const header = mode ? MODE_HEADERS[mode] : null

  return (
    <div className="esc-overlay" role="dialog" aria-modal="true">
      <div className="esc-card">

        {mode === null ? (
          <>
            <div className="esc-card__header">
              <span className="esc-card__emoji">😊</span>
              <div>
                <div className="esc-card__title">
                  {isKorean ? '어떤 도움이 필요하세요?' : 'What kind of help do you need?'}
                </div>
                <div className="esc-card__sub">
                  {isKorean ? '아래에서 선택해주세요' : 'Choose one below'}
                </div>
              </div>
            </div>

            <div className="esc-choices">
              {CHOICES.map(c => (
                <button
                  key={c.id}
                  className="esc-choice-btn"
                  onClick={() => onChoice(c.id)}
                >
                  <span className="esc-choice-btn__icon">{c.icon}</span>
                  <span className="esc-choice-btn__text">
                    {isKorean ? c.korean : c.english}
                  </span>
                  <span className="esc-choice-btn__arrow">›</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="esc-card__header esc-card__header--mode">
              <span className="esc-card__emoji">{header?.icon}</span>
              <div className="esc-card__title">
                {isKorean ? header?.korean : header?.english}
              </div>
            </div>
            <ModeContent
              mode={mode}
              step={step}
              language={language}
              onAddReminder={onAddReminder}
            />
          </>
        )}

        <div className="esc-footer">
          <button className="esc-footer__return" onClick={onReturn}>
            {isKorean ? '← 안내로 돌아가기' : '← Return to walkthrough'}
          </button>
          <button className="esc-footer__exit" onClick={onExit}>
            {isKorean ? '안내 종료' : 'Exit walkthrough'}
          </button>
        </div>
      </div>
    </div>
  )
}
