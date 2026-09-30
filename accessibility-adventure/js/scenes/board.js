/* =========================================================
 * scenes/board.js — 장면 ② 소리로만 나오던 안내 → 글자 안내가 켜짐
 * variant : 'busstop'(버스정류장 전광판) | 'screen'(야외 스크린 자막)
 * ========================================================= */
(function (A) {
  'use strict';
  const P = A.pal, px = A.px, WD = A.WD;
  A.art = A.art || {};

  /* 스크린 속 영화 장면(바닷가 노을) — 실내 장면에서도 같이 씁니다 */
  A.art.movie = function (b, x, y, w, h, t) {
    const bands = ['#ffb38a', '#ffc99a', '#ffdcae', '#ffe9c4'];
    const sea = y + Math.round(h * 0.62);
    for (let i = 0; i < 4; i++) px.R(b, x, y + Math.round((sea - y) * i / 4), w, Math.ceil((sea - y) / 4) + 1, bands[i]);
    px.disc(b, x + w * 0.68, sea - 4, Math.round(h * 0.14), '#fff3c9');
    px.R(b, x, sea, w, y + h - sea, '#6fa8d8');
    for (let i = 0; i < 6; i++) {
      const wy = sea + 3 + (i % 3) * 4, wx = x + ((i * 23 + Math.floor(t * 8)) % Math.max(1, w - 10));
      px.R(b, wx, wy, 8, 1, '#a9d1f0');
    }
    px.R(b, x, y + h - 5, w, 5, '#f3d9a6');
    const fx = x + Math.round(w * 0.3 + Math.sin(t * 0.4) * 3);
    [[0, '#3a3150'], [7, '#5b5074']].forEach(p => { px.R(b, fx + p[0], y + h - 14, 3, 9, p[1]); px.R(b, fx + p[0], y + h - 17, 3, 3, p[1]); });
  };

  function geo(st) {
    const x = st.x;
    if (st.variant === 'screen') return { stop: x + 76, sc0: x + 20, sc1: x + 136, sy0: 58, sy1: 128, pole: x + 156, bx0: x + 26, bx1: x + 130, by0: 116, by1: 126 };
    return { stop: x + 58, s0: x + 18, s1: x + 124, pole: x + 140, bx0: x + 32, bx1: x + 110, by0: 99, by1: 111 };
  }

  function waves(b, x, y, t, strength) {
    if (strength <= 0) return;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.6 + i / 3) % 1, r = 3 + ph * 10;
      b.save(); b.globalAlpha = (1 - ph) * strength;
      for (let a = -0.7; a <= 0.7; a += 0.12) px.R(b, x + Math.cos(a) * r, y + Math.sin(a) * r, 1, 1, P.ink2);
      b.restore();
    }
  }

  function drawBusstop(b, st, G, g) {
    const t = G.time;
    // 뒷 유리 벽
    px.box(b, g.s0 + 4, 100, g.s1 - g.s0 - 8, 48, P.glass);
    for (let i = 0; i < 3; i++) px.line(b, g.s0 + 12 + i * 6, 140, g.s0 + 28 + i * 6, 104, P.glassHi);
    // 포스터
    px.box(b, g.s1 - 32, 104, 22, 34, P.pink);
    px.disc(b, g.s1 - 21, 115, 5, P.yellow); px.R(b, g.s1 - 29, 124, 16, 10, P.mint);
    G.label({ x: g.s1 - 21, y: 131, text: G.theme.world.poster || '', size: 3.4, color: '#ffffff' });
    // 벤치
    px.R(b, g.s0 + 12, 134, 50, 5, P.ink); px.R(b, g.s0 + 13, 135, 48, 3, P.wood3);
    px.R(b, g.s0 + 16, 139, 3, 11, P.ink); px.R(b, g.s0 + 56, 139, 3, 11, P.ink);
    // 기둥
    [g.s0, g.s1 - 4].forEach(x => { px.R(b, x, 94, 4, WD.BASE - 92, P.ink); px.R(b, x + 1, 94, 2, WD.BASE - 93, P.metal2); });
    // 지붕
    px.box(b, g.s0 - 6, 87, g.s1 - g.s0 + 12, 9, P.mint2);
    px.R(b, g.s0 - 5, 88, g.s1 - g.s0 + 10, 2, P.mint);
    px.R(b, g.s0 - 5, 96, g.s1 - g.s0 + 10, 1, P.mintDk);
    // 전광판
    px.R(b, g.bx0 + 6, 96, 1, 3, P.ink); px.R(b, g.bx1 - 7, 96, 1, 3, P.ink);
    px.box(b, g.bx0, g.by0, g.bx1 - g.bx0, g.by1 - g.by0, P.dark);
    const on = st.led >= 1 || (st.led > 0 && Math.floor(t * 18) % 3 !== 0);
    px.R(b, g.bx0 + 1, g.by0 + 1, g.bx1 - g.bx0 - 2, g.by1 - g.by0 - 2, on ? '#2a1c12' : P.dark2);
    if (!on) for (let i = g.bx0 + 3; i < g.bx1 - 2; i += 3) px.R(b, i, (g.by0 + g.by1) / 2, 1, 1, '#4d4863');
    if (on) {
      G.label({ x: g.bx0 + 2, y: (g.by0 + g.by1) / 2 + 0.3, text: st.stage.message, size: 7.4, color: P.led, font: 'body', weight: 700, align: 'left', glow: P.led,
        clip: { x: g.bx0 + 1, y: g.by0 + 1, w: g.bx1 - g.bx0 - 2, h: g.by1 - g.by0 - 2 }, marquee: 26 });
    }
    // 버스 표지판 기둥
    const p = g.pole;
    px.R(b, p - 1, 60, 4, WD.LANE - 60 - 2, P.ink); px.R(b, p, 60, 2, WD.LANE - 62, P.metal2);
    px.R(b, p - 4, WD.LANE - 3, 10, 3, P.ink2);
    px.ball(b, p + 1, 66, 8, P.blue3); px.disc(b, p + 1, 66, 6, '#ffffff');
    px.R(b, p - 3, 63, 9, 5, P.mint2); px.R(b, p - 2, 64, 2, 2, P.glass); px.R(b, p + 1, 64, 2, 2, P.glass); px.R(b, p - 2, 68, 2, 1, P.ink); px.R(b, p + 3, 68, 2, 1, P.ink);
    px.box(b, p - 7, 76, 17, 22, '#ffffff');
    G.label({ x: p + 1.5, y: 80.5, text: (st.stage.place && st.stage.place.route) || '', size: 5, color: P.blue3, font: 'pixel' });
    for (let i = 0; i < 4; i++) px.R(b, p - 4, 85 + i * 3, 11, 1, P.metal2);
    // 스피커
    px.box(b, p + 2, 102, 6, 7, P.metal2); px.R(b, p + 8, 101, 2, 9, P.ink2); px.R(b, p + 10, 100, 1, 11, P.ink2);
    waves(b, p + 12, 105, t, st.waves);
    if (st.chime > 0) G.label({ x: p - 16, y: 80, text: '🔊 ' + (st.stage.sound || '띵동~'), size: 6.4, color: P.ink, bg: '#ffffff', border: P.ink, pad: 2.2, bubble: 'right', alpha: st.chime });
  }

  function drawScreen(b, st, G, g) {
    const t = G.time;
    // 다리
    px.R(b, g.sc0 + 12, g.sy1, 4, WD.BASE - g.sy1 + 4, P.ink); px.R(b, g.sc1 - 16, g.sy1, 4, WD.BASE - g.sy1 + 4, P.ink);
    px.R(b, g.sc0 + 13, g.sy1, 2, WD.BASE - g.sy1 + 3, P.metal); px.R(b, g.sc1 - 15, g.sy1, 2, WD.BASE - g.sy1 + 3, P.metal);
    // 테두리 + 화면
    px.box(b, g.sc0 - 3, g.sy0 - 3, g.sc1 - g.sc0 + 6, g.sy1 - g.sy0 + 6, P.dark);
    A.art.movie(b, g.sc0, g.sy0, g.sc1 - g.sc0, g.sy1 - g.sy0, t);
    // 이름표
    px.box(b, (g.sc0 + g.sc1) / 2 - 26, g.sy0 - 13, 52, 10, P.yellow);
    G.label({ x: (g.sc0 + g.sc1) / 2, y: g.sy0 - 8, text: st.stage.place.sign, size: 5.4, color: P.ink });
    // 자막
    const on = st.led >= 1 || (st.led > 0 && Math.floor(t * 18) % 3 !== 0);
    if (on) {
      b.save(); b.globalAlpha = 0.82; px.R(b, g.bx0, g.by0, g.bx1 - g.bx0, g.by1 - g.by0, '#15121f'); b.restore();
      G.label({ x: (g.bx0 + g.bx1) / 2, y: (g.by0 + g.by1) / 2 + 0.3, text: st.stage.message, size: 6, color: '#ffffff', font: 'body', weight: 700,
        clip: { x: g.bx0, y: g.by0, w: g.bx1 - g.bx0, h: g.by1 - g.by0 }, marquee: 22, align: 'left' });
    }
    // 스피커 탑
    const p = g.pole;
    px.box(b, p - 6, 96, 14, 54, P.dark2);
    [104, 120, 136].forEach(y => { px.ball(b, p + 1, y, 5, '#5f5877'); px.disc(b, p + 1, y, 2, P.ink); });
    waves(b, p + 11, 110, t, st.waves);
    if (st.chime > 0) G.label({ x: p - 18, y: 86, text: '🔊 ' + (st.stage.sound || '♪ ~'), size: 6.4, color: P.ink, bg: '#ffffff', border: P.ink, pad: 2.2, bubble: 'left', alpha: st.chime });
  }

  A.registerScene('board', {
    width: () => 196,
    init(stage, x) { return { x, stage, variant: stage.variant || 'busstop', led: 0, waves: 0, chime: 0, busX: null, busDoor: 0, solved: false }; },
    setup(G, st) {
      const g = geo(st);
      if (st.variant === 'screen') {
        st.waiters = [
          G.addActor({ look: 'teen', acc: 'earphones', x: g.stop + 30, y: WD.LANE - 3, dir: -1 }),
          G.addActor({ look: 'elder', x: g.stop - 44, y: WD.LANE - 2, dir: 1 })
        ];
      } else {
        st.waiters = [
          G.addActor({ look: 'teen', acc: 'earphones', x: st.x + 90, y: WD.LANE - 3, dir: -1 }),
          G.addActor({ look: 'elder', acc: 'stick', x: st.x + 30, y: WD.LANE - 2, dir: 1 })
        ];
      }
    },
    stopX(st) { return geo(st).stop; },
    focus(st) { const g = geo(st); return st.variant === 'screen' ? { x: g.stop + 6, y: 110, z: 1.55 } : { x: g.stop + 30, y: 112, z: 1.5 }; },
    boxPos(st) { const g = geo(st); return st.variant === 'screen' ? { x: g.stop + 22, y: 136 } : { x: g.stop + 16, y: 124 }; },
    tag(st) { const g = geo(st); return st.variant === 'screen' ? { x: (g.sc0 + g.sc1) / 2, y: 40 } : { x: (g.bx0 + g.bx1) / 2, y: 80 }; },
    describe(st) { const a = st.stage.a11y || {}; return st.solved ? (a.after || '') : (a.before || ''); },

    draw(b, st, G) { const g = geo(st); if (st.variant === 'screen') drawScreen(b, st, G, g); else drawBusstop(b, st, G, g); },
    drawFront(b, st, G) {
      if (st.busX == null) return;
      const s = A.drawBus(b, st.busX, 197, G.time, st.busDoor > 0.5);
      G.label({ x: s.signX, y: s.signY, text: ((st.stage.place && st.stage.place.route) || '') + ' ' + ((st.stage.place && st.stage.place.sign) || ''), size: 3.6, color: P.led, font: 'body', weight: 700 });
    },

    async present(G, st) {
      G.sfx('chime');
      st.waves = 1;
      G.tween(st, { chime: 1 }, 200);
      await G.wait(900);
      st.waiters[0].bubble = '?';
      G.sfx('voice');
      await G.wait(1100);
    },

    async solve(G, st) {
      const g = geo(st);
      G.sfx('build');
      await G.tween(st, { led: 0.99 }, 800, 'linear');
      st.led = 1; st.solved = true;
      G.burst((g.bx0 + g.bx1) / 2, g.by0, 'spark', 16);
      st.waiters[0].bubble = '!';
      G.after(1800, () => { st.waiters[0].bubble = null; });
      G.tween(st, { chime: 0 }, 600);
      await G.wait(1500);
    },

    async leave(G, st) {
      const g = geo(st);
      st.waves = 0.4;
      if (st.variant !== 'screen') {
        st.busX = st.x - 190;
        G.sfx('bus');
        await G.tween(st, { busX: st.x + 20 }, 2200, 'out');
        st.busDoor = 1;
        const rider = st.waiters[0];
        rider.bubble = null;
        await G.walkActor(rider, st.x + 96, 30);
        await G.tween(rider, { alpha: 0 }, 300);
        rider.hidden = true;
        st.busDoor = 0;
        G.sfx('bus');
        G.tween(st, { busX: st.x + 1200 }, 5200, 'in').then(() => { st.busX = null; });
      }
      G.follow = true;
      await G.walkTo(st.x + 196 + 4);
    },

    ending(G, st) {
      const g = geo(st);
      st.waiters.forEach(a => { a.hidden = true; });
      if (st.variant === 'screen') {
        G.addActor({ look: 'reader', x: g.stop - 30, y: WD.LANE - 2, dir: 1 });
        G.addActor({ look: 'teen', acc: 'earphones', x: g.stop + 26, y: WD.LANE - 1, dir: -1 });
        G.addActor({ look: 'kid', x: g.stop + 6, y: WD.LANE + 4, dir: -1 });
      } else {
        G.addActor({ look: 'reader', x: st.x + 70, y: WD.LANE - 3, dir: -1 });
        G.addActor({ look: 'teen', acc: 'earphones', x: st.x + 44, y: WD.LANE - 2, dir: 1 });
        G.addActor({ look: 'elder', acc: 'stick', x: st.x + 120, y: WD.LANE + 2, dir: -1, speed: 8, pause: 2, route: [[st.x + 120, WD.LANE + 2], [st.x + 176, WD.LANE + 2]] });
        st.busX = null;
      }
    }
  });
})(window.AAG);
