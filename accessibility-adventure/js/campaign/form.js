/* =========================================================
 * campaign/form.js — 게임 뒤 '보너스 미션' (온라인 캠페인 참여)
 * ① 가장 기억에 남은 것 → ② 이런 것도 접근성이에요 → ③ 우리 동네에도 있을까요?
 *    ├ 있어요 → 장소 기록   └ 아직 없어요 → 오늘의 접근성 미션
 * → ④ 경품 추첨(선택) → 완료
 * 문구·선택지는 js/data/campaign.js (버전별 기억·미션은 각 테마의 campaignFlow)에서 바꿉니다.
 * ========================================================= */
(function (A) {
  'use strict';
  const U = A.util, esc = U.esc;
  const br = s => U.lines(s).map(esc).join('<br>');
  const icon = (name, cls) => '<img class="' + (cls || 'px-icon') + '" src="' + A.iconURL(name, 6) + '" alt="" draggable="false">';
  let root, ctx = {};

  const F = A.campaignForm = {};
  const C = () => A.campaign;
  const flow = () => (ctx.theme && ctx.theme.campaignFlow) || {};
  const memoryOptions = () => flow().memory || C().memory.options;
  const missionList = () => flow().missions || C().mission.list;

  F.open = function (theme, found, opts) {
    ctx = {
      theme, found, opts: opts || {},
      s: { memory: null, everyday: [], everydayOther: '', hasPlace: null, place: '', area: '', placeFeatures: [], placeOther: '',
        mission: null, missionSaved: false, missionRerolls: 0, prize: null, name: '', contact: '', consent: false }
    };
    root = document.getElementById('campaign');
    root.hidden = false;
    A.ui.el.complete.hidden = true;
    document.getElementById('app').setAttribute('aria-hidden', 'true');
    renderMemory();
  };
  F.close = function () {
    if (!root) return;
    root.hidden = true; root.innerHTML = '';
    document.getElementById('app').removeAttribute('aria-hidden');
  };

  /* ---------- 공통 틀 ---------- */
  function sheet(inner, announce) {
    root.innerHTML = '<div class="cp-sheet">' + inner + '</div>';
    root.querySelector('.cp-sheet').scrollTop = 0;
    requestAnimationFrame(() => { const h = root.querySelector('#cpTitle'); if (h) h.focus({ preventScroll: true }); });
    if (announce) A.ui.announce(announce);
    const back = root.querySelector('[data-back]');
    if (back) back.addEventListener('click', () => { A.audio.play('tap'); STEPS[back.dataset.back](); });
  }
  function head(step, title, lead, backTo) {
    const labels = C().steps || [];
    const pips = labels.map((l, i) => '<li class="' + (i < step ? 'is-done' : i === step ? 'is-now' : '') + '"' + (i === step ? ' aria-current="step"' : '') + '><span class="pip" aria-hidden="true"></span><span class="pip-label">' + esc(l) + '</span></li>').join('');
    return '<div class="cp-top">' +
        (backTo ? '<button type="button" class="cp-back" data-back="' + backTo + '"><span aria-hidden="true">←</span> ' + esc(C().back || '이전') + '</button>' : '<span></span>') +
        '<ol class="cp-steps" aria-label="보너스 미션 진행 ' + (step + 1) + '/' + labels.length + '">' + pips + '</ol>' +
      '</div>' +
      '<header class="cp-head">' +
        '<img class="face" src="' + A.ui.faceURL + '" alt="">' +
        '<div><p class="eyebrow">BONUS MISSION · 동네 탐험 기록</p>' +
        '<h2 id="cpTitle" tabindex="-1">' + esc(title) + '</h2>' +
        (lead ? '<p class="cp-lead">' + br(lead) + '</p>' : '') + '</div>' +
      '</header>';
  }
  const previewNote = () => A.sheets.isPreview() ? '<p class="cp-preview" role="note"><strong>미리보기 모드</strong> · 저장 주소가 연결되지 않아 입력한 내용은 어디에도 저장되지 않아요.</p>' : '';

  /* 카드형 체크 목록 (②·③-1 공용) */
  function featureTiles(prefix, checked) {
    return C().features.map((f, i) =>
      '<label class="feat"><input type="checkbox" name="' + prefix + '" value="' + esc(f.key) + '" id="' + prefix + i + '"' +
      (checked.includes(f.key) ? ' checked' : '') + (f.other ? ' data-other="1"' : '') + '>' +
      '<span class="feat-box"><span class="feat-icon">' + icon(f.icon || 'star') + '</span><span class="feat-label">' + esc(f.label) + '</span>' +
      '<span class="feat-check" aria-hidden="true"></span></span></label>').join('');
  }
  function otherField(id, value) {
    return '<div class="field other-field" id="' + id + 'Wrap"' + (value ? '' : ' hidden') + '>' +
      '<label for="' + id + '">기타 내용</label>' +
      '<input id="' + id + '" type="text" maxlength="100" autocomplete="off" value="' + esc(value || '') + '" placeholder="' + esc(C().otherPlaceholder) + '" aria-describedby="' + id + 'Err">' +
      '<p class="err" id="' + id + 'Err"></p></div>';
  }
  function bindOther(prefix, id) {
    const box = root.querySelector('input[name="' + prefix + '"][data-other]');
    if (!box) return;
    const wrap = root.querySelector('#' + id + 'Wrap');
    wrap.hidden = !box.checked;
    box.addEventListener('change', () => { wrap.hidden = !box.checked; if (box.checked) root.querySelector('#' + id).focus(); });
  }
  const checkedValues = prefix => Array.from(root.querySelectorAll('input[name="' + prefix + '"]:checked')).map(i => i.value);

  /* ---------- ① 가장 기억에 남은 것 ---------- */
  function renderMemory() {
    const M = C().memory, s = ctx.s;
    const items = (ctx.found || []).map(it => '<li>' + icon(it.icon) + '<span>' + esc(it.short || it.name) + '</span></li>').join('');
    sheet(
      head(0, M.title, M.lead) +
      '<ul class="end-items cp-found" aria-label="오늘 찾은 접근성 아이템">' + items + '</ul>' +
      '<div class="pick-grid" role="group" aria-labelledby="cpTitle">' +
        memoryOptions().map(o => '<button type="button" class="pick" data-key="' + esc(o.key) + '" aria-pressed="' + (s.memory === o.key) + '">' +
          '<span class="pick-icon">' + icon(o.icon || 'star') + '</span><span class="pick-label">' + esc(o.label) + '</span><span class="pick-check" aria-hidden="true"></span></button>').join('') +
      '</div>' + previewNote(),
      M.title
    );
    root.querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => {
      s.memory = b.dataset.key;
      root.querySelectorAll('.pick').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      A.audio.play('pop');
      setTimeout(renderWiden, U.reducedMotion() ? 120 : 420);
    }));
  }

  /* ---------- ② 이런 것도 접근성이에요 ---------- */
  function renderWiden() {
    const W = C().widen, s = ctx.s;
    sheet(
      head(1, W.title, W.lead, 'memory') +
      '<div class="feat-grid" role="group" aria-labelledby="cpTitle">' + featureTiles('everyday', s.everyday) + '</div>' +
      otherField('cpEverydayOther', s.everydayOther) +
      '<div class="cp-actions one"><button type="button" class="btn btn-go" id="cpNext"><span>' + esc(W.next) + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button></div>',
      W.title
    );
    bindOther('everyday', 'cpEverydayOther');
    root.querySelector('#cpNext').addEventListener('click', () => {
      s.everyday = checkedValues('everyday');
      s.everydayOther = s.everyday.includes('other') ? root.querySelector('#cpEverydayOther').value.trim() : '';
      A.audio.play('tap');
      renderFork();
    });
  }

  /* ---------- ③ 우리 동네에도 있을까요? ---------- */
  function renderFork() {
    const K = C().fork;
    sheet(
      head(2, K.title, K.lead, 'widen') +
      '<div class="fork-grid">' +
        '<button type="button" class="fork" id="cpYes"><span class="fork-icon">' + icon('pin') + '</span><span class="fork-label">' + esc(K.yes) + '</span></button>' +
        '<button type="button" class="fork" id="cpNo"><span class="fork-icon">' + icon('flag') + '</span><span class="fork-label">' + esc(K.no) + '</span></button>' +
      '</div>',
      K.title
    );
    root.querySelector('#cpYes').addEventListener('click', () => { ctx.s.hasPlace = true; A.audio.play('pop'); renderPlace(); });
    root.querySelector('#cpNo').addEventListener('click', () => { ctx.s.hasPlace = false; A.audio.play('pop'); renderMission(); });
  }

  /* ---------- ③-1 장소 기록 ---------- */
  function renderPlace() {
    const Cc = C(), P = Cc.placeStep, s = ctx.s;
    const pre = s.placeFeatures.length ? s.placeFeatures : s.everyday;
    sheet(
      head(2, P.title, '', 'fork') +
      '<form id="cpForm" novalidate>' +
        '<div class="field">' +
          '<label for="cpPlace">' + esc(Cc.place.label) + ' <span class="req">필수</span></label>' +
          '<input id="cpPlace" type="text" maxlength="60" autocomplete="off" value="' + esc(s.place) + '" placeholder="' + esc(Cc.place.placeholder) + '" aria-describedby="cpPlaceErr">' +
          '<p class="err" id="cpPlaceErr"></p>' +
        '</div>' +
        '<div class="field">' +
          '<label for="cpArea">' + esc(Cc.area.label) + ' <span class="req">필수</span></label>' +
          (Cc.area.help ? '<p class="field-help" id="cpAreaHelp">' + esc(Cc.area.help) + '</p>' : '') +
          '<input id="cpArea" type="text" maxlength="40" autocomplete="off" list="cpAreaList" value="' + esc(s.area) + '" placeholder="' + esc(Cc.area.placeholder) + '" aria-describedby="cpAreaHelp cpAreaErr">' +
          '<datalist id="cpAreaList">' + (Cc.area.suggestions || []).map(a => '<option value="' + esc(a) + '">').join('') + '</datalist>' +
          '<p class="err" id="cpAreaErr"></p>' +
        '</div>' +
        '<fieldset class="field" aria-describedby="cpFeatErr cpReassure">' +
          '<legend>' + esc(P.featuresLabel) + ' <span class="req">하나 이상</span></legend>' +
          (pre.length ? '<p class="field-help">' + esc(P.prefillNote) + '</p>' : '') +
          '<div class="feat-grid">' + featureTiles('placeFeat', pre) + '</div>' +
          otherField('cpPlaceOther', s.placeOther || (pre === s.everyday ? s.everydayOther : '')) +
          '<p class="err" id="cpFeatErr"></p>' +
          '<p class="reassure" id="cpReassure">' + br(Cc.reassure) + '</p>' +
        '</fieldset>' +
        '<p class="review-note">' + esc(Cc.reviewNote) + '</p>' +
        '<p class="form-err" id="cpFormErr" role="alert"></p>' +
        '<div class="cp-actions one"><button type="submit" class="btn btn-go"><span>' + esc(P.next) + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button></div>' +
      '</form>',
      P.title
    );
    bindOther('placeFeat', 'cpPlaceOther');
    const form = root.querySelector('#cpForm'), fe = root.querySelector('#cpFormErr');
    form.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => { clearErr(inp); fe.textContent = ''; }));
    form.querySelectorAll('input[name=placeFeat]').forEach(inp => inp.addEventListener('change', () => { setErr('cpFeatErr', ''); fe.textContent = ''; }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const E = Cc.errors, bad = [];
      s.place = root.querySelector('#cpPlace').value.trim();
      s.area = root.querySelector('#cpArea').value.trim();
      s.placeFeatures = checkedValues('placeFeat');
      s.placeOther = s.placeFeatures.includes('other') ? root.querySelector('#cpPlaceOther').value.trim() : '';
      need(bad, s.place.length > 0, 'cpPlaceErr', E.place, '#cpPlace');
      need(bad, s.area.length > 0, 'cpAreaErr', E.area, '#cpArea');
      need(bad, s.placeFeatures.length > 0, 'cpFeatErr', E.features, '#placeFeat0');
      if (s.placeFeatures.includes('other')) need(bad, s.placeOther.length > 0, 'cpPlaceOtherErr', E.other, '#cpPlaceOther');
      if (bad.length) { invalid(bad, fe); return; }
      A.audio.play('pop');
      renderPrize();
    });
  }

  /* ---------- ③-2 오늘의 접근성 미션 ---------- */
  function pickMission(exceptKey) {
    const list = missionList().filter(m => m.key !== exceptKey);
    return list[Math.floor(Math.random() * list.length)];
  }
  function renderMission() {
    const M = C().mission, s = ctx.s;
    if (!s.mission) s.mission = pickMission();
    const m = missionList().find(x => x.key === s.mission.key) || s.mission;
    sheet(
      head(2, M.title, '', 'fork') +
      '<div class="mission-card" id="cpMissionCard">' +
        '<p class="mission-kicker">BONUS MISSION</p>' +
        '<div class="mission-badge">' + icon(m.icon || 'star') + '</div>' +
        '<p class="mission-text" aria-live="polite">' + esc(m.text) + '</p>' +
        '<p class="mission-body">' + br(flow().missionBody || M.body) + '</p>' +
        '<p class="mission-q">' + esc(M.question) + '</p>' +
      '</div>' +
      '<div class="cp-actions">' +
        '<button type="button" class="btn btn-soft" id="cpReroll"><span aria-hidden="true">↻</span> ' + esc(M.reroll) + '</button>' +
        '<button type="button" class="btn btn-soft" id="cpSave">' + esc(M.save) + '</button>' +
      '</div>' +
      '<div class="mission-save" id="cpSaveBox" hidden></div>' +
      '<div class="cp-actions one"><button type="button" class="btn btn-go" id="cpNext"><span>' + esc(M.next) + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button></div>',
      M.title + '. ' + m.text
    );
    root.querySelector('#cpReroll').addEventListener('click', () => {
      s.mission = pickMission(s.mission.key); s.missionRerolls++; s.missionSaved = false;
      A.audio.play('pop'); renderMission();
      const c = root.querySelector('#cpMissionCard'); c.classList.add('is-new');
    });
    root.querySelector('#cpSave').addEventListener('click', () => saveMissionCard(m));
    root.querySelector('#cpNext').addEventListener('click', () => { A.audio.play('tap'); renderPrize(); });
  }

  /* 미션 카드 이미지 만들기 (휴대폰 사진첩에 저장해 가져갈 수 있게) */
  function saveMissionCard(m) {
    const M = C().mission, W = 1080, H = 1350, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    const ink = '#2f2945';
    c.fillStyle = '#79c3ec'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#dbeeef'; c.fillRect(0, H * 0.62, W, H * 0.38);
    // 카드
    const x = 70, y = 110, w = W - 140, h = H - 220;
    c.fillStyle = ink; c.fillRect(x + 12, y + 18, w, h);
    c.fillStyle = ink; c.fillRect(x - 8, y - 8, w + 16, h + 16);
    c.fillStyle = '#fff8ec'; c.fillRect(x, y, w, h);
    c.fillStyle = '#ffd76c'; c.fillRect(x, y, w, 120);
    c.fillStyle = ink; c.fillRect(x, y + 120, w, 8);
    const disp = "'Do Hyeon', 'Noto Sans KR', sans-serif", body = "'Noto Sans KR', sans-serif";
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = ink;
    c.font = "700 44px 'Silkscreen', monospace"; c.fillText('BONUS MISSION', W / 2, y + 62);
    c.font = '66px ' + disp; c.fillText(M.title, W / 2, y + 205);
    // 아이콘
    const iy = y + 360;
    c.fillStyle = ink; c.beginPath(); c.arc(W / 2, iy, 100, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffd76c'; c.beginPath(); c.arc(W / 2, iy, 88, 0, Math.PI * 2); c.fill();
    c.drawImage(A.iconSprite(m.icon || 'star'), W / 2 - 65, iy - 65, 130, 130);
    // 미션 문장 · 안내 (아래 띠 위쪽 공간 안에서)
    const bottom = y + h - 190;
    let ty = iy + 170;
    c.fillStyle = ink; c.font = '60px ' + disp;
    wrap(c, m.text, w - 120).forEach(line => { c.fillText(line, W / 2, ty); ty += 78; });
    ty += 24;
    c.fillStyle = '#5b5074'; c.font = '500 34px ' + body;
    U.lines(flow().missionBody || M.body).forEach(l => wrap(c, l, w - 140).forEach(line => { if (ty < bottom - 60) c.fillText(line, W / 2, ty); ty += 50; }));
    ty += 18;
    c.fillStyle = '#2b8f7c'; c.font = '700 36px ' + body;
    wrap(c, M.question, w - 140).forEach(line => { if (ty < bottom) c.fillText(line, W / 2, ty); ty += 50; });
    // 아래 띠 : 탐험가 + 게임 이름
    c.fillStyle = ink; c.fillRect(x, y + h - 160, w, 6);
    c.fillStyle = '#daf4ed'; c.fillRect(x, y + h - 154, w, 154);
    const hero = A.LOOKS.hero.stand;
    c.drawImage(hero, x + 50, y + h - 146, hero.width * 7, hero.height * 7);
    c.fillStyle = ink; c.font = '46px ' + disp; c.textAlign = 'right';
    c.fillText((ctx.theme && ctx.theme.title) || '우리 동네 접근성 모험', x + w - 50, y + h - 78);
    const url = cv.toDataURL('image/png');
    const box = root.querySelector('#cpSaveBox');
    box.hidden = false;
    box.innerHTML = '<img src="' + url + '" alt="오늘의 접근성 미션 카드: ' + esc(m.text) + '"><p class="field-help">' + esc(M.saveHint) + '</p>';
    try { const a = document.createElement('a'); a.href = url; a.download = '접근성미션_' + m.key + '.png'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* 이미지로 저장 안내 */ }
    ctx.s.missionSaved = true;
    A.audio.play('item');
    box.scrollIntoView({ block: 'nearest', behavior: U.reducedMotion() ? 'auto' : 'smooth' });
  }
  function wrap(c, text, maxW) {
    const words = String(text).split(' '), lines = []; let cur = '';
    words.forEach(wd => {
      const t = cur ? cur + ' ' + wd : wd;
      if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  /* ---------- ④ 경품 추첨 (누구나 선택) ---------- */
  function renderPrize() {
    const Pz = C().prize, s = ctx.s, backTo = s.hasPlace ? 'place' : 'mission';
    if (!Pz.enabled) { submit(); return; }
    const consentRows = (Pz.consentDetail || []).map(r => '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>').join('');
    sheet(
      head(3, Pz.title, Pz.lead, backTo) +
      '<div class="fork-grid">' +
        '<button type="button" class="fork" id="cpJoin" aria-pressed="' + (s.prize === true) + '" aria-controls="cpPrizeForm"><span class="fork-icon">' + icon('star') + '</span><span class="fork-label">' + esc(Pz.optIn) + '</span></button>' +
        '<button type="button" class="fork" id="cpPass"><span class="fork-icon">' + icon('cup') + '</span><span class="fork-label">' + esc(Pz.optOut) + '</span></button>' +
      '</div>' +
      '<form id="cpPrizeForm" class="prize prize-fields"' + (s.prize === true ? '' : ' hidden') + ' novalidate>' +
        '<div class="field"><label for="cpName">' + esc(Pz.nameLabel) + ' <span class="req">필수</span></label>' +
          '<input id="cpName" type="text" maxlength="30" autocomplete="nickname" value="' + esc(s.name) + '" aria-describedby="cpNameErr"><p class="err" id="cpNameErr"></p></div>' +
        '<div class="field"><label for="cpContact">' + esc(Pz.contactLabel) + ' <span class="req">필수</span></label>' +
          '<input id="cpContact" type="tel" inputmode="tel" maxlength="16" autocomplete="tel" value="' + esc(s.contact) + '" placeholder="' + esc(Pz.contactPlaceholder) + '" aria-describedby="cpContactErr cpPrivacy"><p class="err" id="cpContactErr"></p></div>' +
        '<p class="privacy" id="cpPrivacy">' + esc(Pz.privacy) + '</p>' +
        (Pz.minorNote ? '<p class="privacy minor">' + esc(Pz.minorNote) + '</p>' : '') +
        (Pz.requireConsent ?
          '<details class="consent-detail"><summary>개인정보 수집·이용 안내 자세히 보기</summary><table>' + consentRows + '</table></details>' +
          '<label class="check"><input type="checkbox" id="cpConsent"' + (s.consent ? ' checked' : '') + ' aria-describedby="cpConsentErr"><span>' + esc(Pz.consentLabel) + '</span></label>' +
          '<p class="err" id="cpConsentErr"></p>' : '') +
        '<div class="hp" aria-hidden="true"><label for="cpWeb">비워 두세요</label><input id="cpWeb" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<div class="cp-actions one"><button type="submit" class="btn btn-go" id="cpSubmit"><span>' + esc(Pz.submit) + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button></div>' +
      '</form>' +
      '<p class="form-err" id="cpFormErr" role="alert"></p>' + previewNote(),
      Pz.title + ' ' + Pz.lead
    );
    const form = root.querySelector('#cpPrizeForm'), fe = root.querySelector('#cpFormErr');
    root.querySelector('#cpJoin').addEventListener('click', e => {
      s.prize = true; e.currentTarget.setAttribute('aria-pressed', 'true');
      form.hidden = false; A.audio.play('pop'); root.querySelector('#cpName').focus();
    });
    root.querySelector('#cpPass').addEventListener('click', e => {
      s.prize = false; s.name = ''; s.contact = ''; s.consent = false;
      A.audio.play('tap'); submit(e.currentTarget);
    });
    form.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => { clearErr(inp); fe.textContent = ''; }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const E = C().errors, bad = [];
      s.name = root.querySelector('#cpName').value.trim();
      s.contact = root.querySelector('#cpContact').value.trim();
      s.consent = Pz.requireConsent ? root.querySelector('#cpConsent').checked : true;
      s.website = root.querySelector('#cpWeb').value;
      need(bad, s.name.length > 0, 'cpNameErr', E.name, '#cpName');
      const digits = s.contact.replace(/[^0-9]/g, '');
      need(bad, /^0\d{8,10}$/.test(digits), 'cpContactErr', E.contact, '#cpContact');
      if (Pz.requireConsent) need(bad, s.consent, 'cpConsentErr', E.consent, '#cpConsent');
      if (bad.length) { invalid(bad, fe); return; }
      s.contact = digits.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
      submit(root.querySelector('#cpSubmit'));
    });
  }

  /* ---------- 보내기 ---------- */
  async function submit(btn) {
    const fe = root.querySelector('#cpFormErr'), label = btn && btn.querySelector('.fork-label, span');
    const keep = label ? label.textContent : '';
    if (btn) { btn.disabled = true; if (label) label.textContent = '보내는 중…'; }
    const key = JSON.stringify(ctx.s);
    if (!ctx.payload || ctx.payloadKey !== key) { ctx.payload = A.sheets.buildPayload(ctx.theme, ctx.s, memoryOptions(), missionList()); ctx.payloadKey = key; }
    const r = await A.sheets.send(ctx.payload);
    if (r.ok) { A.audio.play('item'); renderDone(r); return; }
    if (btn) { btn.disabled = false; if (label) label.textContent = keep; }
    if (fe) fe.textContent = C().errors.send;
    A.audio.play('hmm');
  }

  /* ---------- 완료 ---------- */
  function renderDone(r) {
    const D = C().done, s = ctx.s;
    const m = !s.hasPlace && s.mission ? (missionList().find(x => x.key === s.mission.key) || s.mission) : null;
    const items = (ctx.found || []).map(it => '<li>' + icon(it.icon) + '<span>' + esc(it.short || it.name) + '</span></li>').join('');
    sheet(
      '<div class="cp-done">' +
        '<div class="done-badge" aria-hidden="true">' + icon('flag') + '</div>' +
        '<h2 id="cpTitle" tabindex="-1">' + esc(D.title) + '</h2>' +
        '<p class="done-key">' + br(flow().doneKey || D.key) + '</p>' +
        '<p class="done-msg">' + br(flow().doneSub || D.sub) + '</p>' +
        (s.hasPlace ? '<p class="done-place">' + icon('pin', 'done-pin') + '<span><strong>' + esc(s.place) + '</strong> · ' + esc(s.area) + '</span></p><p class="done-note">' + esc(D.placeNote) + '</p>' : '') +
        (m ? '<p class="done-mission">' + icon(m.icon || 'star', 'done-pin') + '<span><strong>' + esc(D.missionNote) + '</strong> ' + esc(m.text) + '</span></p>' : '') +
        (s.prize ? '<p class="done-note">경품 추첨에도 응모되었어요.</p>' : '') +
        (r && r.preview ? '<p class="cp-preview" role="note"><strong>미리보기 모드</strong> · 실제로 저장되지는 않았어요.</p>' : '') +
        '<ul class="end-items" aria-label="오늘 찾은 접근성 아이템">' + items + '</ul>' +
        '<div class="cp-actions">' +
          '<button type="button" class="btn btn-go" id="cpReplay"><span>' + esc(D.replay) + '</span><span class="btn-arrow" aria-hidden="true">↻</span></button>' +
          '<button type="button" class="btn btn-soft" id="cpShare">' + esc(D.share) + '</button>' +
        '</div>' +
        '<p class="share-msg" id="cpShareMsg" role="status"></p>' +
      '</div>',
      D.title + ' ' + U.lines(flow().doneKey || D.key).join(' ')
    );
    root.querySelector('#cpReplay').addEventListener('click', () => { F.close(); if (ctx.opts.onReplay) ctx.opts.onReplay(); });
    root.querySelector('#cpShare').addEventListener('click', share);
  }

  async function share() {
    const D = C().done, url = location.href, msg = root.querySelector('#cpShareMsg');
    const data = { title: ctx.theme.title, text: D.shareText, url };
    try { if (navigator.share) { await navigator.share(data); msg.textContent = '공유했어요!'; return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); msg.textContent = '게임 주소를 복사했어요. 메신저에 붙여 넣어 보내 보세요!'; return; } catch (e) { /* 아래로 */ }
    msg.innerHTML = '아래 주소를 길게 눌러 복사해 주세요.<br><input class="share-url" type="text" readonly value="' + esc(url) + '" aria-label="게임 주소">';
    const inp = msg.querySelector('input'); inp.focus(); inp.select();
  }

  /* ---------- 오류 표시 도구 ---------- */
  function setErr(id, msg) {
    const el = root.querySelector('#' + id); if (!el) return;
    el.textContent = msg;
    const field = el.closest('.field, fieldset');
    const input = field && field.querySelector('input[aria-describedby~="' + id + '"]');
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (field) field.classList.toggle('has-err', !!msg);
  }
  function clearErr(inp) {
    const d = (inp.getAttribute('aria-describedby') || '').split(' ').find(x => /Err$/.test(x));
    if (d) setErr(d, '');
  }
  function need(bad, ok, id, msg, sel) { setErr(id, ok ? '' : msg); if (!ok) bad.push(sel); }
  function invalid(bad, fe) {
    A.audio.play('hmm');
    const first = root.querySelector(bad[0]);
    if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center', behavior: U.reducedMotion() ? 'auto' : 'smooth' }); }
    fe.textContent = '표시된 칸을 확인해 주세요.';
  }

  const STEPS = { memory: renderMemory, widen: renderWiden, fork: renderFork, place: renderPlace, mission: renderMission };
})(window.AAG);
