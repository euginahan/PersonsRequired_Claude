export const mockEmail = {
  from: {
    name: 'Georgia Department of Driver Services',
    email: 'NoReply@drives.ga.gov',
  },
  to: 'me',
  subject: "Quick Reminder: Your Driver's License/ID/Permit will expire soon!",
  date: 'May 6, 2026, 9:14 AM',
  body: [
    'This is an official communication sent to you by the Georgia Department of Driver Services regarding your online services transaction.',
    'Quick Reminder: Your Driver\'s License/ID/Permit will expire soon!',
    'Upgrading your license is easy and only takes a few minutes via the DDS website or Mobile App on your smartphone:',
    '• Visit our website at: https://dds.drives.ga.gov/\n• Download the Mobile App DDS 2 GO',
    'If you are unable to renew online or via the DDS 2 GO app, you can visit a Customer Service Center to upgrade. To save time at the center, please complete the online application and schedule an appointment via our website at https://dds.drives.ga.gov/',
    'Most non-commercial licenses and IDs cost $32.00 for an eight year term. You can visit www.dds.ga.gov/your-georgia-drivers-license/fees-and-terms for a complete list of fees.',
    'Please Note: you will SAVE MONEY by renewing online!',
    'Please do not respond to this email directly, as any response to this email will not be received.',
    'To ensure delivery of future emails, please add NoReply@drives.ga.gov to your address book or approved senders list.',
    'This message is for the named person\'s use only. It may contain confidential, proprietary, or legally privileged information. No confidentiality or privilege is waived or lost by any mistaken transmission. If you receive this message in error, please immediately delete it.',
  ],
}

// Paragraph indices that get guide-id attributes in EmailView
export const emailBodyGuideIds = {
  3: 'email-dds-link',
}

// ── Email Action Classifier ──────────────────────────────────────────────────

export const emailClassifier = {
  type: 'needs-renewal',
  icon: '📋',
  actionSummary: {
    korean: '이 이메일에는 조치가 필요해요: 운전면허 갱신',
    english: 'This email needs action: Renew your driver\'s license',
    simple: 'You must renew your driver\'s license',
  },
  priority: { korean: '중간', english: 'Medium', simple: 'Medium' },
  priorityLevel: 'medium',
  deadline: {
    korean: '만료일 이전에 처리하세요',
    english: 'Before expiration date',
    simple: 'Before it expires',
  },
  risk: {
    korean: '신뢰할 수 있는 발신자',
    english: 'Trusted sender',
    simple: 'Safe email',
  },
  riskLevel: 'safe',
}

// ── Detected Dates ───────────────────────────────────────────────────────────

export const detectedDates = [
  {
    id: 'dd1',
    date: { korean: '곧 만료 예정 (정확한 날짜 미제공)', english: 'Expiring soon (exact date not provided)', simple: 'Expires soon' },
    meaning: {
      korean: '운전면허증의 유효기간이 곧 끝나요',
      english: 'Your driver\'s license validity period ends soon',
      simple: 'Your license will stop working soon',
    },
    suggestedAction: {
      korean: 'dds.drives.ga.gov에서 지금 갱신하세요',
      english: 'Renew now at dds.drives.ga.gov',
      simple: 'Go to dds.drives.ga.gov to renew now',
    },
    urgency: 'high',
  },
]

// ── Interactive Action Checklist ─────────────────────────────────────────────

export const actionChecklist = [
  {
    id: 'ac1',
    guideTarget: 'email-dds-link',
    text: { korean: 'DDS 웹사이트 방문하기', english: 'Go to DDS website', simple: 'Open the DDS website' },
    explanation: {
      korean: 'dds.drives.ga.gov에 접속하세요. 이 사이트에서 운전면허를 갱신할 수 있어요.',
      english: 'Visit dds.drives.ga.gov. This is where you renew your Georgia license.',
      simple: 'Go to the website: dds.drives.ga.gov. That is where you do the renewal.',
    },
    why: {
      korean: '이 사이트는 조지아 주 정부의 공식 사이트예요. 안전하고 믿을 수 있어요.',
      english: 'This is the official Georgia government website. It is safe and legitimate.',
      simple: 'It is a safe, official government website.',
    },
  },
  {
    id: 'ac2',
    guideTarget: null,
    text: { korean: '온라인 갱신 신청서 작성하기', english: 'Complete renewal application', simple: 'Fill out the online form' },
    explanation: {
      korean: '웹사이트에서 갱신 신청서를 작성하세요. 이름, 주소, 면허 번호가 필요해요.',
      english: 'Fill out the renewal form on the website. You\'ll need your name, address, and license number.',
      simple: 'Fill in your name, address, and license number on the website form.',
    },
    why: {
      korean: '온라인으로 신청하면 고객 센터에 직접 방문하지 않아도 집에서 갱신할 수 있어요.',
      english: 'Applying online lets you renew from home without visiting a center in person.',
      simple: 'Doing it online means you do not have to go anywhere.',
    },
  },
  {
    id: 'ac3',
    guideTarget: null,
    text: { korean: '$32.00 납부하기', english: 'Pay $32.00 fee', simple: 'Pay $32' },
    explanation: {
      korean: '8년 유효한 면허증 갱신 비용은 $32이에요. 신용카드나 직불카드로 결제할 수 있어요.',
      english: 'The cost is $32 for an 8-year license. You can pay by credit or debit card.',
      simple: 'It costs $32. Use a credit card or debit card to pay.',
    },
    why: {
      korean: '이 금액을 내야 새 면허증이 발급돼요. 온라인 갱신은 더 저렴할 수도 있어요.',
      english: 'This fee is required to issue your new license. Online renewal may save additional money.',
      simple: 'You must pay this to get your new license.',
    },
  },
  {
    id: 'ac4',
    guideTarget: null,
    text: {
      korean: '(어려우면) 고객 서비스 센터 방문하기',
      english: '(If needed) Visit a Customer Service Center',
      simple: '(If hard) Go to a DDS office',
    },
    explanation: {
      korean: '온라인이 어려우시면 가까운 DDS 고객 서비스 센터에 방문하세요. 방문 전 웹사이트에서 예약을 완료하면 시간을 절약할 수 있어요.',
      english: 'If online feels too hard, visit a nearby DDS Customer Service Center. Schedule an appointment first to save time.',
      simple: 'If the website is too hard to use, go to a DDS office. Make an appointment online first so you do not wait.',
    },
    why: {
      korean: '직접 방문하면 직원이 도와줄 수 있어요.',
      english: 'Staff at the center can help you in person.',
      simple: 'People there will help you.',
    },
  },
]

// ── Safety Analysis ──────────────────────────────────────────────────────────

export const safetyAnalysis = {
  verdict: 'safe',
  verdictLabel: { korean: '안전해 보여요', english: 'Looks safe', simple: 'This is safe' },
  senderEmail: 'NoReply@drives.ga.gov',
  senderDomain: 'drives.ga.gov',
  linkDomains: ['dds.drives.ga.gov', 'www.dds.ga.gov'],
  findings: [
    {
      type: 'safe',
      text: {
        korean: '발신자 이메일이 조지아 주 공식 도메인(drives.ga.gov)이에요',
        english: 'Sender email uses official Georgia government domain (drives.ga.gov)',
        simple: 'The email is from a real Georgia government address',
      },
    },
    {
      type: 'safe',
      text: {
        korean: '이메일 링크가 모두 공식 dds.ga.gov 도메인을 사용해요',
        english: 'All email links use the official dds.ga.gov domain',
        simple: 'All the links go to a real government website',
      },
    },
    {
      type: 'safe',
      text: {
        korean: '비밀번호, 주민번호 등 민감한 정보를 요구하지 않아요',
        english: 'Does not ask for sensitive information like passwords or SSN',
        simple: 'It does not ask for your password or private numbers',
      },
    },
    {
      type: 'note',
      text: {
        korean: '이 이메일에는 직접 답장하지 마세요 — 답장이 전달되지 않아요',
        english: 'Do not reply directly to this email — replies are not received',
        simple: 'Do not reply to this email. It will not be received.',
      },
    },
  ],
  explanation: {
    korean: '이 이메일은 안전해 보여요. 발신자 주소(drives.ga.gov)와 이메일 링크(dds.ga.gov)가 모두 조지아 주 정부의 공식 도메인이에요.',
    english: 'This email appears safe. The sender (drives.ga.gov) and all links (dds.ga.gov) use official Georgia government domains.',
    simple: 'This email is safe. It is really from the Georgia government.',
  },
}

// ── Ignore Decision ──────────────────────────────────────────────────────────

export const ignoreDecision = {
  verdict: 'do-not-ignore',
  verdictLabel: { korean: '무시하지 마세요', english: 'Do not ignore', simple: 'Do not ignore this' },
  verdictLevel: 'danger',
  reasoning: {
    korean: '운전면허가 만료되면 운전을 할 수 없게 되고, 신분증으로도 사용할 수 없어요.',
    english: 'If your license expires, you cannot legally drive and it cannot be used as an ID.',
    simple: 'If you ignore this, your license expires. Then you cannot drive.',
  },
  consequence: {
    korean: '기한 내에 갱신하지 않으면 늦은 수수료가 발생하거나 고객 서비스 센터에 직접 방문해야 할 수 있어요.',
    english: 'Missing the deadline may result in late fees or requiring an in-person visit.',
    simple: 'If you miss the deadline you may have to pay more money or go in person.',
  },
  safestStep: {
    korean: '지금 바로 dds.drives.ga.gov에서 온라인으로 갱신하세요.',
    english: 'Renew online now at dds.drives.ga.gov. It only takes a few minutes.',
    simple: 'Go to dds.drives.ga.gov right now and renew. It is fast.',
  },
}

// ── Glossary ─────────────────────────────────────────────────────────────────

export const glossary = [
  {
    id: 'g1',
    term: { korean: '갱신 (Renewal)', english: 'Renewal' },
    definition: {
      korean: '만료되는 서류를 다시 발급받는 것이에요.',
      english: 'Getting a document re-issued before it expires.',
      simple: 'Getting a new card or license before the old one stops working.',
    },
    emailContext: {
      korean: '운전면허증이 곧 만료되니, 새 면허증을 받아야 해요.',
      english: 'Your license is about to expire, so you need to get a new one.',
    },
  },
  {
    id: 'g2',
    term: { korean: '만료 / 만료일 (Expiration)', english: 'Expiration' },
    definition: {
      korean: '서류나 카드의 유효 기간이 끝나는 것이에요.',
      english: 'When a document or card is no longer valid.',
      simple: 'When a card stops working.',
    },
    emailContext: {
      korean: '운전면허증의 유효기간이 곧 끝난다는 뜻이에요.',
      english: 'Your driver\'s license will soon stop being valid.',
    },
  },
  {
    id: 'g3',
    term: { korean: '고객 서비스 센터 (Customer Service Center)', english: 'Customer Service Center' },
    definition: {
      korean: '정부 기관이 운영하는 사무소예요. 직접 방문해서 도움을 받을 수 있어요.',
      english: 'A government office you can visit in person for help.',
      simple: 'A government office you can walk into. People there will help you.',
    },
    emailContext: {
      korean: '온라인이 어려우면 가까운 DDS 고객 서비스 센터에 방문할 수 있어요.',
      english: 'If online feels too hard, you can visit a DDS office in person.',
    },
  },
  {
    id: 'g4',
    term: { korean: '허가증 / 신분증 (Permit / ID)', english: 'Permit / ID' },
    definition: {
      korean: '특정 활동을 허가하거나 신원을 증명하는 문서예요.',
      english: 'A document that proves your identity or allows a specific activity.',
      simple: 'A card that shows who you are or what you are allowed to do.',
    },
    emailContext: {
      korean: '운전 허가증과 신분증도 갱신 대상에 포함돼요.',
      english: "Driver's permits and ID cards also need renewal.",
    },
  },
  {
    id: 'g5',
    term: { korean: '수수료 (Fee)', english: 'Fee' },
    definition: {
      korean: '서비스를 받기 위해 내야 하는 돈이에요.',
      english: 'Money you pay to receive a service.',
      simple: 'Money you pay for something.',
    },
    emailContext: {
      korean: '운전면허 갱신 수수료는 $32예요 (8년 유효).',
      english: 'The renewal fee is $32 for an 8-year license.',
    },
  },
  {
    id: 'g6',
    term: { korean: '온라인 서비스 (Online Services)', english: 'Online Services' },
    definition: {
      korean: '컴퓨터나 스마트폰으로 인터넷에서 이용할 수 있는 서비스예요.',
      english: 'Services you can use on the internet via a computer or phone.',
      simple: 'Things you can do on a website or app.',
    },
    emailContext: {
      korean: 'DDS 웹사이트나 앱을 통해 집에서 갱신할 수 있어요.',
      english: 'You can renew at home through the DDS website or app.',
    },
  },
]

// ── Documents / Attachments ──────────────────────────────────────────────────

export const documentHelper = []

// ── Case Memory ──────────────────────────────────────────────────────────────

export const caseMemory = {
  name: { korean: '운전면허 갱신', english: "Driver's License Renewal" },
  emails: [
    {
      id: 'e1',
      subject: "Quick Reminder: Your Driver's License will expire soon!",
      date: 'May 6, 2026',
      status: 'current',
      label: { korean: '현재 이메일', english: 'Current email' },
    },
  ],
  progress: [
    { id: 'p1', step: { korean: '갱신 안내 받음', english: 'Renewal notice received' }, done: true },
    { id: 'p2', step: { korean: '온라인 신청 완료', english: 'Application completed' }, done: false },
    { id: 'p3', step: { korean: '$32 납부 완료', english: '$32 payment made' }, done: false },
    { id: 'p4', step: { korean: '갱신 완료', english: 'Renewal complete' }, done: false },
  ],
}

// ── Reply Options ─────────────────────────────────────────────────────────────

export const replyOptions = [
  {
    id: 'r1',
    label: { korean: '정중한 확인', english: 'Polite confirmation', simple: 'Thank you reply' },
    draft: {
      korean: '안녕하세요,\n\n갱신 안내 이메일 감사합니다. 운전면허를 갱신하겠습니다.\n\n감사합니다.',
      english: 'Hello,\n\nThank you for the renewal reminder. I will proceed with renewing my driver\'s license.\n\nThank you.',
    },
  },
  {
    id: 'r2',
    label: { korean: '추가 시간 요청', english: 'Request more time', simple: 'Need more time' },
    draft: {
      korean: '안녕하세요,\n\n갱신 안내 감사합니다. 현재 일정이 바빠 조금 더 시간이 필요합니다. 만료일 전에 꼭 갱신하겠습니다.\n\n감사합니다.',
      english: 'Hello,\n\nThank you for the reminder. I am currently busy but will complete the renewal before the expiration date.\n\nThank you.',
    },
  },
  {
    id: 'r3',
    label: { korean: '질문하기', english: 'Ask a question', simple: 'Ask something' },
    draft: {
      korean: '안녕하세요,\n\n갱신 절차에 대해 궁금한 점이 있어 연락드립니다.\n\n[여기에 질문을 적어주세요]\n\n감사합니다.',
      english: 'Hello,\n\nI have a question about the renewal process.\n\n[Type your question here]\n\nThank you.',
    },
  },
]

// ── Extended Chat Presets ────────────────────────────────────────────────────

export const chatPresets = [
  {
    id: 1,
    guideTarget: null,
    question: { korean: '이 이메일이 뭘 원하는 건가요?', english: 'What does this email want me to do?' },
    answer: { korean: '운전면허증을 갱신하라는 내용이에요. 웹사이트(dds.drives.ga.gov)나 DDS 2 GO 앱에서 $32를 내고 갱신하면 돼요.', english: "It wants you to renew your driver's license. You can do it online at dds.drives.ga.gov or through the DDS 2 GO app for $32." },
  },
  {
    id: 2,
    guideTarget: 'tab-reply',
    question: { korean: '답장을 해야 하나요?', english: 'Do I need to reply?' },
    answer: { korean: '아니요. 이 이메일에는 답장하지 마세요. 웹사이트에서 직접 갱신하면 돼요.', english: 'No. Do not reply to this email. Just renew directly on the website.' },
  },
  {
    id: 3,
    guideTarget: 'email-forward-btn',
    question: { korean: '어떻게 이메일을 전달하나요?', english: 'How do I forward this email?' },
    answer: { korean: '이메일 아래쪽의 "Forward" 버튼을 클릭하세요.', english: 'Click the Forward button at the bottom of the email.' },
  },
  {
    id: 4,
    guideTarget: null,
    question: { korean: '무시해도 될까요?', english: 'Can I ignore this?' },
    answer: { korean: '무시하면 안 돼요. 면허가 만료되면 운전을 할 수 없어요. 지금 바로 갱신하는 게 가장 좋아요.', english: "You should not ignore this. If your license expires, you cannot legally drive. Renew as soon as possible." },
  },
  {
    id: 5,
    guideTarget: null,
    question: { korean: '스캠인가요?', english: 'Is this a scam?' },
    answer: { korean: '아니요, 안전한 이메일이에요. 발신자 주소와 링크가 모두 조지아 주 공식 도메인(ga.gov)이에요.', english: 'No, this email is safe. The sender and all links use official Georgia government domains (ga.gov).' },
  },
  {
    id: 6,
    guideTarget: null,
    question: { korean: '가장 먼저 뭘 해야 하나요?', english: 'What should I do first?' },
    answer: { korean: '먼저 dds.drives.ga.gov 웹사이트를 방문하세요. 거기서 온라인 갱신 신청을 시작할 수 있어요.', english: 'First, visit dds.drives.ga.gov. You can start the online renewal application there.' },
  },
  {
    id: 7,
    guideTarget: null,
    question: { korean: '비용은 얼마예요?', english: 'How much will this cost?' },
    answer: { korean: '$32예요. 8년 동안 유효한 면허증을 받을 수 있어요. 온라인으로 하면 더 저렴할 수도 있어요.', english: '$32 for an 8-year license. Renewing online may save you additional money.' },
  },
  {
    id: 8,
    guideTarget: null,
    question: { korean: '기한을 놓치면 어떻게 되나요?', english: 'What if I miss the deadline?' },
    answer: { korean: '면허가 만료되면 운전을 할 수 없어요. 늦은 수수료가 발생하거나 직접 방문해야 할 수 있어요.', english: "If your license expires, you can't legally drive and may face late fees or need to visit a service center in person." },
  },
  {
    id: 9,
    guideTarget: 'email-dds-link',
    question: { korean: '어디서 클릭해야 하나요?', english: 'Show me where to click' },
    answer: { korean: '이메일에서 dds.drives.ga.gov 링크를 찾아 클릭하세요. 강조 표시를 확인하세요.', english: 'Find and click the dds.drives.ga.gov link in the email. See the highlighted area.' },
  },
  {
    id: 10,
    guideTarget: null,
    question: { korean: '첨부파일이 있나요?', english: 'Are there any attachments?' },
    answer: { korean: '이 이메일에는 첨부파일이 없어요.', english: 'This email has no attachments.' },
  },
]

// ── Guided Walkthroughs ──────────────────────────────────────────────────────

export const walkthroughs = {
  'renew-license': {
    id: 'renew-license',
    title: { korean: '운전면허 갱신 따라하기', english: 'License Renewal Walkthrough' },
    steps: [
      {
        id: 'w1',
        guideTarget: 'email-dds-link',
        instruction: {
          korean: '이메일에서 dds.drives.ga.gov 링크를 찾으세요. 파란색으로 표시되어 있어요.',
          english: 'Find the dds.drives.ga.gov link in the email. It is highlighted in blue.',
        },
        confirm: { korean: '링크를 찾았어요', english: 'I found the link' },
        simplified: {
          korean: '이메일 중간에 파란 글씨 링크를 찾으세요.',
          english: 'Look for blue underlined text in the middle of the email.',
        },
        reassurance: {
          action: {
            korean: '이 링크를 클릭하면 DDS 공식 웹사이트가 새 탭에서 열려요. 이메일은 그대로 남아요.',
            english: 'Clicking this link opens the official DDS website in a new tab. Your email stays open.',
          },
          reversible: {
            korean: '새 탭을 닫으면 이 이메일로 돌아올 수 있어요.',
            english: 'You can close the new tab to return here at any time.',
          },
          safe: true,
        },
        context: {
          plain: {
            korean: '이 링크는 조지아 주 공식 운전면허 갱신 웹사이트로 연결돼요. 사기 링크가 아니에요.',
            english: 'This link goes to the official Georgia license renewal website. It is not a scam link.',
          },
          why: {
            korean: '이 사이트에서 집에서 온라인으로 갱신할 수 있어요. 직접 방문하지 않아도 돼요.',
            english: 'This is where you renew your license online from home, without visiting an office.',
          },
        },
      },
      {
        id: 'w2',
        guideTarget: null,
        instruction: {
          korean: '링크를 클릭하면 DDS 공식 웹사이트가 열려요. "Online Services" 버튼을 찾으세요.',
          english: 'Clicking the link opens the DDS website. Look for the "Online Services" button.',
        },
        confirm: { korean: '웹사이트에 도착했어요', english: 'I reached the website' },
        simplified: {
          korean: '웹사이트에 들어가면 "Online Services" 글씨를 찾으세요.',
          english: 'On the website, look for the words "Online Services".',
        },
        reassurance: {
          action: {
            korean: '"Online Services" 버튼을 클릭해도 아무것도 신청되지 않아요. 메뉴만 열려요.',
            english: 'Clicking "Online Services" does not apply for anything. It just opens a menu.',
          },
          reversible: {
            korean: '브라우저의 뒤로가기 버튼을 누르면 언제든 돌아갈 수 있어요.',
            english: 'You can press the browser back button to go back at any time.',
          },
          safe: true,
        },
        context: {
          plain: {
            korean: 'DDS 웹사이트 첫 페이지에 "Online Services"라는 메뉴가 있어요. 거기서 갱신을 시작할 수 있어요.',
            english: 'The DDS homepage has an "Online Services" section. That is where you begin the renewal.',
          },
          why: {
            korean: '온라인 서비스 메뉴를 통해야 운전면허 갱신 페이지로 이동할 수 있어요.',
            english: 'You need to go through Online Services to reach the license renewal page.',
          },
        },
      },
      {
        id: 'w3',
        guideTarget: null,
        instruction: {
          korean: '"Renew" 또는 "Driver\'s License Renewal" 옵션을 선택하세요.',
          english: 'Select the "Renew" or "Driver\'s License Renewal" option.',
        },
        confirm: { korean: '갱신 옵션을 찾았어요', english: 'I found the renewal option' },
        simplified: {
          korean: '"Renew" 또는 "갱신"이라고 적힌 항목을 찾아 클릭하세요.',
          english: 'Find and click the item that says "Renew" or "Renewal".',
        },
        reassurance: {
          action: {
            korean: '이 항목을 선택하면 갱신 신청 양식이 열려요. 아직 아무것도 제출되지 않아요.',
            english: 'Selecting this opens a renewal form. Nothing is submitted yet.',
          },
          reversible: {
            korean: '양식을 작성하지 않고 닫으면 아무런 변경 사항도 없어요.',
            english: 'If you close the form without filling it out, nothing changes.',
          },
          safe: true,
        },
        context: {
          plain: {
            korean: '"Renew" 항목을 클릭하면 이름, 주소 등을 입력하는 양식이 열려요.',
            english: 'Clicking "Renew" opens a form where you fill in your name, address, and other details.',
          },
          why: {
            korean: '이 단계가 실제 갱신 신청을 시작하는 곳이에요.',
            english: 'This is the step that officially starts your renewal application.',
          },
        },
      },
      {
        id: 'w4',
        guideTarget: null,
        instruction: {
          korean: '개인 정보를 입력하고 $32를 결제하세요. 신용카드나 직불카드가 필요해요.',
          english: 'Enter your personal information and pay $32. A credit or debit card is needed.',
        },
        confirm: { korean: '결제를 완료했어요', english: 'I completed the payment' },
        simplified: {
          korean: '정보를 입력하고 카드로 $32를 결제하면 끝이에요.',
          english: 'Fill in your details and pay $32 by card. That is all.',
        },
        reassurance: {
          action: {
            korean: '결제 정보를 입력하고 확인 버튼을 누르면 $32가 청구돼요. 8년짜리 새 면허증을 받을 수 있어요.',
            english: 'Entering your card details and confirming charges $32. You\'ll receive a new 8-year license.',
          },
          reversible: {
            korean: '결제 전에 모든 정보를 꼭 확인하세요. 결제 후에는 취소하기 어려울 수 있어요.',
            english: 'Please double-check everything before paying. It may be hard to cancel after payment.',
          },
          safe: true,
        },
        context: {
          plain: {
            korean: '신용카드나 직불카드로 $32를 납부하면 갱신이 완료돼요. 새 면허증이 우편으로 올 수도 있어요.',
            english: 'Paying $32 by card completes your renewal. A new license may arrive by mail.',
          },
          why: {
            korean: '$32는 8년 동안 유효한 새 면허증 발급 비용이에요.',
            english: 'The $32 fee covers your new license, which is valid for 8 years.',
          },
        },
      },
    ],
  },
}

// ── Existing emailAnalysis ───────────────────────────────────────────────────

export const emailAnalysis = {
  summary: {
    korean: '조지아 주 운전면허국(DDS)에서 보낸 공식 이메일이에요. 운전면허증 또는 신분증이 곧 만료되니 갱신하라는 안내예요.',
    english: "This is an official email from the Georgia Department of Driver Services (DDS). Your driver's license or ID card is expiring soon and needs to be renewed.",
    simple: "Your driver's license is expiring soon. You need to renew it. This email tells you how.",
  },
  keyDetails: [
    { korean: '갱신 비용: $32.00 (8년 유효)', english: 'Renewal cost: $32.00 (valid for 8 years)', simple: 'Cost: $32' },
    { korean: '온라인으로 갱신하면 비용을 절약할 수 있어요', english: 'Save money by renewing online', simple: 'Online renewal is cheaper' },
    { korean: '웹사이트: dds.drives.ga.gov', english: 'Website: dds.drives.ga.gov', simple: 'Website: dds.drives.ga.gov' },
    { korean: '스마트폰 앱 이름: DDS 2 GO', english: 'Smartphone app: DDS 2 GO', simple: 'Phone app: DDS 2 GO' },
  ],
  nextSteps: [
    { korean: 'dds.drives.ga.gov 웹사이트를 방문하거나 DDS 2 GO 앱을 다운로드하세요', english: 'Go to dds.drives.ga.gov or download the DDS 2 GO app', simple: 'Open dds.drives.ga.gov' },
    { korean: '온라인으로 갱신 신청을 완료하세요', english: 'Complete the renewal application online', simple: 'Fill out the form' },
    { korean: '$32.00를 납부하세요', english: 'Pay $32.00', simple: 'Pay $32' },
  ],
  warnings: [
    { korean: '이 이메일에 직접 답장하지 마세요 — 답장이 전달되지 않아요', english: 'Do not reply to this email directly — replies will not be received', simple: 'Do not reply to this email' },
    { korean: '면허증이 곧 만료돼요. 빨리 갱신하세요', english: "Your license is expiring soon — act quickly", simple: 'Act fast — license expires soon' },
  ],
  reply: {
    needed: false,
    note: {
      korean: '이 이메일에는 답장이 필요 없어요. 웹사이트(dds.drives.ga.gov)에서 직접 갱신하면 돼요.',
      english: 'No reply is needed for this email. Just renew directly at dds.drives.ga.gov.',
      simple: 'You do not need to reply. Just go to the website to renew.',
    },
  },
}

// ── Guide Spotlight Labels ───────────────────────────────────────────────────

export const guideLabels = {
  'email-forward-btn': {
    korean: '여기를 클릭하면\n이메일을 전달할 수 있어요',
    english: 'Click here to\nforward this email',
  },
  'tab-reply': {
    korean: '답장 탭을 확인하세요',
    english: 'Check the Reply tab here',
  },
  'email-dds-link': {
    korean: '여기가 DDS 웹사이트 링크예요\n클릭하면 갱신 페이지로 이동해요',
    english: 'This is the DDS website link\nClick it to go to the renewal page',
  },
}
