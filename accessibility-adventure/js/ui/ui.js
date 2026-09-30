/* =========================================================
 * ui/ui.js — 화면 UI (HUD, 아래쪽 안내 패널, 선택지, 아이템 카드, 엔딩)
 * 모든 버튼은 실제 <button> 이라 터치·마우스·키보드(Tab/Enter, 숫자 1~4) 모두 됩니다.
 * ========================================================= */
(function (A) {
  'use strict';
  const U = A.util, esc = U.esc;
  const $ = s => document.querySelector(s);
  const UI = A.ui = { mode: 'none' };
  let el = {};
  const br = s => U.lines(s).map(esc).join('<br>');

  UI.init = function () {
    el = UI.el = {
      app: $('#app'), stage: $('#stage'), panel: $('#panel'), hudStage: $('#hudStage'), slots: $('#hudSlots'), itemsLabel: $('#hudItems'),
      toast: $('#toast'), title: $('#titleCard'), complete: $('#complete'), sr: $('#sr'), modal: $('#itemsModal'), modalBody: $('#itemsBody'),
      mute: $('#muteBtn'), canvas: $('#view')
    };
    el.mute.addEventListener('click', () => {
      const m = !A.audio.isMuted(); A.audio.setMuted(m);
      el.mute.setAttribute('aria-pressed', String(m));
      el.mute.setAttribute('aria-label', m ? '소리 켜기' : '소리 끄기');
      el.mute.classList.toggle('is-muted', m);
    });
    el.modal.addEventListener('click', e => { if (e.target === el.modal || e.target.closest('[data-close]')) UI.closeItems(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !el.modal.hidden) { UI.closeItems(); return; }
      if (UI.mode === 'ask' && /^[1-4]$/.test(e.key)) {
        const btn = el.panel.querySelectorAll('.choice')[+e.key - 1];
        if (btn && !btn.disabled) { btn.focus(); btn.click(); }
      }
    });
    // 주인공 얼굴 아이콘 (말풍선용)
    const hero = A.LOOKS.hero.stand, cv = document.createElement('canvas');
    cv.width = 14 * 5; cv.height = 11 * 5;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    c.drawImage(hero, 0, 0, 14, 11, 0, 0, cv.width, cv.height);
    UI.faceURL = cv.toDataURL();
  };

  UI.announce = function (text) { el.sr.textContent = ''; setTimeout(() => { el.sr.textContent = text; }, 60); };
  UI.setScene = function (text) { el.canvas.setAttribute('aria-label', '게임 화면: ' + text); };
  function setPanel(html, mode) {
    UI.mode = mode;
    el.panel.dataset.mode = mode;
    el.panel.innerHTML = '<div class="panel-inner">' + html + '</div>';
    el.panel.scrollTop = 0;
  }
  const icon = (name, cls) => '<img class="' + (cls || 'px-icon') + '" src="' + A.iconURL(name, 6) + '" alt="" draggable="false">';

  /* ---------- HUD ---------- */
  UI.hud = {
    reset(n) {
      el.slots.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const li = document.createElement('li'); li.className = 'slot';
        li.innerHTML = '<span class="slot-dot" aria-hidden="true"></span>';
        el.slots.appendChild(li);
      }
      this.count = 0; this.total = n; this.label();
    },
    label() { el.itemsLabel.setAttribute('aria-label', '접근성 아이템 ' + this.total + '개 중 ' + this.count + '개 찾음'); },
    setStage(t) { el.hudStage.textContent = t; },
    fill(i, item) {
      const li = el.slots.children[i]; if (!li) return;
      li.classList.add('got');
      li.innerHTML = '<span class="slot-dot" aria-hidden="true">' + icon(item.icon, 'slot-icon') + '</span>';
      this.count++; this.label();
    }
  };
  UI.slotRect = i => { const li = el.slots.children[i]; return li ? li.getBoundingClientRect() : null; };

  /* ---------- 경로 표시 ---------- */
  function routeHTML(theme, current, mini) {
    return '<ol class="route' + (mini ? ' is-mini' : '') + '" aria-label="여행 경로">' + theme.route.map((r, i) => {
      const st = i < current ? ' is-done' : i === current ? ' is-now' : '';
      return '<li class="route-stop' + st + '"' + (i === current ? ' aria-current="step"' : '') + '>' +
        '<span class="route-icon">' + icon(r.icon) + '</span><span class="route-label">' + esc(r.label) + '</span></li>';
    }).join('') + '</ol>';
  }

  /* ---------- 시작 화면 ---------- */
  UI.showStart = function (theme, opts) {
    el.title.hidden = false;
    el.complete.hidden = true;
    el.title.innerHTML = '<h1 class="game-title">' + esc(theme.title) + '</h1>' + (theme.subtitle ? '<p class="game-sub">' + esc(theme.subtitle) + '</p>' : '');
    const themes = (opts && opts.themes) || [];
    const sw = themes.length > 1 ? '<div class="theme-switch" role="group" aria-label="캠페인 버전 고르기"><span class="theme-switch-label">버전</span>' +
      themes.map(t => '<button type="button" class="chip" data-theme="' + esc(t.id) + '" aria-pressed="' + (t.id === theme.id) + '">' + esc(t.label) + '</button>').join('') + '</div>' : '';
    setPanel(
      '<div class="p-start">' +
        '<div class="speech"><img class="face" src="' + UI.faceURL + '" alt=""><p class="speech-text">' + br(theme.intro) + '</p></div>' +
        routeHTML(theme, 0) +
        '<button type="button" class="btn btn-go" id="startBtn"><span>' + esc(theme.startButton || '모험 시작!') + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button>' +
        sw +
      '</div>', 'start');
    UI.setScene(theme.title + ' 시작 화면. 작은 동네 골목과 집 앞에 선 동네 탐험가가 보입니다.');
    return new Promise(res => {
      $('#startBtn').addEventListener('click', () => res(), { once: true });
      el.panel.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { if (opts && opts.onTheme) opts.onTheme(b.dataset.theme); }));
    });
  };
  UI.hideStart = function () { el.title.classList.add('is-leaving'); setTimeout(() => { el.title.hidden = true; el.title.classList.remove('is-leaving'); }, 400); };

  /* ---------- 이동 중 ---------- */
  UI.narrate = function (o) {
    setPanel(
      '<div class="p-travel">' +
        '<p class="eyebrow">' + esc(o.kicker || '') + '</p>' +
        '<p class="travel-title">' + esc(o.title || '') + '</p>' +
        (o.sub ? '<p class="travel-sub">' + esc(o.sub) + '</p>' : '') +
        (o.theme ? routeHTML(o.theme, o.route, true) : '') +
      '</div>', 'travel');
    if (o.say !== false) UI.announce([o.kicker, o.title, o.sub].filter(Boolean).join('. '));
  };

  /* ---------- 질문과 선택지 ---------- */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  UI.ask = function (stage, idx, h) {
    const choices = shuffle(stage.choices.map((c, i) => Object.assign({ _i: i }, c)));
    setPanel(
      '<div class="p-ask">' +
        '<div class="speech is-question"><img class="face" src="' + UI.faceURL + '" alt="">' +
          '<div><p class="speech-lead">' + br(stage.lead || '') + '</p><p class="speech-q" id="qText">' + br(stage.question) + '</p></div></div>' +
        '<div class="choices" role="group" aria-labelledby="qText">' +
          choices.map((c, n) => '<button type="button" class="choice" data-i="' + c._i + '">' +
            '<span class="choice-num" aria-hidden="true">' + (n + 1) + '</span>' +
            '<span class="choice-icon">' + icon(c.icon || 'star') + '</span>' +
            '<span class="choice-label">' + esc(c.label) + '</span>' +
            '<span class="choice-state" aria-hidden="true"></span></button>').join('') +
        '</div>' +
        '<p class="feedback" id="feedback" role="status" aria-live="polite"></p>' +
      '</div>', 'ask');
    UI.announce((stage.lead || '') + ' ' + stage.question.replace(/\n/g, ' ') + ' 선택지 ' + choices.length + '개. 숫자 1부터 ' + choices.length + '까지 눌러도 골라요.');
    const btns = el.panel.querySelectorAll('.choice'), fb = $('#feedback');
    setTimeout(() => { if (btns[0] && UI.mode === 'ask') btns[0].focus({ preventScroll: true }); }, 80);
    return new Promise(res => {
      btns.forEach(btn => btn.addEventListener('click', () => {
        if (UI.mode !== 'ask') return;
        const c = stage.choices[+btn.dataset.i];
        if (c.correct) {
          UI.mode = 'answered';
          btns.forEach(b => { b.disabled = true; });
          btn.classList.add('is-picked');
          btn.querySelector('.choice-state').textContent = '✓ 찾았다!';
          btn.setAttribute('aria-label', c.label + ', 정답');
          fb.className = 'feedback is-good';
          fb.innerHTML = '<strong>좋아요!</strong> 동네가 어떻게 바뀌는지 볼까요?';
          if (h && h.onRight) h.onRight(c);
          setTimeout(res, 700);
        } else {
          btn.classList.add('is-tried');
          btn.querySelector('.choice-state').textContent = '↻ 다시';
          btn.setAttribute('aria-label', c.label + ', 다시 생각해 볼 선택지');
          btn.classList.remove('wobble'); void btn.offsetWidth; btn.classList.add('wobble');
          fb.className = 'feedback is-retry';
          fb.innerHTML = '<span class="fb-main">' + br(stage.wrong || '앗! 다른 아이템을 골라볼까요?') + '</span>' + (c.hint ? '<span class="fb-hint">' + esc(c.hint) + '</span>' : '');
          if (h && h.onWrong) h.onWrong(c);
        }
      }));
    });
  };

  /* ---------- 아이템 획득 ---------- */
  UI.flyIcon = function (from, i, iconName) {
    const target = UI.slotRect(i), cr = el.canvas.getBoundingClientRect();
    if (!target) return;
    const img = document.createElement('img');
    img.src = A.iconURL(iconName, 6); img.alt = ''; img.className = 'fly-icon';
    const sx = cr.left + from.x, sy = cr.top + from.y;
    img.style.left = sx + 'px'; img.style.top = sy + 'px';
    document.body.appendChild(img);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      img.style.transform = 'translate(' + (target.left + target.width / 2 - sx) + 'px,' + (target.top + target.height / 2 - sy) + 'px) scale(0.55)';
      img.style.opacity = '0.2';
    }));
    setTimeout(() => img.remove(), 1000);
  };
  UI.itemGet = function (item, i, total) {
    el.toast.innerHTML = '<p class="toast-kicker">접근성 아이템 획득!</p><div class="toast-badge">' + icon(item.icon) + '</div><p class="toast-name">' + esc(item.name) + '</p>';
    el.toast.hidden = false; el.toast.classList.remove('is-out');
    setTimeout(() => { el.toast.classList.add('is-out'); setTimeout(() => { el.toast.hidden = true; }, 350); }, 2300);
    const last = i === total - 1;
    setPanel(
      '<div class="p-item">' +
        '<div class="item-card"><div class="item-badge">' + icon(item.icon) + '</div>' +
          '<div class="item-text"><p class="eyebrow">접근성 아이템 ' + (i + 1) + ' / ' + total + '</p>' +
          '<h2 class="item-name">' + esc(item.name) + '</h2><p class="item-desc">' + br(item.desc) + '</p>' +
          (item.note ? '<p class="item-note">' + esc(item.note) + '</p>' : '') + '</div></div>' +
        '<button type="button" class="btn btn-go" id="nextBtn"><span>' + (last ? '마지막 목적지로!' : '계속 모험하기') + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button>' +
      '</div>', 'item');
    UI.announce('접근성 아이템 획득! ' + item.name + '. ' + U.lines(item.desc).join(' '));
    const nb = $('#nextBtn');
    setTimeout(() => nb.focus({ preventScroll: true }), 120);
    return new Promise(res => nb.addEventListener('click', () => { A.audio.play('tap'); res(); }, { once: true }));
  };

  /* ---------- 엔딩 ---------- */
  UI.showEnding = function (theme, items, h) {
    const E = theme.ending;
    el.complete.innerHTML = '<p class="complete-title">' + esc(E.title) + '</p>';
    el.complete.hidden = false;
    setPanel(
      '<div class="p-end">' +
        '<p class="end-sub">' + esc(E.sub) + '</p>' +
        '<ul class="end-items" aria-label="오늘 찾은 접근성 아이템">' + items.map(it => '<li>' + icon(it.icon) + '<span>' + esc(it.short || it.name) + '</span></li>').join('') + '</ul>' +
        '<p class="end-msg">' + br(E.message) + '</p>' +
        (h.onCampaign
          ? '<div class="end-btns"><button type="button" class="btn btn-go" id="campaignBtn"><span>' + esc(E.next || '우리 동네 접근성 알려주기') + '</span><span class="btn-arrow" aria-hidden="true">▶</span></button>' +
            '<button type="button" class="btn btn-soft" id="itemsBtn">' + esc(E.items) + '</button></div>'
          : '<div class="end-btns"><button type="button" class="btn btn-go" id="replayBtn"><span>' + esc(E.replay) + '</span><span class="btn-arrow" aria-hidden="true">↻</span></button>' +
            '<button type="button" class="btn btn-soft" id="itemsBtn">' + esc(E.items) + '</button></div>') +
      '</div>', 'end');
    UI.announce(E.title + ' ' + E.sub + ' ' + U.lines(E.message).join(' '));
    const main = $('#campaignBtn') || $('#replayBtn');
    setTimeout(() => main.focus({ preventScroll: true }), 150);
    if (h.onCampaign) main.addEventListener('click', () => { A.audio.play('tap'); h.onCampaign(); });
    else main.addEventListener('click', () => h.onReplay());
    $('#itemsBtn').addEventListener('click', () => UI.openItems(theme, items));
  };

  UI.openItems = function (theme, items) {
    el.modalBody.innerHTML = items.map((it, i) => {
      const stg = theme.stages[i];
      return '<li class="found-card"><div class="item-badge">' + icon(it.icon) + '</div><div class="item-text">' +
        '<p class="eyebrow">STAGE ' + (i + 1) + ' · ' + esc(stg ? stg.title : '') + '</p>' +
        '<h3 class="item-name">' + esc(it.name) + '</h3><p class="item-desc">' + br(it.desc) + '</p>' +
        (it.note ? '<p class="item-note">' + esc(it.note) + '</p>' : '') + '</div></li>';
    }).join('');
    UI._return = document.activeElement;
    el.modal.hidden = false;
    setTimeout(() => el.modal.querySelector('[data-close]').focus(), 30);
  };
  UI.closeItems = function () { el.modal.hidden = true; if (UI._return) UI._return.focus(); };

  UI.hideOverlays = function () { el.complete.hidden = true; el.toast.hidden = true; };
})(window.AAG);
