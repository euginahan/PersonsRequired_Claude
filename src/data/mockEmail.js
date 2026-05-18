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

export const emailAnalysis = {
  summary: {
    korean: '조지아 주 운전면허국(DDS)에서 보낸 공식 이메일이에요. 운전면허증 또는 신분증이 곧 만료되니 갱신하라는 안내예요.',
    english: "This is an official email from the Georgia Department of Driver Services (DDS). Your driver's license or ID card is expiring soon and needs to be renewed.",
  },
  keyDetails: [
    { korean: '갱신 비용: $32.00 (8년 유효)', english: 'Renewal cost: $32.00 (valid for 8 years)' },
    { korean: '온라인으로 갱신하면 비용을 절약할 수 있어요', english: 'Save money by renewing online' },
    { korean: '웹사이트: dds.drives.ga.gov', english: 'Website: dds.drives.ga.gov' },
    { korean: '스마트폰 앱 이름: DDS 2 GO', english: 'Smartphone app: DDS 2 GO' },
  ],
  nextSteps: [
    { korean: 'dds.drives.ga.gov 웹사이트를 방문하거나 DDS 2 GO 앱을 다운로드하세요', english: 'Go to dds.drives.ga.gov or download the DDS 2 GO app on your phone' },
    { korean: '온라인으로 갱신 신청을 완료하세요', english: 'Complete the renewal application online' },
    { korean: '$32.00를 납부하세요', english: 'Pay $32.00' },
    { korean: '온라인이 어려우면 가까운 고객 서비스 센터에 방문하세요', english: 'If online is too difficult, visit a nearby Customer Service Center' },
  ],
  warnings: [
    { korean: '이 이메일에 직접 답장하지 마세요 — 답장이 전달되지 않아요', english: 'Do not reply to this email directly — replies will not be received' },
    { korean: '면허증이 곧 만료돼요. 빨리 갱신하세요', english: "Your license is expiring soon — act quickly" },
  ],
  reply: {
    needed: false,
    note: {
      korean: '이 이메일에는 답장이 필요 없어요. 웹사이트(dds.drives.ga.gov)에서 직접 갱신하면 돼요.',
      english: 'No reply is needed for this email. Just renew directly at dds.drives.ga.gov.',
    },
  },
}

export const chatPresets = [
  {
    id: 1,
    question: { korean: '이 이메일이 뭘 원하는 건가요?', english: 'What does this email want me to do?' },
    answer: { korean: '운전면허증을 갱신하라는 내용이에요. 웹사이트(dds.drives.ga.gov)나 DDS 2 GO 앱에서 $32를 내고 갱신하면 돼요.', english: "It wants you to renew your driver's license. You can do it online at dds.drives.ga.gov or through the DDS 2 GO app for $32." },
  },
  {
    id: 2,
    question: { korean: '답장을 해야 하나요?', english: 'Do I need to reply?' },
    answer: { korean: '아니요. 이 이메일에는 답장하지 마세요. 웹사이트에서 직접 갱신하면 돼요.', english: 'No. Do not reply to this email. Just renew directly on the website.' },
  },
  {
    id: 3,
    question: { korean: '어떻게 이메일을 전달하나요?', english: 'How do I forward this email?' },
    answer: { korean: '이메일 오른쪽 상단의 점 세 개(⋮)를 클릭하고 "전달(Forward)"을 선택하세요.', english: 'Click the three dots (⋮) in the top right of the email, then choose "Forward".' },
  },
  {
    id: 4,
    question: { korean: '첨부파일은 어디 있나요?', english: 'Where is the attachment?' },
    answer: { korean: '이 이메일에는 첨부파일이 없어요.', english: 'This email has no attachments.' },
  },
  {
    id: 5,
    question: { korean: '답장을 써줄 수 있나요?', english: 'Can you write a reply for me?' },
    answer: { korean: '이 이메일에는 답장이 필요 없어요. 웹사이트에서 갱신하거나 가까운 센터에 방문하면 돼요.', english: 'No reply is needed for this email. Just renew online or visit a nearby center.' },
  },
]
