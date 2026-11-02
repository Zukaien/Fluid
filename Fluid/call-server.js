'use strict';
// Fluid – sesli arama sinyalleşmesi.
// Ses sunucudan GEÇMEZ: konuşanlar WebRTC ile tarayıcıdan tarayıcıya doğrudan bağlanır.
// Sunucu yalnızca küçük SDP/ICE mesajlarını aktarır ve kimin aramada olduğunu bellekte tutar.
// İsteğe bağlı ortam değişkenleri: CALL_MAX (varsayılan 8), TURN_URL, TURN_USER, TURN_PASS
module.exports = ({ db: getDb, push, members, key }) => {
  const calls = new Map(), MAX = +process.env.CALL_MAX || 8;
  const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  if (process.env.TURN_URL) ICE.push({ urls: process.env.TURN_URL.split(',').map(s => s.trim()), username: process.env.TURN_USER || '', credential: process.env.TURN_PASS || '' });

  // k: sunucudaki sohbet anahtarı ("a|b" ya da "g:id"); c: istemcinin gördüğü kimlik (karşı kullanıcı ya da "g:id")
  const cid = (k, u) => k.startsWith('g:') ? k : k.split('|').find(x => x !== u);
  const cpush = (k, u, ev) => push(u, { ...ev, c: cid(k, u) });
  function conv(me, c) {
    const db = getDb();
    if (typeof c !== 'string') return null;
    if (c.startsWith('g:')) { const g = db.groups[c.slice(2)]; return g && g.members.includes(me) ? c : null; }
    return db.users[c] && c !== me ? key(me, c) : null;
  }
  function leave(k, me) {
    const cl = calls.get(k); if (!cl || !cl.users.has(me)) return;
    cl.users.delete(me);
    for (const u of cl.users) cpush(k, u, { type: 'call-leave', u: me });
    if (!cl.users.size) { calls.delete(k); for (const u of members(k)) cpush(k, u, { type: 'call-end' }); }
  }
  const leaveAll = u => { for (const k of [...calls.keys()]) leave(k, u); };
  // Yeni bağlanan (ya da yeniden bağlanan) istemciye çalan aramaları bildir
  function rings(me, res) {
    for (const [k, cl] of calls) {
      if (cl.users.has(me) || !members(k).includes(me)) continue;
      res.write(`data: ${JSON.stringify({ type: 'call-ring', c: cid(k, me), from: [...cl.users][0] })}\n\n`);
    }
  }

  async function route(req, res, p, me, body, J) {
    const act = p.slice('/api/call/'.length);
    if (!['join', 'leave', 'decline', 'signal'].includes(act)) return J(res, 404, { error: 'Bulunamadı' });
    const b = await body(req), k = conv(me, String(b.c || ''));
    if (!k) return J(res, 404, { error: 'Sohbet bulunamadı' });
    if (act === 'join') {
      leaveAll(me);
      let cl = calls.get(k);
      if (cl && cl.users.size >= MAX) return J(res, 400, { error: 'Arama dolu' });
      const fresh = !cl; if (fresh) calls.set(k, cl = { users: new Set() });
      const peers = [...cl.users]; cl.users.add(me);
      for (const u of peers) cpush(k, u, { type: 'call-join', u: me });
      if (fresh) for (const u of members(k)) if (u !== me) cpush(k, u, { type: 'call-ring', from: me });
      return J(res, 200, { peers, ice: ICE });
    }
    if (act === 'leave') { leave(k, me); return J(res, 200, {}); }
    const cl = calls.get(k);
    if (act === 'decline') { if (cl) for (const u of cl.users) cpush(k, u, { type: 'call-decline', u: me }); return J(res, 200, {}); }
    const to = String(b.to || ''), d = b.d;
    if (!cl || !cl.users.has(me) || !cl.users.has(to) || to === me) return J(res, 404, { error: 'Arama bulunamadı' });
    if (!d || typeof d !== 'object' || JSON.stringify(d).length > 20000) return J(res, 400, { error: 'Geçersiz istek' });
    cpush(k, to, { type: 'call-sig', from: me, d });
    return J(res, 200, {});
  }
  return { route, leaveAll, rings };
};
