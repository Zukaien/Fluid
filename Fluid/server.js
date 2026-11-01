'use strict';
// Fluid sunucusu – sıfır bağımlılık (yalnızca Node.js 18+).
// Çalıştır: node server.js      Şifre sıfırla: node server.js reset <kullanici> <yeni-sifre>
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 3000, HOST = process.env.HOST || '0.0.0.0';
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), FILE = path.join(DATA, 'db.json');
const INVITE = process.env.INVITE_CODE || '', TRUST = process.env.TRUST_PROXY === '1' || !!process.env.RENDER;
const DAY = 864e5, SESS = 30 * DAY, NAME = /^[a-z0-9_]{3,16}$/;
const ACCENTS = ['ice', 'violet', 'mint', 'rose'];
const DEF = { accent: 'ice', snow: true, calm: false, sound: true, notify: false, showOnline: true, lang: 'tr' };
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'";

fs.mkdirSync(DATA, { recursive: true });
let db = { users: {}, msgs: {}, reads: {}, sessions: {}, follows: {}, groups: {}, seq: 0 };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
db.groups = db.groups || {};
db.msgLoc = {};
for (const k in db.msgs) for (const m of db.msgs[k]) db.msgLoc[m.id] = k;

let timer = null;
const flushFile = () => {
  const t = FILE + '.tmp';
  const { msgLoc, ...save } = db;
  fs.writeFileSync(t, JSON.stringify(save));
  fs.renameSync(t, FILE);
};

// ---- isteğe bağlı uzak kayıt: Upstash Redis ----
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
  out['fluid:core'] = JSON.stringify({ users, reads: db.reads, sessions: db.sessions, seq: db.seq, convs: Object.keys(db.msgs), follows: db.follows, groups: db.groups });
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
    db.msgLoc = {};
    for (const k in db.msgs) for (const m of db.msgs[k]) db.msgLoc[m.id] = k;
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

// Deneme sınırı
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

// Konuşma yardımcıları (DM + grup)
const isGroupKey = k => typeof k === 'string' && k.startsWith('g:');
const convKeyOf = (me, other) => isGroupKey(other) ? other : key(me, other);
const convAccess = (me, other) => {
  if (isGroupKey(other)) { const g = db.groups[other.slice(2)]; return !!(g && g.members.includes(me)); }
  return !!db.users[other] && other !== me;
};
const convMembers = ck => isGroupKey(ck) ? ((db.groups[ck.slice(2)] || {}).members || []) : ck.split('|');
const push = (u, ev) => { for (const r of clients.get(u) || []) r.write(`data: ${JSON.stringify(ev)}\n\n`); };
const pushConv = (ck, ev) => { for (const u of convMembers(ck)) push(u, ev); };
const broadcast = ev => { for (const u of clients.keys()) push(u, ev); };
setInterval(() => { for (const s of clients.values()) for (const r of s) r.write(':\n\n'); }, 25000);

function listFor(me) {
  const r = db.reads[me] || {}, fol = new Set(db.follows[me] || []), out = [];
  for (const x of Object.keys(db.users)) {
    if (x === me) continue;
    const o = db.users[x], m = db.msgs[key(me, x)] || [];
    if (!fol.has(x) && !m.length) continue;
    const l = m[m.length - 1], last = r[x] || 0;
    out.push({
      u: x, bio: o.bio, av: o.av, note: fol.has(x) ? noteOf(o) : null,
      online: isOnline(x), following: fol.has(x),
      unread: m.filter(z => z.f === x && z.id > last && !z.del).length,
      last: l ? { t: l.t, ts: l.ts, f: l.f, del: !!l.del } : null
    });
  }
  for (const gid in db.groups) {
    const g = db.groups[gid];
    if (!g.members.includes(me)) continue;
    const ck = 'g:' + gid, m = db.msgs[ck] || [];
    const l = m[m.length - 1], last = r[ck] || 0;
    out.push({
      u: ck, group: true, gid, name: g.name, owner: g.owner, memberCount: g.members.length,
      av: 0, bio: '', note: null, following: true,
      online: g.members.some(u => u !== me && isOnline(u)),
      unread: m.filter(z => z.f !== me && z.id > last && !z.del).length,
      last: l ? { t: l.t, ts: l.ts, f: l.f, del: !!l.del } : null
    });
  }
  return out;
}

const J = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
const body = req => new Promise((ok, no) => { let n = 0; const c = [];
  req.on('data', d => { n += d.length; if (n > 1.5e6) { no(new Error('big')); req.destroy(); } else c.push(d); });
  req.on('end', () => { try { ok(c.length ? JSON.parse(Buffer.concat(c)) : {}); } catch (e) { no(new Error('bad')); } });
});

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

    // ---- GRUPLAR ----
    if (M === 'POST' && p === '/api/groups') {
      const b = await body(req);
      const name = String(b.name || '').trim().slice(0, 60);
      if (!name) return J(res, 400, { error: 'Grup adı gerekli' });
      const members = [...new Set([me, ...(Array.isArray(b.members) ? b.members : [])])]
        .filter(u => typeof u === 'string' && db.users[u]);
      if (members.length < 2) return J(res, 400, { error: 'En az bir üye seç' });
      const gid = crypto.randomBytes(6).toString('hex');
      db.groups[gid] = { id: gid, name, owner: me, members, created: Date.now() };
      save();
      for (const u of members) push(u, { type: 'group', gid });
      return J(res, 200, { gid });
    }
    if ((m = /^\/api\/groups\/([^/]+)\/leave$/.exec(p)) && M === 'POST') {
      const gid = m[1], g = db.groups[gid];
      if (!g || !g.members.includes(me)) return J(res, 404, { error: 'Grup bulunamadı' });
      g.members = g.members.filter(u => u !== me);
      const survivors = [...g.members];
      if (!g.members.length) { delete db.groups[gid]; delete db.msgs['g:' + gid]; }
      else if (g.owner === me) g.owner = g.members[0];
      save();
      for (const u of survivors) push(u, { type: 'group', gid });
      push(me, { type: 'group', gid, removed: 1 });
      return J(res, 200, {});
    }
    if ((m = /^\/api\/groups\/([^/]+)\/members\/([^/]+)$/.exec(p)) && M === 'DELETE') {
      const gid = m[1], target = decodeURIComponent(m[2]), g = db.groups[gid];
      if (!g) return J(res, 404, { error: 'Grup bulunamadı' });
      if (g.owner !== me) return J(res, 403, { error: 'Bu işleme izin verilmedi' });
      if (target === g.owner) return J(res, 400, { error: 'Geçersiz istek' });
      if (!g.members.includes(target)) return J(res, 404, { error: 'Kullanıcı bulunamadı' });
      g.members = g.members.filter(x => x !== target);
      save();
      for (const x of g.members) push(x, { type: 'group', gid });
      push(target, { type: 'group', gid, removed: 1 });
      return J(res, 200, {});
    }
    if ((m = /^\/api\/groups\/([^/]+)\/members$/.exec(p)) && M === 'POST') {
      const gid = m[1], g = db.groups[gid];
      if (!g) return J(res, 404, { error: 'Grup bulunamadı' });
      if (g.owner !== me) return J(res, 403, { error: 'Bu işleme izin verilmedi' });
      const b = await body(req);
      const add = (Array.isArray(b.members) ? b.members : [])
        .filter(u => typeof u === 'string' && db.users[u] && !g.members.includes(u));
      if (!add.length) return J(res, 400, { error: 'Eklenecek üye yok' });
      g.members.push(...add);
      save();
      for (const u of g.members) push(u, { type: 'group', gid });
      return J(res, 200, { members: g.members });
    }
    if ((m = /^\/api\/groups\/([^/]+)\/rename$/.exec(p)) && M === 'POST') {
      const gid = m[1], g = db.groups[gid];
      if (!g) return J(res, 404, { error: 'Grup bulunamadı' });
      if (g.owner !== me) return J(res, 403, { error: 'Bu işleme izin verilmedi' });
      const b = await body(req);
      const name = String(b.name || '').trim().slice(0, 60);
      if (!name) return J(res, 400, { error: 'Grup adı gerekli' });
      g.name = name;
      save();
      for (const u of g.members) push(u, { type: 'group', gid });
      return J(res, 200, { name });
    }
    if ((m = /^\/api\/groups\/([^/]+)$/.exec(p)) && M === 'DELETE') {
      const gid = m[1], g = db.groups[gid];
      if (!g) return J(res, 404, { error: 'Grup bulunamadı' });
      if (g.owner !== me) return J(res, 403, { error: 'Bu işleme izin verilmedi' });
      const members = [...g.members];
      delete db.groups[gid];
      delete db.msgs['g:' + gid];
      save();
      for (const u of members) push(u, { type: 'group', gid, removed: 1 });
      return J(res, 200, {});
    }
    if ((m = /^\/api\/groups\/([^/]+)$/.exec(p)) && M === 'GET') {
      const g = db.groups[m[1]];
      if (!g) return J(res, 404, { error: 'Grup bulunamadı' });
      if (!g.members.includes(me)) return J(res, 403, { error: 'Erişim yok' });
      return J(res, 200, { group: { ...g, memberInfo: g.members.map(u => ({ u, av: db.users[u].av })) } });
    }

    // ---- MESAJLAR ----
    if (M === 'GET' && p === '/api/messages') {
      const other = String(url.searchParams.get('c') || '');
      if (!convAccess(me, other)) return J(res, 403, { error: 'Erişim yok' });
      const ck = convKeyOf(me, other);
      return J(res, 200, { msgs: db.msgs[ck] || [] });
    }
    if (M === 'POST' && p === '/api/messages') {
      const b = await body(req);
      const other = String(b.to || '');
      if (!convAccess(me, other)) return J(res, 403, { error: 'Erişim yok' });
      const t = String(b.t || '').trim().slice(0, 4000);
      if (!t) return J(res, 400, { error: 'Mesaj boş' });
      const ck = convKeyOf(me, other);
      const list = db.msgs[ck] || (db.msgs[ck] = []);
      const id = ++db.seq;
      const msg = { id, f: me, t, ts: Date.now() };
      if (b.reply) {
        const r = list.find(x => x.id === +b.reply);
        if (r && !r.del) msg.r = r.id;
      }
      list.push(msg);
      db.msgLoc[id] = ck;
      save();
      pushConv(ck, { type: 'msg', c: ck, to: other, m: msg });
      return J(res, 200, { m: msg });
    }
    if (M === 'PATCH' && (m = /^\/api\/messages\/(\d+)$/.exec(p))) {
      const id = +m[1], ck = db.msgLoc[id];
      if (!ck) return J(res, 404, { error: 'Mesaj bulunamadı' });
      const list = db.msgs[ck] || [];
      const msg = list.find(x => x.id === id);
      if (!msg || msg.f !== me) return J(res, 403, { error: 'İzin yok' });
      if (msg.del) return J(res, 400, { error: 'Silinmiş mesaj düzenlenemez' });
      const b = await body(req);
      const t = String(b.t || '').trim().slice(0, 4000);
      if (!t) return J(res, 400, { error: 'Mesaj boş' });
      msg.t = t;
      msg.e = Date.now();
      save();
      pushConv(ck, { type: 'edit', c: ck, id, t, e: msg.e });
      return J(res, 200, { m: msg });
    }
    if (M === 'DELETE' && (m = /^\/api\/messages\/(\d+)$/.exec(p))) {
      const id = +m[1], ck = db.msgLoc[id];
      if (!ck) return J(res, 404, { error: 'Mesaj bulunamadı' });
      const list = db.msgs[ck] || [];
      const msg = list.find(x => x.id === id);
      if (!msg || msg.f !== me) return J(res, 403, { error: 'İzin yok' });
      if (msg.del) return J(res, 200, {});
      msg.del = true;
      msg.t = '';
      delete msg.r;
      save();
      pushConv(ck, { type: 'del', c: ck, id });
      return J(res, 200, {});
    }

    // ---- OKUNDU ----
    if (M === 'POST' && p === '/api/read') {
      const b = await body(req);
      const other = String(b.c || '');
      if (!convAccess(me, other)) return J(res, 403, { error: 'Erişim yok' });
      const ck = convKeyOf(me, other);
      const last = +(b.last || 0);
      const cur = db.reads[me] || (db.reads[me] = {});
      if (last > (cur[ck] || 0)) {
        cur[ck] = last;
        save();
        pushConv(ck, { type: 'read', c: ck, u: me, last });
      }
      return J(res, 200, {});
    }

    // ---- AYARLAR ----
    if (M === 'POST' && p === '/api/settings') {
      const b = await body(req);
      const s = { ...DEF, ...(U.settings || {}) };
      for (const k of ['snow', 'calm', 'sound', 'notify', 'showOnline']) if (k in b) s[k] = !!b[k];
      if (typeof b.accent === 'string' && ACCENTS.includes(b.accent)) s.accent = b.accent;
      if (b.lang === 'tr' || b.lang === 'en') s.lang = b.lang;
      U.settings = s;
      save();
      push(me, { type: 'user' });
      return J(res, 200, { settings: s });
    }

    // ---- PROFİL ----
    if (M === 'POST' && p === '/api/profile') {
      const b = await body(req);
      if (typeof b.bio === 'string') U.bio = b.bio.trim().slice(0, 200);
      if (typeof b.av === 'number') U.av = Math.max(0, Math.min(3, b.av | 0));
      if (typeof b.avatar === 'string') {
        if (b.avatar === '') U.avatar = '';
        else if (/^data:image\/jpeg;base64,/.test(b.avatar) && b.avatar.length < 1e6) U.avatar = b.avatar;
        else return J(res, 400, { error: 'Geçersiz görsel' });
      }
      save();
      broadcast({ type: 'user' });
      return J(res, 200, { me: meOf(me) });
    }

    // ---- NOT (24 saat) ----
    if (M === 'POST' && p === '/api/note') {
      const b = await body(req);
      const t = String(b.t || '').trim().slice(0, 200);
      U.note = t ? { t, ts: Date.now() } : null;
      save();
      for (const f in db.follows) if (Array.isArray(db.follows[f]) && db.follows[f].includes(me)) push(f, { type: 'user' });
      return J(res, 200, { note: noteOf(U) });
    }

    // ---- ŞİFRE DEĞİŞTİR ----
    if (M === 'POST' && p === '/api/password') {
      const b = await body(req);
      if (!okPass(U, String(b.old || ''))) return J(res, 401, { error: 'Mevcut şifre hatalı' });
      const np = String(b.new || '');
      if (np.length < 6 || np.length > 200) return J(res, 400, { error: 'Yeni şifre en az 6 karakter olmalı' });
      Object.assign(U, mkPass(np)); dropSessions(me, sessKey(req)); save();
      return J(res, 200, {});
    }

    // ---- TÜM OTURUMLARDAN ÇIK ----
    if (M === 'POST' && p === '/api/logout-all') {
      dropSessions(me); save(); cookie(res, '', 0, req);
      return J(res, 200, {});
    }

    // ---- HESABI SİL ----
    if (M === 'POST' && p === '/api/delete') {
      const b = await body(req);
      if (!okPass(U, String(b.p || ''))) return J(res, 401, { error: 'Şifre hatalı' });
      delete db.users[me];
      for (const k in db.sessions) if (db.sessions[k].u === me) delete db.sessions[k];
      for (const k in db.follows) { db.follows[k] = (db.follows[k] || []).filter(u => u !== me); if (k === me) delete db.follows[k]; }
      for (const k in db.msgs) {
        const before = db.msgs[k].length;
        db.msgs[k] = db.msgs[k].filter(m => m.f !== me);
        if (!db.msgs[k].length && before) delete db.msgs[k];
      }
      for (const gid in db.groups) {
        const g = db.groups[gid];
        g.members = g.members.filter(u => u !== me);
        if (!g.members.length) { delete db.groups[gid]; delete db.msgs['g:' + gid]; }
        else if (g.owner === me) g.owner = g.members[0];
      }
      delete db.reads[me];
      save(); broadcast({ type: 'user' }); cookie(res, '', 0, req);
      return J(res, 200, {});
    }

    // ---- ÇIKIŞ ----
    if (M === 'POST' && p === '/api/logout') {
      const k = sessKey(req);
      if (k) { delete db.sessions[k]; save(); }
      cookie(res, '', 0, req);
      return J(res, 200, {});
    }

    return J(res, 404, { error: 'Bulunamadı' });
  } catch (e) {
    if (e.message === 'big') return J(res, 413, { error: 'İstek çok büyük' });
    if (e.message === 'bad') return J(res, 400, { error: 'Geçersiz JSON' });
    console.error(e);
    return J(res, 500, { error: 'Sunucu hatası' });
  }
});

if (process.argv[2] === 'reset') { reset(); } else {
  server.listen(PORT, HOST, async () => {
    if (REMOTE) { try { await loadRemote(); console.log('Uzak veritabanı yüklendi.'); } catch (e) { console.error('Uzak yükleme hatası:', e.message); } }
    console.log(`Fluid → http://${HOST}:${PORT}`);
  });
  process.on('SIGINT', () => { try { if (!REMOTE) flushFile(); } catch (e) {} process.exit(0); });
  process.on('SIGTERM', () => { try { if (!REMOTE) flushFile(); } catch (e) {} process.exit(0); });
}
