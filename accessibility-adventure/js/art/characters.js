/* =========================================================
 * art/characters.js — 주인공(동네 탐험가), 주민, 탈것
 * 주인공은 특정 장애 유형이 아닌 '동네 탐험가' 한 명입니다.
 * 주민은 다양한 방법으로 동네를 이용하는 이웃들로 자연스럽게 등장합니다.
 * ========================================================= */
(function (A) {
  'use strict';
  const P = A.pal, px = A.px;

  /* ---------- 주인공 : 민트 모자 + 배낭을 멘 동네 탐험가 ---------- */
  const HERO_TOP = [
    '....kkkkkk....',
    '...kccccccck..',
    '..kccwcccccck.',
    '..kCCCCCCCCCCk',
    '..khhssssssk..',
    '..khsssssesk..',
    '..khssssrssk..',
    '...kssssssk...',
    '....kyyyyk....',
    '.kookyyyyyyk..',
    '.koOkyyyyyyk..',
    '.koOkyyyyyyk..',
    '.koOkYyyyysk..',
    '..kkkYYYYYYk..'
  ];
  const HERO_STAND = ['....kppppppk..', '....kppkkppk..', '....kppkkppk..', '...kwwwkkwwwk.', '...kkkkkkkkkk.'];
  const HERO_STRIDE = ['....kppppppk..', '...kppk.kppk..', '..kppk...kppk.', '.kwwwk...kwwwk', '.kkkkk...kkkkk'];
  const HERO_MAP = {
    k: P.ink, c: P.mint2, C: P.mintDk, w: '#ffffff', h: '#4b3326', s: P.skin[0], e: P.ink, r: P.blush,
    y: '#ffc94a', Y: '#e5a92a', o: P.coral, O: '#e06a47', p: '#4a5d9c'
  };

  /* ---------- 주민 : 머리 모양·옷 색을 조합해서 만듭니다 ---------- */
  const HEADS = {
    short: ['...kkkkk....', '..khhhhhk...', '.khhhhhhhk..', '.khhsssssk..', '.khsssssek..', '.khssssssk..', '..kkssssk...'],
    long: ['...kkkkk....', '..khhhhhk...', '.khhhhhhhk..', '.khhsssssk..', 'khhsssssek..', 'khhssssssk..', 'khhkssssk...'],
    cap: ['...kkkkk....', '..kccccck...', '.kcccccccck.', '.kCCCCCCCCCk', '.khsssssek..', '.khssssssk..', '..kkssssk...'],
    bun: ['..kkk.......', '.khhhkkkk...', 'khhhhhhhhk..', '.khhsssssk..', '.khsssssek..', '.khssssssk..', '..kkssssk...'],
    glasses: ['...kkkkk....', '..khhhhhk...', '.khhhhhhhk..', '.khhsssssk..', '.khsskkkkk..', '.khsssssek..', '..kkssssk...']
  };
  const TORSO = ['...kttttk...', '..kttttttk..', '..kttttttk..', '..kTttttsk..', '..kTTTTTTk..'];
  const LEG = '...kbbkbbk..';
  const STRIDE3 = ['...kbbbbbk..', '..kbbk.kbbk.', '.kbbk...kbbk'];

  function buildPerson(o) {
    const head = HEADS[o.head || 'short'];
    const legLen = o.legLen || 6;
    const stand = head.concat(TORSO);
    for (let i = 0; i < legLen; i++) stand.push(LEG);
    stand.push('..kwwwkwwwk.', '..kkkkkkkkk.');
    const stride = head.concat(TORSO);
    for (let i = 0; i < legLen - 3; i++) stride.push(LEG);
    stride.push.apply(stride, STRIDE3);
    stride.push('.kwwk...kwwk', '.kkkk...kkkk');
    const seated = head.concat(TORSO.slice(0, 4));
    const map = {
      k: P.ink, h: o.hair, s: o.skin, e: P.ink, c: o.cap || o.top, C: o.capShade || P.ink2,
      t: o.top, T: o.topShade || o.top, b: o.bottom, w: o.shoe || '#ffffff'
    };
    return {
      stand: A.makeSprite(stand, map), stride: A.makeSprite(stride, map), seated: A.makeSprite(seated, map),
      bottom: o.bottom, shoe: o.shoe || '#ffffff', skin: o.skin
    };
  }

  const LOOKS = A.LOOKS = {};
  function defineLooks() {
    const S = P.skin;
    const defs = {
      parent: { head: 'long', hair: '#5a3a2a', skin: S[1], top: '#ff9f7a', topShade: '#e27d5b', bottom: '#4b5f97' },
      rider: { head: 'short', hair: '#2f2a3a', skin: S[2], top: '#7fb0ea', topShade: '#5c8fcf', bottom: '#5d5a6e' },
      elder: { head: 'bun', hair: '#cfcbd6', skin: S[0], top: '#b69ad3', topShade: '#9679b7', bottom: '#8a6a52' },
      teen: { head: 'cap', hair: '#2f2a3a', skin: S[0], cap: '#e8675a', capShade: '#b94c42', top: '#7fc98a', topShade: '#5da86b', bottom: '#3f4f86' },
      reader: { head: 'glasses', hair: '#3c2f2a', skin: S[3], top: '#ffd66b', topShade: '#e0b246', bottom: '#40465e' },
      kid: { head: 'long', hair: '#1f1b28', skin: S[1], top: '#6fd3bd', topShade: '#48b39e', bottom: '#f39aa5', legLen: 3 },
      staff: { head: 'short', hair: '#4b3326', skin: S[1], top: '#fff4e4', topShade: '#3fae98', bottom: '#4b4a5e' },
      walker: { head: 'short', hair: '#6b4a33', skin: S[2], top: '#f2a8c4', topShade: '#d886a6', bottom: '#5a6f5e' },
      fan: { head: 'cap', hair: '#3c2f2a', skin: S[3], cap: '#44b8a0', capShade: '#2b8f7c', top: '#ffb86b', topShade: '#e39448', bottom: '#4a5d9c' }
    };
    Object.keys(defs).forEach(k => { LOOKS[k] = buildPerson(defs[k]); });
    LOOKS.hero = {
      stand: A.makeSprite(HERO_TOP.concat(HERO_STAND), HERO_MAP),
      stride: A.makeSprite(HERO_TOP.concat(HERO_STRIDE), HERO_MAP)
    };
  }

  /* ---------- 탈것·소지품 (오른쪽을 보는 기준으로 그림) ---------- */
  function wheel(c, cx, cy, r, t) {
    px.disc(c, cx, cy, r, P.ink);
    px.disc(c, cx, cy, r - 1, P.metal);
    px.disc(c, cx, cy, r - 2, '#e5e9f2');
    for (let i = 0; i < 3; i++) {
      const a = t + i * Math.PI / 3;
      px.line(c, cx - Math.cos(a) * (r - 2), cy - Math.sin(a) * (r - 2), cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), P.metal);
    }
    px.R(c, cx - 1, cy - 1, 2, 2, P.ink);
  }

  function drawWheelchair(c, a, look, t) {
    const spin = a.walking ? a.phase * 1.2 : 0;
    // 등받이·손잡이
    px.R(c, -9, -24, 2, 13, P.ink); px.R(c, -8, -23, 1, 11, P.metal2); px.R(c, -11, -24, 3, 2, P.ink);
    // 앉은 사람
    A.blit(c, look.seated, -7, -24);
    // 허벅지·종아리·신발
    px.R(c, -4, -14, 10, 4, P.ink); px.R(c, -3, -13, 8, 2, look.bottom);
    px.R(c, 3, -11, 4, 9, P.ink); px.R(c, 4, -11, 2, 8, look.bottom);
    px.R(c, 3, -3, 6, 3, P.ink); px.R(c, 4, -3, 4, 1, look.shoe);
    // 좌석 프레임·앞바퀴
    px.R(c, -8, -11, 14, 2, P.ink);
    px.line(c, 7, -9, 8, -3, P.ink);
    px.ball(c, 8, -2, 2, P.metal2);
    // 큰 바퀴 + 손
    wheel(c, -2, -8, 8, spin);
    px.R(c, -1, -16, 2, 2, look.skin);
  }

  function drawStroller(c, t, moving) {
    const sp = moving ? t * 6 : 0;
    px.line(c, 4, -12, 9, -11, P.ink);
    px.box(c, 8, -16, 13, 8, '#9fd7ec');
    px.R(c, 9, -15, 11, 1, '#c9ebf6');
    // 차양
    px.R(c, 8, -20, 7, 5, P.ink); px.R(c, 9, -19, 5, 4, P.coral); px.R(c, 9, -19, 2, 4, '#ffb194');
    px.line(c, 11, -8, 10, -3, P.ink); px.line(c, 18, -8, 19, -3, P.ink);
    wheel(c, 10, -2, 2, sp); wheel(c, 19, -2, 2, sp);
  }

  function drawCart(c) { // 짐수레
    px.line(c, 4, -12, 8, -4, P.ink);
    px.box(c, 7, -12, 10, 8, P.wood3);
    px.R(c, 8, -11, 8, 1, P.wood);
    px.ball(c, 9, -2, 2, P.metal2); px.ball(c, 15, -2, 2, P.metal2);
  }

  function carry(c, kind) {
    if (kind === 'bag') { px.R(c, 3, -8, 1, 2, P.ink); px.R(c, 5, -8, 1, 2, P.ink); px.box(c, 2, -6, 5, 5, P.pink); px.R(c, 3, -5, 3, 1, '#ffd8d0'); }
    if (kind === 'cup') { px.box(c, 3, -10, 4, 5, '#ffffff'); px.R(c, 4, -8, 2, 1, P.mint2); px.R(c, 3, -11, 4, 1, P.ink); }
    if (kind === 'flag') { px.R(c, 3, -18, 1, 14, P.ink); px.R(c, 4, -18, 6, 4, P.coral); px.R(c, 4, -18, 6, 1, P.ink); }
  }

  /* ---------- 캐릭터 그리기 (a = actor 객체) ---------- */
  A.drawActor = function (c, a, t) {
    if (a.alpha <= 0 || a.hidden) return;
    const look = LOOKS[a.look];
    if (!look) return;
    const x = Math.round(a.x), hop = a.hopY ? Math.round(a.hopY) : 0;
    const y = Math.round(a.y) + hop;
    const frameStride = a.walking && !a.ride && (Math.floor(a.phase) % 2 === 1);
    const bob = a.walking && !frameStride && !a.ride ? -1 : (!a.walking && !a.ride && a.look === 'hero' && Math.floor(t * 1.6) % 2 === 0 ? -1 : 0);
    c.save();
    if (a.alpha < 1) c.globalAlpha = a.alpha;
    // 그림자
    if (!a.noShadow) { c.globalAlpha = (a.alpha || 1) * 0.18; px.R(c, x - 6, Math.round(a.y) - 1, 13, 2, P.ink); c.globalAlpha = a.alpha < 1 ? a.alpha : 1; }
    c.translate(x, y);
    if (a.dir < 0) c.scale(-1, 1);
    if (a.ride === 'wheelchair') {
      drawWheelchair(c, a, look, t);
    } else {
      const spr = frameStride ? look.stride : look.stand;
      c.drawImage(spr, -Math.floor(spr.width / 2), -spr.height + bob);
      if (a.ride === 'stroller') drawStroller(c, t, a.walking);
      if (a.ride === 'cart') drawCart(c);
      const top = -spr.height + bob;
      if (a.acc === 'earphones') { px.R(c, -3, top + 4, 2, 2, '#ffffff'); px.R(c, -4, top + 4, 1, 2, P.ink); px.line(c, -3, top + 6, -1, top + 11, '#ffffff'); }
      if (a.acc === 'stick') { px.line(c, 5, top + 12, 7, 0, P.wood2); px.R(c, 4, top + 11, 3, 1, P.wood2); }
      if (a.acc === 'whitecane') { px.line(c, 4, top + 13, 13, -1, P.ink); px.line(c, 4, top + 12, 13, -2, '#ffffff'); px.R(c, 12, -2, 2, 2, P.red); }
      if (a.carry) carry(c, a.carry);
    }
    c.restore();
    if (a.bubble) {
      const h = a.ride === 'wheelchair' ? 24 : look.stand.height;
      A.drawBubble(c, x + (a.dir < 0 ? -1 : 1), y - h - 4, a.bubble, t);
    }
  };

  /* ---------- 마을버스 ---------- */
  A.drawBus = function (c, x, y, t, door) {
    x = Math.round(x); y = Math.round(y);
    const W = 104, H = 30, top = y - H - 4;
    // 그림자
    c.save(); c.globalAlpha = 0.2; px.R(c, x + 4, y - 1, W - 6, 3, P.ink); c.restore();
    px.box(c, x, top, W, H, '#7fcf78');
    px.R(c, x + 1, top + 1, W - 2, 3, '#a6e29a');
    px.R(c, x + 1, top + H - 7, W - 2, 6, '#5fb45c');
    px.R(c, x + 1, top + H - 8, W - 2, 1, '#ffffff');
    // 창문
    for (let i = 0; i < 6; i++) {
      const wx = x + 6 + i * 13;
      if (i === 5) continue;
      px.box(c, wx, top + 6, 11, 11, P.glass);
      px.R(c, wx + 2, top + 8, 2, 4, P.glassHi);
    }
    // 앞유리
    px.box(c, x + W - 17, top + 5, 15, 13, P.glass);
    px.R(c, x + W - 15, top + 7, 3, 6, P.glassHi);
    // 문
    const dx = x + 70;
    px.box(c, dx, top + 5, 13, H - 6, door ? P.inside : P.glass2);
    if (!door) px.R(c, dx + 6, top + 6, 1, H - 8, P.ink);
    // 행선지 전광판
    px.box(c, x + 22, top - 5, 50, 6, P.dark);
    // 라이트
    px.R(c, x + W - 3, top + H - 9, 2, 3, P.yellow);
    px.R(c, x + 1, top + H - 9, 2, 3, P.red);
    // 바퀴
    wheel(c, x + 20, y - 4, 5, -x * 0.2);
    wheel(c, x + W - 24, y - 4, 5, -x * 0.2);
    return { signX: x + 47, signY: top - 2 };
  };

  A.initLooks = defineLooks;
})(window.AAG);
