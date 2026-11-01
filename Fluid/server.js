'use strict';
// Fluid sunucusu – sıfır bağımlılık (yalnızca Node.js 18+).
// Çalıştır: node server.js      Şifre sıfırla: node server.js reset <kullanici> <yeni-sifre>
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 3000, HOST = process.env.HOST || '0.0.0.0';
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), FILE = path.join(DATA, 'db.json');
const INVITE = process.env.INVITE_CODE || '', TRUST = process.env.TRUST_PROXY === '1';
const DAY = 864e5, SESS = 30 * DAY, NAME = /^[a-z0-9_]{3,16}$/;
const ACCENTS = ['ice', 'violet', 'mint', 'rose'];
const DEF = { accent: 'ice', snow: true, calm: false, sound: true, notify: false, showOnline: true };
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'";

fs.mkdirSync(DATA, { recursive: true });
let db = { users: {}, msgs: {}, reads: {}, sessions: {}, seq: 0 };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, 'utf8'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
let timer = null;
const flush = () => { clearTimeout(timer); timer = null; const t = FILE + '.tmp'; fs.writeFileSync(t, JSON.stringify(db)); fs.renameSync(t, FILE); };
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

const tries = new Map();
const limited = ip => { const now = Date.now(), a = (tries.get(ip) || []).filter(t => now - t < 6e5); tries.set(ip, a); return a.length >= 10; };
const strike = ip => (tries.get(ip) || tries.set(ip, []).get(ip)).push(Date.now());

// ---- yardımcılar ----
const key = (a, b) => [a, b].sort().join('|');
const noteOf = o => (o.note && Date.now() - o.note.ts < DAY ? o.note : null);
const clients = new Map();
const isOnline = u => (clients.get(u) || { size: 0 }).size > 0 && db.users[u].settings?.showOnline !== false;
const meOf = u => { const o = db.users[u]; return { u, bio: o.bio, av: o.av, note: noteOf(o), settings: { ...DEF, ...o.settings } }; };
function listFor(me) {
  const r = (db.reads[me] || {});
  return Object.keys(db.users).filter(x => x !== me).map(x => {
    const o = db.users[x], m = db.msgs[key(me, x)] || [], l = m[m.length - 1], last = r[x] || 0;
    return { u: x, bio: o.bio, av: o.av, note: noteOf(o), online: isOnline(x), unread: m.filter(z => z.f === x && z.id > last).length, last: l ? { t: l.t, ts: l.ts, f: l.f } : null };
  });
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
if (process.argv[2] === 'reset') {
  const [u, pw] = [String(process.argv[3] || '').toLowerCase(), process.argv[4] || ''];
  if (!db.users[u] || pw.length < 6) { console.log('Kullanım: node server.js reset <kullanici> <en-az-6-karakter>'); process.exit(1); }
  Object.assign(db.users[u], mkPass(pw)); dropSessions(u); flush(); console.log(`✔ ${u} için şifre güncellendi.`); process.exit(0);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'same-origin'); res.setHeader('X-Frame-Options', 'DENY');
  const p = new URL(req.url, 'http://x').pathname, M = req.method;
  try {
    if (M === 'GET' && p === '/') { res.setHeader('Content-Security-Policy', CSP); res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); return res.end(fs.readFileSync(path.join(__dirname, 'index.html'))); }
    if (!p.startsWith('/api/') && !p.startsWith('/avatar/')) { res.writeHead(404); return res.end(); }
    if (M !== 'GET' && req.headers.origin) { let ok = false; try { const h = new URL(req.headers.origin).host; ok = h === req.headers.host || h === req.headers['x-forwarded-host']; } catch (e) {} if (!ok) return J(res, 403, { error: 'Geçersiz istek' }); }
    const ip = TRUST ? ((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress) : req.socket.remoteAddress;

    if (p === '/api/config') return J(res, 200, { invite: !!INVITE });
    if (M === 'POST' && p === '/api/register') {
      const b = await body(req); if (limited(ip)) return J(res, 429, { error: 'Çok fazla deneme, biraz bekle' });
      const u = String(b.u || '').toLowerCase(), pw = String(b.p || '');
      if (INVITE && b.invite !== INVITE) { strike(ip); return J(res, 403, { error: 'Davet kodu hatalı' }); }
      if (!NAME.test(u)) return J(res, 400, { error: 'Kullanıcı adı: 3–16 harf/rakam/_' });
      if (pw.length < 6 || pw.length > 200) return J(res, 400, { error: 'Şifre en az 6 karakter olmalı' });
      if (db.users[u]) return J(res, 409, { error: 'Bu kullanıcı adı alınmış' });
      db.users[u] = { ...mkPass(pw), bio: '', avatar: '', av: 0, note: null, settings: { ...DEF }, created: Date.now() };
      newSession(u, req, res); save(); broadcast({ type: 'user' }); return J(res, 200, { me: meOf(u) });
    }
    if (M === 'POST' && p === '/api/login') {
      const b = await body(req); if (limited(ip)) return J(res, 429, { error: 'Çok fazla deneme, biraz bekle' });
      const u = String(b.u || '').toLowerCase(), o = db.users[u];
      if (!o || !okPass(o, String(b.p || ''))) { strike(ip); return J(res, 401, { error: 'Kullanıcı adı veya şifre hatalı' }); }
      tries.delete(ip); newSession(u, req, res); return J(res, 200, { me: meOf(u) });
    }

    const me = auth(req); if (!me) return J(res, 401, { error: 'Oturum gerekli' });
    const U = db.users[me];

    let m;
    if (M === 'GET' && (m = /^\/avatar\/([^/]+)$/.exec(p))) {
      const o = db.users[decodeURIComponent(m[1])];
      if (!o || !o.avatar) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, max-age=31536000, immutable' });
      return res.end(Buffer.from(o.avatar.split(',')[1], 'base64'));
    }
    if (M === 'GET' && p === '/api/me') return J(res, 200, { me: meOf(me) });
    if (M === 'GET' && p === '/api/users') return J(res, 200, { users: listFor(me) });
    if (M === 'GET' && p === '/api/stream') {
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
        const list = db.msgs[key(me, other)] = arr; list.push(msg); if (list.length > 5000) list.splice(0, list.length - 5000);
        (db.reads[me] = db.reads[me] || {})[other] = msg.id; save();
        const ev = { type: 'msg', to: other, m: msg }; push(other, ev); push(me, ev); return J(res, 200, { m: msg });
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
      for (const k of ['snow', 'calm', 'sound', 'notify', 'showOnline']) if (typeof b[k] === 'boolean') s[k] = b[k];
      save(); if ('showOnline' in b) broadcast({ type: 'presence' }); return J(res, 200, { settings: s });
    }
    if (M === 'POST' && p === '/api/password') {
      const b = await body(req); if (limited(ip)) return J(res, 429, { error: 'Çok fazla deneme, biraz bekle' });
      if (!okPass(U, String(b.old || ''))) { strike(ip); return J(res, 403, { error: 'Mevcut şifre hatalı' }); }
      const n = String(b.new || ''); if (n.length < 6 || n.length > 200) return J(res, 400, { error: 'Yeni şifre en az 6 karakter olmalı' });
      Object.assign(U, mkPass(n)); dropSessions(me, sessKey(req)); save(); return J(res, 200, {});
    }
    if (M === 'POST' && p === '/api/logout') { delete db.sessions[sessKey(req)]; cookie(res, '', 0, req); save(); return J(res, 200, {}); }
    if (M === 'POST' && p === '/api/logout-all') { dropSessions(me); cookie(res, '', 0, req); save(); return J(res, 200, {}); }
    if (M === 'POST' && p === '/api/delete') {
      const b = await body(req); if (limited(ip)) return J(res, 429, { error: 'Çok fazla deneme, biraz bekle' });
      if (!okPass(U, String(b.p || ''))) { strike(ip); return J(res, 403, { error: 'Şifre hatalı' }); }
      delete db.users[me]; dropSessions(me); delete db.reads[me];
      for (const k of Object.keys(db.msgs)) if (k.split('|').includes(me)) delete db.msgs[k];
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
server.listen(PORT, HOST, () => console.log(`❄  Fluid çalışıyor → http://localhost:${PORT}  (veri: ${FILE})${INVITE ? '  [davet kodu aktif]' : ''}`));
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { flush(); process.exit(0); });
