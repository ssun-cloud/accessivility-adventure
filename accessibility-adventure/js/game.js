/* =========================================================
 * game.js — 게임 진행 로직
 * 시작 → STAGE 1~3 (이동 → 상황 → 선택 → 환경 변화 → 아이템) → 도착 → 엔딩
 * 점수·목숨·제한시간·실패 화면은 없습니다. 오답이어도 다시 고를 수 있어요.
 * ========================================================= */
(function (A) {
  'use strict';
  const WD = A.WD;
  const game = A.game = {};
  let E, UI, runId = 0;

  game.init = function (canvas) {
    E = A.engine; UI = A.ui;
    A.initLooks();
    UI.init();
    E.init(canvas);
    // 점프 : 게임 화면을 누르거나 스페이스바·위쪽 화살표 (이동 중에만)
    document.getElementById('stage').addEventListener('pointerdown', e => {
      if (e.target.closest('button, a, input')) return;
      if (UI.mode === 'travel') E.playerJump();
    });
    document.addEventListener('keydown', e => {
      if (UI.mode !== 'travel' || (e.key !== ' ' && e.key !== 'ArrowUp')) return;
      if (e.target.closest && e.target.closest('button, a, input, textarea, select')) return;
      if (E.playerJump()) e.preventDefault();
    });
  };

  game.themeList = () => A.themeOrder.map(id => A.themes[id]);

  game.load = function (id) {
    if (A.campaignForm) A.campaignForm.close();
    const theme = A.themes[id] || A.themes[A.themeOrder[0]];
    game.theme = theme;
    document.title = theme.title;
    try { if (history.replaceState) history.replaceState(null, '', '#' + theme.id); } catch (e) { /* 무시 */ }
    E.load(theme);
    UI.hideOverlays();
    UI.hud.reset(theme.stages.length);
    UI.hud.setStage('START');
    game.run();
  };

  const alive = id => id === runId;

  game.run = async function () {
    const id = ++runId, T = game.theme, W = E.W, h = E.hero;
    const found = [];
    await UI.showStart(T, { themes: (A.settings && A.settings.showVersionSwitch) ? game.themeList() : [], onTheme: tid => { if (tid !== T.id) game.load(tid); } });
    if (!alive(id)) return;
    A.audio.unlock(); A.audio.play('tap');
    UI.hideStart();
    await E.wait(250);

    for (let i = 0; i < W.scenes.length; i++) {
      const sc = W.scenes[i], stg = sc.stage, def = sc.def;
      const kicker = 'STAGE ' + (i + 1);
      UI.hud.setStage(kicker);
      UI.narrate({ kicker, title: stg.title, sub: (stg.travel || '') + ' · 화면을 톡! 누르면 점프해요', theme: T, route: i + 1 });
      UI.setScene(stg.travel || stg.title);
      E.follow = true; h.bouncy = true;
      await E.walkTo(def.stopX(sc.st));
      if (!alive(id)) return;
      h.bouncy = false;
      if (def.arrive) { E.follow = false; await def.arrive(E, sc.st); }
      E.follow = false;
      await E.camTo(def.focus(sc.st, E), 900);
      h.bubble = '?';
      UI.setScene(def.describe(sc.st));
      await E.showBox(def.boxPos(sc.st), stg.item.icon);
      if (def.present) await def.present(E, sc.st);

      await UI.ask(stg, i, {
        onWrong: () => {
          A.audio.play('hmm'); E.shakeBox();
          h.bubble = '…';
          E.after(1300, () => { if (h.bubble === '…') h.bubble = '?'; });
        },
        onRight: () => { A.audio.play('pop'); h.bubble = '!'; }
      });
      if (!alive(id)) return;

      UI.narrate({ kicker, title: stg.solved || '동네가 바뀌고 있어요!', sub: '', say: true });
      await E.openBox();
      h.bubble = null;
      await def.solve(E, sc.st);
      if (!alive(id)) return;
      UI.setScene(def.describe(sc.st));
      A.audio.play('item');
      E.jump();
      UI.flyIcon(E.worldToClient(h.x, h.y - 26), i, stg.item.icon);
      setTimeout(() => UI.hud.fill(i, stg.item), 750);
      found.push(stg.item);
      await UI.itemGet(stg.item, i, W.scenes.length);
      if (!alive(id)) return;

      const next = W.scenes[i + 1];
      UI.narrate({ kicker, title: next ? '다음 장소로 출발!' : '축제 광장으로 출발!', sub: '', theme: T, route: i + 1, say: false });
      await E.camTo({ x: E.room ? E.cam.x : h.x + 24, y: null, z: 1 }, 700);
      E.follow = !E.room; h.bubble = null;
      await def.leave(E, sc.st);
      if (!alive(id)) return;
    }

    /* ---------- 도착 ---------- */
    const goalName = (T.route[T.route.length - 1] || {}).label || '목적지';
    UI.hud.setStage('FINAL');
    UI.narrate({ kicker: 'FINAL STAGE', title: goalName + '에 거의 다 왔어요!', sub: '', theme: T, route: T.route.length - 1 });
    E.follow = true; h.bouncy = true;
    await E.walkTo(W.goalX);
    if (!alive(id)) return;
    h.bouncy = false; h.dir = 1; h.carry = 'flag';
    // 모은 별로 광장 전구 켜기
    const bulbs = W.stars.filter(s => s.taken).length * 2;
    UI.narrate({ kicker: 'FINAL STAGE', title: '모은 별빛으로 광장이 밝아져요!', sub: '', theme: T, route: T.route.length - 1 });
    W.plaza.lit = 0;
    let lastBulb = 0;
    await E.tween(W.plaza, { lit: bulbs }, 300 + bulbs * 90, 'linear', () => {
      const k = Math.floor(W.plaza.lit);
      if (k > lastBulb) { lastBulb = k; if (k % 2 === 0) A.audio.play('bulb'); }
    });
    W.plaza.lit = bulbs;
    A.audio.play('fanfare');
    for (let k = 0; k < 4; k++) E.after(k * 250, () => E.burst(h.x + (Math.random() - 0.5) * 80, 70, 'confetti', 26));
    E.jump(); E.after(500, () => E.jump());
    await E.wait(1300);

    /* ---------- 달라진 동네 다시 보기 ---------- */
    UI.narrate({ kicker: 'FINAL STAGE', title: T.ending.stageLabel || '우리 동네가 달라졌어요!', sub: '처음 지나온 동네를 다시 볼까요?', theme: T, route: T.route.length });
    W.scenes.forEach(sc => sc.def.ending && sc.def.ending(E, sc.st));
    plazaCrowd();
    W.scenes.forEach(sc => { const tg = sc.def.tag(sc.st); E.tags.push({ x: tg.x, y: tg.y, text: sc.stage.item.short || sc.stage.item.name, a: 0, on: false }); });
    E.follow = false;
    await E.wipe(1);
    E.snapCam(0);
    await E.wipe(0);
    UI.setScene('처음 지나온 동네가 달라졌습니다. ' + W.scenes.map(sc => sc.def.describe(sc.st)).join(' ') + ' 여러 주민이 각자의 방법으로 동네를 이용합니다.');
    await E.tween(E.cam, { x: W.goalX }, A.util.reducedMotion() ? 3000 : 11000, 'inOut');
    if (!alive(id)) return;

    A.audio.play('item');
    E.burst(h.x, 60, 'confetti', 30);
    const replay = () => game.load(T.id);
    const C = A.campaign;
    UI.showEnding(T, found, {
      onReplay: replay,
      onCampaign: C && C.enabled && A.campaignForm ? () => A.campaignForm.open(T, found, { onReplay: replay }) : null
    });
    idlePan(id);
  };

  function plazaCrowd() {
    const x = E.W.plaza.x;
    E.addActor({ look: 'fan', carry: 'flag', x: x + 40, y: WD.LANE + 2, dir: 1, speed: 12, pause: 1.2, route: [[x + 40, WD.LANE + 2], [x + 100, WD.LANE + 2]] });
    E.addActor({ look: 'elder', x: x + 200, y: WD.LANE - 2, dir: -1 });
    E.addActor({ look: 'kid', x: x + 150, y: WD.LANE + 4, dir: -1 });
    E.addActor({ look: 'walker', ride: 'cart', x: x + 20, y: WD.LANE - 1, dir: 1, speed: 9, pause: 2, route: [[x - 40, WD.LANE - 1], [x + 60, WD.LANE - 1]] });
  }

  async function idlePan(id) {
    const W = E.W;
    await E.wait(4000);
    while (alive(id)) {
      await E.tween(E.cam, { x: 80 }, 18000, 'inOut');
      if (!alive(id)) return;
      await E.wait(2000);
      await E.tween(E.cam, { x: W.goalX }, 18000, 'inOut');
      await E.wait(3000);
    }
  }
})(window.AAG);
