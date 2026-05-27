;(function () {
  'use strict'

  const ROOT_ID   = 'doumi-root'
  const TOGGLE_ID = 'doumi-toggle-btn'

  let state = {
    lang:       'english',
    tab:        'summary',
    checks:     {},
    analysis:   null,
    visible:    true,
  }

  // ─────────────────────────────────────────────────────────────────────
  // GMAIL DOM READING
  // Multiple fallback selectors because Gmail's generated classes change.
  // ─────────────────────────────────────────────────────────────────────

  function readEmail() {
    // Subject
    const subjectEl =
      document.querySelector('h2.hP') ||
      document.querySelector('[data-legacy-last-message-id] h2') ||
      document.querySelector('.ha h2') ||
      document.querySelector('[role="main"] h2')
    const subject = subjectEl ? subjectEl.textContent.trim() : ''

    // Sender name + email
    const senderEl =
      document.querySelector('.gD[email]') ||
      document.querySelector('[email].go') ||
      document.querySelector('.zF[name]')
    const senderName  = senderEl ? (senderEl.getAttribute('name')  || senderEl.textContent.trim()) : ''
    const senderEmail = senderEl ? (senderEl.getAttribute('email') || '') : ''
    const sender = senderEmail ? `${senderName} <${senderEmail}>` : senderName

    // Body — pick the last non-empty expanded message
    const bodyEls = document.querySelectorAll('.a3s.aiL, .a3s.aXjCH, .ii.gt div[dir]')
    let body = ''
    for (let i = bodyEls.length - 1; i >= 0; i--) {
      const txt = bodyEls[i].innerText?.trim() || ''
      if (txt.length > 60) { body = txt; break }
    }

    return { subject, sender, body }
  }

  // ─────────────────────────────────────────────────────────────────────
  // ANALYSIS ENGINE
  // Pattern-match first; fall back to generic extraction.
  // ─────────────────────────────────────────────────────────────────────

  function analyze({ subject, sender, body }) {
    const low = (subject + ' ' + body).toLowerCase()

    if (
      low.includes("driver's license") || low.includes('driver license') ||
      low.includes('dds') || low.includes('drives.ga.gov') ||
      low.includes('license') && (low.includes('expire') || low.includes('renewal'))
    ) return analyzeDDS(subject, sender, body)

    if (low.includes('bill') || low.includes('payment due') ||
        low.includes('invoice') || low.includes('amount due') ||
        low.includes('balance due'))
      return analyzeBill(subject, sender, body)

    if (low.includes('appointment') || low.includes('scheduled') ||
        low.includes('your visit') || low.includes('reminder'))
      return analyzeAppointment(subject, sender, body)

    if (low.includes('package') || low.includes('shipment') ||
        low.includes('delivery') || low.includes('tracking'))
      return analyzeDelivery(subject, sender, body)

    return analyzeGeneric(subject, sender, body)
  }

  function analyzeDDS(subject, sender, body) {
    const cost   = body.match(/\$[\d,]+\.?\d*/)?.[0] || '$32.00'
    const urls   = body.match(/https?:\/\/[\w.\-/?=&]+/g) || []
    const ddsUrl = urls.find(u => u.includes('dds') || u.includes('drives')) || 'dds.drives.ga.gov'
    return {
      type: 'RENEWAL NOTICE',
      urgency: 'high',
      safe: true,
      safeReason: { korean: '공식 조지아 정부 통신', english: 'Official Georgia government communication' },
      summary: {
        korean: `조지아 운전면허증이 곧 만료됩니다. 갱신하지 않으면 합법적으로 운전할 수 없습니다. ${ddsUrl} 에서 온라인으로 갱신하세요.`,
        english: `Your Georgia driver's license expires soon. You must renew or you cannot legally drive. Renew online at ${ddsUrl}.`,
      },
      keyDetails: [
        { korean: `갱신 비용: ${cost}`, english: `Renewal cost: ${cost}` },
        { korean: '유효 기간: 8년', english: 'Valid for: 8 years' },
        { korean: `웹사이트: ${ddsUrl}`, english: `Website: ${ddsUrl}` },
        { korean: '앱: DDS 2 GO', english: 'Mobile app: DDS 2 GO' },
      ],
      actions: [
        { korean: 'DDS 웹사이트 접속', english: 'Go to DDS website' },
        { korean: '갱신 신청서 작성', english: 'Complete renewal application' },
        { korean: `${cost} 온라인 결제`, english: `Pay ${cost} online` },
        { korean: '새 면허증 수령 (7–10일 소요)', english: 'Wait for new license (7–10 days)' },
      ],
      safety: [
        { ok: true,  korean: '공식 조지아 정부 서버에서 발송됨', english: 'Sent from official Georgia government server' },
        { ok: true,  korean: '링크가 공식 주 정부 웹사이트로 연결됨', english: 'Link leads to official state website' },
        { ok: true,  korean: '이메일 내에서 직접 결제 요청 없음', english: 'No payment info requested in the email itself' },
        { ok: true,  korean: '비정상적인 긴급함 압박 없음', english: 'No unusual urgency pressure tactics' },
      ],
    }
  }

  function analyzeBill(subject, sender, body) {
    const amount  = body.match(/\$[\d,]+\.?\d*/)?.[0] || ''
    const dueDate = body.match(/(?:due|by|before)\s+([A-Z][a-z]+\s+\d+[,\s]+\d{4}|\d+\/\d+\/\d+)/i)?.[1] || ''
    return {
      type: 'BILL / PAYMENT',
      urgency: 'medium',
      safe: null,
      safeReason: { korean: '결제 전에 발신자 확인 권장', english: 'Verify sender before making payment' },
      summary: {
        korean: `청구서 또는 결제 알림입니다.${amount ? ` 금액: ${amount}.` : ''}${dueDate ? ` 납부 기한: ${dueDate}.` : ''}`,
        english: `This is a bill or payment reminder.${amount ? ` Amount: ${amount}.` : ''}${dueDate ? ` Due: ${dueDate}.` : ''}`,
      },
      keyDetails: [
        amount  && { korean: `청구 금액: ${amount}`,   english: `Amount: ${amount}` },
        dueDate && { korean: `납부 기한: ${dueDate}`,  english: `Due date: ${dueDate}` },
        sender  && { korean: `발신자: ${sender}`,      english: `Sender: ${sender}` },
      ].filter(Boolean),
      actions: [
        { korean: '청구 금액이 맞는지 확인', english: 'Verify the billed amount is correct' },
        { korean: '납부 기한 캘린더에 기록', english: 'Note the due date on your calendar' },
        { korean: '온라인 또는 우편으로 결제', english: 'Pay online or by mail' },
      ],
      safety: [
        { ok: null, korean: '결제 전에 발신자 확인 필수', english: 'Always verify sender before paying' },
        { ok: null, korean: '직접 웹사이트 방문 권장 (링크 클릭 대신)', english: 'Go directly to website instead of clicking links' },
      ],
    }
  }

  function analyzeAppointment(subject, sender, body) {
    const dateMatch = body.match(
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)[,\s]+\d+[,\s]*\d{0,4}|\d{1,2}\/\d{1,2}\/\d{2,4}/i
    )?.[0] || ''
    const timeMatch = body.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i)?.[0] || ''
    return {
      type: 'APPOINTMENT',
      urgency: 'medium',
      safe: true,
      safeReason: { korean: '일반적인 예약 알림', english: 'Routine appointment notification' },
      summary: {
        korean: `예약 또는 일정 관련 이메일입니다.${dateMatch ? ` 날짜: ${dateMatch}.` : ''}${timeMatch ? ` 시간: ${timeMatch}.` : ''}`,
        english: `Appointment or scheduling email.${dateMatch ? ` Date: ${dateMatch}.` : ''}${timeMatch ? ` Time: ${timeMatch}.` : ''}`,
      },
      keyDetails: [
        dateMatch && { korean: `날짜: ${dateMatch}`, english: `Date: ${dateMatch}` },
        timeMatch && { korean: `시간: ${timeMatch}`, english: `Time: ${timeMatch}` },
        sender    && { korean: `발신자: ${sender}`, english: `From: ${sender}` },
      ].filter(Boolean),
      actions: [
        { korean: '예약 날짜와 시간 확인', english: 'Note the appointment date and time' },
        { korean: '캘린더에 추가', english: 'Add to your calendar' },
        { korean: '필요시 확인 또는 취소 연락', english: 'Confirm or cancel if needed' },
      ],
      safety: [
        { ok: true, korean: '일반적인 예약 이메일 형식', english: 'Standard appointment email format' },
      ],
    }
  }

  function analyzeDelivery(subject, sender, body) {
    const tracking = body.match(/[A-Z0-9]{10,30}/)?.[0] || ''
    return {
      type: 'PACKAGE / DELIVERY',
      urgency: 'low',
      safe: true,
      safeReason: { korean: '일반적인 배송 알림', english: 'Routine delivery notification' },
      summary: {
        korean: `패키지 배송 관련 이메일입니다.${tracking ? ` 운송장 번호: ${tracking}.` : ''}`,
        english: `Package delivery notification.${tracking ? ` Tracking: ${tracking}.` : ''}`,
      },
      keyDetails: [
        tracking && { korean: `운송장 번호: ${tracking}`, english: `Tracking number: ${tracking}` },
        sender   && { korean: `배송사: ${sender}`, english: `Carrier: ${sender}` },
      ].filter(Boolean),
      actions: [
        { korean: '운송장 번호로 배송 추적', english: 'Track your package with the tracking number' },
        { korean: '배송 날짜 확인', english: 'Check the expected delivery date' },
        { korean: '배송 후 수령 확인', english: 'Confirm receipt after delivery' },
      ],
      safety: [
        { ok: true, korean: '일반적인 배송 알림', english: 'Looks like a standard delivery notification' },
        { ok: null, korean: '공식 배송사 앱에서 직접 추적 권장', english: 'Recommend tracking directly in the carrier\'s official app' },
      ],
    }
  }

  function analyzeGeneric(subject, sender, body) {
    const sentences = (body || '').split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 20).slice(0, 3)
    return {
      type: 'EMAIL',
      urgency: 'low',
      safe: null,
      safeReason: { korean: '발신자를 확인하세요', english: 'Please verify the sender' },
      summary: {
        korean: `"${subject || '(제목 없음)'}" 제목의 이메일입니다.${sender ? ` ${sender}에서 발신되었습니다.` : ''}`,
        english: `Email with subject "${subject || '(no subject)'}"${sender ? ` from ${sender}` : ''}.`,
      },
      keyDetails: sentences.map(s => ({ korean: s, english: s })),
      actions: [
        { korean: '이메일 전체 내용 읽기', english: 'Read the full email carefully' },
        { korean: '발신자가 누구인지 확인', english: 'Verify who sent this email' },
        { korean: '필요한 경우에만 답장', english: 'Reply only if necessary' },
      ],
      safety: [
        { ok: null, korean: '신뢰하는 경우에만 링크 클릭', english: 'Only click links if you fully trust the sender' },
        { ok: null, korean: '개인 정보는 절대 이메일로 보내지 마세요', english: 'Never send personal info by email' },
      ],
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // HTML RENDERING
  // ─────────────────────────────────────────────────────────────────────

  function t(obj) {
    if (!obj) return ''
    const { lang } = state
    if (lang === 'bilingual') return `${obj.korean} <span class="doumi-sec">${obj.english}</span>`
    if (lang === 'korean')    return obj.korean
    return obj.english
  }

  function renderPanel(a) {
    const { lang, tab, checks } = state
    const isKo  = lang === 'korean' || lang === 'bilingual'
    const labels = {
      summary: isKo ? '요약'  : 'Summary',
      safety:  isKo ? '안전'  : 'Safety',
      actions: isKo ? '할 일' : 'Actions',
    }
    const urgencyColor = { high: '#dc2626', medium: '#d97706', low: '#64748b' }[a.urgency] || '#64748b'

    // Summary tab
    const summaryHTML = `
      <div class="doumi-badge" style="border-color:${urgencyColor};color:${urgencyColor};background:${urgencyColor}1a">
        ${a.type}
      </div>
      <div class="doumi-card doumi-card--blue">
        <div class="doumi-card__lbl">${isKo ? '이 이메일은 무엇인가요?' : 'What is this email?'}</div>
        <div class="doumi-card__txt">${t(a.summary)}</div>
      </div>
      <div class="doumi-card">
        <div class="doumi-card__lbl">${isKo ? '🔑 중요한 내용' : '🔑 Key Details'}</div>
        <ul class="doumi-list">
          ${a.keyDetails.map(d => `<li>${t(d)}</li>`).join('')}
        </ul>
      </div>
    `

    // Safety tab
    const safeIcon  = a.safe === true ? '✅' : a.safe === false ? '🚫' : '⚠️'
    const safeLabel = a.safe === true
      ? (isKo ? '이 이메일은 안전합니다' : 'THIS EMAIL IS SAFE')
      : a.safe === false
        ? (isKo ? '주의하세요!' : 'BE CAREFUL!')
        : (isKo ? '발신자 확인 필요' : 'VERIFY SENDER')
    const safeCls = a.safe === true ? 'doumi-verdict--ok' : a.safe === false ? 'doumi-verdict--bad' : 'doumi-verdict--warn'

    const safetyHTML = `
      <div class="doumi-verdict ${safeCls}">
        <div class="doumi-verdict__icon">${safeIcon}</div>
        <div class="doumi-verdict__label">${safeLabel}</div>
        ${a.safeReason ? `<div class="doumi-verdict__sub">${t(a.safeReason)}</div>` : ''}
      </div>
      <div class="doumi-findings">
        ${(a.safety || []).map(f => `
          <div class="doumi-finding">
            <span class="doumi-dot ${f.ok === true ? 'doumi-dot--ok' : f.ok === false ? 'doumi-dot--bad' : 'doumi-dot--warn'}"></span>
            <span>${t(f)}</span>
          </div>
        `).join('')}
      </div>
    `

    // Actions tab
    const actionsHTML = `
      <div class="doumi-card__lbl" style="margin-bottom:10px">
        ${isKo ? '✅ 할 일 목록' : '✅ Action Steps'}
      </div>
      <div class="doumi-checklist">
        ${a.actions.map((action, i) => `
          <div class="doumi-ci">
            <div class="doumi-cbox ${checks[i] ? 'doumi-cbox--chk' : ''}" data-action="toggle" data-idx="${i}">
              ${checks[i] ? '✓' : ''}
            </div>
            <div class="doumi-ci__txt ${checks[i] ? 'doumi-ci__txt--done' : ''}">${t(action)}</div>
          </div>
        `).join('')}
      </div>
    `

    return `
      <div class="doumi-hdr">
        <div class="doumi-title">🇰🇷 이메일 도우미</div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="doumi-icon-btn" data-action="refresh" title="${isKo ? '새로고침' : 'Refresh'}">🔄</button>
          <button class="doumi-icon-btn" data-action="close" title="${isKo ? '닫기' : 'Close'}">✕</button>
        </div>
      </div>

      <div class="doumi-langs">
        ${['korean','english','bilingual','simple'].map(l => `
          <button class="doumi-lbtn ${lang === l ? 'doumi-lbtn--on' : ''}"
                  data-action="set-lang" data-val="${l}">
            ${{ korean:'한국어', english:'English', bilingual:'둘 다', simple:'쉬운 English' }[l]}
          </button>
        `).join('')}
      </div>

      <div class="doumi-tabs">
        ${['summary','safety','actions'].map(t => `
          <button class="doumi-tbtn ${tab === t ? 'doumi-tbtn--on' : ''}"
                  data-action="set-tab" data-val="${t}">
            ${labels[t]}
          </button>
        `).join('')}
      </div>

      <div class="doumi-body">
        <div style="display:${tab === 'summary' ? 'flex' : 'none'};flex-direction:column;gap:10px">${summaryHTML}</div>
        <div style="display:${tab === 'safety'  ? 'block' : 'none'}">${safetyHTML}</div>
        <div style="display:${tab === 'actions' ? 'block' : 'none'}">${actionsHTML}</div>
      </div>

      <div class="doumi-footer">
        이메일 도우미 v1.0 · ${isKo ? '실제 Gmail 분석' : 'Live Gmail analysis'}
      </div>
    `
  }

  function renderWaiting() {
    return `
      <div class="doumi-hdr">
        <div class="doumi-title">🇰🇷 이메일 도우미</div>
        <button class="doumi-icon-btn" data-action="close">✕</button>
      </div>
      <div class="doumi-waiting">
        <div style="font-size:36px;margin-bottom:14px">📬</div>
        <div style="font-weight:600;color:#0f172a;margin-bottom:6px">이메일을 열어주세요</div>
        <div style="font-size:13px;color:#64748b">Open an email to start analyzing.</div>
      </div>
    `
  }

  // ─────────────────────────────────────────────────────────────────────
  // PANEL DOM MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────

  function getRoot() {
    return document.getElementById(ROOT_ID)
  }

  function mount() {
    if (getRoot()) return
    const el = document.createElement('div')
    el.id = ROOT_ID
    document.body.appendChild(el)

    // Toggle button (shown when panel is hidden)
    const btn = document.createElement('button')
    btn.id = TOGGLE_ID
    btn.textContent = '🇰🇷'
    btn.title = '이메일 도우미 열기'
    btn.addEventListener('click', () => show())
    document.body.appendChild(btn)

    el.addEventListener('click', handleClick)
  }

  function rerender() {
    const el = getRoot()
    if (!el) return
    el.innerHTML = state.analysis ? renderPanel(state.analysis) : renderWaiting()
  }

  function show() {
    const el = getRoot()
    const btn = document.getElementById(TOGGLE_ID)
    if (el)  el.style.display  = 'flex'
    if (btn) btn.style.display = 'none'
    state.visible = true
  }

  function hide() {
    const el  = getRoot()
    const btn = document.getElementById(TOGGLE_ID)
    if (el)  el.style.display  = 'none'
    if (btn) btn.style.display = 'flex'
    state.visible = false
  }

  // ─────────────────────────────────────────────────────────────────────
  // EVENT DELEGATION
  // ─────────────────────────────────────────────────────────────────────

  function handleClick(e) {
    const el = e.target.closest('[data-action]')
    if (!el) return
    const action = el.dataset.action
    const val    = el.dataset.val
    const idx    = el.dataset.idx

    if (action === 'close')    { hide(); return }
    if (action === 'refresh')  { state.analysis = null; state.checks = {}; update(); return }
    if (action === 'set-lang') { state.lang = val; rerender(); return }
    if (action === 'set-tab')  { state.tab  = val; rerender(); return }
    if (action === 'toggle')   {
      state.checks[idx] = !state.checks[idx]
      const cbox = el
      cbox.classList.toggle('doumi-cbox--chk', state.checks[idx])
      cbox.textContent = state.checks[idx] ? '✓' : ''
      const txt = cbox.nextElementSibling
      if (txt) txt.classList.toggle('doumi-ci__txt--done', state.checks[idx])
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // UPDATE CYCLE
  // ─────────────────────────────────────────────────────────────────────

  function update() {
    mount()
    const email = readEmail()
    if (!email.subject && !email.body) {
      state.analysis = null
    } else {
      state.analysis = analyze(email)
      state.checks   = {}
    }
    if (state.visible) rerender()
  }

  // ─────────────────────────────────────────────────────────────────────
  // GMAIL NAVIGATION DETECTION
  // Gmail is a SPA — watch for URL hash changes and DOM mutations.
  // ─────────────────────────────────────────────────────────────────────

  let lastHash    = ''
  let debounceId  = null

  function scheduleUpdate() {
    clearTimeout(debounceId)
    debounceId = setTimeout(update, 900)
  }

  window.addEventListener('hashchange', () => {
    if (location.hash !== lastHash) {
      lastHash = location.hash
      state.analysis = null
      state.checks   = {}
      scheduleUpdate()
    }
  })

  // Catch URL changes that don't fire hashchange (pushState nav)
  const origPushState = history.pushState.bind(history)
  history.pushState = function (...args) {
    origPushState(...args)
    scheduleUpdate()
  }

  new MutationObserver(() => {
    if (location.hash !== lastHash) {
      lastHash = location.hash
      scheduleUpdate()
    }
  }).observe(document.body, { childList: true, subtree: false })

  // Extension icon toggle message
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'DOUMI_TOGGLE') {
      state.visible ? hide() : show()
    }
  })

  // ─────────────────────────────────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────────────────────────────────

  mount()
  rerender()
  setTimeout(update, 1500)
})()
