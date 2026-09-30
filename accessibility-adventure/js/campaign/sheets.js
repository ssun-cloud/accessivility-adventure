/* =========================================================
 * campaign/sheets.js — 참여 결과를 Google Sheets(Apps Script)로 보내기
 * - 저장 주소(endpoint)가 비어 있으면 '미리보기 모드' : 아무것도 보내지 않습니다.
 * - 입력한 내용(특히 연락처)은 기기에 따로 저장하지 않습니다.
 * - 같은 응답을 두 번 보내도 시트에서는 응답ID로 한 번만 기록됩니다.
 * ========================================================= */
(function (A) {
  'use strict';
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function newId() {
    const r = Math.random().toString(36).slice(2, 8);
    return 'R' + Date.now().toString(36).toUpperCase() + r.toUpperCase();
  }
  function localTime(d) {
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  A.sheets = {
    isPreview() { return !((A.campaign && A.campaign.endpoint) || '').trim(); },

    /* 보너스 미션 결과 → 시트에 저장할 데이터
     * 화면 문구(label)와 저장값(key)을 함께 보냅니다. 집계는 key 로 하세요. */
    buildPayload(theme, s, memoryOptions, missions) {
      const C = A.campaign, now = new Date();
      const flags = list => { const o = {}; C.features.forEach(f => { o[f.key] = list.includes(f.key) ? 1 : 0; }); return o; };
      const labels = list => C.features.filter(f => list.includes(f.key)).map(f => (f.other ? '기타' : f.label));
      const mem = (memoryOptions || []).find(o => o.key === s.memory);
      const mis = !s.hasPlace && s.mission ? ((missions || []).find(m => m.key === s.mission.key) || s.mission) : null;
      const place = !!s.hasPlace;
      return {
        v: 2,
        id: newId(),
        submittedAt: localTime(now),
        submittedAtISO: now.toISOString(),
        campaign: theme.campaign || theme.title,
        theme: theme.id,
        memory: s.memory || '',
        memoryLabel: mem ? mem.label : '',
        everyday: flags(s.everyday || []),
        everydayLabels: labels(s.everyday || []),
        everydayOther: s.everydayOther || '',
        hasPlace: place,
        place: place ? s.place : '',
        area: place ? s.area : '',
        placeFeatures: flags(place ? s.placeFeatures : []),
        placeFeatureLabels: place ? labels(s.placeFeatures) : [],
        placeOther: place ? (s.placeOther || '') : '',
        mission: mis ? mis.key : '',
        missionText: mis ? mis.text : '',
        missionSaved: !!s.missionSaved,
        prize: !!s.prize,
        name: s.prize ? s.name : '',
        contact: s.prize ? s.contact : '',
        consent: s.prize ? !!s.consent : false,
        consentVersion: s.prize ? (C.prize.consentVersion || '') : '',
        website: s.website || '' // 스팸 방지용 빈칸(사람은 입력하지 않음)
      };
    },

    /* 보내기 : { ok, preview, unconfirmed } */
    async send(data) {
      const url = ((A.campaign && A.campaign.endpoint) || '').trim();
      if (!url) {
        if (window.console) console.info('[미리보기 모드] 저장 주소가 없어 보내지 않았어요.', data);
        await wait(500);
        return { ok: true, preview: true };
      }
      const body = JSON.stringify(data);
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, redirect: 'follow' });
        let j = null;
        try { j = await res.json(); } catch (e) { /* 응답이 JSON 이 아닐 수 있음 */ }
        if (j && j.ok) return { ok: true };
        if (j && j.ok === false) return { ok: false, reason: j.error };
        return { ok: res.ok };
      } catch (e) {
        // 브라우저가 응답을 읽지 못하는 경우(CORS 등) 한 번 더 보냅니다. 시트에서 응답ID로 중복을 거릅니다.
        try {
          await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body });
          return { ok: true, unconfirmed: true };
        } catch (e2) {
          return { ok: false };
        }
      }
    }
  };
})(window.AAG);
