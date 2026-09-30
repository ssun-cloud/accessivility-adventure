/* =========================================================
 * data/theme-school.js — 학교 장애이해교육 버전
 * 흐름 : 교실(경사로) → 수업자료(자막·글자) → 의사소통
 * 주소 끝에 #school 을 붙이면 이 버전으로 시작합니다.
 * ========================================================= */
AAG.registerTheme({
  id: 'school',
  label: '학교 교육',
  campaign: '학교 장애이해교육',

  title: '우리 동네 접근성 모험',
  subtitle: '우리 학교의 접근성을 찾아요!',
  intro: '오늘은 우리 반 발표회 날!\n그런데 학교 가는 길 곳곳이 막혔어요.\n접근성 아이템 3개를 찾아\n모두 함께 발표회에 가 볼까요?',
  startButton: '모험 시작!',

  route: [
    { icon: 'home', label: '집' },
    { icon: 'school', label: '학교 현관' },
    { icon: 'screen', label: '수업 영상' },
    { icon: 'cards', label: '교실' },
    { icon: 'flag', label: '발표회' }
  ],

  world: { home: '우리 집', fillers: ['문구점', '분식집'], goal: '우리 반 발표회', poster: '발표회' },

  stages: [
    {
      scene: 'entrance',
      title: '학교에 들어가고 싶어요!',
      place: { sign: '우리 학교', style: 'school' },
      travel: '학교로 가는 길이에요',
      lead: '어? 학교 현관에 계단이 있네요.',
      question: '모든 친구가 편하게 드나들려면\n무엇이 있으면 좋을까요?',
      wrong: '이 방법으로는 지나가기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '경사로', icon: 'ramp', correct: true },
        { label: '더 높은 계단', icon: 'stairs', hint: '계단이 높아지면 오르내리기가 더 힘들어져요.' },
        { label: '작은 출입문', icon: 'door', hint: '문이 작아지면 드나들 수 있는 사람이 줄어들어요.' },
        { label: '미끄러운 발판', icon: 'slip', hint: '미끄러우면 누구든 넘어지기 쉬워요.' }
      ],
      solved: '뿅! 학교 현관에 경사로가 생겼어요.',
      item: {
        name: '경사로', icon: 'ramp',
        desc: '경사로가 있으면 휠체어, 유아차 등\n바퀴로 이동하는 사람도 학교에 오기 편해져요.',
        note: '다리를 다친 친구, 급식 수레를 옮기는 분에게도 편한 길이에요.'
      },
      a11y: { before: '학교 현관 앞에 계단 세 칸이 있습니다.', after: '학교 현관 옆에 손잡이가 달린 경사로가 생겼습니다.' }
    },
    {
      scene: 'board',
      variant: 'screen',
      title: '선생님 설명을 놓쳤어요!',
      place: { sign: '야외 과학 수업' },
      travel: '야외 수업 장소로 가요',
      sound: '♪ 설명 소리',
      lead: '수업 영상에서 설명이 나오고 있어요.',
      question: '소리를 듣기 어려운 친구나 상황에서도\n설명을 알 수 있으려면 무엇이 있으면 좋을까요?',
      wrong: '이 방법으로는 설명을 알기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '글자로 보여주는 자막', icon: 'cc', correct: true },
        { label: '소리를 더 크게 틀기', icon: 'loud', hint: '소리만 커지면 여전히 들어야만 알 수 있어요.' },
        { label: '화면을 더 높이 달기', icon: 'up', hint: '너무 높으면 보기가 더 어려워져요.' },
        { label: '영상을 더 빨리 틀기', icon: 'fast', hint: '빨라지면 누구든 따라가기 어려워요.' }
      ],
      message: '바닷물이 햇빛에 데워지면 수증기가 되어 하늘로 올라가요.',
      solved: '화면에 자막이 나타났어요!',
      item: {
        name: '자막·글자 자료', short: '글자 자료', icon: 'cc',
        desc: '말로 하는 설명을 글자로도 보여주면\n더 많은 친구가 수업 내용을 알 수 있어요.',
        note: '시끄러운 교실, 한국어가 아직 낯선 친구, 다시 보고 싶은 친구에게도 도움이 돼요.'
      },
      a11y: { before: '야외 화면에서 수업 영상이 나오고 설명 소리만 들립니다.', after: '화면 아래에 설명 자막이 나타났습니다.' }
    },
    {
      scene: 'infopoint',
      variant: 'classroom',
      title: '어떻게 이야기하지?',
      place: { sign: '3학년 2반', stand: 'CLASS' },
      travel: '교실에 들어가 볼까요?',
      boardLines: ['모둠 발표 주제 정하기', '1. 우리 동네   2. 좋아하는 것'],
      lead: '모둠 친구와 발표 주제를 정하려고 해요.',
      question: '말 대신 다른 방법으로 이야기하는 친구도 있어요.\n함께 이야기하려면 어떻게 하면 좋을까요?',
      wrong: '이 방법으로는 함께 이야기하기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '그림카드·글자판 등 여러 방법으로 이야기하기', icon: 'cards', correct: true },
        { label: '더 크고 빠르게 말하기', icon: 'loud', hint: '크고 빠른 말은 오히려 알아듣기 어려워요.' },
        { label: '칠판에 더 작게 적기', icon: 'small', hint: '작은 글씨는 알아보기 어려워요.' },
        { label: '대답을 기다리지 않고 넘어가기', icon: 'fast', hint: '천천히 기다려 주면 생각을 전할 수 있어요.' }
      ],
      methods: [
        { icon: 'cards', label: '그림카드' },
        { icon: 'bigtext', label: '글자판', show: '좋아요 / 싫어요' },
        { icon: 'speaker', label: '의사소통 앱', say: '나는 동물 주제가 좋아!' },
        { icon: 'staff', label: '천천히 기다리기', say: '천천히 말해도 괜찮아.' }
      ],
      solved: '이야기하는 방법이 여러 가지로 늘었어요!',
      item: {
        name: '다양한 의사소통', icon: 'cards',
        desc: '말, 글자, 그림, 몸짓처럼\n이야기하는 방법은 여러 가지예요.',
        note: '서로의 방법을 알고 기다려 주면 모두가 대화에 참여할 수 있어요.'
      },
      a11y: { before: '교실 칠판에 작은 글씨로 발표 주제가 적혀 있습니다.', after: '그림카드, 글자판, 의사소통 앱이 생기고 선생님이 천천히 기다려 줍니다.' }
    }
  ],

  campaignFlow: {
    missionBody: '내일 학교에 가면\n평소에는 지나쳤던 입구, 안내판, 교실과 복도를 한번 살펴보세요.',
    doneSub: '내일 학교에 가면\n평소에는 지나쳤던 입구, 안내판, 교실과 복도를 한번 살펴보세요.',
    memory: [
      { key: 'movement', label: '이동하기 편한 길', icon: 'ramp' },
      { key: 'text_material', label: '글자로도 보는 수업 설명', icon: 'cc' },
      { key: 'communication', label: '여러 방법으로 이야기하기', icon: 'cards' },
      { key: 'all', label: '모두 기억에 남아요', icon: 'star' }
    ],
    missions: [
      { key: 'mission_step_free', text: '우리 학교에서 계단 없이 다닐 수 있는 길 찾아보기', icon: 'ramp' },
      { key: 'mission_text_material', text: '말과 글자로 함께 설명하는 수업 자료 찾아보기', icon: 'cc' },
      { key: 'mission_communication', text: '그림이나 몸짓으로도 친구와 이야기해 보기', icon: 'cards' },
      { key: 'mission_tactile', text: '학교 가는 길의 점자블록을 찾아보고, 그 위가 비어 있는지 살펴보기', icon: 'tactile' },
      { key: 'mission_clear_sign', text: '알아보기 쉬운 교내 안내판 찾아보기', icon: 'bigtext' }
    ],
    doneKey: '게임에서 찾은 접근성,\n이제 우리 학교와 동네에서도 찾아보세요.'
  },

  ending: {
    stageLabel: '우리 학교가 달라졌어요!',
    title: 'MISSION COMPLETE!',
    sub: '접근성 아이템 3개를 모두 찾았어요!',
    message: '친구마다 이동하고, 배우고, 이야기하는 방법은 달라요.\n방법이 다양해지면 모두가 함께 배울 수 있어요.',
    next: '우리 동네도 한번 떠올려볼까요?',
    replay: '다시 모험하기',
    items: '내가 찾은 아이템 보기'
  }
});
