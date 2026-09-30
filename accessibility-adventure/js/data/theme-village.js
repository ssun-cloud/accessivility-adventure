/* =========================================================
 * data/theme-village.js — 기본 버전: 마을축제
 * ---------------------------------------------------------
 * ✏️ 문구를 고치려면 이 파일만 수정하면 됩니다.
 *    - 줄바꿈은 \n 으로 넣습니다.
 *    - choices 중 정답 하나에 correct: true 를 붙입니다.
 *    - scene 은 이미 만들어진 장면 3종 중에서 고릅니다.
 *        'entrance'  : 입구 계단 → 경사로가 생기는 장면
 *        'board'     : 소리 안내 → 글자(전광판/자막)가 켜지는 장면
 *        'infopoint' : 실내 안내판 → 여러 방법의 정보가 나타나는 장면
 *    - icon 이름은 js/art/pixel.js 의 ICONS 목록에서 고릅니다.
 * ========================================================= */
AAG.registerTheme({
  id: 'village',
  label: '마을축제',
  campaign: '우리 동네 접근성 캠페인 (마을축제)',

  title: '우리 동네 접근성 모험',
  subtitle: '동네를 여행하며 접근성 아이템 3개를 찾아보세요!',
  intro: '우리 동네를 여행하려는데\n곳곳에서 길이 막혔어요!\n접근성 아이템 3개를 찾아\n길을 열어볼까요?',
  startButton: '모험 시작!',

  /* 시작 화면과 이동 중에 보이는 여행 경로 */
  route: [
    { icon: 'home', label: '집' },
    { icon: 'shop', label: '가게' },
    { icon: 'bus', label: '정류장' },
    { icon: 'cup', label: '카페' },
    { icon: 'flag', label: '축제 광장' }
  ],

  /* 동네 풍경(스테이지 사이 건물, 도착지) */
  world: {
    home: '우리 집',
    fillers: ['세탁소', '꽃집'],
    goal: '우리 동네 축제',
    poster: '동네축제'
  },

  stages: [
    {
      scene: 'entrance',
      title: '가게에 들어가고 싶어요!',
      place: { sign: '동네상회', style: 'shop' },
      travel: '가게로 가는 길이에요',
      lead: '어? 입구에 계단이 있네요.',
      question: '더 많은 사람이 편하게 드나들려면\n무엇이 있으면 좋을까요?',
      wrong: '이 방법으로는 지나가기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '경사로', icon: 'ramp', correct: true },
        { label: '더 높은 계단', icon: 'stairs', hint: '계단이 높아지면 오르내리기가 더 힘들어져요.' },
        { label: '작은 출입문', icon: 'door', hint: '문이 작아지면 드나들 수 있는 사람이 줄어들어요.' },
        { label: '미끄러운 발판', icon: 'slip', hint: '미끄러우면 누구든 넘어지기 쉬워요.' }
      ],
      solved: '뿅! 가게 앞에 경사로가 생겼어요.',
      item: {
        name: '경사로', icon: 'ramp',
        desc: '경사로가 있으면 휠체어, 유아차 등\n바퀴로 이동하는 사람도 이용하기 편해져요.',
        note: '무거운 짐수레를 끄는 사람, 캐리어를 든 여행자에게도 편한 길이에요.'
      },
      a11y: {
        before: '가게 입구 앞에 계단 세 칸이 있습니다.',
        after: '가게 입구 옆에 손잡이가 달린 완만한 경사로가 생겼습니다.'
      }
    },
    {
      scene: 'board',
      variant: 'busstop',
      title: '중요한 안내를 놓쳤어요!',
      place: { sign: '마을버스', route: '07' },
      travel: '버스정류장으로 가요',
      sound: '띵동~',
      lead: '안내방송이 나왔어요.',
      question: '소리를 듣기 어려운 사람이나 상황에서도\n내용을 알 수 있으려면 무엇이 있으면 좋을까요?',
      wrong: '이 방법으로는 안내 내용을 알기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '글자로 보여주는 안내', icon: 'text', correct: true },
        { label: '소리를 더 크게 틀기', icon: 'loud', hint: '소리만 커지면 여전히 들어야만 알 수 있어요.' },
        { label: '안내판을 더 높이 달기', icon: 'up', hint: '너무 높으면 보기가 더 어려워져요.' },
        { label: '조명을 어둡게 하기', icon: 'dark', hint: '어두우면 안내를 보기가 더 어려워요.' }
      ],
      message: '다음 버스는 3분 뒤 도착합니다.',
      solved: '전광판이 켜졌어요! 이제 글자로도 볼 수 있어요.',
      item: {
        name: '문자 안내', icon: 'text',
        desc: '소리로 전하는 정보를 글자로도 알려주면\n정보를 확인할 수 있는 방법이 하나 더 생겨요.',
        note: '시끄러운 축제 현장, 이어폰을 낀 사람, 한국어 듣기가 낯선 사람에게도 도움이 돼요.'
      },
      a11y: {
        before: '버스정류장 스피커에서 안내방송이 나오지만 전광판은 꺼져 있습니다.',
        after: '정류장 전광판이 켜져서 “다음 버스는 3분 뒤 도착합니다”라는 글자가 흐릅니다.'
      }
    },
    {
      scene: 'infopoint',
      variant: 'cafe',
      title: '메뉴를 어떻게 확인하지?',
      place: { sign: '골목카페', board: 'MENU', stand: 'MENU' },
      travel: '카페에 가 볼까요?',
      lead: '메뉴판에 작은 글씨와 그림만 있어요.',
      question: '메뉴판을 눈으로 보기 어려운 사람도\n메뉴를 확인할 수 있는 방법은 무엇일까요?',
      wrong: '이 방법으로는 메뉴를 확인하기 어려울 것 같아요.\n다른 아이템을 골라볼까요?',
      choices: [
        { label: '점자·음성 등 여러 방법으로 알려주기', icon: 'multi', correct: true },
        { label: '메뉴판을 더 높이 붙이기', icon: 'up', hint: '높이 붙이면 가까이 보거나 만지기 더 어려워요.' },
        { label: '그림을 더 작게 만들기', icon: 'small', hint: '그림이 작아지면 알아보기 더 어려워요.' },
        { label: '조명을 끄기', icon: 'dark', hint: '어두우면 누구나 메뉴를 보기 어려워요.' }
      ],
      menu: [
        { name: '아메리카노', price: '3,000' },
        { name: '카페라테', price: '3,500' },
        { name: '유자차', price: '4,000' },
        { name: '딸기우유', price: '4,000' }
      ],
      /* 정답을 고르면 차례로 나타나는 방법들 (icon: braille / speaker / bigtext / staff / headphones / cards / cc) */
      methods: [
        { icon: 'braille', label: '점자 메뉴' },
        { icon: 'speaker', label: '메뉴 듣기', say: '아메리카노, 카페라테, 유자차…' },
        { icon: 'bigtext', label: '큰 글씨 메뉴', show: '라떼 3,500' },
        { icon: 'staff', label: '직원 안내', say: '메뉴를 읽어 드릴까요?' }
      ],
      solved: '메뉴를 확인하는 방법이 여러 가지로 늘었어요!',
      item: {
        name: '다양한 방법으로 제공하는 정보', short: '다양한 정보', icon: 'multi',
        desc: '같은 정보를 글자, 점자, 음성처럼\n여러 방법으로 확인할 수 있으면 좋아요.',
        note: '한 가지 방법만 정답은 아니에요. 큰 글씨, 음성, 직원 안내처럼 고를 수 있는 방법이 많을수록 더 많은 사람이 이용해요.'
      },
      a11y: {
        before: '카페 벽에 작은 글씨와 그림으로만 된 메뉴판이 있습니다.',
        after: '메뉴판 곁에 점자 메뉴, 메뉴 듣기 스피커, 큰 글씨 메뉴가 생기고 직원이 메뉴를 읽어 주겠다고 말합니다.'
      }
    }
  ],

  ending: {
    stageLabel: '우리 동네가 달라졌어요!',
    title: 'MISSION COMPLETE!',
    sub: '접근성 아이템 3개를 모두 찾았어요!',
    message: '사람마다 이동하고, 보고, 듣고, 정보를 확인하는 방법은 달라요.\n방법이 다양해지면 더 많은 사람이 함께 이용할 수 있어요.',
    next: '우리 동네도 한번 떠올려볼까요?',
    replay: '다시 모험하기',
    items: '내가 찾은 아이템 보기'
  }
});
