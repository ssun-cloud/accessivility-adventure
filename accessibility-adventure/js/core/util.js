/* =========================================================
 * core/util.js — 공용 네임스페이스와 작은 도구들
 * 모든 파일은 window.AAG(Accessibility Adventure Game) 아래에 등록됩니다.
 * (ES 모듈 대신 일반 <script>를 써서, index.html을 더블클릭해도 바로 실행됩니다.)
 * ========================================================= */
window.AAG = window.AAG || {};
(function (A) {
  'use strict';

  const U = {};
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.ease = {
    linear: t => t,
    inOut: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    back: t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  U.reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  U.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.lines = s => (Array.isArray(s) ? s : String(s || '').split('\n'));

  A.util = U;

  /* ---- 테마(캠페인 버전) 등록소 ---- */
  A.themes = {};
  A.themeOrder = [];
  A.registerTheme = function (theme) {
    A.themes[theme.id] = theme;
    if (!A.themeOrder.includes(theme.id)) A.themeOrder.push(theme.id);
  };

  /* ---- 장면(스테이지 연출) 등록소 ---- */
  A.scenes = {};
  A.registerScene = function (name, def) { A.scenes[name] = def; };
})(window.AAG);
