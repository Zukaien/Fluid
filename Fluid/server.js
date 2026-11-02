'use strict';
// Fluid sunucusu – sıfır bağımlılık (yalnızca Node.js 18+).
// Çalıştır: node server.js      Şifre sıfırla: node server.js reset <kullanici> <yeni-sifre>
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 3000, HOST = process.env.HOST || '0.0.0.0';
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), FILE = path.join(DATA, 'db.json');
const INVITE = process.env.INVITE_CODE || '', TRUST = process.env.TRUST_PROXY === '1' || !!process.env.RENDER;
const DAY = 864e5, SESS = 30 * DAY, NAME = /^[a-z0-9_]{3,16}$/;
const ACCENTS = ['ice', 'violet', 'mint', 'rose'];
const DEF = { accent: 'ice', snow: true, calm: false, sound: true, notify: false, showOnline: true, frutiger: false, fmusic: false };
const GIPHY_KEY = process.env.GIPHY_API_KEY || '', GIPHY_BASE = process.env.GIPHY_BASE || 'https://api.giphy.com/v1/gifs/';
const GIF_RE = /^https:\/\/(media\d*|i)\.giphy\.com\//, clampN = v => Math.max(50, Math.min(600, Math.round(+v) || 200));
const CSP = "default-src 'self'; img-src 'self' data: https://*.giphy.com; media-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'";

fs.mkdirSync(DATA, { recursive: true });
let db = { users: {}, msgs: {}, reads: {}, sessions: {}, follows: {}, groups: {}, arch: {}, imgs: {}, seq: 0 };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
let timer = null;
const flushFile = () => { const t = FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, FILE); };

// ---- isteğe bağlı uzak kayıt: Upstash Redis (ücretsiz plan) ----
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
  out['fluid:core'] = JSON.stringify({ users, reads: db.reads, sessions: db.sessions, seq: db.seq, convs: Object.keys(db.msgs), imgs: Object.keys(db.imgs), follows: db.follows, groups: db.groups, arch: db.arch });
  for (const k in db.msgs) out['fluid:msg:' + k] = JSON.stringify(db.msgs[k]);
  for (const k in db.imgs) out['fluid:img:' + k] = db.imgs[k];
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
    const imgs = core.imgs || [], cmds = [...names.map(u => ['GET', 'fluid:av:' + u]), ...convs.map(k => ['GET', 'fluid:msg:' + k]), ...imgs.map(k => ['GET', 'fluid:img:' + k])];
    for (let i = 0; i < cmds.length; i += 50) res.push(...await rpipe(cmds.slice(i, i + 50)));
    db = { users: core.users || {}, reads: core.reads || {}, sessions: core.sessions || {}, follows: core.follows || {}, groups: core.groups || {}, arch: core.arch || {}, seq: core.seq || 0, msgs: {}, imgs: {} };
    names.forEach((u, i) => { db.users[u].avatar = res[i] || ''; });
    convs.forEach((k, i) => { db.msgs[k] = JSON.parse(res[names.length + i] || '[]'); });
    imgs.forEach((k, i) => { const v = res[names.length + convs.length + i]; if (v) db.imgs[k] = v; });
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

function listFor(me) {
  const r = db.reads[me] || {}, fol = new Set(db.follows[me] || []), out = [];
  for (const x of Object.keys(db.users)) {
    if (x === me) continue;
    const o = db.users[x], m = db.msgs[key(me, x)] || [];
    if (!fol.has(x) && !m.length) continue;
    const l = m[m.length - 1], last = r[x] || 0;
    out.push({ u: x, bio: o.bio, av: o.av, note: fol.has(x) ? noteOf(o) : null, online: isOnline(x), following: fol.has(x), arch: archOf(key(me, x), me), unread: m.filter(z => z.f === x && z.id > last && !z.d).length, last: l ? { t: l.d ? '' : l.t, ts: l.ts, f: l.f, g: !!l.g, i: !!l.i, d: !!l.d } : null });
  }
  return out;
}

const rmImgs = arr => { for (const x of arr || []) if (x.i) delete db.imgs[x.i]; };
const ARCH_N = +process.env.ARCHIVE_COUNT || 3000, ARCH_MS = (+process.env.ARCHIVE_DAYS || 3) * DAY;
const members = ck => ck.startsWith('g:') ? ((db.groups[ck.slice(2)] || {}).members || []) : ck.split('|');
const archOf = (ck, me) => { const a = db.arch[ck]; return a ? { n: a.n, deadline: a.at + ARCH_MS, done: a.dl.includes(me) } : null; };
function checkArchive(ck) {
  const l = db.msgs[ck]; if (!l || db.arch[ck]) return;
  if (l.length < ARCH_N && l.reduce((s, x) => s + x.t.length + 60, 0) < 6e5) return;
  const n = l.length >= ARCH_N ? ARCH_N : Math.ceil(l.length / 2);
  db.arch[ck] = { upto: l[n - 1].id, n, at: Date.now(), dl: [] };
  for (const u of members(ck)) push(u, { type: 'user' });
}
function sweepArchives() {
  let ch = false;
  for (const ck of Object.keys(db.arch)) {
    const a = db.arch[ck], mem = members(ck);
    if (mem.length && Date.now() - a.at < ARCH_MS && !mem.every(u => a.dl.includes(u) || !db.users[u])) continue;
    rmImgs((db.msgs[ck] || []).filter(x => x.id <= a.upto)); db.msgs[ck] = (db.msgs[ck] || []).filter(x => x.id > a.upto); delete db.arch[ck]; ch = true;
    checkArchive(ck); for (const u of mem) push(u, { type: 'user' });
  }
  if (ch) save();
}
setInterval(sweepArchives, 6e4);

const groupOf = (g, me) => { const k = 'g:' + g.id, m = db.msgs[k] || [], l = m[m.length - 1], last = (db.reads[me] || {})[k] || 0;
  return { id: g.id, name: g.name, owner: g.owner, members: g.members.map(u => ({ u, av: db.users[u] ? db.users[u].av : 0 })),
    unread: m.filter(z => z.f !== me && z.id > last && !z.d).length, last: l ? { t: l.d ? '' : l.t, ts: l.ts, f: l.f, g: !!l.g, i: !!l.i, d: !!l.d } : null, arch: archOf(k, me) }; };
const groupsFor = me => Object.values(db.groups).filter(g => g.members.includes(me)).map(g => groupOf(g, me));
function dropGroup(id) { rmImgs(db.msgs['g:' + id]); delete db.groups[id]; delete db.msgs['g:' + id]; delete db.arch['g:' + id]; for (const u in db.reads) delete db.reads[u]['g:' + id]; }
const push = (u, ev) => { for (const r of clients.get(u) || []) r.write(`data: ${JSON.stringify(ev)}\n\n`); };
const broadcast = ev => { for (const u of clients.keys()) push(u, ev); };
setInterval(() => { for (const s of clients.values()) for (const r of s) r.write(':\n\n'); }, 25000);

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

const MEDIA = path.join(__dirname, 'media'), MT = { mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg' };
function media(req, res, name) {
  let st; try { st = fs.statSync(path.join(MEDIA, name)); } catch (e) { res.writeHead(404); return res.end(); }
  const h = { 'Content-Type': MT[name.split('.').pop()], 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' };
  const r = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  let s = 0, e = st.size - 1, code = 200;
  if (r && (r[1] || r[2])) {
    if (r[1]) { s = +r[1]; if (r[2]) e = Math.min(+r[2], e); } else s = Math.max(0, st.size - +r[2]);
    if (s > e || s >= st.size) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
    code = 206; h['Content-Range'] = `bytes ${s}-${e}/${st.size}`;
  }
  h['Content-Length'] = e - s + 1; res.writeHead(code, h);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(path.join(MEDIA, name), { start: s, end: e }).pipe(res);
}

const gifCache = new Map();
async function gifs(q) {
  const ck = q.toLowerCase(), c = gifCache.get(ck); if (c && Date.now() - c.t < 6e5) return c.d;
  const u = new URL(GIPHY_BASE + (q ? 'search' : 'trending'));
  u.search = new URLSearchParams({ api_key: GIPHY_KEY, limit: '24', rating: 'pg-13', ...(q ? { q } : {}) });
  const r = await fetch(u, { signal: AbortSignal.timeout(8000) }); if (!r.ok) throw new Error('giphy ' + r.status);
  const j = await r.json(), d = (j.data || []).map(g => { const i = g.images || {}, a = i.fixed_width || i.downsized || {}, p = a;
    return { id: g.id, u: a.url, p: p.url, w: +a.width || 200, h: +a.height || 200 }; }).filter(x => x.u && x.p && GIF_RE.test(x.u) && GIF_RE.test(x.p));
  if (gifCache.size > 200) gifCache.clear(); gifCache.set(ck, { t: Date.now(), d }); return d;
}

// ---- EKLEME: CALL SERVER TANIMI (apply-call.js ile eklenen kısım) ----
const CALL = require('./call-server.js')({ db: () => db, push, members, key });

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('X-Frame-Options', 'DENY');
  const url = new URL(req.url, 'http://x'), p = url.pathname, M = req.method;
  try {
    if (M === 'GET' && p === '/') { res.setHeader('Content-Security-Policy', CSP); res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); return res.end(fs.readFileSync(path.join(__dirname, 'index.html'))); }
    
    // ---- EKLEME: call.js sunumu ----
    if (M === 'GET' && p === '/call.js') { res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' }); return res.end(fs.readFileSync(path.join(__dirname, 'call.js'))); }

    { const mm = /^\/media\/(frutiger\.(?:mp4|webm|mp3))$/.exec(p); if ((M === 'GET' || M === 'HEAD') && mm) return media(req, res, mm[1]); }
    if (!p.startsWith('/api/') && !p.startsWith('/avatar/') && !p.startsWith('/img/')) { res.writeHead(404); return res.end(); }
    if (M !== 'GET' && req.headers.origin) { let ok = false; try { const h = new URL(req.headers.origin).host; ok = h === req.headers.host || h === req.headers['x-forwarded-host']; } catch (e) {} if (!ok) return J(res, 403, { error: 'Geçersiz istek' }); }
    const ip = TRUST ? ((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress) : req.socket.remoteAddress;

    if (p === '/api/config') return J(res, 200, { invite: !!INVITE, gif: !!GIPHY_KEY });
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

    // ---- EKLEME: Call API rotaları ----
    if (M === 'POST' && p.startsWith('/api/call/')) return await CALL.route(req, res, p, me, body, J);

    let m;
    if (M === 'GET' && (m = /^\/avatar\/([^/]+)$/.exec(p))) {
      const o = db.users[decodeURIComponent(m[1])];
      if (!o || !o.avatar) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=31536000, immutable' });
      return res.end(Buffer.from(o.avatar.split(',')[1], 'base64'));
    }
    if (M === 'GET' && (m = /^\/img\/([a-f0-9]{24})$/.exec(p))) {
      const d = db.imgs[m[1]]; if (!d) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=31536000, immutable' });
      return res.end(Buffer.from(d, 'base64'));
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
    if (M === 'GET' && p === '/api/gifs') {
      if (!GIPHY_KEY) return J(res, 503, { error: 'GIF servisi ayarlanmamış' });
      const w = wait(['gf:' + me, 60]); if (w) return tooMany(res, w); strike('gf:' + me);
      try { return J(res, 200, { gifs: await gifs(String(url.searchParams.get('q') || '').trim().slice(0, 50)) }); }
      catch (e) { console.error('GIPHY:', e.message); return J(res, 502, { error: 'GIF servisine ulaşılamıyor' }); }
    }
    if (M === 'GET' && (m = /^\/api\/user\/([^/]+)$/.exec(p))) {
      const u = decodeURIComponent(m[1]).toLowerCase(), o = db.users[u]; if (!o) return J(res, 404, { error: 'Kullanıcı bulunamadı' });
      const isF = (db.follows[me] || []).includes(u), theirs = db.follows[u] || [];
      return J(res, 200, { u, bio: o.bio, av: o.av, created: o.created, note: isF || u === me ? noteOf(o) : null,
        followers: Object.values(db.follows).filter(l => l.includes(u)).length, following: theirs.length,
        isFollowing: isF, followsMe: theirs.includes(me), online: u !== me && isF ? isOnline(u) : false });
    }
    if (M === 'GET' && p === '/api/me') return J(res, 200, { me: meOf(me) });
    if (M === 'GET' && p === '/api/users') { sweepArchives(); return J(res, 200, { users: listFor(me), groups: groupsFor(me) }); }
    if (M === 'GET' && p === '/api/stream') {
      if (url.searchParams.get('u') !== me) { res.writeHead(409); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.write('retry: 3000\n\n');
      let set = clients.get(me); if (!set) clients.set(me, set = new Set());
      const was = set.size; set.add(res); if (!was) broadcast({ type: 'presence' });
      
      // ---- EKLEME: Ring kontrolü ----
      CALL.rings(me, res);

      req.on('close', () => { 
        set.delete(res); 
        if (!set.size) setTimeout(() => { 
          if (!(clients.get(me) || { size: 0 }).size) { 
            // ---- EKLEME: Çıkışta aramalardan düşür ----
            CALL.leaveAll(me); 
            broadcast({ type: 'presence' }); 
          } 
        }, 3000); 
      });
      return;
    }
    if (M === 'POST' && p === '/api/groups') {
      const b = await body(req), name = String(b.name || '').trim().slice(0, 30); if (!name) return J(res, 400, { error: 'Grup adı gerekli' });
      const mem = [...new Set([me, ...(Array.isArray(b.members) ? b.members.map(String) : [])])].filter(x => db.users[x]).slice(0, 50);
      if (mem.length < 2) return J(res, 400, { error: 'En az bir üye seç' });
      const id = crypto.randomBytes(4).toString('hex'); db.groups[id] = { id, name, owner: me, members: mem, created: Date.now() };
      save(); for (const u of mem) push(u, { type: 'user' }); return J(res, 200, { group: groupOf(db.groups[id], me) });
    }
    if (M === 'POST' && (m = /^\/api\/groups\/([a-f0-9]{8})\/(members|leave)$/.exec(p))) {
      const g = db.groups[m[1]]; if (!g || !g.members.includes(me)) return J(res, 404, { error: 'Grup bulunamadı' });
      const before = [...g.members];
      if (m[2] === 'members') {
        const b = await body(req), add = [...new Set((Array.isArray(b.members) ? b.members.map(String) : []).filter(x => db.users[x] && !g.members.includes(x)))];
        if (g.members.length + add.length > 50) return J(res, 400, { error: 'Çok fazla üye' });
        g.members.push(...add);
      } else {
        g.members = g.members.filter(x => x !== me); if (g.owner === me && g.members.length) g.owner = g.members[0];
        if (!g.members.length) dropGroup(g.id);
      }
      save(); for (const u of new Set([...before, ...(db.groups[g.id] ? g.members : [])])) push(u, { type: 'user' }); return J(res, 200, {});
    }
    if (M === 'POST' && (m = /^\/api\/archive\/([^/]+)$/.exec(p))) {
      const other = decodeURIComponent(m[1]), gk = other.startsWith('g:'), grp = gk ? db.groups[other.slice(2)] : null;
      if (gk ? !(grp && grp.members.includes(me)) : (!db.users[other] || other === me)) return J(res, 404, { error: gk ? 'Grup bulunamadı' : 'Kullanıcı bulunamadı' });
      const ck = gk ? other : key(me, other), a = db.arch[ck]; if (!a) return J(res, 404, { error: 'İndirilecek mesaj yok' });
      const msgs = (db.msgs[ck] || []).filter(x => x.id <= a.upto && !x.d);
      if (!a.dl.includes(me)) a.dl.push(me);
      save(); sweepArchives(); return J(res, 200, { msgs });
    }
    if ((M === 'PUT' || M === 'DELETE') && (m = /^\/api\/messages\/([^/]+)\/(\d+)$/.exec(p))) {
      const other = decodeURIComponent(m[1]), gk = other.startsWith('g:'), grp = gk ? db.groups[other.slice(2)] : null;
      if (gk ? !(grp && grp.members.includes(me)) : (!db.users[other] || other === me)) return J(res, 404, { error: gk ? 'Grup bulunamadı' : 'Kullanıcı bulunamadı' });
      const arr = db.msgs[gk ? other : key(me, other)] || [], msg = arr.find(z => z.id === +m[2]);
      if (!msg) return J(res, 404, { error: 'Mesaj bulunamadı' });
      if (msg.f !== me) return J(res, 403, { error: 'Sadece kendi mesajını değiştirebilirsin' });
      if (msg.d) return J(res, 400, { error: 'Mesaj zaten silinmiş' });
      if (M === 'PUT') {
        const t = String((await body(req)).t || '').trim().slice(0, 2000);
        if (msg.g) return J(res, 400, { error: 'GIF düzenlenemez' }); if (!t) return J(res, 400, { error: 'Boş mesaj' });
        msg.t = t; msg.e = Date.now();
      } else {
        rmImgs([msg]); msg.d = 1; msg.t = ''; delete msg.g; delete msg.i; delete msg.iw; delete msg.ih; delete msg.r; delete msg.e;
        for (const x of arr) if (x.r && x.r.id === msg.id) { x.r.t = ''; x.r.d = 1; }
      }
      save(); const ev = { type: M === 'PUT' ? 'edit' : 'del', ...(gk ? { g: other } : { to: other }), m: msg };
      for (const u of gk ? grp.members : [other, me]) push(u, ev); return J(res, 200, { m: msg });
    }
    if ((m = /^\/api\/(messages|read)\/([^/]+)$/.exec(p))) {
      const other = decodeURIComponent(m[2]), gk = other.startsWith('g:'), grp = gk ? db.groups[other.slice(2)] : null;
      if (gk ? !(grp && grp.members.includes(me)) : (!db.users[other] || other === me)) return J(res, 404, { error: gk ? 'Grup bulunamadı' : 'Kullanıcı bulunamadı' });
      const ck = gk ? other : key(me, other), arr = db.msgs[ck] || [];
      if (M === 'GET' && m[1] === 'messages') return J(res, 200, { msgs: arr.slice(-300) });
      if (M === 'POST' && m[1] === 'read') { (db.reads[me] = db.reads[me] || {})[other] = arr.length ? arr[arr.length - 1].id : 0; save(); return J(res, 200, {}); }
      if (M === 'POST' && m[1] === 'messages') {
        const b = await body(req), t = String(b.t || '').trim().slice(0, 2000), gx = b.gif;
        const gif = gx && typeof gx.u === 'string' && gx.u.length < 600 && GIF_RE.test(gx.u) ? { u: gx.u, w: clampN(gx.w), h: clampN(gx.h) } : null;
        const im = !gif && typeof b.img === 'string' && b.img.length < 7e5 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.img) ? b.img.slice(23) : null;
        if (!t && !gif && !im) return J(res, 400, { error: 'Boş mesaj' });
        const msg = { id: ++db.seq, f: me, t: gif ? '' : t, ts: Date.now() }; if (gif) msg.g = gif;
        if (im) { const id = crypto.randomBytes(12).toString('hex'); db.imgs[id] = im; msg.i = id; msg.iw = clampN(b.iw); msg.ih = clampN(b.ih); }
        const ro = b.r ? arr.find(z => z.id === +b.r && !z.d) : null; if (ro) msg.r = { id: ro.id, f: ro.f, t: ro.g ? 'GIF' : ro.i && !ro.t ? '📷' : ro.t.slice(0, 120) };
        const list = db.msgs[ck] = arr; list.push(msg); checkArchive(ck);
        (db.reads[me] = db.reads[me] || {})[other] = msg.id; save();
        const ev = gk ? { type: 'msg', g: other, m: msg } : { type: 'msg', to: other, m: msg };
        for (const u of gk ? grp.members : [other, me]) push(u, ev); return J(res, 200, { m: msg });
      }
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
      for (const k of ['snow', 'calm', 'sound', 'notify', 'showOnline', 'frutiger', 'fmusic']) if (typeof b[k] === 'boolean') s[k] = b[k];
      save(); if ('showOnline' in b) broadcast({ type: 'presence' }); return J(res, 200, { settings: s });
    }
    if (M === 'POST' && p === '/api/password') {
      const b = await body(req), pk = 'pw:' + me, w = wait([pk, 8]); if (w) return tooMany(res, w);
      if (!okPass(U, String(b.old || ''))) { strike(pk); return J(res, 403, { error: 'Mevcut şifre hatalı' }); }
      const n = String(b.new || ''); if (n.length < 6 || n.length > 200) return J(res, 400, { error: 'Yeni şifre en az 6 karakter olmalı' });
      Object.assign(U, mkPass(n)); dropSessions(me, sessKey(req)); save(); return J(res, 200, {});
    }
    if (M === 'POST' && p === '/api/logout') { 
      // ---- EKLEME: Çıkış yaparken aramadan ayrıl ----
      CALL.leaveAll(me);
      delete db.sessions[sessKey(req)]; cookie(res, '', 0, req); save(); return J(res, 200, {}); 
    }
    if (M === 'POST' && p === '/api/logout-all') { 
      CALL.leaveAll(me);
      dropSessions(me); cookie(res, '', 0, req); save(); return J(res, 200, {}); 
    }
    if (M === 'POST' && p === '/api/delete') {
      const b = await body(req), pk = 'pw:' + me, w = wait([pk, 8]); if (w) return tooMany(res, w);
      if (!okPass(U, String(b.p || ''))) { strike(pk); return J(res, 403, { error: 'Şifre hatalı' }); }
      
      // ---- EKLEME: Hesap silinirken aramadan ayrıl ----
      CALL.leaveAll(me);

      delete db.users[me]; dropSessions(me); delete db.reads[me]; delete db.follows[me];
      for (const k in db.follows) db.follows[k] = db.follows[k].filter(x => x !== me);
      for (const g of Object.values(db.groups)) if (g.members.includes(me)) { g.members = g.members.filter(x => x !== me); if (!g.members.length) dropGroup(g.id); else if (g.owner === me) g.owner = g.members[0]; }
      for (const k of Object.keys(db.msgs)) if (k.split('|').includes(me)) { rmImgs(db.msgs[k]); delete db.msgs[k]; delete db.arch[k]; }
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
  sweepArchives();
  server.listen(PORT, HOST, () => console.log(`❄  Fluid çalışıyor → http://localhost:${PORT}  (veri: ${REMOTE ? 'Upstash Redis' : FILE})${INVITE ? '  [davet kodu aktif]' : ''}`));
})();
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, async () => {
  clearTimeout(timer);
  try { if (REMOTE) await Promise.race([pushRemote(), new Promise(r => setTimeout(r, 8000))]); else flushFile(); } catch (e) { console.error(e.message); }
  process.exit(0);
});
