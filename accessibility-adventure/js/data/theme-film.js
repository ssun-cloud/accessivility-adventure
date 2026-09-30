/* =========================================================
 * data/theme-film.js — 배리어프리 영화 캠페인 버전
 * 흐름 : 이동(경사로) → 자막 → 화면해설
 * 주소 끝에 #film 을 붙이면 이 버전으로 시작합니다.
 * ========================================================= */
AAG.registerTheme({
  id: 'film',
  label: '배리어프리 영화',
  campaign: '배리어프리 영화 캠페인',

  title: '우리 동네 접근성 모험',
  subtitle: '영화관 가는 길의 접근성을 찾아요!',
  intro: '오늘은 동네 영화제가 열리는 날!\n그런데 가는 길 곳곳이 막혔어요.\n접근성 아이템 3개를 찾아\n모두 함께 영화를 볼까요?',
  startButton: '모험 시작!',

  route: [
    { icon: 'home', label: '집' },
    { icon: 'film', label: '영화관' },
    { icon: 'screen', label: '야외 상영' },
    { icon: 'headphones', label: '상영관' },
    { icon: 'flag', label: '영화제' }
  ],

  world: { home: '우리 집', fillers: ['매표소', '팝콘가게'], goal: '배리어프리 영화제', poster: '영화제' },

  stages: [
    {
      scene: 'entrance',
      title: '영화관에 들어가고 싶어요!',
      place: { sign: '동네 영화관', style: 'theater' },
      travel: '영화관으로 가는 길이에요',
      lead: '어? 영화관 입구에 계단이 있네요.',
      question: '더 많은 관객이 편하게 드나들려면\n무엇이 있으면 좋을까요?',
      wrong: '이 방법으로는 지나가기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '경사로', icon: 'ramp', correct: true },
        { label: '더 높은 계단', icon: 'stairs', hint: '계단이 높아지면 오르내리기가 더 힘들어져요.' },
        { label: '작은 출입문', icon: 'door', hint: '문이 작아지면 드나들 수 있는 사람이 줄어들어요.' },
        { label: '미끄러운 발판', icon: 'slip', hint: '미끄러우면 누구든 넘어지기 쉬워요.' }
      ],
      solved: '뿅! 영화관 앞에 경사로가 생겼어요.',
      item: {
        name: '경사로', icon: 'ramp',
        desc: '경사로가 있으면 휠체어, 유아차 등\n바퀴로 이동하는 관객도 편하게 들어올 수 있어요.',
        note: '영화관까지 가는 길, 매표소, 상영관 좌석까지 이어져야 진짜 편한 길이 돼요.'
      },
      a11y: { before: '영화관 입구 앞에 계단 세 칸이 있습니다.', after: '영화관 입구 옆에 손잡이가 달린 경사로가 생겼습니다.' }
    },
    {
      scene: 'board',
      variant: 'screen',
      title: '영화 속 대사를 놓쳤어요!',
      place: { sign: '야외 상영회' },
      travel: '야외 상영회에 들러요',
      sound: '♪ 대사 소리',
      lead: '영화 속 두 사람이 이야기하고 있어요.',
      question: '소리를 듣기 어려운 관객이나 상황에서도\n대사를 알 수 있으려면 무엇이 있으면 좋을까요?',
      wrong: '이 방법으로는 대사를 알기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '글자로 보여주는 자막', icon: 'cc', correct: true },
        { label: '소리를 더 크게 틀기', icon: 'loud', hint: '소리만 커지면 여전히 들어야만 알 수 있어요.' },
        { label: '스크린을 더 높이 달기', icon: 'up', hint: '너무 높으면 보기가 더 어려워져요.' },
        { label: '영화를 더 빨리 틀기', icon: 'fast', hint: '빨라지면 누구든 따라가기 어려워요.' }
      ],
      message: '“내일 바다 보러 갈래?”  “좋아, 같이 가자!”',
      solved: '스크린에 자막이 나타났어요!',
      item: {
        name: '자막', icon: 'cc',
        desc: '대사와 소리를 글자로 보여주면\n더 많은 관객이 영화를 함께 즐길 수 있어요.',
        note: '시끄러운 야외, 외국어 영화, 소리를 크게 틀기 어려운 곳에서도 자막이 쓰여요.'
      },
      a11y: { before: '야외 스크린에서 영화가 나오고 대사 소리만 들립니다.', after: '스크린 아래에 대사 자막이 나타났습니다.' }
    },
    {
      scene: 'infopoint',
      variant: 'cinema',
      title: '장면을 어떻게 알 수 있지?',
      place: { sign: '상영관', stand: 'INFO' },
      travel: '상영관에 들어가 볼까요?',
      lead: '화면 속 장면이 말없이 이어지고 있어요.',
      question: '화면을 눈으로 보기 어려운 관객도\n장면을 알 수 있는 방법은 무엇일까요?',
      wrong: '이 방법으로는 장면을 알기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '장면을 말로 설명하는 화면해설', icon: 'headphones', correct: true },
        { label: '스크린을 더 높이 달기', icon: 'up', hint: '높이 달아도 눈으로 봐야만 알 수 있어요.' },
        { label: '장면을 더 작게 보여주기', icon: 'small', hint: '작아지면 알아보기 더 어려워요.' },
        { label: '상영관을 더 어둡게 하기', icon: 'dark', hint: '어두워도 장면을 아는 방법은 늘지 않아요.' }
      ],
      methods: [
        { icon: 'headphones', label: '화면해설', say: '노을 지는 바닷가, 두 사람이 천천히 걸어가요.' },
        { icon: 'cc', label: '한글 자막', show: '(파도 소리) 쏴아—' },
        { icon: 'speaker', label: '음성 안내', say: '출구는 왼쪽 뒤편이에요.' },
        { icon: 'staff', label: '직원 안내', say: '자리까지 함께 갈까요?' }
      ],
      solved: '장면과 정보를 알 수 있는 방법이 여러 가지로 늘었어요!',
      item: {
        name: '화면해설', icon: 'headphones',
        desc: '장면을 말로 설명해 주면\n눈으로 보기 어려워도 이야기를 따라갈 수 있어요.',
        note: '자막, 화면해설, 직원 안내가 함께 있으면 더 많은 관객이 같은 영화를 즐겨요.'
      },
      a11y: { before: '상영관 스크린에 바닷가 장면이 말없이 이어집니다.', after: '화면해설 수신기, 자막, 음성 안내가 생기고 직원이 자리 안내를 합니다.' }
    }
  ],

  campaignFlow: {
    missionBody: '다음에 영화관에 갈 때\n평소에는 지나쳤던 입구, 안내판, 좌석과 공간을 한번 살펴보세요.',
    doneSub: '다음에 영화관에 갈 때\n평소에는 지나쳤던 입구, 안내판, 좌석과 공간을 한번 살펴보세요.',
    memory: [
      { key: 'movement', label: '이동하기 편한 길', icon: 'ramp' },
      { key: 'captions', label: '글자로 함께 보는 대사(자막)', icon: 'cc' },
      { key: 'audio_desc', label: '말로 설명해 주는 장면(화면해설)', icon: 'headphones' },
      { key: 'all', label: '모두 기억에 남아요', icon: 'star' }
    ],
    missions: [
      { key: 'mission_step_free', text: '계단 없이 들어갈 수 있는 영화관·문화공간 찾아보기', icon: 'ramp' },
      { key: 'mission_captions', text: '한글 자막으로 볼 수 있는 영화나 영상 찾아보기', icon: 'cc' },
      { key: 'mission_audio_desc', text: '화면해설이 있는 영화 찾아보기', icon: 'headphones' },
      { key: 'mission_tactile', text: '영화관 가는 길의 점자블록을 찾아보고, 그 위가 비어 있는지 살펴보기', icon: 'tactile' },
      { key: 'mission_clear_sign', text: '상영관 안내가 이해하기 쉬운 곳 찾아보기', icon: 'bigtext' }
    ]
  },

  ending: {
    stageLabel: '우리 동네 영화관이 달라졌어요!',
    title: 'MISSION COMPLETE!',
    sub: '접근성 아이템 3개를 모두 찾았어요!',
    message: '사람마다 영화를 보고, 듣고, 즐기는 방법은 달라요.\n방법이 다양해지면 더 많은 관객이 함께 즐길 수 있어요.',
    next: '우리 동네도 한번 떠올려볼까요?',
    replay: '다시 모험하기',
    items: '내가 찾은 아이템 보기'
  }
});
