export default function WalkthroughBar({ walkthrough, stepIdx, paused, language, onNext, onBack, onPause, onExit }) {
  const isKorean = language === 'korean' || language === 'bilingual'
  const steps = walkthrough.steps
  const current = steps[stepIdx]
  const isLast = stepIdx === steps.length - 1
  const instruction = language === 'korean' || language === 'bilingual'
    ? current.instruction.korean
    : current.instruction.english
  const confirmLabel = isKorean ? current.confirm.korean : current.confirm.english

  return (
    <div className="walkthrough-bar">
      <div className="walkthrough-bar__top">
        <span className="walkthrough-bar__title">
          {isKorean
            ? walkthrough.title.korean
            : walkthrough.title.english
          }
        </span>
        <span className="walkthrough-bar__step">
          {stepIdx + 1} / {steps.length}
        </span>
      </div>

      <p className="walkthrough-bar__instruction">{instruction}</p>

      <div className="walkthrough-bar__controls">
        <button
          className="wt-btn wt-btn--ghost"
          onClick={onBack}
          disabled={stepIdx === 0}
        >
          {isKorean ? '← 이전' : '← Back'}
        </button>
        <button className="wt-btn wt-btn--ghost" onClick={onPause}>
          {paused ? (isKorean ? '재개' : 'Resume') : (isKorean ? '일시정지' : 'Pause')}
        </button>
        <button className="wt-btn wt-btn--confirm" onClick={onNext}>
          {isLast
            ? (isKorean ? '완료 ✓' : 'Done ✓')
            : confirmLabel
          }
        </button>
        <button className="wt-btn wt-btn--exit" onClick={onExit}>
          {isKorean ? '나가기' : 'Exit'}
        </button>
      </div>
    </div>
  )
}
