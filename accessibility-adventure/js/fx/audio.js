/* =========================================================
 * fx/audio.js — 효과음 (파일 없이 브라우저에서 직접 합성)
 * 소리는 첫 버튼을 누른 뒤부터 납니다. 화면 오른쪽 위 버튼으로 끌 수 있어요.
 * ========================================================= */
(function (A) {
  'use strict';
  let ctx = null, master = null, muted = false;

  function ensure() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  function tone(f, t, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.linearRampToValueAtTime(f + o.slide, t + dur);
    const v = o.vol == null ? 0.15 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  const SFX = {
    tap: t => tone(N(84), t, 0.05, { vol: 0.06 }),
    step: t => tone(N(60), t, 0.03, { type: 'triangle', vol: 0.04 }),
    hmm: t => { tone(N(67), t, 0.16, { type: 'triangle', vol: 0.16 }); tone(N(64), t + 0.15, 0.24, { type: 'triangle', vol: 0.14 }); },
    pop: t => { tone(N(72), t, 0.07, { vol: 0.1, slide: 380 }); tone(N(84), t + 0.06, 0.12, { vol: 0.08 }); },
    open: t => { tone(N(76), t, 0.06, { vol: 0.1 }); tone(N(83), t + 0.06, 0.06, { vol: 0.1 }); tone(N(88), t + 0.12, 0.18, { vol: 0.1 }); },
    build: t => [60, 64, 67, 72, 76].forEach((n, i) => tone(N(n), t + i * 0.08, 0.1, { vol: 0.07 })),
    item: t => { [72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * 0.09, 0.2, { type: 'triangle', vol: 0.2 })); tone(N(88), t + 0.36, 0.5, { type: 'triangle', vol: 0.16 }); },
    chime: t => { tone(N(76), t, 1.1, { type: 'sine', vol: 0.3 }); tone(N(72), t + 0.45, 1.3, { type: 'sine', vol: 0.3 }); },
    voice: t => { for (let i = 0; i < 9; i++) tone(N(57 + ((i * 7) % 5)), t + i * 0.09, 0.08, { type: 'triangle', vol: 0.07 }); },
    hop: t => tone(N(67), t, 0.12, { type: 'square', vol: 0.06, slide: 260 }),
    starAir: t => [88, 92, 95, 100].forEach((n, i) => tone(N(n), t + i * 0.05, 0.1, { vol: 0.06 })),
    bulb: t => tone(N(84), t, 0.08, { type: 'triangle', vol: 0.08 }),
    star: t => { tone(N(88), t, 0.06, { vol: 0.05 }); tone(N(95), t + 0.05, 0.1, { vol: 0.05 }); },
    door: t => { tone(N(79), t, 0.12, { type: 'sine', vol: 0.14 }); tone(N(84), t + 0.1, 0.2, { type: 'sine', vol: 0.14 }); },
    bus: t => { tone(N(50), t, 0.3, { type: 'sawtooth', vol: 0.04 }); tone(N(55), t + 0.32, 0.35, { type: 'sawtooth', vol: 0.04 }); },
    fanfare: t => {
      const seq = [[67, 0, 0.12], [67, 0.13, 0.12], [67, 0.26, 0.12], [72, 0.4, 0.5], [76, 0.95, 0.14], [74, 1.1, 0.14], [76, 1.25, 0.14], [79, 1.4, 0.8]];
      seq.forEach(s => { tone(N(s[0]), t + s[1], s[2] + 0.05, { type: 'square', vol: 0.09 }); tone(N(s[0] - 12), t + s[1], s[2] + 0.05, { type: 'triangle', vol: 0.12 }); });
    }
  };

  A.audio = {
    unlock: ensure,
    play(name) { if (muted || !SFX[name]) return; if (!ensure()) return; try { SFX[name](ctx.currentTime + 0.01); } catch (e) { /* 무시 */ } },
    setMuted(v) { muted = !!v; },
    isMuted: () => muted
  };
})(window.AAG);
