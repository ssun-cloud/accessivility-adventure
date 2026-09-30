/* =========================================================
 * art/pixel.js — 색상표, 픽셀 그리기 도구, 아이콘
 * 게임 화면은 1단위 = 1픽셀인 작은 캔버스에 그린 뒤 크게 확대합니다.
 * ========================================================= */
(function (A) {
  'use strict';

  /* ---------- 색상표 : 밝고 따뜻한 레트로 톤 ---------- */
  const P = A.pal = {
    ink: '#3a3150', ink2: '#5b5074', white: '#fffaf2', cream: '#fbe9c9', cream2: '#efd4a8',
    sky: ['#79c3ec', '#8ecdf0', '#a7d8f2', '#c1e4f2', '#dbeeef', '#f5eedb'],
    sun: '#fff4c9', sun2: '#ffe29a', cloud: '#ffffff', cloud2: '#e2eff7',
    mt1: '#b1d8cc', mt2: '#94c6b8', far: '#d5e3ee', far2: '#c3d4e4', farWin: '#b1c4d8',
    mid1: '#f2dfca', mid2: '#e6b9a1', mid3: '#b9d0e6', midTree: '#a3d196', midTree2: '#88c07e',
    brick: '#d98b70', brick2: '#c07058', mint: '#6fd3bd', mint2: '#44b8a0', mintDk: '#2b8f7c',
    pink: '#f7b9ad', pink2: '#e8958a', blue: '#a9caf2', blue2: '#7ea9de', blue3: '#4f7fc4',
    yellow: '#ffd76c', yellow2: '#f1b640', coral: '#ff8b66', red: '#ea6556', plum: '#8a5a8f', plum2: '#6d4574',
    glass: '#c3e8f4', glass2: '#94c9de', glassHi: '#effbfd', inside: '#5e577a',
    walk: '#ecdfc8', walk2: '#ddcdaf', curb: '#c9b697', curb2: '#e8dac0', road: '#6f6c81', road2: '#615e73', lane: '#f6e7bd',
    leaf: '#73c47d', leaf2: '#52a666', leaf3: '#9dd98f', trunk: '#9b6b4e',
    wood: '#c98c5b', wood2: '#a86e45', wood3: '#e2b27f', metal: '#8e97ab', metal2: '#c7cedc', dark: '#2e2a3f', dark2: '#433d58',
    led: '#ffb54a', ledDim: '#4a3423', chalk: '#35594b', chalk2: '#2a4a3e',
    skin: ['#f8d5b2', '#e9b48c', '#c68b62', '#9c6a48'], blush: '#f2a08f'
  };

  /* ---------- 픽셀 도구 ---------- */
  const px = A.px = {};
  px.R = (c, x, y, w, h, col) => { if (w <= 0 || h <= 0) return; c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  px.box = (c, x, y, w, h, fill, line) => { px.R(c, x, y, w, h, line || P.ink); px.R(c, x + 1, y + 1, w - 2, h - 2, fill); };
  px.disc = (c, cx, cy, r, col) => {
    cx = Math.round(cx); cy = Math.round(cy);
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(r * r - dy * dy));
      px.R(c, cx - w, cy + dy, w * 2 + 1, 1, col);
    }
  };
  px.ball = (c, cx, cy, r, fill, line) => { px.disc(c, cx, cy, r, line || P.ink); px.disc(c, cx, cy, r - 1, fill); };
  px.line = (c, x0, y0, x1, y1, col) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy; c.fillStyle = col;
    for (let i = 0; i < 2000; i++) {
      c.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  /* 체크무늬 디더(두 색 사이를 픽셀로 섞기) */
  px.dither = (c, x, y, w, h, col) => {
    c.fillStyle = col;
    for (let j = 0; j < h; j++) for (let i = (j % 2); i < w; i += 2) c.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1);
  };

  /* ---------- 문자열 지도 → 스프라이트 캔버스 ---------- */
  A.makeSprite = function (rows, map) {
    const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) { const col = map[r[x]]; if (col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); } }
    });
    return cv;
  };
  A.flipped = function (cv) {
    if (cv._flip) return cv._flip;
    const f = document.createElement('canvas'); f.width = cv.width; f.height = cv.height;
    const c = f.getContext('2d'); c.translate(cv.width, 0); c.scale(-1, 1); c.drawImage(cv, 0, 0);
    cv._flip = f; return f;
  };
  A.blit = function (c, spr, x, y, flip) { c.drawImage(flip ? A.flipped(spr) : spr, Math.round(x), Math.round(y)); };

  /* ---------- 아이콘 (10×10) : 버튼·HUD·아이템에 공통 사용 ---------- */
  const IMAP = {
    k: P.ink, w: '#ffffff', m: P.mint, M: P.mint2, y: P.yellow, Y: P.yellow2, r: P.coral, R: P.red,
    b: P.blue, B: P.blue3, g: P.metal2, G: P.metal, d: P.dark, l: P.led, s: P.skin[0], p: P.pink, o: P.wood, c: P.cream
  };
  const ICONS = A.ICONS = {
    ramp: ['..........', '..........', '........kk', '......kkmk', '....kkmmmk', '..kkmmmmmk', 'kkmmmmmmmk', 'kMMMMMMMMk', 'kkkkkkkkkk', '..........'],
    stairs: ['......kkkk', '......kyyk', '....kkkyyk', '....kyyyyk', '..kkkyyyyk', '..kyyyyyyk', 'kkkyyyyyyk', 'kyyyyyyyyk', 'kkkkkkkkkk', '..........'],
    door: ['kkkkkkkkkk', 'kppppppppk', 'kppppppppk', 'kppppppppk', 'kpppkkkppk', 'kpppkokppk', 'kpppkokppk', 'kpppkoyppk', 'kpppkokppk', 'kkkkkkkkkk'],
    slip: ['...b......', '..bBb.....', '..bBb...b.', '...b...bBb', '........b.', '.b........', 'kkkkkkkkkk', 'kbwbbwbbwk', 'kkkkkkkkkk', '..........'],
    text: ['kkkkkkkkkk', 'kddddddddk', 'kdllldlldk', 'kddddddddk', 'kdlldllldk', 'kddddddddk', 'kkkkkkkkkk', '...k..k...', '...k..k...', '..........'],
    loud: ['....k....k', '...kk..k.k', '..kgk.k.k.', 'kkggk.k.k.', 'kgggk.k.k.', 'kgggk.k.k.', 'kkggk.k.k.', '..kgk.k.k.', '...kk..k.k', '....k....k'],
    speaker: ['....k.....', '...kk.....', '..kmk..k..', 'kkmmk...k.', 'kmmmk...k.', 'kmmmk...k.', 'kkmmk...k.', '..kmk..k..', '...kk.....', '....k.....'],
    up: ['.kkkkkkkk.', '.kyyyyyyk.', '.kkkkkkkk.', '....kk....', '...kkkk...', '..kkkkkk..', '....kk....', '....kk....', '....kk....', '..........'],
    dark: ['...kkkk...', '..kGGGGk..', '.kGGGGGGk.', '.kGGGGGGk.', '.kGGGGGGk.', '..kGGGGk..', '...kggk...', '...kkkk...', '...kggk...', '....kk....'],
    small: ['kkkkkkkkkk', 'kwwwwwwwwk', 'kwwwwwwwwk', 'kwwwkkwwwk', 'kwwkrrkwwk', 'kwwwkkwwwk', 'kwwwwwwwwk', 'kwwwwwwwwk', 'kkkkkkkkkk', '..........'],
    multi: ['kkkkk.....', 'kwkwk.....', 'kwwkkkkk..', 'kwkkmmmk..', 'kkkkmkmk..', '...kmmmkkk', '...kkkkyyk', '.....kyyyk', '.....kyyyk', '.....kkkkk'],
    braille: ['kkkkkkkkkk', 'kwwwwwwwwk', 'kwkwwkwkwk', 'kwwwwwwwwk', 'kwkwwwwkwk', 'kwwwwkwwwk', 'kwkwwkwkwk', 'kwwwwwwwwk', 'kkkkkkkkkk', '..........'],
    bigtext: ['kkkkkkkkkk', 'kwwwwwwwwk', 'kwwwkkwwwk', 'kwwkwwkwwk', 'kwwkkkkwwk', 'kwwkwwkwwk', 'kwwkwwkwwk', 'kwwwwwwwwk', 'kkkkkkkkkk', '..........'],
    staff: ['.....kkkkk', '..kkk.kwwk', '.kssk.kkk.', '.kssk.k...', '..kk......', '.kmmmk....', 'kmmmmmk...', 'kmmmmmk...', 'kmmmmmk...', 'kkkkkkk...'],
    headphones: ['..kkkkkk..', '.k......k.', 'k........k', 'k........k', 'kkk....kkk', 'kmk....kmk', 'kmk....kmk', 'kmk....kmk', 'kkk....kkk', '..........'],
    cc: ['kkkkkkkkkk', 'kddddddddk', 'kdwwddwwdk', 'kdwdddwddk', 'kdwwddwwdk', 'kddddddddk', 'kkkkkkkkkk', '..........', '.kkkkkkkk.', '..........'],
    cards: ['kkkk..kkkk', 'kyyk..kbbk', 'kyyk..kbbk', 'kkkk..kkkk', '..........', 'kkkk..kkkk', 'krrk..kmmk', 'krrk..kmmk', 'kkkk..kkkk', '..........'],
    home: ['....kk....', '...kRRk...', '..kRRRRk..', '.kRRRRRRk.', 'kkkkkkkkkk', '.kccccccc.', '.kbbkcokc.', '.kbbkcokc.', '.kccccokc.', '.kkkkkkkk.'],
    shop: ['kkkkkkkkkk', 'kRwRwRwRwk', 'kkkkkkkkkk', '.kcccccck.', '.kbbkcckk.', '.kbbkcoyk.', '.kcccckok.', '.kcccckok.', '.kkkkkkkk.', '..........'],
    bus: ['..........', '.kkkkkkkk.', 'kmmmmmmmmk', 'kmbbmbbmbk', 'kmbbmbbmbk', 'kmmmmmmmmk', 'kmmmmmmmyk', 'kkkkkkkkkk', '.kgk..kgk.', '..k....k..'],
    cup: ['...k.k....', '..k.k.....', '..........', 'kkkkkkkk..', 'kwwwwwwkkk', 'kmmmmmmk.k', 'kwwwwwwkkk', '.kwwwwk...', '..kkkk....', 'kkkkkkkkk.'],
    flag: ['kk........', 'kkkkkkk...', 'kkRRRRRk..', 'kkRRRRRRk.', 'kkRRRRRk..', 'kkkkkkk...', 'kk........', 'kk........', 'kk........', 'kkkk......'],
    film: ['kkkkkkkkkk', 'kwkwkwkwkk', 'kkkkkkkkkk', 'kbbbbbbbbk', 'kbbybbbbbk', 'kbbbbbmmbk', 'kbbbbmmmbk', 'kkkkkkkkkk', 'kwkwkwkwkk', 'kkkkkkkkkk'],
    school: ['....kk....', '...kRRk...', '..kRkkRk..', '.kkkkkkkk.', 'kcccccccck', 'kcbbccbbck', 'kcbbccbbck', 'kccckkccck', 'kccckokcck', 'kkkkkkkkkk'],
    screen: ['kkkkkkkkkk', 'kbbbbbbbbk', 'kbbbbbyybk', 'kbbbbbyybk', 'kmmbbbbbbk', 'kmmmmbbmmk', 'kkkkkkkkkk', '...k..k...', '..k....k..', '..........'],
    fast: ['..........', 'r...r.....', 'rr..rr....', 'rrr.rrr...', 'rrrrrrrr..', 'rrr.rrr...', 'rr..rr....', 'r...r.....', '..........', '..........'],
    tactile: ['kkkkkkkkkk', 'kyyyyyyyyk', 'kyYyYyYyYk', 'kyyyyyyyyk', 'kyYyYyYyYk', 'kyyyyyyyyk', 'kyYyYyYyYk', 'kyyyyyyyyk', 'kkkkkkkkkk', '..........'],
    bench: ['..........', '..........', 'kkkkkkkkkk', 'kooooooook', 'kkkkkkkkkk', 'kooooooook', 'kkkkkkkkkk', '.k......k.', '.k......k.', '.k......k.'],
    toilet: ['.kkkk.....', '.kwwk.....', '.kwwk.....', '.kwwkkkkk.', '.kwwwwwwwk', '.kkwwwwwk.', '..kwwwwk..', '...kwwk...', '...kwwk...', '..kkkkkk..'],
    wide: ['kk......kk', 'kk......kk', 'kk.r..r.kk', 'kkrrrrrrkk', 'kk.r..r.kk', 'kk......kk', 'kk......kk', 'kk......kk', 'kk......kk', 'kk......kk'],
    pin: ['...kkkk...', '..krrrrk..', '.krrrrrrk.', '.krrwwrrk.', '.krrwwrrk.', '.krrrrrrk.', '..krrrrk..', '...krrk...', '....kk....', '..........'],
    star: ['....kk....', '....yk....', '...kyyk...', 'kkkkyyykkk', 'kyyyyyyyyk', '.kyyyyyyk.', '..kyyyyk..', '.kyykkyyk.', '.kyk..kyk.', '.kk....kk.']
  };
  const iconCache = {};
  A.iconSprite = name => iconCache[name] || (iconCache[name] = A.makeSprite(ICONS[name] || ICONS.star, IMAP));
  /* DOM에서 쓸 수 있는 이미지 주소(dataURL) */
  const urlCache = {};
  A.iconURL = function (name, scale) {
    scale = scale || 6; const key = name + '@' + scale;
    if (urlCache[key]) return urlCache[key];
    const s = A.iconSprite(name), cv = document.createElement('canvas');
    cv.width = s.width * scale; cv.height = s.height * scale;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(s, 0, 0, cv.width, cv.height);
    return (urlCache[key] = cv.toDataURL());
  };

  /* ---------- 말풍선 기호(5×7) ---------- */
  const GLYPH = {
    '?': ['.kkk.', 'k...k', '....k', '..kk.', '..k..', '.....', '..k..'],
    '!': ['..k..', '..k..', '..k..', '..k..', '..k..', '.....', '..k..'],
    '♪': ['..kk.', '..k.k', '..k..', '..k..', 'kkk..', 'kkk..', '.....'],
    '…': ['.....', '.....', '.....', '.....', '.....', '.....', 'k.k.k'],
    '♥': ['.....', 'kk.kk', 'kkkkk', 'kkkkk', '.kkk.', '..k..', '.....']
  };
  const glyphCache = {};
  A.glyph = (ch, col) => {
    const k = ch + col; if (glyphCache[k]) return glyphCache[k];
    return (glyphCache[k] = A.makeSprite(GLYPH[ch] || GLYPH['?'], { k: col }));
  };
  /* 머리 위 말풍선 */
  A.drawBubble = function (c, x, y, ch, t) {
    const bob = Math.round(Math.sin(t * 4) * 1);
    x = Math.round(x); y = Math.round(y) + bob;
    px.box(c, x - 5, y - 10, 11, 10, '#ffffff');
    px.R(c, x - 1, y, 3, 1, P.ink); px.R(c, x, y + 1, 1, 1, P.ink); px.R(c, x, y - 1, 1, 1, '#ffffff');
    const col = ch === '!' ? P.coral : ch === '♥' ? P.coral : P.ink;
    A.blit(c, A.glyph(ch, col), x - 2, y - 9);
  };

  /* ---------- '?' 접근성 아이템 상자 (선물 상자 느낌의 오리지널 디자인) ---------- */
  A.boxSprite = A.makeSprite([
    '...kkkkkkk...',
    '..kyyyyyyyk..',
    '.kkkkkkkkkkk.',
    '.kmmmmwmmmmk.',
    '.kmmmwwwmmmk.',
    '.kmmwmmmwmmk.',
    '.kmmmmmwmmmk.',
    '.kmmmmwmmmmk.',
    '.kMmmmmmmmMk.',
    '.kMmmmwmmmMk.',
    '.kMMMMMMMMMk.',
    '..kkkkkkkkk..'
  ], { k: P.ink, y: P.yellow, m: P.mint, M: P.mint2, w: '#ffffff' });
  A.boxLid = A.makeSprite([
    '...kkkkkkk...',
    '..kyyyyyyyk..',
    '.kkkkkkkkkkk.'
  ], { k: P.ink, y: P.yellow });
  A.boxBody = A.makeSprite([
    '.kmmmmmmmmmk.',
    '.kmmmmmmmmmk.',
    '.kmmmmmmmmmk.',
    '.kmmmmmmmmmk.',
    '.kmmmmmmmmmk.',
    '.kMmmmmmmmMk.',
    '.kMmmmmmmmMk.',
    '.kMMMMMMMMMk.',
    '..kkkkkkkkk..'
  ], { k: P.ink, m: P.mint, M: P.mint2 });

  /* ---------- 별 ---------- */
  A.starSprite = A.makeSprite([
    '...k...',
    '..kyk..',
    'kkkykkk',
    'kyyyyyk',
    '.kyyyk.',
    '.kykyk.',
    '.kk.kk.'
  ], { k: P.ink, y: P.yellow });
  A.starSprite2 = A.makeSprite([
    '...k...',
    '..kwk..',
    'kkkykkk',
    'kyywyyk',
    '.kyyyk.',
    '.kykyk.',
    '.kk.kk.'
  ], { k: P.ink, y: P.yellow, w: '#ffffff' });
})(window.AAG);
