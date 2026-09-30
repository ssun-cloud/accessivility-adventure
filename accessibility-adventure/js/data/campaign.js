/* =========================================================
 * data/campaign.js — 게임 뒤 '보너스 미션'(온라인 캠페인 참여) 설정
 * ---------------------------------------------------------
 * 흐름 : ① 가장 기억에 남은 것 → ② 이런 것도 접근성이에요 → ③ 우리 동네에도 있을까요?
 *        (있어요 → 장소 추천 / 아직 없어요 → 오늘의 접근성 미션) → ④ 경품 추첨(선택) → 완료
 *
 * ✏️ 문구와 저장 주소는 이 파일에서만 바꾸면 됩니다.
 *  - endpoint : Google Apps Script 웹 앱 주소(…/exec). 비워 두면 '미리보기 모드'(저장 안 함).
 *  - features 의 key 는 google-apps-script/Code.gs 의 FEATURES 와 똑같이 맞춰 주세요.
 *  - memory(기억에 남은 것)·missions(오늘의 미션)은 버전마다 다르게 쓸 수 있어요.
 *    각 테마 파일에 campaignFlow: { memory: [...], missions: [...] } 를 넣으면 그 값이 우선합니다.
 *    없으면 아래 기본값(마을축제용)을 씁니다.
 *  - 화면 문구(label)와 시트 저장값(key)은 분리되어 있어요. key 는 바꾸지 않는 것을 권해요.
 * ========================================================= */
AAG.campaign = {
  enabled: true,
  endpoint: '',

  steps: ['기억', '발견', '우리 동네', '마무리'],   // 위쪽 진행 표시

  /* ① 가장 기억에 남은 것 (한 개 고르기) */
  memory: {
    title: '오늘 모험에서 가장 기억에 남은 것은?',
    lead: '하나만 톡! 골라 주세요.',
    options: [
      { key: 'movement', label: '이동하기 편한 길', icon: 'ramp' },
      { key: 'sound_text', label: '소리와 글자로 함께 확인할 수 있는 정보', icon: 'text' },
      { key: 'multi_info', label: '여러 방법으로 확인할 수 있는 안내', icon: 'multi' },
      { key: 'all', label: '모두 기억에 남아요', icon: 'star' }
    ]
  },

  /* ② 이런 것도 접근성이에요 (안 골라도 됨) */
  widen: {
    title: '이런 것도 접근성이에요',
    lead: '장소를 이용하면서 이런 점이 편했던 적이 있나요?\n공감하는 카드를 눌러 보세요. 안 골라도 괜찮아요.',
    next: '다음'
  },
  features: [
    { key: 'step_free', label: '들어가기 편했어요', icon: 'ramp' },
    { key: 'wide_space', label: '안에서 이동하기 편했어요', icon: 'wide' },
    { key: 'tactile_paving', label: '점자블록이 잘 이어져 있었어요', icon: 'tactile' },
    { key: 'clear_sign', label: '안내를 보기 쉬웠어요', icon: 'bigtext' },
    { key: 'sound_text', label: '소리와 글자로 함께 안내했어요', icon: 'text' },
    { key: 'menu_multi', label: '메뉴나 정보를 여러 방법으로 확인할 수 있었어요', icon: 'multi' },
    { key: 'staff_help', label: '직원의 안내가 편했어요', icon: 'staff' },
    { key: 'restroom', label: '화장실 이용이 편했어요', icon: 'toilet' },
    { key: 'rest_space', label: '잠깐 앉아 쉴 자리가 있었어요', icon: 'bench' },
    { key: 'other', label: '기타', icon: 'star', other: true }
  ],
  otherPlaceholder: '편했던 점을 짧게 적어 주세요',

  /* ③ 우리 동네에도 있을까요? */
  fork: {
    title: '게임에서 찾은 접근성, 우리 동네에도 있을까요?',
    lead: '이용하면서 편했던 장소가 떠오른다면 알려주세요.',
    yes: '떠오르는 장소가 있어요',
    no: '아직 없어요. 앞으로 찾아볼래요'
  },

  /* ③-1 장소 추천 */
  placeStep: {
    title: '우리 동네 장소 기록하기',
    featuresLabel: '이 장소에서는 어떤 점이 편했나요?',
    prefillNote: '앞에서 고른 카드가 미리 체크되어 있어요. 이 장소에 맞게 바꿔 주세요.',
    next: '기록하고 다음으로'
  },
  place: { label: '장소명', placeholder: '예: 골목카페, 동네 도서관, OO마트' },
  area: {
    label: '지역 또는 동네', placeholder: '예: 종로구 서촌, 혜화동',
    help: '목록에 없으면 직접 적어 주세요. "혜화역 근처"처럼 대략 적어도 괜찮아요.',
    suggestions: ['종로구 서촌', '종로구 혜화동', '종로구 창신동', '종로구 삼청동', '종로구 익선동', '종로구 부암동', '종로구 평창동', '종로구 이화동']
  },
  reassure: '완벽한 곳이 아니어도 괜찮아요.\n이용하면서 편했던 점 하나만 알려주세요.',
  reviewNote: '남겨 주신 장소는 바로 공개되지 않아요. 담당자가 확인한 뒤 캠페인 자료로 활용하며, “접근성이 완벽한 곳”이라는 인증은 아니에요.',

  /* ③-2 오늘의 접근성 미션 (무작위 1개, 다른 미션 보기 가능) */
  mission: {
    title: '오늘의 접근성 미션',
    body: '다음에 동네를 걸을 때\n평소에는 지나쳤던 입구, 안내판, 메뉴와 공간을 한번 살펴보세요.',
    question: '사람마다 이곳을 어떻게 이용할 수 있을까?',
    reroll: '다른 미션 보기',
    save: '미션 카드 저장하기',
    saveHint: '이미지를 길게 누르거나(휴대폰) 오른쪽 클릭해서 저장할 수 있어요.',
    next: '미션 받고 다음으로',
    list: [
      { key: 'mission_step_free', text: '계단 없이 들어갈 수 있는 가게 하나 찾아보기', icon: 'ramp' },
      { key: 'mission_sound_text', text: '소리와 글자로 함께 안내하는 곳 찾아보기', icon: 'text' },
      { key: 'mission_multi_info', text: '메뉴나 정보를 여러 방법으로 확인할 수 있는 곳 찾아보기', icon: 'multi' },
      { key: 'mission_tactile', text: '우리 동네 점자블록을 찾아보고, 그 위가 비어 있는지 살펴보기', icon: 'tactile' },
      { key: 'mission_clear_sign', text: '안내가 이해하기 쉬운 장소 찾아보기', icon: 'bigtext' }
    ]
  },

  /* ④ 경품 추첨 (누구나 선택) */
  prize: {
    enabled: true,
    title: '온라인 캠페인에 참여해주셔서 감사합니다!',
    lead: '참여자 중 추첨을 통해 작은 선물을 드립니다.',
    optIn: '경품 추첨에 참여할게요',
    optOut: '괜찮아요, 캠페인만 참여할게요',
    submit: '참여 완료하기',
    nameLabel: '이름 또는 닉네임',
    contactLabel: '연락처',
    contactPlaceholder: '010-0000-0000',
    privacy: '연락처는 경품 추첨 및 당첨 안내에만 사용되며, 캠페인 종료 후 기관의 개인정보 처리 기준에 따라 폐기됩니다.',
    requireConsent: true,           // 개인정보 수집·이용 동의 체크박스 사용 여부
    consentLabel: '경품 추첨을 위한 개인정보 수집·이용에 동의해요. (필수)',
    consentVersion: '2026-10',      // 동의 문구를 바꾸면 버전도 바꿔 주세요(시트에 함께 기록됩니다)
    consentDetail: [
      ['수집 항목', '이름 또는 닉네임, 연락처'],
      ['이용 목적', '경품 추첨 및 당첨 안내'],
      ['보유 기간', '캠페인 종료 후 기관의 개인정보 처리 기준에 따라 폐기'],
      ['동의 거부', '동의하지 않아도 캠페인은 그대로 참여할 수 있어요. 다만 경품 추첨에는 참여할 수 없어요.']
    ],
    minorNote: '만 14세 미만 어린이는 보호자와 함께 보호자 연락처로 입력해 주세요.'
  },

  /* 완료  (버전별로 campaignFlow.missionBody / doneSub / doneKey 로 바꿀 수 있어요) */
  done: {
    title: '오늘의 접근성 모험 완료!',
    key: '게임에서 찾은 접근성,\n이제 우리 동네에서도 찾아보세요.',
    sub: '다음에 동네를 걸을 때\n평소에는 지나쳤던 입구, 안내판, 메뉴와 공간을 한번 살펴보세요.',
    placeNote: '알려주신 장소도 잘 기록했어요.',
    missionNote: '오늘의 미션',
    replay: '처음부터 다시 하기',
    share: '다른 사람에게 공유하기',
    shareText: '동네를 여행하며 접근성 아이템을 찾는 게임 〈우리 동네 접근성 모험〉 같이 해 볼래요?'
  },

  back: '이전',
  errors: {
    place: '장소 이름을 적어 주세요.',
    area: '지역이나 동네를 적어 주세요.',
    features: '이 장소에서 편했던 점을 하나 이상 골라 주세요.',
    other: '기타 내용을 짧게 적어 주세요.',
    name: '이름이나 닉네임을 적어 주세요.',
    contact: '연락 가능한 휴대폰 번호를 적어 주세요. (예: 010-1234-5678)',
    consent: '경품 추첨에 참여하려면 개인정보 수집·이용에 동의해 주세요.',
    send: '인터넷 연결이 불안정해서 보내지 못했어요. 잠시 뒤 다시 눌러 주세요.'
  }
};
