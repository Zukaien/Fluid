'use strict';
// Fluid – sesli arama istemcisi (WebRTC mesh: her konuşan diğer herkesle doğrudan bağlanır).
// index.html'deki ana betikten sonra yüklenir; S, api, av, gav, ic, t, esc, isG, G, openChat gibi global'leri kullanır.
(() => {
  const FB = [{ urls: 'stun:stun.l.google.com:19302' }];
  let cur = null, ring = null, rtm = null, rto = null, AC = null;

  Object.assign(EN, { 'Sesli arama': 'Voice call', 'Grup araması': 'Group call', 'Bağlanıyor…': 'Connecting…', 'Bekleniyor…': 'Waiting…', 'Mikrofon izni verilmedi': 'Microphone permission was not granted', 'Bu tarayıcı sesli aramayı desteklemiyor': 'This browser does not support voice calls', 'Zaten bir aramadasın': 'You are already in a call', 'Sohbet bulunamadı': 'Chat not found', 'Arama dolu': 'The call is full', 'Arama bulunamadı': 'Call not found', 'Kabul et': 'Accept', 'Reddet': 'Decline', 'Sessize al': 'Mute', 'Aramayı bitir': 'End call' });

  // ---- simgeler (geometrik, emojisiz) ve stil ----
  document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M6 3.5h3l1.6 4.2-2.1 1.5a11.5 11.5 0 0 0 6.3 6.3l1.5-2.1 4.2 1.6v3a2 2 0 0 1-2 2C10.6 20.5 3.5 13.9 3.5 5.5a2 2 0 0 1 2.5-2z"/></symbol>
<symbol id="i-hang" viewBox="0 0 24 24"><g transform="rotate(135 12 12)"><path d="M6 3.5h3l1.6 4.2-2.1 1.5a11.5 11.5 0 0 0 6.3 6.3l1.5-2.1 4.2 1.6v3a2 2 0 0 1-2 2C10.6 20.5 3.5 13.9 3.5 5.5a2 2 0 0 1 2.5-2z"/></g></symbol>
<symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/></symbol>
<symbol id="i-micoff" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/><path d="M4 4l16 16"/></symbol>
</svg><div id="caudio" style="position:fixed;width:0;height:0;overflow:hidden"></div>`);
  document.head.insertAdjacentHTML('beforeend', `<style>
#call,#cin{position:fixed;z-index:40;right:18px;top:18px;width:min(320px,calc(100vw - 20px));border-radius:22px;padding:14px;display:grid;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);animation:in .5s var(--ease)}
.mobile #call,.mobile #cin{left:10px;right:10px;width:auto;top:calc(10px + env(safe-area-inset-top))}
#call .ch{display:flex;justify-content:space-between;align-items:baseline;gap:10px}#call .ch b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#call .ch small{color:var(--mut);flex:none}
#call .cp{display:flex;flex-wrap:wrap;gap:10px}
#call .cu{display:grid;justify-items:center;gap:4px;width:62px;font-size:12px}#call .cu span{max-width:62px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#call .cu .av{transition:box-shadow .2s}#call .cu.sp .av{box-shadow:0 0 0 3px #5dffa8,0 0 18px #5dffa8}
.cb{display:flex;gap:12px;justify-content:center}
.cb .ghost,.cb .btn{width:50px;height:50px;border-radius:50%;padding:0;display:grid;place-items:center}.cb .ic{width:22px;height:22px}
.cb .ghost.off{background:rgba(255,120,150,.25);color:#ff9fb2;border-color:rgba(255,120,150,.5)}
#cin .who{display:flex;align-items:center;gap:12px}#cin .who>div{min-width:0}#cin .who b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#cin .who small{color:var(--mut)}
#cin .av{animation:cring 1.2s ease-in-out infinite}
@keyframes cring{50%{box-shadow:0 0 0 7px rgba(var(--ar),.25)}}
#callb.on{color:#5dffa8;border-color:#5dffa8}
</style>`);

  // ---- yardımcılar ----
  const nm = c => isG(c) ? (G(c) ? G(c).name : 'Grup') : c;
  const uo = u => S.me.u == u ? S.me : S.users.find(z => z.u == u) || S.groups.flatMap(g => g.members).find(z => z.u == u) || { u, av: 0 };
  const fmt = ms => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const ctx = () => { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state == 'suspended') AC.resume().catch(() => {}); return AC; };
  const mkAn = st => { const a = ctx().createAnalyser(); a.fftSize = 512; ctx().createMediaStreamSource(st).connect(a); return a; };
  const lvl = a => { if (!a) return 0; const b = a.buf || (a.buf = new Uint8Array(a.fftSize)); a.getByteTimeDomainData(b); let m = 0; for (const v of b) { const d = Math.abs(v - 128); if (d > m) m = d; } return m; };
  const sig = (to, d) => { if (cur) api('POST', '/call/signal', { c: cur.c, to, d }).catch(() => {}); };
  const sdp = d => ({ type: d.type, sdp: d.sdp });

  // ---- arama zili ----
  function ringOn() {
    ringOff();
    const beep = () => { try { const c = ctx(), t0 = c.currentTime; [0, .22].forEach((d, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = i ? 520 : 440;
      g.gain.setValueAtTime(0, t0 + d); g.gain.linearRampToValueAtTime(.12, t0 + d + .02); g.gain.exponentialRampToValueAtTime(.001, t0 + d + .4); o.connect(g); g.connect(c.destination); o.start(t0 + d); o.stop(t0 + d + .45); }); } catch (e) {} };
    beep(); rtm = setInterval(beep, 2200);
  }
  const ringOff = () => { clearInterval(rtm); rtm = null; };

  // ---- gelen arama kartı ----
  function showIn(c, from) {
    if (cur || ring) return;
    ring = { c, from }; ringOn();
    const g = isG(c), el = document.createElement('div'); el.id = 'cin'; el.className = 'glass';
    el.innerHTML = `<div class="who">${g ? gav(G(c) || { name: '' }, 's') : av(uo(from), 's')}<div><b>${esc(g ? nm(c) : from)}</b><small>${g ? esc(from) + ' · ' + t('Grup araması') : t('Sesli arama')}</small></div></div>
    <div class="cb"><button class="btn red" id="cno" title="${t('Reddet')}">${ic('hang')}</button><button class="btn" id="cyes" title="${t('Kabul et')}">${ic('phone')}</button></div>`;
    document.body.appendChild(el);
    $('#cyes').onclick = () => join(c);
    $('#cno').onclick = () => { if (!isG(c)) api('POST', '/call/decline', { c }).catch(() => {}); hideIn(); };
    rto = setTimeout(hideIn, 45000);
    const s = S.me.settings; if (s.notify && document.hidden && window.Notification && Notification.permission == 'granted') new Notification(nm(c) || from, { body: t('Sesli arama') });
  }
  function hideIn() { ringOff(); clearTimeout(rto); ring = null; const e = $('#cin'); if (e) e.remove(); }

  // ---- arama paneli ----
  function render() {
    let el = $('#call');
    if (!cur) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'call'; el.className = 'glass'; document.body.appendChild(el); }
    const all = [S.me.u, ...cur.users];
    el.innerHTML = `<div class="ch"><b>${esc(nm(cur.c))}</b><small id="ctm"></small></div>
    <div class="cp">${all.map(u => `<div class="cu" data-u="${esc(u)}">${av(uo(u), 's')}<span>${esc(u == S.me.u ? t('Sen') : u)}</span></div>`).join('')}</div>
    <div class="cb"><button class="ghost ${cur.muted ? 'off' : ''}" id="cmu" title="${t('Sessize al')}">${ic(cur.muted ? 'micoff' : 'mic')}</button><button class="btn red" id="chg" title="${t('Aramayı bitir')}">${ic('hang')}</button></div>`;
    $('#cmu').onclick = () => { cur.muted = !cur.muted; cur.stream.getAudioTracks().forEach(x => x.enabled = !cur.muted); render(); };
    $('#chg').onclick = () => hangup();
    tick();
  }
  function tick() {
    if (!cur) return;
    const el = $('#ctm'), conn = [...cur.pcs.values()].some(p => p.ok);
    if (el) el.textContent = conn ? fmt(Date.now() - cur.t0) : cur.users.size ? t('Bağlanıyor…') : t(isG(cur.c) ? 'Bekleniyor…' : 'Aranıyor…');
    const sp = (u, on) => { const e = document.querySelector(`#call .cu[data-u="${CSS.escape(u)}"]`); if (e) e.classList.toggle('sp', on); };
    sp(S.me.u, !cur.muted && lvl(cur.an) > 14);
    for (const [u, p] of cur.pcs) sp(u, lvl(p.an) > 14);
  }
  function hdrState() { const b = $('#callb'); if (b) b.classList.toggle('on', !!cur && cur.c == S.cur); }

  // ---- eşler ----
  function closePeer(u) {
    const p = cur && cur.pcs.get(u); if (!p) return;
    try { p.pc.close(); } catch (e) {} if (p.a) p.a.remove(); try { if (p.an) p.an.disconnect(); } catch (e) {}
    cur.pcs.delete(u);
  }
  function mkPeer(u) {
    closePeer(u);
    const pc = new RTCPeerConnection({ iceServers: cur.ice }), p = { pc, u, ok: false, rd: false, q: cur.early[u] || [] };
    delete cur.early[u];
    cur.stream.getTracks().forEach(tr => pc.addTrack(tr, cur.stream));
    pc.onicecandidate = e => { if (e.candidate) sig(u, { ice: e.candidate }); };
    pc.ontrack = e => {
      const a = document.createElement('audio'); a.autoplay = true; a.setAttribute('playsinline', ''); a.srcObject = e.streams[0];
      $('#caudio').appendChild(a); a.play().catch(() => {}); p.a = a; try { p.an = mkAn(e.streams[0]); } catch (x) {}
    };
    pc.onconnectionstatechange = () => {
      if (!cur || cur.pcs.get(u) !== p) return;
      const s = pc.connectionState; p.ok = s == 'connected'; if (p.ok && !cur.t0) cur.t0 = Date.now();
      if (s == 'failed' && p.init && !p.rs) { p.rs = 1; offer(p, true); }
      tick();
    };
    cur.pcs.set(u, p); return p;
  }
  async function offer(p, restart) {
    try {
      if (restart && p.pc.restartIce) p.pc.restartIce();
      const o = await p.pc.createOffer(restart ? { iceRestart: true } : undefined); await p.pc.setLocalDescription(o);
      sig(p.u, { sdp: sdp(o), sid: p.sid });
    } catch (e) {}
  }
  const flush = p => { for (const c of p.q) p.pc.addIceCandidate(c).catch(() => {}); p.q = []; };
  async function onSig(from, d) {
    if (!cur || !d) return;
    try {
      if (d.sdp && d.sdp.type == 'offer') {
        let p = cur.pcs.get(from); if (!p || p.sid !== d.sid) { p = mkPeer(from); p.sid = d.sid; }
        await p.pc.setRemoteDescription(d.sdp); p.rd = true; flush(p);
        const an = await p.pc.createAnswer(); await p.pc.setLocalDescription(an); sig(from, { sdp: sdp(an) });
      } else if (d.sdp && d.sdp.type == 'answer') {
        const p = cur.pcs.get(from); if (p && !p.rd) { await p.pc.setRemoteDescription(d.sdp); p.rd = true; flush(p); }
      } else if (d.ice) {
        const p = cur.pcs.get(from);
        if (!p) (cur.early[from] = cur.early[from] || []).push(d.ice);
        else if (!p.rd) p.q.push(d.ice); else p.pc.addIceCandidate(d.ice).catch(() => {});
      }
    } catch (e) {}
  }

  // ---- giriş / çıkış ----
  async function join(c) {
    if (cur) return;
    if (!navigator.mediaDevices || !window.RTCPeerConnection) return alert(t('Bu tarayıcı sesli aramayı desteklemiyor'));
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false }); }
    catch (e) { return alert(t('Mikrofon izni verilmedi')); }
    hideIn();
    cur = { c, stream, pcs: new Map(), users: new Set(), early: {}, muted: false, sid: Math.random().toString(36).slice(2), ice: FB, t0: 0 };
    cur.ready = new Promise(r => cur.go = r);
    try {
      cur.an = mkAn(stream);
      const d = await api('POST', '/call/join', { c });
      cur.ice = d.ice || FB; d.peers.forEach(u => cur.users.add(u)); render(); hdrState();
      cur.go();
      await Promise.all(d.peers.map(u => { const p = mkPeer(u); p.init = true; p.sid = cur.sid; return offer(p); }));
    } catch (e) { const m = e.message; hangup(!e.status); alert(m); return; }
    cur.tm = setInterval(tick, 400);
    cur.to = setTimeout(() => { if (cur && !isG(cur.c) && !cur.users.size) hangup(); }, 45000);
  }
  function hangup(noNet) {
    if (!cur) return;
    const c = cur.c; clearInterval(cur.tm); clearTimeout(cur.to);
    for (const u of [...cur.pcs.keys()]) closePeer(u);
    cur.stream.getTracks().forEach(x => x.stop()); try { cur.an.disconnect(); } catch (e) {}
    if (cur.go) cur.go(); cur = null;
    if (!noNet) api('POST', '/call/leave', { c }).catch(() => {});
    render(); hdrState();
  }

  // ---- dışarıya açılanlar ----
  window.FCall = {
    hangup,
    hdrBtn() {
      const hd = document.querySelector('#main .hd'); if (!hd || $('#callb')) return;
      const b = document.createElement('button'); b.className = 'ghost'; b.id = 'callb'; b.title = t('Sesli arama'); b.innerHTML = ic('phone');
      b.onclick = () => { const c = S.cur; if (!c || c[0] == '_') return; if (cur) { if (cur.c == c) hangup(); else alert(t('Zaten bir aramadasın')); return; } join(c); };
      hd.appendChild(b); hdrState();
    },
    ev(d) {
      if (!S.me) return;
      if (d.type == 'call-ring') { showIn(d.c, d.from); return; }
      if (d.type == 'call-end') { if (ring && ring.c == d.c) hideIn(); return; }
      if (d.type == 'call-decline') { if (cur && cur.c == d.c && !isG(d.c) && !cur.users.size) hangup(); return; }
      if (!cur || cur.c != d.c) return;
      if (d.type == 'call-join') { cur.users.add(d.u); clearTimeout(cur.to); render(); }
      else if (d.type == 'call-leave') { cur.users.delete(d.u); closePeer(d.u); delete cur.early[d.u]; render(); if (!isG(cur.c) && !cur.users.size) hangup(); }
      else if (d.type == 'call-sig') cur.ready.then(() => onSig(d.from, d.d));
    }
  };
  addEventListener('pagehide', () => { if (cur) try { navigator.sendBeacon('/api/call/leave', new Blob([JSON.stringify({ c: cur.c })], { type: 'application/json' })); } catch (e) {} });
})();
