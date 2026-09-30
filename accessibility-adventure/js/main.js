/* =========================================================
 * main.js — 시작점
 * 버전 고르기:  주소 끝에 #village / #film / #school  (또는 ?theme=film)
 * ========================================================= */
(function (A) {
  'use strict';
  function pickTheme() {
    const fromHash = (location.hash || '').replace('#', '');
    let fromQuery = '';
    try { fromQuery = new URLSearchParams(location.search).get('theme') || ''; } catch (e) { /* 무시 */ }
    const id = fromHash || fromQuery;
    return A.themes[id] ? id : A.themeOrder[0];
  }
  function boot() {
    A.game.init(document.getElementById('view'));
    A.game.load(pickTheme());
  }
  const ready = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => ready.then(boot));
  else ready.then(boot);
})(window.AAG);
