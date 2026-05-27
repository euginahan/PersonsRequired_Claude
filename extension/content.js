;(function () {
'use strict'

const ROOT_ID = 'doumi-root'
const PILL_ID = 'doumi-pill'
const TOGGLE_ID = 'doumi-toggle-btn'
const GUIDE_DISMISS_ID = 'doumi-guide-dismiss'
const GUIDE_HL_ID  = 'doumi-guide-hl'
const GUIDE_TIP_ID = 'doumi-guide-tip'
const GUIDE_ARROW_ID = 'doumi-guide-arrow'

const INITIAL_W = 400
const INITIAL_H = 600
const MIN_W = 320
const MIN_H = 400

// ═══════════════════════════════════════════════════════════════
// §1  STATE
// ═══════════════════════════════════════════════════════════════

const ST = {
  lang: 'english', tab: 'summary',
  checks: {}, openSections: {}, openWhy: {},
  glossaryOpen: false, glossaryExpandedId: null,
  caseOpen: false, caseProgress: {},
  analysis: null, visible: true, minimized: false,
  pos: loadPos(), size: loadSize(),
  guideActive: false, guideInfo: null, guideEnhanced: false,
  walkthrough: null, wtStep: 0, wtPaused: false, slowMode: false,
  escOpen: false, escMode: null,
  reminders: loadReminders(), reminderOpen: false, reminderToast: null, toastTimer: null,
  rcFilter: 'all', rcShowCompleted: false,
  pickingDate: null, customDate: '', confirmedDates: {}, doneDates: {}, askingDates: {},
  pickingEmailReminder: false, emailReminderCustom: '',
  a11y: { fontSize: 'normal', highContrast: false, reduceMotion: false, simplified: false },
  a11yOpen: false,
  replyIdx: null, replyText: '',
  chatHistory: [],
  readState: 'idle',
  readIdx: 0,
}

function loadPos() {
  try {
    const v = JSON.parse(localStorage.getItem('doumi_pos') || 'null')
    if (v && typeof v.x === 'number' && typeof v.y === 'number') return v
  } catch {}
  return { x: Math.max(0, window.innerWidth - INITIAL_W - 24), y: 72 }
}
function savePos() { try { localStorage.setItem('doumi_pos', JSON.stringify(ST.pos)) } catch {} }
function loadSize() {
  try {
    const v = JSON.parse(localStorage.getItem('doumi_size') || 'null')
    if (v && v.w >= MIN_W && v.h >= MIN_H) return v
  } catch {}
  return { w: INITIAL_W, h: INITIAL_H }
}
function saveSize() { try { localStorage.setItem('doumi_size', JSON.stringify(ST.size)) } catch {} }

function loadReminders() {
  try { return JSON.parse(localStorage.getItem('doumi_reminders') || '[]') } catch { return [] }
}
function saveReminders() {
  try { localStorage.setItem('doumi_reminders', JSON.stringify(ST.reminders)) } catch {}
}

// ═══════════════════════════════════════════════════════════════
// §2  GMAIL READING
// ═══════════════════════════════════════════════════════════════

function readEmail() {
  const subjectEl = document.querySelector('h2.hP') || document.querySelector('[role="main"] h2') || document.querySelector('.ha h2')
  const subject = subjectEl?.textContent.trim() || ''
  const senderEl = document.querySelector('.gD[email]') || document.querySelector('[email].go')
  const sname = senderEl?.getAttribute('name') || senderEl?.textContent.trim() || ''
  const semail = senderEl?.getAttribute('email') || ''
  const sender = semail ? `${sname} <${semail}>` : sname
  let body = ''
  const bodyEls = document.querySelectorAll('.a3s.aiL, .a3s.aXjCH')
  for (let i = bodyEls.length - 1; i >= 0; i--) {
    const txt = bodyEls[i].innerText?.trim() || ''
    if (txt.length > 60) { body = txt; break }
  }
  return { subject, sender, body }
}

// ═══════════════════════════════════════════════════════════════
// §3  ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════

function analyze({ subject, sender, body }) {
  const low = (subject + ' ' + body).toLowerCase()
  let a
  if (low.includes("driver's license") || low.includes('dds') || low.includes('drives.ga.gov') ||
      (low.includes('license') && (low.includes('expire') || low.includes('renewal'))))
    a = analyzeDDS(subject, sender, body)
  else if (low.includes('bill') || low.includes('payment due') || low.includes('invoice') || low.includes('amount due'))
    a = analyzeBill(subject, sender, body)
  else if (low.includes('appointment') || low.includes('scheduled') || low.includes('your visit'))
    a = analyzeAppt(subject, sender, body)
  else if (low.includes('package') || low.includes('shipment') || low.includes('tracking'))
    a = analyzeDelivery(subject, sender, body)
  else a = analyzeGeneric(subject, sender, body)
  return enrichAnalysis(a, { subject, sender, body })
}

// Add classifier card + caseData + walkthrough confirm labels + glossary context
function enrichAnalysis(a, { subject, sender, body }) {
  const urgIcon = a.urgency === 'high' ? '⚠️' : a.urgency === 'medium' ? '📋' : '📨'
  const ICON_MAP = {
    'RENEWAL NOTICE':    '🪪',
    'BILL / PAYMENT':    '💰',
    'APPOINTMENT':       '📅',
    'PACKAGE / DELIVERY':'📦',
    'EMAIL':             '✉️',
  }
  const PRIO_LBL = {
    high:   bi('긴급',  'High'),
    medium: bi('보통',  'Medium'),
    low:    bi('낮음',  'Low'),
  }
  const RISK_LBL = {
    true:  bi('✓ 안전',     '✓ Safe'),
    false: bi('🚫 위험',    '🚫 Danger'),
    null:  bi('⚠ 주의 필요', '⚠ Verify'),
  }
  const deadlineText = a.dates?.[0]?.val
    ? bi(typeof a.dates[0].val === 'string' ? a.dates[0].val : a.dates[0].val.korean,
         typeof a.dates[0].val === 'string' ? a.dates[0].val : a.dates[0].val.english)
    : bi('이메일 확인', 'See email')
  const actionShort = a.actions?.[0]
    ? bi(a.actions[0].korean || '필요한 조치가 있습니다',
         a.actions[0].english || 'Action required')
    : bi('확인 필요', 'Review needed')

  a.classifier = {
    icon:         ICON_MAP[a.type] || urgIcon,
    action:       bi(a.typeKo || a.type, a.type),
    actionDetail: actionShort,
    priority:     PRIO_LBL[a.urgency] || PRIO_LBL.low,
    priorityLevel: a.urgency || 'low',
    deadline:     deadlineText,
    risk:         a.safe === true ? RISK_LBL.true : a.safe === false ? RISK_LBL.false : RISK_LBL.null,
    riskLevel:    a.safe === true ? 'safe' : a.safe === false ? 'danger' : 'caution',
  }

  // Add explanation field to actions if missing (uses why as fallback)
  a.actions = (a.actions || []).map(act => ({
    ...act,
    explanation: act.explanation || act.why || bi('이 단계를 완료하세요.', 'Complete this step.'),
  }))

  // Enrich walkthrough steps with confirm labels if missing
  if (a.walkthrough) {
    a.walkthrough.steps = a.walkthrough.steps.map((s, i, arr) => ({
      ...s,
      confirm: s.confirm || (i === arr.length - 1
        ? bi('완료', 'Done')
        : bi('완료 →', 'Done →')),
    }))
  }

  // Enrich glossary with emailContext if missing
  a.glossary = (a.glossary || []).map(g => ({
    ...g,
    word: g.word || g.term,
    def:  g.def  || g.definition,
    emailContext: g.emailContext || bi('이 이메일에 사용된 용어입니다.', 'A term used in this email.'),
  }))

  // Build caseData (case memory) — emails grouped + progress
  const caseTypes = {
    'RENEWAL NOTICE':    { name: bi('운전면허 갱신',  'License Renewal') },
    'BILL / PAYMENT':    { name: bi('청구서 처리',     'Bill Payment') },
    'APPOINTMENT':       { name: bi('예약 일정',       'Appointment') },
    'PACKAGE / DELIVERY':{ name: bi('패키지 배송',     'Package Tracking') },
    'EMAIL':             { name: bi('이메일 확인',     'Email Review') },
  }
  const cinfo = caseTypes[a.type] || { name: bi('이메일 작업', 'Email Task') }
  a.caseData = {
    name: cinfo.name,
    emails: [
      { id: 'e-cur', subject: subject || '(no subject)', date: new Date().toLocaleDateString(), label: bi('현재', 'Current'), status: 'current' },
    ],
    progress: a.actions.map((s, i) => ({
      id: `p-${i}`,
      step: { korean: s.korean, english: s.english },
      done: false,
    })),
  }

  return a
}

function analyzeDDS(subject, sender, body) {
  const cost = body.match(/\$[\d,]+\.?\d*/)?.[0] || '$32.00'
  const urls = body.match(/https?:\/\/[\w.\-/?=&]+/g) || []
  const ddsUrl = urls.find(u => u.includes('dds') || u.includes('drives')) || 'dds.drives.ga.gov'
  return {
    type: 'RENEWAL NOTICE', typeKo: '갱신 알림', urgency: 'high', safe: true,
    safeReason: bi('공식 조지아 정부 통신', 'Official Georgia government communication'),
    summary: {
      primary: bi(`조지아 운전면허증이 곧 만료됩니다. 갱신하지 않으면 합법적으로 운전할 수 없습니다.`, `Your Georgia driver's license expires soon. You must renew or you cannot legally drive.`),
      secondary: bi(`${ddsUrl} 에서 온라인으로 갱신할 수 있습니다.`, `Renew online at ${ddsUrl}.`),
    },
    keyDetails: [
      bi(`갱신 비용: ${cost}`, `Renewal cost: ${cost}`),
      bi('유효 기간: 8년', 'Valid for: 8 years'),
      bi(`웹사이트: ${ddsUrl}`, `Website: ${ddsUrl}`),
      bi('앱: DDS 2 GO', 'Mobile app: DDS 2 GO'),
    ],
    warnings: [
      bi('만료된 면허증으로 운전하면 벌금을 받을 수 있습니다.', 'Driving with an expired license can result in fines.'),
      bi('공식 DDS 웹사이트만 사용하세요. 제3자 서비스를 피하세요.', 'Use only the official DDS website. Avoid third-party services.'),
    ],
    actions: [
      { ...bi('DDS 웹사이트 접속', 'Go to DDS website'), guide: { sel: `a[href*="drives.ga.gov"]`, label: bi('DDS 웹사이트 링크입니다\n클릭하면 갱신 페이지로 이동합니다', 'This is the DDS website link\nClick it to go to the renewal page') }, why: bi('온라인 갱신은 DMV 방문 없이 집에서 가능합니다.', 'Online renewal saves a trip to the DMV office.') },
      { ...bi('갱신 신청서 작성', 'Complete renewal application'), why: bi('웹사이트에서 개인 정보와 면허 번호를 입력합니다.', "Enter your personal info and license number on the website.") },
      { ...bi(`${cost} 온라인 결제`, `Pay ${cost} online`), why: bi('신용카드 또는 직불카드로 결제할 수 있습니다.', 'You can pay by credit or debit card.') },
      { ...bi('새 면허증 수령 (7–10일)', 'Wait for new license (7–10 days)'), why: bi('새 면허증이 우편으로 배송됩니다.', 'Your new license arrives by mail.') },
    ],
    dates: [{ label: bi('면허증 만료 예정일', 'License expiration date'), val: bi('이메일에서 날짜 확인', 'Check email for exact date'), meaning: bi('이 날짜 이후에는 운전할 수 없습니다', 'You cannot legally drive after this date'), urgent: true }],
    safety: [
      { ok: true,  ...bi('공식 조지아 정부 서버에서 발송됨', 'Sent from official Georgia government server') },
      { ok: true,  ...bi('링크가 공식 주 정부 웹사이트로 연결됨', 'Link leads to official state website') },
      { ok: true,  ...bi('이메일 내에서 직접 결제 요청 없음', 'No payment info requested in email body') },
      { ok: true,  ...bi('비정상적인 긴급함 압박 없음', 'No unusual urgency pressure tactics') },
    ],
    ignoreSafe: bi('이 이메일을 무시하면 면허증이 만료됩니다. 만료 후 운전 시 벌금이 부과될 수 있습니다.', "Ignoring this means your license will expire. Driving after expiration can result in fines."),
    glossary: [
      { word: bi('Renew / 갱신', 'Renew'), def: bi('면허증의 유효기간을 연장하는 것', 'Extending the valid period of your license') },
      { word: bi('Expire / 만료', 'Expire'), def: bi('면허증이 더 이상 유효하지 않게 되는 날', "The date your license is no longer valid") },
      { word: bi('DDS', 'DDS'), def: bi('조지아 운전자 서비스 부서 (Department of Driver Services)', 'Georgia Department of Driver Services') },
      { word: bi('Non-commercial / 비영업용', 'Non-commercial'), def: bi('사업 목적이 아닌 일반 개인 운전면허', 'Regular personal license, not for business use') },
      { word: bi('Term / 기간', 'Term'), def: bi('면허증이 유효한 기간 (이 경우 8년)', 'Period your license is valid — in this case 8 years') },
    ],
    walkthrough: {
      id: 'renew-license',
      title: bi('면허증 갱신 안내', 'License Renewal Walkthrough'),
      steps: [
        { label: bi('이메일에서 DDS 링크 찾기', 'Find the DDS link in the email'), instruction: bi('이메일에서 파란색 DDS 웹사이트 링크를 찾으세요.', 'Find the blue DDS website link in the email. It is highlighted in blue.'), guideSel: `a[href*="drives.ga.gov"]` },
        { label: bi('DDS 링크 클릭', 'Click the DDS link'), instruction: bi('파란색 링크를 클릭하여 DDS 갱신 페이지를 여세요.', 'Click the blue link to open the DDS renewal page.'), guideSel: `a[href*="drives.ga.gov"]` },
        { label: bi('DDS 사이트에서 갱신 선택', 'Select "Renew Online"'), instruction: bi('DDS 웹사이트에서 "Renew Online" 또는 "Online Services"를 클릭하세요.', 'On the DDS website, click "Renew Online" or "Online Services."'), guideSel: null },
        { label: bi(`${cost} 결제 완료`, `Complete ${cost} payment`), instruction: bi('양식을 작성하고 신용카드 또는 직불카드로 결제하세요.', 'Complete the form and pay by credit or debit card.'), guideSel: null },
      ],
    },
    replyOptions: [
      { label: bi('갱신 예정', 'Will renew soon'), text: bi('알림 이메일 감사합니다. 곧 면허증을 갱신하겠습니다.', 'Thank you for the reminder. I will renew my license soon.') },
      { label: bi('이미 갱신함', 'Already renewed'), text: bi('이미 면허증을 갱신했습니다. 감사합니다.', 'I have already renewed my license. Thank you.') },
      { label: bi('더 많은 시간 필요', 'Need more time'), text: bi('갱신 완료하려면 더 많은 시간이 필요합니다.', 'I need more time to complete this renewal.') },
    ],
    chatPresets: [
      { q: bi('온라인으로 어떻게 갱신하나요?', 'How do I renew online?'), a: bi(`dds.drives.ga.gov 접속 후 "Online Services" > "Renew License" 클릭하세요. 면허 번호와 개인 정보 입력 후 ${cost} 결제하면 됩니다. 7~10일 후 새 면허증이 우편으로 옵니다.`, `Go to dds.drives.ga.gov, click "Online Services" then "Renew License." Enter your license number and personal info, then pay ${cost}. New license arrives by mail in 7–10 days.`) },
      { q: bi('필요한 서류가 무엇인가요?', 'What documents do I need?'), a: bi('온라인 갱신은 현재 면허증 번호만 있으면 됩니다. 주소가 바뀐 경우 새 주소 증명 서류가 추가로 필요할 수 있습니다.', "For online renewal, just have your current license number ready. If your address changed, you may need proof of new address.") },
      { q: bi('이 이메일이 진짜인가요?', 'Is this email legitimate?'), a: bi('네, 공식 조지아 DDS에서 발송한 이메일입니다. 발신 주소가 @drives.ga.gov 이며 이는 공식 정부 도메인입니다.', 'Yes, this is from the official Georgia DDS. The sender address ends in @drives.ga.gov, an official government domain.') },
      { q: bi('온라인 갱신이 불가능하면?', "Can't renew online?"), a: bi('DDS 고객 서비스 센터에 직접 방문할 수 있습니다. dds.drives.ga.gov 에서 가까운 센터를 찾고 예약하세요.', "Visit a DDS Customer Service Center in person. Find the nearest one and book an appointment at dds.drives.ga.gov.") },
      { q: bi('새 면허증은 언제 받나요?', 'When will I get my new license?'), a: bi('온라인 갱신 후 약 7~10 영업일 내에 우편으로 받습니다. 임시 면허증을 인쇄하거나 받을 수 있습니다.', 'After renewing online, your new license typically arrives by mail within 7–10 business days. You may also receive a temporary license.') },
      { q: bi('DDS 2 GO 앱이란?', 'What is DDS 2 GO?'), a: bi('조지아 DDS 공식 모바일 앱입니다. App Store 또는 Google Play에서 무료 다운로드 가능하며, 면허증 갱신, 예약 등을 할 수 있습니다.', "Georgia DDS's official mobile app. Download it free from the App Store or Google Play to renew your license, schedule appointments, and more.") },
      { q: bi('갱신 안 하면 어떻게 되나요?', "What if I don't renew?"), a: bi('면허증 만료 후 운전하면 불법입니다. 벌금 부과 가능성이 있으므로 가능한 빨리 갱신하세요.', "Driving after expiration is illegal and can result in fines. Please renew as soon as possible.") },
    ],
  }
}

function analyzeBill(subject, sender, body) {
  const amount = body.match(/\$[\d,]+\.?\d*/)?.[0] || ''
  const due    = body.match(/(?:due|by|before|payment\s+date)\s*:?\s*([A-Z][a-z]+\s+\d+[,\s]*\d{0,4}|\d+\/\d+\/\d+)/i)?.[1] || ''
  return {
    type: 'BILL / PAYMENT', typeKo: '청구서', urgency: 'medium', safe: null,
    safeReason: bi('결제 전에 발신자를 반드시 확인하세요', 'Verify sender before making any payment'),
    summary: {
      primary: bi(`청구서 또는 결제 알림입니다.${amount ? ` 금액: ${amount}.` : ''}${due ? ` 납부 기한: ${due}.` : ''}`, `Bill or payment reminder.${amount ? ` Amount: ${amount}.` : ''}${due ? ` Due: ${due}.` : ''}`),
    },
    keyDetails: [amount && bi(`청구 금액: ${amount}`, `Amount: ${amount}`), due && bi(`납부 기한: ${due}`, `Due date: ${due}`), sender && bi(`발신자: ${sender}`, `Sender: ${sender}`)].filter(Boolean),
    warnings: [bi('결제 전에 발신자가 합법적인지 확인하세요.', 'Always verify the sender is legitimate before paying.'), bi('링크 클릭 대신 직접 공식 웹사이트 방문을 권장합니다.', 'Go directly to the official website instead of clicking links.')],
    actions: [
      { ...bi('청구 금액이 맞는지 확인', 'Verify the billed amount is correct'), guide: { sel: 'a[href*="http"]', label: bi('이메일 안의 링크를 확인하세요\n진짜 회사 주소인지 확인하세요', 'Check the links inside the email\nMake sure they go to the real company website') }, why: bi('가짜 청구서로 사기를 당할 수 있습니다.', 'Fake bills can be used for fraud.') },
      { ...bi('납부 기한 캘린더에 기록', 'Note the due date on your calendar'), why: bi('기한을 놓치면 연체료가 발생합니다.', 'Missing the deadline causes late fees.') },
      { ...bi('공식 웹사이트에서 직접 결제', 'Pay directly on the official website'), why: bi('이메일 안의 링크 대신 공식 사이트로 직접 이동하면 더 안전합니다.', 'Going directly to the official site is safer than clicking email links.') },
    ],
    dates: due
      ? [{ label: bi('납부 기한', 'Payment due date'), val: due, meaning: bi('이 날짜까지 결제하지 않으면 연체료가 발생할 수 있습니다', 'Late fee may apply if not paid by this date'), urgent: true }]
      : [{ label: bi('납부 기한 (이메일 확인)', 'Payment due (check email)'), val: bi('이메일에서 기한 찾기', 'See email for due date'), meaning: bi('이메일 본문에서 정확한 기한을 확인하세요', 'Look in the email body for the exact due date'), urgent: true }],
    safety: [{ ok: null, ...bi('결제 전에 발신자 확인 필수', 'Must verify sender before paying') }, { ok: null, ...bi('링크 대신 직접 사이트 방문 권장', 'Visit website directly rather than clicking links') }],
    ignoreSafe: bi('결제 기한을 놓치면 연체료가 발생할 수 있습니다.', 'Missing the payment deadline may result in late fees.'),
    glossary: [
      { word: bi('Due Date / 납부 기한', 'Due Date'), def: bi('이 날짜까지 결제해야 하는 마감일입니다', 'The deadline by which you must pay') },
      { word: bi('Late Fee / 연체료', 'Late Fee'), def: bi('기한을 넘기면 추가로 청구되는 금액', 'An extra charge when you pay after the due date') },
      { word: bi('Invoice / 청구서', 'Invoice'), def: bi('지불해야 할 금액과 내역이 적힌 문서', 'A document listing what you owe and why') },
      { word: bi('Auto-pay / 자동 결제', 'Auto-pay'), def: bi('매달 자동으로 결제되도록 설정하는 기능', 'A setting that pays the bill for you each month') },
      { word: bi('Statement / 명세서', 'Statement'), def: bi('이번 달 청구된 모든 항목의 목록', 'A list of all charges in this billing cycle') },
    ],
    walkthrough: {
      id: 'pay-bill',
      title: bi('청구서 결제 안내', 'Pay Bill Walkthrough'),
      steps: [
        { label: bi('발신자 확인', 'Verify the sender'), instruction: bi('이메일 주소를 확인하세요. 공식 회사 도메인(@회사이름.com)이 맞나요?', "Check the sender's email address. Does it match the official company domain (@company.com)?"), guideSel: '.gD[email], [email].go' },
        { label: bi('청구 금액 확인', 'Check the amount'), instruction: bi('청구된 금액이 맞는지 이메일 본문에서 확인하세요.', 'Look in the email body to make sure the amount is correct.'), guideSel: '.a3s.aiL, .a3s.aXjCH' },
        { label: bi('납부 기한 캘린더에 기록', 'Add the due date to your calendar'), instruction: bi('납부 기한을 캘린더 앱에 추가하여 잊지 마세요.', 'Add the due date to your calendar app so you don\'t forget.'), guideSel: null },
        { label: bi('공식 웹사이트로 가서 결제', 'Go to the official website to pay'), instruction: bi('이메일 링크를 클릭하지 말고, 브라우저에서 직접 회사 웹사이트로 이동하세요.', "Don't click the email link. Go to the company website directly in your browser."), guideSel: null },
      ],
    },
    replyOptions: genericReplies(), chatPresets: genericChat(),
  }
}

function analyzeAppt(subject, sender, body) {
  const dateMatch = body.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)[,\s]+\d+[,\s]*\d{0,4}|\d{1,2}\/\d{1,2}\/\d{2,4}/i)?.[0] || ''
  const time      = body.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i)?.[0] || ''
  return {
    type: 'APPOINTMENT', typeKo: '예약', urgency: 'medium', safe: true,
    safeReason: bi('일반적인 예약 알림', 'Routine appointment notification'),
    summary: { primary: bi(`예약 또는 일정 관련 이메일입니다.${dateMatch ? ` 날짜: ${dateMatch}.` : ''}${time ? ` 시간: ${time}.` : ''}`, `Appointment or scheduling email.${dateMatch ? ` Date: ${dateMatch}.` : ''}${time ? ` Time: ${time}.` : ''}`) },
    keyDetails: [dateMatch && bi(`날짜: ${dateMatch}`, `Date: ${dateMatch}`), time && bi(`시간: ${time}`, `Time: ${time}`), sender && bi(`발신자: ${sender}`, `From: ${sender}`)].filter(Boolean),
    warnings: [bi('예약을 잊으면 다시 예약이 어려울 수 있습니다.', 'Missing an appointment can make it hard to reschedule.')],
    actions: [
      { ...bi('예약 날짜와 시간 확인', 'Note appointment date and time'), guide: { sel: '.a3s.aiL, .a3s.aXjCH', label: bi('이메일에서 날짜와 시간을 찾으세요', 'Find the date and time in the email') }, why: bi('정확한 날짜·시간을 알아야 캘린더에 추가할 수 있습니다.', 'You need the exact date and time to add it to your calendar.') },
      { ...bi('캘린더에 추가', 'Add to your calendar'), why: bi('캘린더에 등록하면 알림을 받을 수 있습니다.', 'Adding it to your calendar gives you reminders.') },
      { ...bi('필요시 확인 또는 취소 연락', 'Confirm or cancel if needed'), why: bi('갈 수 없으면 미리 연락해야 다른 사람이 그 시간을 이용할 수 있습니다.', "If you can't go, contact them early so someone else can use the slot.") },
    ],
    dates: dateMatch
      ? [{ label: bi('예약 날짜', 'Appointment date'), val: dateMatch + (time ? ` ${time}` : ''), meaning: bi('이 날짜를 캘린더에 기록하세요', 'Add this date to your calendar'), urgent: false }]
      : [{ label: bi('예약 날짜 (이메일 확인)', 'Appointment date (check email)'), val: bi('이메일에서 날짜 찾기', 'See email for date'), meaning: bi('이메일에서 정확한 날짜와 시간을 확인하세요', 'Look in the email for the exact date and time'), urgent: false }],
    safety: [{ ok: true, ...bi('일반적인 예약 이메일 형식', 'Standard appointment email format') }],
    ignoreSafe: bi('예약을 무시하면 자동으로 취소될 수 있습니다.', 'Ignoring this may result in automatic cancellation.'),
    glossary: [
      { word: bi('Appointment / 예약', 'Appointment'), def: bi('특정 시간에 만나기로 정한 약속', 'A meeting time you have arranged') },
      { word: bi('Reschedule / 일정 변경', 'Reschedule'), def: bi('약속 시간을 다른 날로 옮기는 것', 'To change the appointment to a different date or time') },
      { word: bi('Cancel / 취소', 'Cancel'), def: bi('약속을 더 이상 진행하지 않기로 하는 것', 'To call off the appointment') },
      { word: bi('Confirm / 확인', 'Confirm'), def: bi('약속에 갈 것임을 알려주는 것', 'To let them know you will be there') },
      { word: bi('No-show / 노쇼', 'No-show'), def: bi('약속에 나타나지 않는 것 — 다음 예약이 거절될 수 있습니다', 'Not showing up — may block you from booking again') },
    ],
    walkthrough: {
      id: 'confirm-appt',
      title: bi('예약 확인 안내', 'Confirm Appointment Walkthrough'),
      steps: [
        { label: bi('날짜와 시간 찾기', 'Find the date and time'), instruction: bi('이메일 본문에서 예약 날짜와 시간을 찾으세요.', 'Look in the email body for the appointment date and time.'), guideSel: '.a3s.aiL, .a3s.aXjCH' },
        { label: bi('갈 수 있는지 확인', 'Check if you can go'), instruction: bi('해당 날짜와 시간에 시간이 되는지 확인하세요.', 'Check if you are free at that date and time.'), guideSel: null },
        { label: bi('캘린더에 추가', 'Add to your calendar'), instruction: bi('휴대폰 캘린더 앱을 열고 예약을 추가하세요.', 'Open your phone\'s calendar app and add the appointment.'), guideSel: null },
        { label: bi('필요시 답장', 'Reply if needed'), instruction: bi('확인이 필요하다면 답장 탭을 사용하여 답장하세요.', 'If confirmation is needed, use the Reply tab to send one.'), guideSel: null },
      ],
    },
    replyOptions: genericReplies(), chatPresets: genericChat(),
  }
}

function analyzeDelivery(subject, sender, body) {
  const tracking = body.match(/[A-Z0-9]{10,30}/)?.[0] || ''
  const eta      = body.match(/(?:arriv(?:es|ing)|delivery|expected|estimated)[:\s]+([A-Z][a-z]+\s+\d+[,\s]*\d{0,4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i)?.[1] || ''
  return {
    type: 'PACKAGE / DELIVERY', typeKo: '배송 알림', urgency: 'low', safe: true,
    safeReason: bi('일반적인 배송 알림', 'Routine delivery notification'),
    summary: { primary: bi(`패키지 배송 알림입니다.${tracking ? ` 운송장: ${tracking}.` : ''}${eta ? ` 도착 예정: ${eta}.` : ''}`, `Package delivery notification.${tracking ? ` Tracking: ${tracking}.` : ''}${eta ? ` Expected: ${eta}.` : ''}`) },
    keyDetails: [tracking && bi(`운송장 번호: ${tracking}`, `Tracking number: ${tracking}`), eta && bi(`도착 예정: ${eta}`, `Expected delivery: ${eta}`), sender && bi(`배송사: ${sender}`, `Carrier: ${sender}`)].filter(Boolean),
    warnings: [bi('배송 사기에 주의하세요. 가짜 배송 알림은 개인정보를 빼내려 합니다.', 'Watch for delivery scams. Fake notices try to steal personal info.')],
    actions: [
      { ...bi('운송장 번호로 배송 추적', 'Track package with tracking number'), guide: { sel: '.a3s.aiL, .a3s.aXjCH', label: bi('이메일 본문에서 운송장 번호를 찾으세요', 'Find the tracking number in the email') }, why: bi('운송장 번호로 패키지가 어디 있는지 확인할 수 있습니다.', 'The tracking number tells you where your package is.') },
      { ...bi('예상 배송 날짜 확인', 'Check expected delivery date'), why: bi('집에 있어야 받을 수 있는 패키지인지 확인하세요.', 'Check if you need to be home to receive the package.') },
      { ...bi('배송지 주소가 맞는지 확인', 'Verify the delivery address'), why: bi('주소가 틀리면 패키지가 다른 곳으로 갈 수 있습니다.', "Wrong address means the package may go elsewhere.") },
    ],
    dates: eta
      ? [{ label: bi('도착 예정일', 'Expected delivery'), val: eta, meaning: bi('이 날짜에 집에 있도록 하세요', 'Try to be home on this date'), urgent: false }]
      : [],
    safety: [{ ok: true, ...bi('일반적인 배송 알림', 'Looks like a standard delivery notification') }, { ok: null, ...bi('공식 배송사 앱에서 직접 추적 권장', "Recommend tracking in the carrier's official app") }],
    ignoreSafe: bi('배송 알림을 무시하면 패키지가 반송될 수 있습니다.', 'Ignoring may result in the package being returned.'),
    glossary: [
      { word: bi('Tracking number / 운송장 번호', 'Tracking number'), def: bi('패키지의 위치를 추적하는 데 사용하는 고유 번호', 'A unique number used to follow your package') },
      { word: bi('Carrier / 배송사', 'Carrier'), def: bi('패키지를 배달하는 회사 (UPS, FedEx, USPS 등)', 'The company delivering the package (UPS, FedEx, USPS, etc.)') },
      { word: bi('ETA / 예상 도착 시간', 'ETA'), def: bi('Estimated Time of Arrival — 패키지가 도착할 예상 날짜', 'Estimated Time of Arrival — when the package is expected') },
      { word: bi('Signature required / 서명 필요', 'Signature required'), def: bi('패키지를 받으려면 직접 서명해야 합니다', 'You must sign in person to receive the package') },
      { word: bi('Delivery confirmation / 배송 확인', 'Delivery confirmation'), def: bi('패키지가 도착했음을 알려주는 알림', 'A notice that says the package has arrived') },
    ],
    walkthrough: {
      id: 'track-package',
      title: bi('패키지 추적 안내', 'Track Package Walkthrough'),
      steps: [
        { label: bi('운송장 번호 찾기', 'Find the tracking number'), instruction: bi('이메일 본문에서 운송장 번호(보통 긴 숫자나 문자 조합)를 찾으세요.', 'Find the tracking number in the email body (usually a long number/letter combo).'), guideSel: '.a3s.aiL, .a3s.aXjCH' },
        { label: bi('배송사 확인', 'Check the carrier'), instruction: bi('어느 배송사가 보내는지 확인하세요 (UPS, FedEx, USPS 등).', 'Check which carrier is delivering (UPS, FedEx, USPS, etc.).'), guideSel: null },
        { label: bi('공식 사이트에서 추적', 'Track on the official site'), instruction: bi('이메일 링크를 클릭하지 말고, 배송사 공식 사이트에서 운송장 번호로 추적하세요.', "Don't click the email link. Track via the carrier's official site using the tracking number."), guideSel: null },
        { label: bi('도착 날짜 캘린더에 기록', 'Note the arrival date'), instruction: bi('예상 도착일을 캘린더에 추가하여 그날 집에 있도록 하세요.', 'Add the expected date to your calendar so you can be home.'), guideSel: null },
      ],
    },
    replyOptions: genericReplies(), chatPresets: genericChat(),
  }
}

function analyzeGeneric(subject, sender, body) {
  const sents = (body || '').split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 20).slice(0, 3)
  return {
    type: 'EMAIL', typeKo: '이메일', urgency: 'low', safe: null,
    safeReason: bi('발신자를 확인하세요', 'Please verify the sender'),
    summary: { primary: bi(`"${subject || '(제목 없음)'}" 제목의 이메일${sender ? `. 발신: ${sender}` : ''}.`, `Email with subject "${subject || '(no subject)'}"${sender ? ` from ${sender}` : ''}.`) },
    keyDetails: sents.map(s => bi(s, s)),
    warnings: [bi('모르는 발신자가 보낸 링크는 클릭하지 마세요.', "Don't click links from senders you don't know.")],
    actions: [
      { ...bi('이메일 내용 꼼꼼히 읽기', 'Read the full email carefully'), guide: { sel: '.a3s.aiL, .a3s.aXjCH', label: bi('이메일 본문입니다\n천천히 읽어보세요', 'This is the email body\nRead it carefully') }, why: bi('이메일 내용을 이해해야 다음에 할 일을 결정할 수 있습니다.', 'You need to understand the email before deciding what to do.') },
      { ...bi('발신자 확인', 'Verify who sent this email'), guide: { sel: '.gD[email], [email].go', label: bi('발신자 정보입니다\n이메일 주소가 정확한지 확인하세요', 'This is the sender info\nCheck that the email address is correct') }, why: bi('발신자 이메일 주소가 진짜인지 확인하면 사기 이메일을 피할 수 있습니다.', "Checking the sender's address helps you avoid scams.") },
      { ...bi('필요한 경우에만 답장', 'Reply only if necessary'), why: bi('모든 이메일에 답장할 필요는 없습니다. 알림 이메일은 답장 불필요합니다.', 'Not every email needs a reply. Notification emails usually don\'t require one.') },
    ],
    dates: [],
    safety: [{ ok: null, ...bi('신뢰하는 경우에만 링크 클릭', 'Only click links if you trust the sender') }, { ok: null, ...bi('개인 정보는 이메일로 절대 보내지 마세요', 'Never send personal info by email') }],
    ignoreSafe: bi('이메일 내용을 확인한 후 필요한 조치를 취하세요.', 'Review the email and take action if needed.'),
    glossary: [
      { word: bi('Sender / 발신자', 'Sender'), def: bi('이메일을 보낸 사람', 'The person or company who sent the email') },
      { word: bi('Spam / 스팸', 'Spam'), def: bi('원하지 않은 광고나 사기 이메일', 'Unwanted advertising or scam emails') },
      { word: bi('Phishing / 피싱', 'Phishing'), def: bi('가짜 이메일로 비밀번호나 카드 정보를 빼내려는 사기', 'Scam emails that try to steal passwords or card info') },
      { word: bi('Attachment / 첨부파일', 'Attachment'), def: bi('이메일에 함께 보낸 파일 — 모르는 발신자의 첨부파일은 열지 마세요', 'A file sent with the email — never open one from unknown senders') },
      { word: bi('Unsubscribe / 수신거부', 'Unsubscribe'), def: bi('이메일 목록에서 나의 주소를 제거하는 것', 'Removing your address from the email list') },
    ],
    walkthrough: {
      id: 'review-email',
      title: bi('이메일 확인 안내', 'Review Email Walkthrough'),
      steps: [
        { label: bi('발신자 확인', 'Check the sender'), instruction: bi('이메일을 보낸 사람의 이름과 주소를 확인하세요. 아는 사람인가요?', "Check the sender's name and address. Do you recognize them?"), guideSel: '.gD[email], [email].go' },
        { label: bi('제목 읽기', 'Read the subject'), instruction: bi('이메일 제목을 읽고 무엇에 관한 내용인지 파악하세요.', 'Read the subject line and figure out what it\'s about.'), guideSel: 'h2.hP, [role="main"] h2' },
        { label: bi('본문 천천히 읽기', 'Read the body slowly'), instruction: bi('이메일 본문을 천천히 읽으세요. 모르는 단어는 용어 설명을 참고하세요.', "Read the email body slowly. Check the Glossary for words you don't know."), guideSel: '.a3s.aiL, .a3s.aXjCH' },
        { label: bi('답장이 필요한지 결정', 'Decide if a reply is needed'), instruction: bi('답장이 필요한 이메일인지 결정하세요. 필요하다면 답장 탭을 사용하세요.', 'Decide if you need to reply. If so, use the Reply tab.'), guideSel: null },
      ],
    },
    replyOptions: genericReplies(), chatPresets: genericChat(),
  }
}

function genericReplies() {
  return [
    { label: bi('감사합니다', 'Thank you'), text: bi('이메일 감사합니다. 확인했습니다.', 'Thank you for your email. I have received it.') },
    { label: bi('곧 답변 드리겠습니다', 'Will respond soon'), text: bi('이메일을 확인했습니다. 곧 답변 드리겠습니다.', "I've received your email and will respond soon.") },
    { label: bi('더 많은 정보 필요', 'Need more information'), text: bi('추가 정보가 필요합니다. 더 자세히 알려주시겠어요?', 'I need more information. Could you please provide more details?') },
  ]
}

function genericChat() {
  return [
    { q: bi('이 이메일에 답장해야 하나요?', 'Do I need to reply to this email?'), a: bi('이메일의 내용에 따라 다릅니다. 확인 요청이나 질문이 있으면 답장하세요. 단순 알림이라면 답장하지 않아도 됩니다.', "It depends on the content. Reply if there's a question or confirmation needed. For simple notifications, no reply is necessary.") },
    { q: bi('이메일이 스팸인가요?', 'Could this be spam?'), a: bi('발신자 이메일 주소를 확인하세요. 공식 도메인(@company.com 등)에서 왔는지 확인하고, 의심스러우면 직접 전화하거나 공식 웹사이트를 방문하세요.', "Check the sender's email address. Verify it comes from an official domain. If suspicious, call directly or visit the official website instead of clicking links.") },
    { q: bi('무엇을 해야 하나요?', 'What do I need to do?'), a: bi('할 일 탭에서 필요한 조치 목록을 확인하세요. 각 항목을 차례로 완료하면 됩니다.', "Check the Actions tab for a list of steps you need to take. Complete each item in order.") },
  ]
}

// helper: bilingual object
function bi(korean, english) { return { korean, english } }

// ═══════════════════════════════════════════════════════════════
// §4  RENDER UTILITIES
// ═══════════════════════════════════════════════════════════════

function t(obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  const { lang } = ST
  if (lang === 'bilingual') return `${obj.korean} <span class="doumi-sec">${obj.english}</span>`
  if (lang === 'korean')    return obj.korean
  return obj.english
}

function isKo() { return ST.lang === 'korean' || ST.lang === 'bilingual' }

// ═══════════════════════════════════════════════════════════════
// §5  TAB RENDERERS
// ═══════════════════════════════════════════════════════════════

function renderSummary(a) {
  const ko = isKo()
  const simplified = ST.a11y.simplified
  const c = a.classifier

  // Full classifier card (rich StatusCard from simulation)
  const PRIO_COLOR  = { high: '#dc2626', medium: '#d97706', low: '#64748b' }
  const PRIO_BG     = { high: '#fef2f2', medium: '#fffbeb', low: '#f1f5f9' }
  const RISK_COLOR  = { safe: '#16a34a', caution: '#d97706', danger: '#dc2626' }

  const statusCard = `
    <div class="doumi-status-card">
      <div class="doumi-status-card__top">
        <span class="doumi-status-card__icon">${c.icon}</span>
        <span class="doumi-status-card__action">${t(c.action)}</span>
      </div>
      <div class="doumi-status-card__row">
        <span class="doumi-status-card__meta">${ko ? '우선순위' : 'Priority'}</span>
        <span class="doumi-status-card__badge" style="background:${PRIO_BG[c.priorityLevel]};color:${PRIO_COLOR[c.priorityLevel]};border:1px solid ${PRIO_COLOR[c.priorityLevel]}">${t(c.priority)}</span>
      </div>
      <div class="doumi-status-card__row">
        <span class="doumi-status-card__meta">${ko ? '기한' : 'Deadline'}</span>
        <span class="doumi-status-card__deadline">${t(c.deadline)}</span>
      </div>
      <div class="doumi-status-card__row">
        <span class="doumi-status-card__meta">${ko ? '안전도' : 'Risk'}</span>
        <span class="doumi-status-card__risk" style="color:${RISK_COLOR[c.riskLevel]}">${t(c.risk)}</span>
      </div>
    </div>`

  // Summary card
  const sumCard = `
    <div class="doumi-card doumi-card--blue">
      <div class="doumi-card__lbl">${ko ? '이 이메일은 무엇인가요?' : 'What is this email?'}</div>
      <div class="doumi-card__txt">${t(a.summary.primary)}</div>
      ${a.summary.secondary ? `<div class="doumi-card__txt" style="margin-top:4px">${t(a.summary.secondary)}</div>` : ''}
    </div>`

  // Key details (hidden in simplified)
  const detailsCard = !simplified && a.keyDetails.length ? `
    <div class="doumi-card">
      <div class="doumi-card__lbl doumi-card__lbl--warn">${ko ? '🔑 중요한 내용' : '🔑 Key Details'}</div>
      <ul class="doumi-list">${a.keyDetails.map(d => `<li>${t(d)}</li>`).join('')}</ul>
    </div>` : ''

  // Action checklist — expanded with explanation + why
  const wtId = ST.walkthrough?.id
  const activeWt = a.walkthrough && wtId === a.walkthrough.id
  const checklistCard = `
    <div class="doumi-cl-wrap">
      <div class="doumi-cl-hdr">
        <div class="doumi-section-lbl">✅ ${ko ? '해야 할 일' : 'Action Steps'}</div>
        ${a.walkthrough ? `<button class="doumi-wt-start-btn${activeWt ? ' doumi-wt-start-btn--active' : ''}" data-action="${activeWt ? 'exit-wt' : 'start-wt'}" title="${ko ? '단계별 안내' : 'Walkthrough'}">
          ${activeWt ? (ko ? '▶ 안내 중...' : '▶ In progress...') : (ko ? '▶ 단계별 안내' : '▶ Walkthrough')}
        </button>` : ''}
      </div>
      ${a.actions.map((act, i) => {
        const checked = !!ST.checks[i]
        const wyOpen  = !!ST.openWhy[i]
        return `
        <div class="doumi-ci${checked ? ' doumi-ci--done' : ''}">
          <div class="doumi-ci__main">
            <div class="doumi-cbox${checked ? ' doumi-cbox--chk' : ''}" data-action="toggle-check" data-idx="${i}">${checked ? '✓' : ''}</div>
            <div class="doumi-ci__body">
              <div class="doumi-ci__txt${checked ? ' doumi-ci__txt--done' : ''}">${t(act)}</div>
              <div class="doumi-ci__acts">
                ${act.guide ? `<button class="doumi-gbtn doumi-gbtn--where${ST.guideInfo === act.guide ? ' doumi-gbtn--active' : ''}" data-action="show-guide" data-idx="${i}">${ko ? '어디서?' : 'Show me where'}</button>` : ''}
                <button class="doumi-gbtn doumi-gbtn--why" data-action="toggle-why" data-idx="${i}">${wyOpen ? (ko ? '접기' : 'Hide') : (ko ? '왜?' : 'Why?')}</button>
              </div>
            </div>
          </div>
          ${wyOpen ? `
            <div class="doumi-ci__expand">
              <p class="doumi-ci__exp-text">${t(act.explanation || act)}</p>
              <div class="doumi-ci__why-row">
                <span class="doumi-ci__why-lbl">${ko ? '이유:' : 'Why:'}</span>
                ${t(act.why || act.explanation)}
              </div>
            </div>` : ''}
        </div>`
      }).join('')}
      ${ST.pickingEmailReminder ? `
        <div class="doumi-date-picker" style="margin-top:8px">
          <div class="doumi-date-picker__lbl">${ko ? '언제 알림을 받고 싶으세요?' : 'When should we remind you?'}</div>
          <div class="doumi-date-picker__quick">
            <button class="doumi-date-picker__btn" data-action="save-email-quick" data-quick="tomorrow">${ko ? '내일' : 'Tomorrow'}</button>
            <button class="doumi-date-picker__btn" data-action="save-email-quick" data-quick="week">${ko ? '다음 주' : 'Next week'}</button>
            <button class="doumi-date-picker__btn" data-action="save-email-quick" data-quick="none">${ko ? '날짜 없음' : 'No date'}</button>
          </div>
          <div class="doumi-date-picker__custom">
            <input type="date" class="doumi-date-picker__input" id="doumi-email-reminder-date" value="${esc(ST.emailReminderCustom)}" />
            <button class="doumi-date-picker__confirm" data-action="save-email-custom">${ko ? '확인' : 'Set'}</button>
          </div>
          <button class="doumi-date-picker__cancel" data-action="cancel-email-reminder">${ko ? '취소' : 'Cancel'}</button>
        </div>
      ` : `
        <button class="doumi-save-reminder-btn" data-action="open-email-reminder-picker">
          🔔 ${ko ? '이 이메일을 알림으로 저장' : 'Save this email as a reminder'}
        </button>
      `}
    </div>`

  // Dates panel — with inline date picker
  const datesPanel = a.dates.length ? a.dates.map((d, di) => {
    const dateId = `date-${di}`
    const isConfirmed = !!ST.confirmedDates[dateId]
    const isDone      = !!ST.doneDates[dateId]
    const isAsking    = !!ST.askingDates[dateId]
    const isPicking   = ST.pickingDate === dateId
    const urgencyBadge = d.urgent
      ? `<span class="doumi-urgency-badge doumi-urgency-badge--high">${ko ? '긴급' : 'Urgent'}</span>`
      : `<span class="doumi-urgency-badge doumi-urgency-badge--low">${ko ? '낮음' : 'Low'}</span>`

    const picker = isPicking && !isConfirmed ? `
      <div class="doumi-date-picker">
        <div class="doumi-date-picker__lbl">${ko ? '언제 알림을 받고 싶으세요?' : 'When should we remind you?'}</div>
        <div class="doumi-date-picker__quick">
          <button class="doumi-date-picker__btn" data-action="pick-quick" data-date-id="${dateId}" data-quick="tomorrow">${ko ? '내일' : 'Tomorrow'}</button>
          <button class="doumi-date-picker__btn" data-action="pick-quick" data-date-id="${dateId}" data-quick="week">${ko ? '다음 주' : 'Next week'}</button>
        </div>
        <div class="doumi-date-picker__custom">
          <input type="date" class="doumi-date-picker__input" id="doumi-date-input-${dateId}" value="${esc(ST.customDate)}" />
          <button class="doumi-date-picker__confirm" data-action="pick-custom" data-date-id="${dateId}">${ko ? '확인' : 'Set'}</button>
        </div>
        <button class="doumi-date-picker__cancel" data-action="cancel-pick">${ko ? '취소' : 'Cancel'}</button>
      </div>` : ''

    return `
    <div class="doumi-date-card${isDone ? ' doumi-date-card--done' : ''}">
      <div class="doumi-date-card__top">
        <div class="doumi-date-card__val">${d.val || t(d.label)}</div>
        ${urgencyBadge}
      </div>
      <div class="doumi-date-card__meaning">${t(d.meaning)}</div>
      ${picker}
      <div class="doumi-date-card__btns">
        ${!isConfirmed
          ? `<button class="doumi-date-btn doumi-date-btn--primary" data-action="open-picker" data-date-id="${dateId}" data-date-label="${escAttr(t(d.label))}" ${isDone || isPicking ? 'disabled' : ''}>${ko ? '🔔 알림 추가' : '🔔 Add reminder'}</button>`
          : `<span class="doumi-date-btn doumi-date-btn--set">${ko ? '✓ 알림 설정됨' : '✓ Reminder set'}</span>`}
        <button class="doumi-date-btn${isDone ? ' doumi-date-btn--set' : ''}" data-action="mark-done-date" data-date-id="${dateId}" ${isDone ? 'disabled' : ''}>
          ${isDone ? (ko ? '✓ 완료됨' : '✓ Done') : (ko ? '완료 표시' : 'Mark as done')}
        </button>
        <button class="doumi-date-btn doumi-date-btn--ask" data-action="toggle-ask-date" data-date-id="${dateId}">${ko ? '이게 뭔가요?' : 'What does this mean?'}</button>
      </div>
      ${isAsking ? `
        <div class="doumi-date-card__ask">
          <p>${t(d.meaning)}</p>
        </div>` : ''}
    </div>`
  }).join('') : ''

  // Warnings (hidden in simplified)
  const warnCard = !simplified && a.warnings.length ? `
    <div class="doumi-card doumi-card--warn">
      <div class="doumi-card__lbl doumi-card__lbl--warn">${ko ? '⚠️ 주의할 점' : '⚠️ Important Warnings'}</div>
      <ul class="doumi-list">${a.warnings.map(w => `<li>${t(w)}</li>`).join('')}</ul>
    </div>` : ''

  // Glossary — each term expandable, shows definition + email context
  const glossary = !simplified && a.glossary.length ? `
    <div class="doumi-section">
      <button class="doumi-section__hdr" data-action="toggle-glossary">
        <span>📖 ${ko ? '용어 설명' : 'Glossary'}</span>
        <span>${ST.glossaryOpen ? '▲' : '▼'}</span>
      </button>
      ${ST.glossaryOpen ? `<div class="doumi-section__body">
        ${a.glossary.map((g, gi) => {
          const isOpen = ST.glossaryExpandedId === gi
          return `
          <div class="doumi-gl-item">
            <button class="doumi-gl-item__term" data-action="toggle-gl-term" data-idx="${gi}">
              <span>${t(g.word)}</span>
              <span class="doumi-gl-item__caret">${isOpen ? '▲' : '▼'}</span>
            </button>
            ${isOpen ? `
              <div class="doumi-gl-item__body">
                <p class="doumi-gl-item__def">${t(g.def)}</p>
                <div class="doumi-gl-item__ctx">
                  <span class="doumi-gl-item__ctx-lbl">${ko ? '이 이메일에서:' : 'In this email:'}</span>
                  ${t(g.emailContext)}
                </div>
              </div>` : ''}
          </div>`
        }).join('')}
      </div>` : ''}
    </div>` : ''

  // Case Memory — related emails + progress checklist
  const caseSection = !simplified && a.caseData ? (() => {
    const cd = a.caseData
    const doneCount = cd.progress.filter(p => ST.caseProgress[p.id] ?? p.done).length
    return `
    <div class="doumi-section">
      <button class="doumi-section__hdr" data-action="toggle-case">
        <span>🗂 ${ko ? '관련 케이스' : 'Case Memory'} <span class="doumi-case-pill">${doneCount}/${cd.progress.length}</span></span>
        <span>${ST.caseOpen ? '▲' : '▼'}</span>
      </button>
      ${ST.caseOpen ? `<div class="doumi-section__body">
        <div class="doumi-case-name">${t(cd.name)}</div>
        <div class="doumi-case-section-lbl">${ko ? '관련 이메일' : 'Related emails'}</div>
        ${cd.emails.map(em => `
          <div class="doumi-case-email${em.status === 'current' ? ' doumi-case-email--current' : ''}">
            <span class="doumi-case-email__subj">${esc(em.subject)}</span>
            <span class="doumi-case-email__meta">${esc(em.date)} · ${t(em.label)}</span>
          </div>`).join('')}
        <div class="doumi-case-section-lbl" style="margin-top:8px">${ko ? '진행 상황' : 'Progress'}</div>
        ${cd.progress.map(p => {
          const done = ST.caseProgress[p.id] ?? p.done
          return `
          <button class="doumi-case-step${done ? ' doumi-case-step--done' : ''}" data-action="toggle-case-step" data-id="${p.id}">
            <span class="doumi-case-step__check">${done ? '✓' : ''}</span>
            <span class="doumi-case-step__lbl">${t(p.step)}</span>
          </button>`
        }).join('')}
      </div>` : ''}
    </div>`
  })() : ''

  return statusCard + sumCard + detailsCard + checklistCard + datesPanel + warnCard + glossary + caseSection
}

function renderSafety(a) {
  const ko = isKo()
  const safeIcon  = a.safe === true ? '✅' : a.safe === false ? '🚫' : '⚠️'
  const safeLabel = a.safe === true
    ? (ko ? '이 이메일은 안전합니다' : 'THIS EMAIL IS SAFE')
    : a.safe === false
      ? (ko ? '주의하세요!' : 'BE CAREFUL!')
      : (ko ? '발신자 확인 필요' : 'VERIFY SENDER')
  const vcls = a.safe === true ? 'ok' : a.safe === false ? 'bad' : 'warn'

  return `
    <div class="doumi-verdict doumi-verdict--${vcls}">
      <div class="doumi-verdict__icon">${safeIcon}</div>
      <div class="doumi-verdict__label">${safeLabel}</div>
      ${a.safeReason ? `<div class="doumi-verdict__sub">${t(a.safeReason)}</div>` : ''}
    </div>
    <div class="doumi-card__lbl" style="margin-bottom:6px">${ko ? '🔍 확인 결과' : '🔍 Findings'}</div>
    <div class="doumi-findings">
      ${(a.safety || []).map(f => `
        <div class="doumi-finding">
          <div class="doumi-dot doumi-dot--${f.ok === true ? 'ok' : f.ok === false ? 'bad' : 'warn'}"></div>
          <span>${t(f)}</span>
        </div>`).join('')}
    </div>
    ${a.ignoreSafe ? `
    <div class="doumi-card doumi-card--warn" style="margin-top:10px">
      <div class="doumi-card__lbl doumi-card__lbl--warn">${ko ? '무시하면 어떻게 되나요?' : 'What if I ignore this?'}</div>
      <div class="doumi-card__txt">${t(a.ignoreSafe)}</div>
    </div>` : ''}`
}

function renderReply(a) {
  const ko = isKo()
  const opts = a.replyOptions || []
  return `
    <div class="doumi-card__lbl" style="margin-bottom:8px">${ko ? '답장 선택 또는 직접 작성:' : 'Choose a template or write your own:'}</div>
    <div class="doumi-reply-chips">
      ${opts.map((opt, i) => `
        <button class="doumi-chip${ST.replyIdx === i ? ' doumi-chip--on' : ''}" data-action="pick-reply" data-idx="${i}">
          ${t(opt.label)}
        </button>`).join('')}
    </div>
    <textarea class="doumi-reply-textarea" id="doumi-reply-ta" placeholder="${ko ? '여기에 답장 내용을 입력하세요...' : 'Write your reply here...'}">${esc(ST.replyText)}</textarea>
    <div class="doumi-reply-footer">
      <button class="doumi-copy-btn" id="doumi-copy-btn" data-action="copy-reply">📋 ${ko ? '복사' : 'Copy'}</button>
    </div>`
}

function renderAsk(a) {
  const ko = isKo()
  const presets = a.chatPresets || []
  return `
    <div class="doumi-card__lbl" style="margin-bottom:8px">${ko ? '자주 묻는 질문:' : 'Common questions:'}</div>
    <div class="doumi-chat-presets">
      ${presets.map((p, i) => `
        <button class="doumi-chip" data-action="ask-preset" data-idx="${i}">${t(p.q)}</button>`).join('')}
    </div>
    ${ST.chatHistory.length ? `
    <div class="doumi-chat-msgs">
      ${ST.chatHistory.map(m => `
        <div class="doumi-chat-bubble doumi-chat-bubble--user">${t(m.q)}</div>
        <div class="doumi-chat-bubble doumi-chat-bubble--ai">${t(m.a)}</div>`).join('')}
    </div>` : `<div class="doumi-chat-hint">${ko ? '위 질문을 클릭하세요' : 'Tap a question above'}</div>`}`
}

// ═══════════════════════════════════════════════════════════════
// §6  WALKTHROUGH BAR
// ═══════════════════════════════════════════════════════════════

function renderWalkthrough() {
  if (!ST.walkthrough) return ''
  const ko    = isKo()
  const steps = ST.walkthrough.steps
  const step  = steps[ST.wtStep] || steps[steps.length - 1]
  const isLast = ST.wtStep === steps.length - 1
  const confirmLbl = isLast ? (ko ? '완료 ✓' : 'Done ✓') : t(step.confirm)
  return `
    <div class="doumi-walkthrough${ST.slowMode ? ' doumi-walkthrough--slow' : ''}">
      <div class="doumi-wt__hdr">
        <span>${t(ST.walkthrough.title).toUpperCase()}</span>
        <span>${ST.wtStep + 1} / ${steps.length}</span>
      </div>
      ${ST.slowMode ? `<div class="doumi-wt__slow-note">${ko ? '🐢 천천히 모드 — 준비되면 버튼을 눌러주세요' : "🐢 Slow mode — press when you're ready"}</div>` : ''}
      <div class="doumi-wt__txt">${t(step.instruction)}</div>
      <div class="doumi-wt__btns">
        <button class="doumi-wt-btn doumi-wt-btn--back" data-action="wt-back" ${ST.wtStep === 0 ? 'disabled' : ''}>← ${ko ? '이전' : 'Back'}</button>
        <button class="doumi-wt-btn doumi-wt-btn--pause" data-action="wt-pause">${ST.wtPaused ? (ko ? '▶ 재개' : '▶ Resume') : (ko ? '⏸ 일시정지' : '⏸ Pause')}</button>
        <button class="doumi-wt-btn doumi-wt-btn--go" data-action="wt-next">${confirmLbl}</button>
      </div>
      <div class="doumi-wt__foot">
        <button class="doumi-wt-help" data-action="esc-open">${ko ? '도움이 더 필요해요' : 'I Need More Help'}</button>
        <button class="doumi-wt-exit" data-action="exit-wt">${ko ? '종료' : 'Exit'}</button>
      </div>
    </div>`
}

// ═══════════════════════════════════════════════════════════════
// §7  ESCALATION OVERLAY
// ═══════════════════════════════════════════════════════════════

function renderEscalation() {
  if (!ST.escOpen) return ''
  const ko = isKo()
  let body = ''

  const CHOICES = [
    { id: 'cant-find',       icon: '🔍', label: ko ? '여전히 찾을 수 없어요'            : "I still can't find it" },
    { id: 'slower',          icon: '🐢', label: ko ? '더 천천히 보여주세요'              : 'Show me slower' },
    { id: 'scared',          icon: '😰', label: ko ? '잘못 클릭할까봐 걱정돼요'           : "I'm scared to click the wrong thing" },
    { id: 'dont-understand', icon: '🤔', label: ko ? '이게 무슨 뜻인지 모르겠어요'        : "I don't understand what this means" },
    { id: 'human',           icon: '🤝', label: ko ? '다른 사람의 도움이 필요해요'        : 'I need someone to help me' },
  ]
  const MODE_HEADERS = {
    'cant-find':       { icon: '🔍', label: ko ? '강조 표시를 강화했어요'   : "We've made the highlight stronger" },
    'slower':          { icon: '🐢', label: ko ? '더 천천히 진행할게요'      : "We'll go slower now" },
    'scared':          { icon: '😊', label: ko ? '걱정하지 마세요'           : "It's okay — you won't break anything" },
    'dont-understand': { icon: '📖', label: ko ? '쉽게 설명해 드릴게요'      : 'Let us explain this step' },
    'human':           { icon: '🤝', label: ko ? '도움을 받을 수 있어요'     : 'Here are ways to get more help' },
  }

  if (!ST.escMode) {
    body = `
      <div class="doumi-esc-card__hdr">
        <span class="doumi-esc-card__emoji">😊</span>
        <div>
          <div class="doumi-esc-card__title">${ko ? '어떤 도움이 필요하세요?' : 'What kind of help do you need?'}</div>
          <div class="doumi-esc-card__sub">${ko ? '아래에서 선택해주세요' : 'Choose one below'}</div>
        </div>
      </div>
      <div class="doumi-esc-choices">
        ${CHOICES.map(c => `
          <button class="doumi-esc-choice-row" data-action="esc-mode" data-mode="${c.id}">
            <span class="doumi-esc-choice-row__icon">${c.icon}</span>
            <span class="doumi-esc-choice-row__text">${c.label}</span>
            <span class="doumi-esc-choice-row__arrow">›</span>
          </button>`).join('')}
      </div>`
  } else {
    const hdr = MODE_HEADERS[ST.escMode]
    let inner = ''

    if (ST.escMode === 'cant-find') {
      inner = `
        <p class="doumi-esc-mode-text">${ko ? '이제 더 밝고 강하게 깜박이는 파란색 테두리를 찾으세요.' : 'Look for the stronger, brighter pulsing blue outline now.'}</p>`
    } else if (ST.escMode === 'slower') {
      inner = `
        <p class="doumi-esc-mode-text">${ko ? '이제 각 단계가 더 천천히 진행돼요. 서두르지 않아도 괜찮아요. 준비가 되면 버튼을 눌러주세요.' : "Each step will move more slowly now. There's no rush. Press the button only when you're ready."}</p>
        <div class="doumi-esc-mode-tip"><span class="doumi-esc-mode-tip__icon">💡</span>${ko ? '확인 버튼을 누를 때만 다음 단계로 넘어가요.' : 'You only move forward when you press the confirm button.'}</div>`
    } else if (ST.escMode === 'scared') {
      inner = `
        <div class="doumi-esc-reassure-row">
          <span class="doumi-esc-reassure-row__icon">▶</span>
          <div>
            <div class="doumi-esc-reassure-row__lbl">${ko ? '클릭하면 무슨 일이 일어나나요?' : 'What will happen when I click?'}</div>
            <p class="doumi-esc-reassure-row__val">${ko ? '안내된 단계를 시작합니다. 이 단계는 안전합니다.' : 'It begins the guided step. This step is safe.'}</p>
          </div>
        </div>
        <div class="doumi-esc-reassure-row">
          <span class="doumi-esc-reassure-row__icon">↩</span>
          <div>
            <div class="doumi-esc-reassure-row__lbl">${ko ? '취소할 수 있나요?' : 'Can I undo this?'}</div>
            <p class="doumi-esc-reassure-row__val">${ko ? '네, 언제든지 종료하거나 이전 단계로 돌아갈 수 있어요.' : 'Yes. You can exit or go back any time.'}</p>
          </div>
        </div>
        <div class="doumi-esc-safe-badge"><span>✓</span>${ko ? '이 단계는 완전히 안전해요' : 'This step is completely safe'}</div>`
    } else if (ST.escMode === 'dont-understand') {
      const a = ST.analysis
      inner = `
        <div class="doumi-esc-context-block">
          <div class="doumi-esc-context-block__lbl">${ko ? '쉽게 말하면:' : 'In plain words:'}</div>
          <p class="doumi-esc-context-block__text">${ko ? '이 단계는 진행을 위해 안내된 위치를 따라가는 단계예요.' : 'This step asks you to follow the highlighted spot to keep going.'}</p>
        </div>
        <div class="doumi-esc-context-block doumi-esc-context-block--why">
          <div class="doumi-esc-context-block__lbl">${ko ? '왜 이 단계가 필요한가요?' : 'Why does this step matter?'}</div>
          <p class="doumi-esc-context-block__text">${a ? t(a.ignoreSafe) : (ko ? '이 단계를 건너뛰면 작업이 완료되지 않을 수 있어요.' : 'Skipping this step may leave the task incomplete.')}</p>
        </div>`
    } else if (ST.escMode === 'human') {
      inner = `
        <p class="doumi-esc-mode-text doumi-esc-mode-text--sm">${ko ? '아래 옵션 중 하나를 선택하세요:' : 'Choose one of the options below:'}</p>
        <div class="doumi-esc-human-opts">
          <button class="doumi-esc-human-btn" data-action="esc-save-reminder">
            <span>🔖</span>
            <div>
              <div class="doumi-esc-human-btn__title">${ko ? '나중에 하기' : 'Save for later'}</div>
              <div class="doumi-esc-human-btn__sub">${ko ? '알림으로 저장해요' : 'Saves as a reminder'}</div>
            </div>
          </button>
          <button class="doumi-esc-human-btn" data-action="esc-copy-family">
            <span>👨‍👩‍👧</span>
            <div>
              <div class="doumi-esc-human-btn__title">${ko ? '가족에게 내용 보내기' : 'Send to family member'}</div>
              <div class="doumi-esc-human-btn__sub">${ko ? '내용을 클립보드에 복사해요' : 'Copies task details to clipboard'}</div>
            </div>
          </button>
          <button class="doumi-esc-human-btn" data-action="esc-copy-details">
            <span>📋</span>
            <div>
              <div class="doumi-esc-human-btn__title">${ko ? '세부 정보 복사' : 'Copy issue details'}</div>
              <div class="doumi-esc-human-btn__sub">${ko ? '도움 요청할 때 붙여넣으세요' : 'Paste this when asking for help'}</div>
            </div>
          </button>
          <div class="doumi-esc-human-note">${ko ? '📞 도움 받을 곳: 211 (무료 통역 포함)' : '📞 Call 211 for community help (free interpreter)'}</div>
        </div>`
    }

    body = `
      <div class="doumi-esc-card__hdr doumi-esc-card__hdr--mode">
        <span class="doumi-esc-card__emoji">${hdr?.icon}</span>
        <div class="doumi-esc-card__title">${hdr?.label}</div>
      </div>
      <div class="doumi-esc-mode-body">${inner}</div>`
  }

  return `<div class="doumi-esc-overlay">
    <div class="doumi-esc-card">
      ${body}
      <div class="doumi-esc-footer">
        <button class="doumi-esc-footer__return" data-action="esc-back">
          ← ${ST.escMode ? (ko ? '이전으로' : 'Go back') : (ko ? '안내로 돌아가기' : 'Return to walkthrough')}
        </button>
        <button class="doumi-esc-footer__exit" data-action="exit-wt">${ko ? '안내 종료' : 'Exit walkthrough'}</button>
      </div>
    </div>
  </div>`
}

// ═══════════════════════════════════════════════════════════════
// §8  ACCESSIBILITY MENU
// ═══════════════════════════════════════════════════════════════

function renderA11y() {
  if (!ST.a11yOpen) return ''
  const ko = isKo()
  const a  = ST.a11y
  const rs = ST.readState

  return `
    <div class="doumi-a11y-dropdown" id="doumi-a11y-dd">
      <div class="doumi-a11y-title">${ko ? '화면 설정' : 'Display Settings'}</div>
      <div class="doumi-a11y-row">
        <span class="doumi-a11y-row__lbl">${ko ? '글자 크기' : 'Text size'}</span>
        <div class="doumi-a11y-sizes">
          ${['normal','large','xl'].map(s => `<button class="doumi-a11y-size${a.fontSize === s ? ' doumi-a11y-size--on' : ''}" data-action="a11y-size" data-val="${s}">${s === 'normal' ? 'A' : s === 'large' ? 'A+' : 'A++'}</button>`).join('')}
        </div>
      </div>
      <div class="doumi-a11y-row">
        <span class="doumi-a11y-row__lbl">${ko ? '고대비 모드' : 'High contrast'}</span>
        <button class="doumi-switch${a.highContrast ? ' doumi-switch--on' : ''}" data-action="a11y-toggle" data-key="highContrast" role="switch" aria-checked="${a.highContrast}"><span class="doumi-switch__thumb"></span></button>
      </div>
      <div class="doumi-a11y-row">
        <span class="doumi-a11y-row__lbl">${ko ? '간단히 보기' : 'Simplified view'}</span>
        <button class="doumi-switch${a.simplified ? ' doumi-switch--on' : ''}" data-action="a11y-toggle" data-key="simplified" role="switch" aria-checked="${a.simplified}"><span class="doumi-switch__thumb"></span></button>
      </div>
      ${rs === 'idle'
        ? `<button class="doumi-read-btn" data-action="read-start">🔊 ${ko ? '소리로 읽기' : 'Read aloud'}</button>`
        : `<div class="doumi-read-controls">
            <div class="doumi-read-status">
              <div class="doumi-read-dot${rs === 'reading' ? ' doumi-read-dot--active' : ''}"></div>
              ${rs === 'paused' ? (ko ? '⏸ 일시정지됨' : '⏸ Paused') : (ko ? '🔊 읽는 중...' : '🔊 Reading...')}
            </div>
            <div class="doumi-read-btns">
              ${rs === 'reading'
                ? `<button class="doumi-read-ctrl" data-action="read-pause">⏸ ${ko ? '일시정지' : 'Pause'}</button>`
                : `<button class="doumi-read-ctrl" data-action="read-resume">▶ ${ko ? '재개' : 'Resume'}</button>`}
              <button class="doumi-read-ctrl doumi-read-ctrl--stop" data-action="read-stop">⏹ ${ko ? '중지' : 'Stop'}</button>
            </div>
          </div>`}
    </div>`
}

// ═══════════════════════════════════════════════════════════════
// §9  REMINDER CENTER + TOAST
// ═══════════════════════════════════════════════════════════════

function getCountdown(r, ko) {
  if (!r.dueDate) return { label: ko ? '날짜 미정' : 'No date set', level: 'none' }
  const now = new Date()
  const due = new Date(r.dueDate)
  const days = Math.floor((due - now) / 86400000)
  if (days < 0)  return { label: ko ? '⚠ 기한 초과' : '⚠ Overdue',          level: 'overdue' }
  if (days === 0) return { label: ko ? '오늘까지'    : 'Due today',           level: 'today' }
  if (days === 1) return { label: ko ? '내일까지'    : 'Due tomorrow',        level: 'tomorrow' }
  return { label: ko ? `${days}일 후` : `Due in ${days} days`, level: 'upcoming' }
}

function groupReminders(reminders) {
  const now = new Date()
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const endWeek  = new Date(now.getTime() + 7 * 86400000)
  const active = reminders.filter(r => !r.completed)
  return {
    overdue:   active.filter(r => r.dueDate && new Date(r.dueDate) < now),
    today:     active.filter(r => r.dueDate && new Date(r.dueDate) >= now && new Date(r.dueDate) <= endToday),
    thisWeek:  active.filter(r => r.dueDate && new Date(r.dueDate) > endToday && new Date(r.dueDate) <= endWeek),
    upcoming:  active.filter(r => !r.dueDate || new Date(r.dueDate) > endWeek),
    completed: reminders.filter(r => r.completed),
  }
}

function renderReminderCenter() {
  const ko = isKo()
  const FILTERS = [
    { id: 'all',         label: ko ? '전체' : 'All' },
    { id: 'urgent',      label: ko ? '긴급' : 'Urgent' },
    { id: 'renewal',     label: ko ? '갱신' : 'Renewals' },
    { id: 'appointment', label: ko ? '예약' : 'Appointments' },
    { id: 'payment',     label: ko ? '납부' : 'Bills' },
  ]
  const URGENCY_COLORS = {
    high:   { bg: '#fce8e6', text: '#c5221f', label: ko ? '긴급' : 'Urgent' },
    medium: { bg: '#fff8e1', text: '#f9a825', label: ko ? '보통' : 'Medium' },
    low:    { bg: '#e6f4ea', text: '#188038', label: ko ? '낮음' : 'Low'    },
  }

  const filtered = ST.rcFilter === 'all'
    ? ST.reminders
    : ST.reminders.filter(r => r.category === ST.rcFilter || (ST.rcFilter === 'urgent' && r.urgency === 'high'))
  const groups = groupReminders(filtered)
  const hasActive = groups.overdue.length + groups.today.length + groups.thisWeek.length + groups.upcoming.length > 0

  const renderCard = r => {
    const cd = getCountdown(r, ko)
    const u  = URGENCY_COLORS[r.urgency] || URGENCY_COLORS.low
    return `
      <div class="doumi-rc-card doumi-rc-card--${cd.level}">
        <div class="doumi-rc-card__top">
          <div class="doumi-rc-card__title">${t(r.title)}</div>
          <span class="doumi-rc-card__urgency" style="background:${u.bg};color:${u.text}">${u.label}</span>
        </div>
        <div class="doumi-rc-card__countdown">
          <span class="doumi-rc-countdown doumi-rc-countdown--${cd.level}">${cd.label}</span>
          ${r.emailSubject ? `<span class="doumi-rc-card__source">· ${esc(r.emailSubject.slice(0, 32))}…</span>` : ''}
        </div>
        <div class="doumi-rc-card__actions">
          <button class="doumi-rc-action-btn doumi-rc-action-btn--done" data-action="complete-reminder" data-id="${r.id}">${ko ? '✓ 완료' : '✓ Done'}</button>
          <button class="doumi-rc-action-btn doumi-rc-action-btn--snooze" data-action="snooze-reminder" data-id="${r.id}">${ko ? '🔕 하루 미루기' : '🔕 Snooze 1 day'}</button>
          ${r.walkthroughId ? `<button class="doumi-rc-action-btn doumi-rc-action-btn--wt" data-action="restart-wt" data-wt-id="${r.walkthroughId}">${ko ? '▶ 안내 다시보기' : '▶ Restart guide'}</button>` : ''}
        </div>
      </div>`
  }

  const sec = (arr, label) => arr.length ? `
    <div class="doumi-rc-group">
      <div class="doumi-rc-group__lbl">${label}</div>
      ${arr.map(renderCard).join('')}
    </div>` : ''

  let bodyContent
  if (!hasActive && groups.completed.length === 0) {
    bodyContent = `
      <div class="doumi-rc-empty">
        <div class="doumi-rc-empty__icon">🗓</div>
        <div class="doumi-rc-empty__title">${ko ? '알림이 없어요' : 'No reminders yet'}</div>
        <div class="doumi-rc-empty__sub">${ko ? '이메일에서 "알림 추가" 버튼을 눌러 알림을 설정하세요' : 'Tap "Add reminder" on a date in the Summary tab to get started'}</div>
      </div>`
  } else {
    bodyContent =
      sec(groups.overdue,  ko ? '⚠ 기한 초과' : '⚠ Overdue') +
      sec(groups.today,    ko ? '오늘'        : 'Today') +
      sec(groups.thisWeek, ko ? '이번 주'     : 'This Week') +
      sec(groups.upcoming, ko ? '다가오는 일정' : 'Upcoming') +
      (groups.completed.length ? `
        <div class="doumi-rc-group">
          <button class="doumi-rc-completed-toggle" data-action="toggle-rc-completed">
            ${ko ? `완료됨 (${groups.completed.length})` : `Completed (${groups.completed.length})`}
            <span>${ST.rcShowCompleted ? ' ▲' : ' ▼'}</span>
          </button>
          ${ST.rcShowCompleted ? groups.completed.map(r => `
            <div class="doumi-rc-card doumi-rc-card--completed">
              <div class="doumi-rc-card__title doumi-rc-card__title--done">✓ ${t(r.title)}</div>
            </div>`).join('') : ''}
        </div>` : '')
  }

  return `
    <div class="doumi-rc-hdr">
      <div class="doumi-rc-title">🔔 ${ko ? '알림 센터' : 'Reminder Center'}</div>
      <button class="doumi-icon-btn" data-action="close-reminders">✕</button>
    </div>
    <div class="doumi-rc-filters">
      ${FILTERS.map(f => `
        <button class="doumi-rc-filter-btn${ST.rcFilter === f.id ? ' doumi-rc-filter-btn--active' : ''}" data-action="rc-filter" data-val="${f.id}">${f.label}</button>`).join('')}
    </div>
    <div class="doumi-rc-body">${bodyContent}</div>`
}

function renderToast() {
  if (!ST.reminderToast) return ''
  const ko = isKo()
  return `
    <div class="doumi-toast">
      <div class="doumi-toast__text">
        <div class="doumi-toast__title">🔔 ${ko ? '알림 추가됨' : 'Reminder added'}</div>
        <div class="doumi-toast__sub">${t(ST.reminderToast.title)}</div>
      </div>
      <button class="doumi-toast__view" data-action="open-reminders">${ko ? '보기' : 'View'}</button>
      <button class="doumi-icon-btn" data-action="dismiss-toast" style="color:#94a3b8">✕</button>
    </div>`
}

// ═══════════════════════════════════════════════════════════════
// §10  MAIN RENDER
// ═══════════════════════════════════════════════════════════════

function renderPanel() {
  const ko = isKo()
  const a  = ST.analysis
  const reminderCount = ST.reminders.filter(r => !r.completed).length

  const header = `
    <div class="doumi-hdr">
      <div class="doumi-title">🇰🇷 이메일 도우미</div>
      <div class="doumi-hdr-right">
        <button class="doumi-bell${ST.reminderOpen ? ' doumi-bell--active' : ''}" data-action="toggle-reminders" title="${ko ? '알림' : 'Reminders'}">
          🔔${reminderCount > 0 ? `<span class="doumi-bell__badge">${reminderCount}</span>` : ''}
        </button>
        <div class="doumi-a11y-wrap">
          <button class="doumi-icon-btn" data-action="toggle-a11y" title="${ko ? '접근성' : 'Accessibility'}">${ST.readState !== 'idle' ? '🔊' : '⚙'}</button>
          ${renderA11y()}
        </div>
        <button class="doumi-icon-btn" data-action="minimize-panel" title="${ko ? '최소화' : 'Minimize'}">—</button>
        <button class="doumi-icon-btn" data-action="close-panel" title="${ko ? '닫기' : 'Close'}">✕</button>
      </div>
    </div>`

  // Escalation overlay
  const escOverlay = renderEscalation()

  if (ST.reminderOpen) {
    return header + escOverlay + `<div class="doumi-body">${renderReminderCenter()}</div>${renderToast()}`
  }

  const tabs = [
    { id: 'summary', ko: '요약',  en: 'Summary' },
    { id: 'safety',  ko: '안전',  en: 'Safety'  },
    { id: 'reply',   ko: '답장',  en: 'Reply'   },
    { id: 'ask',     ko: '질문',  en: 'Ask'     },
  ]

  const langBar = `
    <div class="doumi-langs">
      ${[['korean','한국어'],['english','English'],['bilingual','둘 다'],['simple','쉬운 English']].map(([id, lbl]) =>
        `<button class="doumi-lbtn${ST.lang === id ? ' doumi-lbtn--on' : ''}" data-action="set-lang" data-val="${id}">${lbl}</button>`
      ).join('')}
    </div>`

  const tabBar = `
    <div class="doumi-tabs">
      ${tabs.map(t => `<button class="doumi-tbtn${ST.tab === t.id ? ' doumi-tbtn--on' : ''}" data-action="set-tab" data-val="${t.id}">${ko ? t.ko : t.en}</button>`).join('')}
    </div>`

  let bodyContent = ''
  if (!a) {
    bodyContent = `<div class="doumi-waiting"><div style="font-size:36px;margin-bottom:14px">📬</div><div style="font-weight:600;margin-bottom:4px">${ko ? '이메일을 열어주세요' : 'Open an email to begin'}</div><div style="font-size:12.5px;color:#94a3b8">${ko ? '이메일을 클릭하면 분석이 시작됩니다' : 'Click any email to start analysis'}</div></div>`
  } else {
    if (ST.tab === 'summary') bodyContent = renderSummary(a)
    if (ST.tab === 'safety')  bodyContent = renderSafety(a)
    if (ST.tab === 'reply')   bodyContent = renderReply(a)
    if (ST.tab === 'ask')     bodyContent = renderAsk(a)
  }

  const walkbar = ST.walkthrough ? renderWalkthrough() : ''
  const toast   = renderToast()

  return header + escOverlay + langBar + tabBar +
    `<div class="doumi-body">${bodyContent}</div>` +
    walkbar + toast +
    `<div class="doumi-footer">이메일 도우미 v1.0 · ${ko ? '실제 Gmail 분석' : 'Live Gmail analysis'}</div>`
}

// ═══════════════════════════════════════════════════════════════
// §11  DOM MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function mount() {
  if (!document.getElementById(ROOT_ID)) {
    const el = document.createElement('div')
    el.id = ROOT_ID
    document.body.appendChild(el)
    el.addEventListener('click',  handleClick)
    el.addEventListener('input',  handleInput)
    el.addEventListener('change', handleInput)

    addResizeHandles(el)
  }
  if (!document.getElementById(PILL_ID)) {
    const pill = document.createElement('div')
    pill.id = PILL_ID
    document.body.appendChild(pill)
    pill.addEventListener('click', e => {
      if (e.target.closest('#doumi-pill__expand') || e.target.id === PILL_ID || e.target.closest('#'+PILL_ID)) {
        if (e.target.closest('[data-pill-action="expand"]') || !pill.dataset.dragged) {
          ST.minimized = false; rerender(); syncPanel()
        }
      }
      pill.dataset.dragged = ''
    })
    pill.addEventListener('mousedown', startPillDrag)
  }
}

function rerender() {
  const el = document.getElementById(ROOT_ID)
  if (!el) return
  const ta = document.getElementById('doumi-reply-ta')
  if (ta) ST.replyText = ta.value

  if (ST.minimized) {
    syncPanel()
    return
  }
  const prevBody = el.querySelector('.doumi-body')
  const savedScroll = prevBody ? prevBody.scrollTop : 0
  el.innerHTML = renderPanel()
  const newBody = el.querySelector('.doumi-body')
  if (newBody && savedScroll) newBody.scrollTop = savedScroll
  addResizeHandles(el)
  // Attach drag to header
  const hdr = el.querySelector('.doumi-hdr')
  if (hdr) hdr.addEventListener('mousedown', startPanelDrag)

  applyA11y()
  syncPanel()
}

function syncPanel() {
  const el   = document.getElementById(ROOT_ID)
  const pill = document.getElementById(PILL_ID)
  if (!el || !pill) return
  if (!ST.visible) {
    el.style.display = 'none'
    pill.style.display = 'none'
    return
  }
  if (ST.minimized) {
    el.style.display = 'none'
    pill.style.display = 'flex'
    pill.style.left = `${ST.pos.x}px`
    pill.style.top  = `${ST.pos.y}px`
    renderPill(pill)
  } else {
    el.style.display = 'flex'
    pill.style.display = 'none'
    el.style.left   = `${ST.pos.x}px`
    el.style.top    = `${ST.pos.y}px`
    el.style.width  = `${ST.size.w}px`
    el.style.height = `${ST.size.h}px`
  }
}

function renderPill(pill) {
  const reminderCount = ST.reminders.filter(r => !r.completed).length
  const actionCount = ST.analysis ? ST.analysis.actions.filter((_, i) => !ST.checks[i]).length : 0
  const total = reminderCount + actionCount
  const langLabel = { korean: '한국어', english: 'English', bilingual: '둘 다', simple: '쉬운 English' }[ST.lang] || 'English'
  pill.innerHTML = `
    <span id="doumi-pill__icon">🇰🇷</span>
    <span id="doumi-pill__lang">${langLabel}</span>
    ${reminderCount > 0 ? `<span id="doumi-pill__bell">🔔</span>` : ''}
    ${total > 0 ? `<span id="doumi-pill__badge">${total}</span>` : `<span id="doumi-pill__dot"></span>`}
    <button id="doumi-pill__expand" data-pill-action="expand" title="열기">▢</button>`
}

// ─── Drag / Resize ───────────────────────────────────────────────
function startPanelDrag(e) {
  if (e.target.closest('[data-action]')) return  // don't drag when clicking buttons
  if (e.button !== 0) return
  e.preventDefault()
  const startX = e.clientX, startY = e.clientY
  const origX = ST.pos.x,   origY = ST.pos.y

  function move(ev) {
    const nx = Math.max(0, Math.min(window.innerWidth - 60, origX + (ev.clientX - startX)))
    const ny = Math.max(0, Math.min(window.innerHeight - 40, origY + (ev.clientY - startY)))
    ST.pos = { x: nx, y: ny }
    const el = document.getElementById(ROOT_ID)
    if (el) { el.style.left = `${nx}px`; el.style.top = `${ny}px` }
  }
  function up() {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
    savePos()
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

function startPillDrag(e) {
  if (e.target.closest('[data-pill-action]')) return
  if (e.button !== 0) return
  const startX = e.clientX, startY = e.clientY
  const origX = ST.pos.x,   origY = ST.pos.y
  let moved = false
  const pill = document.getElementById(PILL_ID)

  function move(ev) {
    if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true
    const nx = Math.max(0, Math.min(window.innerWidth - 60, origX + (ev.clientX - startX)))
    const ny = Math.max(0, Math.min(window.innerHeight - 40, origY + (ev.clientY - startY)))
    ST.pos = { x: nx, y: ny }
    if (pill) { pill.style.left = `${nx}px`; pill.style.top = `${ny}px` }
  }
  function up() {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
    if (moved && pill) pill.dataset.dragged = '1'
    savePos()
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

// Build 8 resize handles (corners + edges)
function addResizeHandles(el) {
  // Remove any old ones first so we don't double up after rerender
  el.querySelectorAll('.doumi-rz').forEach(n => n.remove())

  const HANDLES = ['n','s','e','w','ne','nw','se','sw']
  HANDLES.forEach(dir => {
    const h = document.createElement('div')
    h.className = `doumi-rz doumi-rz--${dir}`
    h.dataset.rzDir = dir
    el.appendChild(h)
    h.addEventListener('mousedown', startResize)
  })
}

function startResize(e) {
  if (e.button !== 0) return
  e.preventDefault(); e.stopPropagation()
  const dir = e.currentTarget.dataset.rzDir
  const startX = e.clientX, startY = e.clientY
  const origW = ST.size.w, origH = ST.size.h
  const origX = ST.pos.x,  origY = ST.pos.y

  function move(ev) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    let nw = origW, nh = origH, nx = origX, ny = origY

    // East / West edges
    if (dir.includes('e')) nw = origW + dx
    if (dir.includes('w')) { nw = origW - dx; nx = origX + dx }
    // North / South edges
    if (dir.includes('s')) nh = origH + dy
    if (dir.includes('n')) { nh = origH - dy; ny = origY + dy }

    // Clamp to min/max
    if (nw < MIN_W) {
      if (dir.includes('w')) nx = origX + (origW - MIN_W)
      nw = MIN_W
    }
    if (nh < MIN_H) {
      if (dir.includes('n')) ny = origY + (origH - MIN_H)
      nh = MIN_H
    }
    if (nx < 0) { nw += nx; nx = 0 }
    if (ny < 0) { nh += ny; ny = 0 }
    if (nx + nw > window.innerWidth)  nw = window.innerWidth  - nx
    if (ny + nh > window.innerHeight) nh = window.innerHeight - ny

    ST.size = { w: nw, h: nh }
    ST.pos  = { x: nx, y: ny }
    const root = document.getElementById(ROOT_ID)
    if (root) {
      root.style.width  = `${nw}px`
      root.style.height = `${nh}px`
      root.style.left   = `${nx}px`
      root.style.top    = `${ny}px`
    }
  }
  function up() {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
    saveSize(); savePos()
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

function applyA11y() {
  const el = document.getElementById(ROOT_ID)
  if (!el) return
  el.classList.toggle('doumi--large', ST.a11y.fontSize === 'large')
  el.classList.toggle('doumi--xl',    ST.a11y.fontSize === 'xl')
  el.classList.toggle('doumi--hc',    ST.a11y.highContrast)
}

// ═══════════════════════════════════════════════════════════════
// §12  GUIDE OVERLAY
// ═══════════════════════════════════════════════════════════════

function showGuide(guideInfo) {
  const main = document.querySelector('[role="main"]') || document.body
  const target = main.querySelector(guideInfo.sel)
  if (!target) { hideGuide(); return }

  ST.guideActive = true
  ST.guideInfo   = guideInfo
  target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })

  setTimeout(() => {
    const rect = target.getBoundingClientRect()
    const enhanced = ST.guideEnhanced
    const pad  = enhanced ? 14 : 7

    // Highlight element
    let hl = document.getElementById(GUIDE_HL_ID)
    if (!hl) { hl = document.createElement('div'); hl.id = GUIDE_HL_ID; document.body.appendChild(hl) }
    hl.className = enhanced ? 'doumi-guide-hl-enhanced' : ''
    hl.style.cssText = `top:${rect.top - pad}px;left:${rect.left - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px`

    // Bouncing arrow in enhanced mode
    if (enhanced) {
      let arrow = document.getElementById(GUIDE_ARROW_ID)
      if (!arrow) { arrow = document.createElement('div'); arrow.id = GUIDE_ARROW_ID; document.body.appendChild(arrow) }
      const arrowTop = rect.top - pad - 44
      if (arrowTop > 0) {
        arrow.textContent = '▼'
        arrow.style.cssText = `position:fixed;top:${arrowTop}px;left:${rect.left + rect.width/2 - 14}px;font-size:32px;color:#3b82f6;z-index:2147483646;pointer-events:none;animation:doumi-bounce 1s ease-in-out infinite;text-shadow:0 2px 6px rgba(0,0,0,.3)`
      }
    } else {
      document.getElementById(GUIDE_ARROW_ID)?.remove()
    }

    // Tooltip
    let tip = document.getElementById(GUIDE_TIP_ID)
    if (!tip) {
      tip = document.createElement('div')
      tip.id = GUIDE_TIP_ID
      tip.innerHTML = '<button id="doumi-guide-tip-x">✕</button>'
      tip.addEventListener('click', e => { if (e.target.closest('#doumi-guide-tip-x')) hideGuide() })
      document.body.appendChild(tip)
    }

    const panelEl   = document.getElementById(ROOT_ID)
    const panelLeft = panelEl ? panelEl.getBoundingClientRect().left : window.innerWidth
    const tipW      = 220
    const tipLeft   = Math.max(12, panelLeft - tipW - 12)
    const spaceAbove = rect.top - pad - 8
    const spaceBelow = window.innerHeight - rect.bottom - pad - 8
    const above = spaceAbove >= 110 || spaceAbove > spaceBelow

    const lines = t(guideInfo.label).split('\n')
    tip.innerHTML = `${lines.map((l, i) => i === 0 ? `<strong>${l}</strong>` : `${l}`).join('<br>')}
      <button id="doumi-guide-tip-x" style="position:absolute;top:5px;right:7px;background:none;border:none;cursor:pointer;color:#94a3b8;font-size:11px;padding:2px">✕</button>`
    tip.style.cssText = `left:${tipLeft}px;top:${above ? rect.top - pad - 8 : rect.bottom + pad + 8}px;transform:${above ? 'translateY(-100%)' : 'none'}`

    tip.addEventListener('click', e => { if (e.target.id === 'doumi-guide-tip-x') hideGuide() })

    // Dismiss backdrop
    let backdrop = document.getElementById(GUIDE_DISMISS_ID)
    if (!backdrop) {
      backdrop = document.createElement('div')
      backdrop.id = GUIDE_DISMISS_ID
      backdrop.addEventListener('click', hideGuide)
      document.body.appendChild(backdrop)
    }
  }, 100)
}

function hideGuide() {
  ST.guideActive = false
  ST.guideInfo   = null
  document.getElementById(GUIDE_HL_ID)?.remove()
  document.getElementById(GUIDE_TIP_ID)?.remove()
  document.getElementById(GUIDE_DISMISS_ID)?.remove()
  document.getElementById(GUIDE_ARROW_ID)?.remove()
  rerender()
}

// ═══════════════════════════════════════════════════════════════
// §13  READ ALOUD
// ═══════════════════════════════════════════════════════════════

const READ_SELS = ['.doumi-status-badge','.doumi-card__txt','.doumi-list li','.doumi-ci__txt','.doumi-date-card__meaning','.doumi-wt__txt','.doumi-verdict__label','.doumi-verdict__sub','.doumi-finding span']

let _ralRef = { active: false, hl: null }

function clearRalHl() {
  if (_ralRef.hl) { _ralRef.hl.classList.remove('doumi-ral'); _ralRef.hl = null }
}

function startReading() {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const items = []
  const seen  = new Set()
  READ_SELS.forEach(sel => {
    document.querySelectorAll(`#${ROOT_ID} ${sel}`).forEach(el => {
      if (seen.has(el)) return; seen.add(el)
      const txt = el.textContent?.trim()
      if (txt && txt.length > 2) items.push({ el, txt })
    })
  })
  if (!items.length) return
  _ralRef.active = true
  ST.readState = 'reading'; rerender()
  let i = 0
  function next() {
    if (!_ralRef.active) return
    if (i >= items.length) { clearRalHl(); ST.readState = 'idle'; rerender(); return }
    const { el, txt } = items[i]
    clearRalHl(); el.classList.add('doumi-ral'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); _ralRef.hl = el
    const utt   = new SpeechSynthesisUtterance(txt)
    utt.lang    = ST.lang === 'korean' ? 'ko-KR' : 'en-US'
    utt.rate    = 0.9
    utt.onend   = () => { i++; next() }
    utt.onerror = () => { i++; next() }
    window.speechSynthesis.speak(utt)
  }
  next()
}
function pauseReading()  { window.speechSynthesis.pause(); ST.readState = 'paused'; rerender() }
function resumeReading() { window.speechSynthesis.resume(); ST.readState = 'reading'; rerender() }
function stopReading()   { _ralRef.active = false; window.speechSynthesis.cancel(); clearRalHl(); ST.readState = 'idle'; rerender() }

// ═══════════════════════════════════════════════════════════════
// §14  EVENT HANDLING
// ═══════════════════════════════════════════════════════════════

function handleInput(e) {
  if (e.target.id === 'doumi-reply-ta') {
    ST.replyText = e.target.value
  }
  if (e.target.id && e.target.id.startsWith('doumi-date-input-')) {
    ST.customDate = e.target.value
  }
  if (e.target.id === 'doumi-email-reminder-date') {
    ST.emailReminderCustom = e.target.value
  }
}

function handleClick(e) {
  // Close a11y dropdown when clicking outside it
  const dd = document.getElementById('doumi-a11y-dd')
  if (dd && !dd.contains(e.target) && !e.target.closest('[data-action="toggle-a11y"]')) {
    ST.a11yOpen = false
  }

  const el  = e.target.closest('[data-action]')
  if (!el) return
  const act = el.dataset.action
  const val = el.dataset.val
  const idx = parseInt(el.dataset.idx ?? '-1', 10)
  const a   = ST.analysis

  if (act === 'close-panel')    { ST.visible = false; stopReading(); rerender(); syncPanel(); return }
  if (act === 'minimize-panel') { ST.minimized = true; rerender(); syncPanel(); return }
  if (act === 'set-lang')     { ST.lang = val; rerender(); return }
  if (act === 'set-tab')      { ST.tab = val; rerender(); return }
  if (act === 'toggle-a11y')  { ST.a11yOpen = !ST.a11yOpen; rerender(); return }
  if (act === 'a11y-size')    { ST.a11y.fontSize = val; rerender(); return }
  if (act === 'a11y-toggle')  { ST.a11y[el.dataset.key] = !ST.a11y[el.dataset.key]; rerender(); return }
  if (act === 'read-start')   { startReading(); return }
  if (act === 'read-pause')   { pauseReading(); return }
  if (act === 'read-resume')  { resumeReading(); return }
  if (act === 'read-stop')    { stopReading(); return }

  if (act === 'toggle-check') {
    ST.checks[idx] = !ST.checks[idx]
    const box = el
    box.classList.toggle('doumi-cbox--chk', ST.checks[idx])
    box.textContent = ST.checks[idx] ? '✓' : ''
    const txt = box.closest('.doumi-ci')?.querySelector('.doumi-ci__txt')
    if (txt) txt.classList.toggle('doumi-ci__txt--done', ST.checks[idx])
    return
  }

  if (act === 'toggle-why') {
    ST.openWhy[idx] = !ST.openWhy[idx]; rerender(); return
  }

  if (act === 'toggle-section') {
    const sec = el.dataset.sec
    ST.openSections[sec] = !ST.openSections[sec]; rerender(); return
  }
  if (act === 'toggle-glossary') { ST.glossaryOpen = !ST.glossaryOpen; rerender(); return }
  if (act === 'toggle-gl-term') {
    const i = parseInt(el.dataset.idx, 10)
    ST.glossaryExpandedId = ST.glossaryExpandedId === i ? null : i
    rerender(); return
  }
  if (act === 'toggle-case') { ST.caseOpen = !ST.caseOpen; rerender(); return }
  if (act === 'toggle-case-step') {
    const id = el.dataset.id
    ST.caseProgress[id] = !(ST.caseProgress[id] ?? false)
    rerender(); return
  }

  if (act === 'show-guide') {
    if (a && a.actions[idx]?.guide) {
      if (ST.guideActive && ST.guideInfo === a.actions[idx].guide) { hideGuide(); return }
      showGuide(a.actions[idx].guide)
      rerender()
    }
    return
  }

  if (act === 'start-wt') {
    if (a?.walkthrough) {
      ST.walkthrough = a.walkthrough; ST.wtStep = 0; ST.wtPaused = false
      rerender()
      const step = ST.walkthrough.steps[0]
      if (step?.guideSel) showGuide({ sel: step.guideSel, label: step.label })
    }
    return
  }
  if (act === 'exit-wt') {
    ST.walkthrough = null; ST.wtStep = 0; ST.slowMode = false; ST.guideEnhanced = false
    hideGuide(); ST.escOpen = false; ST.escMode = null; rerender(); return
  }
  if (act === 'wt-next') {
    const steps = ST.walkthrough?.steps || []
    if (ST.wtStep < steps.length - 1) {
      ST.wtStep++
      rerender()
      const step = steps[ST.wtStep]
      if (step?.guideSel) showGuide({ sel: step.guideSel, label: step.label })
      else hideGuide()
    } else {
      ST.walkthrough = null; ST.wtStep = 0; hideGuide(); ST.escOpen = false; rerender()
    }
    return
  }
  if (act === 'wt-back') {
    if (ST.wtStep > 0) {
      ST.wtStep--
      const step = ST.walkthrough.steps[ST.wtStep]
      rerender()
      if (step?.guideSel) showGuide({ sel: step.guideSel, label: step.label })
    }
    return
  }
  if (act === 'wt-pause')  { ST.wtPaused = !ST.wtPaused; rerender(); return }

  if (act === 'esc-open')  { ST.escOpen = true; ST.escMode = null; rerender(); return }
  if (act === 'esc-mode')  {
    const mode = el.dataset.mode
    ST.escMode = mode
    // Side effects per mode
    if (mode === 'slower')    ST.slowMode = true
    if (mode === 'cant-find') {
      ST.guideEnhanced = true
      // Re-trigger guide if active
      if (ST.walkthrough) {
        const step = ST.walkthrough.steps[ST.wtStep]
        if (step?.guideSel) showGuide({ sel: step.guideSel, label: step.label })
      }
    }
    rerender(); return
  }
  if (act === 'esc-back')  {
    if (ST.escMode) { ST.escMode = null }
    else            { ST.escOpen = false }
    rerender(); return
  }

  if (act === 'pick-reply') {
    ST.replyIdx = idx
    ST.replyText = a?.replyOptions?.[idx] ? t(a.replyOptions[idx].text) : ''
    rerender()
    const ta = document.getElementById('doumi-reply-ta')
    if (ta) { ta.value = ST.replyText; ta.focus() }
    return
  }
  if (act === 'copy-reply') {
    const ta  = document.getElementById('doumi-reply-ta')
    const txt = ta ? ta.value : ST.replyText
    if (txt) navigator.clipboard?.writeText(txt).catch(() => {})
    const btn = document.getElementById('doumi-copy-btn')
    if (btn) { btn.classList.add('doumi-copied'); btn.textContent = '✓ Copied'; setTimeout(() => rerender(), 1500) }
    return
  }

  if (act === 'ask-preset') {
    const preset = a?.chatPresets?.[idx]
    if (preset) { ST.chatHistory.push(preset); rerender() }
    return
  }

  // Date picker actions
  if (act === 'open-picker') {
    ST.pickingDate = el.dataset.dateId
    ST.customDate  = ''
    rerender()
    return
  }
  if (act === 'cancel-pick') { ST.pickingDate = null; ST.customDate = ''; rerender(); return }
  if (act === 'pick-quick') {
    const dateId = el.dataset.dateId
    const quick  = el.dataset.quick
    const d = new Date(); d.setDate(d.getDate() + (quick === 'tomorrow' ? 1 : 7))
    addReminderFromDate(dateId, d, quick === 'tomorrow' ? (isKo() ? '내일' : 'Tomorrow') : (isKo() ? '다음 주' : 'Next week'))
    return
  }
  if (act === 'pick-custom') {
    const dateId = el.dataset.dateId
    const input  = document.getElementById(`doumi-date-input-${dateId}`)
    const val    = input?.value || ST.customDate
    if (!val) return
    addReminderFromDate(dateId, new Date(val), isKo() ? '선택한 날짜' : 'Custom date')
    ST.customDate = ''
    return
  }
  if (act === 'mark-done-date') { ST.doneDates[el.dataset.dateId] = true; rerender(); return }
  if (act === 'toggle-ask-date') {
    const id = el.dataset.dateId
    ST.askingDates[id] = !ST.askingDates[id]; rerender(); return
  }

  // Save-email-as-reminder picker flow
  if (act === 'open-email-reminder-picker') {
    ST.pickingEmailReminder = true
    ST.emailReminderCustom  = ''
    rerender(); return
  }
  if (act === 'cancel-email-reminder') {
    ST.pickingEmailReminder = false
    ST.emailReminderCustom  = ''
    rerender(); return
  }
  if (act === 'save-email-quick') {
    const quick = el.dataset.quick
    let due = null
    if (quick === 'tomorrow') { const d = new Date(); d.setDate(d.getDate() + 1); due = d.toISOString() }
    else if (quick === 'week') { const d = new Date(); d.setDate(d.getDate() + 7); due = d.toISOString() }
    saveEmailReminder(a, due)
    return
  }
  if (act === 'save-email-custom') {
    const input = document.getElementById('doumi-email-reminder-date')
    const val = input?.value || ST.emailReminderCustom
    if (!val) return
    saveEmailReminder(a, new Date(val).toISOString())
    return
  }

  // Legacy / simple reminder add (escalation save-for-later)
  if (act === 'save-email-reminder') {
    saveEmailReminder(a, null)
    return
  }

  // Legacy / simple reminder add (escalation save-for-later)
  if (act === 'set-reminder' || act === 'esc-save-reminder') {
    const label = el.dataset.dateLabel || (a ? t(a.summary?.primary) : 'Reminder')
    addReminder({
      title: bi(label, label),
      dueDate: null,
      urgency: a?.urgency || 'medium',
      category: 'renewal',
      emailSubject: a ? (t(a.summary?.primary) || '').slice(0, 60) : '',
      walkthroughId: a?.walkthrough?.id,
    })
    if (act === 'esc-save-reminder') { ST.escOpen = false; ST.escMode = null; rerender() }
    return
  }

  // Escalation copy actions
  if (act === 'esc-copy-family' || act === 'esc-copy-details') {
    const subj = a ? (t(a.summary?.primary) || '') : ''
    const text = isKo()
      ? `이메일 도움 요청\n내용: ${subj}\n출처: 이메일 도우미`
      : `Need help with this email\nDetails: ${subj}\nFrom: Doumi assistant`
    navigator.clipboard?.writeText(text).catch(() => {})
    return
  }

  if (act === 'toggle-reminders') { ST.reminderOpen = !ST.reminderOpen; rerender(); return }
  if (act === 'close-reminders')  { ST.reminderOpen = false; rerender(); return }
  if (act === 'open-reminders')   { ST.reminderOpen = true; ST.reminderToast = null; rerender(); return }
  if (act === 'dismiss-toast')    { ST.reminderToast = null; rerender(); return }
  if (act === 'rc-filter')        { ST.rcFilter = val; rerender(); return }
  if (act === 'toggle-rc-completed') { ST.rcShowCompleted = !ST.rcShowCompleted; rerender(); return }
  if (act === 'complete-reminder') {
    const r = ST.reminders.find(r => r.id === el.dataset.id)
    if (r) { r.completed = true; saveReminders(); rerender() }
    return
  }
  if (act === 'snooze-reminder') {
    const r = ST.reminders.find(r => r.id === el.dataset.id)
    if (r) {
      const base = r.dueDate ? new Date(r.dueDate) : new Date()
      base.setDate(base.getDate() + 1)
      r.dueDate = base.toISOString()
      saveReminders(); rerender()
    }
    return
  }
  if (act === 'restart-wt') {
    const wtId = el.dataset.wtId
    if (a?.walkthrough && a.walkthrough.id === wtId) {
      ST.walkthrough = a.walkthrough; ST.wtStep = 0; ST.wtPaused = false
      ST.reminderOpen = false
      rerender()
      const step = ST.walkthrough.steps[0]
      if (step?.guideSel) showGuide({ sel: step.guideSel, label: step.label })
    }
    return
  }
  if (act === 'delete-reminder') {
    ST.reminders = ST.reminders.filter(r => r.id !== el.dataset.id)
    saveReminders(); rerender()
    return
  }
  if (act === 'done-date') { /* just acknowledge */ return }
}

// Reminder helpers
function addReminder({ title, dueDate, urgency, category, emailSubject, walkthroughId }) {
  const id = `r-${Date.now()}`
  ST.reminders.unshift({
    id, title, dueDate: dueDate ?? null, urgency: urgency || 'medium',
    category: category || 'renewal', emailSubject: emailSubject || '',
    walkthroughId: walkthroughId || null,
    completed: false, createdAt: new Date().toISOString(),
  })
  saveReminders()
  ST.reminderToast = { id, title }
  clearTimeout(ST.toastTimer)
  ST.toastTimer = setTimeout(() => { ST.reminderToast = null; rerender() }, 3500)
  rerender()
}

function saveEmailReminder(a, dueDate) {
  const title = a?.summary?.primary || bi('이메일 알림', 'Email reminder')
  const subjLine = typeof title === 'object' ? title.english : (title || '')
  addReminder({
    title,
    dueDate,
    urgency: a?.urgency || 'medium',
    category: a?.walkthrough?.id === 'renew-license' ? 'renewal'
      : a?.type === 'BILL / PAYMENT' ? 'payment'
      : a?.type === 'APPOINTMENT' ? 'appointment'
      : a?.type === 'PACKAGE / DELIVERY' ? 'renewal'
      : 'renewal',
    emailSubject: subjLine.slice(0, 60),
    walkthroughId: a?.walkthrough?.id || null,
  })
  ST.pickingEmailReminder = false
  ST.emailReminderCustom  = ''
  rerender()
}

function addReminderFromDate(dateId, dueDate, sourceLabel) {
  const a = ST.analysis
  const idx = parseInt((dateId || '').replace('date-', ''), 10)
  const d   = a?.dates?.[idx]
  const titleObj = d ? d.meaning : bi('알림', 'Reminder')
  addReminder({
    title: titleObj,
    dueDate: dueDate.toISOString(),
    urgency: d?.urgent ? 'high' : (a?.urgency || 'medium'),
    category: a?.walkthrough?.id === 'renew-license' ? 'renewal' : 'renewal',
    emailSubject: a ? (t(a.summary?.primary) || '').slice(0, 60) : '',
    walkthroughId: a?.walkthrough?.id || null,
  })
  ST.confirmedDates[dateId] = true
  ST.pickingDate = null
  rerender()
}

// ═══════════════════════════════════════════════════════════════
// §15  HELPERS
// ═══════════════════════════════════════════════════════════════

function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function escAttr(s) { return (s || '').replace(/"/g, '&quot;') }

// ═══════════════════════════════════════════════════════════════
// §16  UPDATE CYCLE + NAVIGATION
// ═══════════════════════════════════════════════════════════════

function update() {
  const email = readEmail()
  if (email.subject || email.body) {
    const newAnalysis = analyze(email)
    // Only reset state if it's a different email
    const oldType = ST.analysis?.type
    if (!ST.analysis || oldType !== newAnalysis.type) {
      ST.analysis = newAnalysis
      ST.checks   = {}
      ST.openWhy  = {}
      ST.chatHistory = []
      ST.replyIdx    = null
      ST.replyText   = ''
      ST.confirmedDates = {}
      ST.doneDates      = {}
      ST.askingDates    = {}
      ST.pickingDate    = null
      ST.customDate     = ''
    }
  } else {
    ST.analysis = null
  }
  rerender()
}

let lastHash = '', debounceId = null
function scheduleUpdate() { clearTimeout(debounceId); debounceId = setTimeout(update, 900) }

window.addEventListener('hashchange', () => { if (location.hash !== lastHash) { lastHash = location.hash; scheduleUpdate() } })

const origPush = history.pushState.bind(history)
history.pushState = function (...args) { origPush(...args); scheduleUpdate() }

new MutationObserver(() => { if (location.hash !== lastHash) { lastHash = location.hash; scheduleUpdate() } })
  .observe(document.body, { childList: true, subtree: false })

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'DOUMI_TOGGLE') {
    if (ST.visible && !ST.minimized) {
      ST.visible = false
    } else {
      ST.visible = true
      ST.minimized = false
    }
    stopReading(); rerender(); syncPanel()
  }
})

// ═══════════════════════════════════════════════════════════════
// §17  BOOT
// ═══════════════════════════════════════════════════════════════

mount()
rerender()
setTimeout(update, 1500)

})()
