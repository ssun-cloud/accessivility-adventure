/**
 * 〈우리 동네 접근성 모험〉 보너스 미션(캠페인 참여) 저장용 Google Apps Script  — v2
 * -----------------------------------------------------------------
 * 1) 새 Google 스프레드시트 → 확장 프로그램 → Apps Script 에 이 코드를 통째로 붙여 넣습니다.
 * 2) 함수 목록에서 setup 을 골라 ▶ 실행 (처음 한 번, 권한 허용)
 *    → '참여기록', '추천장소', '추첨응모', '집계' 시트가 만들어집니다.
 * 3) 배포 → 새 배포 → 유형: 웹 앱 / 실행 사용자: 나 / 액세스 권한: 모든 사용자
 *    → 웹 앱 URL(…/exec)을 게임의 js/data/campaign.js 의 endpoint 에 붙여 넣습니다.
 *
 * 시트 구성
 *  - 참여기록 : 보너스 미션을 끝낸 모든 사람 1줄씩 (개인정보 없음)
 *  - 추천장소 : '떠오르는 장소가 있어요'를 고른 사람만 (개인정보 없음)
 *  - 추첨응모 : 경품 추첨에 참여한 사람만 (이름·연락처 — 담당자만 보기)
 *  - 집계     : 수식으로 자동 계산
 *
 * ※ FEATURES 의 key 는 게임의 js/data/campaign.js 의 features 와 같아야 합니다.
 * ※ 캠페인이 끝나면 deletePrizeData 를 실행해 추첨응모 개인정보를 지우세요.
 */

const SHEET_LOG = '참여기록';
const SHEET_PLACES = '추천장소';
const SHEET_PRIZE = '추첨응모';
const SHEET_SUMMARY = '집계';

const FEATURES = [
  ['step_free', '들어가기 편함'],
  ['wide_space', '안에서 이동 편함'],
  ['tactile_paving', '점자블록 이어짐'],
  ['clear_sign', '안내 보기 쉬움'],
  ['sound_text', '소리+글자 안내'],
  ['menu_multi', '메뉴·정보 여러 방법'],
  ['staff_help', '직원 안내'],
  ['restroom', '화장실 이용'],
  ['rest_space', '앉아 쉴 자리'],
  ['other', '기타']
];

const LOG_HEADERS = ['응답ID', '참여일시', '캠페인명', '버전', '기억에 남은 접근성(값)', '기억에 남은 접근성']
  .concat(['생활 속 접근성'])
  .concat(FEATURES.map(f => '생활: ' + f[1]))
  .concat(['생활 기타', '장소 추천', '오늘의 미션(값)', '오늘의 미션', '미션 카드 저장', '추첨 참여']);
const PLACE_HEADERS = ['응답ID', '참여일시', '캠페인명', '버전', '추천 장소명', '지역·동네', '편했던 점']
  .concat(FEATURES.map(f => '장소: ' + f[1]))
  .concat(['기타 의견', '장소키(중복확인용)', '검토 상태', '검토 메모']);
const PRIZE_HEADERS = ['응답ID', '참여일시', '캠페인명', '이름·닉네임', '연락처', '개인정보 동의', '동의 문구 버전', '같은 번호', '당첨', '안내 완료'];

/* ---------- 처음 한 번 실행 ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreate_(ss, SHEET_LOG, LOG_HEADERS);
  getOrCreate_(ss, SHEET_PLACES, PLACE_HEADERS);
  getOrCreate_(ss, SHEET_PRIZE, PRIZE_HEADERS).setTabColor('#e0603f');
  buildSummary_(ss);
  const first = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 4) ss.deleteSheet(first);
}

function getOrCreate_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#fff1c9');
    sh.setFrozenRows(1);
  }
  return sh;
}

function columnLetter_(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function col_(headers, name) { return columnLetter_(headers.indexOf(name) + 1); }

/* ---------- 집계 시트 (수식이라 자동 갱신) ---------- */
function buildSummary_(ss) {
  const sh = ss.getSheetByName(SHEET_SUMMARY) || ss.insertSheet(SHEET_SUMMARY, 0);
  sh.clear();
  const L = "'" + SHEET_LOG + "'!", P = "'" + SHEET_PLACES + "'!";
  const r = (sheet, headers, name) => { const c = col_(headers, name); return sheet + c + '2:' + c; };

  sh.getRange('A1').setValue('우리 동네 접근성 모험 · 보너스 미션 집계').setFontSize(14).setFontWeight('bold');
  const rows = [
    ['전체 참여자 수', '=COUNTA(' + r(L, LOG_HEADERS, '응답ID') + ')'],
    ['장소를 추천한 사람', '=COUNTIF(' + r(L, LOG_HEADERS, '장소 추천') + ',"예")'],
    ['오늘의 미션을 받은 사람', '=COUNTIF(' + r(L, LOG_HEADERS, '장소 추천') + ',"아니오")'],
    ['미션 카드를 저장한 사람', '=COUNTIF(' + r(L, LOG_HEADERS, '미션 카드 저장') + ',"예")'],
    ['추천된 장소 수(중복 제외)', '=IFERROR(COUNTUNIQUE(' + r(P, PLACE_HEADERS, '장소키(중복확인용)') + '),0)'],
    ['경품 추첨 참여자 수', '=COUNTIF(' + r(L, LOG_HEADERS, '추첨 참여') + ',"예")']
  ];
  sh.getRange(3, 1, rows.length, 2).setValues(rows);

  // 가장 기억에 남은 접근성
  sh.getRange('A11').setValue('가장 기억에 남은 접근성').setFontWeight('bold');
  sh.getRange('A12').setFormula('=IFERROR(QUERY({' + r(L, LOG_HEADERS, '기억에 남은 접근성') + ',' + r(L, LOG_HEADERS, '응답ID') + '},"select Col1, count(Col2) where Col1 is not null and Col1 <> \'\' group by Col1 order by count(Col2) desc label Col1 \'항목\', count(Col2) \'응답 수\'",0),"아직 없음")');

  // 생활 속 접근성 · 추천 장소의 편했던 점 (요소별, 많은 순)
  sh.getRange('D2').setValue('생활 속 접근성 (공감한 수)').setFontWeight('bold');
  sh.getRange('G2').setValue('추천 장소에서 편했던 점').setFontWeight('bold');
  const lifeRows = FEATURES.map(f => [f[1], '=COUNTIF(' + r(L, LOG_HEADERS, '생활: ' + f[1]) + ',1)']);
  const placeRows = FEATURES.map(f => [f[1], '=COUNTIF(' + r(P, PLACE_HEADERS, '장소: ' + f[1]) + ',1)']);
  sh.getRange(30, 4, lifeRows.length, 2).setValues(lifeRows);
  sh.getRange(30, 7, placeRows.length, 2).setValues(placeRows);
  sh.getRange('D29').setValue('(아래는 원본 — 수정하지 마세요)').setFontColor('#999999');
  sh.getRange('D3').setFormula('=SORT(D30:E' + (29 + lifeRows.length) + ',2,FALSE)');
  sh.getRange('G3').setFormula('=SORT(G30:H' + (29 + placeRows.length) + ',2,FALSE)');

  // 오늘의 미션 분포
  sh.getRange('J2').setValue('오늘의 미션').setFontWeight('bold');
  sh.getRange('J3').setFormula('=IFERROR(QUERY({' + r(L, LOG_HEADERS, '오늘의 미션') + ',' + r(L, LOG_HEADERS, '응답ID') + '},"select Col1, count(Col2) where Col1 is not null and Col1 <> \'\' group by Col1 order by count(Col2) desc label Col1 \'미션\', count(Col2) \'받은 수\'",0),"아직 없음")');

  // 지역별 추천 · 여러 번 추천된 장소
  sh.getRange('M2').setValue('지역별 추천 수').setFontWeight('bold');
  sh.getRange('M3').setFormula('=IFERROR(QUERY({' + r(P, PLACE_HEADERS, '지역·동네') + ',' + r(P, PLACE_HEADERS, '응답ID') + '},"select Col1, count(Col2) where Col1 is not null group by Col1 order by count(Col2) desc label Col1 \'지역·동네\', count(Col2) \'추천 수\'",0),"아직 없음")');
  sh.getRange('P2').setValue('여러 번 추천된 장소').setFontWeight('bold');
  sh.getRange('P3').setFormula('=IFERROR(QUERY(QUERY({' + r(P, PLACE_HEADERS, '장소키(중복확인용)') + ',' + r(P, PLACE_HEADERS, '추천 장소명') + ',' + r(P, PLACE_HEADERS, '지역·동네') + '},"select Col1, max(Col2), max(Col3), count(Col2) where Col1 is not null group by Col1",0),"select Col2, Col3, Col4 where Col4 > 1 order by Col4 desc label Col2 \'장소\', Col3 \'지역\', Col4 \'추천 수\'",0),"아직 없음")');

  sh.setColumnWidth(1, 200); sh.setColumnWidth(4, 170); sh.setColumnWidth(7, 170); sh.setColumnWidth(10, 260); sh.setColumnWidth(13, 150); sh.setColumnWidth(16, 160);
  sh.getRange('A27').setValue('※ 추첨 참여자 목록은 개인정보 보호를 위해 "' + SHEET_PRIZE + '" 시트에서만 확인하세요.').setFontColor('#666666');
}

/* ---------- 게임에서 보내는 데이터 받기 ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true });                         // 스팸(숨은 칸 입력) 무시
    if (!d.id) return json_({ ok: false, error: 'missing id' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const log = getOrCreate_(ss, SHEET_LOG, LOG_HEADERS);
    const places = getOrCreate_(ss, SHEET_PLACES, PLACE_HEADERS);
    const prize = getOrCreate_(ss, SHEET_PRIZE, PRIZE_HEADERS);

    // 같은 응답ID는 한 번만 저장 (다시 보내기 대비)
    if (log.getLastRow() > 1) {
      const found = log.getRange(2, 1, log.getLastRow() - 1, 1).createTextFinder(String(d.id)).matchEntireCell(true).findNext();
      if (found) return json_({ ok: true, duplicate: true });
    }

    const clean = v => String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, 200);   // 수식 주입 방지
    const when = clean(d.submittedAt || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'));
    const yn = v => (v ? '예' : '아니오');
    const life = d.everyday || {};
    log.appendRow([clean(d.id), when, clean(d.campaign), clean(d.theme), clean(d.memory), clean(d.memoryLabel), clean((d.everydayLabels || []).join(', '))]
      .concat(FEATURES.map(f => (life[f[0]] ? 1 : 0)))
      .concat([clean(d.everydayOther), yn(d.hasPlace), clean(d.mission), clean(d.missionText), yn(d.missionSaved), yn(d.prize && d.consent)]));

    if (d.hasPlace && d.place) {
      const pf = d.placeFeatures || {};
      const key = (String(d.place) + '|' + String(d.area)).toLowerCase().replace(/\s+/g, '');
      places.appendRow([clean(d.id), when, clean(d.campaign), clean(d.theme), clean(d.place), clean(d.area), clean((d.placeFeatureLabels || []).join(', '))]
        .concat(FEATURES.map(f => (pf[f[0]] ? 1 : 0)))
        .concat([clean(d.placeOther), clean(key), '확인 전', '']));
    }

    if (d.prize && d.consent) {
      const phone = String(d.contact || '').replace(/[^0-9-]/g, '');
      const digits = phone.replace(/-/g, '');
      let dup = '';
      if (prize.getLastRow() > 1) {
        const prev = prize.getRange(2, 5, prize.getLastRow() - 1, 1).getValues().map(r => String(r[0]).replace(/[^0-9]/g, ''));
        if (prev.includes(digits)) dup = '중복';
      }
      prize.appendRow([clean(d.id), when, clean(d.campaign), clean(d.name), "'" + phone, '동의', clean(d.consentVersion), dup, '', '']);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) { /* 무시 */ }
  }
}

function doGet() { return json_({ ok: true, message: '우리 동네 접근성 모험 저장 서버가 켜져 있어요.' }); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- 캠페인 종료 후: 추첨 응모 개인정보 지우기 ---------- */
function deletePrizeData() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PRIZE);
  if (sh && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
}

/* ---------- 연결 확인용 : 편집기에서 실행하면 테스트 행이 들어갑니다 ---------- */
function testInsert() {
  const fake = { postData: { contents: JSON.stringify({
    id: 'TEST-' + Date.now(), submittedAt: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    campaign: '테스트', theme: 'village', memory: 'movement', memoryLabel: '이동하기 편한 길',
    everyday: { step_free: 1, rest_space: 1 }, everydayLabels: ['들어가기 편했어요', '쉬어갈 공간이 있었어요'], everydayOther: '',
    hasPlace: true, place: '골목카페', area: '종로구 서촌', placeFeatures: { step_free: 1 }, placeFeatureLabels: ['들어가기 편했어요'], placeOther: '',
    mission: '', missionText: '', missionSaved: false, prize: false
  }) } };
  Logger.log(doPost(fake).getContent());
}
