/* =========================================================
 * scenes/entrance.js — 장면 ① 입구 계단 → 경사로
 * place.style : 'shop'(동네 가게) | 'theater'(영화관) | 'school'(학교)
 * ========================================================= */
(function (A) {
  'use strict';
  const P = A.pal, px = A.px, WD = A.WD;

  const STY = {
    shop: { wall: '#fdeed3', band: '#efd6ad', sign: P.mint2, signText: '#ffffff', awn: [P.coral, '#fff7ea'], trim: '#f3d9ae', win: 'goods' },
    theater: { wall: '#a171a6', band: '#7b4f82', sign: P.yellow, signText: P.ink, awn: null, trim: '#caa0cf', bulbs: true, win: 'posters' },
    school: { wall: '#f4e7c6', band: '#e2cfa3', sign: P.leaf2, signText: '#ffffff', awn: null, trim: '#e6d3a9', clock: true, win: 'class' }
  };
  const FLOOR = 139; // 문턱(층) 높이

  function geo(st) {
    const x = st.x;
    return { stop: x + 10, rx0: x + 18, rx1: x + 70, l0: x + 70, l1: x + 110, d0: x + 79, d1: x + 101, dc: x + 90, b0: x + 30, b1: x + 184 };
  }
  const rampY = (g, x) => WD.LANE + (FLOOR - WD.LANE) * (x - g.rx0) / (g.rx1 - g.rx0);

  function drawRamp(b, g, p) {
    if (p <= 0) return;
    const xs = Math.round(g.rx1 - (g.rx1 - g.rx0) * p);
    for (let x = xs; x <= g.rx1; x++) {
      const ty = Math.round(rampY(g, x));
      px.R(b, x, ty - 1, 1, 1, P.ink);
      px.R(b, x, ty, 1, 2, (x - g.rx0) % 6 === 0 ? '#ddd0b8' : '#f3eadb');
      px.R(b, x, ty + 2, 1, WD.LANE - ty - 1, '#d5c5a6');
      px.R(b, x, ty + 2, 1, 1, '#c3b190');
      px.R(b, x, WD.LANE + 1, 1, 1, P.ink);
    }
    const ty0 = Math.round(rampY(g, xs));
    px.R(b, xs - 1, ty0 - 1, 1, WD.LANE - ty0 + 3, P.ink);
    if (p > 0.6) {
      b.save(); b.globalAlpha = Math.min(1, (p - 0.6) / 0.35);
      for (let x = g.rx0 + 3; x < g.rx1 - 2; x += 13) {
        const ty = Math.round(rampY(g, x));
        px.R(b, x, ty - 12, 2, 12, P.ink); px.R(b, x, ty - 11, 1, 11, P.metal2);
      }
      for (let x = g.rx0 + 3; x <= g.rx1 + 6; x++) {
        const ty = x <= g.rx1 ? Math.round(rampY(g, x)) : FLOOR;
        px.R(b, x, ty - 13, 1, 2, P.ink); px.R(b, x, ty - 13, 1, 1, '#e7ecf4');
      }
      px.R(b, g.rx1 + 6, FLOOR - 13, 2, 13, P.ink);
      b.restore();
    }
  }

  A.registerScene('entrance', {
    width: () => 192,
    init(stage, x) { return { x, stage, style: (stage.place && stage.place.style) || 'shop', ramp: 0, door: 0, solved: false }; },
    setup() {},
    stopX(st) { return geo(st).stop; },
    focus(st) { return { x: geo(st).stop + 56, y: 118, z: 1.45 }; },
    boxPos(st) { const g = geo(st); return { x: g.rx0 + 30, y: 122 }; },
    tag(st) { const g = geo(st); return { x: (g.rx0 + g.rx1) / 2 + 4, y: 110 }; },
    describe(st) { const a = st.stage.a11y || {}; return st.solved ? (a.after || '') : (a.before || ''); },

    draw(b, st, G) {
      const g = geo(st), S = STY[st.style] || STY.shop, top = 58, t = G.time;
      // 벽
      px.box(b, g.b0, top, g.b1 - g.b0, WD.BASE - top + 1, S.wall);
      px.R(b, g.b0 + 1, WD.BASE - 8, g.b1 - g.b0 - 2, 7, S.band);
      px.R(b, g.b0 - 2, top - 3, g.b1 - g.b0 + 4, 6, S.trim); px.R(b, g.b0 - 2, top - 4, g.b1 - g.b0 + 4, 1, P.ink); px.R(b, g.b0 - 2, top + 3, g.b1 - g.b0 + 4, 1, P.ink2);
      if (S.clock) {
        const cx = (g.b0 + g.b1) / 2;
        px.box(b, cx - 12, top - 20, 24, 18, S.trim); px.ball(b, cx, top - 11, 6, '#ffffff'); px.R(b, cx, top - 15, 1, 4, P.ink); px.R(b, cx, top - 11, 3, 1, P.ink);
      }
      // 간판
      const sx0 = g.b0 + 12, sx1 = g.b1 - 12;
      px.box(b, sx0, 66, sx1 - sx0, 17, S.sign); px.R(b, sx0 + 1, 67, sx1 - sx0 - 2, 1, 'rgba(255,255,255,0.35)');
      if (S.bulbs) for (let i = sx0 + 3; i < sx1 - 2; i += 6) px.R(b, i, 64, 2, 2, (Math.floor(t * 3) + i / 6) % 2 < 1 ? '#fff6c0' : P.yellow2);
      G.label({ x: (sx0 + sx1) / 2, y: 74.5, text: st.stage.place.sign, size: 10, color: S.signText });
      // 차양
      if (S.awn) {
        const a0 = g.b0 + 4, a1 = g.b1 - 4;
        px.R(b, a0, 87, a1 - a0, 1, P.ink);
        for (let x = a0, i = 0; x < a1; x += 7, i++) {
          const w = Math.min(7, a1 - x), c = S.awn[i % 2];
          px.R(b, x, 88, w, 8, c); px.R(b, x + 1, 96, Math.max(0, w - 2), 2, c); px.R(b, x + 1, 98, Math.max(0, w - 2), 1, P.ink);
        }
      }
      // 왼쪽 작은 창 + OPEN
      px.box(b, g.b0 + 8, 102, 30, 22, P.glass); px.R(b, g.b0 + 10, 104, 3, 8, P.glassHi);
      px.box(b, g.b0 + 17, 108, 18, 8, '#ffffff'); G.label({ x: g.b0 + 26, y: 112, text: 'OPEN', size: 4, color: P.coral, font: 'pixel' });
      // 문
      px.R(b, g.d0 - 2, 101, g.d1 - g.d0 + 4, FLOOR - 101 + 1, P.ink);
      px.R(b, g.d0 - 1, 102, g.d1 - g.d0 + 2, FLOOR - 102, S.trim);
      const dw = g.d1 - g.d0, pw = dw / 2, open = Math.round(st.door * (pw - 2));
      px.R(b, g.d0, 103, dw, FLOOR - 103, P.inside);
      px.R(b, g.d0 + 2, 118, dw - 4, 2, '#7d7599');
      const pane = (x0, w) => { if (w <= 0) return; px.R(b, x0, 103, w, FLOOR - 103, P.ink); px.R(b, x0 + (w > 2 ? 1 : 0), 104, Math.max(1, w - 2), FLOOR - 105, P.glass2); if (w > 4) px.R(b, x0 + 2, 106, 2, 10, P.glassHi); };
      pane(g.d0, pw - open); pane(g.d0 + pw + open, pw - open);
      // 오른쪽 진열창
      const w0 = g.d1 + 10, w1 = g.b1 - 8;
      px.box(b, w0, 100, w1 - w0, 38, P.glass);
      if (S.win === 'goods') {
        [112, 124].forEach((sy, r) => {
          px.R(b, w0 + 2, sy + 8, w1 - w0 - 4, 2, P.wood2);
          for (let i = w0 + 5; i < w1 - 8; i += 9) px.box(b, i, sy + (i % 2), 7, 8 - (i % 2), [P.yellow, P.coral, P.leaf3, P.pink, P.blue][(i / 9 + r) % 5 | 0]);
        });
      } else if (S.win === 'posters') {
        for (let i = 0; i < 3; i++) { px.box(b, w0 + 5 + i * 22, 104, 18, 28, ['#3f5da8', '#e27d5b', '#44b8a0'][i]); px.disc(b, w0 + 14 + i * 22, 114, 4, '#fff0b8'); }
      } else {
        px.R(b, w0 + 1, 118, w1 - w0 - 2, 1, '#ffffff');
        for (let i = w0 + 6; i < w1 - 6; i += 14) { px.R(b, i, 128, 10, 2, P.wood); px.R(b, i + 4, 130, 2, 7, P.wood2); }
      }
      px.R(b, w0 + 2, 102, 3, 12, P.glassHi);
      // 문턱 앞 단(랜딩)
      px.R(b, g.l0, FLOOR - 1, g.l1 - g.l0, 4, P.ink);
      px.R(b, g.l0 + 1, FLOOR, g.l1 - g.l0 - 2, 2, '#f3eadb');
      px.R(b, g.l0, FLOOR + 3, g.l1 - g.l0, WD.BASE - FLOOR - 2, P.ink);
      px.R(b, g.l0 + 1, FLOOR + 3, g.l1 - g.l0 - 2, WD.BASE - FLOOR - 3, '#d9cbb0');
      // 계단 3칸 (정면)
      const hs = [7, 7, 6];
      let sy = FLOOR + 3;
      for (let i = 0; i < 3; i++) {
        const hw = 14 + i * 3, h = hs[i];
        px.R(b, g.dc - hw - 1, sy, hw * 2 + 2, h + 1, P.ink);
        px.R(b, g.dc - hw, sy, hw * 2, 2, '#f6eee2');
        px.R(b, g.dc - hw, sy + 2, hw * 2, h - 2, '#d7c7aa');
        sy += h;
      }
      drawRamp(b, g, st.ramp);
    },

    async solve(G, st) {
      const g = geo(st);
      G.sfx('build');
      await G.tween(st, { ramp: 1 }, 1500, 'out', () => {
        const xs = g.rx1 - (g.rx1 - g.rx0) * st.ramp;
        if (Math.random() < 0.5) G.emit(xs, rampY(g, xs) - 2, 'spark');
      });
      st.solved = true;
      G.burst((g.rx0 + g.rx1) / 2, 146, 'spark', 18);
    },

    async leave(G, st) {
      const g = geo(st), h = G.hero;
      await G.walkTo(g.rx0);
      await G.walkPath([[g.rx1, FLOOR], [g.dc - 1, FLOOR]], 30);
      G.sfx('door');
      await G.tween(st, { door: 1 }, 350);
      await G.tween(h, { alpha: 0 }, 250);
      await G.wait(550);
      h.carry = 'bag';
      G.burst(g.dc, 118, 'note', 3);
      await G.tween(h, { alpha: 1 }, 250);
      G.tween(st, { door: 0 }, 350);
      await G.hopTo(g.dc + 4, FLOOR + 7);
      await G.hopTo(g.dc + 8, FLOOR + 14);
      await G.hopTo(g.dc + 12, WD.LANE);
      G.follow = true;
      await G.walkTo(st.x + 192 + 4);
    },

    ending(G, st) {
      const g = geo(st);
      G.addActor({ look: 'rider', ride: 'wheelchair', x: g.rx0 - 26, y: WD.LANE, dir: 1, speed: 14, pause: 1.4,
        route: [[g.rx0 - 26, WD.LANE], [g.rx0, WD.LANE], [g.rx1, FLOOR], [g.dc - 6, FLOOR]] });
      G.addActor({ look: 'parent', ride: 'stroller', x: st.x + 150, y: WD.LANE + 3, dir: -1, speed: 12, pause: 1,
        route: [[st.x + 150, WD.LANE + 3], [st.x - 30, WD.LANE + 3]] });
    }
  });
})(window.AAG);
