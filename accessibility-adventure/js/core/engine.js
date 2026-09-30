/* =========================================================
 * core/engine.js — 화면 그리기·카메라·캐릭터 이동·트윈(애니메이션) 엔진
 * 게임 진행 순서는 js/game.js 가 정하고, 엔진은 "어떻게 움직일지"만 담당합니다.
 * ========================================================= */
(function (A) {
  'use strict';
  const U = A.util, P = A.pal, WD = A.WD;
  const FONTS = {
    display: "'Do Hyeon', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    body: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    pixel: "'Silkscreen', 'Courier New', monospace"
  };

  const E = A.engine = {
    time: 0, tweens: [], timers: [], actors: [], labels: [], tags: [],
    follow: false, room: null, fade: 0, box: null,
    cam: { x: 0, y: null, z: 1 }, view: {}, s: 1, VW: 240, VH: 200
  };

  /* ---------- 준비 ---------- */
  E.init = function (canvas) {
    E.canvas = canvas; E.ctx = canvas.getContext('2d');
    E.buf = document.createElement('canvas'); E.bctx = E.buf.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      update(dt * (E.speed || 1)); render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };
  function resize() {
    const r = E.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (E.canvas.width !== w || E.canvas.height !== h) { E.canvas.width = w; E.canvas.height = h; }
    E.dpr = dpr; E.s = Math.min(h / WD.H, w / 240); E.VW = w / E.s; E.VH = h / E.s;
  }

  /* ---------- 동네 불러오기 ---------- */
  E.load = function (theme) {
    E.theme = theme;
    E.tweens.length = 0; E.timers.length = 0; E.actors.length = 0; E.tags.length = 0;
    E.room = null; E.fade = 0; E.box = null; E.follow = false;
    A.particles.clear();
    E.W = A.world.build(theme);
    E.hero = E.addActor({ look: 'hero', x: E.W.heroStart, y: WD.LANE, dir: 1 });
    E.W.scenes.forEach(sc => sc.def.setup && sc.def.setup(E, sc.st));
    E.cam = { x: E.hero.x + 70, y: null, z: 1 };
  };

  E.addActor = function (o) {
    const a = Object.assign({ x: 0, y: WD.LANE, dir: 1, alpha: 1, phase: 0, walking: false, room: null, hopY: 0 }, o);
    if (a.route) { a.ri = 0; a.rd = 1; a.x = a.route[0][0]; a.y = a.route[0][1]; a.wait = 0.4; }
    E.actors.push(a); return a;
  };
  E.sceneOf = st => E.W.scenes.find(sc => sc.st === st);
  E.enterRoom = st => { E.room = E.sceneOf(st); E.hero.room = E.room; };
  E.exitRoom = () => { E.room = null; E.hero.room = null; };

  /* ---------- 트윈·타이머 ---------- */
  E.tween = function (obj, props, ms, ease, onUpdate) {
    return new Promise(res => {
      const from = {}; Object.keys(props).forEach(k => { from[k] = obj[k]; });
      E.tweens.push({ obj, props, from, dur: Math.max(0.001, ms / 1000), t: 0, ease: U.ease[ease || 'inOut'] || U.ease.inOut, res, onUpdate });
    });
  };
  E.wait = ms => new Promise(res => E.timers.push({ t: ms / 1000, fn: res }));
  E.after = (ms, fn) => E.timers.push({ t: ms / 1000, fn });
  E.sfx = name => A.audio.play(name);
  E.emit = (x, y, kind) => A.particles.spawn(x, y, kind);
  E.burst = (x, y, kind, n) => A.particles.burst(x, y, kind, n || 10);

  /* ---------- 걷기·점프 ---------- */
  E.walkActor = async function (a, x, speed, y) {
    const dx = x - a.x, dy = y == null ? 0 : y - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.5) return;
    if (Math.abs(dx) > 0.3) a.dir = dx > 0 ? 1 : -1;
    a.walking = true;
    const props = { x }; if (y != null) props.y = y;
    await E.tween(a, props, dist / (speed || 44) * 1000, 'linear');
    a.walking = false;
  };
  E.walkTo = (x, o) => E.walkActor(E.hero, x, (o && o.speed) || 46, o && o.y);
  E.walkPath = async function (pts, speed) { for (const p of pts) await E.walkActor(E.hero, p[0], speed, p[1]); };
  E.hopTo = async function (x, y, ms) {
    const h = E.hero; h.dir = x >= h.x ? 1 : -1; h.arcP = 0; h.arcOn = true;
    await E.tween(h, { x, y, arcP: 1 }, ms || 240, 'linear');
    h.arcOn = false;
  };
  E.jump = () => { E.hero.jumpT = 0.36; };
  /* 참여자가 누르는 점프 (이동 중에만, 안 눌러도 별은 자동으로 모여요) */
  E.playerJump = function () {
    const h = E.hero;
    if (!h || E.room || !h.walking || h.jumpT > 0 || h.arcOn) return false;
    E.jump(); E.sfx('hop'); return true;
  };

  /* ---------- 카메라 ---------- */
  const defaultY = z => WD.H - (E.VH / z) / 2;
  E.camTo = async function (t, ms) {
    const z = t.z || 1;
    if (E.cam.y == null) E.cam.y = defaultY(E.cam.z);
    const ty = t.y == null ? defaultY(z) : t.y;
    const dur = U.reducedMotion() ? Math.min(ms, 250) : ms;
    await E.tween(E.cam, { x: t.x == null ? E.cam.x : t.x, y: ty, z }, dur, 'inOut');
    if (t.y == null) E.cam.y = null;
  };
  E.snapCam = x => { E.cam = { x: x == null ? E.hero.x + E.hero.dir * 18 : x, y: null, z: 1 }; };
  E.wipe = to => E.tween(E, { fade: to }, U.reducedMotion() ? 200 : 450, 'inOut');
  E.worldToClient = function (x, y) {
    const v = E.view, S = E.s * E.cam.z / E.dpr;
    return { x: (x - v.left) * S, y: (y - v.top) * S };
  };

  /* ---------- '?' 아이템 상자 ---------- */
  E.showBox = async function (pos, icon) {
    E.box = { x: pos.x, y: pos.y, appear: 0, open: 0, shake: 0, icon, pow: 0 };
    E.sfx('pop');
    await E.tween(E.box, { appear: 1 }, 450, 'back');
  };
  E.shakeBox = function () { if (!E.box) return; E.box.shake = 1; E.tween(E.box, { shake: 0 }, 500, 'out'); };
  E.openBox = async function () {
    const bx = E.box; if (!bx) return;
    E.sfx('open');
    E.burst(bx.x, bx.y, 'spark', 16);
    E.tween(bx, { pow: 1 }, 200, 'out');
    await E.tween(bx, { open: 1 }, 600, 'out');
    await E.wait(250);
    await E.tween(bx, { appear: 0, pow: 0 }, 300, 'in');
    E.box = null;
  };
  function drawBox(b) {
    const bx = E.box; if (!bx || bx.appear <= 0) return;
    const t = E.time, sc = Math.max(0.01, bx.appear);
    const shake = Math.sin(t * 50) * bx.shake * 2;
    const bob = Math.round(Math.sin(t * 3) * 1.5);
    const x = Math.round(bx.x + shake), y = Math.round(bx.y + bob);
    if (bx.open <= 0) {
      // 반짝이는 테두리
      if (bx.appear >= 1 && Math.floor(t * 3) % 2 === 0) { A.px.R(b, x - 9, y - 1, 1, 2, '#ffffff'); A.px.R(b, x + 9, y - 3, 1, 2, '#ffffff'); A.px.R(b, x - 1, y - 11, 2, 1, '#ffffff'); }
      const s = A.boxSprite, w = s.width * sc, h = s.height * sc;
      b.drawImage(s, Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
    } else {
      b.save(); b.globalAlpha = Math.min(1, bx.appear);
      b.drawImage(A.boxBody, x - 6, y - 3);
      b.drawImage(A.boxLid, x - 6, Math.round(y - 6 - bx.open * 7));
      const ic = A.iconSprite(bx.icon);
      b.drawImage(ic, x - 5, Math.round(y - 8 - bx.open * 16));
      b.restore();
      if (bx.pow > 0) E.label({ x: x + 16, y: y - 22, text: '뿅!', size: 9, color: P.coral, stroke: '#ffffff', alpha: bx.pow * bx.appear });
    }
  }

  /* ---------- 글자 라벨 (선명한 글꼴로 따로 그림) ---------- */
  E.label = o => { E.labels.push(o); };
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function drawLabels(c, left, top, S) {
    E.labels.forEach(l => {
      const fs = l.size * S;
      if (fs < 7 || (l.alpha != null && l.alpha <= 0.01)) return;
      const sx = (l.x - left) * S, sy = (l.y - top) * S;
      c.save();
      c.globalAlpha = l.alpha == null ? 1 : Math.min(1, l.alpha);
      c.font = (l.weight || 400) + ' ' + fs + 'px ' + (FONTS[l.font || 'display']);
      c.textBaseline = 'middle';
      c.textAlign = l.align || 'center';
      let tx = sx;
      if (l.clip) {
        const cx = (l.clip.x - left) * S, cy = (l.clip.y - top) * S, cw = l.clip.w * S, ch = l.clip.h * S;
        c.beginPath(); c.rect(cx, cy, cw, ch); c.clip();
        if (l.marquee) {
          const tw = c.measureText(l.text).width;
          c.textAlign = 'left';
          if (tw < cw - 6 * S) tx = cx + (cw - tw) / 2;
          else {
            const period = tw + cw * 0.6, hold = 1.2;
            const tt = Math.max(0, (E.time % (period / (l.marquee * S) + hold)) - hold);
            tx = cx + 3 * S - tt * l.marquee * S;
            if (tx + tw < cx + cw) { c.fillStyle = l.color; if (l.glow) { c.shadowColor = l.glow; c.shadowBlur = 2 * S; } c.fillText(l.text, tx + period, sy); }
          }
        }
      }
      if (l.bg) {
        const tw = c.measureText(l.text).width, pad = (l.pad || 2) * S;
        const bw = tw + pad * 2, bh = fs + pad * 1.4;
        const bx = c.textAlign === 'left' ? sx - pad : c.textAlign === 'right' ? sx - tw - pad : sx - bw / 2, by = sy - bh / 2;
        const lw = Math.max(1.5, S * 0.7);
        c.fillStyle = l.border || P.ink;
        roundRect(c, bx - lw, by - lw, bw + lw * 2, bh + lw * 2, 3 * S);
        c.fill();
        if (l.bubble) {
          const tipX = l.bubble === 'left' ? bx + 4 * S : l.bubble === 'right' ? bx + bw - 4 * S : bx + bw / 2;
          const dx = l.bubble === 'left' ? -4 * S : l.bubble === 'right' ? 4 * S : 0;
          c.beginPath(); c.moveTo(tipX - 3 * S, by + bh); c.lineTo(tipX + 3 * S, by + bh); c.lineTo(tipX + dx, by + bh + 5 * S); c.closePath(); c.fill();
          c.fillStyle = l.bg;
          c.beginPath(); c.moveTo(tipX - 3 * S + lw, by + bh - 1); c.lineTo(tipX + 3 * S - lw, by + bh - 1); c.lineTo(tipX + dx * 0.7, by + bh + 5 * S - lw * 2); c.closePath(); c.fill();
        }
        c.fillStyle = l.bg; roundRect(c, bx, by, bw, bh, 2.4 * S); c.fill();
      }
      if (l.stroke) { c.lineJoin = 'round'; c.lineWidth = Math.max(2, S * 1.2); c.strokeStyle = l.stroke; c.strokeText(l.text, tx, sy); }
      if (l.glow) { c.shadowColor = l.glow; c.shadowBlur = 2 * S; }
      c.fillStyle = l.color || P.ink;
      c.fillText(l.text, tx, sy);
      c.restore();
    });
  }

  /* ---------- 매 프레임 갱신 ---------- */
  function routeStep(a, dt) {
    if (a.wait > 0) { a.wait -= dt; a.walking = false; return; }
    const ni = a.ri + a.rd;
    if (ni < 0 || ni >= a.route.length) { a.rd = -a.rd; a.wait = a.pause || 1; return; }
    const tx = a.route[ni][0], ty = a.route[ni][1];
    const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), step = a.speed * dt;
    if (Math.abs(dx) > 0.2) a.dir = dx > 0 ? 1 : -1;
    a.walking = true;
    if (d <= step) { a.x = tx; a.y = ty; a.ri = ni; }
    else { a.x += dx / d * step; a.y += dy / d * step; }
  }
  function update(dt) {
    E.time += dt;
    for (let i = E.timers.length - 1; i >= 0; i--) { const tm = E.timers[i]; tm.t -= dt; if (tm.t <= 0) { E.timers.splice(i, 1); tm.fn(); } }
    for (let i = 0; i < E.tweens.length; i++) {
      const tw = E.tweens[i];
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.dur), e = tw.ease(p);
      Object.keys(tw.props).forEach(k => { tw.obj[k] = U.lerp(tw.from[k], tw.props[k], e); });
      if (tw.onUpdate) tw.onUpdate(p);
      if (p >= 1) { E.tweens.splice(i, 1); i--; tw.res(); }
    }
    if (!E.W) return;
    E.actors.forEach(a => {
      if (a.route && a.speed) routeStep(a, dt);
      a.phase = a.walking ? a.phase + dt * 7 : 0;
    });
    const h = E.hero;
    if (h) {
      let hy = 0;
      if (h.bouncy && h.walking) hy -= Math.abs(Math.sin(h.phase * Math.PI / 2)) * 2.5;
      if (h.jumpT > 0) { h.jumpT -= dt; hy -= Math.sin(Math.PI * (1 - Math.max(0, h.jumpT) / 0.36)) * 8; }
      if (h.arcOn) hy -= Math.sin(Math.PI * h.arcP) * 5;
      h.hopY = hy;
      if (!E.room) {
        E.W.stars.forEach(s => {
          if (!s.taken && Math.abs(h.x - s.x) < 5) {
            s.taken = true;
            s.air = h.jumpT > 0;                                  // 점프해서 잡은 별 = 반짝 보너스
            E.burst(s.x, s.y, 'spark', s.air ? 22 : 10); E.sfx(s.air ? 'starAir' : 'star');
            if (!(h.jumpT > 0)) E.jump();
            E.tween(s, { pop: 1 }, 400, 'out');
          }
        });
      }
      if (E.follow) {
        const target = h.x + h.dir * 22;
        E.cam.x += (target - E.cam.x) * Math.min(1, dt * 2.6);
      }
    }
    // 엔딩 태그
    E.tags.forEach(tg => {
      if (!tg.on && E.view.left != null && E.view.left + E.view.vw * 0.7 > tg.x) {
        tg.on = true; E.tween(tg, { a: 1 }, 400, 'back'); E.sfx('pop'); E.burst(tg.x, tg.y + 6, 'spark', 8);
      }
    });
    A.particles.update(dt);
  }

  /* ---------- 그리기 ---------- */
  function drawStars(b) {
    const t = E.time;
    E.W.stars.forEach((s, i) => {
      if (s.taken && s.pop >= 1) return;
      const y = s.y + Math.round(Math.sin(t * 3 + i) * 1.5) - (s.taken ? s.pop * 10 : 0);
      b.save(); if (s.taken) b.globalAlpha = 1 - s.pop;
      A.blit(b, Math.floor(t * 4 + i) % 4 === 0 ? A.starSprite2 : A.starSprite, s.x - 3, y - 3);
      b.restore();
    });
  }

  function render() {
    const c = E.ctx; if (!c || !E.W) return;
    const cw = E.canvas.width, ch = E.canvas.height;
    const z = E.cam.z || 1, S = E.s * z;
    const vw = E.VW / z, vh = E.VH / z;
    const worldW = E.room ? E.room.def.roomWidth() : E.W.width;
    let left = E.cam.x - vw / 2;
    left = vw >= worldW ? (worldW - vw) / 2 : U.clamp(left, 0, worldW - vw);
    const maxTop = WD.H - vh, minTop = Math.min(WD.H - E.VH, maxTop);
    const top = E.cam.y == null ? maxTop : U.clamp(E.cam.y - vh / 2, minTop, maxTop);
    const L = Math.floor(left), T = Math.floor(top), bw = Math.ceil(vw) + 2, bh = Math.ceil(vh) + 2;
    if (E.buf.width !== bw || E.buf.height !== bh) { E.buf.width = bw; E.buf.height = bh; }
    const b = E.bctx;
    b.setTransform(1, 0, 0, 1, -L, -T);
    b.imageSmoothingEnabled = false;
    b.clearRect(L, T, bw, bh);
    E.view = { left, top, L, T, bw, bh, vw, vh };
    E.labels.length = 0;

    if (E.room) E.room.def.drawRoom(b, E.room.st, E);
    else { A.world.drawBack(b, E); drawStars(b); }
    const here = E.room || null;
    E.actors.filter(a => (a.room || null) === here && !a.hidden).sort((p, q) => p.y - q.y).forEach(a => A.drawActor(b, a, E.time));
    if (!E.room) A.world.drawFront(b, E);
    drawBox(b);
    A.particles.draw(b);
    if (!E.room) E.tags.forEach(tg => { if (tg.a > 0) E.label({ x: tg.x, y: tg.y, text: '✓ ' + tg.text, size: 7, color: '#ffffff', bg: P.mintDk, border: P.ink, pad: 2.4, bubble: 'down', alpha: tg.a, weight: 400 }); });

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.drawImage(E.buf, 0, 0, bw, bh, (L - left) * S, (T - top) * S, bw * S, bh * S);
    drawLabels(c, left, top, S);

    if (E.fade > 0.001) {
      const h = E.hero, hx = (h.x - left) * S, hy = (h.y - 10 - top) * S;
      const R = Math.hypot(cw, ch) * (1 - E.fade);
      c.fillStyle = '#2b2540';
      c.beginPath(); c.rect(0, 0, cw, ch);
      if (R > 1) c.arc(hx, hy, R, 0, Math.PI * 2, true);
      c.fill('evenodd');
    }
  }
})(window.AAG);
