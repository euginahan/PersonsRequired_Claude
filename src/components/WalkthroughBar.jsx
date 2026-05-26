export default function WalkthroughBar({
  walkthrough, stepIdx, paused, slowMode, language,
  onNext, onBack, onPause, onExit, onEscalate,
}) {
  const isKorean = language === 'korean' || language === 'bilingual'
  const steps   = walkthrough.steps
  const current = steps[stepIdx]
  const isLast  = stepIdx === steps.length - 1

  const instruction = isKorean ? current.instruction.korean : current.instruction.english
  const confirmLabel = isKorean ? current.confirm.korean : current.confirm.english

  return (
    <div className={`walkthrough-bar${slowMode ? ' walkthrough-bar--slow' : ''}`}>
      <div className="walkthrough-bar__top">
        <span className="walkthrough-bar__title">
          {isKorean ? walkthrough.title.korean : walkthrough.title.english}
        </span>
        <span className="walkthrough-bar__step">
          {stepIdx + 1} / {steps.length}
        </span>
      </div>

      {slowMode && (
        <div className="walkthrough-bar__slow-note">
          {isKorean ? '🐢 천천히 모드 — 준비되면 버튼을 눌러주세요' : '🐢 Slow mode — press when you\'re ready'}
        </div>
      )}

      <p className="walkthrough-bar__instruction">{instruction}</p>

      <div className="walkthrough-bar__controls">
        <button className="wt-btn wt-btn--ghost" onClick={onBack} disabled={stepIdx === 0}>
          {isKorean ? '← 이전' : '← Back'}
        </button>
        <button className="wt-btn wt-btn--ghost" onClick={onPause}>
          {paused
            ? (isKorean ? '재개' : 'Resume')
            : (isKorean ? '일시정지' : 'Pause')}
        </button>
        <button className="wt-btn wt-btn--confirm" onClick={onNext}>
          {isLast ? (isKorean ? '완료 ✓' : 'Done ✓') : confirmLabel}
        </button>
      </div>

      <div className="walkthrough-bar__footer">
        <button className="wt-btn wt-btn--help" onClick={onEscalate}>
          {isKorean ? '도움이 필요해요' : 'I Need More Help'}
        </button>
        <button className="wt-btn wt-btn--exit" onClick={onExit}>
          {isKorean ? '나가기' : 'Exit'}
        </button>
      </div>
    </div>
  )
}
