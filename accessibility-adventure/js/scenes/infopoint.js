/* =========================================================
 * scenes/infopoint.js — 장면 ③ 실내 안내판 → 여러 방법의 정보
 * variant : 'cafe'(카페 메뉴판) | 'cinema'(상영관 스크린) | 'classroom'(교실 칠판)
 * methods 의 icon 에 따라 소품이 나타납니다:
 *   braille(점자) · speaker(음성) · bigtext(큰 글씨) · staff(사람 안내)
 *   headphones(화면해설 수신기) · cards(그림카드) · cc(자막)
 * ========================================================= */
(function (A) {
  'use strict';
  const P = A.pal, px = A.px, WD = A.WD;
  const FLOOR = 150;

  /* 방(실내)별 배치 */
  const ROOMS = {
    cafe: {
      wall: '#fbe3cf', wall2: '#f5d6bd', low: '#e0b388', floor: '#c99263', floor2: '#b27b50',
      board: { x: 26, y: 44, w: 92, h: 60, kind: 'menu' }, heroX: 134, focus: { x: 92, y: 96, z: 1.6 }, box: { x: 150, y: 112 },
      staff: { look: 'staff', x: 238, y: 131 },
      slots: { braille: { x: 164, y: 120, chip: 106 }, speaker: { x: 200, y: 120, chip: 106 }, bigtext: { x: 172, y: 44, chip: 38 },
        staff: { x: 238, y: 104 }, headphones: { x: 164, y: 120, chip: 106 }, cards: { x: 200, y: 120, chip: 106 }, cc: { x: 72, y: 104, chip: 112 } }
    },
    cinema: {
      wall: '#453c5e', wall2: '#3c3453', low: '#5b3348', floor: '#3a3048', floor2: '#2f2740',
      board: { x: 20, y: 26, w: 170, h: 82, kind: 'movie' }, heroX: 206, focus: { x: 120, y: 90, z: 1.35 }, box: { x: 222, y: 112 },
      staff: { look: 'staff', x: 240, y: 150 },
      slots: { headphones: { x: 70, y: 146, chip: 128 }, cc: { x: 105, y: 108, chip: 116 }, speaker: { x: 206, y: 60, chip: 44 },
        staff: { x: 240, y: 106, chip: 160 }, braille: { x: 140, y: 146, chip: 128 }, bigtext: { x: 222, y: 48, chip: 40 }, cards: { x: 140, y: 146, chip: 128 } }
    },
    classroom: {
      wall: '#eef5e6', wall2: '#e3eed8', low: '#c9dcb8', floor: '#d8b48a', floor2: '#c29a6c',
      board: { x: 22, y: 42, w: 110, h: 56, kind: 'chalk' }, heroX: 146, focus: { x: 92, y: 94, z: 1.55 }, box: { x: 160, y: 112 },
      staff: { look: 'staff', x: 232, y: 127 },
      slots: { cards: { x: 72, y: 134, chip: 120 }, bigtext: { x: 186, y: 46, chip: 40 }, speaker: { x: 150, y: 70, chip: 58 },
        staff: { x: 232, y: 104 }, cc: { x: 77, y: 90, chip: 108 }, braille: { x: 110, y: 134, chip: 120 }, headphones: { x: 110, y: 134, chip: 120 } }
    }
  };

  function geo(st) { const x = st.x; return { b0: x + 8, b1: x + 168, d0: x + 96, d1: x + 118, dc: x + 107, stand: x + 142 }; }
  const room = st => ROOMS[st.variant] || ROOMS.cafe;

  /* ---------- 바깥 모습 ---------- */
  const EXT = {
    cafe: { wall: '#f4d5b3', band: '#dcb58d', sign: P.wood2, signText: '#fff4e0', awn: [P.mintDk, '#fff7ea'] },
    cinema: { wall: '#6d8fd0', band: '#4f6fae', sign: P.yellow, signText: P.ink, awn: null },
    classroom: { wall: '#f1e2c0', band: '#decb9f', sign: P.blue3, signText: '#ffffff', awn: null }
  };

  function drawExterior(b, st, G) {
    const g = geo(st), E = EXT[st.variant] || EXT.cafe, top = 54;
    px.box(b, g.b0, top, g.b1 - g.b0, WD.BASE - top + 1, E.wall);
    px.R(b, g.b0 + 1, WD.BASE - 7, g.b1 - g.b0 - 2, 6, E.band);
    px.R(b, g.b0 - 2, top - 3, g.b1 - g.b0 + 4, 5, E.band); px.R(b, g.b0 - 2, top - 4, g.b1 - g.b0 + 4, 1, P.ink);
    // 간판
    px.box(b, g.b0 + 26, 62, g.b1 - g.b0 - 52, 16, E.sign);
    G.label({ x: (g.b0 + g.b1) / 2, y: 70, text: st.stage.place.sign, size: 9.5, color: E.signText });
    // 차양
    if (E.awn) {
      const a0 = g.b0 + 4, a1 = g.b1 - 4;
      px.R(b, a0, 82, a1 - a0, 1, P.ink);
      for (let x = a0, i = 0; x < a1; x += 7, i++) { const w = Math.min(7, a1 - x); px.R(b, x, 83, w, 7, E.awn[i % 2]); px.R(b, x + 1, 90, Math.max(0, w - 2), 2, E.awn[i % 2]); px.R(b, x + 1, 92, Math.max(0, w - 2), 1, P.ink); }
    }
    // 큰 창
    px.box(b, g.b0 + 8, 96, 76, 46, P.glass);
    px.R(b, g.b0 + 9, 128, 74, 13, '#e8cfae');
    px.disc(b, g.b0 + 22, 118, 7, P.leaf); px.R(b, g.b0 + 19, 124, 7, 5, '#d98a5f');
    px.R(b, g.b0 + 44, 97, 1, 12, P.ink2); px.R(b, g.b0 + 40, 109, 9, 4, P.yellow);
    px.R(b, g.b0 + 60, 97, 1, 16, P.ink2); px.R(b, g.b0 + 56, 113, 9, 4, P.yellow);
    px.R(b, g.b0 + 11, 99, 3, 12, P.glassHi);
    // 문 (턱 없는 평평한 출입구)
    px.R(b, g.d0 - 2, 98, g.d1 - g.d0 + 4, WD.BASE - 97, P.wood2);
    px.R(b, g.d0, 100, g.d1 - g.d0, WD.BASE - 100, P.inside);
    const open = Math.round((st.door || 0) * (g.d1 - g.d0 - 3));
    if (g.d1 - g.d0 - open > 1) { px.R(b, g.d0 + open, 100, g.d1 - g.d0 - open, WD.BASE - 100, P.ink); px.R(b, g.d0 + open + 1, 101, g.d1 - g.d0 - open - 2, WD.BASE - 102, P.glass2); }
    px.box(b, g.d0 + 4, 108, 14, 7, '#ffffff'); G.label({ x: g.d0 + 11, y: 111.5, text: 'OPEN', size: 3.4, color: P.mintDk, font: 'pixel' });
    // 오른쪽 작은 창
    px.box(b, g.d1 + 8, 100, 34, 26, P.glass); px.R(b, g.d1 + 10, 102, 3, 8, P.glassHi);
    // 해결 뒤 : 입구 앞 안내 입간판 (점자 + 스피커 + 큰 글씨)
    if (st.solved) {
      const s = g.stand;
      px.line(b, s - 10, WD.LANE, s - 6, 134, P.ink); px.line(b, s + 10, WD.LANE, s + 6, 134, P.ink);
      px.box(b, s - 11, 132, 22, 24, P.chalk);
      px.R(b, s - 10, 133, 20, 1, P.chalk2);
      for (let i = 0; i < 4; i++) { px.R(b, s - 7 + i * 4, 147, 1, 1, '#ffffff'); px.R(b, s - 6 + i * 4, 149, 1, 1, '#ffffff'); }
      px.R(b, s + 5, 143, 3, 3, P.metal2);
      G.label({ x: s, y: 138, text: st.stage.place.stand || 'INFO', size: 4.4, color: '#ffffff', font: 'pixel' });
    }
  }

  /* ---------- 안내판 내용 ---------- */
  function drawBoard(b, st, G, R) {
    const B = R.board, t = G.time;
    if (B.kind === 'movie') {
      px.box(b, B.x - 3, B.y - 3, B.w + 6, B.h + 6, P.dark);
      A.art.movie(b, B.x, B.y, B.w, B.h, t);
      return;
    }
    const frame = B.kind === 'chalk' ? P.wood2 : P.wood;
    px.box(b, B.x - 3, B.y - 3, B.w + 6, B.h + 6, frame);
    px.R(b, B.x, B.y, B.w, B.h, P.chalk);
    px.R(b, B.x, B.y, B.w, 1, P.chalk2);
    if (B.kind === 'menu') {
      G.label({ x: B.x + B.w / 2, y: B.y + 6, text: st.stage.place.board || 'MENU', size: 5, color: '#ffffff', font: 'pixel' });
      (st.stage.menu || []).slice(0, 4).forEach((m, i) => {
        const y = B.y + 15 + i * 11;
        px.R(b, B.x + 6, y - 2, 5, 5, '#ffffff'); px.R(b, B.x + 7, y - 1, 3, 2, [P.wood3, P.pink, P.yellow, '#ffc2cf'][i % 4]);
        G.label({ x: B.x + 15, y: y + 0.5, text: m.name, size: 2.8, color: '#e6f2ec', align: 'left', font: 'body' });
        G.label({ x: B.x + B.w - 6, y: y + 0.5, text: m.price, size: 2.8, color: '#e6f2ec', align: 'right', font: 'body' });
        for (let d = B.x + 42; d < B.x + B.w - 22; d += 3) px.R(b, d, y + 1, 1, 1, '#6f9384');
      });
    } else {
      (st.stage.boardLines || ['오늘의 활동', '모둠별 발표 준비']).forEach((l, i) => {
        G.label({ x: B.x + 8, y: B.y + 10 + i * 9, text: l, size: 3.4, color: '#eef6ee', align: 'left', font: 'body' });
      });
      for (let i = 0; i < 3; i++) px.R(b, B.x + 8, B.y + 32 + i * 7, 40 + ((i * 17) % 30), 1, '#8fb3a3');
    }
  }

  /* ---------- 방법 소품 ---------- */
  function drawMethod(b, st, G, R, m, p) {
    const s = R.slots[m.icon] || R.slots.speaker, t = G.time;
    if (!s) return;
    b.save(); b.globalAlpha = Math.min(1, p * 1.4);
    const lift = Math.round((1 - Math.min(1, p)) * 6);
    const x = s.x, y = s.y - lift;
    switch (m.icon) {
      case 'braille':
        px.box(b, x - 9, y - 7, 18, 7, '#ffffff'); px.R(b, x, y - 6, 1, 5, P.metal2);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { px.R(b, x - 7 + i * 2, y - 5 + j * 2, 1, 1, P.ink2); px.R(b, x + 2 + i * 2 + (j % 2), y - 5 + j * 2, 1, 1, P.ink2); }
        break;
      case 'speaker':
        if (s.y < 100) { px.box(b, x - 6, y - 6, 12, 12, P.metal2); px.disc(b, x, y, 3, P.ink2); }
        else { px.box(b, x - 6, y - 12, 12, 12, P.metal2); px.disc(b, x, y - 6, 3, P.ink2); px.box(b, x + 3, y - 15, 4, 3, P.coral); }
        for (let i = 0; i < 3; i++) {
          const ph = (t * 1.5 + i / 3) % 1, r = 4 + ph * 8; b.globalAlpha = (1 - ph) * Math.min(1, p);
          for (let a = -0.7; a <= 0.7; a += 0.14) px.R(b, x + 7 + Math.cos(a) * r, y - (s.y < 100 ? 0 : 6) + Math.sin(a) * r, 1, 1, P.coral);
        }
        break;
      case 'bigtext':
        px.box(b, x - 22, y, 44, 34, '#fffaf2'); px.R(b, x - 21, y + 1, 42, 3, P.yellow);
        G.label({ x, y: y + 18, text: m.show || '큰 글씨', size: 7.6, color: P.ink, alpha: Math.min(1, p) });
        break;
      case 'headphones':
        px.R(b, x - 7, y - 16, 14, 2, P.ink); px.R(b, x - 8, y - 14, 2, 4, P.ink); px.R(b, x + 6, y - 14, 2, 4, P.ink);
        px.box(b, x - 10, y - 11, 5, 7, P.mint2); px.box(b, x + 5, y - 11, 5, 7, P.mint2);
        break;
      case 'cards':
        [[-12, P.yellow], [-2, P.blue], [8, P.coral]].forEach((c, i) => { px.box(b, x + c[0], y - 12 + (i % 2), 9, 11, '#ffffff'); px.R(b, x + c[0] + 2, y - 9 + (i % 2), 5, 5, c[1]); });
        break;
      case 'cc':
        if (st.variant === 'cinema' || st.variant === 'cafe') {
          const B = R.board; b.globalAlpha = 0.85 * Math.min(1, p); px.R(b, B.x + 10, B.y + B.h - 13, B.w - 20, 10, '#15121f'); b.globalAlpha = Math.min(1, p);
          G.label({ x: B.x + B.w / 2, y: B.y + B.h - 8, text: m.show || '자막', size: 5.2, color: '#ffffff', font: 'body', weight: 700, alpha: Math.min(1, p) });
        } else {
          px.box(b, x - 20, y - 12, 40, 14, P.dark); G.label({ x, y: y - 5, text: m.show || '자막', size: 5, color: '#ffffff', font: 'body', weight: 700, alpha: Math.min(1, p) });
        }
        break;
      default: break;
    }
    b.restore();
    if (p > 0.5) {
      if (m.icon !== 'staff') G.label({ x: s.x, y: s.chip, text: m.label, size: 5.6, color: P.ink, bg: '#ffffff', border: P.ink, pad: 1.8, alpha: Math.min(1, (p - 0.5) * 2) });
      if (m.say && m.sayOn) G.label({ x: m.icon === 'staff' ? s.x - 14 : s.x, y: m.icon === 'staff' ? s.y - 8 : s.chip - 13, text: m.say, size: 5.6, color: P.ink, bg: '#fff6d8', border: P.ink, pad: 2.2, bubble: m.icon === 'staff' ? 'right' : 'down', alpha: m.sayOn });
      if (m.icon === 'staff') G.label({ x: s.x, y: s.chip || s.y + 30, text: m.label, size: 5.6, color: P.ink, bg: '#ffffff', border: P.ink, pad: 1.8, alpha: Math.min(1, (p - 0.5) * 2) });
    }
  }

  /* ---------- 실내 그리기 ---------- */
  function drawRoom(b, st, G) {
    const V = G.view, R = room(st), t = G.time;
    px.R(b, V.L, V.T, V.bw, FLOOR - V.T, R.wall);
    for (let x = Math.floor(V.L / 16) * 16; x < V.L + V.bw; x += 16) px.R(b, x, V.T, 8, FLOOR - V.T, R.wall2);
    px.R(b, V.L, 22, V.bw, 3, R.low);
    px.R(b, V.L, 118, V.bw, FLOOR - 118, R.low);
    px.R(b, V.L, 118, V.bw, 1, P.ink2);
    for (let x = Math.floor(V.L / 20) * 20; x < V.L + V.bw; x += 20) px.R(b, x, 122, 1, 25, 'rgba(0,0,0,0.12)');
    px.R(b, V.L, FLOOR, V.bw, V.T + V.bh - FLOOR + 2, R.floor);
    [158, 168, 180, 194].forEach((y, i) => { px.R(b, V.L, y, V.bw, 1, R.floor2); for (let x = Math.floor(V.L / 24) * 24 + (i % 2) * 12; x < V.L + V.bw; x += 24) px.R(b, x, y - 8, 1, 8, R.floor2); });
    px.R(b, V.L, FLOOR, V.bw, 1, P.ink2);
    // 출입문(왼쪽)
    px.box(b, -4, 96, 22, FLOOR - 95, P.wood2); px.R(b, -2, 98, 18, FLOOR - 98, P.glass2); px.R(b, 1, 100, 3, 12, P.glassHi);
    // 조명
    [70, 150, 222].forEach(x => { px.R(b, x, V.T, 1, 30 - V.T, P.ink2); px.R(b, x - 5, 30, 11, 5, P.ink); px.R(b, x - 4, 30, 9, 4, st.variant === 'cinema' ? '#6b5f8a' : P.yellow); });
    drawBoard(b, st, G, R);
    if (st.variant === 'cafe') {
      // 창문 너머 동네
      px.box(b, 232, 44, 40, 50, P.glass); px.disc(b, 250, 80, 9, P.leaf); px.R(b, 233, 86, 38, 7, P.walk);
    }
    if (st.variant === 'classroom') {
      px.box(b, 200, 40, 56, 56, P.glass); px.R(b, 227, 41, 2, 54, '#ffffff'); px.disc(b, 214, 84, 8, P.leaf);
    }
    // 직원(카운터 뒤)
    if (st.staff) A.drawActor(b, st.staff, t);
    // 가구
    if (st.variant === 'cafe') {
      px.R(b, 148, 120, 124, 6, P.ink); px.R(b, 149, 121, 122, 4, P.wood3);
      px.R(b, 150, 126, 120, FLOOR - 126, P.wood); for (let x = 156; x < 268; x += 18) px.box(b, x, 130, 14, 16, P.wood2);
      px.box(b, 250, 100, 20, 20, P.metal2); px.R(b, 253, 104, 14, 5, P.dark2); px.R(b, 256, 112, 2, 4, P.ink); px.R(b, 263, 112, 2, 4, P.ink); px.R(b, 265, 102, 2, 2, P.red);
    } else if (st.variant === 'cinema') {
      for (let r = 0; r < 2; r++) for (let x = 14 + r * 8; x < 214; x += 20) { px.box(b, x, 138 + r * 18, 16, 16, r ? '#8f3c55' : '#a8475f'); px.R(b, x + 2, 140 + r * 18, 12, 3, '#c9657d'); }
    } else if (st.variant === 'classroom') {
      [40, 104].forEach(x => { px.box(b, x, 134, 50, 6, P.wood3); px.R(b, x + 4, 140, 3, 10, P.ink2); px.R(b, x + 43, 140, 3, 10, P.ink2); });
      px.box(b, 204, 120, 44, 8, P.wood); px.R(b, 206, 128, 40, 22, P.wood2);
    }
    (st.stage.methods || []).forEach((m, i) => { const p = st.shown[i] || 0; if (p > 0) drawMethod(b, st, G, R, m, p); });
  }

  A.registerScene('infopoint', {
    width: () => 176,
    init(stage, x) { return { x, stage, variant: stage.variant || 'cafe', door: 0, solved: false, shown: [] }; },
    setup(G, st) {
      const R = room(st);
      st.staff = { look: R.staff.look, x: R.staff.x, y: R.staff.y, dir: -1, alpha: 1, phase: 0, noShadow: true };
      st.shown = [];
      (st.stage.methods || []).forEach(m => { m.sayOn = 0; });
    },
    stopX(st) { return geo(st).dc - 14; },
    focus(st) { return room(st).focus; },
    boxPos(st) { return room(st).box; },
    tag(st) { const g = geo(st); return { x: g.stand, y: 118 }; },
    describe(st) { const a = st.stage.a11y || {}; return st.solved ? (a.after || '') : (a.before || ''); },
    roomWidth: () => 272,
    draw: drawExterior,
    drawRoom,

    async arrive(G, st) {
      const g = geo(st), h = G.hero, R = room(st);
      await G.walkTo(g.dc);
      G.sfx('door');
      await G.tween(st, { door: 1 }, 300);
      await G.tween(h, { alpha: 0 }, 220);
      await G.wipe(1);
      G.enterRoom(st);
      st.door = 0;
      h.x = 8; h.y = FLOOR; h.alpha = 1; h.dir = 1;
      G.snapCam(136);
      await G.wipe(0);
      await G.walkTo(R.heroX, { speed: 44 });
      h.dir = -1;
    },

    async solve(G, st) {
      const ms = st.stage.methods || [];
      G.sfx('build');
      await G.camTo({ x: 150, y: null, z: 1 }, 800);
      for (let i = 0; i < ms.length; i++) {
        st.shown[i] = 0;
        G.sfx('pop');
        const R = room(st), s = R.slots[ms[i].icon] || R.slots.speaker;
        G.burst(s.x, s.y - 8, 'spark', 10);
        await G.tween(st.shown, { [i]: 1 }, 450, 'back');
        if (ms[i].say) {
          ms[i].sayOn = 1;
          if (ms[i].icon === 'speaker') G.sfx('voice');
          await G.wait(1100);
          if (ms[i].icon !== 'staff') G.tween(ms[i], { sayOn: 0 }, 400);
        } else {
          await G.wait(450);
        }
      }
      st.solved = true;
      await G.wait(500);
    },

    async leave(G, st) {
      const g = geo(st), h = G.hero;
      if (st.variant === 'cafe') { h.carry = 'cup'; G.sfx('pop'); G.burst(h.x, h.y - 14, 'note', 3); await G.wait(500); }
      await G.walkTo(6, { speed: 50 });
      await G.tween(h, { alpha: 0 }, 200);
      await G.wipe(1);
      G.exitRoom();
      h.x = g.dc; h.y = WD.LANE; h.dir = 1; st.door = 1;
      G.snapCam();
      await G.wipe(0);
      await G.tween(h, { alpha: 1 }, 220);
      G.tween(st, { door: 0 }, 300);
      G.burst(g.stand, 136, 'spark', 14);
      G.sfx('pop');
      G.follow = true;
      await G.walkTo(st.x + 176 + 4);
    },

    ending(G, st) {
      const g = geo(st);
      G.addActor({ look: 'walker', acc: 'whitecane', x: g.stand + 17, y: WD.LANE, dir: -1 });
      G.addActor({ look: 'kid', x: g.stand - 30, y: WD.LANE + 3, dir: 1, speed: 10, pause: 1.5, route: [[g.stand - 30, WD.LANE + 3], [st.x + 20, WD.LANE + 3]] });
    }
  });
})(window.AAG);
