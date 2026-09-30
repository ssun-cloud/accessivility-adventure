/* =========================================================
 * fx/particles.js — 반짝이·음표·색종이 효과
 * ========================================================= */
(function (A) {
  'use strict';
  const P = A.pal, px = A.px;
  const COLORS = [P.yellow, P.coral, P.mint, P.blue, P.pink, '#ffffff'];

  A.particles = {
    list: [],
    clear() { this.list.length = 0; },
    spawn(x, y, kind) {
      const r = Math.random;
      const p = { x, y, kind, life: 0, vx: 0, vy: 0, g: 0 };
      if (kind === 'spark') { const a = r() * Math.PI * 2, s = 12 + r() * 26; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s - 10; p.g = 30; p.max = 0.5 + r() * 0.4; p.col = r() < 0.6 ? P.yellow : '#ffffff'; }
      else if (kind === 'confetti') { p.vx = (r() - 0.5) * 50; p.vy = -40 - r() * 50; p.g = 60; p.max = 2.2 + r(); p.col = COLORS[(r() * COLORS.length) | 0]; p.w = r() < 0.5 ? 2 : 1; }
      else if (kind === 'note') { p.vx = (r() - 0.5) * 10; p.vy = -18; p.max = 1.2; p.col = P.coral; }
      else { p.max = 0.6; p.col = P.yellow; }
      this.list.push(p);
    },
    burst(x, y, kind, n) { const lim = A.util.reducedMotion() ? Math.ceil(n / 3) : n; for (let i = 0; i < lim; i++) this.spawn(x, y, kind); },
    update(dt) {
      const L = this.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const p = L[i];
        p.life += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.kind === 'confetti') p.vx *= 0.98;
        if (p.life >= p.max) L.splice(i, 1);
      }
    },
    draw(b) {
      this.list.forEach(p => {
        const k = 1 - p.life / p.max;
        if (p.kind === 'spark') {
          if (k > 0.5) { px.R(b, p.x - 1, p.y, 3, 1, p.col); px.R(b, p.x, p.y - 1, 1, 3, p.col); }
          else px.R(b, p.x, p.y, 1, 1, p.col);
        } else if (p.kind === 'confetti') {
          px.R(b, p.x, p.y, p.w, Math.sin(p.life * 12) > 0 ? 2 : 1, p.col);
        } else if (p.kind === 'note') {
          b.save(); b.globalAlpha = Math.min(1, k * 2);
          A.blit(b, A.glyph('♪', p.col), p.x - 2, p.y - 4);
          b.restore();
        }
      });
    }
  };
})(window.AAG);
