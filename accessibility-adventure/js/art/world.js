/* =========================================================
 * art/world.js — 동네 배치와 배경 그리기
 * 하늘 → 먼 산·아파트 → 뒷골목 지붕 → 보도·도로 → 건물 → 전봇대·가로수
 * 스테이지 장면(가게·정류장·카페)은 js/scenes/ 에서 그립니다.
 * ========================================================= */
(function (A) {
  'use strict';
  const P = A.pal, px = A.px;
  const WD = A.WD = { H: 200, BASE: 150, LANE: 162, CURB: 172, ROAD: 176 };

  const world = A.world = {};

  /* ---------- 동네 배치 만들기 (테마의 stages 순서대로) ---------- */
  world.build = function (theme) {
    const W = { scenes: [], stars: [], fillers: [], poles: [], trees: [], theme };
    W.home = { x: 6, w: 128 };
    W.heroStart = 104;
    const addStars = (x0, x1) => {
      for (let i = 0; i < 3; i++) W.stars.push({ x: x0 + (x1 - x0) * (i + 0.5) / 3, y: i === 1 ? 133 : 136, taken: false, pop: 0 });
    };
    W.poles.push(146);
    addStars(156, 204);
    let x = 212;
    const n = theme.stages.length;
    theme.stages.forEach((stg, i) => {
      const def = A.scenes[stg.scene];
      if (!def) throw new Error('알 수 없는 장면: ' + stg.scene);
      const w = def.width(stg);
      const sc = { def, stage: stg, x, w, index: i };
      sc.st = def.init(stg, x, theme, i);
      W.scenes.push(sc);
      x += w;
      if (i < n - 1) {
        const names = (theme.world && theme.world.fillers) || ['세탁소', '꽃집'];
        W.fillers.push({ x: x + 10, w: 108, name: names[i % names.length], kind: i % 2 });
        W.poles.push(x + 3);
        addStars(x + 30, x + 104);
        W.trees.push(x + 124);
        x += 136;
      }
    });
    W.poles.push(x + 6);
    W.plaza = { x: x + 16, w: 250 };
    W.goalX = W.plaza.x + 124;
    W.width = W.plaza.x + W.plaza.w + 8;
    W.trees.push(W.plaza.x + W.plaza.w - 6);
    return W;
  };

  /* ---------- 공통: 레이어 좌표 → 월드 좌표 ---------- */
  const par = (V, X, f) => X + V.left * (1 - f);

  /* ---------- 하늘 ---------- */
  function sky(b, V, t) {
    const ys = [-600, 8, 36, 64, 92, 116, 400];
    const bot = Math.min(WD.BASE, V.T + V.bh);
    for (let i = 0; i < 6; i++) {
      const y0 = Math.max(ys[i], V.T), y1 = Math.min(ys[i + 1], bot);
      if (y1 > y0) px.R(b, V.L, y0, V.bw, y1 - y0, P.sky[i]);
      if (i < 5 && ys[i + 1] - 2 >= V.T && ys[i + 1] < bot) px.dither(b, V.L, ys[i + 1] - 2, V.bw, 2, P.sky[i + 1]);
    }
    // 해
    const sx = V.left + V.vw * 0.8, sy = 26;
    px.disc(b, sx, sy, 11, P.sun2); px.disc(b, sx, sy, 9, P.sun);
    // 구름
    const f = 0.12, span = 170;
    const drift = t * 2.5;
    const k0 = Math.floor((V.left * f - drift - 60) / span), k1 = k0 + Math.ceil(V.vw / span) + 3;
    for (let k = k0; k <= k1; k++) {
      const X = k * span + drift + ((k * 53) % 40);
      const cx = par(V, X, f), cy = 22 + ((k * 37) % 3) * 12;
      cloud(b, cx, cy, (k % 2) ? 1 : 0.8);
    }
  }
  function cloud(b, x, y, s) {
    const r = v => Math.round(v * s);
    px.disc(b, x, y, r(6), P.cloud); px.disc(b, x + r(8), y - r(4), r(8), P.cloud); px.disc(b, x + r(17), y, r(6), P.cloud);
    px.R(b, x, y, r(18), r(6), P.cloud);
    px.R(b, x - r(3), y + r(4), r(24), 2, P.cloud2);
  }

  /* ---------- 먼 산·아파트·뒷골목 ---------- */
  function far(b, V) {
    for (let i = 0; i < V.bw; i++) {
      const wx = V.L + i;
      const X1 = wx - V.left * (1 - 0.15);
      const h1 = Math.round(100 + Math.sin(X1 * 0.018) * 9 + Math.sin(X1 * 0.047 + 1) * 5);
      px.R(b, wx, h1, 1, WD.BASE - h1, P.mt1);
      const X2 = wx - V.left * (1 - 0.25);
      const h2 = Math.round(114 + Math.sin(X2 * 0.03 + 2) * 6 + Math.sin(X2 * 0.071) * 3);
      px.R(b, wx, h2, 1, WD.BASE - h2, P.mt2);
    }
    // 아파트 단지
    const f = 0.38, span = 58;
    const k0 = Math.floor((V.left * f) / span) - 1, k1 = k0 + Math.ceil(V.vw / span) + 2;
    for (let k = k0; k <= k1; k++) {
      if (((k % 5) + 5) % 5 === 3) continue;
      const X = k * span, x = Math.round(par(V, X, f)), top = 86 + (((k % 3) + 3) % 3) * 7, w = 30;
      px.R(b, x, top, w, WD.BASE - top, P.far);
      px.R(b, x, top, w, 2, P.far2);
      for (let yy = top + 5; yy < 140; yy += 5) for (let xx = x + 3; xx < x + w - 2; xx += 4) px.R(b, xx, yy, 2, 2, P.farWin);
    }
    // 뒷골목 지붕과 나무
    const f2 = 0.62, span2 = 52;
    const j0 = Math.floor((V.left * f2) / span2) - 1, j1 = j0 + Math.ceil(V.vw / span2) + 2;
    for (let k = j0; k <= j1; k++) {
      const m = ((k % 4) + 4) % 4, X = k * span2, x = Math.round(par(V, X, f2));
      if (m === 1) {
        px.disc(b, x + 14, 124, 12, P.midTree2); px.disc(b, x + 10, 120, 10, P.midTree); px.disc(b, x + 24, 126, 9, P.midTree);
        continue;
      }
      const top = 112 + m * 4, w = 44;
      px.R(b, x, top, w, WD.BASE - top, m === 2 ? P.mid1 : '#f6e8d6');
      if (m === 0) { for (let r = 0; r < 7; r++) px.R(b, x + 2 + r, top - 7 + r, w - 4 - r * 2, 1, P.mid2); }
      else { px.R(b, x - 1, top - 2, w + 2, 3, m === 2 ? P.mid3 : P.mid2); px.R(b, x + 30, top - 8, 8, 6, '#9fd0b6'); }
      for (let xx = x + 6; xx < x + w - 6; xx += 12) px.R(b, xx, top + 6, 6, 5, '#dce9f2');
    }
  }

  /* ---------- 보도·도로 ---------- */
  function ground(b, V) {
    px.R(b, V.L, WD.BASE, V.bw, WD.CURB - WD.BASE, P.walk);
    px.R(b, V.L, WD.BASE, V.bw, 1, P.walk2);
    for (let r = 0; r < 4; r++) {
      const y = WD.BASE + 5 + r * 5 + (r > 1 ? 1 : 0);
      px.R(b, V.L, y, V.bw, 1, P.walk2);
      const off = (r % 2) * 6;
      for (let x = Math.floor(V.L / 12) * 12 + off; x < V.L + V.bw; x += 12) px.R(b, x, y - 4, 1, 4, P.walk2);
    }
    px.R(b, V.L, WD.CURB, V.bw, 4, P.curb);
    px.R(b, V.L, WD.CURB, V.bw, 1, P.curb2);
    px.R(b, V.L, WD.ROAD, V.bw, WD.H - WD.ROAD + 40, P.road);
    px.R(b, V.L, WD.ROAD, V.bw, 2, P.road2);
    for (let x = Math.floor(V.L / 30) * 30; x < V.L + V.bw; x += 30) px.R(b, x, 190, 14, 2, P.lane);
  }

  /* ---------- 우리 집 (벽돌 다세대 주택) ---------- */
  function home(b, H, G) {
    const x = H.x, w = H.w, top = 40;
    // 옥상 물탱크와 난간
    px.box(b, x + 14, top - 12, 16, 12, '#8fcfb0'); px.R(b, x + 15, top - 11, 14, 2, '#b5e2c9');
    for (let i = x + 36; i < x + w - 6; i += 5) px.R(b, i, top - 7, 1, 7, P.ink2);
    px.R(b, x + 36, top - 8, w - 42, 1, P.ink2);
    // 벽
    px.box(b, x, top, w, WD.BASE - top + 1, P.brick);
    for (let yy = top + 4; yy < WD.BASE; yy += 4) {
      px.R(b, x + 1, yy, w - 2, 1, P.brick2);
      for (let xx = x + 1 + ((yy / 4) % 2) * 4; xx < x + w - 1; xx += 8) px.R(b, xx, yy - 3, 1, 3, P.brick2);
    }
    px.R(b, x - 2, top - 1, w + 4, 3, P.cream2); px.R(b, x - 2, top - 2, w + 4, 1, P.ink);
    // 층 구분 띠
    px.R(b, x + 1, 84, w - 2, 3, P.cream2); px.R(b, x + 1, 87, w - 2, 1, P.ink2);
    // 창문 (2층)
    [x + 12, x + 50, x + 88].forEach((wx, i) => {
      px.box(b, wx, 52, 26, 22, P.glass); px.R(b, wx + 12, 53, 2, 20, '#ffffff'); px.R(b, wx + 2, 54, 3, 8, P.glassHi);
      px.R(b, wx - 2, 73, 30, 2, P.ink2);
      for (let r = wx - 1; r < wx + 28; r += 3) px.R(b, r, 69, 1, 5, P.ink2);
      px.R(b, wx - 2, 68, 30, 1, P.ink2);
      if (i === 1) { px.box(b, wx + 4, 76, 12, 7, '#e9edf3'); px.R(b, wx + 6, 78, 8, 1, P.metal); px.R(b, wx + 6, 80, 8, 1, P.metal); }
    });
    // 1층 창
    px.box(b, x + 12, 96, 34, 26, P.glass); px.R(b, x + 28, 97, 2, 24, '#ffffff'); px.R(b, x + 14, 99, 3, 9, P.glassHi);
    px.box(b, x + 52, 96, 24, 26, P.glass); px.R(b, x + 54, 99, 3, 9, P.glassHi);
    // 대문
    px.box(b, x + 88, 106, 24, WD.BASE - 106, '#6f9fd6');
    px.R(b, x + 90, 108, 20, 1, '#9cc1ea');
    for (let i = x + 91; i < x + 110; i += 4) px.R(b, i, 110, 1, 36, '#5a86bd');
    px.R(b, x + 106, 128, 2, 3, P.yellow);
    px.box(b, x + 92, 98, 16, 6, P.cream);
    G.label({ x: x + 100, y: 101, text: G.theme.world.home || '우리 집', size: 4.2, color: P.ink });
    // 화분
    [[x + 18, P.red], [x + 30, P.yellow], [x + 62, '#ff9fc0']].forEach(p => {
      const sw = Math.round(Math.sin(G.time * 1.8 + p[0]) * 0.8);
      px.box(b, p[0], 142, 9, 8, '#d98a5f'); px.disc(b, p[0] + 4 + sw, 138, 4, P.leaf); px.R(b, p[0] + 3 + sw, 135, 3, 3, p[1]);
    });
  }

  /* ---------- 이웃 가게 (세탁소·꽃집 등) ---------- */
  function filler(b, F, G) {
    const x = F.x, w = F.w, top = 64;
    const wall = F.kind ? '#fdf0da' : '#d8e6f6', sign = F.kind ? P.leaf2 : P.blue3;
    px.box(b, x, top, w, WD.BASE - top + 1, wall);
    px.R(b, x - 2, top - 2, w + 4, 4, F.kind ? P.cream2 : P.far2); px.R(b, x - 2, top - 3, w + 4, 1, P.ink);
    // 2층 창
    px.box(b, x + 14, top + 8, 30, 16, P.glass); px.box(b, x + 62, top + 8, 30, 16, P.glass);
    px.R(b, x + 28, top + 9, 2, 14, '#ffffff'); px.R(b, x + 76, top + 9, 2, 14, '#ffffff');
    // 간판
    px.box(b, x + 10, 94, w - 20, 13, sign); px.R(b, x + 11, 95, w - 22, 1, 'rgba(255,255,255,0.35)');
    G.label({ x: x + w / 2, y: 100.5, text: F.name, size: 8, color: '#ffffff' });
    // 돌출 간판 (살랑살랑)
    const swing = Math.round(Math.sin(G.time * 1.4 + x) * 1);
    px.R(b, x + w - 2, 72, 12, 2, P.ink2);
    px.R(b, x + w + 2, 74, 1, 3, P.ink2); px.R(b, x + w + 8, 74, 1, 3, P.ink2);
    px.box(b, x + w + swing, 77, 12, 12, F.kind ? P.yellow : P.pink);
    A.blit(b, A.iconSprite(F.kind ? 'star' : 'cup'), x + w + 1 + swing, 78);
    // 쇼윈도
    px.box(b, x + 8, 110, 56, 36, P.glass);
    if (F.kind === 0) {
      px.R(b, x + 10, 114, 52, 1, P.metal);
      ['#ff9f7a', '#7fb0ea', '#ffd66b', '#b69ad3', '#7fc98a'].forEach((c, i) => { px.box(b, x + 12 + i * 10, 115, 8, 14, c); px.R(b, x + 15 + i * 10, 114, 2, 2, P.ink); });
    } else {
      for (let i = 0; i < 5; i++) { px.disc(b, x + 16 + i * 10, 128, 4, P.leaf); px.R(b, x + 15 + i * 10, 123, 3, 3, ['#ff8fb1', P.yellow, P.coral, '#c5a3ff', '#ffffff'][i]); }
      px.R(b, x + 10, 134, 52, 10, P.wood3);
    }
    px.R(b, x + 10, 112, 3, 12, P.glassHi);
    // 문
    px.box(b, x + 72, 110, 26, 40, P.glass2); px.R(b, x + 85, 111, 1, 38, P.ink); px.R(b, x + 74, 113, 3, 12, P.glassHi);
    if (F.kind === 1) { // 꽃 양동이
      [[x + 12, '#ff8fb1'], [x + 24, P.yellow], [x + 36, '#c5a3ff'], [x + 48, P.coral]].forEach(p => {
        px.box(b, p[0], 146, 9, 8, P.metal2); px.disc(b, p[0] + 4, 142, 4, P.leaf); px.disc(b, p[0] + 4, 140, 2, p[1]);
      });
    }
  }

  /* ---------- 전봇대·전선 ---------- */
  function wires(b, W, V) {
    for (let i = 0; i < W.poles.length - 1; i++) {
      const a = W.poles[i] + 1, c = W.poles[i + 1] + 1;
      if (c < V.L - 10 || a > V.L + V.bw + 10) continue;
      [54, 60].forEach((y0, j) => {
        for (let x = Math.max(a, V.L); x <= Math.min(c, V.L + V.bw); x++) {
          const t = (x - a) / (c - a), sag = 4 * t * (1 - t) * (9 + j * 2);
          px.R(b, x, Math.round(y0 + sag), 1, 1, P.ink2);
        }
      });
    }
  }
  function pole(b, x) {
    px.R(b, x - 1, 46, 5, 126, P.ink); px.R(b, x, 46, 3, 126, '#c4c0cc'); px.R(b, x, 46, 1, 126, '#dad7e0');
    px.R(b, x - 7, 52, 17, 3, P.ink); px.R(b, x - 6, 53, 15, 1, '#a9a5b3');
    px.R(b, x - 6, 50, 2, 2, '#ffffff'); px.R(b, x + 7, 50, 2, 2, '#ffffff');
    px.box(b, x - 3, 66, 9, 12, '#9aa3b5');
    px.box(b, x - 1, 110, 7, 18, P.yellow); px.R(b, x, 113, 5, 1, P.ink2); px.R(b, x, 116, 5, 1, P.ink2);
  }
  function tree(b, x, t) {
    const sway = Math.round(Math.sin(t * 1.3 + x) * 0.6);
    px.R(b, x - 1, 124, 5, 48, P.ink); px.R(b, x, 124, 3, 48, P.trunk);
    px.R(b, x - 7, 169, 17, 3, P.dark2);
    px.disc(b, x + 1 + sway, 108, 14, P.leaf2); px.disc(b, x - 8 + sway, 116, 10, P.leaf2); px.disc(b, x + 11 + sway, 116, 10, P.leaf2);
    px.disc(b, x + sway, 106, 12, P.leaf); px.disc(b, x - 7 + sway, 115, 8, P.leaf); px.disc(b, x + 10 + sway, 115, 8, P.leaf);
    px.disc(b, x - 3 + sway, 101, 5, P.leaf3); px.disc(b, x + 7 + sway, 109, 3, P.leaf3);
  }

  /* ---------- 도착지 : 축제 광장 ---------- */
  function plaza(b, Z, G, t) {
    const x = Z.x, w = Z.w;
    // 천막 부스
    [[x + 8, P.coral], [x + 190, P.mint2]].forEach(p => {
      const bx = p[0];
      px.R(b, bx + 3, 112, 2, 38, P.ink2); px.R(b, bx + 49, 112, 2, 38, P.ink2);
      for (let i = 0; i < 8; i++) px.R(b, bx + i * 7, 102, 7, 11, i % 2 ? '#ffffff' : p[1]);
      px.R(b, bx, 101, 56, 1, P.ink); px.R(b, bx, 113, 56, 1, P.ink);
      for (let i = 0; i < 8; i++) px.R(b, bx + i * 7 + 2, 114, 3, 2, i % 2 ? '#ffffff' : p[1]);
      px.box(b, bx + 2, 132, 50, 14, P.wood3); px.R(b, bx + 3, 133, 48, 2, '#f3cfa0');
      [P.yellow, P.pink, P.blue, P.leaf3].forEach((c, i) => px.box(b, bx + 6 + i * 11, 126, 8, 7, c));
    });
    // 아치 게이트
    const g0 = x + 76, g1 = x + 170;
    [g0, g1].forEach(gx => { px.box(b, gx, 76, 8, WD.BASE - 74, P.yellow); px.R(b, gx + 1, 77, 2, WD.BASE - 77, '#fff0b8'); });
    px.box(b, g0 - 6, 62, g1 - g0 + 20, 18, P.coral);
    px.R(b, g0 - 5, 63, g1 - g0 + 18, 2, '#ffb194');
    G.label({ x: (g0 + g1 + 8) / 2, y: 71, text: G.theme.world.goal || '도착!', size: 9, color: '#ffffff' });
    // 깃발 가랜드
    const cols = [P.coral, P.yellow, P.mint, P.blue, P.pink];
    for (let i = 0; i <= w; i++) {
      const tt = i / w, y = Math.round(40 + 4 * tt * (1 - tt) * 8);
      px.R(b, x + i, y, 1, 1, P.ink2);
      if (i % 10 === 2 && i < w - 4) {
        const c = cols[(i / 10 | 0) % cols.length];
        for (let r = 0; r < 6; r++) px.R(b, x + i + Math.floor(r / 2), y + 1 + r, 6 - r, 1, c);
      }
    }
    // 별빛 전구 줄 : 가는 길에 모은 별 하나당 전구 2개가 켜져요
    const stars = G.W.stars, per = 2, n = stars.length * per;
    const lx0 = x + 4, lx1 = x + w - 4;
    for (let i = 0; i <= lx1 - lx0; i++) {
      const tt = i / (lx1 - lx0);
      px.R(b, lx0 + i, Math.round(90 + 4 * tt * (1 - tt) * 7), 1, 1, P.ink2);
    }
    const lit = Z.lit || 0;
    for (let k = 0; k < n; k++) {
      const tt = (k + 0.5) / n, bx = Math.round(lx0 + (lx1 - lx0) * tt), by = Math.round(90 + 4 * tt * (1 - tt) * 7) + 1;
      const st = stars[Math.floor(k / per)], on = k < lit;
      let col = P.metal;
      if (on) col = st && st.air ? ['#ffe27a', '#ffb3c7', '#9fe6d6', '#b9d2ff'][(Math.floor(t * 3) + k) % 4] : '#ffe27a';
      if (on) { b.save(); b.globalAlpha = 0.45; px.disc(b, bx + 1, by + 2, 4, '#fff6c8'); b.restore(); }
      px.R(b, bx, by - 1, 3, 1, P.ink2); px.R(b, bx - 1, by, 5, 4, P.ink); px.R(b, bx, by, 3, 3, col);
      if (on) px.R(b, bx, by, 1, 1, '#ffffff');
    }
    // 풍선
    [[x + 64, 96, P.pink], [x + 186, 90, P.blue], [x + 196, 98, P.yellow]].forEach((p, i) => {
      const by = p[1] + Math.round(Math.sin(t * 1.6 + i) * 1.5);
      px.line(b, p[0], by + 6, p[0] + 1, 132, P.ink2);
      px.ball(b, p[0], by, 5, p[2]); px.R(b, p[0] - 2, by - 3, 2, 2, '#ffffff');
    });
  }

  /* ---------- 공개 함수 ---------- */
  world.drawBack = function (b, G) {
    const V = G.view, W = G.W, t = G.time;
    sky(b, V, t);
    far(b, V);
    ground(b, V);
    const vis = (x0, x1) => x1 > V.L - 20 && x0 < V.L + V.bw + 20;
    if (vis(W.home.x, W.home.x + W.home.w)) home(b, W.home, G);
    W.fillers.forEach(F => { if (vis(F.x, F.x + F.w)) filler(b, F, G); });
    W.scenes.forEach(sc => { if (vis(sc.x - 30, sc.x + sc.w + 30)) sc.def.draw(b, sc.st, G); });
    if (vis(W.plaza.x, W.plaza.x + W.plaza.w)) plaza(b, W.plaza, G, t);
  };
  world.drawFront = function (b, G) {
    const V = G.view, W = G.W;
    wires(b, W, V);
    W.poles.forEach(x => { if (x > V.L - 12 && x < V.L + V.bw + 12) pole(b, x); });
    W.trees.forEach(x => { if (x > V.L - 30 && x < V.L + V.bw + 30) tree(b, x, G.time); });
    W.scenes.forEach(sc => { if (sc.def.drawFront) sc.def.drawFront(b, sc.st, G); });
  };
})(window.AAG);
