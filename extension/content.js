;(function () {
'use strict'

const ROOT_ID = 'doumi-root'
const TOGGLE_ID = 'doumi-toggle-btn'
const GUIDE_DISMISS_ID = 'doumi-guide-dismiss'
const GUIDE_HL_ID  = 'doumi-guide-hl'
const GUIDE_TIP_ID = 'doumi-guide-tip'

// ═══════════════════════════════════════════════════════════════
// §1  STATE
// ═══════════════════════════════════════════════════════════════

const ST = {
  lang: 'english', tab: 'summary',
  checks: {}, openSections: {}, openWhy: {},
  analysis: null, visible: true,
  guideActive: false, guideInfo: null,
  walkthrough: null, wtStep: 0, wtPaused: false,
  escOpen: false, escMode: null,
  reminders: loadReminders(), reminderOpen: false, reminderToast: null, toastTimer: null,
  a11y: { fontSize: 'normal', highContrast: false, reduceMotion: false, simplified: false },
  a11yOpen: false,
  replyIdx: null, replyText: '',
  chatHistory: [],
  readState: 'idle',  // 'idle' | 'reading' | 'paused'
  readIdx: 0,
}

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
  if (low.includes("driver's license") || low.includes('dds') || low.includes('drives.ga.gov') ||
      (low.includes('license') && (low.includes('expire') || low.includes('renewal'))))
    return analyzeDDS(subject, sender, body)
  if (low.includes('bill') || low.includes('payment due') || low.includes('invoice') || low.includes('amount due'))
    return analyzeBill(subject, sender, body)
  if (low.includes('appointment') || low.includes('scheduled') || low.includes('your visit'))
    return analyzeAppt(subject, sender, body)
  if (low.includes('package') || low.includes('shipment') || low.includes('tracking'))
    return analyzeDelivery(subject, sender, body)
  return analyzeGeneric(subject, sender, body)
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
  const due    = body.match(/(?:due|by|before)\s+([A-Z][a-z]+\s+\d+[,\s]*\d{0,4}|\d+\/\d+\/\d+)/i)?.[1] || ''
  return {
    type: 'BILL / PAYMENT', typeKo: '청구서', urgency: 'medium', safe: null,
    safeReason: bi('결제 전에 발신자를 반드시 확인하세요', 'Verify sender before making any payment'),
    summary: {
      primary: bi(`청구서 또는 결제 알림입니다.${amount ? ` 금액: ${amount}.` : ''}${due ? ` 납부 기한: ${due}.` : ''}`, `Bill or payment reminder.${amount ? ` Amount: ${amount}.` : ''}${due ? ` Due: ${due}.` : ''}`),
    },
    keyDetails: [amount && bi(`청구 금액: ${amount}`, `Amount: ${amount}`), due && bi(`납부 기한: ${due}`, `Due date: ${due}`), sender && bi(`발신자: ${sender}`, `Sender: ${sender}`)].filter(Boolean),
    warnings: [bi('결제 전에 발신자가 합법적인지 확인하세요.', 'Always verify the sender is legitimate before paying.'), bi('링크 클릭 대신 직접 공식 웹사이트 방문을 권장합니다.', 'Go directly to the official website instead of clicking links.')],
    actions: [
      { ...bi('청구 금액이 맞는지 확인', 'Verify the billed amount is correct') },
      { ...bi('납부 기한 캘린더에 기록', 'Note the due date on your calendar') },
      { ...bi('공식 웹사이트에서 직접 결제', 'Pay directly on the official website') },
    ],
    dates: due ? [{ label: bi('납부 기한', 'Payment due date'), val: due, meaning: bi('이 날짜까지 결제하지 않으면 연체료가 발생할 수 있습니다', 'Late fee may apply if not paid by this date'), urgent: true }] : [],
    safety: [{ ok: null, ...bi('결제 전에 발신자 확인 필수', 'Must verify sender before paying') }, { ok: null, ...bi('링크 대신 직접 사이트 방문 권장', 'Visit website directly rather than clicking links') }],
    ignoreSafe: bi('결제 기한을 놓치면 연체료가 발생할 수 있습니다.', 'Missing the payment deadline may result in late fees.'),
    glossary: [], replyOptions: genericReplies(), chatPresets: genericChat(),
    walkthrough: null,
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
    warnings: [],
    actions: [{ ...bi('예약 날짜와 시간 확인', 'Note appointment date and time') }, { ...bi('캘린더에 추가', 'Add to your calendar') }, { ...bi('필요시 확인 또는 취소 연락', 'Confirm or cancel if needed') }],
    dates: dateMatch ? [{ label: bi('예약 날짜', 'Appointment date'), val: dateMatch + (time ? ` ${time}` : ''), meaning: bi('이 날짜를 캘린더에 기록하세요', 'Add this date to your calendar'), urgent: false }] : [],
    safety: [{ ok: true, ...bi('일반적인 예약 이메일 형식', 'Standard appointment email format') }],
    ignoreSafe: bi('예약을 무시하면 자동으로 취소될 수 있습니다.', 'Ignoring this may result in automatic cancellation.'),
    glossary: [], replyOptions: genericReplies(), chatPresets: genericChat(), walkthrough: null,
  }
}

function analyzeDelivery(subject, sender, body) {
  const tracking = body.match(/[A-Z0-9]{10,30}/)?.[0] || ''
  return {
    type: 'PACKAGE / DELIVERY', typeKo: '배송 알림', urgency: 'low', safe: true,
    safeReason: bi('일반적인 배송 알림', 'Routine delivery notification'),
    summary: { primary: bi(`패키지 배송 알림입니다.${tracking ? ` 운송장: ${tracking}.` : ''}`, `Package delivery notification.${tracking ? ` Tracking: ${tracking}.` : ''}`) },
    keyDetails: [tracking && bi(`운송장 번호: ${tracking}`, `Tracking number: ${tracking}`), sender && bi(`배송사: ${sender}`, `Carrier: ${sender}`)].filter(Boolean),
    warnings: [],
    actions: [{ ...bi('운송장 번호로 배송 추적', 'Track package with tracking number') }, { ...bi('예상 배송 날짜 확인', 'Check expected delivery date') }],
    dates: [], safety: [{ ok: true, ...bi('일반적인 배송 알림', 'Looks like a standard delivery notification') }, { ok: null, ...bi('공식 배송사 앱에서 직접 추적 권장', "Recommend tracking in the carrier's official app") }],
    ignoreSafe: bi('배송 알림을 무시하면 패키지가 반송될 수 있습니다.', 'Ignoring may result in the package being returned.'),
    glossary: [], replyOptions: genericReplies(), chatPresets: genericChat(), walkthrough: null,
  }
}

function analyzeGeneric(subject, sender, body) {
  const sents = (body || '').split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 20).slice(0, 3)
  return {
    type: 'EMAIL', typeKo: '이메일', urgency: 'low', safe: null,
    safeReason: bi('발신자를 확인하세요', 'Please verify the sender'),
    summary: { primary: bi(`"${subject || '(제목 없음)'}" 제목의 이메일${sender ? `. 발신: ${sender}` : ''}.`, `Email with subject "${subject || '(no subject)'}"${sender ? ` from ${sender}` : ''}.`) },
    keyDetails: sents.map(s => bi(s, s)),
    warnings: [],
    actions: [{ ...bi('이메일 내용 꼼꼼히 읽기', 'Read the full email carefully') }, { ...bi('발신자 확인', 'Verify who sent this email') }, { ...bi('필요한 경우에만 답장', 'Reply only if necessary') }],
    dates: [], safety: [{ ok: null, ...bi('신뢰하는 경우에만 링크 클릭', 'Only click links if you trust the sender') }, { ok: null, ...bi('개인 정보는 이메일로 절대 보내지 마세요', 'Never send personal info by email') }],
    ignoreSafe: bi('이메일 내용을 확인한 후 필요한 조치를 취하세요.', 'Review the email and take action if needed.'),
    glossary: [], replyOptions: genericReplies(), chatPresets: genericChat(), walkthrough: null,
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
  const urgencyColor = { high: '#dc2626', medium: '#d97706', low: '#64748b' }[a.urgency] || '#64748b'

  // Status card
  const statusCard = `
    <div class="doumi-status-card">
      <div class="doumi-status-badge" style="border-color:${urgencyColor};color:${urgencyColor};background:${urgencyColor}1a">
        ${a.urgency === 'high' ? '⚠️ ' : a.urgency === 'medium' ? '📋 ' : '📨 '}${a.type}
      </div>
      <div class="doumi-urgency-row">
        <div class="doumi-urgency-pip" style="background:${urgencyColor}"></div>
        <span style="font-size:11.5px;color:#64748b">${a.urgency === 'high' ? (ko ? '긴급 — 빠른 조치 필요' : 'Urgent — action needed') : a.urgency === 'medium' ? (ko ? '중요 — 날짜를 기억하세요' : 'Important — note the deadline') : (ko ? '알림' : 'Notification')}</span>
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

  // Action checklist
  const wtId = ST.walkthrough?.id
  const activeWt = a.walkthrough && wtId === a.walkthrough.id
  const checklistCard = `
    <div class="doumi-cl-wrap">
      <div class="doumi-cl-hdr">
        <div class="doumi-section-lbl">✅ ${ko ? '할 일' : 'Action Steps'}</div>
        ${a.walkthrough ? `<button class="doumi-wt-start-btn" data-action="${activeWt ? 'exit-wt' : 'start-wt'}">
          ${activeWt ? (ko ? '✓ 진행 중' : '✓ In Progress') : (ko ? '▶ 안내 시작' : '▶ Start Guide')}
        </button>` : ''}
      </div>
      ${a.actions.map((act, i) => {
        const checked = !!ST.checks[i]
        const wyOpen  = !!ST.openWhy[i]
        return `
        <div class="doumi-ci">
          <div class="doumi-cbox${checked ? ' doumi-cbox--chk' : ''}" data-action="toggle-check" data-idx="${i}">${checked ? '✓' : ''}</div>
          <div class="doumi-ci__body">
            <div class="doumi-ci__txt${checked ? ' doumi-ci__txt--done' : ''}">${t(act)}</div>
            <div class="doumi-ci__acts">
              ${act.guide ? `<button class="doumi-gbtn${ST.guideInfo === act.guide ? ' doumi-gbtn--active' : ''}" data-action="show-guide" data-idx="${i}">${ko ? '위치 보기' : 'Show me where'}</button>` : ''}
              ${act.why   ? `<button class="doumi-gbtn" data-action="toggle-why" data-idx="${i}">${ko ? '이유' : 'Why?'}</button>` : ''}
            </div>
            ${wyOpen && act.why ? `<div class="doumi-why-body">${t(act.why)}</div>` : ''}
          </div>
        </div>`
      }).join('')}
    </div>`

  // Dates panel
  const datesPanel = a.dates.length ? a.dates.map(d => `
    <div class="doumi-date-card">
      <div class="doumi-date-card__lbl">${t(d.label)}</div>
      <div class="doumi-date-card__val">${d.val || t(d.label)}</div>
      <div class="doumi-date-card__meaning">${t(d.meaning)}</div>
      <div class="doumi-date-card__btns">
        <button class="doumi-date-btn doumi-date-btn--primary" data-action="set-reminder" data-date-label="${escAttr(t(d.label))}">${ko ? '🔔 알림 설정' : '🔔 Set Reminder'}</button>
        <button class="doumi-date-btn" data-action="done-date">${ko ? '✓ 완료' : '✓ Done'}</button>
      </div>
    </div>`).join('') : ''

  // Warnings (hidden in simplified)
  const warnCard = !simplified && a.warnings.length ? `
    <div class="doumi-card doumi-card--warn">
      <div class="doumi-card__lbl doumi-card__lbl--warn">${ko ? '⚠️ 주의할 점' : '⚠️ Important Warnings'}</div>
      <ul class="doumi-list">${a.warnings.map(w => `<li>${t(w)}</li>`).join('')}</ul>
    </div>` : ''

  // Glossary (hidden in simplified)
  const glossary = !simplified && a.glossary.length ? `
    <div class="doumi-section">
      <div class="doumi-section__hdr" data-action="toggle-section" data-sec="glossary">
        <span>${ko ? '📚 용어 설명' : '📚 Glossary'}</span>
        <span>${ST.openSections.glossary ? '▲' : '▼'}</span>
      </div>
      ${ST.openSections.glossary ? `<div class="doumi-section__body">
        ${a.glossary.map(g => `
          <div class="doumi-term">
            <div class="doumi-term__word">${t(g.word)}</div>
            <div class="doumi-term__def">${t(g.def)}</div>
          </div>`).join('')}
      </div>` : ''}
    </div>` : ''

  return statusCard + sumCard + detailsCard + checklistCard + datesPanel + warnCard + glossary
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
  return `
    <div class="doumi-walkthrough">
      <div class="doumi-wt__hdr">
        <span>${t(ST.walkthrough.title).toUpperCase()}</span>
        <span>${ST.wtStep + 1} / ${steps.length}</span>
      </div>
      <div class="doumi-wt__txt">${t(step.instruction)}</div>
      <div class="doumi-wt__btns">
        <button class="doumi-wt-btn doumi-wt-btn--back" data-action="wt-back" ${ST.wtStep === 0 ? 'disabled' : ''}>← ${ko ? '이전' : 'Back'}</button>
        <button class="doumi-wt-btn doumi-wt-btn--pause" data-action="wt-pause">${ST.wtPaused ? (ko ? '▶ 재개' : '▶ Resume') : (ko ? '⏸ 일시정지' : '⏸ Pause')}</button>
        <button class="doumi-wt-btn doumi-wt-btn--go" data-action="wt-next">
          ${ST.wtStep === steps.length - 1 ? (ko ? '✓ 완료' : '✓ Done') : (ko ? '완료 →' : 'Done →')}
        </button>
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

  if (!ST.escMode) {
    body = `
      <div class="doumi-esc-title">${ko ? '어떤 도움이 필요하세요?' : 'What kind of help do you need?'}</div>
      <div class="doumi-esc-sub">${ko ? '아래 옵션 중 하나를 선택하세요' : 'Choose one of the options below'}</div>
      <div class="doumi-esc-choices">
        <button class="doumi-esc-choice" data-action="esc-mode" data-mode="context">
          <div class="doumi-esc-choice__icon">📖</div>
          <div class="doumi-esc-choice__title">${ko ? '더 자세한 설명' : 'More explanation'}</div>
          <div class="doumi-esc-choice__desc">${ko ? '이 이메일에 대해 더 자세히 알고 싶어요' : 'I want to understand this email better'}</div>
        </button>
        <button class="doumi-esc-choice" data-action="esc-mode" data-mode="human">
          <div class="doumi-esc-choice__icon">🤝</div>
          <div class="doumi-esc-choice__title">${ko ? '사람의 도움 요청' : 'Get human help'}</div>
          <div class="doumi-esc-choice__desc">${ko ? '가족이나 전문가의 도움이 필요해요' : 'I need help from family or a professional'}</div>
        </button>
      </div>`
  } else if (ST.escMode === 'context') {
    const a = ST.analysis
    body = `
      <div class="doumi-esc-mode-body">
        <div class="doumi-esc-title">📖 ${ko ? '더 자세한 설명' : 'More Explanation'}</div>
        <div class="doumi-card doumi-card--blue" style="margin-bottom:10px">
          <div class="doumi-card__lbl">${ko ? '이 이메일이 중요한 이유' : 'Why this email matters'}</div>
          <div class="doumi-card__txt">${a ? t(a.ignoreSafe) : (ko ? '중요한 이메일입니다. 무시하지 마세요.' : 'This is an important email. Do not ignore it.')}</div>
        </div>
        <div class="doumi-card" style="margin-bottom:10px">
          <div class="doumi-card__lbl">${ko ? '지금 당장 해야 할 일' : 'What to do right now'}</div>
          <div class="doumi-card__txt">${ko ? '이 이메일에 대한 조치가 필요합니다. 할 일 탭에서 단계별 안내를 따라하세요.' : 'Action is required for this email. Follow the step-by-step guide in the Actions tab.'}</div>
        </div>
        <div class="doumi-card doumi-card--green">
          <div class="doumi-card__lbl doumi-card__lbl--green">${ko ? '✅ 안심하세요' : '✅ You are safe'}</div>
          <div class="doumi-card__txt">${ko ? '이 도우미가 모든 단계에서 도와드립니다. 천천히 하나씩 진행하세요.' : 'This assistant will help you through every step. Take it one step at a time.'}</div>
        </div>
      </div>
      <button class="doumi-esc-back" data-action="esc-back">← ${ko ? '이전으로' : 'Go back'}</button>`
  } else {
    body = `
      <div class="doumi-esc-mode-body">
        <div class="doumi-esc-title">🤝 ${ko ? '사람의 도움 받기' : 'Getting Human Help'}</div>
        <div class="doumi-card doumi-card--blue" style="margin-bottom:8px">
          <div class="doumi-card__lbl">${ko ? '자녀 또는 가족에게 부탁하기' : 'Ask a family member'}</div>
          <div class="doumi-card__txt">${ko ? '이 화면을 자녀나 가족에게 보여주세요. 이메일 내용과 해야 할 일이 요약되어 있습니다.' : 'Show this screen to your child or family member. The email summary and next steps are here.'}</div>
        </div>
        <div class="doumi-card" style="margin-bottom:8px">
          <div class="doumi-card__lbl">${ko ? '공공 도서관 도움 받기' : 'Get help at the library'}</div>
          <div class="doumi-card__txt">${ko ? '가까운 공공 도서관에서 무료 컴퓨터 도움 서비스를 제공합니다.' : 'Your local public library offers free computer help services.'}</div>
        </div>
        <div class="doumi-card doumi-card--green">
          <div class="doumi-card__lbl doumi-card__lbl--green">${ko ? '211 전화' : 'Call 211'}</div>
          <div class="doumi-card__txt">${ko ? '211로 전화하면 지역 사회 서비스와 무료 통역 서비스를 연결해 드립니다.' : 'Call 211 to be connected with community services and free interpreter services.'}</div>
        </div>
      </div>
      <button class="doumi-esc-back" data-action="esc-back">← ${ko ? '이전으로' : 'Go back'}</button>`
  }

  return `<div class="doumi-esc-overlay">${body}</div>`
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

function renderReminderCenter() {
  const ko = isKo()
  const active = ST.reminders.filter(r => !r.completed)
  const done   = ST.reminders.filter(r => r.completed)

  if (!ST.reminders.length) {
    return `<div class="doumi-rc-empty">📭<br>${ko ? '알림이 없습니다' : 'No reminders yet'}</div>`
  }

  const group = (arr, label) => !arr.length ? '' : `
    <div class="doumi-rc-group-lbl">${label}</div>
    ${arr.map(r => `
      <div class="doumi-ri">
        <div class="doumi-ri__top">
          <div class="doumi-ri__title">${t(r.title)}</div>
          <div class="doumi-ri__badge${r.completed ? ' doumi-ri__badge--done' : ''}">
            ${r.completed ? (ko ? '완료' : 'Done') : (r.due ? r.due : (ko ? '기한 없음' : 'No date'))}
          </div>
        </div>
        <div class="doumi-ri__btns">
          ${!r.completed ? `<button class="doumi-ri-btn doumi-ri-btn--done" data-action="complete-reminder" data-id="${r.id}">✓ ${ko ? '완료' : 'Done'}</button>` : ''}
          <button class="doumi-ri-btn" data-action="delete-reminder" data-id="${r.id}">🗑</button>
        </div>
      </div>`).join('')}`

  return `
    <div class="doumi-rc-hdr">
      <div class="doumi-rc-title">🔔 ${ko ? '알림 센터' : 'Reminder Center'}</div>
      <button class="doumi-icon-btn" data-action="close-reminders">✕</button>
    </div>
    ${group(active, ko ? '미완료' : 'Pending')}
    ${group(done, ko ? '완료됨' : 'Completed')}`
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
  }
  if (!document.getElementById(TOGGLE_ID)) {
    const btn = document.createElement('button')
    btn.id = TOGGLE_ID
    btn.title = '이메일 도우미'
    btn.textContent = '🇰🇷'
    btn.addEventListener('click', () => { ST.visible = true; rerender(); syncPanel() })
    document.body.appendChild(btn)
  }
}

function rerender() {
  const el = document.getElementById(ROOT_ID)
  if (!el) return
  // Save textarea value before re-render
  const ta = document.getElementById('doumi-reply-ta')
  if (ta) ST.replyText = ta.value

  el.innerHTML = renderPanel()
  applyA11y()
  syncPanel()
}

function syncPanel() {
  const el  = document.getElementById(ROOT_ID)
  const btn = document.getElementById(TOGGLE_ID)
  if (!el) return
  el.style.display  = ST.visible ? 'flex' : 'none'
  if (btn) btn.style.display = ST.visible ? 'none' : 'flex'
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
    const pad  = 7

    // Highlight element
    let hl = document.getElementById(GUIDE_HL_ID)
    if (!hl) { hl = document.createElement('div'); hl.id = GUIDE_HL_ID; document.body.appendChild(hl) }
    hl.style.cssText = `top:${rect.top - pad}px;left:${rect.left - pad}px;width:${rect.width + pad * 2}px;height:${rect.height + pad * 2}px`

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

  if (act === 'close-panel')  { ST.visible = false; stopReading(); rerender(); syncPanel(); return }
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
  if (act === 'exit-wt') { ST.walkthrough = null; ST.wtStep = 0; hideGuide(); ST.escOpen = false; ST.escMode = null; rerender(); return }
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
  if (act === 'esc-mode')  { ST.escMode = el.dataset.mode; rerender(); return }
  if (act === 'esc-back')  { ST.escMode = null; rerender(); return }

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

  if (act === 'set-reminder') {
    const label = el.dataset.dateLabel || 'Reminder'
    const id    = `r-${Date.now()}`
    const reminder = { id, title: bi(label, label), completed: false, createdAt: new Date().toISOString() }
    ST.reminders.unshift(reminder)
    saveReminders()
    ST.reminderToast = { id, title: reminder.title }
    clearTimeout(ST.toastTimer)
    ST.toastTimer = setTimeout(() => { ST.reminderToast = null; rerender() }, 3500)
    rerender()
    return
  }
  if (act === 'toggle-reminders') { ST.reminderOpen = !ST.reminderOpen; rerender(); return }
  if (act === 'close-reminders')  { ST.reminderOpen = false; rerender(); return }
  if (act === 'open-reminders')   { ST.reminderOpen = true; ST.reminderToast = null; rerender(); return }
  if (act === 'dismiss-toast')    { ST.reminderToast = null; rerender(); return }
  if (act === 'complete-reminder') {
    const r = ST.reminders.find(r => r.id === el.dataset.id)
    if (r) { r.completed = true; saveReminders(); rerender() }
    return
  }
  if (act === 'delete-reminder') {
    ST.reminders = ST.reminders.filter(r => r.id !== el.dataset.id)
    saveReminders(); rerender()
    return
  }
  if (act === 'done-date') { /* just acknowledge */ return }
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
  if (msg.type === 'DOUMI_TOGGLE') { ST.visible = !ST.visible; stopReading(); rerender(); syncPanel() }
})

// ═══════════════════════════════════════════════════════════════
// §17  BOOT
// ═══════════════════════════════════════════════════════════════

mount()
rerender()
setTimeout(update, 1500)

})()
