<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content">
<meta name="theme-color" content="#050b1a"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<script>document.documentElement.classList.toggle("mobile",matchMedia("(max-width:820px)").matches)</script>
<title>Fluid</title><link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><path d=%22M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5%22 stroke=%22%238fe3ff%22 stroke-width=%222%22 stroke-linecap=%22round%22 fill=%22none%22/></svg>">
<style>
:root{--a1:#6fd6ff;--a2:#9aa8ff;--ar:143,227,255;--bg1:#050b1a;--bg2:#0b1c3a;--ice:#8fe3ff;--ice2:#c9f3ff;--glass:rgba(160,220,255,.07);--line:rgba(160,220,255,.16);--tx:#e8f6ff;--mut:#8fb0c8;--ease:cubic-bezier(.22,1,.36,1)}
*{box-sizing:border-box;margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
html,body{height:100%}
body{background:radial-gradient(1200px 700px at 15% 0,#12305e 0,transparent 60%),radial-gradient(900px 600px at 90% 100%,#0e4a63 0,transparent 55%),linear-gradient(160deg,var(--bg1),var(--bg2));color:var(--tx);overflow:hidden}
canvas#snow{position:fixed;inset:0;pointer-events:none;z-index:0}
.glass{background:var(--glass);border:1px solid var(--line);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
button{cursor:pointer;border:0;color:inherit;background:none;transition:.3s var(--ease)}
input,textarea{background:rgba(255,255,255,.05);border:1px solid var(--line);color:var(--tx);border-radius:14px;padding:13px 15px;outline:0;width:100%;font-size:15px;transition:.3s var(--ease)}
input:focus,textarea:focus{border-color:var(--ice);box-shadow:0 0 0 4px rgba(var(--ar),.14),0 0 24px rgba(var(--ar),.18);background:rgba(255,255,255,.08)}
.btn{--c1:var(--a1);--c2:var(--a2);background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.65) 50%,transparent 65%) 150% 0/250% 100% no-repeat,linear-gradient(135deg,var(--c1),var(--c2));color:#04122a;font-weight:700;padding:13px 20px;border-radius:14px;position:relative;transition:transform .3s var(--ease),box-shadow .3s var(--ease),background-position .8s var(--ease)}
.btn:hover{transform:scale(1.045);box-shadow:0 10px 30px rgba(111,214,255,.4);background-position:-50% 0,0 0}.btn:active{transform:scale(1.01)}


.ghost{padding:10px 16px;border-radius:12px;border:1px solid var(--line);color:var(--ice2)}.ghost:hover{background:rgba(var(--ar),.12);transform:scale(1.05)}
.screen{position:fixed;inset:0;z-index:1;display:none}.screen.on{display:flex;animation:in .7s var(--ease)}
@keyframes in{from{opacity:0;transform:scale(.97) translateY(18px);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
@keyframes out{to{opacity:0;transform:scale(1.04);filter:blur(10px)}}
/* login */
#login{align-items:center;justify-content:center}
.card{width:min(400px,92vw);padding:38px 32px;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12);display:grid;gap:14px}
.logo{font-size:44px;font-weight:800;letter-spacing:-1px;text-align:center;background:linear-gradient(120deg,#fff,var(--ice) 40%,#a9b8ff 70%,#fff);background-size:220%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 6s linear infinite}
@keyframes shine{to{background-position:220% 0}}
.sub{text-align:center;color:var(--mut);font-size:14px;margin-top:-8px}
.tabs{display:flex;background:rgba(255,255,255,.05);border-radius:14px;padding:4px;position:relative}
.tabs button{flex:1;padding:10px;border-radius:11px;z-index:1;color:var(--mut)}.tabs button.on{color:#04122a;font-weight:700}
.tabs i{position:absolute;top:4px;bottom:4px;width:calc(50% - 4px);background:linear-gradient(135deg,var(--a1),var(--a2));border-radius:11px;transition:.45s var(--ease)}
.err{color:#ff9fb2;font-size:13px;min-height:16px;text-align:center}
/* app */
#app{gap:14px;padding:14px}
.side{position:relative;z-index:5;width:76px;border-radius:24px;display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:10px}
.side .lg{font-weight:800;color:var(--ice);font-size:13px;margin-bottom:10px}
.nv{width:52px;height:52px;border-radius:16px;font-size:22px;position:relative}
.nv:hover{background:rgba(var(--ar),.14);transform:scale(1.08)}
.nv.on{background:rgba(var(--ar),.2);box-shadow:0 0 22px rgba(var(--ar),.3)}
.nv:hover::after{content:attr(data-t);position:absolute;left:62px;top:50%;transform:translateY(-50%);background:#0d2447;border:1px solid var(--line);padding:5px 10px;border-radius:9px;font-size:12px;white-space:nowrap;z-index:9;animation:in .25s}
.list{width:340px;border-radius:24px;display:flex;flex-direction:column;overflow:hidden}
.list h2{padding:20px 20px 6px;font-size:22px}
.notes{display:flex;gap:6px;padding:104px 14px 12px;overflow-x:auto;scrollbar-width:thin;scrollbar-color:rgba(var(--ar),.4) transparent}
.nt{display:grid;justify-items:center;gap:6px;min-width:96px;position:relative}.avw{cursor:pointer}

.bub{position:absolute;bottom:calc(100% + 9px);left:50%;transform:translateX(-50%);background:rgba(220,245,255,.96);color:#06203d;font-size:12px;font-weight:500;padding:7px 11px;border-radius:18px;width:max-content;max-width:112px;text-align:center;line-height:1.25;box-shadow:0 6px 18px rgba(0,0,0,.3);animation:bob 3.2s ease-in-out infinite;overflow-wrap:anywhere;z-index:2}.bub:hover{animation-play-state:paused;box-shadow:0 8px 26px rgba(var(--ar),.55);filter:brightness(1.06)}
.bub::after{content:"";position:absolute;bottom:-6px;left:50%;width:10px;height:10px;background:inherit;border-radius:50%;transform:translateX(-50%)}.bub::before{content:"";position:absolute;bottom:-12px;left:calc(50% + 6px);width:5px;height:5px;background:inherit;border-radius:50%}
.bub.add{background:rgba(255,255,255,.1);color:var(--ice2);border:1px dashed var(--line)}
@keyframes bob{50%{transform:translate(-50%,-4px)}}
.nt small{font-size:11px;color:var(--mut);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.av{width:56px;height:56px;border-radius:50%;object-fit:cover;display:grid;place-items:center;font-weight:700;font-size:20px;color:#04122a;background:linear-gradient(135deg,var(--a1),var(--a2));border:2px solid transparent;box-shadow:0 0 0 2px rgba(var(--ar),.35);flex:none;overflow:hidden;transition:.35s var(--ease)}
.av img{width:100%;height:100%;object-fit:cover}
.nt:hover .av,.row:hover .av{box-shadow:0 0 0 3px var(--ice),0 0 22px rgba(var(--ar),.5);transform:scale(1.05)}
.av.s{width:46px;height:46px;font-size:17px}
.rows{overflow-y:auto;padding:6px 10px 12px;flex:1}
.row{display:flex;gap:12px;align-items:center;padding:11px;border-radius:18px;width:100%;text-align:left}
.row:hover{background:rgba(var(--ar),.1)}.row>*{transition:transform .35s var(--ease)}.row:hover>*{transform:translateX(6px)}.row.on{background:rgba(var(--ar),.17)}
.row b{display:block}.row span{color:var(--mut);font-size:13px;display:block;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.main{flex:1;border-radius:24px;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.empty{margin:auto;text-align:center;color:var(--mut)}.empty .big{font-size:70px;animation:bob2 4s ease-in-out infinite}
@keyframes bob2{50%{transform:translateY(-10px) rotate(8deg)}}
.hd{display:flex;gap:12px;align-items:center;padding:14px 20px;border-bottom:1px solid var(--line)}
.hd small{display:block;color:var(--mut)}
.msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:8px}
.m{max-width:68%;padding:11px 15px;border-radius:20px;line-height:1.4;word-break:break-word;animation:pop .45s var(--ease);transition:.3s var(--ease)}
.m:hover{transform:scale(1.03)}
@keyframes pop{from{opacity:0;transform:translateY(14px) scale(.85)}}
.m.me{align-self:flex-end;background:linear-gradient(135deg,var(--a1),var(--a2));color:#04122a;border-bottom-right-radius:6px}
.m.th{align-self:flex-start;background:rgba(255,255,255,.09);border:1px solid var(--line);border-bottom-left-radius:6px}
.m small{display:block;font-size:10px;opacity:.6;margin-top:3px}
.typing{align-self:flex-start;display:flex;gap:4px;padding:12px 15px;background:rgba(255,255,255,.08);border-radius:18px}
.typing i{width:7px;height:7px;border-radius:50%;background:var(--ice);animation:dot 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}
@keyframes dot{50%{transform:translateY(-6px);opacity:.4}}
.send{display:flex;gap:10px;padding:14px 18px;border-top:1px solid var(--line)}
.send .btn{width:54px;padding:0}
/* profile */
.prof{padding:34px;overflow-y:auto;max-width:560px;margin:0 auto;width:100%;display:grid;gap:16px;justify-items:center;animation:in .6s var(--ease)}
.big-av{width:130px;height:130px;font-size:48px;position:relative;cursor:pointer}

.big-av:hover{transform:scale(1.06) rotate(-3deg)}
.prof label{justify-self:start;color:var(--mut);font-size:13px}
.prof>*{width:100%}.prof .big-av{width:130px}
.modal{position:fixed;inset:0;background:rgba(2,8,20,.6);backdrop-filter:blur(6px);display:none;place-items:center;z-index:10}
.modal.on{display:grid;animation:in .35s var(--ease)}
.modal .card{width:min(360px,90vw)}
.cnt{text-align:right;color:var(--mut);font-size:12px}
.tags{display:flex;gap:10px}.tags>*{flex:1}
.nbig{background:rgba(220,245,255,.96);color:#06203d;padding:16px 20px;border-radius:24px;font-size:17px;line-height:1.45;max-width:100%;overflow-wrap:anywhere;animation:pop .5s var(--ease);box-shadow:0 10px 30px rgba(var(--ar),.3)}.card .tags{width:100%}.card small.tl{color:var(--mut)}
.ic{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:.4s var(--ease);flex:none}
.nv{display:grid;place-items:center;color:var(--mut)}.nv .ic{width:26px;height:26px}
.nv:hover,.nv.on{color:var(--ice)}.nv:hover .ic{transform:scale(1.18) rotate(-8deg)}.nv.on .ic{filter:drop-shadow(0 0 6px rgba(var(--ar),.7))}
#nOut:hover{color:#ff9fb2}
.lgi{width:30px;height:30px;color:var(--ice);animation:spin 16s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.logo{display:flex;align-items:center;justify-content:center;gap:10px}.logo .lgi{width:44px;height:44px;stroke-width:1.5}
.empty .big{color:var(--ice);filter:drop-shadow(0 0 18px rgba(var(--ar),.45))}
.send .btn{display:grid;place-items:center}.send .btn .ic{width:22px;height:22px;stroke-width:2}.send .btn:hover .ic{transform:translate(3px,-3px)}
.hd .ghost{padding:8px}
.big-av .ov{position:absolute;inset:0;background:rgba(5,15,35,.65);display:grid;place-content:center;justify-items:center;gap:4px;font-size:12px;color:#fff;opacity:0;transition:.3s}
.big-av:hover .ov{opacity:1}.big-av .ov .ic{width:28px;height:28px}
.set{padding:28px;overflow-y:auto;max-width:640px;margin:0 auto;width:100%;display:grid;gap:14px;align-content:start;animation:in .6s var(--ease)}
.sc{padding:20px;border-radius:20px;display:grid;gap:14px;transition:.35s var(--ease)}.sc:hover{border-color:rgba(var(--ar),.4);box-shadow:0 8px 30px rgba(var(--ar),.12)}
.sr{display:flex;align-items:center;justify-content:space-between;gap:12px}.sr small{display:block;color:var(--mut);margin-top:2px;font-size:12px}
.sw{width:48px;height:28px;border-radius:99px;background:rgba(255,255,255,.14);position:relative;flex:none}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.4s var(--ease)}
.sw.on{background:linear-gradient(135deg,var(--a1),var(--a2))}.sw.on::after{transform:translateX(20px)}.sw:hover{box-shadow:0 0 16px rgba(var(--ar),.45)}
.sws{display:flex;gap:12px}.swt{width:34px;height:34px;border-radius:50%;border:2px solid transparent}.swt:hover{transform:scale(1.15)}.swt.on{border-color:#fff;box-shadow:0 0 18px currentColor}
.dang{border-color:rgba(255,120,150,.35)!important}.btn.red{--c1:#ff8fa8;--c2:#ff6f91}
.bd{margin-left:auto;background:linear-gradient(135deg,var(--a1),var(--a2));color:#04122a;font-size:12px;font-weight:700;border-radius:99px;padding:2px 8px;font-style:normal;animation:pop .4s var(--ease)}
.row .un{color:var(--tx);font-weight:600}.aw{position:relative;flex:none}
.dot{position:absolute;right:0;bottom:0;width:13px;height:13px;border-radius:50%;background:#5dffa8;border:2px solid #0b1c3a;box-shadow:0 0 8px #5dffa8}
.calm *{animation:none!important}
.lg2{display:flex;gap:8px}.lg2 button{padding:8px 14px;border-radius:12px;border:1px solid var(--line)}
.lg2 button:hover{transform:scale(1.05);background:rgba(var(--ar),.12)}.lg2 button.on{background:linear-gradient(135deg,var(--a1),var(--a2));color:#04122a;font-weight:700;border-color:transparent}
#login .card{position:relative}
.nv.has::before{content:"";position:absolute;top:9px;right:calc(50% - 20px);width:9px;height:9px;border-radius:50%;background:var(--ice);box-shadow:0 0 8px var(--ice)}
/* ---- telefon düzeni (Instagram benzeri dikey akış) ---- */
html.mobile,.mobile body{overscroll-behavior:none}
.mobile *{-webkit-tap-highlight-color:transparent}.mobile button{touch-action:manipulation}
.mobile .screen{bottom:auto;height:var(--vh,100dvh)}
.mobile input,.mobile textarea{font-size:16px}
.mobile #app{flex-direction:column;padding:0;gap:0}
.mobile .list,.mobile .main{flex:1;width:100%;min-height:0;border-radius:0;border:0;background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}
.mobile #app:not(.chat) .main{display:none}.mobile #app.chat .list{display:none}
.mobile .side{order:3;flex:none;width:100%;flex-direction:row;justify-content:space-around;padding:6px 6px calc(6px + env(safe-area-inset-bottom));gap:0;border-radius:0;border-width:1px 0 0;background:rgba(6,14,32,.74)}
.mobile .side .lg{display:none}.mobile #app.inchat .side{display:none}
.mobile .nv{width:62px;height:48px}.mobile #nOut{margin:0}.mobile .nv::after,.mobile .nv:hover::after{display:none!important}
.mobile .list h2{padding:calc(16px + env(safe-area-inset-top)) 18px 0;font-size:28px;font-weight:800;letter-spacing:-.5px}
.mobile .notes{padding:104px 12px 10px}.mobile .rows{padding:4px 8px 14px}
.mobile .row{padding:11px 12px;gap:14px}.mobile .row .av.s{width:56px;height:56px;font-size:20px}
.mobile .row b{font-size:16px}.mobile .row span{max-width:62vw;font-size:14px}
.mobile .hd{padding:calc(10px + env(safe-area-inset-top)) 12px 10px;gap:10px;background:rgba(6,14,32,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.mobile .hd .ghost{width:42px;height:42px;padding:0;border:0;border-radius:50%;place-items:center}
.mobile .msgs{padding:14px 12px;gap:6px;overscroll-behavior:contain}.mobile .m{max-width:80%;font-size:15.5px}
.mobile .send{padding:10px 12px calc(10px + env(safe-area-inset-bottom));gap:8px;background:rgba(6,14,32,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.mobile .send input{border-radius:99px;padding:12px 18px}.mobile .send .btn{width:46px;height:46px;border-radius:50%;flex:none}
.mobile .prof,.mobile .set{padding:calc(20px + env(safe-area-inset-top)) 16px 28px;max-width:none}
.mobile .big-av .ov{opacity:1;background:linear-gradient(transparent 55%,rgba(5,15,35,.78));place-content:end center;padding-bottom:12px}.mobile .big-av .ov .ic{width:20px;height:20px}
.mobile .modal{place-items:end center}
.mobile .modal .card{width:100%;max-width:none;border-radius:28px 28px 0 0;padding:26px 22px calc(26px + env(safe-area-inset-bottom));animation:sheet .45s var(--ease)}
@keyframes sheet{from{transform:translateY(100%)}}
.mobile #login{padding:18px}.mobile #login .card{width:100%;max-width:440px;padding:34px 22px}.mobile .logo{font-size:40px}
.mobile .btn:hover,.mobile .ghost:hover,.mobile .nv:hover,.mobile .m:hover,.mobile .swt:hover,.mobile .lg2 button:hover,.mobile .big-av:hover{transform:none}
.mobile .row:hover>*,.mobile .nt:hover .av,.mobile .row:hover .av{transform:none}
.mobile .btn:active,.mobile .nv:active{transform:scale(.96)}.mobile .row:active{background:rgba(var(--ar),.14)}
.row span.aw,.mobile .row span.aw{display:block;overflow:visible;max-width:none}
.srch{position:relative;padding:8px 16px 0}.srch .ic{position:absolute;left:30px;top:8px;bottom:0;margin:auto 0;width:18px;height:18px;color:var(--mut);pointer-events:none}
.srch input{padding:11px 14px 11px 42px;border-radius:99px}.list.searching .notes{display:none}
.sres{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:18px;transition:.3s var(--ease)}.sres:hover{background:rgba(var(--ar),.08)}
.sres>div:nth-child(2){min-width:0;flex:1}.sres b{display:block}.sres small{display:block;color:var(--mut);font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sres .btns{display:flex;gap:8px;flex:none}.sres .ghost{padding:8px 13px;font-size:13px}.sres .fw.on{background:linear-gradient(135deg,var(--a1),var(--a2));color:#04122a;font-weight:700;border-color:transparent}
.list h2{display:flex;align-items:center;justify-content:space-between}
.gbtn{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--ice);border:1px solid var(--line)}.gbtn:hover{background:rgba(var(--ar),.14);transform:scale(1.08)}
.gav .ic{width:52%;height:52%}#gc{text-align:left}.modal .card{max-height:88vh;max-height:88dvh;overflow-y:auto}
#hi{flex:1;min-width:0}#hi small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.plist{display:grid;gap:2px;max-height:34vh;overflow-y:auto}.pick{display:flex;align-items:center;gap:12px;padding:8px;border-radius:14px;cursor:pointer}.pick:hover{background:rgba(var(--ar),.1)}
.pick input{width:20px;height:20px;padding:0;accent-color:var(--ice);flex:none}
.m{position:relative}.mt{white-space:pre-wrap}.sn{font-size:12px;font-weight:700;color:var(--ice);margin-bottom:2px}
.rp{border-left:3px solid rgba(255,255,255,.55);padding:4px 8px;margin-bottom:6px;border-radius:8px;background:rgba(0,0,0,.14);cursor:pointer}
.m.me .rp{border-left-color:rgba(4,18,42,.55);background:rgba(255,255,255,.28)}.rp b{display:block;font-size:12px}.rp span{display:block;font-size:13px;opacity:.85;max-height:2.6em;overflow:hidden}
.m.flash{box-shadow:0 0 0 3px rgba(var(--ar),.7),0 0 24px rgba(var(--ar),.5)}
.rb{position:absolute;top:50%;transform:translateY(-50%);opacity:0;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center;color:var(--ice)}
.rb .ic{width:16px;height:16px}.m.me .rb{right:calc(100% + 6px)}.m.th .rb{left:calc(100% + 6px)}.m:hover .rb{opacity:1}.rb:hover{transform:translateY(-50%) scale(1.12)}
.rbar{display:flex;align-items:center;gap:10px;padding:8px 18px;border-top:1px solid var(--line);background:rgba(var(--ar),.06)}.rbar[hidden]{display:none}
.rbar .rq{flex:1;min-width:0;border-left:3px solid var(--ice);padding-left:10px}.rbar .rq b{display:block;font-size:13px;color:var(--ice)}
.rbar .rq span{display:block;font-size:13px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rbar .ghost{padding:6px;border:0;border-radius:50%}
.mobile .rb{display:none}.mobile .modal .card{max-height:85dvh}
.abar{display:flex;align-items:center;gap:12px;padding:10px 18px;background:rgba(255,196,107,.12);border-bottom:1px solid rgba(255,196,107,.3);font-size:13px;line-height:1.35}.abar[hidden]{display:none}.abar span{flex:1}
.abar .ghost{padding:7px 14px;flex:none;border-color:rgba(255,196,107,.5);color:#ffd9a0}
.wn{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ffc46b;margin-left:8px;box-shadow:0 0 8px #ffc46b}
.gifbtn{flex:none;height:40px;padding:0 12px;border-radius:99px;border:1px solid var(--line);font-weight:800;font-size:12px;letter-spacing:.5px;color:var(--ice)}.gifbtn:hover{background:rgba(var(--ar),.14);transform:scale(1.06)}
.gpick{border-top:1px solid var(--line);background:rgba(6,14,32,.86);backdrop-filter:blur(14px);padding:10px 12px;height:min(46vh,360px);display:flex;flex-direction:column;gap:8px}.gpick[hidden]{display:none}
.gh{display:flex;gap:8px}.gh input{border-radius:99px;padding:10px 16px}.gh .ghost{padding:6px 10px;border:0;border-radius:50%}
.gg{flex:1;overflow-y:auto;columns:130px;column-gap:8px}.gi{display:block;width:100%;margin-bottom:8px;border-radius:12px;overflow:hidden;break-inside:avoid;padding:0;background:rgba(255,255,255,.06);min-height:60px}.gi img{display:block;width:100%}.gi:hover{transform:scale(1.03)}
.gcr{font-size:11px;color:var(--mut);text-align:right}
.m .gif{display:block;max-width:100%;height:auto;border-radius:12px}.m.gm{padding:6px}.m.gm small,.m.gm .sn,.m.gm .rp{margin-left:6px;margin-right:6px}
.mt.del{font-style:italic;opacity:.7}.m.dl{background:transparent!important;border:1px dashed var(--line);box-shadow:none}
.mact{display:flex;align-items:center;gap:12px;justify-content:flex-start;padding:13px 16px;border-radius:14px}.mact .ic{width:20px;height:20px}.mact.red{color:#ff9fb2;border-color:rgba(255,120,150,.4)}
.mobile .m{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.pg{flex:1;min-height:0;overflow-y:auto;padding-bottom:28px;animation:in .5s var(--ease)}
.pgh{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 12px;border-bottom:1px solid var(--line);font-size:17px}
.pgh .ghost{width:40px;height:40px;padding:0;border:0;border-radius:50%;display:grid;place-items:center}
.pgtop{display:flex;align-items:center;gap:26px;padding:22px 24px 8px}.pg .av{width:92px;height:92px;font-size:34px}
.stats{display:flex;gap:28px;flex:1;justify-content:space-around}.stats div{text-align:center}.stats b{display:block;font-size:20px}.stats span{color:var(--mut);font-size:13px}
.pgn{padding:8px 24px 0;display:flex;align-items:center;gap:10px;font-size:17px}.fm{font-style:normal;font-size:11px;padding:3px 8px;border-radius:99px;background:rgba(var(--ar),.15);color:var(--ice)}
.pgb{padding:6px 24px 0;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}.pgb i{color:var(--mut)}
.pgnote{padding:14px 24px 0}.pgnote span{display:inline-block;background:rgba(220,245,255,.96);color:#06203d;padding:7px 13px;border-radius:18px;font-size:13px}
.pgbtns{display:flex;gap:10px;padding:18px 24px 0}.pgbtns>*{flex:1}.pgj{padding:16px 24px 0;color:var(--mut);font-size:13px}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:var(--line);border-radius:9px}
/* fotoğraf & yeni profil */
.gifbtn .ic{width:20px;height:20px;display:block}#pbtn{padding:0 11px}
.pic{cursor:zoom-in}
#iv{place-items:center!important;cursor:zoom-out}#ivi{max-width:94vw;max-height:90vh;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.pg{max-width:680px;margin:0 auto;width:100%}
.pgtop.hn{padding-top:100px}
.pgav{min-width:0}.pgav .bub{max-width:220px;font-size:13px;left:0;transform:none;text-align:left;animation-name:bob3}
.pgav .bub::after{left:48px}.pgav .bub::before{left:54px}
@keyframes bob3{50%{transform:translateY(-4px)}}
.pgav .av{box-shadow:0 0 0 3px #0b1c3a,0 0 0 5px var(--ice)}
.pgn b{font-size:20px}
.pgtabs{display:flex;justify-content:center;border-top:1px solid var(--line);margin-top:22px}
.pgtabs button{padding:12px 34px;color:var(--ice);border-top:2px solid var(--ice);margin-top:-1px}
.pgempty{display:grid;justify-items:center;gap:10px;padding:46px 20px;color:var(--mut)}.pgempty .ic{width:44px;height:44px;stroke-width:1.3}
.mobile .pgtop{gap:18px;padding-left:18px;padding-right:18px}
.notes::-webkit-scrollbar{height:8px}.notes::-webkit-scrollbar-thumb{background:rgba(var(--ar),.4);border-radius:9px}.notes::-webkit-scrollbar-thumb:hover{background:rgba(var(--ar),.65)}
.mobile .notes{scrollbar-width:none}.mobile .notes::-webkit-scrollbar{display:none}
/* ---- Frutiger Aero ---- */
#fv{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;display:none;pointer-events:none}
body.fa #fv{display:block}body.fa.novid #fv{display:none}
#fish{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;display:none}body.fa.novid #fish{display:block}
.fh{position:absolute;left:-140px;width:var(--s);animation:swim var(--d) linear var(--l) infinite}
.fh i{display:block;animation:fb 3.4s ease-in-out infinite}.fh svg{width:100%;height:auto;display:block;transform:scaleX(-1);filter:drop-shadow(0 4px 8px rgba(0,60,120,.35))}
.fh.rv{animation-name:swimr}.fh.rv svg{transform:none}
@keyframes swim{to{transform:translateX(calc(100vw + 280px))}}
@keyframes swimr{from{transform:translateX(calc(100vw + 280px))}to{transform:none}}
@keyframes fb{50%{transform:translateY(-10px)}}
@keyframes lgf{50%{transform:translateY(-3px)}}
body.fa{--bg1:#0a6fb8;--bg2:#12b8c9;--line:rgba(255,255,255,.45);--glass:rgba(255,255,255,.14);--mut:#d8f6ff;--tx:#fff;
 background:radial-gradient(900px 600px at 20% -10%,rgba(255,255,255,.55),transparent 60%),radial-gradient(800px 500px at 90% 110%,#46e6a6 0,transparent 55%),linear-gradient(170deg,#58c8ff,#1b86d6 45%,#0a5aa8)}
body.fa::before{content:"";position:fixed;inset:0 -80px;z-index:0;pointer-events:none;background:repeating-linear-gradient(105deg,transparent 0 90px,rgba(255,255,255,.07) 90px 150px);-webkit-mask-image:linear-gradient(180deg,#000,transparent 70%);mask-image:linear-gradient(180deg,#000,transparent 70%);animation:rays 14s ease-in-out infinite alternate}
@keyframes rays{to{transform:translateX(60px)}}
body.fa .glass{background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.1) 45%,rgba(255,255,255,.15));border:1px solid rgba(255,255,255,.55);box-shadow:0 8px 32px rgba(0,60,120,.35),inset 0 1px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(255,255,255,.2)}
body.fa .btn{background:linear-gradient(180deg,rgba(255,255,255,.7) 0,rgba(255,255,255,.12) 50%,transparent 51%),linear-gradient(135deg,var(--c1),var(--c2));color:#033a5c;border:1px solid rgba(255,255,255,.75);border-radius:99px;box-shadow:0 4px 14px rgba(0,80,140,.4),inset 0 1px 0 #fff}
body.fa .btn:hover{background-position:0 0;box-shadow:0 8px 24px rgba(0,120,200,.55),inset 0 1px 0 #fff}
body.fa .ghost{border-color:rgba(255,255,255,.6);background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,.06))}
body.fa input,body.fa textarea{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.55)}
body.fa ::placeholder{color:#e2f7ff;opacity:.85}
body.fa .m.me{background:linear-gradient(180deg,rgba(255,255,255,.6),transparent 55%),linear-gradient(135deg,var(--a1),var(--a2));color:#033a5c;box-shadow:0 3px 10px rgba(0,80,140,.3),inset 0 1px 0 #fff}
body.fa .m.th{background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.14));border-color:rgba(255,255,255,.55)}
body.fa .dot{border-color:#1b86d6}
body.fa .lgi{animation:lgf 5s ease-in-out infinite}
.hd .callbtns{margin-left:auto;display:flex;gap:8px;flex:none}
.cab{width:42px;height:42px;padding:0;border-radius:50%;display:grid;place-items:center}.cab .ic{width:20px;height:20px}
.cab:hover{transform:scale(1.08)}
.callov{position:fixed;inset:0;z-index:24;display:none;place-items:center;background:rgba(2,8,20,.78);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.callov.on{display:grid;animation:in .45s var(--ease)}
#stage.on{display:flex;flex-direction:column;background:rgba(4,12,28,.92)}
.ringbox{width:min(420px,92vw);padding:36px 28px 28px;border-radius:32px;display:grid;justify-items:center;gap:12px;text-align:center}
.rings{position:relative;width:128px;height:128px;display:grid;place-items:center;margin:8px 0 4px}
.rings b,.rings em{position:absolute;border-radius:50%;border:2px solid rgba(var(--ar),.4);animation:cpulse 2.2s var(--ease) infinite;pointer-events:none}
.rings b{inset:0}.rings em{inset:-16px;animation-delay:.45s;border-color:rgba(var(--ar),.18)}
@keyframes cpulse{50%{transform:scale(1.14);opacity:.35}}
.sig{width:56px;height:56px;color:var(--ice);filter:drop-shadow(0 0 14px rgba(var(--ar),.55));animation:spin 10s linear infinite}
.tiles{flex:1;display:flex;flex-wrap:wrap;gap:10px;padding:16px;align-content:center;justify-content:center;min-height:0;position:relative}
.tile{position:relative;background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:22px;overflow:hidden;width:min(460px,48vw);min-width:200px;aspect-ratio:4/3;display:grid;place-items:center}
.tile video{width:100%;height:100%;object-fit:cover;background:#04122a}
.tile.audio video{opacity:0;position:absolute}
.tile .av.phav{position:absolute}
.tile:not(.audio) .av.phav{display:none}
.tile.me{width:min(240px,36vw);aspect-ratio:3/4}
.tile small{position:absolute;left:12px;bottom:10px;background:rgba(4,12,28,.72);padding:4px 10px;border-radius:99px;font-size:12px}
.phav{width:88px;height:88px;font-size:32px}
.cbar{display:flex;justify-content:center;gap:14px;padding:16px 16px calc(18px + env(safe-area-inset-bottom))}
.cact{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:rgba(255,255,255,.1)}
.cact .ic{width:24px;height:24px}.cact.on{background:rgba(255,120,150,.22);color:#ff9fb2}
.cact.hang{background:linear-gradient(135deg,#ff8fa8,#ff5d73);color:#2a0410;border:0}
.cact:hover{transform:scale(1.08)}
.toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);z-index:32;padding:12px 18px;border-radius:16px;opacity:0;pointer-events:none;transition:.35s var(--ease);max-width:90vw;text-align:center}
.toast.on{opacity:1;transform:translate(-50%,0)}
.waitn{color:var(--mut);font-size:14px}
.mobile .tile{width:100%;min-width:0;aspect-ratio:16/11}
.mobile .tile.me{width:34vw;aspect-ratio:3/4;position:absolute;right:12px;bottom:96px;z-index:2}
.mobile .hd .callbtns{gap:4px}.mobile .cab{width:40px;height:40px}
/* ---- ana sayfa & hikayeler ---- */
.home{flex:1;overflow-y:auto;padding:14px 18px 40px;min-height:0}
.srow{display:flex;gap:14px;overflow-x:auto;padding:6px 4px 14px;scrollbar-width:none}.srow::-webkit-scrollbar{display:none}
.stile{position:relative;display:grid;justify-items:center;gap:6px;min-width:76px}
.stile small{font-size:12px;color:var(--mut);max-width:76px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sring{display:grid;place-items:center;width:68px;height:68px;border-radius:50%;padding:3px;background:linear-gradient(135deg,var(--a1),var(--a2));cursor:pointer;transition:.3s var(--ease)}
.sring.seen{background:rgba(255,255,255,.28)}
.sring:hover{transform:scale(1.06)}
.sring .av{width:100%;height:100%;box-shadow:none;border:0}
.plusb{position:absolute;right:2px;bottom:18px;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--a1),var(--a2));border:2px solid #0b1c3a;cursor:pointer}
.plusb::before,.plusb::after{content:"";position:absolute;left:50%;top:50%;background:#04122a;transform:translate(-50%,-50%);border-radius:2px}
.plusb::before{width:10px;height:2px}.plusb::after{width:2px;height:10px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.scard{position:relative;aspect-ratio:9/16;border-radius:20px;overflow:hidden;background:rgba(255,255,255,.08);border:1px solid var(--line);padding:0;text-align:left;color:#fff}
.scard img{width:100%;height:100%;object-fit:cover;display:block}
.scard span{position:absolute;left:0;right:0;bottom:0;padding:26px 10px 10px;background:linear-gradient(transparent,rgba(2,8,20,.85))}
.scard b,.scard small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.scard small{color:#cde;font-size:12px}
.vthumb{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(160deg,#12305e,#0e4a63)}
.vthumb i{width:0;height:0;border-left:22px solid var(--ice);border-top:14px solid transparent;border-bottom:14px solid transparent;margin-left:6px}
#sv,#se{position:fixed;inset:0;z-index:26;display:none;background:rgba(2,8,20,.95);align-items:center;justify-content:center;padding:12px}
#sv.on,#se.on{display:flex;animation:in .35s var(--ease)}
.sbox{position:relative;width:min(92vw,calc(74dvh*9/16));aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:#04122a;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.sbox>img,.sbox>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sov{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#se .sov{pointer-events:auto;touch-action:none}
.sbars{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:4px;z-index:3}
.sbars i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}.sbars b{display:block;height:100%;background:#fff}
.shd{position:absolute;top:22px;left:10px;right:10px;display:flex;align-items:center;gap:10px;z-index:3;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.shd .av{width:36px;height:36px;font-size:14px;flex:none}.shd>div{flex:1;min-width:0}.shd b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.shd small{display:block;opacity:.85;font-size:12px}
.shd .cab{width:36px;height:36px;color:#fff;border:0;flex:none}.shd .cab .ic{width:18px;height:18px}
.snav{position:absolute;inset:60px 0 0 0;display:flex;z-index:2}.snav i{flex:1;cursor:pointer}
.seW{width:min(92vw,calc(74dvh*9/16));display:grid;gap:10px}
.seW .sbox{width:100%}
.sebar{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#fff}
.sebar b{flex:1;text-align:center}
.sctl{display:grid;gap:10px}
.sctl .row2{display:flex;gap:8px;align-items:center;justify-content:space-between}
.sctl input{flex:1;padding:10px 14px;border-radius:99px}
.swrap{display:flex;gap:8px;align-items:center}
.swatch{width:26px;height:26px;border-radius:50%;border:2px solid transparent;flex:none}.swatch.on{border-color:#fff;box-shadow:0 0 12px currentColor}
.sicon{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);flex:none;color:#fff}
.sicon.on{background:linear-gradient(135deg,var(--a1),var(--a2));color:#04122a}
.sicon .ic{width:20px;height:20px}
</style></head><body>
<video id="fv" muted loop playsinline preload="none" aria-hidden="true"></video>
<div id="fish" aria-hidden="true">
  <div class="fh" style="top:22%;--s:96px;--d:30s;--l:-6s;color:#ffd84d"><i><svg viewBox="0 0 64 32"><use href="#i-fish"/></svg></i></div>
  <div class="fh rv" style="top:48%;--s:70px;--d:24s;--l:-14s;color:#ff9a5c"><i><svg viewBox="0 0 64 32"><use href="#i-fish"/></svg></i></div>
  <div class="fh" style="top:70%;--s:120px;--d:38s;--l:-20s;color:#7dffd0"><i><svg viewBox="0 0 64 32"><use href="#i-fish"/></svg></i></div>
  <div class="fh rv" style="top:84%;--s:54px;--d:20s;--l:-3s;color:#fff"><i><svg viewBox="0 0 64 32"><use href="#i-fish"/></svg></i></div>
</div>
<canvas id="snow"></canvas>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h-.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 10h7"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></symbol>
<symbol id="i-power" viewBox="0 0 24 24"><path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/></symbol>
<symbol id="i-send" viewBox="0 0 24 24"><path d="M3.5 11.5 20 4l-6.5 16-2.8-6.7z"/><path d="M10.7 13.3 20 4"/></symbol>
<symbol id="i-cam" viewBox="0 0 24 24"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.3-2h5.4L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.3"/></symbol>
<symbol id="i-back" viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5"/></symbol>
<symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></symbol>
<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="10" r="2.6"/><path d="M15.5 14.4A4.6 4.6 0 0 1 20.5 19"/></symbol>
<symbol id="i-reply" viewBox="0 0 24 24"><path d="M9.5 6 4 11.5 9.5 17"/><path d="M4 11.5h9a6.5 6.5 0 0 1 6.5 6.5v1.5"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-dots" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></symbol>
<symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></symbol>
<symbol id="i-snow" viewBox="0 0 24 24"><path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5"/><path d="M9.5 4.4 12 6.7l2.5-2.3M9.5 19.6 12 17.3l2.5 2.3"/><circle cx="12" cy="12" r="1.8"/></symbol>
<symbol id="i-aero" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2"/><path d="M6.2 8.6a6.8 6.8 0 0 1 3.6-2.9"/><path d="M7.4 12.6c1.8-2.8 5.4-3.1 8 0-2.6 3.1-6.2 2.8-8 0z"/><path d="M15.4 12.6l2.6-2v4z"/><circle cx="9.7" cy="12" r=".7" fill="currentColor" stroke="none"/></symbol>
<symbol id="i-fish" viewBox="0 0 64 32"><path fill="currentColor" d="M46 16 62 5v22z"/><path fill="currentColor" opacity=".8" d="M20 7 30 1 36 8z"/><ellipse cx="28" cy="16" rx="22" ry="11" fill="currentColor"/><ellipse cx="26" cy="11" rx="14" ry="4" fill="#fff" opacity=".35"/><circle cx="14" cy="14" r="2.6" fill="#fff"/><circle cx="13.4" cy="14" r="1.3" fill="#04345a"/></symbol>
<symbol id="i-call" viewBox="0 0 24 24"><circle cx="12" cy="16" r="2.1"/><path d="M8.4 12.6a5.1 5.1 0 0 1 7.2 0"/><path d="M5.6 9.6a9 9 0 0 1 12.8 0"/><path d="M3.4 6.6a12.4 12.4 0 0 1 17.2 0"/></symbol>
<symbol id="i-hang" viewBox="0 0 24 24"><path d="M4.5 10.5c5-4.2 10-4.2 15 0"/><path d="M7 13.2 5.2 11.2M17 13.2l1.8-2"/><rect x="8.4" y="14.2" width="7.2" height="3.2" rx="1.6"/></symbol>
<symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 12.2a6 6 0 0 0 12 0M12 18.2V21M9 21h6"/></symbol>
<symbol id="i-micoff" viewBox="0 0 24 24"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M6 12.2a6 6 0 0 0 12 0M12 18.2V21M9 21h6M5 5l14 14"/></symbol>
<symbol id="i-vidoff" viewBox="0 0 24 24"><rect x="3.5" y="7" width="13" height="10" rx="2"/><path d="M16.5 10.5 20.5 8v8l-4-2.5M4 5l16 14"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/></symbol>
<symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20l1-4 10-10 3 3-10 10z"/><path d="M13 7l3 3"/></symbol>
<symbol id="i-undo" viewBox="0 0 24 24"><path d="M9 7 4.5 11.5 9 16"/><path d="M4.5 11.5H14a5 5 0 0 1 0 10h-2"/></symbol>
</svg>

<section class="screen" id="login"><div class="card glass"><button class="ghost" id="lgb" style="position:absolute;top:14px;right:14px;padding:6px 11px;font-size:12px">EN</button>
  <div class="logo"><svg class="ic lgi" ><use href="#i-snow"/></svg><span>Fluid</span></div><div class="sub">Buzlu gecenin akışına katıl</div>
  <div class="tabs"><i id="ti"></i><button class="on" id="tl">Giriş</button><button id="tr">Kayıt</button></div>
  <input id="u" placeholder="Kullanıcı adı" autocomplete="off"><input id="p" type="password" placeholder="Şifre">
  <input id="inv" placeholder="Davet kodu" autocomplete="off" style="display:none"><div class="err" id="err"></div><button class="btn" id="go">Giriş yap</button>
  
</div></section>

<section class="screen" id="app">
  <nav class="side glass"><div class="lg"><svg class="ic lgi" ><use href="#i-snow"/></svg></div>
    <button class="nv" data-t="Ana sayfa" id="nHome"><svg class="ic"><use href="#i-home"/></svg></button>
    <button class="nv on" data-t="Mesajlar" id="nDm"><svg class="ic" ><use href="#i-chat"/></svg></button>
    <button class="nv" data-t="Profil" id="nPr"><svg class="ic" ><use href="#i-user"/></svg></button>
    <button class="nv" data-t="Ayarlar" id="nSet"><svg class="ic"><use href="#i-gear"/></svg></button>
    <button class="nv" data-t="Çıkış" id="nOut" style="margin-top:auto"><svg class="ic" ><use href="#i-power"/></svg></button></nav>
  <aside class="list glass"><h2><span>Mesajlar</span><button class="gbtn" id="newG" title="Yeni grup"><svg class="ic"><use href="#i-users"/></svg></button></h2><div class="srch"><svg class="ic"><use href="#i-search"/></svg><input id="q" placeholder="Hesap ara" autocomplete="off" maxlength="16"></div><div class="notes" id="notes"></div><div class="rows" id="rows"></div></aside>
  <main class="main glass" id="main"></main>
</section>

<div class="modal" id="nm"><div class="card glass"><h3>Not paylaş</h3>
  <div class="sub" style="margin:0;text-align:left">24 saat görünür. Kısa tut</div>
  <textarea id="nt" rows="3" maxlength="60" placeholder="Ne düşünüyorsun?"></textarea><div class="cnt" id="cnt">0/60</div>
  <div class="tags"><button class="ghost" id="nDel">Notu sil</button><button class="btn" id="nOk">Paylaş</button></div>
  <button class="ghost" id="nX">Vazgeç</button></div></div>
<div class="modal" id="vm"><div class="card glass" style="justify-items:center;text-align:center"><div id="vav"></div><b id="vn"></b><div class="nbig" id="vt"></div><small class="tl" id="vts"></small><div class="tags" id="vb"></div></div></div>
<div class="modal" id="gm"><div class="card glass" id="gc"></div></div>
<input type="file" id="file" accept="image/*" hidden><input type="file" id="pfile" accept="image/*" hidden><input type="file" id="sfile" accept="image/*,video/mp4,video/webm" hidden>
<div class="modal" id="iv"><img id="ivi" alt=""></div>
<div class="callov" id="ring"><div class="ringbox glass" id="ringin"></div></div>
<div class="callov" id="stage"></div>
<div id="sv"><div class="sbox" id="svs"></div></div>
<div id="se"></div>
<div class="glass toast" id="toast"></div>

<script>
const $=s=>document.querySelector(s),DAY=864e5;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S={back:null,edit:null,gifs:[],me:null,users:[],groups:[],cur:null,ids:new Set(),mm:new Map(),reply:null,cfg:{},es:null,feed:[]};
const isG=c=>typeof c=='string'&&c.startsWith('g:'),G=c=>S.groups.find(g=>'g:'+g.id==c),convOf=c=>isG(c)?G(c):S.users.find(z=>z.u==c);
const MQ=matchMedia('(max-width:820px)'),isMob=()=>MQ.matches;
const fitVH=()=>{const v=window.visualViewport;document.documentElement.style.setProperty('--vh',(v?v.height:innerHeight)+'px')};
function setMob(){document.documentElement.classList.toggle('mobile',MQ.matches);fitVH();if(S.me){renderList();renderMain();if(S.cur&&S.cur[0]!='_')loadMsgs(S.cur)}}
MQ.addEventListener('change',setMob);addEventListener('resize',fitVH);
if(window.visualViewport){visualViewport.addEventListener('resize',fitVH);visualViewport.addEventListener('scroll',()=>{fitVH();if(visualViewport.offsetTop)scrollTo(0,0)})}
const ACC={ice:['#8fe3ff','#6fd6ff','#9aa8ff','143,227,255'],violet:['#c3b3ff','#9b8cff','#6f7bff','195,179,255'],mint:['#86ffd9','#5be8c0','#5fb8ff','134,255,217'],rose:['#ffa6d5','#ff8fc0','#b79bff','255,166,213']};
const ACN={ice:'Buz',violet:'Menekşe',mint:'Nane',rose:'Gül'};
const EN={"takipçi": "followers", "takip": "following", "Seni takip ediyor": "Follows you", "Henüz biyografi yok": "No bio yet", "Katılma": "Joined", "Profili düzenle": "Edit profile", "GIF ara": "Search GIFs", "GIF bulunamadı": "No GIFs found", "Bu mesaj silindi": "This message was deleted", "Silinen mesaj": "Deleted message", "Mesaj silindi": "Message deleted", "düzenlendi": "edited", "Seçenekler": "Options", "Sil": "Delete", "Kopyala": "Copy", "Kopyalandı": "Copied", "Mesajı düzenliyorsun": "Editing message", "Bu mesaj herkes için silinecek. Emin misin?": "This message will be deleted for everyone. Are you sure?", "Mesaj bulunamadı": "Message not found", "Sadece kendi mesajını değiştirebilirsin": "You can only change your own messages", "Mesaj zaten silinmiş": "Message already deleted", "GIF düzenlenemez": "GIFs cannot be edited", "GIF servisine ulaşılamıyor": "Cannot reach the GIF service", "GIF servisi ayarlanmamış": "The GIF service is not set up","İndir":"Download","İndirilecek mesaj yok":"Nothing to download","Yeni grup": "New group", "Grup adı": "Group name", "Üyeleri seç": "Pick members", "Grubu kur": "Create group", "Üye ekle": "Add members", "Ekle": "Add", "Üyeler": "Members", "kurucu": "owner", "Gruptan ayrıl": "Leave group", "Gruptan ayrılmak istediğine emin misin?": "Are you sure you want to leave this group?", "Yanıtlanıyor": "Replying to", "Yanıtla": "Reply", "Sen": "You", "Grup": "Group", "Eklenecek kimse yok": "Nobody to add", "Grup adı gerekli": "Group name required", "En az bir üye seç": "Pick at least one member", "Grup bulunamadı": "Group not found", "Çok fazla üye": "Too many members","Hesap ara":"Search accounts","Takip et":"Follow","Takiptesin":"Following","Mesaj":"Message","Hesap bulunamadı":"No accounts found","Aramak için en az 2 harf yaz":"Type at least 2 letters to search","Aranıyor…":"Searching…","Henüz kimse yok. Yukarıdan hesap arayıp takip et!":"Nobody here yet. Search for an account above and follow it!","Bu tarayıcıda başka bir hesaba giriş yapıldı. Sayfa yenileniyor.":"Another account was signed in on this browser. Reloading the page.","Buzlu gecenin akışına katıl": "Join the flow of the frozen night", "Giriş": "Log in", "Kayıt": "Sign up", "Kullanıcı adı": "Username", "Şifre": "Password", "Davet kodu": "Invite code", "Giriş yap": "Log in", "Hesap oluştur": "Create account", "Mesajlar": "Messages", "Profil": "Profile", "Ayarlar": "Settings", "Çıkış": "Log out", "Not paylaş": "Share a note", "24 saat görünür. Kısa tut": "Visible for 24 hours. Keep it short", "Ne düşünüyorsun?": "What’s on your mind?", "Notu sil": "Delete note", "Paylaş": "Share", "Vazgeç": "Cancel", "Kullanıcı adı: 3–16 harf/rakam/_": "Username: 3–16 letters, numbers or _", "Şifre en az 6 karakter": "Password must be at least 6 characters", "Şifre gerekli": "Password required", "Giriş başarılı ama ekran açılamadı. Sayfayı Ctrl+F5 ile yenile.": "Logged in, but the screen could not open. Refresh with Ctrl+F5.", "Sayfa yüklenirken sorun çıktı, Ctrl+F5 ile yenile.": "There was a problem loading the page. Refresh with Ctrl+F5.", "Fluid sunucusuna ulaşılamıyor. Sunucunun çalıştığından ve internetinin açık olduğundan emin ol.": "Cannot reach the Fluid server. Make sure it is running and your internet is on.", "Bu adres Fluid sunucusuna ait görünmüyor. Sayfayı dosyadan değil, sunucunun adresinden aç (örneğin http://localhost:3000).": "This address does not look like the Fluid server. Open the page from the server address (e.g. http://localhost:3000), not from a file.", "Gönderilen dosya çok büyük.": "The file is too large.", "Çok fazla deneme yaptın, birkaç dakika bekle.": "Too many attempts, wait a few minutes.", "Sunucu şu an yanıt vermiyor, biraz sonra tekrar dene.": "The server is not responding right now, try again shortly.", "Bu işleme izin verilmedi.": "This action is not allowed.", "Çok fazla deneme, biraz bekle": "Too many attempts, wait a little", "Davet kodu hatalı": "Wrong invite code", "Şifre en az 6 karakter olmalı": "Password must be at least 6 characters", "Bu kullanıcı adı alınmış": "This username is taken", "Kullanıcı adı veya şifre hatalı": "Wrong username or password", "Oturum gerekli": "Please log in", "Kullanıcı bulunamadı": "User not found", "Boş mesaj": "Empty message", "Geçersiz fotoğraf": "Invalid photo", "Not boş olamaz": "Note cannot be empty", "Mevcut şifre hatalı": "Current password is wrong", "Yeni şifre en az 6 karakter olmalı": "New password must be at least 6 characters", "Şifre hatalı": "Wrong password", "Geçersiz istek": "Invalid request", "Bulunamadı": "Not found", "Gönderilen veri okunamadı, sayfayı yenileyip tekrar dene.": "Could not read the request, refresh the page and try again.", "Sunucuda beklenmedik bir sorun oldu, biraz sonra tekrar dene.": "Something unexpected went wrong on the server, try again shortly.", "Notun": "Your note", "Kapat": "Close", "Düzenle": "Edit", "Mesaj gönder": "Send message", "+ Not": "+ Note", "Sen: ": "You: ", "Merhaba de!": "Say hi!", "Henüz kimse yok. Arkadaşlarını davet et!": "Nobody here yet. Invite your friends!", "Çevrimiçi": "Online", "Bir sohbet seç": "Pick a conversation", "Ya da birinin notuna dokun": "Or tap someone’s note", "Mesaj yaz…": "Type a message…", "Değiştir": "Change", "Biyografi": "Bio", "Kendinden bahset…": "Tell us about yourself…", "Kaydet": "Save", "Kaydedildi": "Saved", "Fotoğrafı kaldır": "Remove photo", "Görünüm": "Appearance", "Dil": "Language", "Arayüz dili": "Interface language", "Vurgu rengi": "Accent color", "Butonlar ve ışıltılar": "Buttons and glows", "Kar yağışı": "Snowfall", "Arka plandaki kar taneleri": "Snowflakes in the background", "Animasyonları azalt": "Reduce animations", "Daha sakin ve hafif arayüz": "A calmer, lighter interface", "Bildirimler": "Notifications", "Mesaj sesi": "Message sound", "Yeni mesajda kısa bir ses çal": "Play a short sound on new messages", "Gizlilik": "Privacy", "Çevrimiçi durumu": "Online status", "Arkadaşların seni çevrimiçi görsün": "Let friends see you online", "Güvenlik": "Security", "Mevcut şifre": "Current password", "Yeni şifre (en az 6)": "New password (min. 6)", "Şifreyi değiştir": "Change password", "Şifre güncellendi": "Password updated", "Tüm cihazlardan çıkış yap": "Log out of all devices", "Hesabı sil": "Delete account", "Mesajların ve profilin kalıcı olarak silinir.": "Your messages and profile will be permanently deleted.", "Şifreni onayla": "Confirm your password", "Hesabımı sil": "Delete my account", "Hesabın kalıcı olarak silinecek. Emin misin?": "Your account will be permanently deleted. Are you sure?", "Buz": "Ice", "Menekşe": "Violet", "Nane": "Mint", "Gül": "Rose", "gönderi": "posts", "Henüz gönderi yok": "No posts yet", "Fotoğraf": "Photo"};
let LANG;try{LANG=localStorage.getItem('fl_lang')}catch(e){}LANG=LANG||((navigator.language||'').startsWith('tr')?'tr':'en');
const t=s=>LANG=='en'&&EN[s]?EN[s]:s;
const NOSRV='Fluid sunucusuna ulaşılamıyor. Sunucunun çalıştığından ve internetinin açık olduğundan emin ol.';
const WRONG='Bu adres Fluid sunucusuna ait görünmüyor. Sayfayı dosyadan değil, sunucunun adresinden aç (örneğin http://localhost:3000).';
const byStatus=c=>c==413?'Gönderilen dosya çok büyük.':c==429?'Çok fazla deneme yaptın, birkaç dakika bekle.':c>=500?'Sunucu şu an yanıt vermiyor, biraz sonra tekrar dene.':c==403?'Bu işleme izin verilmedi.':WRONG;
const fe=(msg,st)=>{const e=new Error(t(msg));e.friendly=1;e.status=st;return e};
async function api(m,p,b){let r;
  try{r=await fetch('/api'+p,{method:m,headers:{...(b?{'Content-Type':'application/json'}:{}),...(S.me?{'X-Fluid-User':S.me.u}:{})},body:b?JSON.stringify(b):undefined,credentials:'same-origin'})}catch(x){throw fe(NOSRV)}
  let d=null;try{d=await r.json()}catch(x){}
  if(r.status==409&&S.me){alert(t('Bu tarayıcıda başka bir hesaba giriş yapıldı. Sayfa yenileniyor.'));location.reload();throw fe('')}
  if(!r.ok){const e=fe(d&&d.error?d.error:byStatus(r.status),r.status);if(d&&d.wait)e.message+=` (${d.wait} ${LANG=='en'?'min':'dk'})`;throw e}
  if(d===null)throw fe(WRONG);return d}
const ic=n=>`<svg class="ic"><use href="#i-${n}"/></svg>`;
const av=(x,c='')=>`<div class="av ${c}">${x.av?`<img src="/avatar/${encodeURIComponent(x.u)}?v=${x.av}" alt="">`:esc(x.u[0].toUpperCase())}</div>`;
const note=x=>x.note&&Date.now()-x.note.ts<DAY?x.note:null;
const swap=(hide,show)=>{hide.style.animation='out .4s forwards';setTimeout(()=>{hide.classList.remove('on');hide.style.animation='';show.classList.add('on')},380)};
const authErr=e=>{if(e&&e.status==401&&S.me)toLogin()};
function applySettings(){const s=S.me.settings,a=s.frutiger?AEROC:(ACC[s.accent]||ACC.ice),r=document.documentElement.style;
  r.setProperty('--ice',a[0]);r.setProperty('--a1',a[1]);r.setProperty('--a2',a[2]);r.setProperty('--ar',a[3]);
  $('#snow').style.display=(s.snow||s.frutiger)?'':'none';document.body.classList.toggle('calm',!!s.calm);aeroSync()}
/* giriş */
let mode='login';
const setMode=m=>{mode=m;$('#ti').style.transform=m=='login'?'none':'translateX(100%)';$('#tl').classList.toggle('on',m=='login');$('#tr').classList.toggle('on',m!='login');
  $('#go').textContent=t(m=='login'?'Giriş yap':'Hesap oluştur');$('#err').textContent='';$('#inv').style.display=(m!='login'&&S.cfg.invite)?'':'none'};
$('#tl').onclick=()=>setMode('login');$('#tr').onclick=()=>setMode('reg');
$('#go').onclick=async()=>{const u=$('#u').value.trim().toLowerCase(),p=$('#p').value,e=$('#err');
  if(!/^[a-z0-9_]{3,16}$/.test(u))return e.textContent=t('Kullanıcı adı: 3–16 harf/rakam/_');
  if(mode=='reg'&&p.length<6)return e.textContent=t('Şifre en az 6 karakter');if(!p)return e.textContent=t('Şifre gerekli');
  try{const d=await api('POST',mode=='reg'?'/register':'/login',{u,p,invite:$('#inv').value.trim()});S.me=d.me;await enter()}catch(x){e.textContent=x.friendly?x.message:t('Giriş başarılı ama ekran açılamadı. Sayfayı Ctrl+F5 ile yenile.')}};
['#u','#p','#inv'].forEach(q=>$(q).addEventListener('keydown',e=>e.key=='Enter'&&$('#go').click()));
async function enter(instant){applySettings();if(S.me.settings.lang&&S.me.settings.lang!=LANG)setLang(S.me.settings.lang,1);connect();S.cur=null;
  try{const d=await api('GET','/users');S.users=d.users;S.groups=d.groups||[]}catch(e){}
  loadFeed();renderList();renderMain();if(instant){$('#login').classList.remove('on');$('#app').classList.add('on')}else swap($('#login'),$('#app'))}
function toLogin(){hangup(1);if(S.es)S.es.close();S.me=null;S.cur=null;S.feed=[];$('#sv').classList.remove('on');$('#se').classList.remove('on');const r=document.documentElement.style;['--ice','--a1','--a2','--ar'].forEach(k=>r.removeProperty(k));
  $('#snow').style.display='';document.body.classList.remove('calm');aeroSync();$('#p').value='';$('#app').classList.remove('chat','inchat');swap($('#app'),$('#login'))}
$('#nOut').onclick=async()=>{await api('POST','/logout').catch(()=>{});toLogin()};
async function refresh(){try{const prevA=S.cur&&S.cur[0]!='_'&&convOf(S.cur)?convOf(S.cur).arch:null,keep=S.users.find(x=>x.temp&&x.u==S.cur);const d=await api('GET','/users');S.users=d.users;S.groups=d.groups||[];if(keep&&!S.users.find(x=>x.u==keep.u))S.users.push(keep);renderList();loadFeed();if(S.cur&&S.cur[0]!='_'){hdr();const c=convOf(S.cur);if(prevA&&c&&!c.arch)loadMsgs(S.cur)}}catch(e){authErr(e)}}
/* canlı bağlantı */
function connect(){if(S.es)S.es.close();let first=true;const es=S.es=new EventSource('/api/stream?u='+encodeURIComponent(S.me.u));
  es.onopen=()=>{if(first){first=false;return}refresh();if(S.cur&&S.cur[0]!='_')loadMsgs(S.cur)};
  es.onerror=()=>{if(es.readyState==2)chk()};
  es.onmessage=e=>{const d=JSON.parse(e.data);
    if(d.type=='call'){onCallEv(d);return}
    if(d.type=='edit'||d.type=='del'){const mn=d.m.f==S.me.u;applyUpdate(d.g||(mn?d.to:d.m.f),d.m);return}
    if(d.type=='msg'){const mine=d.m.f==S.me.u,other=d.g||(mine?d.to:d.m.f),x=convOf(other);
      if(!x){refresh();if(!mine)ping(other,d.m.t||(d.m.i?'📷':'GIF'));return}
      const watching=S.cur==other&&!document.hidden;addMsg(other,d.m);
      if(!mine){if(watching)markRead(other);else{x.unread++;renderList();ping(isG(other)?x.name:other,d.m.t||(d.m.i?'📷':'GIF'))}}}
    else if(d.type=='story')loadFeed();else refresh()}}
const chk=()=>{if(S.me)api('GET','/me').catch(()=>{})};addEventListener('focus',chk);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.me){chk();if(S.cur&&S.cur[0]!='_')markRead(S.cur)}});
let ac;function ping(from,t){const s=S.me.settings;
  if(s.sound&&s.frutiger){blop(1.4);setTimeout(()=>blop(1.9),130)}else if(s.sound){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;g.gain.setValueAtTime(.12,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.25);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.25)}catch(e){}}}
/* liste & notlar */
$('#notes').addEventListener('wheel',e=>{const n=e.currentTarget;if(e.deltaY&&!e.shiftKey&&n.scrollWidth>n.clientWidth){n.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
const pv=t=>t.length>24?t.slice(0,24).trimEnd()+'…':t;
function renderList(){if(!S.me)return;const mn=note(S.me);
  const arr=[...S.users].sort((a,b)=>(b.last?.ts||0)-(a.last?.ts||0)||a.u.localeCompare(b.u));
  $('#nDm').classList.toggle('has',arr.some(x=>x.unread)||S.groups.some(g=>g.unread));
  const all=[...S.groups.map(g=>({k:'g:'+g.id,g:1,obj:g,last:g.last})),...arr.map(x=>({k:x.u,x,last:x.last}))].sort((a,b)=>(b.last?.ts||0)-(a.last?.ts||0));
  $('#notes').innerHTML=`<div class="nt"><button class="bub ${mn?'':'add'}" id="myBub">${mn?esc(pv(mn.t)):t('+ Not')}</button><div class="avw" id="myAv">${av(S.me)}</div><small>${t('Notun')}</small></div>`+
   arr.filter(note).map(x=>`<div class="nt"><button class="bub" data-n="${x.u}">${esc(pv(note(x).t))}</button><div class="avw" data-u="${x.u}">${av(x)}</div><small>${x.u}</small></div>`).join('');
  $('#myBub').onclick=()=>mn?showNote(S.me.u):openNote();$('#myAv').onclick=openNote;
  document.querySelectorAll('.bub[data-n]').forEach(b=>b.onclick=()=>showNote(b.dataset.n));
  document.querySelectorAll('.avw[data-u]').forEach(b=>b.onclick=()=>openChat(b.dataset.u));
  const qv=$('#q').value.trim();$('.list').classList.toggle('searching',!!qv);
  $('#rows').innerHTML=qv?sHTML(qv):all.length?all.map(rowHTML).join(''):`<div class="sub" style="padding:26px">${t('Henüz kimse yok. Yukarıdan hesap arayıp takip et!')}</div>`;
  document.querySelectorAll('.row').forEach(b=>b.onclick=()=>openChat(b.dataset.u));
  document.querySelectorAll('.fw').forEach(b=>b.onclick=()=>toggleFollow(b.dataset.f));document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>msgFrom(b.dataset.m));document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>openProfile(b.dataset.p))}
const sHTML=qv=>{const m=t=>`<div class="sub" style="padding:26px">${t}</div>`;if(qv.length<2)return m(t('Aramak için en az 2 harf yaz'));if(S.sq!==qv.toLowerCase())return m(t('Aranıyor…'));
  return S.sr.length?S.sr.map(x=>`<div class="sres"><span class="aw" data-p="${x.u}" style="cursor:pointer">${av(x,'s')}</span><div data-p="${x.u}" style="cursor:pointer"><b>${esc(x.u)}</b><small>${esc(x.bio||'')}</small></div><div class="btns"><button class="ghost fw ${x.following?'on':''}" data-f="${x.u}">${x.following?t('Takiptesin'):t('Takip et')}</button><button class="ghost" data-m="${x.u}">${t('Mesaj')}</button></div></div>`).join(''):m(t('Hesap bulunamadı'))};
let qt;$('#q').addEventListener('input',()=>{clearTimeout(qt);const v=$('#q').value.trim().toLowerCase();S.sq=null;renderList();if(v.length<2)return;
  qt=setTimeout(async()=>{try{const d=await api('GET','/search?q='+encodeURIComponent(v));if($('#q').value.trim().toLowerCase()!==v)return;S.sr=d.users;S.sq=v;renderList()}catch(e){authErr(e)}},250)});
async function toggleFollow(u){const x=S.sr.find(z=>z.u==u),on=!(x&&x.following);try{await api(on?'POST':'DELETE','/follow/'+encodeURIComponent(u));if(x)x.following=on;await refresh()}catch(e){alert(e.message);authErr(e)}}
function msgFrom(u){const x=S.sr.find(z=>z.u==u);if(!x)return;if(!S.users.find(z=>z.u==u))S.users.push({u:x.u,bio:x.bio,av:x.av,note:null,online:false,following:x.following,unread:0,last:null,temp:1});$('#q').value='';openChat(u)}
const gav=(g,c='')=>`<div class="av ${c} gav">${ic('users')}</div>`;
const lt=l=>l.d?t('Mesaj silindi'):l.g?'GIF':l.i&&!l.t?'📷 '+t('Fotoğraf'):esc(l.t);
const rowHTML=it=>{if(it.g){const g=it.obj,l=g.last;return `<button class="row ${S.cur==it.k?'on':''}" data-u="${it.k}"><span class="aw">${gav(g,'s')}</span><div style="min-width:0"><b>${esc(g.name)}${g.arch&&!g.arch.done?'<i class="wn"></i>':''}</b><span class="${g.unread?'un':''}">${l?(l.f==S.me.u?t('Sen')+': ':esc(l.f)+': ')+lt(l):t('Grup')}</span></div>${g.unread?`<em class="bd">${g.unread>99?'99+':g.unread}</em>`:''}</button>`}
  const x=it.x;return `<button class="row ${S.cur==x.u?'on':''}" data-u="${x.u}"><span class="aw">${av(x,'s')}${x.online?'<i class="dot"></i>':''}</span><div style="min-width:0"><b>${x.u}${x.arch&&!x.arch.done?'<i class="wn"></i>':''}</b><span class="${x.unread?'un':''}">${x.last?(x.last.f==S.me.u?t('Sen: '):'')+lt(x.last):esc(x.bio||t('Merhaba de!'))}</span></div>${x.unread?`<em class="bd">${x.unread>99?'99+':x.unread}</em>`:''}</button>`};
/* yanıt */
function setReply(id){const m=S.mm.get(+id);if(!m||m.d)return;S.edit=null;S.reply={id:m.id,f:m.f,t:m.g?'GIF':m.i&&!m.t?'📷':m.t};renderRbar();const i=$('#mi');if(i)i.focus()}
function renderRbar(){const b=$('#rbar');if(!b)return;
  if(S.edit){const m=S.mm.get(S.edit);b.hidden=false;b.innerHTML=`<div class="rq"><b>${t('Mesajı düzenliyorsun')}</b><span>${esc(m?m.t.slice(0,80):'')}</span></div><button class="ghost" id="rx">${ic('x')}</button>`;$('#rx').onclick=()=>{S.edit=null;$('#mi').value='';renderRbar()};return}
  if(!S.reply){b.hidden=true;b.innerHTML='';return}b.hidden=false;
  b.innerHTML=`<div class="rq"><b>${t('Yanıtlanıyor')}: ${esc(S.reply.f==S.me.u?t('Sen'):S.reply.f)}</b><span>${esc(S.reply.t.slice(0,80))}</span></div><button class="ghost" id="rx">${ic('x')}</button>`;$('#rx').onclick=()=>{S.reply=null;renderRbar()}}
function applyUpdate(other,m){S.mm.set(m.id,m);if(S.cur==other){const el=document.querySelector(`.m[data-id="${m.id}"]`);if(el)el.outerHTML=bub(m);
  if(m.d)document.querySelectorAll(`.rp[data-r="${m.id}"] span`).forEach(s=>s.textContent=t('Silinen mesaj'))}refresh()}
function startEdit(m){S.edit=m.id;S.reply=null;renderRbar();const i=$('#mi');i.value=m.t;i.focus()}
function openMsgMenu(id){const m=S.mm.get(+id);if(!m||m.d)return;const mine=m.f==S.me.u,c=$('#gc');
  c.innerHTML=`<div class="rp" style="cursor:default"><b>${esc(mine?t('Sen'):m.f)}</b><span>${m.g?'GIF':m.i&&!m.t?'📷':esc(m.t.slice(0,140))}</span></div>
  <button class="ghost mact" id="ma-r">${ic('reply')}${t('Yanıtla')}</button>${m.g||!m.t?'':`<button class="ghost mact" id="ma-c">${ic('copy')}${t('Kopyala')}</button>`}
  ${mine&&!m.g&&!m.i?`<button class="ghost mact" id="ma-e">${ic('edit')}${t('Düzenle')}</button>`:''}${mine?`<button class="ghost mact red" id="ma-d">${ic('trash')}${t('Sil')}</button>`:''}<button class="ghost" id="ma-x">${t('Kapat')}</button>`;
  $('#gm').classList.add('on');$('#ma-x').onclick=closeG;$('#ma-r').onclick=()=>{closeG();setReply(id)};
  if($('#ma-c'))$('#ma-c').onclick=async()=>{try{await navigator.clipboard.writeText(m.t)}catch(e){}closeG()};
  if($('#ma-e'))$('#ma-e').onclick=()=>{closeG();startEdit(m)};
  if($('#ma-d'))$('#ma-d').onclick=async()=>{if(!confirm(t('Bu mesaj herkes için silinecek. Emin misin?')))return;closeG();const to=S.cur;try{const d=await api('DELETE','/messages/'+encodeURIComponent(to)+'/'+m.id);applyUpdate(to,d.m)}catch(e){alert(e.message);authErr(e)}}}
function jumpTo(id){const el=document.querySelector(`.m[data-id="${id}"]`);if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1400)}
function bindChat(){S.reply=null;S.edit=null;const ms=$('#ms');
  ms.addEventListener('click',e=>{const pic=e.target.closest('.pic');if(pic){$('#ivi').src=pic.src;$('#iv').classList.add('on');return}const rb=e.target.closest('.rb');if(rb){openMsgMenu(rb.closest('.m').dataset.id);return}const sn=e.target.closest('.sn');if(sn){openProfile(sn.dataset.u);return}const rp=e.target.closest('.rp');if(rp)jumpTo(rp.dataset.r)});
  ms.addEventListener('dblclick',e=>{const m=e.target.closest('.m');if(m&&!e.target.closest('.rp,.sn'))setReply(m.dataset.id)});
  ms.addEventListener('contextmenu',e=>{const m=e.target.closest('.m');if(m&&!m.classList.contains('dl')){e.preventDefault();openMsgMenu(m.dataset.id)}});
  let sx=0,sy=0,el=null,dx=0,lp=0;
  ms.addEventListener('touchstart',e=>{const m=e.target.closest('.m');if(!m)return;el=m;sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;m.style.transition='none';clearTimeout(lp);
    lp=setTimeout(()=>{if(el&&Math.abs(dx)<8){const id=el.dataset.id;el.style.transform='';el=null;if(navigator.vibrate)navigator.vibrate(15);openMsgMenu(id)}},480)},{passive:true});
  ms.addEventListener('touchmove',e=>{if(!el)return;dx=e.touches[0].clientX-sx;const dy=e.touches[0].clientY-sy;if(Math.abs(dx)>8||Math.abs(dy)>8)clearTimeout(lp);if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dx)<12)return;el.style.transform=`translateX(${Math.max(0,Math.min(dx,70))}px)`},{passive:true});
  ms.addEventListener('touchend',()=>{clearTimeout(lp);if(!el)return;const m=el;el=null;m.style.transition='transform .3s var(--ease)';m.style.transform='';if(dx>55){setReply(m.dataset.id);if(navigator.vibrate)navigator.vibrate(12)}});
  $('#pbtn').onclick=()=>$('#pfile').click();
  if($('#gbtn'))$('#gbtn').onclick=toggleGif;
  $('#hav').style.cursor=$('#hi').style.cursor='pointer';
  $('#hav').onclick=$('#hi').onclick=isG(S.cur)?showGroup:()=>openProfile(S.cur)}
/* gif */
let gt;
function toggleGif(){const p=$('#gp');if(!p)return;if(!p.hidden){p.hidden=true;return}p.hidden=false;
  p.innerHTML=`<div class="gh"><input id="gq" placeholder="${t('GIF ara')}" autocomplete="off"><button class="ghost" id="gx2">${ic('x')}</button></div><div class="gg" id="gg"></div><div class="gcr">Powered by GIPHY</div>`;
  $('#gx2').onclick=()=>{p.hidden=true};$('#gq').oninput=()=>{clearTimeout(gt);gt=setTimeout(()=>loadGifs($('#gq').value.trim()),400)};loadGifs('')}
async function loadGifs(q){const g=$('#gg');if(!g)return;g.innerHTML=`<div class="sub" style="padding:18px">${t('Aranıyor…')}</div>`;
  try{const d=await api('GET','/gifs?q='+encodeURIComponent(q));if(!$('#gg'))return;S.gifs=d.gifs;
    g.innerHTML=d.gifs.length?d.gifs.map((x,i)=>`<button class="gi" data-i="${i}"><img src="${esc(x.p)}" alt="" loading="lazy"></button>`).join(''):`<div class="sub" style="padding:18px">${t('GIF bulunamadı')}</div>`;
    g.querySelectorAll('.gi').forEach(b=>b.onclick=()=>sendGif(S.gifs[+b.dataset.i]))}catch(e){if($('#gg'))$('#gg').innerHTML=`<div class="sub" style="padding:18px">${esc(e.message)}</div>`}}
async function sendGif(x){const to=S.cur;try{const d=await api('POST','/messages/'+encodeURIComponent(to),{gif:{u:x.u,w:x.w,h:x.h},r:S.reply&&S.reply.id});S.reply=null;renderRbar();const p=$('#gp');if(p)p.hidden=true;addMsg(to,d.m)}catch(e){alert(e.message);authErr(e)}}
/* profil sayfası */
function openProfile(u){S.back=S.cur;pushV();S.cur='__u:'+u;$('#app').classList.add('chat');setNav('x');renderList();renderMain()}
async function renderUser(u){const own=u==S.me.u,tag='__u:'+u,back=()=>S.back&&S.back[0]!='_'?openChat(S.back):goList();
  const hd=`<div class="pgh"><button class="ghost" id="pb">${ic('back')}</button><b>${esc(u)}</b></div>`;
  $('#main').innerHTML=`<div class="pg">${hd}</div>`;$('#pb').onclick=back;
  try{const d=await api('GET','/user/'+encodeURIComponent(u));if(S.cur!==tag)return;
    const joined=new Date(d.created||Date.now()).toLocaleDateString(LANG=='en'?'en-GB':'tr-TR',{day:'numeric',month:'long',year:'numeric'}),n=d.note;
    $('#main').innerHTML=`<div class="pg">${hd.replace(esc(u),esc(d.u))}
    <div class="pgtop ${n?'hn':''}"><div class="nt pgav">${n?`<div class="bub">${esc(n.t)}</div>`:''}${av(d)}</div>
    <div class="stats"><div><b>0</b><span>${t('gönderi')}</span></div><div><b>${d.followers}</b><span>${t('takipçi')}</span></div><div><b>${d.following}</b><span>${t('takip')}</span></div></div></div>
    <div class="pgn"><b>@${esc(d.u)}</b>${d.followsMe&&!own?`<em class="fm">${t('Seni takip ediyor')}</em>`:''}${d.online?'<i class="wn" style="background:#5dffa8;box-shadow:0 0 8px #5dffa8"></i>':''}</div>
    <div class="pgb">${d.bio?esc(d.bio):`<i>${t('Henüz biyografi yok')}</i>`}</div>
    <div class="pgbtns">${own?`<button class="btn" id="pe">${t('Profili düzenle')}</button>`:`<button class="ghost fw ${d.isFollowing?'on':''}" id="pf">${d.isFollowing?t('Takiptesin'):t('Takip et')}</button><button class="btn" id="pm">${t('Mesaj')}</button>`}</div>
    <div class="pgj">${t('Katılma')}: ${joined}</div>
    <div class="pgtabs"><button>${ic('grid')}</button></div>
    <div class="pgempty">${ic('cam')}<b>${t('Henüz gönderi yok')}</b></div></div>`;
    $('#pb').onclick=back;
    if(own)$('#pe').onclick=()=>$('#nPr').click();
    else{$('#pf').onclick=async()=>{try{await api(d.isFollowing?'DELETE':'POST','/follow/'+encodeURIComponent(u));await refresh();if(S.cur===tag)renderUser(u)}catch(e){alert(e.message);authErr(e)}};
      $('#pm').onclick=()=>{if(!S.users.find(z=>z.u==u))S.users.push({u,bio:d.bio,av:d.av,note:null,online:false,following:d.isFollowing,unread:0,last:null,temp:1});openChat(u)}}
  }catch(e){if(S.cur===tag)$('#main').innerHTML=`<div class="pg">${hd}<div class="sub" style="padding:30px">${esc(e.message)}</div></div>`,$('#pb').onclick=back}}
/* gruplar */
const pickHTML=arr=>arr.length?`<div class="plist">${arr.map(x=>`<label class="pick"><input type="checkbox" value="${x.u}">${av(x,'s')}<b>${esc(x.u)}</b></label>`).join('')}</div>`:`<div class="sub" style="padding:10px 0">${t('Eklenecek kimse yok')}</div>`;
const closeG=()=>$('#gm').classList.remove('on');
$('#gm').onclick=e=>{if(e.target.id=='gm')closeG()};
const picked=()=>[...$('#gc').querySelectorAll('.pick input:checked')].map(i=>i.value);
function openGroupNew(){const c=$('#gc');
  c.innerHTML=`<h3>${t('Yeni grup')}</h3><input id="gn" maxlength="30" placeholder="${t('Grup adı')}" autocomplete="off"><div class="sub" style="text-align:left;margin:0">${t('Üyeleri seç')}</div>${pickHTML(S.users)}<div class="err" id="ge"></div><div class="tags"><button class="ghost" id="gx">${t('Vazgeç')}</button><button class="btn" id="gok">${t('Grubu kur')}</button></div>`;
  $('#gm').classList.add('on');$('#gx').onclick=closeG;
  $('#gok').onclick=async()=>{try{const d=await api('POST','/groups',{name:$('#gn').value.trim(),members:picked()});closeG();await refresh();openChat('g:'+d.group.id)}catch(e){$('#ge').textContent=e.message}}}
function showGroup(){const g=G(S.cur);if(!g)return;const c=$('#gc'),rest=S.users.filter(x=>!g.members.some(m=>m.u==x.u));
  c.innerHTML=`<h3>${esc(g.name)}</h3><div class="sub" style="text-align:left;margin:0">${t('Üyeler')} (${g.members.length})</div><div class="plist">${g.members.map(m=>`<div class="pick" data-p="${esc(m.u)}">${av(m,'s')}<b>${esc(m.u)}${m.u==g.owner?` <small class="tl">· ${t('kurucu')}</small>`:''}</b></div>`).join('')}</div>
  <div class="sub" style="text-align:left;margin:0">${t('Üye ekle')}</div>${pickHTML(rest)}<div class="err" id="ge"></div>
  <div class="tags"><button class="ghost" id="gx">${t('Kapat')}</button>${rest.length?`<button class="btn" id="gadd">${t('Ekle')}</button>`:''}</div><button class="btn red" id="glv">${t('Gruptan ayrıl')}</button>`;
  $('#gm').classList.add('on');$('#gx').onclick=closeG;
  c.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{closeG();openProfile(b.dataset.p)});
  if($('#gadd'))$('#gadd').onclick=async()=>{const m=picked();if(!m.length)return;try{await api('POST',`/groups/${g.id}/members`,{members:m});closeG();await refresh()}catch(e){$('#ge').textContent=e.message}};
  $('#glv').onclick=async()=>{if(!confirm(t('Gruptan ayrılmak istediğine emin misin?')))return;try{await api('POST',`/groups/${g.id}/leave`);closeG();goList();await refresh()}catch(e){$('#ge').textContent=e.message}}}
$('#newG').onclick=openGroupNew;
function renderAbar(){const b=$('#abar');if(!b)return;const x=convOf(S.cur),a=x&&x.arch;if(!a){b.hidden=true;b.innerHTML='';return}
  const en=LANG=='en',d=new Date(a.deadline).toLocaleString(en?'en-GB':'tr-TR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
  const txt=a.done?(en?`You downloaded the oldest ${a.n} messages. They will be cleared once everyone has downloaded them, or on ${d}.`:`En eski ${a.n} mesajı indirdin. Herkes indirince ya da ${d} tarihinde temizlenecek.`)
    :(en?`The oldest ${a.n} messages in this chat will be deleted on ${d}. Download them if you want to keep them.`:`Bu sohbetteki en eski ${a.n} mesaj ${d} tarihinde silinecek. Saklamak istersen indir.`);
  b.hidden=false;b.innerHTML=`<span>${txt}</span><button class="ghost" id="adl">${t('İndir')}</button>`;$('#adl').onclick=dlArchive}
async function dlArchive(){const c=S.cur;try{const d=await api('POST','/archive/'+encodeURIComponent(c)),title=isG(c)?G(c).name:c,loc=LANG=='en'?'en-GB':'tr-TR';
  const lines=d.msgs.map(m=>`[${new Date(m.ts).toLocaleString(loc)}] ${m.f}: ${m.r?`(↪ ${m.r.f}: ${m.r.t}) `:''}${m.i?'[📷] ':''}${m.g?'[GIF] ':''}${m.t.replace(/\n/g,'\n    ')}`);
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([`Fluid — ${title}\n${'='.repeat(30)}\n\n${lines.join('\n')}\n`],{type:'text/plain;charset=utf-8'}));
  a.download=`fluid-${title.replace(/[^a-z0-9_-]+/gi,'_')}-${new Date().toISOString().slice(0,10)}.txt`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
  await refresh()}catch(e){alert(e.message);authErr(e)}}
function openNote(){$('#nt').value=note(S.me)?.t||'';$('#cnt').textContent=$('#nt').value.length+'/60';$('#nm').classList.add('on');setTimeout(()=>$('#nt').focus(),50)}
$('#nt').oninput=e=>$('#cnt').textContent=e.target.value.length+'/60';
$('#nX').onclick=()=>$('#nm').classList.remove('on');
$('#nOk').onclick=async()=>{const t=$('#nt').value.trim();try{if(t)S.me.note=(await api('PUT','/note',{t})).note}catch(e){alert(e.message)}$('#nm').classList.remove('on');renderList()};
$('#nDel').onclick=async()=>{try{await api('DELETE','/note');S.me.note=null}catch(e){}$('#nm').classList.remove('on');renderList()};
function showNote(u){const own=u==S.me.u,x=own?S.me:S.users.find(z=>z.u==u);if(!x)return;const n=note(x);if(!n)return;
  $('#vav').innerHTML=av(x);$('#vn').textContent=own?t('Notun'):u;$('#vt').textContent=n.t;
  {const hr=Math.max(1,Math.ceil((DAY-(Date.now()-n.ts))/36e5));$('#vts').textContent=LANG=='en'?hr+'h left':hr+' saat daha görünür'}
  $('#vb').innerHTML=`<button class="ghost" id="vx">${t('Kapat')}</button><button class="btn" id="vgo">${own?t('Düzenle'):t('Mesaj gönder')}</button>`;
  $('#vx').onclick=closeV;$('#vgo').onclick=()=>{closeV();own?openNote():openChat(u)};$('#vm').classList.add('on')}
const closeV=()=>$('#vm').classList.remove('on');
$('#vm').onclick=e=>{if(e.target.id=='vm')closeV()};
/* sohbet */
const setNav=v=>{$('#nHome').classList.toggle('on',v=='home');$('#nDm').classList.toggle('on',v=='dm');$('#nPr').classList.toggle('on',v=='pr');$('#nSet').classList.toggle('on',v=='st')};
async function openChat(u){pushV();S.cur=u;S.ids=new Set();S.mm=new Map();$('#app').classList.add('chat');setNav('dm');renderList();renderMain();loadMsgs(u)}
async function loadMsgs(u){try{const d=await api('GET','/messages/'+encodeURIComponent(u));if(S.cur!=u||!$('#ms'))return;
  S.ids=new Set(d.msgs.map(m=>m.id));S.mm=new Map(d.msgs.map(m=>[m.id,m]));$('#ms').innerHTML=d.msgs.map(bub).join('');toBottom(false);markRead(u)}catch(e){authErr(e)}}
function markRead(u){const x=convOf(u);if(x&&x.unread){x.unread=0;renderList()}api('POST','/read/'+encodeURIComponent(u)).catch(()=>{})}
const bub=m=>{const mine=m.f==S.me.u,nm=isG(S.cur)&&!mine?`<div class="sn" data-u="${esc(m.f)}" style="cursor:pointer">${esc(m.f)}</div>`:'';
  if(m.d)return `<div class="m ${mine?'me':'th'} dl" data-id="${m.id}">${nm}<div class="mt del">${t('Bu mesaj silindi')}</div></div>`;
  const rp=m.r?`<div class="rp" data-r="${m.r.id}"><b>${esc(m.r.f==S.me.u?t('Sen'):m.r.f)}</b><span>${m.r.d?t('Silinen mesaj'):esc(m.r.t)}</span></div>`:'';
  const bd=m.g?`<img class="gif" src="${esc(m.g.u)}" width="${m.g.w}" height="${m.g.h}" alt="GIF" loading="lazy">`:m.i?`<img class="gif pic" src="/img/${m.i}" width="${m.iw}" height="${m.ih}" alt="" loading="lazy">${m.t?`<div class="mt" style="padding:6px 6px 0">${esc(m.t)}</div>`:''}`:`<div class="mt">${esc(m.t)}</div>`;
  return `<div class="m ${mine?'me':'th'}${m.g||m.i?' gm':''}" data-id="${m.id}">${nm}${rp}${bd}<small>${new Date(m.ts).toLocaleTimeString(LANG,{hour:'2-digit',minute:'2-digit'})}${m.e?' · '+t('düzenlendi'):''}</small><button class="rb" title="${t('Seçenekler')}">${ic('dots')}</button></div>`};
const toBottom=sm=>{const m=$('#ms');if(m)m.scrollTo({top:m.scrollHeight,behavior:sm?'smooth':'auto'})};
function addMsg(other,m){const x=convOf(other);if(x)x.last={t:m.t,ts:m.ts,f:m.f,g:!!m.g,i:!!m.i,d:!!m.d};
  if(S.cur==other&&!S.ids.has(m.id)&&$('#ms')){S.ids.add(m.id);S.mm.set(m.id,m);$('#ms').insertAdjacentHTML('beforeend',bub(m));toBottom(true)}renderList()}
function hdr(){if(!$('#hi'))return;renderAbar();if(isG(S.cur)){const g=G(S.cur);if(!g)return;$('#hav').innerHTML=gav(g,'s');$('#hi').innerHTML=`<b>${esc(g.name)}</b><small>${esc(g.members.map(m=>m.u).join(', '))}</small>`;return}
  const x=S.users.find(z=>z.u==S.cur);if(!x)return;$('#hav').innerHTML=av(x,'s');$('#hi').innerHTML=`<b>${x.u}</b><small>${x.online?t('Çevrimiçi'):esc(x.bio||'')}</small>`}
function renderMain(){const c=S.cur;$('#app').classList.toggle('inchat',!!c&&c[0]!='_');
  if(c&&c.startsWith('__u:'))return renderUser(c.slice(4));if(c==='__profile')return renderProfile();if(c==='__settings')return renderSettings();if(c==='__home')return renderHome();
  if(!c)return $('#main').innerHTML=`<div class="empty"><div class="big"><svg class="ic" style="width:84px;height:84px;stroke-width:1.2"><use href="#i-${S.me.settings.frutiger?'aero':'snow'}"/></svg></div><h2>${t('Bir sohbet seç')}</h2><p>${t('Ya da birinin notuna dokun')}</p></div>`;
  $('#main').innerHTML=`<div class="hd"><button class="ghost" id="back" style="display:none">${ic('back')}</button><span id="hav"></span><div id="hi"></div><div class="callbtns"><button class="ghost cab" id="ca" data-t="${t('Sesli arama')}">${ic('call')}</button><button class="ghost cab" id="cv" data-t="${t('Görüntülü arama')}">${ic('cam')}</button></div></div><div class="abar" id="abar" hidden></div><div class="msgs" id="ms"></div><div class="rbar" id="rbar" hidden></div><div class="gpick" id="gp" hidden></div>
  <div class="send"><button class="gifbtn" id="pbtn" type="button">${ic('cam')}</button>${S.cfg.gif?'<button class="gifbtn" id="gbtn" type="button">GIF</button>':''}<input id="mi" placeholder="${t('Mesaj yaz…')}" autocomplete="off" maxlength="2000"><button class="btn" id="sb">${ic('send')}</button></div>`;
  hdr();if(isMob()){$('#back').style.display='grid';$('#back').onclick=()=>history.state&&history.state.v?history.back():goList()}
  $('#ca').onclick=()=>beginCall(false);$('#cv').onclick=()=>beginCall(true);
  $('#sb').onclick=send;$('#sb').addEventListener('pointerdown',e=>e.preventDefault());$('#mi').addEventListener('keydown',e=>e.key=='Enter'&&send());bindChat();if(!isMob())$('#mi').focus()}
async function send(){const i=$('#mi'),t=i.value.trim();if(!t)return;const to=S.cur;i.value='';
  if(S.edit){try{const d=await api('PUT','/messages/'+encodeURIComponent(to)+'/'+S.edit,{t});S.edit=null;renderRbar();applyUpdate(to,d.m)}catch(e){i.value=t;alert(e.message);authErr(e)}return}
  try{const d=await api('POST','/messages/'+encodeURIComponent(to),{t,r:S.reply&&S.reply.id});S.reply=null;renderRbar();addMsg(to,d.m)}catch(e){i.value=t;alert(e.message);authErr(e)}}
/* fotoğraf gönderme */
$('#iv').onclick=()=>$('#iv').classList.remove('on');
$('#pfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f||!S.cur||S.cur[0]=='_')return;const to=S.cur;
  try{const im=await new Promise((ok,no)=>{const r=new FileReader();r.onerror=()=>no(new Error(t('Geçersiz fotoğraf')));r.onload=()=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error(t('Geçersiz fotoğraf')));i.src=r.result};r.readAsDataURL(f)});
    let max=1280,q=.82,url;
    for(let k=0;k<6;k++){const sc=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*sc));c.height=Math.max(1,Math.round(im.height*sc));
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);url=c.toDataURL('image/jpeg',q);if(url.length<65e4)break;max*=.8;q-=.06}
    if(url.length>=65e4)throw new Error(t('Gönderilen dosya çok büyük.'));
    const ds=Math.min(1,600/Math.max(im.width,im.height)),mi=$('#mi'),cap=!S.edit&&mi?mi.value.trim():'';
    const d=await api('POST','/messages/'+encodeURIComponent(to),{t:cap,img:url,iw:Math.round(im.width*ds),ih:Math.round(im.height*ds),r:S.reply&&S.reply.id});
    if(cap&&mi)mi.value='';S.reply=null;renderRbar();addMsg(to,d.m)}
  catch(x){alert(x.message);authErr(x)}};
const goList=()=>{S.cur=null;$('#app').classList.remove('chat');setNav('dm');renderList();renderMain()};
const pushV=()=>{if(isMob()&&!(history.state&&history.state.v))history.pushState({v:1},'')};
addEventListener('popstate',()=>{if(S.me)goList()});
$('#nDm').onclick=()=>{if(isMob()&&history.state&&history.state.v)history.back();else goList()};
$('#nHome').onclick=()=>{pushV();S.cur='__home';$('#app').classList.add('chat');setNav('home');renderList();renderMain();loadFeed()};
$('#nPr').onclick=()=>{pushV();S.cur='__profile';$('#app').classList.add('chat');setNav('pr');renderList();renderMain()};
$('#nSet').onclick=()=>{pushV();S.cur='__settings';$('#app').classList.add('chat');setNav('st');renderList();renderMain()};
/* profil */
function renderProfile(){const u=S.me;
  $('#main').innerHTML=`<div class="prof"><div class="av big-av" id="bigav">${u.av?`<img src="/avatar/${encodeURIComponent(u.u)}?v=${u.av}" alt="">`:esc(u.u[0].toUpperCase())}<div class="ov">${ic('cam')}${t('Değiştir')}</div></div>
  <h2>@${u.u}</h2><label>${t('Biyografi')}</label><textarea id="bio" rows="4" maxlength="150" placeholder="${t('Kendinden bahset…')}">${esc(u.bio||'')}</textarea>
  <div class="cnt" id="bc">${(u.bio||'').length}/150</div><button class="btn" id="sv">${t('Kaydet')}</button><button class="ghost" id="rm">${t('Fotoğrafı kaldır')}</button></div>`;
  $('#bigav').onclick=()=>$('#file').click();$('#bio').oninput=e=>$('#bc').textContent=e.target.value.length+'/150';
  $('#rm').onclick=()=>saveProfile({avatar:''});
  $('#sv').onclick=async()=>{await saveProfile({bio:$('#bio').value.trim()});const b=$('#sv');if(b){b.textContent=t('Kaydedildi');setTimeout(()=>{if($('#sv'))$('#sv').textContent=t('Kaydet')},1400)}}}
async function saveProfile(p){try{S.me=(await api('PUT','/profile',p)).me;applySettings();if(S.cur=='__profile')renderProfile();renderList()}catch(e){alert(e.message);authErr(e)}}
$('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=256,m=Math.min(im.width,im.height);c.width=c.height=s;
    c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,s,s);saveProfile({avatar:c.toDataURL('image/jpeg',.85)})};im.src=r.result};
  r.readAsDataURL(f);e.target.value=''};
/* ayarlar */
const sw=(k,a,d)=>`<div class="sr"><div>${t(a)}<small>${t(d)}</small></div><button class="sw ${S.me.settings[k]?'on':''}" data-k="${k}" role="switch"></button></div>`;
function renderSettings(){const s=S.me.settings;
  $('#main').innerHTML=`<div class="set"><h2>${t('Ayarlar')}</h2>
  <div class="sc glass"><b>${t('Görünüm')}</b>
  <div class="sr"><div>${t('Dil')}<small>${t('Arayüz dili')}</small></div><div class="lg2"><button data-l="tr" class="${LANG=='tr'?'on':''}">Türkçe</button><button data-l="en" class="${LANG=='en'?'on':''}">English</button></div></div>
  <div class="sr"><div>${t('Vurgu rengi')}<small>${t('Butonlar ve ışıltılar')}</small></div><div class="sws">${Object.keys(ACC).map(k=>`<button class="swt ${s.accent==k?'on':''}" data-a="${k}" title="${t(ACN[k])}" style="background:linear-gradient(135deg,${ACC[k][1]},${ACC[k][2]});color:${ACC[k][0]}"></button>`).join('')}</div></div>
  ${sw('snow','Kar yağışı','Arka plandaki kar taneleri')}${sw('calm','Animasyonları azalt','Daha sakin ve hafif arayüz')}${sw('frutiger','Frutiger Aero','Parlak su altı teması, balıklar ve blop sesleri')}${sw('fmusic','Frutiger müziği','Tema açıkken arkada müzik çal')}</div>
  <div class="sc glass"><b>${t('Bildirimler')}</b>${sw('sound','Mesaj sesi','Yeni mesajda kısa bir ses çal')}</div>
  <div class="sc glass"><b>${t('Gizlilik')}</b>${sw('showOnline','Çevrimiçi durumu','Arkadaşların seni çevrimiçi görsün')}</div>
  <div class="sc glass"><b>${t('Güvenlik')}</b><input id="po" type="password" placeholder="${t('Mevcut şifre')}" autocomplete="current-password"><input id="pn" type="password" placeholder="${t('Yeni şifre (en az 6)')}" autocomplete="new-password"><div class="err" id="pe"></div>
   <button class="btn" id="pc">${t('Şifreyi değiştir')}</button><button class="ghost" id="lo">${t('Tüm cihazlardan çıkış yap')}</button></div>
  <div class="sc glass dang"><b>${t('Hesabı sil')}</b><div class="sub" style="text-align:left;margin:0">${t('Mesajların ve profilin kalıcı olarak silinir.')}</div><input id="pd" type="password" placeholder="${t('Şifreni onayla')}"><div class="err" id="de"></div><button class="btn red" id="dl">${t('Hesabımı sil')}</button></div></div>`;
  document.querySelectorAll('.lg2 button').forEach(b=>b.onclick=()=>setLang(b.dataset.l));
  document.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=!S.me.settings[k];setSet({[k]:v})});
  document.querySelectorAll('.swt').forEach(b=>b.onclick=()=>setSet({accent:b.dataset.a}));
  $('#pc').onclick=async()=>{const e=$('#pe');e.style.color='';try{await api('POST','/password',{old:$('#po').value,new:$('#pn').value});$('#po').value=$('#pn').value='';e.style.color='var(--ice)';e.textContent=t('Şifre güncellendi')}catch(x){e.textContent=x.message}};
  $('#lo').onclick=async()=>{await api('POST','/logout-all').catch(()=>{});toLogin()};
  $('#dl').onclick=async()=>{if(!confirm(t('Hesabın kalıcı olarak silinecek. Emin misin?')))return;try{await api('POST','/delete',{p:$('#pd').value});toLogin()}catch(x){$('#de').textContent=x.message}}}
/* dil */
function trDom(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){if(n.parentElement.closest('#main,#rows,#notes,#vm,#err,script,style'))continue;
    const o=n.__o??(n.__o=n.nodeValue.trim());if(!o||!EN[o])continue;n.nodeValue=n.nodeValue.replace(/\S[\s\S]*\S|\S/,()=>LANG=='en'?EN[o]:o)}
  document.querySelectorAll('[placeholder],[data-t],[title]').forEach(el=>{if(el.closest('#main'))return;for(const a of['placeholder','data-t','title']){if(!el.hasAttribute(a))continue;const k='_o'+a,o=el[k]??(el[k]=el.getAttribute(a));if(EN[o])el.setAttribute(a,LANG=='en'?EN[o]:o)}})}
function setLang(l,quiet){LANG=l;try{localStorage.setItem('fl_lang',l)}catch(e){}document.documentElement.lang=l;trDom();$('#lgb').innerHTML=`<b style="opacity:${l=='tr'?1:.4}">TR</b> | <b style="opacity:${l=='en'?1:.4}">EN</b>`;setMode(mode);$('#err').textContent='';
  if(S.me){S.me.settings.lang=l;if(!quiet)api('PUT','/settings',{lang:l}).catch(()=>{});renderList();renderMain()}}
$('#lgb').onclick=()=>setLang(LANG=='tr'?'en':'tr');
async function setSet(patch){Object.assign(S.me.settings,patch);applySettings();
  document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',!!S.me.settings[b.dataset.k]));
  document.querySelectorAll('.swt').forEach(b=>b.classList.toggle('on',b.dataset.a==S.me.settings.accent));
  try{await api('PUT','/settings',patch)}catch(e){authErr(e)}}
/* kar */
const cv=$('#snow'),cx=cv.getContext('2d');let W,H;const fl=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+.6,v:Math.random()*.4+.15,d:Math.random()*6}));
const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};rs();addEventListener('resize',rs);
(function t(){requestAnimationFrame(t);const fa=document.body.classList.contains('fa');if(!fa&&S.me&&!S.me.settings.snow)return;cx.clearRect(0,0,W,H);
  if(fa){for(const f of fl){f.y-=f.v/260;f.d+=.012;if(f.y<-.05)f.y=1.05;const x=(f.x+Math.sin(f.d)*.015)*W,y=f.y*H,r=f.r*4+2;
    cx.beginPath();cx.arc(x,y,r,0,7);cx.fillStyle='rgba(255,255,255,.08)';cx.fill();cx.strokeStyle='rgba(255,255,255,.55)';cx.lineWidth=1.2;cx.stroke();
    cx.beginPath();cx.arc(x-r*.35,y-r*.35,r*.22,0,7);cx.fillStyle='rgba(255,255,255,.85)';cx.fill()}return}
  cx.fillStyle='rgba(200,240,255,.7)';
  for(const f of fl){f.y+=f.v/300;f.d+=.01;if(f.y>1)f.y=0;cx.beginPath();cx.arc((f.x+Math.sin(f.d)*.02)*W,f.y*H,f.r,0,7);cx.fill()}})();
/* ---- Frutiger Aero: tema, müzik, blop ---- */
const AERO={},AEROC=['#c8fff4','#4fd8ff','#5cf0a0','200,255,244'];
const actx=()=>AERO.c||(AERO.c=new(window.AudioContext||window.webkitAudioContext)());
function blop(k=1){try{const c=actx();if(c.state=='suspended')c.resume();const t0=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=(420+Math.random()*220)*k;
  o.type='sine';o.frequency.setValueAtTime(f*.6,t0);o.frequency.exponentialRampToValueAtTime(f*1.6,t0+.07);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.22,t0+.012);g.gain.exponentialRampToValueAtTime(.001,t0+.16);
  o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+.18)}catch(e){}}
const CH=[[130.81,164.81,196,246.94,293.66],[110,164.81,196,246.94,261.63],[87.31,130.81,196,220,329.63],[98,146.83,164.81,220,246.94]];
function pad(f,t,v){const c=AERO.c;for(const dt of[-6,6]){const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
  o.type='triangle';o.frequency.value=f;o.detune.value=dt;lp.type='lowpass';lp.frequency.value=900;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+2);g.gain.setValueAtTime(v,t+6);g.gain.linearRampToValueAtTime(0,t+9.5);
  o.connect(lp);lp.connect(g);g.connect(AERO.bus);o.start(t);o.stop(t+9.6)}}
function bell(f,t){const c=AERO.c,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),g2=c.createGain();
  o.type=o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.01;g2.gain.value=.3;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.01);g.gain.exponentialRampToValueAtTime(.0005,t+1.8);
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(AERO.bus);o.start(t);o2.start(t);o.stop(t+1.9);o2.stop(t+1.9)}
function bar(){if(!AERO.synth)return;const c=AERO.c,t0=c.currentTime+.1,ch=CH[AERO.step++%4];
  ch.forEach((f,i)=>pad(f,t0,i<2?.06:.035));
  for(let k=0;k<11;k++)if(Math.random()<.75)bell(ch[Math.random()*ch.length|0]*(Math.random()<.5?2:4),t0+k*.65+Math.random()*.12);
  AERO.tm=setTimeout(bar,7000)}
async function musicStart(){
  if(AERO.busy||AERO.synth||(AERO.el&&!AERO.el.paused))return;AERO.busy=1;
  try{
    if(AERO.file===undefined){try{AERO.file=(await fetch('/media/frutiger.mp3',{method:'HEAD'})).ok}catch(e){AERO.file=false}}
    const s=S.me&&S.me.settings;if(!s||!s.frutiger||!s.fmusic)return;
    if(AERO.file){if(!AERO.el){AERO.el=new Audio('/media/frutiger.mp3');AERO.el.loop=true;AERO.el.volume=.5}await AERO.el.play().catch(()=>{});return}
    const c=actx();await c.resume().catch(()=>{});if(c.state!='running'||AERO.synth)return;
    if(!AERO.bus){const m=c.createGain(),bus=c.createGain(),d=c.createDelay(1),fb=c.createGain(),lp=c.createBiquadFilter();
      m.gain.value=0;bus.gain.value=.7;d.delayTime.value=.42;fb.gain.value=.4;lp.type='lowpass';lp.frequency.value=2200;
      bus.connect(m);bus.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(m);m.connect(c.destination);Object.assign(AERO,{m,bus})}
    AERO.m.gain.cancelScheduledValues(c.currentTime);AERO.m.gain.setTargetAtTime(.9,c.currentTime,1.2);AERO.synth=true;AERO.step=0;bar()
  }finally{AERO.busy=0}}
function musicStop(){if(AERO.el)AERO.el.pause();if(AERO.synth){AERO.synth=false;clearTimeout(AERO.tm);AERO.m.gain.setTargetAtTime(0,AERO.c.currentTime,.4)}}
function aeroSync(){const s=S.me&&S.me.settings,on=!!(s&&s.frutiger),v=$('#fv');document.body.classList.toggle('fa',on);
  if(on){if(!v.getAttribute('src'))v.src='/media/frutiger.mp4';v.play().catch(()=>{})}else v.pause();
  on&&s.fmusic?musicStart():musicStop();
  document.querySelectorAll('use[href="#i-snow"],use[href="#i-aero"]').forEach(u=>u.setAttribute('href',on?'#i-aero':'#i-snow'))}
$('#fv').addEventListener('error',()=>document.body.classList.add('novid'));
$('#fv').addEventListener('loadeddata',()=>document.body.classList.remove('novid'));
document.addEventListener('pointerdown',e=>{const s=S.me&&S.me.settings;if(!s||!s.frutiger)return;
  if(s.fmusic)musicStart();if(s.sound&&e.target.closest('button,.pick,.gi'))blop()},true);
Object.assign(EN,{"Frutiger Aero":"Frutiger Aero","Parlak su altı teması, balıklar ve blop sesleri":"Glossy underwater theme, fish and bloop sounds","Frutiger müziği":"Frutiger music","Tema açıkken arkada müzik çal":"Play background music while the theme is on",
"Sesli arama":"Voice call","Görüntülü arama":"Video call","Grup araması":"Group call","Bağlanıyor…":"Connecting…","Aranıyor…":"Calling…","Bekleniyor…":"Waiting…","Yanıt yok":"No answer","Arama reddedildi":"Call declined","Arama bitti":"Call ended","Zaten bir aramadasın":"You are already in a call","Bu tarayıcı aramayı desteklemiyor":"This browser does not support calls","Mikrofon veya kamera izni verilmedi":"Microphone or camera permission was not granted","Arama bulunamadı":"Call not found"});
/* ---- arama ---- */
const CALL={id:null,ice:[{urls:'stun:stun.l.google.com:19302'}],pcs:new Map(),streams:new Map(),local:null,call:null,invite:null,ready:null,muted:false,camoff:false,rt:null};
const toast=msg=>{const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('on');clearTimeout(toast._);toast._=setTimeout(()=>el.classList.remove('on'),3400)};
const callName=c=>{if(!c)return '';if(isG(c.to)){const g=G(c.to);return g?g.name:t('Grup araması')}return c.from===S.me.u?c.to:c.from};
function ringTone(on){clearInterval(CALL.rt);CALL.rt=null;if(!on)return;const beep=()=>{try{ac=ac||new AudioContext();const t0=ac.currentTime;[[0,440],[.2,554]].forEach(([d,f])=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t0+d);g.gain.linearRampToValueAtTime(.13,t0+d+.02);g.gain.exponentialRampToValueAtTime(.001,t0+d+.38);o.connect(g);g.connect(ac.destination);o.start(t0+d);o.stop(t0+d+.42)})}catch(e){}};beep();CALL.rt=setInterval(beep,2100)}
function showInvite(c){if(CALL.id||CALL.invite)return;CALL.invite=c;ringTone(true);const g=isG(c.to),who=g?null:(S.users.find(z=>z.u==c.from)||{u:c.from,av:0});
  $('#ring').classList.add('on');$('#ringin').innerHTML=`<div class="rings"><b></b><em></em>${g?`<div class="av phav gav">${ic('users')}</div>`:av(who||{u:c.from,av:0},'phav')}</div><svg class="ic sig"><use href="#i-call"/></svg><h2>${esc(callName(c))}</h2><p class="waitn">${g?esc(c.from)+' · ':''}${t(c.video?'Görüntülü arama':'Sesli arama')}</p><div class="cbar" style="padding:8px 0 0"><button class="cact hang" id="cno">${ic('hang')}</button><button class="cact" id="cyes" style="background:linear-gradient(135deg,var(--a1),var(--a2));color:#04122a;border:0">${ic('call')}</button></div>`;
  $('#cno').onclick=rejectCall;$('#cyes').onclick=acceptCall;ping(callName(c),t(c.video?'Görüntülü arama':'Sesli arama'))}
function hideInvite(){ringTone(false);CALL.invite=null;$('#ring').classList.remove('on');$('#ringin').innerHTML=''}
async function beginCall(video){const to=S.cur;if(!to||to[0]=='_')return;if(CALL.id)return toast(t('Zaten bir aramadasın'));
  try{const d=await api('POST','/call',{to,video});await bootCall(d.call,d.ice)}catch(e){toast(e.message);authErr(e)}}
async function acceptCall(){const c=CALL.invite;if(!c)return;hideInvite();try{const d=await api('POST','/call/'+c.id+'/join');await bootCall(d.call,d.ice)}catch(e){toast(e.message);authErr(e)}}
function rejectCall(){const c=CALL.invite;hideInvite();if(c)api('POST','/call/'+c.id+'/reject').catch(()=>{})}
function paintStage(){const c=CALL.call;if(!c||!CALL.id)return;
  const others=c.live.filter(u=>u!==S.me.u),st=$('#cst');
  if(!$('#tiles')){$('#stage').innerHTML=`<div class="hd" style="background:transparent;border:0"><div id="chi"><b>${esc(callName(c))}</b><small id="cst">${t('Bağlanıyor…')}</small></div></div><div class="tiles" id="tiles"></div><div class="cbar"><button class="cact" id="cmu">${ic('mic')}</button><button class="cact" id="cvid" hidden>${ic('cam')}</button><button class="cact hang" id="chg">${ic('hang')}</button></div>`;
    $('#cmu').onclick=()=>{CALL.muted=!CALL.muted;if(CALL.local)CALL.local.getAudioTracks().forEach(x=>x.enabled=!CALL.muted);$('#cmu').classList.toggle('on',CALL.muted);$('#cmu').innerHTML=ic(CALL.muted?'micoff':'mic')};
    $('#cvid').onclick=()=>{CALL.camoff=!CALL.camoff;if(CALL.local)CALL.local.getVideoTracks().forEach(x=>x.enabled=!CALL.camoff);$('#cvid').classList.toggle('on',CALL.camoff);$('#cvid').innerHTML=ic(CALL.camoff?'vidoff':'cam');const tm=$('#tile-me');if(tm)tm.classList.toggle('audio',CALL.camoff||!CALL.call.video)};
    $('#chg').onclick=()=>hangup()}
  $('#cvid').hidden=!c.video;if($('#chi b'))$('#chi b').textContent=callName(c);
  const box=$('#tiles');if(!box)return;
  const ids=new Set(['me',...others]);
  if(!$('#tile-me'))box.insertAdjacentHTML('afterbegin',`<div class="tile me ${c.video?'':'audio'}" id="tile-me"><video id="vme" autoplay muted playsinline></video><div class="av phav" id="pme"></div><small>${esc(t('Sen'))}</small></div>`);
  const vm=$('#vme');if(vm&&CALL.local&&vm.srcObject!==CALL.local)vm.srcObject=CALL.local;$('#tile-me').classList.toggle('audio',!c.video||CALL.camoff);$('#pme').innerHTML=av(S.me,'phav').replace('class="av phav"','');
  others.forEach(u=>{if($('#tile-'+u))return;box.insertAdjacentHTML('beforeend',`<div class="tile ${c.video?'':'audio'}" id="tile-${u}"><video id="v-${u}" autoplay playsinline></video><div class="av phav">${(S.users.find(z=>z.u==u)||{u,av:0}).av?`<img src="/avatar/${encodeURIComponent(u)}?v=${(S.users.find(z=>z.u==u)||{}).av}" alt="">`:esc(u[0].toUpperCase())}</div><small>${esc(u)}</small></div>`);
    const v=$('#v-'+u);if(v&&CALL.streams.get(u))v.srcObject=CALL.streams.get(u)});
  [...box.children].forEach(el=>{const id=el.id.slice(5);if(id!=='me'&&!ids.has(id))el.remove()});
  others.forEach(u=>{const v=$('#v-'+u),stt=CALL.streams.get(u);if(v&&stt&&v.srcObject!==stt)v.srcObject=stt;const tl=$('#tile-'+u);if(tl)tl.classList.toggle('audio',!c.video||!stt||!stt.getVideoTracks().some(x=>x.enabled&&x.readyState==='live'))});
  if(st)st.textContent=others.length?t(c.video?'Görüntülü arama':'Sesli arama'):t(isG(c.to)?'Bekleniyor…':'Aranıyor…')}
async function bootCall(call,ice){
  CALL.id=call.id;CALL.call=call;CALL.ice=(ice&&ice.length)?ice:CALL.ice;CALL.pcs=new Map();CALL.streams=new Map();CALL.muted=false;CALL.camoff=false;
  $('#stage').classList.add('on');paintStage();
  if(!navigator.mediaDevices||!window.RTCPeerConnection){toast(t('Bu tarayıcı aramayı desteklemiyor'));return hangup()}
  try{CALL.local=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:call.video?{facingMode:'user',width:{ideal:960},height:{ideal:720}}:false})}
  catch(e){toast(t('Mikrofon veya kamera izni verilmedi'));return hangup()}
  let go;CALL.ready=new Promise(r=>go=r);paintStage();
  call.live.filter(u=>u!==S.me.u).forEach(u=>linkPeer(u,true));go();
}
function linkPeer(u,offerer){if(!CALL.id||u===S.me.u||CALL.pcs.has(u))return;
  const pc=new RTCPeerConnection({iceServers:CALL.ice}),p={pc,q:[]};CALL.pcs.set(u,p);
  if(CALL.local)CALL.local.getTracks().forEach(tr=>pc.addTrack(tr,CALL.local));
  pc.onicecandidate=e=>{if(e.candidate)sig(u,{t:'ice',c:e.candidate})};
  pc.ontrack=e=>{CALL.streams.set(u,e.streams[0]);paintStage()};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&offerer)pc.createOffer({iceRestart:true}).then(async o=>{await pc.setLocalDescription(o);sig(u,{t:'sdp',d:{type:o.type,sdp:o.sdp}})}).catch(()=>{})};
  if(offerer)makeOffer(u,pc);paintStage()}
async function makeOffer(u,pc){try{const o=await pc.createOffer();await pc.setLocalDescription(o);sig(u,{t:'sdp',d:{type:o.type,sdp:o.sdp}})}catch(e){}}
function sig(to,data){if(CALL.id)api('POST','/call/'+CALL.id+'/signal',{to,data}).catch(()=>{})}
function flushIce(p){(p.q||[]).forEach(c=>p.pc.addIceCandidate(c).catch(()=>{}));p.q=[]}
async function onSig(from,data){if(!CALL.id||!data)return;if(!CALL.pcs.has(from))linkPeer(from,false);const p=CALL.pcs.get(from);if(!p)return;
  try{if(data.t==='sdp'){const d=data.d;if(d.type==='offer'){await p.pc.setRemoteDescription(d);const a=await p.pc.createAnswer();await p.pc.setLocalDescription(a);sig(from,{t:'sdp',d:{type:a.type,sdp:a.sdp}});flushIce(p)}
    else if(d.type==='answer'&&p.pc.signalingState!=='stable'){await p.pc.setRemoteDescription(d);flushIce(p)}}
    else if(data.t==='ice'){if(!p.pc.remoteDescription)p.q.push(data.c);else await p.pc.addIceCandidate(data.c)}}catch(e){}}
function closePeer(u){const p=CALL.pcs.get(u);if(!p)return;try{p.pc.close()}catch(e){}CALL.pcs.delete(u);CALL.streams.delete(u);const el=$('#tile-'+u);if(el)el.remove()}
function hangup(silent){const id=CALL.id;hideInvite();for(const u of[...CALL.pcs.keys()])closePeer(u);if(CALL.local){CALL.local.getTracks().forEach(x=>x.stop());CALL.local=null}CALL.id=null;CALL.call=null;CALL.ready=null;$('#stage').classList.remove('on');$('#stage').innerHTML='';if(id&&!silent)api('POST','/call/'+id+'/leave').catch(()=>{})}
function onCallEv(d){if(!S.me)return;
  if(d.kind==='invite'){showInvite(d.call);return}
  if(d.kind==='end'){if(CALL.invite&&CALL.invite.id===d.id)hideInvite();if(CALL.id===d.id){if(d.why==='reject')toast(t('Arama reddedildi'));else if(d.why==='timeout')toast(t('Yanıt yok'));else toast(t('Arama bitti'));hangup(1)}return}
  if(d.kind==='reject'){if(CALL.invite&&CALL.invite.id===d.id)hideInvite();if(CALL.id===d.id&&CALL.call&&!isG(CALL.call.to)&&CALL.pcs.size<1){toast(t('Arama reddedildi'));hangup(1)}return}
  if(d.kind==='leave'&&d.call&&CALL.id===d.call.id){CALL.call=d.call;closePeer(d.u);if(!isG(d.call.to)&&d.call.live.filter(u=>u!==S.me.u).length<1)hangup(1);else paintStage();return}
  if((d.kind==='peer'||d.kind==='state')&&d.call){if(CALL.id===d.call.id){CALL.call=d.call;if(d.kind==='peer'&&d.u&&d.u!==S.me.u)linkPeer(d.u,false);paintStage()}return}
  if(d.kind==='signal'&&CALL.id===d.id&&CALL.ready)CALL.ready.then(()=>onSig(d.from,d.data))}
addEventListener('pagehide',()=>{if(CALL.id)try{navigator.sendBeacon('/api/call/'+CALL.id+'/leave',new Blob(['{}'],{type:'application/json'}))}catch(e){}});

/* ---- hikayeler: ana sayfa, izleyici, düzenleyici ---- */
const SMAX=5,VID_MAX=15*1024*1024,SE_COLORS=['#ffffff','#8fe3ff','#5dffa8','#ff9fb2','#ffd84d','#04122a'];
const SE={blob:null,kind:'img',url:null,texts:[],strokes:[],hist:[],color:'#ffffff',draw:false,cur:null,drag:null,busy:0};
const SV={ui:0,ii:0,el:0,dur:5000,paused:false,raf:0,last:0};
Object.assign(EN,{"Ana sayfa":"Home","Hikaye ekle":"Add story","Hikayen":"Your story","Takip ettiklerinin hikayesi yok":"No stories from people you follow","Birini takip edip ilk hikayesini gör":"Follow someone to see their stories","görüntülenme":"views","Bu hikayeyi silmek istiyor musun?":"Do you want to delete this story?","Yeni hikaye":"New story","Paylaşılıyor…":"Sharing…","Hikaye paylaşıldı":"Story shared","Video en fazla 15 MB olabilir":"Video can be at most 15 MB","Sadece fotoğraf veya MP4/WebM video":"Only photos or MP4/WebM video","Günde en fazla 5 story paylaşabilirsin":"You can share at most 5 stories a day","Sadece JPEG fotoğraf, MP4 veya WebM video":"Only JPEG photo, MP4 or WebM video","Fotoğraf en fazla 3 MB olabilir":"Photo can be at most 3 MB","Geçersiz dosya":"Invalid file","Önce bekleyen paylaşımını tamamla":"Finish your pending upload first","Medya bulunamadı":"Media not found","Story bulunamadı":"Story not found","Metin yaz…":"Type text…"});
EN["Bu fotoğraf okunamadı, JPEG veya PNG dene"]="This photo could not be read, try a JPEG or PNG";
const ago=ts=>{const m=Math.max(1,Math.round((Date.now()-ts)/6e4));if(m<60)return LANG=='en'?m+' min ago':m+' dk önce';const h=Math.round(m/60);return LANG=='en'?h+' h ago':h+' sa önce'};
async function loadFeed(){try{const d=await api('GET','/stories/feed');S.feed=d.users;if(S.cur=='__home')renderHome()}catch(e){authErr(e)}}
const ovSVG=(ov,edit)=>{ov=ov||{};
  const st=(ov.s||[]).map(s=>`<path d="M${s.p.map(q=>q[0]+' '+q[1]).join(' L')}" fill="none" stroke="${s.c}" stroke-width="${s.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const tx=(ov.t||[]).map((x,i)=>`<text data-ti="${i}" x="${x.x}" y="${x.y}" font-size="${x.s}" font-weight="800" fill="${x.c}" stroke="#04122a" stroke-width="${Math.max(3,x.s/9)}" paint-order="stroke" text-anchor="middle" font-family="system-ui,sans-serif" style="${edit?'cursor:move':''}">${esc(x.t)}</text>`).join('');
  return st+tx};
function renderHome(){if(S.cur!='__home')return;const me=S.me.u;
  const mine=S.feed.find(x=>x.u==me)||{u:me,av:S.me.av,items:[],mine:true};
  const others=S.feed.filter(x=>x.u!=me&&x.items.length);
  const seenCls=x=>x.items.length&&x.unseen?'':'seen';
  const tile=x=>`<div class="stile"><span class="sring ${seenCls(x)}" data-s="${esc(x.u)}">${av(x,'s')}</span><small>${esc(x.u)}</small></div>`;
  const mineT=`<div class="stile"><span class="sring ${mine.items.length&&mine.items.some(z=>!z.seen)?'':'seen'}" data-s="${esc(me)}">${av(mine,'s')}</span><i class="plusb" id="sadd" title="${t('Hikaye ekle')}"></i><small>${t('Hikayen')}</small></div>`;
  const card=x=>{const L=x.items[x.items.length-1];const th=L.kind=='vid'?`<span class="vthumb"><i></i></span>`:`<img src="/api/stories/${L.id}/media" loading="lazy" alt="">`;
    return `<button class="scard" data-s="${esc(x.u)}">${th}<span><b>${esc(x.u)}</b><small>${ago(L.ts)}</small></span></button>`};
  $('#main').innerHTML=`<div class="hd"><b>${t('Ana sayfa')}</b></div>
  <div class="home"><div class="srow">${mineT}${others.map(tile).join('')}</div>
  ${others.length?`<div class="sgrid">${others.map(card).join('')}</div>`:`<div class="pgempty">${ic('cam')}<b>${t('Takip ettiklerinin hikayesi yok')}</b><small>${t('Birini takip edip ilk hikayesini gör')}</small></div>`}</div>`;
  $('#main').querySelectorAll('[data-s]').forEach(el=>el.onclick=()=>{const u=el.dataset.s,x=S.feed.find(z=>z.u==u);if(x&&x.items.length)openStories(u);else if(u==me)pickStory()});
  $('#sadd').onclick=pickStory}
function pickStory(){const mine=S.feed.find(x=>x.u==S.me.u);if(mine&&mine.items.length>=SMAX)return toast(t('Günde en fazla 5 story paylaşabilirsin'));$('#sfile').click()}
function openStories(u){const i=S.feed.findIndex(x=>x.u==u&&x.items.length);if(i<0)return;SV.ui=i;const k=S.feed[i].items.findIndex(x=>!x.seen);SV.ii=k<0?0:k;$('#sv').classList.add('on');showStory()}
function closeStories(){cancelAnimationFrame(SV.raf);SV.raf=0;$('#sv').classList.remove('on');$('#svs').innerHTML='';if(S.cur=='__home')renderHome()}
function showStory(){
  cancelAnimationFrame(SV.raf);SV.raf=0;
  const U=S.feed[SV.ui];if(!U)return closeStories();
  if(SV.ii>=U.items.length){SV.ui++;SV.ii=0;return showStory()}
  const it=U.items[SV.ii];
  if(!it.mine&&!it.seen){it.seen=true;api('POST','/stories/'+it.id+'/view').catch(()=>{})}
  SV.el=0;SV.dur=it.kind=='vid'?60000:5000;SV.paused=false;SV.last=0;
  const bars=U.items.map((x,i)=>`<i><b data-b="${i}" style="width:${i<SV.ii?100:0}%"></b></i>`).join('');
  const src='/api/stories/'+it.id+'/media';
  $('#svs').innerHTML=`<div class="sbars">${bars}</div>
   <div class="shd">${av(U,'s')}<div><b>${esc(U.u)}</b><small>${ago(it.ts)}${it.mine?' · '+it.views+' '+t('görüntülenme'):''}</small></div>${it.mine?`<button class="ghost cab" id="sdel">${ic('trash')}</button>`:''}<button class="ghost cab" id="svx">${ic('x')}</button></div>
   ${it.kind=='vid'?`<video id="svv" src="${src}" autoplay playsinline></video>`:`<img id="svi" src="${src}" alt="">`}
   <svg class="sov" viewBox="0 0 900 1600">${ovSVG(it.ov,false)}</svg>
   <div class="snav"><i data-d="-1"></i><i data-d="1"></i></div>`;
  $('#svx').onclick=closeStories;
  const del=$('#sdel');if(del)del.onclick=async()=>{if(!confirm(t('Bu hikayeyi silmek istiyor musun?')))return;try{await api('DELETE','/stories/'+it.id);closeStories();loadFeed()}catch(x){toast(x.message);authErr(x)}};
  const v=$('#svv');if(v){v.onloadedmetadata=()=>{if(isFinite(v.duration)&&v.duration>0)SV.dur=Math.min(60000,Math.max(3000,v.duration*1000))};v.onerror=()=>{SV.dur=0}}
  const im=$('#svi');if(im)im.onerror=()=>{SV.dur=0};
  $('#svs').querySelectorAll('.snav i').forEach(i=>i.onclick=()=>{const d=+i.dataset.d;
    if(d<0){if(SV.ii>0)SV.ii--;else if(SV.ui>0){SV.ui--;SV.ii=S.feed[SV.ui].items.length-1}else SV.ii=0}else SV.ii++;showStory()});
  const box=$('#svs');
  box.onpointerdown=e=>{if(e.target.closest('button'))return;SV.paused=true;const vv=$('#svv');if(vv)vv.pause()};
  const rs=()=>{SV.paused=false;const vv=$('#svv');if(vv&&vv.paused)vv.play().catch(()=>{})};
  box.onpointerup=rs;box.onpointercancel=rs;box.onpointerleave=rs;
  SV.raf=requestAnimationFrame(svTick)}
function svTick(ts){
  if(!$('#sv').classList.contains('on'))return;
  if(!SV.last)SV.last=ts;const dt=Math.min(100,ts-SV.last);SV.last=ts;
  if(!SV.paused)SV.el+=dt;
  const b=document.querySelector(`#svs [data-b="${SV.ii}"]`);if(b)b.style.width=Math.min(100,SV.el/SV.dur*100)+'%';
  if(SV.el>=SV.dur){SV.ii++;return showStory()}
  SV.raf=requestAnimationFrame(svTick)}
/* düzenleyici */
function openEditorUI(){
  const colors=SE_COLORS.map(c=>`<button class="swatch ${c==SE.color?'on':''}" data-c="${c}" style="background:${c};color:${c}"></button>`).join('');
  $('#se').innerHTML=`<div class="seW">
   <div class="sebar"><button class="ghost cab" id="sex">${ic('x')}</button><b>${t('Yeni hikaye')}</b><button class="btn" id="sok">${t('Paylaş')}</button></div>
   <div class="sbox">${SE.kind=='vid'?`<video src="${SE.url}" autoplay loop muted playsinline></video>`:`<img src="${SE.url}" alt="">`}<svg id="sovE" class="sov" viewBox="0 0 900 1600"></svg></div>
   <div class="sctl">
    <div class="row2"><input id="sti" maxlength="24" placeholder="${t('Metin yaz…')}" autocomplete="off"><button class="ghost" id="sadt">${t('Ekle')}</button></div>
    <div class="row2"><div class="swrap">${colors}</div><div class="swrap"><button class="sicon ${SE.draw?'on':''}" id="sdr">${ic('pen')}</button><button class="sicon" id="sun">${ic('undo')}</button></div></div>
   </div></div>`;
  $('#sex').onclick=closeEditor;
  $('#sok').onclick=shareStory;
  $('#sadt').onclick=addText;
  $('#sti').onkeydown=e=>{if(e.key=='Enter')addText()};
  $('#sdr').onclick=()=>{SE.draw=!SE.draw;$('#sdr').classList.toggle('on',SE.draw)};
  $('#sun').onclick=undoEdit;
  $('#se').querySelectorAll('.swatch').forEach(b=>b.onclick=()=>{SE.color=b.dataset.c;$('#se').querySelectorAll('.swatch').forEach(x=>x.classList.toggle('on',x===b))});
  const sv=$('#sovE');
  const pt=e=>{const r=sv.getBoundingClientRect();return [Math.round((e.clientX-r.left)*900/r.width),Math.round((e.clientY-r.top)*1600/r.height)]};
  sv.onpointerdown=e=>{const p=pt(e),tg=e.target.closest&&e.target.closest('[data-ti]');
    if(SE.draw){SE.cur={c:SE.color,w:12,p:[p]};SE.strokes.push(SE.cur);SE.hist.push('s')}
    else if(tg){const i=+tg.dataset.ti,x=SE.texts[i];SE.drag={i,dx:p[0]-x.x,dy:p[1]-x.y}}
    sv.setPointerCapture(e.pointerId);redraw()};
  sv.onpointermove=e=>{const p=pt(e);
    if(SE.cur){SE.cur.p.push(p);redraw()}
    else if(SE.drag){const x=SE.texts[SE.drag.i];x.x=Math.max(0,Math.min(900,p[0]-SE.drag.dx));x.y=Math.max(0,Math.min(1600,p[1]-SE.drag.dy));redraw()}};
  sv.onpointerup=sv.onpointercancel=()=>{SE.cur=null;SE.drag=null;redraw()};
  redraw()}
const redraw=()=>{const s=$('#sovE');if(s)s.innerHTML=ovSVG({t:SE.texts,s:SE.strokes},true)};
function addText(){const v=$('#sti').value.trim().slice(0,24);if(!v)return;SE.texts.push({x:450,y:800,s:56,c:SE.color,t:v});SE.hist.push('t');$('#sti').value='';redraw()}
function undoEdit(){const k=SE.hist.pop();if(k=='s')SE.strokes.pop();else if(k=='t')SE.texts.pop();redraw()}
function closeEditor(){$('#se').classList.remove('on');$('#se').innerHTML='';if(SE.url){URL.revokeObjectURL(SE.url);SE.url=null}SE.blob=null;SE.texts=[];SE.strokes=[];SE.hist=[]}
async function upRaw(blob){let r;
  try{r=await fetch('/api/stories/upload',{method:'POST',headers:{'Content-Type':blob.type,'X-Fluid-User':S.me.u},body:blob,credentials:'same-origin'})}catch(x){throw fe(NOSRV)}
  let d=null;try{d=await r.json()}catch(x){}
  if(!r.ok)throw fe(d&&d.error?d.error:byStatus(r.status),r.status);return d}
async function shareStory(){if(SE.busy||!SE.blob)return;SE.busy=1;const b=$('#sok');if(b)b.textContent=t('Paylaşılıyor…');
  try{const up=await upRaw(SE.blob);await api('POST','/stories',{mid:up.mid,ov:{t:SE.texts,s:SE.strokes}});closeEditor();toast(t('Hikaye paylaşıldı'));loadFeed()}
  catch(x){toast(x.message);authErr(x)}
  finally{SE.busy=0;const bb=$('#sok');if(bb)bb.textContent=t('Paylaş')}}
$('#sfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{
    if(f.type.startsWith('image/')){
      const src=URL.createObjectURL(f),im=new Image();im.src=src;
      try{await im.decode()}catch(x){URL.revokeObjectURL(src);throw new Error(t('Bu fotoğraf okunamadı, JPEG veya PNG dene'))}
      const c=document.createElement('canvas');c.width=900;c.height=1600;const k=Math.max(900/im.width,1600/im.height),w=im.width*k,h=im.height*k,x=c.getContext('2d');
      x.fillStyle='#04122a';x.fillRect(0,0,900,1600);x.drawImage(im,(900-w)/2,(1600-h)/2,w,h);URL.revokeObjectURL(src);
      SE.blob=await new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error(t('Geçersiz fotoğraf'))),'image/jpeg',.86));SE.kind='img'}
    else if(f.type=='video/mp4'||f.type=='video/webm'){if(f.size>VID_MAX)throw new Error(t('Video en fazla 15 MB olabilir'));SE.blob=f;SE.kind='vid'}
    else throw new Error(t('Sadece fotoğraf veya MP4/WebM video'));
    if(SE.url)URL.revokeObjectURL(SE.url);
    SE.url=URL.createObjectURL(SE.blob);SE.texts=[];SE.strokes=[];SE.hist=[];SE.color='#ffffff';SE.draw=false;
    $('#se').classList.add('on');openEditorUI()
  }catch(x){toast(x.message)}};
addEventListener('keydown',e=>{if(e.key=='Escape'){if($('#sv').classList.contains('on'))closeStories();if($('#se').classList.contains('on'))closeEditor()}});
/* başlangıç */
history.replaceState(null,'');setMob();setLang(LANG,1);
(async()=>{try{S.cfg=await api('GET','/config')}catch(e){$('#login').classList.add('on');$('#err').textContent=e.message;return}
  try{S.me=(await api('GET','/me')).me;await enter(true)}catch(e){$('#login').classList.add('on');if(e.status!=401)$('#err').textContent=e.friendly?e.message:t('Sayfa yüklenirken sorun çıktı, Ctrl+F5 ile yenile.')}})();
</script></body></html>
