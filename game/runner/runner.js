

(function () {
  'use strict';
  const BASE = window.RUNNER_BASE || '';

  const RES = window.RUNNER_RES || (() => {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const S = Math.min((window.innerHeight || 540) * d / 540, (window.innerWidth || 600) * d / 600);
    return Math.max(2, Math.min(4, Math.ceil(S * 1.15)));
  })();
   const PARTS = {"thigh":[-27,-36,52,136],"shin":[-24,-16,44,116],"shorts_leg":[-31,-36,62,84],"upper_arm":[-19,-24,38,96],"forearm":[-14,-14,28,80],"neck":[-16,-164,38,58],"fist":[-12,-5,25,32],"hand_open":[-12,-5,30,50],"torso_back":[-36,-42,66,66],"torso_front":[-34,-164,66,160],"tee_folds_fwd":[-34,-164,66,160],"tee_folds_back":[-34,-164,66,160],"head":[-25,-40,66,70]};

   const LOOKS = {"catalog":{"body":[{"id":"m","label":"Him"},{"id":"f","label":"Her"}],"skin":[{"id":"s1","label":"Tone 1","swatch":"#67321B"},{"id":"s2","label":"Tone 2","swatch":"#8E4B28"},{"id":"s3","label":"Tone 3","swatch":"#9C5935"},{"id":"s4","label":"Tone 4","swatch":"#AB6943"},{"id":"s5","label":"Tone 5","swatch":"#BB7A4D"},{"id":"s6","label":"Tone 6","swatch":"#CA8A59"},{"id":"s7","label":"Tone 7","swatch":"#DC9A6F"},{"id":"s8","label":"Tone 8","swatch":"#EFAE80"}],"hair":[{"id":"fade","label":"Fade"},{"id":"buzz","label":"Buzz"},{"id":"curls","label":"Curls"},{"id":"locs","label":"Locs"},{"id":"braids","label":"Braids"},{"id":"puff","label":"Puff"},{"id":"pony","label":"Ponytail"},{"id":"bun","label":"Bun"}],"facial":[{"id":"none","label":"None"},{"id":"stubble","label":"Stubble"},{"id":"beard","label":"Beard"},{"id":"goatee","label":"Goatee"},{"id":"mustache","label":"Mustache"}],"hat":[{"id":"cap","label":"Cap"},{"id":"visor","label":"Visor"},{"id":"none","label":"None"}],"kit":[{"id":"verde","label":"Verde","swatches":["#1F4D33","#16131C","#F28C28"]},{"id":"mango","label":"Mango","swatches":["#F28C28","#16131C","#FFF6E5"]},{"id":"crema","label":"Crema","swatches":["#FFF6E5","#1F4D33","#F28C28"]},{"id":"noche","label":"Noche","swatches":["#16131C","#16131C","#F28C28"]}]},"default":{"body":"m","skin":"s2","hair":"fade","facial":"beard","hat":"cap","kit":"verde"},"sent":{"skin":{"core":"#A10001","sh":"#A10002","base":"#A10003","mid":"#A10004","lit":"#A10005","hi":"#A10006","spec":"#A10007","rim":"#A10008","bounce":"#A10009","nail":"#A1000A","nailhi":"#A1000B","nail2":"#A1000C","lip":"#A1000D","lipline":"#A1000E","sclera":"#A1000F"},"top":{"core":"#A20001","sh":"#A20002","base":"#A20003","mid":"#A20004","lit":"#A20005","hi":"#A20006","spec":"#A20007","rim":"#A20008","bounce":"#A20009","seam":"#A2000A"},"bot":{"core":"#A30001","sh":"#A30002","base":"#A30003","mid":"#A30004","lit":"#A30005","hi":"#A30006","spec":"#A30007","rim":"#A30008","bounce":"#A30009","seam":"#A3000A"},"acc":{"base":"#A40001","lit":"#A40002","hot":"#A40003","sh":"#A40004"},"hair":{"base":"#A50001","lit":"#A50002","hi":"#A50003","core":"#A50004","rim":"#A50005","sky":"#A50006"}},"skins":{"s1":{"core":"#140B11","sh":"#21131D","base":"#341A13","mid":"#4A2416","lit":"#67321B","hi":"#8D4423","spec":"#C26839","rim":"#F2A571","bounce":"#4A3C6A","nail":"#8A5C4A","nailhi":"#CFA088","nail2":"#8C5C48","lip":"#3A1816","lipline":"#0D0507","sclera":"#AE8C79"},"s2":{"core":"#1E1219","sh":"#2F1D27","base":"#4A291C","mid":"#683723","lit":"#8E4B28","hi":"#B9622E","spec":"#E98D50","rim":"#FFC08A","bounce":"#57487A","nail":"#9A6A55","nailhi":"#E8B79A","nail2":"#A06E58","lip":"#5E2A22","lipline":"#1A0C0E","sclera":"#C7A08A"},"s3":{"core":"#271820","sh":"#3C2730","base":"#593427","mid":"#78442E","lit":"#9C5935","hi":"#C3713F","spec":"#ED9960","rim":"#FFC795","bounce":"#615283","nail":"#A57460","nailhi":"#ECBEA4","nail2":"#AA7761","lip":"#6B322A","lipline":"#231012","sclera":"#CCA893"},"s4":{"core":"#312027","sh":"#4A323A","base":"#6A4033","mid":"#89523B","lit":"#AB6943","hi":"#CD8151","spec":"#F1A670","rim":"#FFCDA0","bounce":"#6B5C8C","nail":"#B07E6B","nailhi":"#EFC5AE","nail2":"#B5806B","lip":"#783B33","lipline":"#2C1417","sclera":"#D1B19E"},"s5":{"core":"#3B282F","sh":"#5A3D45","base":"#7B4E3D","mid":"#9A6344","lit":"#BB7A4D","hi":"#D7925F","spec":"#F5B381","rim":"#FFD5AC","bounce":"#766896","nail":"#BC8A77","nailhi":"#F3CDB9","nail2":"#C08A76","lip":"#87443D","lipline":"#36181C","sclera":"#D7BAA8"},"s6":{"core":"#462F36","sh":"#694950","base":"#8D5B46","mid":"#AC714F","lit":"#CA8A59","hi":"#E1A26D","spec":"#F8C091","rim":"#FFDCB7","bounce":"#81739F","nail":"#C89583","nailhi":"#F7D5C3","nail2":"#CB9480","lip":"#954D46","lipline":"#401C21","sclera":"#DCC2B3"},"s7":{"core":"#51373F","sh":"#79565B","base":"#A1685A","mid":"#C08163","lit":"#DC9A6F","hi":"#ECB286","spec":"#FCCDA2","rim":"#FFE3C3","bounce":"#8D7FA9","nail":"#D4A190","nailhi":"#FBDDCE","nail2":"#D79E8B","lip":"#A55750","lipline":"#4B2126","sclera":"#E2CCBE"},"s8":{"core":"#5E4148","sh":"#8C6468","base":"#B7786A","mid":"#D69373","lit":"#EFAE80","hi":"#F8C59A","spec":"#FFDCB4","rim":"#FFEBD0","bounce":"#9A8CB4","nail":"#E2AE9E","nailhi":"#FFE6DA","nail2":"#E4AA98","lip":"#B6625C","lipline":"#58262C","sclera":"#E8D6CA"}},"kits":{"verde":{"top":{"core":"#081510","sh":"#0F241B","base":"#173A29","mid":"#1F4D33","lit":"#2A6342","hi":"#4A7C4A","spec":"#A9A266","rim":"#E3C68A","bounce":"#384770","seam":"#0E2419"},"bot":{"core":"#040307","sh":"#09080E","base":"#110F16","mid":"#16131C","lit":"#211C27","hi":"#3A2F34","spec":"#86604C","rim":"#C98A5C","bounce":"#2A2745","seam":"#060509"},"acc":{"base":"#F28C28","lit":"#FFB45C","hot":"#FFD9A0","sh":"#A9541A"}},"mango":{"top":{"core":"#3E170F","sh":"#62250F","base":"#A14116","mid":"#D0621C","lit":"#EC7E22","hi":"#F99E3E","spec":"#FFC37C","rim":"#FFE3B2","bounce":"#73476A","seam":"#5A200C"},"bot":{"core":"#040307","sh":"#09080E","base":"#110F16","mid":"#16131C","lit":"#211C27","hi":"#3A2F34","spec":"#86604C","rim":"#C98A5C","bounce":"#2A2745","seam":"#060509"},"acc":{"base":"#EDE1CB","lit":"#FFF6E5","hot":"#FFFFFF","sh":"#9A8F9C"}},"crema":{"top":{"core":"#706678","sh":"#9C91A2","base":"#CDBEAA","mid":"#E7D8C0","lit":"#F7EAD3","hi":"#FFF5E3","spec":"#FFFCF4","rim":"#FFE6BE","bounce":"#8E89B4","seam":"#B4A493"},"bot":{"core":"#081510","sh":"#0F241B","base":"#173A29","mid":"#1F4D33","lit":"#2A6342","hi":"#4A7C4A","spec":"#A9A266","rim":"#E3C68A","bounce":"#384770","seam":"#0E2419"},"acc":{"base":"#F28C28","lit":"#FFB45C","hot":"#FFD9A0","sh":"#A9541A"}},"noche":{"top":{"core":"#040307","sh":"#09080E","base":"#110F16","mid":"#16131C","lit":"#211C27","hi":"#3A2F34","spec":"#86604C","rim":"#C98A5C","bounce":"#2A2745","seam":"#060509"},"bot":{"core":"#040307","sh":"#09080E","base":"#110F16","mid":"#16131C","lit":"#211C27","hi":"#3A2F34","spec":"#86604C","rim":"#C98A5C","bounce":"#2A2745","seam":"#060509"},"acc":{"base":"#F28C28","lit":"#FFB45C","hot":"#FFD9A0","sh":"#A9541A"}}},"hair":{"base":"#140D10","lit":"#3A2A26","hi":"#5A4236","core":"#0A0608","rim":"#9A6A48","sky":"#3A3450"}};

  const LT = 88, LS = 84, LU = 66, LF = 56;
  const SHOULDER = [3, -110], HEADP = [5, -153];
  const SHOE = { W: 90, AX: 0.233, AY: 0.419, SOLE: 0.953 };
  SHOE.H = SHOE.W * 740 / 1180;
  const ANKLE_H = (SHOE.SOLE - SHOE.AY) * SHOE.H;
  const HEEL = [(0.17 - SHOE.AX) * SHOE.W, ANKLE_H];
  const BALL = [(0.74 - SHOE.AX) * SHOE.W, ANKLE_H];
  const TOE = [(0.965 - SHOE.AX) * SHOE.W, (0.78 - SHOE.AY) * SHOE.H];

  const ROCK_R = ((TOE[0] - BALL[0]) ** 2 + (TOE[1] - BALL[1]) ** 2) / (2 * (BALL[1] - TOE[1]));
  const ROCK_C = [BALL[0], BALL[1] - ROCK_R];
  const HIP_LOW = 187;
  const TEE_CUT = -30, TEE_PIV = [-2, -36];
  const NECK_BASE = [3, -117];

  const P = {};
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const wrap = a => ((a % TAU) + TAU) % TAU;

  function loadImg(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('runner: could not load ' + src));
      im.src = src;
    });
  }
  function bake(im, vb, res, far) {
    const [x, y, w, h] = vb;
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * res); c.height = Math.ceil(h * res);
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0, c.width, c.height);
    if (far) turnAway(g, c, x, res, far);
    return { c, x, y, w, h };
  }

  function turnAway(g, c, x, res, far) {
    g.globalCompositeOperation = 'source-atop';
    if (far === 'limb') {
      const gr = g.createLinearGradient((-16 - x) * res, 0, (16 - x) * res, 0);
      gr.addColorStop(0, 'rgba(28,22,46,0.6)'); gr.addColorStop(0.55, 'rgba(28,22,46,0.5)'); gr.addColorStop(1, 'rgba(34,24,44,0.34)');
      g.fillStyle = gr;
    } else g.fillStyle = 'rgba(28,22,46,0.5)';
    g.fillRect(0, 0, c.width, c.height);
  }

  function farCopy(part, res) {
    const c = document.createElement('canvas');
    c.width = part.c.width; c.height = part.c.height;
    const g = c.getContext('2d');
    g.drawImage(part.c, 0, 0);
    turnAway(g, c, part.x, res, 'limb');
    return { c, x: part.x, y: part.y, w: part.w, h: part.h };
  }

  function trim(part) {
    const { c } = part, k = c.width / part.w;
    let d;
    try { d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; } catch (e) { return part; }
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) {
      const row = y * c.width * 4;
      for (let x = 0; x < c.width; x++) if (d[row + x * 4 + 3] > 2) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; y1 = y; }
    }
    if (x1 < 0) return part;
    x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(c.width - 1, x1 + 1); y1 = Math.min(c.height - 1, y1 + 1);
    const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
    o.getContext('2d').drawImage(c, -x0, -y0);
    return { c: o, x: part.x + x0 / k, y: part.y + y0 / k, w: o.width / k, h: o.height / k };
  }
  function softDisc() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(20,14,24,1)'); r.addColorStop(0.45, 'rgba(20,14,24,0.55)'); r.addColorStop(1, 'rgba(20,14,24,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return c;
  }

  function splitAt(part, yCut, feather) {
    const { c, x, y, w, h } = part, k = c.height / h, cy = (yCut - y) * k, fz = feather * k;
    const mk = (stops) => {
      const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
      const g = o.getContext('2d'); g.drawImage(c, 0, 0);
      g.globalCompositeOperation = 'destination-in';
      const gr = g.createLinearGradient(0, 0, 0, c.height);
      for (const [yy, a] of stops) gr.addColorStop(clamp(yy / c.height, 0, 1), 'rgba(0,0,0,' + a + ')');
      g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
      return { c: o, x, y, w, h };
    };
    return [mk([[0, 1], [cy, 1], [cy + 1, 0], [c.height, 0]]), mk([[0, 0], [cy - fz, 0], [cy, 1], [c.height, 1]])];
  }
  const FAR = ['thigh', 'shin', 'shorts_leg', 'upper_arm', 'forearm', 'fist', 'hand_open'];

  const FIELDS = ['body', 'skin', 'hair', 'facial', 'hat', 'kit'];
  const TPL = window.RUNNER_TPL = window.RUNNER_TPL || {};
  const idsOf = k => LOOKS.catalog[k].map(o => o.id);
  function normLook(look) {
    if (typeof look === 'string') return parseLook(look);
    const o = {};
    for (const k of FIELDS) { const v = look && look[k]; o[k] = idsOf(k).indexOf(v) >= 0 ? v : LOOKS.default[k]; }
    return o;
  }
  function lookCode(look) { const n = normLook(look); return FIELDS.map(k => n[k]).join('.'); }
  function parseLook(code) {
    const p = String(code == null ? '' : code).trim().split('.'), o = {};
    FIELDS.forEach((k, i) => { o[k] = p[i]; });
    return normLook(o);
  }
  function randomLook(rand) {
    const r = typeof rand === 'function' ? rand : Math.random, o = {};
    for (const k of FIELDS) { const a = idsOf(k); o[k] = a[Math.min(a.length - 1, Math.floor(clamp(+r() || 0, 0, 1) * a.length))]; }
    if (o.body === 'f') o.facial = 'none';
    return o;
  }
  function bundle(name) {
    if (TPL[name]) return Promise.resolve(TPL[name]);
    if (!bundle.p[name]) bundle.p[name] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = BASE + 'runner/looks/' + name + '.js';
      s.onload = () => TPL[name] ? res(TPL[name]) : rej(new Error('runner: looks/' + name + '.js did not register'));
      s.onerror = () => rej(new Error('runner: could not load looks/' + name + '.js'));
      (document.head || document.documentElement).appendChild(s);
    }).catch(e => { delete bundle.p[name]; throw e; });
    return bundle.p[name];
  }
  bundle.p = {};
  function colorMap(L) {
    const m = {}, S = LOOKS.sent, kit = LOOKS.kits[L.kit];
    const put = (g, ramp) => { for (const k in S[g]) if (ramp[k]) m[S[g][k]] = ramp[k]; };
    put('skin', LOOKS.skins[L.skin]); put('top', kit.top); put('bot', kit.bot); put('acc', kit.acc); put('hair', LOOKS.hair);
    return m;
  }
  const recolor = (txt, map) => txt.replace(/#A[1-5]00[0-9A-F]{2}/g, s => map[s] || s);
  const fnum = v => { const s = v.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' || s === '' ? '0' : s; };
  const EMPTY = { defs: '', body: '', blurs: [] };

  function composeHead(T, st, L) {
    const v = st[L.hat === 'cap' ? 'cap' : 'open'], hd = T.head;
    const fac = (hd.facial && hd.facial[L.body === 'm' ? L.facial : 'none']) || EMPTY, hat = T.hats[L.hat] || EMPTY;
    let vb = hd.vb.slice();
    if (v.vb) {
      const x0 = Math.min(vb[0], v.vb[0]), y0 = Math.min(vb[1], v.vb[1]);
      vb = [x0, y0, Math.max(vb[0] + vb[2], v.vb[0] + v.vb[2]) - x0, Math.max(vb[1] + vb[3], v.vb[1] + v.vb[3]) - y0];
    }
    const frs = [v.back, hd.face, v.under, fac, hd.eyes, hd.ear, v.top, hat];
    const blurs = [...new Set([].concat(...frs.map(x => x.blurs)))].sort((a, b) => a - b);
    const fr = 'filterUnits="userSpaceOnUse" x="' + fnum(vb[0] - 10) + '" y="' + fnum(vb[1] - 10) + '" width="' + fnum(vb[2] + 20) +
      '" height="' + fnum(vb[3] + 20) + '"';
    const defs = blurs.map(b => '<filter id="b' + b.replace('.', '_') + '" ' + fr + '><feGaussianBlur stdDeviation="' + b + '"/></filter>').join('') +
      frs.map(x => x.defs).join('');
    const g = s => '<g clip-path="url(#' + hd.face.clip + ')">' + s + '</g>';
    const inner = hd.face.body + v.under.body + fac.body + hd.eyes.body;
    const body = v.top.body ? v.back.body + g(inner) + v.top.body + g(hd.ear.body) + hat.body : v.back.body + g(inner + hd.ear.body) + hat.body;
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.map(fnum).join(' ') + '" width="' + fnum(vb[2]) + '" height="' +
      fnum(vb[3]) + '"><defs>' + defs + '</defs>' + body + '</svg>', vb };
  }

  const DEPS = { thigh: 'S', shin: 'S', forearm: 'S', fist: 'S', hand_open: 'S', neck: 'S', shorts_leg: 'K', torso_back: 'K',
    tee_folds_fwd: 'K', tee_folds_back: 'K', upper_arm: 'SK', torso_front: 'SK', head: 'SHFC', tail: 'H' };
  function partKey(n, L) {
    const d = DEPS[n] || 'SKHFC';
    return L.body + (d.indexOf('S') >= 0 ? '.' + L.skin : '') + (d.indexOf('K') >= 0 ? '.' + L.kit : '') + (d.indexOf('H') >= 0 ? '.' + L.hair : '') +
      (d.indexOf('F') >= 0 ? '.' + (L.body === 'm' ? L.facial : 'none') : '') + (d.indexOf('C') >= 0 ? '.' + L.hat : '');
  }

  function partText(L, n) {
    const T = TPL[L.body], st = TPL['hair_' + L.hair], map = colorMap(L);
    if (!T || !st) return null;
    if (n === 'head') return recolor(composeHead(T, st, L).svg, map);
    if (n === 'tail') return st.tail ? recolor(st.tail.svg, map) : null;
    return T.parts[n] ? recolor(T.parts[n].svg, map) : null;
  }
  const svgURL = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

  function rigParts() {
    const L = LK.cur;
    if (!L || LK.legacy || !TPL[L.body] || !TPL['hair_' + L.hair]) return null;
    const T = TPL[L.body], st = TPL['hair_' + L.hair], map = colorMap(L), parts = {};
    for (const n in T.parts) parts[n] = { url: svgURL(recolor(T.parts[n].svg, map)), box: T.parts[n].vb.slice() };
    const h = composeHead(T, st, L);
    parts.head = { url: svgURL(recolor(h.svg, map)), box: h.vb.slice() };
    if (st.tail) parts.tail = { url: svgURL(recolor(st.tail.svg, map)), box: st.tail.vb.slice() };
    const tm = LK.meta.tail;
    return { look: lookCode(L), parts, headTop: LK.meta.headTop.slice(), tail: tm ? { root: tm.root.slice(), len: tm.len, rest: tm.rest } : null };
  }
  async function bakeLook(L, live) {
    const t0 = performance.now();
    const [T, st] = await Promise.all([bundle(L.body), bundle('hair_' + L.hair)]);
    if (!live()) return null;
    const map = colorMap(L), hv = st[L.hat === 'cap' ? 'cap' : 'open'];
    const jobs = Object.keys(T.parts).map(n => ({ n, vb: T.parts[n].vb, text: () => recolor(T.parts[n].svg, map) }));
    jobs.push({ n: 'head', text: null });
    if (st.tail) jobs.push({ n: 'tail', vb: st.tail.vb, text: () => recolor(st.tail.svg, map) });
    const out = {}, keys = {}, todo = [];
    for (const j of jobs) {
      j.key = keys[j.n] = partKey(j.n, L);
      if (LK.keys[j.n] === j.key) { for (const k of (LK.from[j.n] || [])) if (P[k]) out[k] = P[k]; }
      else todo.push(j);
    }
    for (const j of todo) {
      if (j.n === 'head') { const h = composeHead(T, st, L); j.vb = h.vb; j.svg = recolor(h.svg, map); }
      else j.svg = j.text();
    }
    const ims = await Promise.all(todo.map(j => loadImg(svgURL(j.svg))));
    if (!live()) return null;
    const t1 = performance.now(), from = {};
    todo.forEach((j, i) => {
      const near = bake(ims[i], j.vb, RES, false), set = {};
      if (j.n === 'torso_front') [set.tee_up, set.tee_lo] = splitAt(near, TEE_CUT, 12);
      else set[j.n] = near;
      if (FAR.indexOf(j.n) >= 0) set[j.n + '_far'] = farCopy(near, RES);
      for (const k in set) out[k] = trim(set[k]);
      from[j.n] = Object.keys(set);
    });
    for (const n in LK.from) if (!from[n] && keys[n] === LK.keys[n]) from[n] = LK.from[n];
    const tail = st.tail ? Object.assign({ root: st.tail.root[L.hat === 'cap' ? 'cap' : 'open'] }, st.tail.rig) : null;
    const ms = { total: performance.now() - t0, load: t1 - t0, raster: performance.now() - t1, baked: todo.map(j => j.n) };
    return { parts: out, keys, from, meta: { headTop: hv.headTop || [-1, -33], tail }, ms };
  }
  async function legacyBake() {
    const names = Object.keys(PARTS), out = {};
    const ims = await Promise.all(names.map(n => loadImg(BASE + 'runner/parts/' + n + '.svg')));
    names.forEach((n, i) => {
      const near = bake(ims[i], PARTS[n], RES, false);
      if (n === 'torso_front') [out.tee_up, out.tee_lo] = splitAt(near, TEE_CUT, 12); else out[n] = near;
      if (FAR.indexOf(n) >= 0) out[n + '_far'] = farCopy(near, RES);
    });
    for (const k in out) out[k] = trim(out[k]);
    return out;
  }
  const STAGE = {};
  const LK = { cur: null, want: null, busy: false, waiters: [], flight: null, keys: {}, from: {}, version: 0, legacy: false,
    meta: { headTop: [-1, -33], tail: null } };
  function swapIn(res, L) {
    for (const k of Object.keys(P)) if (!(k in res.parts) && !(k in STAGE)) delete P[k];
    Object.assign(P, STAGE, res.parts);
    LK.keys = res.keys; LK.from = res.from; LK.meta = res.meta; LK.cur = L; LK.version++;
    Runner.lastBake = { look: lookCode(L), ms: Math.round(res.ms.total), load: Math.round(res.ms.load), raster: Math.round(res.ms.raster), baked: res.ms.baked };
    for (const k in MEM) MEM[k].hair = null;
    try { window.dispatchEvent(new CustomEvent('runner-look', { detail: { look: Object.assign({}, L), code: lookCode(L) } })); } catch (e) {   }
  }
  async function pump() {
    if (LK.busy) return;
    LK.busy = true;
    while (LK.want && !(LK.cur && lookCode(LK.cur) === lookCode(LK.want))) {
      const target = LK.want, code = lookCode(target);
      const live = () => !!LK.want && lookCode(LK.want) === code;
      let res = null;
      try { res = await bakeLook(target, live); if (res) await SHOE_READY; }
      catch (e) { console.warn(String(e && e.message || e)); if (live()) LK.want = LK.cur; continue; }
      if (res && live()) swapIn(res, target);
    }
    LK.busy = false;
    const w = LK.waiters, look = LK.cur ? Object.assign({}, LK.cur) : null;
    LK.waiters = []; LK.flight = null;
    for (const r of w) r(look);
  }

  function setLook(look) {
    if (LK.legacy) return Promise.resolve(Object.assign({}, LK.cur));
    const L = normLook(look), code = lookCode(L);
    if (LK.flight && LK.want && lookCode(LK.want) === code) return LK.flight;
    LK.want = L;
    if (LK.cur && lookCode(LK.cur) === code) { LK.flight = null; return Promise.resolve(Object.assign({}, LK.cur)); }
    LK.flight = new Promise(res => LK.waiters.push(res));
    pump();
    return LK.flight;
  }
  const SHOE_READY = loadImg(BASE + 'shoe.svg').then(shoe => {
    const sv = [-SHOE.AX * SHOE.W, -SHOE.AY * SHOE.H, SHOE.W, SHOE.H];
    const sres = Math.max(RES * 1.5, 4);
    STAGE.shoe = trim(bake(shoe, sv, sres, false));
    STAGE.shoe_far = trim(bake(shoe, sv, sres, true));
    STAGE.disc = { c: softDisc() };
  });
  const T_LOAD = performance.now();
  LK.want = window.RUNNER_LOOK ? normLook(window.RUNNER_LOOK) : Object.assign({}, LOOKS.default);
  pump();
  const ready = (async () => {
    await SHOE_READY;
    await new Promise(res => { if (!LK.busy) res(); else LK.waiters.push(res); });
    if (!LK.cur) {
      const parts = await legacyBake();
      Object.assign(P, STAGE, parts);
      LK.cur = Object.assign({}, LOOKS.default); LK.legacy = true; Runner.features.looks = false;
    }
    Runner.bakeMs = Math.round(performance.now() - T_LOAD);
    return true;
  })();

  let M0 = [1, 0, 0, 1, 0, 0];
  function put(ctx, part, x, y, ang, sx, sy) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const [a, b, cc, d, e, f] = M0;
    sx = sx || 1; sy = sy || 1;

    const ra = c * sx, rb = s * sx, rc = -s * sy, rd = c * sy;
    ctx.setTransform(a * ra + cc * rb, b * ra + d * rb, a * rc + cc * rd, b * rc + d * rd, a * x + cc * y + e, b * x + d * y + f);
    ctx.drawImage(part.c, part.x, part.y, part.w, part.h);
  }

  function putAbout(ctx, part, x, y, ang, sx, sy, ox, oy) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const [a, b, cc, d, e, f] = M0;
    const ra = c * sx, rb = s * sx, rc = -s * sy, rd = c * sy;
    ctx.setTransform(a * ra + cc * rb, b * ra + d * rb, a * rc + cc * rd, b * rc + d * rd, a * x + cc * y + e, b * x + d * y + f);
    ctx.drawImage(part.c, part.x - ox, part.y - oy, part.w, part.h);
  }
  const rot = (px, py, a) => [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)];

  function ik(hx, hy, ax, ay) {
    let dx = ax - hx, dy = ay - hy, d = Math.hypot(dx, dy);
    const maxD = (LT + LS) * 0.999;
    const used = d / (LT + LS);
    if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
    const phi = Math.atan2(dx, dy);
    const a1 = Math.acos(clamp((LT * LT + d * d - LS * LS) / (2 * LT * d), -1, 1));
    const al = phi + a1;
    const kx = hx + Math.sin(al) * LT, ky = hy + Math.cos(al) * LT;
    const be = Math.atan2(hx + dx - kx, hy + dy - ky);
    return [al, be, used];
  }

  function plantedAnkle(px, py, piv, tilt) {
    const ox = -piv[0], oy = -piv[1];
    const [rx, ry] = rot(ox, oy, tilt);
    return [px + rx, py + ry];
  }

  function gait(s) {
    const v = Math.max(0, s.speed || 0), T = clamp(s.beatInterval || 0.62, 0.2, 2);
    const pace = clamp(s.pace || 0, 0, 1);
    const jog = 1 - sstep(60, 230, v);
    const Lmax = 118 + 26 * pace;
    const Dmax = 0.8;
    const Ts = v > 1 ? Math.min(Dmax * T, Lmax / v) : Dmax * T;
    const D = clamp(Ts / T, 0.3, Dmax);
    const Ls = v * D * T;
    const amp = lerp(3 + 6 * pace, 3, jog);
    const lean = lerp(0.07 + 0.11 * pace, 0.04, jog);
    const aTD = clamp(0.3 * Ls + 6, 6, 40);
    return { v, T, pace, jog, D, Ls, amp, lean, aTD,
      tiltTD: -0.2 * (1 - 0.45 * pace) * (1 - 0.4 * jog),
      tiltTO: (0.42 + 0.3 * pace) * (1 - 0.35 * jog) };
  }
  function hipHeight(g, u) {
    return HIP_LOW + g.amp * (1 - Math.cos(TAU * (u - g.D / 2)));
  }

  function planHeel(g, tau, hipX) {
    return hipX + g.aTD + HEEL[0] - g.v * tau;
  }
  function stanceFoot(g, tau, hipX, ground, gxOver) {
    const Ts = g.D * g.T;
    const k = clamp(tau / Ts, 0, 1);
    const gx = gxOver != null ? gxOver : planHeel(g, tau, hipX);
    const k1 = 0.16, k2 = lerp(0.5, 0.58, g.jog);
    let tilt, ankle;
    if (k < k1) {
      tilt = g.tiltTD * Math.pow(1 - k / k1, 1.6);
      ankle = plantedAnkle(gx, ground, HEEL, tilt);
    } else if (k < k2) {
      tilt = 0; ankle = plantedAnkle(gx, ground, HEEL, 0);
    } else {
      const q = (k - k2) / (1 - k2);
      tilt = g.tiltTO * Math.pow(q, 1.35);
      const cx = gx + BALL[0] - HEEL[0] + ROCK_R * tilt, cy = ground - ROCK_R;
      const [rx, ry] = rot(-ROCK_C[0], -ROCK_C[1], tilt);
      ankle = [cx + rx, cy + ry];
    }
    return { ankle, tilt };
  }

  const SW_FAST = [[0.2, -0.18, 2.35, 0.1], [0.44, 0.38, 2.5, 0.05], [0.66, 0.88, 1.6, -0.2], [0.87, 0.62, 0.55, -0.2]];
  const SW_JOG = [[0.2, -0.22, 1.65, 0.15], [0.42, 0.2, 1.9, 0.0], [0.66, 0.5, 1.3, -0.15], [0.87, 0.38, 0.5, -0.12]];
  function hermite(keys, u, i) {
    let j = 0;
    while (j < keys.length - 2 && u > keys[j + 1][0]) j++;
    const k0 = keys[Math.max(0, j - 1)], k1 = keys[j], k2 = keys[j + 1], k3 = keys[Math.min(keys.length - 1, j + 2)];
    const h = k2[0] - k1[0], t = clamp((u - k1[0]) / h, 0, 1);
    const m1 = (k2[i] - k0[i]) / Math.max(1e-6, k2[0] - k0[0]) * h, m2 = (k3[i] - k1[i]) / Math.max(1e-6, k3[0] - k1[0]) * h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * k1[i] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * k2[i] + (t3 - t2) * m2;
  }

  function legPose(g, lp, hipX, hipYfn, ground, ls, G, mod) {
    const Ts = g.D * g.T, sw0 = Math.PI * g.D, p = wrap(lp);
    if (p < sw0) {
      const tau = p / Math.PI * g.T;
      let gx = planHeel(g, tau, hipX);
      if (ls) {

        const idx = Math.floor(lp / TAU);
        if (ls.idx !== idx) { ls.idx = idx; ls.anchor = gx + G; }
        const pinned = ls.anchor - G;
        ls.off = pinned - gx;
        gx = pinned;
      }
      const f = stanceFoot(g, tau, hipX, ground, gx);
      const hy = hipYfn(p / Math.PI);
      const [al, be, used] = ik(hipX, hy, f.ankle[0], f.ankle[1]);
      return { al, be, tilt: f.tilt, stance: true, used, hy };
    }

    const u = (p - sw0) / (TAU - sw0);
    const off = ls && ls.off ? ls.off : 0;
    const fTO = stanceFoot(g, Ts, hipX, ground, planHeel(g, Ts, hipX) + off), hTO = hipYfn(g.D);
    const fTD = stanceFoot(g, 0, hipX, ground), hTD = hipYfn(0);
    const [a0, b0] = ik(hipX, hTO, fTO.ankle[0], fTO.ankle[1]);
    const [a1, b1] = ik(hipX, hTD, fTD.ankle[0], fTD.ankle[1]);
    const pf0 = fTO.tilt + b0, pf1 = fTD.tilt + b1;
    const keys = [[0, a0, a0 - b0, pf0]];
    for (let i = 0; i < SW_FAST.length; i++) {
      const A = SW_FAST[i], J = SW_JOG[i], w = g.jog, pc = 0.35 + 0.65 * g.pace;
      keys.push([A[0], lerp(lerp(J[1], A[1], pc), J[1], w), lerp(lerp(J[2], A[2], pc), J[2], w), lerp(A[3], J[3], w)]);
    }
    const rf = clamp(g.Ls / 70, 0, 1);
    if (rf < 1) { keys[3][1] = lerp(0.45, keys[3][1], rf); keys[3][2] = lerp(1.3, keys[3][2], rf); keys[4][1] = lerp(0.35, keys[4][1], rf); keys[4][2] = lerp(0.85, keys[4][2], rf); }
    keys.push([1, a1, a1 - b1, pf1]);
    if (mod) for (let i = 1; i < keys.length - 1; i++) { keys[i][1] += mod.thigh[i - 1]; keys[i][2] += mod.knee[i - 1]; }
    let al = hermite(keys, u, 1), kf = Math.max(0.05, hermite(keys, u, 2)), pf = hermite(keys, u, 3);
    const hy = hipYfn(((p / Math.PI) % 1));

    const need = ground - Math.max((4 + 8 * (1 - g.pace)) * Math.pow(Math.sin(Math.PI * u), 2), u > 0.8 ? 30 * (1 - u) : 0, u < 0.2 ? 45 * u : 0);
    for (let it = 0; it < 6; it++) {
      const b = al - kf, tl = pf - b, ay = hy + LT * Math.cos(al) + LS * Math.cos(b);
      const low = ay + Math.max(rot(TOE[0], TOE[1], tl)[1], rot(HEEL[0], HEEL[1], tl)[1], rot(BALL[0], BALL[1], tl)[1]) - need;
      if (low <= 0) break;

      if (b < 0) { const d = low / 70; kf += d; pf -= d; } else al += low / 90;
    }
    const be = al - kf;
    return { al, be, tilt: pf - be, stance: false, used: 0, hy };
  }

  const MEM = {};
  function memory(s) {
    if (s.static || s.t == null) return null;
    const key = s.key || 'main', t = s.t;
    let m = MEM[key];
    if (!m || !(t >= m.t) || t - m.t > 0.25) { m = MEM[key] = { t, dt: 0, G: 0, legs: [{}, {}] }; return m; }
    m.dt = t - m.t;
    m.G += Math.max(0, s.speed || 0) * (t - m.t); m.t = t;
    return m;
  }

  function heelSpotOf(ax, ay, tilt) {
    if (tilt <= 0) return ax - rot(-HEEL[0], -HEEL[1], tilt)[0];
    return ax - rot(-ROCK_C[0], -ROCK_C[1], tilt)[0] - ROCK_R * tilt - (BALL[0] - HEEL[0]);
  }
  function footAt(gx, tilt, ground) {
    if (tilt <= 0) return plantedAnkle(gx, ground, HEEL, tilt);
    const [rx, ry] = rot(-ROCK_C[0], -ROCK_C[1], tilt);
    return [gx + BALL[0] - HEEL[0] + ROCK_R * tilt + rx, ground - ROCK_R + ry];
  }
  const STEP_T = 0.2;
  const CROUCH_FEET = [{ dx: -50, tilt: 0.5 }, { dx: 30, tilt: 0.08 }];
  const curTilt = (F, t) => lerp(F.tilt0, F.tiltTo, sstep(0, 0.22, t - F.tiltT0));

  function plantFeet(m, tg, runLegs, hipX, ground, t, G, tol, lead, byPosition) {
    if (!m) return tg.map(T => { const a = footAt(hipX + T.dx + HEEL[0], T.tilt, ground); return { ax: a[0], ay: a[1], tilt: T.tilt, down: true }; });
    let PL = m.plant;
    if (!PL) {
      PL = m.plant = { swap: byPosition && runLegs[0].ax > runLegs[1].ax, feet: [] };
      for (let i = 0; i < 2; i++) {
        const L = runLegs[i];
        PL.feet[i] = L.onGround
          ? { anchor: heelSpotOf(L.ax, L.ay, L.tilt) + G, tilt0: L.tilt, tiltT0: t, tiltTo: L.tilt, landT: t - 1, step: null }
          : { anchor: null, tilt0: L.tilt, tiltT0: t, tiltTo: L.tilt, landT: t - 1, step: { t0: t, x: L.ax - hipX, y: L.ay, tilt: L.tilt } };
      }
    }
    if (!byPosition) PL.swap = false;
    const out = [];
    for (let i = 0; i < 2; i++) {
      const F = PL.feet[i], T = tg[PL.swap ? 1 - i : i];
      const gxT = hipX + T.dx + HEEL[0];
      let ax, ay, tilt;
      if (F.step) {
        const k = (t - F.step.t0) / STEP_T;
        const land = gxT + lead;
        if (k >= 1) { F.anchor = land + G; F.tilt0 = F.tiltTo = T.tilt; F.tiltT0 = t; F.landT = t; F.step = null; }
        else {
          const e = sstep(0, 1, k), to = footAt(land, T.tilt, ground), fx = hipX + F.step.x;
          const arc = (8 + 0.12 * Math.abs(to[0] - fx)) * Math.sin(Math.PI * k);
          ax = lerp(fx, to[0], e); ay = lerp(F.step.y, to[1], e) - arc;
          tilt = lerp(F.step.tilt, T.tilt, e) - 0.2 * Math.sin(Math.PI * k);
        }
      }
      if (!F.step) {
        if (Math.abs(F.tiltTo - T.tilt) > 1e-3) { F.tilt0 = curTilt(F, t); F.tiltT0 = t; F.tiltTo = T.tilt; }
        tilt = curTilt(F, t);
        const gx = F.anchor - G, other = PL.feet[1 - i], a = footAt(gx, tilt, ground);
        ax = a[0]; ay = a[1];
        if (Math.abs(gx - gxT) > tol && !other.step && t - F.landT > 0.1 && t - other.landT > 0.06) F.step = { t0: t, x: ax - hipX, y: ay, tilt };
      }
      out.push({ ax, ay, tilt, down: !F.step });
    }
    return out;
  }

  function ik2(px, py, tx, ty, L1, L2, sign) {
    let dx = tx - px, dy = ty - py, d = Math.hypot(dx, dy) || 1e-6;
    const maxD = (L1 + L2) * 0.999, minD = Math.abs(L1 - L2) + 2;
    if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
    if (d < minD) { dx *= minD / d; dy *= minD / d; d = minD; }
    const al = Math.atan2(dx, dy) + sign * Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const kx = px + Math.sin(al) * L1, ky = py + Math.cos(al) * L1;
    return [al, Math.atan2(px + dx - kx, py + dy - ky)];
  }
  const hang = (a, e, w) => ({ a, e, w: w || 0.05, open: 0, su: 1, sf: 1 });
  function blendArm(A, B, k) {
    if (k <= 0) return A; if (k >= 1) return Object.assign({ sw: A.sw }, B);
    return { a: lerp(A.a, B.a, k), e: lerp(A.e, B.e, k), w: lerp(A.w, B.w, k), open: lerp(A.open || 0, B.open || 0, k),
      su: lerp(A.su || 1, B.su || 1, k), sf: lerp(A.sf || 1, B.sf || 1, k), sw: A.sw };
  }

  function armFK(sh, A) {
    const su = A.su || 1, sf = A.sf || 1;
    const ex = sh[0] + Math.sin(A.a) * LU * su, ey = sh[1] + Math.cos(A.a) * LU * su;
    const fa = A.a + A.e, wx = ex + Math.sin(fa) * LF * sf, wy = ey + Math.cos(fa) * LF * sf;
    const ha = fa + A.w, o = sstep(0.3, 0.7, A.open || 0);
    const [gx, gy] = rot(o > 0.5 ? 1.5 : 1, o > 0.5 ? 13 : 15, -ha);
    return { sx: sh[0], sy: sh[1], ex, ey, fa, wx, wy, ha, o, gx: wx + gx, gy: wy + gy, su, sf, a: A.a };
  }

  function hipHand(F, far) {
    const sh = far ? F.shF : F.shN;
    const el = F.tw(far ? -33 : -29, far ? -57 : -60), wr = F.tw(far ? 0 : 3, -38);
    const a = Math.atan2(el[0] - sh[0], el[1] - sh[1]), fa = Math.atan2(wr[0] - el[0], wr[1] - el[1]);
    return { a, e: fa - a, w: 0.35, open: 0, su: clamp(Math.hypot(el[0] - sh[0], el[1] - sh[1]) / LU, 0.55, 1.05),
      sf: clamp(Math.hypot(wr[0] - el[0], wr[1] - el[1]) / LF, 0.45, 1.05) };
  }

  function breath(pt) {
    const a = Math.min(pt, 8), ph = TAU * (0.58 * a - 0.0125 * a * a + 0.38 * Math.max(0, pt - 8));
    return lerp(1, 0.45, sstep(0, 7, pt)) * Math.sin(ph);
  }
  const POSES = {
    stand: {
      plant: [{ dx: -17, tilt: 0 }, { dx: 12, tilt: 0 }],
      body(pt) {
        const b = breath(pt), sway = Math.sin(TAU * pt / 3.8);
        return { hipH: 200.6 - 1.4 * (0.5 + 0.5 * Math.sin(TAU * pt / 1.9)), hipDX: 2.2 * sway, lean: 0.1 + 0.018 * b,
          head: 0.16 + 0.035 * b, shDY: -1.8 * b, chest: 1 + 0.012 * b };
      },
      arms(F, pt, carry) { return [hipHand(F, true), carry ? hang(0.03, 0.2) : hipHand(F, false)]; },
    },
    lookUp: {
      plant: [{ dx: -15, tilt: 0 }, { dx: 14, tilt: 0 }],
      body(pt) {
        const b = breath(pt + 6) * 0.5;
        return { hipH: 200.8, hipDX: -1.5, lean: -0.035, head: -0.5 + 0.025 * Math.sin(TAU * pt / 2.7), shDY: -0.8 * b, chest: 1 + 0.006 * b };
      },
      arms(F, pt, carry) {
        if (carry) return [hang(0.05, 0.3), hang(0.03, 0.2)];

        const k = sstep(0.3, 1.4, pt), d = 0.04 * Math.sin(TAU * pt / 3.1);
        return [hang(0.05, 0.3), { a: lerp(0.05, 0.72, k) + d, e: lerp(0.3, 1.02, k), w: lerp(0.05, 0.18, k), open: k, su: 1, sf: 1 }];
      },
    },
    handoff: {
      plant: [{ dx: -12, tilt: 0.12 }, { dx: 26, tilt: 0 }],
      body(pt) {
        const k = sstep(0.05, 0.75, pt);
        return { hipH: 196 - 3 * k, hipDX: 3.5 * k, lean: 0.06 + 0.1 * k, head: 0.12 + 0.1 * k, shDY: 0, chest: 1 };
      },
      arms(F, pt, carry) {
        const k = sstep(0.05, 0.75, pt);
        return [hang(0.05 - 0.1 * k, 0.32),
          { a: lerp(0.12, 1.12, k), e: lerp(0.45, 0.38, k), w: lerp(0.05, -0.1, k), open: carry ? 0 : k, su: 1, sf: 1 }];
      },
    },
    catch: {
      plant: null,
      body() { return { lean: -0.05, head: -0.35 }; },
      arms(F, pt, carry) {
        const k = sstep(0.35, 0.8, pt), grab = 1 - sstep(0.18, 0.3, pt);
        const up = { a: 2.4 - 0.6 * k, e: 0.15 + 0.6 * k, w: -0.08, open: grab, su: 1, sf: 1 };
        const low = { a: -0.55, e: 0.95, w: 0.1, open: 0, su: 1, sf: 1 };
        return carry ? [up, hang(0.32, 0.55)] : [low, up];
      },
    },
  };

  const BAGS = [];
  function bagSprite(fill) {
    const f = Math.round(clamp(fill, 0, 12));
    if (BAGS[f]) return BAGS[f];
    const k = f / 12, R = Math.max(RES, 3), bul = 1 + 7 * k;
    const x0 = -34, y0 = -6, w = 68, h = 96;
    const c = document.createElement('canvas'); c.width = Math.ceil(w * R); c.height = Math.ceil(h * R);
    const g = c.getContext('2d');
    g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R);
    const top = 8, bot = 84 - 2 * k, wt = 19, wb = 23 + bul;
    const body = new Path2D();
    body.moveTo(-wt, top); body.bezierCurveTo(-wt - bul * 0.6, 30, -wb - 1, 62, -wb + 2, bot - 2);
    body.quadraticCurveTo(-wb + 3, bot + 2, -wb + 8, bot + 2); body.lineTo(wb - 8, bot + 2);
    body.quadraticCurveTo(wb - 3, bot + 2, wb - 2, bot - 2); body.bezierCurveTo(wb + 1, 62, wt + bul * 0.6, 30, wt, top); body.closePath();
    let gr = g.createLinearGradient(-wb, 0, wb, 0);
    gr.addColorStop(0, '#6E4E3A'); gr.addColorStop(0.3, '#9A7150'); gr.addColorStop(0.62, '#BF8F5E'); gr.addColorStop(0.9, '#DDAE76'); gr.addColorStop(1, '#F2C68C');
    g.fillStyle = gr; g.fill(body);
    g.save(); g.clip(body);
    gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(40,24,30,0.25)'); gr.addColorStop(0.25, 'rgba(40,24,30,0)');
    gr.addColorStop(0.8, 'rgba(40,24,30,0)'); gr.addColorStop(1, 'rgba(40,24,30,0.3)');
    g.fillStyle = gr; g.fillRect(-40, 0, 80, 90);
    for (let i = 0; i < f; i++) {
      const r = Math.floor(i / 4), cI = i % 4, mx = -15 + cI * 10 + (r % 2) * 5 - (r === 2 ? 2 : 0), my = bot - 11 - r * 13.5, rad = 8.5;
      const hl = g.createRadialGradient(mx + 2.5, my - 3, 0, mx + 2.5, my - 3, rad);
      hl.addColorStop(0, 'rgba(255,228,175,0.45)'); hl.addColorStop(1, 'rgba(255,228,175,0)');
      g.fillStyle = hl; g.beginPath(); g.arc(mx + 2.5, my - 3, rad, 0, TAU); g.fill();
      const sd = g.createRadialGradient(mx - 2.5, my + 4, 0, mx - 2.5, my + 4, rad);
      sd.addColorStop(0, 'rgba(60,34,26,0.36)'); sd.addColorStop(1, 'rgba(60,34,26,0)');
      g.fillStyle = sd; g.beginPath(); g.arc(mx - 2, my + 3.5, rad, 0, TAU); g.fill();
    }
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(70,44,30,0.45)'; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(-wt + 5, top + 4); g.quadraticCurveTo(-wb + 6 - bul * 0.3, 50, -wb + 9, bot - 3); g.stroke();
    g.beginPath(); g.moveTo(wt - 5, top + 4); g.quadraticCurveTo(wb - 6 + bul * 0.3, 50, wb - 9, bot - 3); g.stroke();
    g.beginPath(); g.moveTo(-wb + 6, bot - 7); g.lineTo(wb - 6, bot - 7); g.stroke();
    g.strokeStyle = 'rgba(255,224,170,0.35)'; g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(wt - 3.8, top + 4); g.quadraticCurveTo(wb - 4.8 + bul * 0.3, 50, wb - 7.8, bot - 3); g.stroke();
    g.strokeStyle = 'rgba(70,44,30,0.22)'; g.lineWidth = 0.6;
    for (const [ax, ay, bx, by] of [[-10, 20, -4, 30], [6, 16, 12, 24], [-2, 40, 5, 47], [-15, 52, -9, 58], [9, 58, 15, 50]]) {
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    }
    g.strokeStyle = 'rgba(255,214,150,0.55)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(wt + 0.3, top + 2); g.bezierCurveTo(wt + bul * 0.6 + 0.3, 30, wb + 1.3, 62, wb - 1.6, bot - 2); g.stroke();
    g.restore();

    const fold = (yA, yB, wA, wB, c0, c1) => {
      const p = new Path2D(); p.moveTo(-wA, yA); p.lineTo(wA, yA); p.lineTo(wB, yB); p.lineTo(-wB, yB); p.closePath();
      const q = g.createLinearGradient(-wB, 0, wB, 0); q.addColorStop(0, c0); q.addColorStop(1, c1); g.fillStyle = q; g.fill(p);
      g.strokeStyle = 'rgba(60,38,26,0.5)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-wB, yB); g.lineTo(wB, yB); g.stroke();
    };
    fold(-3.5, 3.5, 13, 15.5, '#7E5A40', '#D4A56E');
    fold(3, 9.5, 15.5, 18.5, '#8C6446', '#E2B57C');
    g.strokeStyle = 'rgba(255,230,180,0.5)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-12.5, -3.3); g.lineTo(12.5, -3.3); g.stroke();
    BAGS[f] = { c, x: x0, y: y0, w, h };
    return BAGS[f];
  }
  const BAG_K = 0.56;
  function drawBag(ctx, gx, gy, fill, t, swing, bounce, ripes, scale) {
    if (window.Props && typeof window.Props.drawBagCarry === 'function') {
      ctx.setTransform(M0[0], M0[1], M0[2], M0[3], M0[4], M0[5]);
      window.Props.drawBagCarry(ctx, gx, gy, fill, t, { swing, bounce, ripes, scale: scale || 1 });
      return;
    }

    putAbout(ctx, bagSprite(fill), gx, gy, -0.3 * swing, BAG_K, BAG_K * (1 + 0.025 * bounce), 0, 0);
  }

  function solve(s) {
    const g = gait(s), t = s.t || 0;
    const ground = s.ground, lift = Math.max(0, s.h || 0), phase = s.phase || 0;
    const hipX0 = s.x - 6;
    const mem = memory(s);
    const stum = clamp((s.stumble || 0) / 0.45, 0, 1), sq = 1 - stum;
    const sEnv = stum > 0 ? Math.sin(Math.PI * sq) : 0;
    const J = s.air ? sstep(0, 75, lift) : 0;
    const rise = sstep(-260, 260, s.vy || 0);
    const carry = s.carry ? { fill: clamp(+s.carry.fill || 0, 0, 12), ripes: s.carry.ripes || null, scale: +s.carry.scale || 1 } : null;
    const fillK = carry ? carry.fill / 12 : 0;

    let cr = clamp(s.crouch || 0, 0, 1);
    if (mem) {
      const prev = mem.crouch || 0;
      if (cr < prev) cr = Math.max(cr, prev - mem.dt / 0.16);
      mem.crouch = cr;
      if (cr > 0 && !mem.crMode) mem.crMode = g.v < 60 ? 'still' : 'run';
      if (cr <= 0) mem.crMode = null;
    }
    const still = mem ? mem.crMode === 'still' : g.v < 60;
    const cE = cr * cr * (3 - 2 * cr);
    const cRun = still ? 0 : cE, cStill = still ? cE : 0;
    const trem = sstep(0.9, 1, s.crouch || 0) * (1 - J);
    const tr = f => trem * Math.sin(t * TAU * f);

    const pose = POSES[s.pose] ? s.pose : null, poseT = Math.max(0, s.poseT || 0);
    let prev = null, prevT = 0, wPrev = 0;
    if (mem) {
      if (pose !== mem.pose) { mem.prevPose = mem.pose; mem.prevPoseT = mem.poseT || 0; mem.switchT = t; mem.pose = pose; }
      mem.poseT = poseT;
      if (mem.prevPose && t - mem.switchT < 0.25 + 1e-6) {
        prev = mem.prevPose; prevT = mem.prevPoseT + (t - mem.switchT);
        wPrev = pose ? 1 : 1 - sstep(0, 0.25, t - mem.switchT);
      } else mem.prevPose = null;
    }
    const wCur = pose ? sstep(0, 0.25, poseT) : 0;
    const PP = prev && POSES[prev], PC = pose && POSES[pose];

    const beatU = (phase / Math.PI) % 1;
    const hipYfn = u => ground - lift - hipHeight(g, ((u % 1) + 1) % 1) + 7 * sEnv + 30 * cRun;
    let lean = g.lean + 0.015 * Math.sin(TAU * (beatU - g.D * 0.5)) + 0.3 * sEnv + 0.05 * sEnv * Math.sin(t * 30) + 0.025 * fillK;
    lean = lerp(lean, 0.06 + 0.04 * (1 - rise), J);
    const B = { hipY: hipYfn(beatU), hipDX: 0, lean, head: lean * 0.28 - 0.02 * Math.cos(TAU * (beatU - g.D / 2)) + 0.12 * sEnv * Math.sin(sq * 18),
      shDY: 0, chest: 1 };
    if (cRun > 0) { B.lean += 0.32 * cRun; B.head = lerp(B.head, 0.0, cRun); }
    if (cStill > 0) {
      B.hipY = lerp(B.hipY, ground - lift - 128 + 0.7 * tr(21), cStill);
      B.lean = lerp(B.lean, 0.62 + 0.008 * tr(15), cStill); B.head = lerp(B.head, -0.05 + 0.01 * tr(13), cStill);
    }
    const bodyBlend = (Pd, pt, w) => {
      if (!Pd || w <= 0) return;
      const b = Pd.body(pt);
      if (b.hipH != null) B.hipY = lerp(B.hipY, ground - lift - b.hipH, w);
      for (const k of ['hipDX', 'lean', 'head', 'shDY', 'chest']) if (b[k] != null) B[k] = lerp(B[k], b[k], w);
    };
    bodyBlend(PP, prevT, wPrev);
    bodyBlend(PC, poseT, wCur);
    const hipX = hipX0 + B.hipDX, hipY = B.hipY;

    const legs = [];

    const mod = cRun > 0 ? { thigh: [0, 0.05, 0.16, 0.1].map(v => v * cRun), knee: [-0.45, 0.05, 0.38, 0.22].map(v => v * cRun) } : null;
    for (const far of [true, false]) {
      const lp = phase + (far ? Math.PI : 0), p = wrap(lp);
      const pelvis = 1.8 * Math.cos(phase) * (far ? -1 : 1) * (1 - g.jog * 0.5);
      const hx = hipX0 + (far ? -2 : 1.5) + pelvis;
      const L = legPose(g, lp, hx, hipYfn, ground - lift, mem ? mem.legs[far ? 0 : 1] : null, mem ? mem.G : 0, mod);
      if (J > 0) {
        const tuck = far ? [0.35, 2.25, 0.5] : [1.2, 2.0, 0.25];
        const reach = far ? [-0.25, 1.25, 0.45] : [0.55, 0.45, -0.05];
        const al = lerp(reach[0], tuck[0], rise), kf = lerp(reach[1], tuck[1], rise), pf = lerp(reach[2], tuck[2], rise);
        L.al = lerp(L.al, al, J); const be = lerp(L.be, al - kf, J); L.tilt = lerp(L.tilt, pf - (al - kf), J); L.be = be;
      }
      L.far = far; L.hx = hx; L.hy = hipYfn(beatU);
      L.kx = L.hx + Math.sin(L.al) * LT; L.ky = L.hy + Math.cos(L.al) * LT;
      L.ax = L.kx + Math.sin(L.be) * LS; L.ay = L.ky + Math.cos(L.be) * LS;
      L.onGround = L.stance && lift < 0.5;
      L.p = p;
      legs.push(L);
    }

    const plantOf = Pd => Pd && Pd.plant;
    const wantCrouch = still && cr > 0 && lift < 0.5;
    const want = !!plantOf(PC) || wantCrouch;

    const wIn = mem ? 1 : plantOf(PC) ? sstep(0, 0.1, poseT) : wantCrouch ? sstep(0, 0.12, cr) : 0;
    let PL = mem ? mem.plant : null;
    if (want || PL) {
      const tg = plantOf(PC) || (wantCrouch ? CROUCH_FEET : (PL && PL.tg) || CROUCH_FEET);
      const byPos = !plantOf(PC) && (wantCrouch || (PL && PL.byPos));
      const tol = byPos ? 30 : 14, lead = byPos ? Math.min(24, g.v * 0.1) : 0;
      const feet = plantFeet(mem, tg, legs, hipX, ground, t, mem ? mem.G : 0, tol, lead, byPos);
      PL = mem ? mem.plant : null;
      const wl = [wIn, wIn];
      if (PL) {
        PL.tg = tg; PL.byPos = byPos;
        if (want) PL.exit = null;
        else {
          if (!PL.exit) PL.exit = { t0: t, rel: [null, null] };
          for (let i = 0; i < 2; i++) {
            const Fd = PL.feet[i];
            if (PL.exit.rel[i] == null) {
              if (lift > 0.5 && !Fd.step) {

                const gx = Fd.anchor - mem.G, hx = hipX + (i ? 1.5 : -2), lim = (LT + LS) * 0.99;
                const reach = tl => { const a = footAt(gx, tl, ground); return Math.hypot(a[0] - hx, a[1] - hipY); };
                let tl = Math.max(0, curTilt(Fd, t));
                if (reach(tl) > lim) {
                  if (reach(0.95) > lim) tl = -1;
                  else { let lo = tl, hi = 0.95; for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (reach(m) > lim) lo = m; else hi = m; } tl = hi; }
                }
                if (tl >= 0) {
                  const a = footAt(gx, tl, ground);
                  Fd.tilt0 = Fd.tiltTo = tl; Fd.tiltT0 = t - 1; feet[i] = { ax: a[0], ay: a[1], tilt: tl, down: true };
                } else {
                  PL.exit.rel[i] = t;
                  const a = footAt(gx, Math.max(0, curTilt(Fd, t)), ground);
                  PL.exit.off = PL.exit.off || [];
                  PL.exit.off[i] = [a[0] - hx, a[1] - hipY, Math.max(0, curTilt(Fd, t))];
                }
              } else if (Fd.step || !legs[i].stance || t - PL.exit.t0 > 0.7) PL.exit.rel[i] = t;
            }
            wl[i] = PL.exit.rel[i] == null ? 1 : 1 - sstep(0, 0.16, t - PL.exit.rel[i]);
          }
        }
      }
      for (let i = 0; i < 2; i++) {
        const L = legs[i], F = feet[i], w = wl[i], hx = hipX + (L.far ? -2 : 1.5);
        L.wp = w;
        if (w <= 0) continue;
        if (PL && PL.exit && w < 1) {
          const k = 1 - w, e = sstep(0, 1, k);
          const off = PL.exit.off && PL.exit.off[i];
          const fx = off ? hx + off[0] : F.ax, fy = off ? hipY + off[1] : F.ay, ft = off ? off[2] : F.tilt;
          const arc = off ? 0 : (10 + 0.15 * Math.abs(L.ax - fx)) * Math.sin(Math.PI * k);
          const nhx = lerp(hx, L.hx, e), nhy = lerp(hipY, L.hy, e);
          const [al, be] = ik(nhx, nhy, lerp(fx, L.ax, e), lerp(fy, L.ay, e) - arc);
          L.tilt = lerp(ft, L.tilt, e) - (off ? 0 : 0.2 * Math.sin(Math.PI * k));
          L.al = al; L.be = be; L.hx = nhx; L.hy = nhy;
          L.kx = L.hx + Math.sin(L.al) * LT; L.ky = L.hy + Math.cos(L.al) * LT;
          L.ax = L.kx + Math.sin(L.be) * LS; L.ay = L.ky + Math.cos(L.be) * LS;
          L.planted = false;
          if (mem) mem.legs[i].idx = null;
          continue;
        }
        const [al, be] = ik(hx, hipY, F.ax, F.ay);
        L.al = lerp(L.al, al, w); L.be = lerp(L.be, be, w); L.tilt = lerp(L.tilt, F.tilt, w);
        L.hx = lerp(L.hx, hx, w); L.hy = lerp(L.hy, hipY, w);
        L.kx = L.hx + Math.sin(L.al) * LT; L.ky = L.hy + Math.cos(L.al) * LT;
        L.ax = L.kx + Math.sin(L.be) * LS; L.ay = L.ky + Math.cos(L.be) * LS;
        L.planted = w > 0.5 && F.down;
        if (mem) mem.legs[i].idx = null;
      }
      if (PL && PL.exit && wl[0] <= 0 && wl[1] <= 0) mem.plant = null;
    }

    for (const L of legs) {
      L.pen = 0;
      if (!L.stance && !L.planted) {
        const gy = ground - lift, tc = rot(TOE[0], TOE[1], L.tilt), hc = rot(HEEL[0], HEEL[1], L.tilt), bc = rot(BALL[0], BALL[1], L.tilt);
        const toeLow = Math.max(tc[1], bc[1]) >= hc[1], low = L.ay + Math.max(tc[1], hc[1], bc[1]) - gy;
        if (low > 0) { L.pen = low; L.tilt += (toeLow ? -1 : 1) * Math.min(0.5, low / (toeLow ? 60 : 30)); }
      }
    }

    const runArm = (far) => {
      const p = wrap(phase + (far ? Math.PI : 0));
      const bag = carry && !far;
      let A = lerp(0.5 + 0.32 * g.pace, 0.32, g.jog) * (far ? 1 + 0.2 * fillK : 1);
      const a0 = -0.06;
      const sw = -Math.cos(p - 0.25);
      const vel = Math.sin(p - 0.25);
      let a = a0 + A * sw;
      let e = lerp(1.45 + 0.12 * g.pace, 1.42, g.jog) + 0.24 * sw * (0.6 + 0.4 * g.pace) + 0.14 * vel;
      let w = 0.08 - 0.12 * sw;
      let open = 0;
      if (bag) {
        A = lerp(0.24, 0.12, fillK) * (0.55 + 0.45 * g.pace);
        a = -0.03 + A * sw; e = lerp(0.42, 0.2, fillK) + 0.08 * sw * (1 - fillK); w = 0.06;
      }
      if (sEnv > 0) {
        if (bag) { a = lerp(a, 0.55, sEnv); e = lerp(e, 0.5, sEnv); }
        else { a = lerp(a, far ? -1.1 : 1.35, sEnv); e = lerp(e, far ? 0.5 : 0.7, sEnv); }
      }
      if (J > 0) {
        let up = far ? [-0.65, 1.3, 0.1] : [lerp(1.95, 2.2, rise), lerp(0.25, 0.5, rise), -0.2];
        if (carry) up = far ? [lerp(1.8, 2.1, rise), lerp(0.4, 0.6, rise), -0.1] : [0.32, 0.55, 0.06];
        a = lerp(a, up[0], J); e = lerp(e, up[1], J); w = lerp(w, up[2], J);
        open = far || carry ? 0 : J;
      }
      return { a, e, w, sw, open, su: 1, sf: 1 };
    };
    let armF = runArm(true), armN = runArm(false);
    const swN = armN.sw;
    if (cE > 0) {
      const k = still ? 1 : 0;
      armF = blendArm(armF, { a: lerp(-0.72 + 0.12 * armF.sw, -1.3, k) + 0.02 * tr(18), e: lerp(0.6, 0.3, k), w: 0.14, open: 0 }, cE);
      armN = blendArm(armN, carry ? { a: -0.35, e: 0.3, w: 0.06, open: 0 }
        : { a: lerp(-0.78 + 0.12 * armN.sw, -1.42, k) + 0.025 * tr(19), e: lerp(0.55, 0.22, k), w: 0.12, open: 0 }, cE);
    }
    const poseW = Math.max(wPrev, wCur);
    const counter = 2.4 * swN * (1 - poseW) * (1 - cE);
    const tw = (px, py) => { const [rx, ry] = rot(px, py * B.chest, B.lean); return [hipX + rx, hipY + ry]; };
    const [s0x, s0y] = tw(SHOULDER[0], SHOULDER[1]);
    const F = { tw, head: B.head, lean: B.lean, chest: B.chest,
      shN: [s0x + counter, s0y + B.shDY + 1.8 * fillK], shF: [s0x - 2 - counter * 0.6, s0y + 1 + B.shDY] };
    const [hpx, hpy] = tw(HEADP[0], HEADP[1]);
    F.headP = [hpx, hpy + B.shDY * 0.6];
    if (PP && wPrev > 0) { const [f2, n2] = PP.arms(F, prevT, carry); armF = blendArm(armF, f2, wPrev); armN = blendArm(armN, n2, wPrev); }
    if (PC && wCur > 0) { const [f2, n2] = PC.arms(F, poseT, carry); armF = blendArm(armF, f2, wCur); armN = blendArm(armN, n2, wCur); }

    const wHand = carry ? Math.max(pose === 'handoff' ? wCur * sstep(0.25, 0.9, poseT) : 0, prev === 'handoff' ? wPrev * sstep(0.25, 0.9, prevT) : 0) : 0;
    if (wHand > 0) {
      const K = armFK(F.shN, armN), [bx, by] = [K.gx - 1, K.gy + 49];
      const [a, fa] = ik2(F.shF[0], F.shF[1], bx - 9, by + 3, LU, LF, -1);
      armF = blendArm(armF, { a, e: fa - a, w: Math.PI / 2 - 0.15 - fa, open: 1, su: 1, sf: 1 }, wHand);
    }

    let swing = 0, bounce = 0;
    if (carry) {
      swing = -(0.32 + 0.3 * g.pace) * Math.sin(phase - 0.55) - 0.1 * g.pace;
      bounce = Math.cos(2 * phase - TAU * g.D * 0.5) * (0.5 + 0.5 * g.pace);
      swing = lerp(swing, 0.3 - 0.6 * rise, J);
      swing += 0.9 * sEnv * Math.sin(t * 13);
      const quiet = Math.max(poseW, cE);
      if (quiet > 0) {
        const settle = pose === 'handoff' ? 0.28 * Math.sin(poseT * 6.5) * Math.exp(-poseT * 2.2) : 0.06 * Math.sin(TAU * t / 3.8);
        swing = lerp(swing, settle, quiet); bounce *= 1 - quiet;
      }
      swing = clamp(swing, -1, 1);
    }

    const tail = LK.meta.tail && P.tail ? hairChain(mem, LK.meta.tail, F.headP, B.head, g.v) : null;

    const headRel = B.head - B.lean;
    const neckAng = Math.max(cE, poseW) * 0.9 * clamp(-headRel - 0.18, 0, 0.6);
    const KF = armFK(F.shF, armF), KN = armFK(F.shN, armN);
    const hp = F.headP;
    const pt = (lx, ly, ang, ox, oy) => { const [rx, ry] = rot(lx, ly, ang); return { x: ox + rx, y: oy + ry }; };
    const ht = LK.meta.headTop;
    const anchors = {
      head: pt(4, -8, B.head, hp[0], hp[1]),
      headTop: pt(ht[0], ht[1], B.head, hp[0], hp[1]),
      nearHand: { x: KN.gx, y: KN.gy }, farHand: { x: KF.gx, y: KF.gy },
      nearShoe: Object.assign(pt(24, 4.6, legs[1].tilt, legs[1].ax, legs[1].ay), { angle: legs[1].tilt }),
      farShoe: Object.assign(pt(24, 4.6, legs[0].tilt, legs[0].ax, legs[0].ay), { angle: legs[0].tilt }),
    };
    if (carry) anchors.bag = { x: KN.gx, y: KN.gy, swing, fill: carry.fill };
    return { g, t, phase, ground, lift, J, sEnv, legs, B, hipX, hipY, F, KF, KN, armF, armN, carry, swing, bounce, neckAng,
      poseW, cE, anchors, swN, tail };
  }

  function hairChain(mem, TM, hp, ha, speed) {
    const n = TM.n, l = TM.len / n;
    const [rx, ry] = rot(TM.root[0], TM.root[1], ha);
    const root = [hp[0] + rx, hp[1] + ry];
    const wind = Math.atan2(TM.drag * speed, TM.grav), rest0 = TM.rest + ha;
    const settled = () => {
      const pts = [root];
      let a = lerp(wind, rest0, 0.55);
      for (let i = 1; i <= n; i++) {
        if (i > 1) a = lerp(a, wind, 0.35);
        a = clamp(a, -0.12, 1.75);
        const p = pts[i - 1];
        pts.push([p[0] - Math.sin(a) * l, p[1] + Math.cos(a) * l]);
      }
      return pts;
    };
    if (!mem) return settled();
    let H = mem.hair;
    if (!H || H.n !== n) { const pts = settled(); mem.hair = { n, x: pts.map(p => p.slice()), xp: pts.map(p => p.slice()), root }; return pts; }
    const dt = Math.min(mem.dt || 0, 0.1);
    if (dt > 0) {
      const ns = Math.max(1, Math.min(24, Math.ceil(dt * 120))), h = dt / ns;
      const kd = 1 - Math.exp(-TM.drag * h), air = -speed * h, gh = TM.grav * h * h;
      const k1 = 1 - Math.pow(1 - TM.stiff, h * 120), k2 = 1 - Math.pow(1 - TM.stiff * 0.5, h * 120);
      for (let k = 1; k <= ns; k++) {
        const f = k / ns;
        H.x[0] = [lerp(H.root[0], root[0], f), lerp(H.root[1], root[1], f)];
        for (let i = 1; i <= n; i++) {
          const x = H.x[i], xp = H.xp[i];
          let vx = x[0] - xp[0], vy = x[1] - xp[1];
          vx += (air - vx) * kd; vy -= vy * kd;
          xp[0] = x[0]; xp[1] = x[1];
          x[0] += vx; x[1] += vy + gh;
        }
        let prevA = rest0;
        for (let i = 1; i <= n; i++) {
          const p = H.x[i - 1], x = H.x[i];
          let a = Math.atan2(p[0] - x[0], x[1] - p[1]);
          a = clamp(lerp(a, prevA, i === 1 ? k1 : k2), -0.12, 1.75);
          x[0] = p[0] - Math.sin(a) * l; x[1] = p[1] + Math.cos(a) * l;
          prevA = a;
        }
      }
      H.root = root;
    }
    return H.x.map(p => p.slice());
  }

  function drawTail(ctx, ch) {
    const T = P.tail, TM = LK.meta.tail, n = ch.length - 1, l = TM.len / n, k = T.c.height / T.h;
    const ang = [];
    for (let i = 0; i < n; i++) ang.push(Math.atan2(ch[i][0] - ch[i + 1][0], ch[i + 1][1] - ch[i][1]));
    const at = y => {
      const u = clamp(y / l, 0, n), i = Math.min(n - 1, Math.floor(u)), f = u - i;
      let a = ang[i];
      if (f < 0.5 && i > 0) a = lerp(ang[i - 1], ang[i], sstep(-0.5, 0.5, f));
      else if (f >= 0.5 && i < n - 1) a = lerp(ang[i], ang[i + 1], sstep(0.5, 1.5, f));
      const over = y - u * l;
      return [ch[i][0] + (ch[i + 1][0] - ch[i][0]) * f - Math.sin(a) * over, ch[i][1] + (ch[i + 1][1] - ch[i][1]) * f + Math.cos(a) * over, a];
    };
    const M = 10, [a0, b0, c0, d0, e0, f0] = M0;
    for (let s = 0; s < M; s++) {
      const ya = T.y + T.h * s / M, sy = Math.floor((ya - T.y) * k), sh = Math.min(T.c.height - sy, Math.ceil((T.h / M + 0.8) * k));
      if (sh <= 0) continue;
      const [px, py, a] = at(ya), c = Math.cos(a), sn = Math.sin(a);
      ctx.setTransform(a0 * c + c0 * sn, b0 * c + d0 * sn, -a0 * sn + c0 * c, -b0 * sn + d0 * c, a0 * px + c0 * py + e0, b0 * px + d0 * py + f0);
      ctx.drawImage(T.c, 0, sy, T.c.width, sh, T.x, sy / k + T.y - ya, T.w, sh / k);
    }
  }

  function render(ctx, S, s) {
    const { g, legs, B, hipX, hipY, F, KF, KN, J, sEnv, carry, ground, lift, phase, t } = S;
    ctx.setTransform(M0[0], M0[1], M0[2], M0[3], M0[4], M0[5]);
    const sh = Math.min(lift, 160) / 160;
    ctx.globalAlpha = 0.34 * (1 - sh * 0.7);
    ctx.drawImage(P.disc.c, s.x - 70 * (1 - sh * 0.4) + 6, ground - 7, 140 * (1 - sh * 0.4), 14);
    for (const L of legs) {
      const fx = L.ax + rot(20, 0, L.tilt)[0], dy = ground - (L.ay + ANKLE_H);
      const k = clamp(1 - Math.max(0, dy) / 50, 0, 1);
      if (k <= 0) continue;
      ctx.globalAlpha = 0.5 * k * (L.far ? 0.7 : 1);
      ctx.drawImage(P.disc.c, fx - 44, ground - 4, 88, 9);
    }
    ctx.globalAlpha = 1;
    const drawArm = (K, far) => {
      const sfx = far ? '_far' : '';
      put(ctx, P['forearm' + sfx], K.ex, K.ey, -K.fa, 1, K.sf);
      if (K.o < 1) { ctx.globalAlpha = 1 - K.o; put(ctx, P['fist' + sfx], K.wx, K.wy, -K.ha); }
      if (K.o > 0) { ctx.globalAlpha = K.o; put(ctx, P['hand_open' + sfx], K.wx, K.wy, -K.ha); }
      ctx.globalAlpha = 1;
      put(ctx, P['upper_arm' + sfx], K.sx, K.sy, -K.a, 1, K.su);
    };
    const drawLeg = (L) => {
      const sfx = L.far ? '_far' : '';
      put(ctx, P['shin' + sfx], L.kx, L.ky, -L.be);
      put(ctx, P['shoe' + sfx], L.ax, L.ay, L.tilt);
      put(ctx, P['thigh' + sfx], L.hx, L.hy, -L.al);
      const flut = 0.035 * Math.sin(L.p * 2 + 0.6) * (0.4 + g.pace) * (1 - S.poseW);
      put(ctx, P['shorts_leg' + sfx], L.hx, L.hy, -(L.al * 0.9 + flut), 1, 1 - 0.07 * clamp(L.al, 0, 1));
    };
    drawArm(KF, true);
    drawLeg(legs[0]);
    put(ctx, P.torso_back, hipX, hipY, B.lean);
    drawLeg(legs[1]);
    if (S.neckAng > 0.004 && P.neck) {
      const [nx, ny] = F.tw(NECK_BASE[0], NECK_BASE[1]);
      putAbout(ctx, P.neck, nx, ny, B.lean + S.neckAng, 1, B.chest, NECK_BASE[0], NECK_BASE[1]);
    }

    put(ctx, P.tee_up, hipX, hipY, B.lean, 1, B.chest);
    const calm = (1 - S.poseW) * (1 - S.cE);
    const hemSw = (0.03 * Math.sin(2 * phase + 0.9) * (0.4 + 0.6 * g.pace)) * (1 - J) * calm + 0.05 * sEnv * Math.sin(t * 26);
    const hemSy = 1 + 0.03 * Math.cos(2 * phase - TAU * g.D * 0.5 + 0.6) * (0.3 + 0.7 * g.pace) * (1 - J) * calm + J * 0.05 * clamp((s.vy || 0) / 700, -1, 1);
    const [tpx, tpy] = F.tw(TEE_PIV[0], TEE_PIV[1]);
    putAbout(ctx, P.tee_lo, tpx, tpy, B.lean + hemSw, 1, hemSy * B.chest, TEE_PIV[0], TEE_PIV[1]);
    if (P.tee_folds_fwd) {
      const fw = clamp(S.swN, 0, 1) * calm, bk = clamp(-S.swN, 0, 1) * calm;
      if (fw > 0.02) { ctx.globalAlpha = fw; put(ctx, P.tee_folds_fwd, hipX, hipY, B.lean, 1, B.chest); }
      if (bk > 0.02) { ctx.globalAlpha = bk; put(ctx, P.tee_folds_back, hipX, hipY, B.lean, 1, B.chest); }
      ctx.globalAlpha = 1;
    }
    if (S.tail) drawTail(ctx, S.tail);
    put(ctx, P.head, F.headP[0], F.headP[1], B.head);
    if (carry) drawBag(ctx, KN.gx, KN.gy, carry.fill, t, S.swing, S.bounce, carry.ripes, carry.scale);
    drawArm(KN, false);
  }

  function draw(ctx, s) {
    const S = solve(s);
    Runner.last = { legs: S.legs, hipX: S.hipX, hipY: S.hipY, g: S.g, armFar: S.armF, armNear: S.armN, lean: S.B.lean,
      headAng: S.B.head, anchors: S.anchors, swing: S.swing };
    if (P.shoe && !s.noDraw) {
      ctx.save();
      try {
        const m = ctx.getTransform();
        M0 = [m.a, m.b, m.c, m.d, m.e, m.f];
        render(ctx, S, s);
      } finally { ctx.restore(); }
    }
    return S.anchors;
  }

  const freeze = o => { if (o && typeof o === 'object') { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  const Runner = { ready, draw, parts: P, RES, SHOE, ANKLE_H, LT, LS, HEEL, BALL, ROCK_R, ROCK_C,
    features: { carry: true, crouch: true, poses: ['stand', 'lookUp', 'handoff', 'catch'], anchors: true, looks: true },

    looks: freeze(JSON.parse(JSON.stringify(LOOKS.catalog))),
    defaultLook: freeze(Object.assign({}, LOOKS.default)),
    setLook, randomLook, lookCode, parseLook,

    rigParts, partSVG: n => (LK.cur && !LK.legacy) ? partText(LK.cur, n) : null };
  Object.defineProperty(Runner, 'look', { enumerable: true, get: () => Object.assign({}, LK.cur || LOOKS.default) });
  Object.defineProperty(Runner, 'lookVersion', { enumerable: true, get: () => LK.version });
  window.Runner = Runner;
})();
