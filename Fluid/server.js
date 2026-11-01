'use strict';
// Fluid sunucusu – sıfır bağımlılık (yalnızca Node.js 18+).
// Çalıştır: node server.js      Şifre sıfırla: node server.js reset <kullanici> <yeni-sifre>
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 3000, HOST = process.env.HOST || '0.0.0.0';
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), FILE = path.join(DATA, 'db.json');
const INVITE = process.env.INVITE_CODE || '', TRUST = process.env.TRUST_PROXY === '1' || !!process.env.RENDER;
const DAY = 864e5, SESS = 30 * DAY, NAME = /^[a-z0-9_]{3,16}$/;
const ACCENTS = ['ice', 'violet', 'mint', 'rose'];
const DEF = { accent: 'ice', snow: true, calm: false, sound: true, notify: false, showOnline: true };
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'";

fs.mkdirSync(DATA, { recursive: true });
let db = { users: {}, msgs: {}, reads: {}, sessions: {}, follows: {}, groups: {}, seq: 0 };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
let timer = null;
const flushFile = () => { const t = FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, FILE); };

// ---- isteğe bağlı uzak kayıt: Upstash Redis (ücretsiz plan) ----
// UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN tanımlıysa veriler orada saklanır (Render gibi dosyaları silen sunucular için).
const RURL = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, ''), RTOK = process.env.UPSTASH_REDIS_REST_TOKEN || '', REMOTE = !!(RURL && RTOK);
let ready = !REMOTE, remoteState = {};
async function rpipe(cmds) {
  const r = await fetch(RURL + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + RTOK, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds), signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const a = await r.json(), bad = a.find(x => x.error); if (bad) throw new Error(bad.error);
  return a.map(x => x.result);
}
const shards = () => {
  const out = {}, users = {};
  for (const u in db.users) { const { avatar, ...rest } = db.users[u]; users[u] = rest; if (avatar) out['fluid:av:' + u] = avatar; }
  out['fluid:core'] = JSON.stringify({ users, reads: db.reads, sessions: db.sessions, seq: db.seq, convs: Object.keys(db.msgs), follows: db.follows, groups: db.groups || {} });
  for (const k in db.msgs) out['fluid:msg:' + k] = JSON.stringify(db.msgs[k]);
  return out;
};
async function pushRemote() {
  if (!ready) return;
  const sh = shards(), cmds = [];
  for (const k in sh) if (remoteState[k] !== sh[k]) cmds.push(['SET', k, sh[k]]);
  for (const k in remoteState) if (!(k in sh)) cmds.push(['DEL', k]);
  let batch = [], size = 0;
  const send = async () => { if (batch.length) { await rpipe(batch); batch = []; size = 0; } };
  for (const c of cmds) { const n = (c[2] || '').length; if (size + n > 4e5) await send(); batch.push(c); size += n; }
  await send(); remoteState = sh;
}
async function loadRemote() {
  const raw = (await rpipe([['GET', 'fluid:core']]))[0];
  if (raw) {
    const core = JSON.parse(raw), names = Object.keys(core.users || {}), convs = core.convs || [], res = [];
    const cmds = [...names.map(u => ['GET', 'fluid:av:' + u]), ...convs.map(k => ['GET', 'fluid:msg:' + k])];
    for (let i = 0; i < cmds.length; i += 50) res.push(...await rpipe(cmds.slice(i, i + 50)));
    db = { users: core.users || {}, reads: core.reads || {}, sessions: core.sessions || {}, follows: core.follows || {}, groups: core.groups || {}, seq: core.seq || 0, msgs: {} };
    names.forEach((u, i) => { db.users[u].avatar = res[i] || ''; });
    convs.forEach((k, i) => { db.msgs[k] = JSON.parse(res[names.length + i] || '[]'); });
    remoteState = shards();
  } else console.log('Uzak veritabanı boş, mevcut veriyle başlanıyor.');
  ready = true;
}
let busy = false, again = false;
async function kick() {
  again = true; if (busy) return; busy = true;
  try { while (again) { again = false; try { await pushRemote(); } catch (e) { console.error('Uzak kayıt hatası:', e.message); setTimeout(() => { if (!timer) save(); }, 5000); } } } finally { busy = false; }
}
const flush = () => { clearTimeout(timer); timer = null; if (REMOTE) kick(); else flushFile(); };
const save = () => { if (!timer) timer = setTimeout(flush, 300); };

// ---- şifre & oturum ----
const hash = (p, salt) => crypto.scryptSync(p, salt, 64).toString('hex');
const mkPass = p => { const salt = crypto.randomBytes(16).toString('hex'); return { salt, hash: hash(p, salt) }; };
const okPass = (u, p) => { const a = Buffer.from(hash(p, u.salt), 'hex'), b = Buffer.from(u.hash, 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const sha = t => crypto.createHash('sha256').update(t).digest('hex');
const tokenOf = req => (/(?:^|;\s*)fl=([a-f0-9]{64})/.exec(req.headers.cookie || '') || [])[1];
const sessKey = req => { const t = tokenOf(req); return t && sha(t); };
const cookie = (res, v, age, req) => res.setHeader('Set-Cookie', `fl=${v}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${req && (req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted) ? '; Secure' : ''}`);
function newSession(u, req, res) { const t = crypto.randomBytes(32).toString('hex'); db.sessions[sha(t)] = { u, exp: Date.now() + SESS }; cookie(res, t, SESS / 1000, req); save(); }
function auth(req) { const k = sessKey(req), s = k && db.sessions[k]; if (!s) return null; if (s.exp < Date.now()) { delete db.sessions[k]; save(); return null; } return db.users[s.u] ? s.u : null; }
const dropSessions = (u, keep) => { for (const k in db.sessions) if (db.sessions[k].u === u && k !== keep) delete db.sessions[k]; };
setInterval(() => { for (const k in db.sessions) if (db.sessions[k].exp < Date.now()) delete db.sessions[k]; save(); }, 36e5);

// Deneme sınırı: IP başına geniş, hesap başına dar. Süre dolunca kendiliğinden açılır.
const tries = new Map(), WIN = 6e5;
const bucket = k => { const now = Date.now(), a = (tries.get(k) || []).filter(t => now - t < WIN); tries.set(k, a); return a; };
const wait = (...rules) => { let w = 0; for (const [k, max] of rules) { const a = bucket(k); if (a.length >= max) w = Math.max(w, Math.ceil((a[0] + WIN - Date.now()) / 6e4)); } return w; };
const strike = (...ks) => ks.forEach(k => bucket(k).push(Date.now()));
const tooMany = (res, w) => J(res, 429, { error: 'Çok fazla deneme, biraz bekle', wait: w });
setInterval(() => { for (const k of [...tries.keys()]) if (!bucket(k).length) tries.delete(k); }, WIN);

// ---- yardımcılar ----
const key = (a, b) => [a, b].sort().join('|');
const noteOf = o => (o.note && Date.now() - o.note.ts < DAY ? o.note : null);
const clients = new Map();
const isOnline = u => (clients.get(u) || { size: 0 }).size > 0 && db.users[u].settings?.showOnline !== false;
const meOf = u => { const o = db.users[u]; return { u, bio: o.bio, av: o.av, note: noteOf(o), settings: { ...DEF, ...o.settings } }; };
// Listede yalnızca takip ettiklerin ve yazıştıkların görünür.
function listFor(me) {
  const r = db.reads[me] || {}, fol = new Set(db.follows[me] || []), out = [];
  for (const x of Object.keys(db.users)) {
    if (x === me) continue;
    const o = db.users[x], m = db.msgs[key(me, x)] || [];
    if (!fol.has(x) && !m.length) continue;
    const l = m[m.length - 1], last = r[x] || 0;
    out.push({ u: x, bio: o.bio, av: o.av, note: fol.has(x) ? noteOf(o) : null, online: isOnline(x), following: fol.has(x), unread: m.filter(z => z.f === x && z.id > last).length, last: l ? { t: l.t, ts: l.ts, f: l.f } : null });
  }
  return out;
}
const push = (u, ev) => { for (const r of clients.get(u) || []) r.write(`data: ${JSON.stringify(ev)}\n\n`); };
const broadcast = ev => { for (const u of clients.keys()) push(u, ev); };
setInterval(() => { for (const s of clients.values()) for (const r of s) r.write(':\n\n'); }, 25000);

const J = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
const body = req => new Promise((ok, no) => { let n = 0; const c = [];
  req.on('data', d => { n += d.length; if (n > 1.5e6) { no(new Error('big')); req.destroy(); } else c.push(d); });
  req.on('end', () => { try { ok(c.length ? JSON.parse(Buffer.concat(c)) : {}); } catch (e) { no(new Error('bad')); } });
});

// ---- komut satırından şifre sıfırlama ----
async function reset() {
  const [u, pw] = [String(process.argv[3] || '').toLowerCase(), process.argv[4] || ''];
  if (!db.users[u] || pw.length < 6) { console.log('Kullanım: node server.js reset <kullanici> <en-az-6-karakter>'); process.exit(1); }
  Object.assign(db.users[u], mkPass(pw)); dropSessions(u);
  if (REMOTE) await pushRemote(); else flushFile();
  console.log(`✔ ${u} için şifre güncellendi.`); process.exit(0);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin'); res.setHeader('X-Frame-Options', 'DENY');
  const url = new URL(req.url, 'http://x'), p = url.pathname, M = req.method;
  try {
    if (M === 'GET' && p === '/') { res.setHeader('Content-Security-Policy', CSP); res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); return res.end(fs.readFileSync(path.join(__dirname, 'index.html'))); }
    if (!p.startsWith('/api/') && !p.startsWith('/avatar/')) { res.writeHead(404); return res.end(); }
    if (M !== 'GET' && req.headers.origin) { let ok = false; try { const h = new URL(req.headers.origin).host; ok = h === req.headers.host || h === req.headers['x-forwarded-host']; } catch (e) {} if (!ok) return J(res, 403, { error: 'Geçersiz istek' }); }
    const ip = TRUST ? ((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress) : req.socket.remoteAddress;

    if (p === '/api/config') return J(res, 200, { invite: !!INVITE });
    if (M === 'POST' && p === '/api/register') {
      const b = await body(req), w = wait(['ip:' + ip, 60], ['inv:' + ip, 10]); if (w) return tooMany(res, w);
      const u = String(b.u || '').toLowerCase(), pw = String(b.p || '');
      if (INVITE && b.invite !== INVITE) { strike('inv:' + ip, 'ip:' + ip); return J(res, 403, { error: 'Davet kodu hatalı' }); }
      if (!NAME.test(u)) return J(res, 400, { error: 'Kullanıcı adı: 3–16 harf/rakam/_' });
      if (pw.length < 6 || pw.length > 200) return J(res, 400, { error: 'Şifre en az 6 karakter olmalı' });
      if (db.users[u]) return J(res, 409, { error: 'Bu kullanıcı adı alınmış' });
      db.users[u] = { ...mkPass(pw), bio: '', avatar: '', av: 0, note: null, settings: { ...DEF }, created: Date.now() };
      newSession(u, req, res); save(); broadcast({ type: 'user' }); return J(res, 200, { me: meOf(u) });
    }
    if (M === 'POST' && p === '/api/login') {
      const b = await body(req), u = String(b.u || '').toLowerCase(), uk = 'u:' + ip + ':' + u.slice(0, 32);
      const w = wait(['ip:' + ip, 60], [uk, 8]); if (w) return tooMany(res, w);
      const o = db.users[u];
      if (!o || !okPass(o, String(b.p || ''))) { strike('ip:' + ip, uk); return J(res, 401, { error: 'Kullanıcı adı veya şifre hatalı' }); }
      tries.delete(uk); newSession(u, req, res); return J(res, 200, { me: meOf(u) });
    }

    const me = auth(req); if (!me) return J(res, 401, { error: 'Oturum gerekli' });
    const hu = req.headers['x-fluid-user']; if (hu && hu !== me) return J(res, 409, { error: 'Hesap değişti' });
    const U = db.users[me];

    let m;
    if (M === 'GET' && (m = /^\/avatar\/([^/]+)$/.exec(p))) {
      const o = db.users[decodeURIComponent(m[1])];
      if (!o || !o.avatar) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=31536000, immutable' });
      return res.end(Buffer.from(o.avatar.split(',')[1], 'base64'));
    }
    if (M === 'GET' && p === '/api/search') {
      const q = String(url.searchParams.get('q') || '').toLowerCase().trim().slice(0, 16);
      if (q.length < 2) return J(res, 200, { users: [] });
      const fol = new Set(db.follows[me] || []);
      const users = Object.keys(db.users).filter(x => x !== me && x.includes(q))
        .sort((a, b) => (a.startsWith(q) ? 0 : 1) - (b.startsWith(q) ? 0 : 1) || a.localeCompare(b)).slice(0, 20)
        .map(x => ({ u: x, bio: db.users[x].bio, av: db.users[x].av, following: fol.has(x) }));
      return J(res, 200, { users });
    }
    if ((M === 'POST' || M === 'DELETE') && (m = /^\/api\/follow\/([^/]+)$/.exec(p))) {
      const t = decodeURIComponent(m[1]); if (!db.users[t] || t === me) return J(res, 404, { error: 'Kullanıcı bulunamadı' });
      const set = new Set(db.follows[me] || []); if (M === 'POST') set.add(t); else set.delete(t);
      db.follows[me] = [...set]; save(); push(me, { type: 'user' }); return J(res, 200, { following: set.has(t) });
    }
    if (M === 'GET' && p === '/api/me') return J(res, 200, { me: meOf(me) });
    if (M === 'GET' && (m = /^\/api\/profile\/([^/]+)$/.exec(p))) {
      const name = decodeURIComponent(m[1]), o = db.users[name];
      if (!o) return J(res, 404, { error: 'Kullanıcı bulunamadı' });
      const followers = Object.keys(db.follows).filter(x => (db.follows[x] || []).includes(name)).length;
      return J(res, 200, { profile: { u: name, bio: o.bio || '', av: o.av || 0, followers, following: (db.follows[name] || []).length, followingMe: (db.follows[me] || []).includes(name), mine: name === me } });
    }
    if (M === 'GET' && p === '/api/groups') {
      const groups = Object.values(db.groups || {}).filter(g => g.members.includes(me))
        .map(g => ({ id: g.id, name: g.name, members: g.members.length, last: (db.msgs['g:' + g.id] || []).slice(-1)[0] || null }));
      return J(res, 200, { groups });
    }
    if (M === 'POST' && p === '/api/groups') {
      const b = await body(req), name = String(b.name || '').trim().slice(0, 40);
      const members = [...new Set((Array.isArray(b.members) ? b.members : []).map(x => String(x).toLowerCase()).filter(x => db.users[x] && x !== me))].slice(0, 49);
      if (!name) return J(res, 400, { error: 'Grup adı gerekli' });
      if (!members.length) return J(res, 400, { error: 'En az bir kişi eklemelisin' });
      const id = crypto.randomBytes(9).toString('hex'), group = { id, name, owner: me, members: [me, ...members], created: Date.now() };
      db.groups[id] = group; db.msgs['g:' + id] = []; save();
      for (const u of group.members) push(u, { type: 'groups' });
      return J(res, 200, { group: { id, name, members: group.members.length } });
    }
    if (M === 'GET' && (m = /^\/api\/groups\/([^/]+)\/messages$/.exec(p))) {
      const id = decodeURIComponent(m[1]), g = db.groups[id];
      if (!g || !g.members.includes(me)) return J(res, 404, { error: 'Grup bulunamadı' });
      return J(res, 200, { msgs: (db.msgs['g:' + id] || []).slice(-300), group: { id, name: g.name, members: g.members.length } });
    }
    if ((M === 'POST' || M === 'PATCH' || M === 'DELETE') && (m = /^\/api\/groups\/([^/]+)\/messages(?:\/([0-9]+))?$/.exec(p))) {
      const id = decodeURIComponent(m[1]), g = db.groups[id];
      if (!g || !g.members.includes(me)) return J(res, 404, { error: 'Grup bulunamadı' });
      const arr = db.msgs['g:' + id] || (db.msgs['g:' + id] = []);
      if (M === 'POST') {
        const t = String((await body(req)).t || '').trim().slice(0, 2000);
        if (!t) return J(res, 400, { error: 'Boş mesaj' });
        const msg = { id: ++db.seq, f: me, t, ts: Date.now() }; arr.push(msg);
        if (arr.length > 3000) arr.splice(0, arr.length - 3000);
        save(); for (const u of g.members) push(u, { type: 'groupmsg', group: id, m: msg });
        return J(res, 200, { m: msg });
      }
      const msg = arr.find(x => x.id === Number(m[2]));
      if (!msg || msg.f !== me) return J(res, 403, { error: 'Bu mesaj üzerinde işlem yapamazsın' });
      if (M === 'PATCH') { const t = String((await body(req)).t || '').trim().slice(0, 2000); if (!t) return J(res, 400, { error: 'Boş mesaj' }); msg.t = t; msg.edited = true; }
      else arr.splice(arr.indexOf(msg), 1);
      save(); for (const u of g.members) push(u, { type: 'groupchange', group: id });
      return J(res, 200, { message: msg });
    }

    if (M === 'GET' && p === '/api/users') return J(res, 200, { users: listFor(me) });
    if (M === 'GET' && p === '/api/stream') {
      if (url.searchParams.get('u') !== me) { res.writeHead(409); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.write('retry: 3000\n\n');
      let set = clients.get(me); if (!set) clients.set(me, set = new Set());
      const was = set.size; set.add(res); if (!was) broadcast({ type: 'presence' });
      req.on('close', () => { set.delete(res); if (!set.size) setTimeout(() => { if (!(clients.get(me) || { size: 0 }).size) broadcast({ type: 'presence' }); }, 3000); });
      return;
    }
    if ((m = /^\/api\/(messages|read)\/([^/]+)$/.exec(p))) {
      const other = decodeURIComponent(m[2]); if (!db.users[other] || other === me) return J(res, 404, { error: 'Kullanıcı bulunamadı' });
      const arr = db.msgs[key(me, other)] || [];
      if (M === 'GET' && m[1] === 'messages') return J(res, 200, { msgs: arr.slice(-300) });
      if (M === 'POST' && m[1] === 'read') { (db.reads[me] = db.reads[me] || {})[other] = arr.length ? arr[arr.length - 1].id : 0; save(); return J(res, 200, {}); }
      if (M === 'POST' && m[1] === 'messages') {
        const t = String((await body(req)).t || '').trim().slice(0, 2000); if (!t) return J(res, 400, { error: 'Boş mesaj' });
        const msg = { id: ++db.seq, f: me, t, ts: Date.now() };
        const list = db.msgs[key(me, other)] = arr; list.push(msg); if (list.length > 3000) list.splice(0, list.length - 3000);
        (db.reads[me] = db.reads[me] || {})[other] = msg.id; save();
        const ev = { type: 'msg', to: other, m: msg }; push(other, ev); push(me, ev); return J(res, 200, { m: msg });
      }
    }
    if ((M === 'PATCH' || M === 'DELETE') && (m = /^\/api\/messages\/([^/]+)\/([0-9]+)$/.exec(p))) {
      const other = decodeURIComponent(m[1]);
      if (!db.users[other] || other === me) return J(res, 404, { error: 'Kullanıcı bulunamadı' });
      const arr = db.msgs[key(me, other)] || [], msg = arr.find(x => x.id === Number(m[2]));
      if (!msg || msg.f !== me) return J(res, 403, { error: 'Bu mesaj üzerinde işlem yapamazsın' });
      if (M === 'PATCH') { const t = String((await body(req)).t || '').trim().slice(0, 2000); if (!t) return J(res, 400, { error: 'Boş mesaj' }); msg.t = t; msg.edited = true; }
      else arr.splice(arr.indexOf(msg), 1);
      save(); push(other, { type: 'change', other: me }); push(me, { type: 'change', other });
      return J(res, 200, { message: msg });
    }
    if (M === 'PUT' && p === '/api/profile') {
      const b = await body(req);
      if ('bio' in b) U.bio = String(b.bio).slice(0, 150);
      if ('avatar' in b) {
        if (b.avatar === '') { U.avatar = ''; U.av = 0; }
        else if (typeof b.avatar === 'string' && b.avatar.length < 400000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.avatar)) { U.avatar = b.avatar; U.av = Date.now(); }
        else return J(res, 400, { error: 'Geçersiz fotoğraf' });
      }
      save(); broadcast({ type: 'user' }); return J(res, 200, { me: meOf(me) });
    }
    if (p === '/api/note' && M === 'PUT') {
      const t = String((await body(req)).t || '').trim().slice(0, 60); if (!t) return J(res, 400, { error: 'Not boş olamaz' });
      U.note = { t, ts: Date.now() }; save(); broadcast({ type: 'user' }); return J(res, 200, { note: U.note });
    }
    if (p === '/api/note' && M === 'DELETE') { U.note = null; save(); broadcast({ type: 'user' }); return J(res, 200, {}); }
    if (M === 'PUT' && p === '/api/settings') {
      const b = await body(req), s = U.settings = { ...DEF, ...U.settings };
      if (ACCENTS.includes(b.accent)) s.accent = b.accent;
      if (['tr', 'en'].includes(b.lang)) s.lang = b.lang;
      for (const k of ['snow', 'calm', 'sound', 'notify', 'showOnline']) if (typeof b[k] === 'boolean') s[k] = b[k];
      save(); if ('showOnline' in b) broadcast({ type: 'presence' }); return J(res, 200, { settings: s });
    }
    if (M === 'POST' && p === '/api/password') {
      const b = await body(req), pk = 'pw:' + me, w = wait([pk, 8]); if (w) return tooMany(res, w);
      if (!okPass(U, String(b.old || ''))) { strike(pk); return J(res, 403, { error: 'Mevcut şifre hatalı' }); }
      const n = String(b.new || ''); if (n.length < 6 || n.length > 200) return J(res, 400, { error: 'Yeni şifre en az 6 karakter olmalı' });
      Object.assign(U, mkPass(n)); dropSessions(me, sessKey(req)); save(); return J(res, 200, {});
    }
    if (M === 'POST' && p === '/api/logout') { delete db.sessions[sessKey(req)]; cookie(res, '', 0, req); save(); return J(res, 200, {}); }
    if (M === 'POST' && p === '/api/logout-all') { dropSessions(me); cookie(res, '', 0, req); save(); return J(res, 200, {}); }
    if (M === 'POST' && p === '/api/delete') {
      const b = await body(req), pk = 'pw:' + me, w = wait([pk, 8]); if (w) return tooMany(res, w);
      if (!okPass(U, String(b.p || ''))) { strike(pk); return J(res, 403, { error: 'Şifre hatalı' }); }
      delete db.users[me]; dropSessions(me); delete db.reads[me]; delete db.follows[me];
      for (const k in db.follows) db.follows[k] = db.follows[k].filter(x => x !== me);
      for (const k of Object.keys(db.msgs)) if (k.split('|').includes(me)) delete db.msgs[k];
      for (const [id, g] of Object.entries(db.groups || {})) { g.members = g.members.filter(x => x !== me); if (!g.members.length) { delete db.groups[id]; delete db.msgs['g:' + id]; } }
      for (const r of clients.get(me) || []) r.end(); clients.delete(me);
      cookie(res, '', 0, req); save(); broadcast({ type: 'user' }); return J(res, 200, {});
    }
    return J(res, 404, { error: 'Bulunamadı' });
  } catch (e) {
    const big = e.message === 'big', bad = e.message === 'bad';
    if (!big && !bad) console.error(e);
    const msg = big ? 'Gönderilen dosya çok büyük.' : bad ? 'Gönderilen veri okunamadı, sayfayı yenileyip tekrar dene.' : 'Sunucuda beklenmedik bir sorun oldu, biraz sonra tekrar dene.';
    if (!res.headersSent) J(res, big ? 413 : bad ? 400 : 500, { error: msg }); else res.end();
  }
});
(async () => {
  if (REMOTE) { try { await loadRemote(); } catch (e) { console.error('Uzak veritabanına bağlanılamadı, veri kaybı olmaması için sunucu başlatılmadı:', e.message); process.exit(1); } }
  if (process.argv[2] === 'reset') return reset();
  server.listen(PORT, HOST, () => console.log(`❄  Fluid çalışıyor → http://localhost:${PORT}  (veri: ${REMOTE ? 'Upstash Redis' : FILE})${INVITE ? '  [davet kodu aktif]' : ''}`));
})();
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, async () => {
  clearTimeout(timer);
  try { if (REMOTE) await Promise.race([pushRemote(), new Promise(r => setTimeout(r, 8000))]); else flushFile(); } catch (e) { console.error(e.message); }
  process.exit(0);
});
