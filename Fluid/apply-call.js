'use strict';
// Kullanım (server.js ve index.html ile aynı klasörde):  node apply-call.js
// Sesli arama için bu iki dosyaya birkaç satırlık ekleme yapar. Yedekler .bak olarak kaydedilir.
const fs = require('fs');
function patch(file, edits) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes(edits.marker)) return console.log(file + ': zaten uygulanmış, atlandı.');
  fs.writeFileSync(file + '.bak', s);
  for (const [from, to] of edits.list) {
    const n = s.split(from).length - 1;
    if (n !== 1) throw new Error(`${file}: "${from.slice(0, 50)}…" ${n} kez bulundu (1 olmalı). Dosya değişmiş olabilir, hiçbir şey yazılmadı.`);
    s = s.replace(from, () => to);
  }
  fs.writeFileSync(file, s); console.log(file + ': güncellendi.');
}
patch('server.js', { marker: "require('./call-server.js')", list: [
  ["const J = (res, code, o) =>", "const CALL = require('./call-server.js')({ db: () => db, push, members, key });\nconst J = (res, code, o) =>"],
  ["if (!p.startsWith('/api/') && !p.startsWith('/avatar/')", "if (M === 'GET' && p === '/call.js') { res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' }); return res.end(fs.readFileSync(path.join(__dirname, 'call.js'))); }\n    if (!p.startsWith('/api/') && !p.startsWith('/avatar/')"],
  ["if (M === 'POST' && p === '/api/groups') {", "if (M === 'POST' && p.startsWith('/api/call/')) return await CALL.route(req, res, p, me, body, J);\n    if (M === 'POST' && p === '/api/groups') {"],
  ["if (!was) broadcast({ type: 'presence' });", "if (!was) broadcast({ type: 'presence' }); CALL.rings(me, res);"],
  ["if (!(clients.get(me) || { size: 0 }).size) broadcast({ type: 'presence' });", "if (!(clients.get(me) || { size: 0 }).size) { CALL.leaveAll(me); broadcast({ type: 'presence' }); }"],
  ["delete db.users[me]; dropSessions(me);", "CALL.leaveAll(me); delete db.users[me]; dropSessions(me);"],
] });
patch('index.html', { marker: '/call.js', list: [
  ["es.onmessage=e=>{const d=JSON.parse(e.data);", "es.onmessage=e=>{const d=JSON.parse(e.data);if(d.type&&d.type.startsWith('call-')){if(window.FCall)FCall.ev(d);return}"],
  ["$('#sb').onclick=send;", "if(window.FCall)FCall.hdrBtn();$('#sb').onclick=send;"],
  ["function toLogin(){", "function toLogin(){if(window.FCall)FCall.hangup(1);"],
  ["</script></body></html>", "</script><script src=\"/call.js\"></script></body></html>"],
] });
