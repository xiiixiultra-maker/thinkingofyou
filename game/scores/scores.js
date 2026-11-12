

(() => {
'use strict';
const CFG = window.LTWH_SCORES || {};
const Q = new URLSearchParams(location.search);
const ENDPOINT = Q.get('scores') || CFG.endpoint || '';
const TEST = Q.has('scores');
const ENDS = Date.parse(CFG.endsAt || '') || Infinity;
const P = 'ltwh-score-';
const PLAYER_KEY = 'ltwh-player', DEVICE_KEY = 'ltwh-device';
const BASE = (document.currentScript && document.currentScript.src) ? new URL('.', document.currentScript.src).href : 'scores/';
const FONT_DIR = new URL('../create/fonts/', BASE).href;

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
let device = store.get(DEVICE_KEY);
if (!device) { device = Array.from(crypto.getRandomValues(new Uint8Array(9)), b => (b % 36).toString(36)).join(''); store.set(DEVICE_KEY, device); }

const TABLET_KEY = 'ltwh-tablet', IDLE_SECS = 60;
const TABLET = (() => {
  const q = Q.get('tablet');
  try {
    if (q === '1') localStorage.setItem(TABLET_KEY, '1'); else if (q === '0') localStorage.removeItem(TABLET_KEY);
    return localStorage.getItem(TABLET_KEY) === '1';
  } catch (e) { return q === '1'; }
})();

let tabletPlayer = null, tabletSkip = false, playerN = 0;
const getPlayer = () => TABLET ? tabletPlayer : store.get(PLAYER_KEY);
const setPlayer = p => { if (TABLET) tabletPlayer = p; else store.set(PLAYER_KEY, p); };

const deviceId = () => TABLET ? 'tab-' + device + '-' + playerN : device;

const S = { run: null, ticketTry: 0, ticketTimer: 0, state: 'idle', result: null, error: '', pending: null, onAgain: null,
  onNext: null, root: null, pill: null, view: null, busy: false, idleTimer: 0 };

const demo = () => !ENDPOINT && !!window.LTWH_DBG;
let demoBest = 0;
function demoBoard() {
  const me = getPlayer() || {}, rows = [];
  for (let i = 0; i < 30; i++) rows.push({ name: 'Runner ' + (i + 1), score: 5400 - i * 141 - (i % 4) * 17 });
  if (me.name && demoBest) rows.push({ name: me.name, score: demoBest });
  return rows.sort((a, b) => b.score - a.score);
}
function demoPost(body) {
  if (body.type === 'start') return Promise.resolve({ ok: true, run: 'demo-' + Date.now() });
  if (body.type !== 'score') return Promise.resolve({ ok: true });
  demoBest = Math.max(demoBest, body.score || 0);
  const all = demoBoard(), i = all.findIndex(p => p.name === body.name && p.score === demoBest);
  return Promise.resolve({ ok: true, held: false, name: body.name, rank: i + 1, best: demoBest, players: all.length,
    toBeat: all[0].score, phase: 'open', open: true });
}

const enabled = () => (!!ENDPOINT || demo()) && Date.now() < ENDS;
const fmt = n => Number(n || 0).toLocaleString('en-US');

function post(body) {
  if (demo()) return demoPost(body);

  return fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json());
}

const SALT = ['hp4X', 'q7Rk', '2Lw9'].reverse().join('-');
function sign(ticket, r) {
  const msg = [ticket, r.score, r.s1, r.s2, r.s3, SALT].join('|');
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg))
    .then(b => Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join(''));
}

function runStarted() {
  clearTimeout(S.ticketTimer);
  S.run = null; S.ticketTry = 0; S.state = enabled() ? 'idle' : 'off'; S.result = null; S.error = ''; S.pending = null;
  S.cpLate = [];
  if (enabled()) askTicket();
}
function askTicket() {
  S.ticketTry++;
  post({ type: 'start', device: deviceId() }).then(r => {
    if (r && r.ok && r.run) { S.run = r.run; (S.cpLate || []).splice(0).forEach(checkpoint); }
    else if (r && r.closed) S.state = 'closed';
    else retry();
  }, retry);
}

function checkpoint(act) {
  if (!enabled()) return;
  if (!S.run) { (S.cpLate = S.cpLate || []).push(act); return; }
  post({ type: 'cp', run: S.run, act }).catch(() => {});
}
function retry() { if (S.ticketTry < 4 && !S.run) S.ticketTimer = setTimeout(askTicket, 4000 * S.ticketTry); }

function finish(run, opts) {
  S.onAgain = opts && opts.onAgain;
  S.onNext = opts && opts.onNext;
  if (!enabled()) { S.state = ENDPOINT ? 'closed' : 'off'; return; }
  if (S.state === 'closed') return;
  S.pending = run;
  if (TABLET) idleArm();
  const me = getPlayer();

  setTimeout(() => {
    if (S.pending !== run) return;
    if (me && me.name && me.contact) save(me);
    else if (skipped()) showPill();
    else openForm();
  }, 1000);
}

function save(me) {
  const run = S.pending; if (!run || S.busy) return;
  if (!S.run) { S.state = 'error'; S.error = 'This run couldn\'t reach the board'; showError(S.error, true); return; }
  S.busy = true; S.state = 'saving'; setBusy(true);
  const ticket = S.run;
  sign(ticket, run).then(sig => post({ type: 'score', run: ticket, device: deviceId(), name: me.name, contact: me.contact, score: run.score,
    s1: run.s1, s2: run.s2, s3: run.s3, stats: run.stats || {}, look: run.look || '', sig })).then(r => {
    S.busy = false; setBusy(false);
    if (S.pending !== run) {

      if (r && r.ok && !TABLET) setPlayer({ name: r.name || me.name, contact: me.contact });
      return;
    }
    if (r && r.ok) {
      setPlayer({ name: r.name || me.name, contact: me.contact });
      S.state = 'saved'; S.result = r; S.pending = null; r.held ? showHeld(r) : showResult(r);
    } else if (r && r.closed) {
      S.state = 'closed'; S.error = 'The contest is over'; showError('The contest is over. The board is final.', true);
    } else if (r && r.field) {
      S.state = 'idle'; openForm(me, r.field, r.error);
    } else {
      S.state = 'error'; S.error = (r && r.error) || 'Couldn\'t save'; showError(S.error, true);
    }
  }, () => {
    S.busy = false; setBusy(false);
    if (S.pending !== run) return;
    S.state = 'error'; S.error = 'No connection'; showError('No connection. Try again?', false);
  });
}

const COPY = {
  eyebrow: 'High score board',
  title: 'Put your name on the board',
  name: 'Your name on the board', nameHint: '2 to 14 letters',

  contact: 'IG or phone', contactHint: CFG.prize ? 'Only so we can reach you if you win. Never shown.' : 'Only so we can reach you. Never shown.',
  save: 'Save my score', later: 'Not now', again: 'Run again', change: 'Not you? Change name', saveName: 'Save name',
  pill: 'Put me on the board',
  board: 'See the full leaderboard', boardTitle: 'The leaderboard', back: 'Back',
  startSub: 'Once is enough. Every run after this saves to the board on its own.',
  startSubTablet: 'You’re on the store tablet. Your name and IG clear off it after your run.',
  startGo: 'Let’s run', skip: 'Skip', next: 'Next player',
};

function el(tag, cls, attrs, kids) {
  const e = document.createElement(tag);
  if (cls) e.className = cls.split(' ').map(c => P + c).join(' ');
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const k of kids || []) if (k != null) e.append(k);
  return e;
}

function css() {
  if (document.getElementById(P + 'css')) return;
  const st = document.createElement('style'); st.id = P + 'css';
  st.textContent = `
@font-face{font-family:"${P}display";src:url("${FONT_DIR}basteleur-bold.woff") format("woff");font-weight:700;font-display:swap}
@font-face{font-family:"${P}ui";src:url("${FONT_DIR}apfel-regular.woff") format("woff");font-weight:400;font-display:swap}
@font-face{font-family:"${P}ui";src:url("${FONT_DIR}apfel-mittel.woff") format("woff");font-weight:500;font-display:swap}
@font-face{font-family:"${P}ui";src:url("${FONT_DIR}apfel-satt.woff") format("woff");font-weight:700;font-display:swap}
@font-face{font-family:"${P}num";src:url("${FONT_DIR}anton.woff") format("woff");font-weight:400;font-display:swap}
.${P}root{position:fixed;inset:0;z-index:20;display:grid;place-items:start center;overflow:auto;
 padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom));box-sizing:border-box;
 background:rgba(14,10,24,.55);font:400 16px/1.35 "${P}ui",system-ui,sans-serif;color:#FFF6E5;
 -webkit-user-select:none;user-select:none;touch-action:manipulation;animation:${P}fade .2s ease}
@media (min-height:620px){.${P}root{padding-top:max(6vh,env(safe-area-inset-top))}}
.${P}root *{box-sizing:border-box}
.${P}card{position:relative;width:min(440px,100%);padding:22px 22px 18px;border-radius:20px;
 background:linear-gradient(180deg,#2C2849 0%,#1D1931 60%,#17141F 100%);
 box-shadow:0 24px 60px -18px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,246,229,.1);animation:${P}up .28s cubic-bezier(.2,.9,.3,1.1)}
.${P}eyebrow{margin:0 0 6px;font-weight:700;font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:#F5D061}
.${P}eyebrow::before{content:"";display:block;width:58px;height:7px;margin:0 0 10px -2px;background:#F28C28;transform:rotate(-1.6deg)}
.${P}title{margin:0 0 4px;font:700 26px/1.08 "${P}display",Georgia,serif}
.${P}score{display:flex;align-items:baseline;gap:10px;margin:2px 0 14px;color:rgba(255,246,229,.82);font-weight:500}
.${P}score b{font:400 38px/1 "${P}num",Impact,sans-serif;letter-spacing:.02em;color:#FFF6E5}
.${P}field{display:block;margin:0 0 12px}
.${P}field span{display:block;margin:0 0 6px;font-weight:700;font-size:13px;letter-spacing:.06em}
.${P}field input{display:block;width:100%;height:50px;padding:0 14px;border:0;border-radius:12px;outline:none;
 background:rgba(255,246,229,.08);color:#FFF6E5;font:500 18px "${P}ui",system-ui,sans-serif;
 box-shadow:inset 0 0 0 1px rgba(255,246,229,.22);-webkit-user-select:text;user-select:text}
.${P}field input::placeholder{color:rgba(255,246,229,.38)}
.${P}field input:focus{box-shadow:inset 0 0 0 2px #F28C28;background:rgba(255,246,229,.11)}
.${P}field small{display:block;margin-top:5px;font-size:12.5px;color:rgba(255,246,229,.6)}
.${P}field.${P}bad input{box-shadow:inset 0 0 0 2px #FF8A7A}
.${P}field.${P}bad small{color:#FF9F92}
.${P}fine{margin:2px 0 14px;font-size:12.5px;line-height:1.4;color:rgba(255,246,229,.62)}
.${P}fine b{color:#F5D061;font-weight:700}
.${P}rules{color:#FFF6E5;font-weight:700;text-decoration:underline;text-underline-offset:2px}
.${P}row{display:flex;gap:10px;align-items:center}
.${P}go,.${P}ghost{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 18px;border:0;border-radius:13px;
 cursor:pointer;-webkit-appearance:none;appearance:none;touch-action:manipulation}
.${P}go{flex:1;background:linear-gradient(180deg,#F7A043,#F28C28 55%,#E27D1C);color:#15130F;font:700 19px/1 "${P}display",Georgia,serif;
 box-shadow:0 8px 18px -8px rgba(242,140,40,.8)}
.${P}go[disabled]{opacity:.6;cursor:default}
.${P}ghost{background:rgba(255,246,229,.06);color:#FFF6E5;font:500 15px "${P}ui",system-ui,sans-serif;box-shadow:inset 0 0 0 1px rgba(255,246,229,.22)}
.${P}link{display:block;margin:12px auto 0;padding:6px;border:0;background:none;color:rgba(255,246,229,.7);font:500 13.5px "${P}ui",system-ui,sans-serif;
 text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.${P}msg{margin:0 0 12px;font-weight:500;color:#FF9F92}
.${P}rank{margin:0;font:400 64px/0.95 "${P}num",Impact,sans-serif;letter-spacing:.01em;color:#F5D061}
.${P}rank small{font:700 15px "${P}ui",system-ui,sans-serif;letter-spacing:.04em;color:rgba(255,246,229,.75);margin-left:8px}
.${P}sub{margin:6px 0 14px;font-weight:500;color:rgba(255,246,229,.85)}
.${P}pill{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));z-index:19;transform:translateX(-50%);
 display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 18px;border:0;border-radius:999px;cursor:pointer;
 background:#FFF6E5;color:#15130F;font:700 15px "${P}ui",system-ui,sans-serif;box-shadow:0 10px 26px -10px rgba(0,0,0,.7);
 animation:${P}fade .25s ease;touch-action:manipulation}
.${P}pill::before{content:"";width:10px;height:10px;border-radius:50%;background:#F28C28}
.${P}board{list-style:none;margin:4px 0 14px;padding:0;max-height:min(50vh,430px);overflow:auto;-webkit-overflow-scrolling:touch;
 overscroll-behavior:contain;border-radius:12px;background:rgba(255,246,229,.05);box-shadow:inset 0 0 0 1px rgba(255,246,229,.12)}
.${P}board li{display:flex;align-items:baseline;gap:10px;padding:10px 12px;border-top:1px solid rgba(255,246,229,.08)}
.${P}board li:first-child{border-top:0}
.${P}board .${P}n{width:2.4em;flex:none;font:400 18px/1 "${P}num",Impact,sans-serif;color:rgba(255,246,229,.55)}
.${P}board li:nth-child(-n+3):not(.${P}gap) .${P}n{color:#F5D061}
.${P}board .${P}nm{flex:1;min-width:0;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${P}board .${P}pts{flex:none;font:400 20px/1 "${P}num",Impact,sans-serif;letter-spacing:.02em}
.${P}board li.${P}me{background:rgba(242,140,40,.2)}
.${P}board li.${P}me .${P}nm{font-weight:700}
.${P}board li.${P}gap{border-top:1px dashed rgba(255,246,229,.3)}
.${P}you{margin-left:6px;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#F5D061}
@keyframes ${P}fade{from{opacity:0}}
@keyframes ${P}up{from{opacity:0;transform:translateY(16px) scale(.98)}}
@media (max-height:460px){.${P}card{padding:16px 18px 14px}.${P}title{font-size:22px}.${P}field input{height:44px}
 .${P}go,.${P}ghost{min-height:46px}.${P}rank{font-size:48px}}
`;
  document.head.append(st);
}

function mount(card) {
  css(); hidePill();
  if (!S.root) {
    S.root = el('div', 'root', { role: 'dialog', 'aria-modal': 'true' });

    for (const ev of ['pointerdown', 'pointerup', 'click', 'touchstart'])
      S.root.addEventListener(ev, e => { e.stopPropagation(); idlePoke(); });
    S.root.addEventListener('keydown', e => { e.stopPropagation(); idlePoke(); if (e.key === 'Escape') (S.onEscape || later)(); });
    document.body.append(S.root);
  }
  S.root.replaceChildren(card);
  if (TABLET) idleArm();
}
function unmount() { if (S.root) { S.root.remove(); S.root = null; } }

function scoreLine(run) {
  return el('p', 'score', null, [el('b', null, null, [fmt(run.score)]), document.createTextNode('points this run')]);
}

function field(key, label, hint, value, attrs) {
  const input = el('input', null, Object.assign({ name: key, value: value || '', spellcheck: 'false', autocomplete: 'off' }, attrs));
  const small = el('small', null, null, [hint]);
  const f = el('label', 'field', null, [el('span', null, null, [label]), input, small]);
  f.hint = hint; f.input = input; f.small = small;
  return f;
}
function bad(f, msg) { f.classList.add(P + 'bad'); f.small.textContent = msg; }
function good(f) { f.classList.remove(P + 'bad'); f.small.textContent = f.hint; }

function validName(v) { return /^[A-Za-zÀ-ÿ0-9 ._'!&-]{2,14}$/.test(v) && /[A-Za-zÀ-ÿ0-9]/.test(v); }
function validContact(v) {
  const s = v.trim().toLowerCase(), d = s.replace(/\D/g, '');
  if (/^[+\d\s().-]+$/.test(s)) return d.length >= 10 && d.length <= 15;
  return /^@?[a-z0-9._]{2,30}$/.test(s) || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(s);
}

function openForm(me, badField, badMsg, mode) {
  mode = mode || 'save';
  const run = S.pending;
  if (mode === 'save' && !run) return;
  me = me || getPlayer() || {};
  const fName = field('name', COPY.name, COPY.nameHint, me.name,
    { maxlength: '14', autocapitalize: 'words', autocomplete: TABLET ? 'off' : 'nickname', enterkeyhint: 'next' });
  const fContact = field('contact', COPY.contact, COPY.contactHint, me.contact,
    { maxlength: '40', autocapitalize: 'none', inputmode: 'text', placeholder: '@yourname or 305 555 0123', enterkeyhint: 'done' });
  const go = el('button', 'go', { type: 'submit' }, [mode === 'edit' ? COPY.saveName : mode === 'start' ? COPY.startGo : COPY.save]);
  const no = el('button', 'ghost', { type: 'button' }, [mode === 'start' ? COPY.skip : COPY.later]);
  const fine = el('p', 'fine', null, [el('b', null, null, [CFG.prize || '']), document.createTextNode(' Board closes ' + (CFG.endsLabel || '') + '. ' + (CFG.fine || '')),
    CFG.rulesUrl ? document.createTextNode(' ') : null, rulesLink()]);
  const form = el('form', 'card', TABLET ? { novalidate: '', autocomplete: 'off' } : { novalidate: '' }, [
    el('p', 'eyebrow', null, [COPY.eyebrow]),
    el('h2', 'title', null, [COPY.title]),
    mode === 'save' ? scoreLine(run) : el('p', 'sub', null, [mode !== 'start' ? 'Your next runs save under this name.'
      : TABLET ? COPY.startSubTablet : COPY.startSub]),
    fName, fContact, CFG.prize ? fine : null, el('div', 'row', null, [go, no]),
  ]);
  S.view = { go };
  S.onEscape = mode === 'start' ? skipStart : null;
  if (badField === 'name') bad(fName, badMsg); else if (badField === 'contact') bad(fContact, badMsg);
  fName.input.addEventListener('input', () => good(fName));
  fContact.input.addEventListener('input', () => good(fContact));
  fName.input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fContact.input.focus(); } });
  no.addEventListener('click', mode === 'start' ? skipStart : later);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = fName.input.value.trim().replace(/\s+/g, ' '), contact = fContact.input.value.trim();
    let ok = true;
    if (!validName(name)) { bad(fName, 'Use 2 to 14 letters or numbers'); ok = false; }
    if (!validContact(contact)) { bad(fContact, 'Add your IG (@name) or a phone number'); ok = false; }
    if (!ok) return;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (mode === 'edit') { setPlayer({ name, contact }); unmount(); return; }
    if (mode === 'start') { setPlayer({ name, contact }); startNow(); return; }
    save({ name, contact });
  });
  mount(form);
  if (!badField && !me.name) setTimeout(() => { try { fName.input.focus({ preventScroll: true }); } catch (e) {} }, 320);
}

function rulesLink() {
  if (!CFG.rulesUrl) return null;
  const a = el('a', 'rules', { href: new URL('../' + CFG.rulesUrl, BASE).href, target: '_blank', rel: 'noopener' }, ['Rules']);
  for (const ev of ['pointerdown', 'pointerup', 'touchstart']) a.addEventListener(ev, e => e.stopPropagation());
  return a;
}

function setBusy(on) { if (S.view && S.view.go) { S.view.go.disabled = on; S.view.go.textContent = on ? 'Saving…' : COPY.save; } }

function later() { unmount(); if (S.pending && S.state !== 'saved') showPill(); }

const SKIP_KEY = 'ltwh-board-skip';
function skipped() {
  if (TABLET) return tabletSkip;
  try { return sessionStorage.getItem(SKIP_KEY) === '1'; } catch (e) { return false; }
}
function askName(then) {
  const me = getPlayer();
  if (!enabled() || (me && me.name && me.contact) || skipped()) { then(); return; }
  S.onStart = then;
  openForm(null, null, null, 'start');
}

function startNow() {
  const f = S.onStart; S.onStart = null; S.onEscape = null; unmount();
  if (TABLET) playerN++;
  if (f) f(TABLET ? { newPlayer: true } : undefined);
}
function skipStart() {
  if (TABLET) tabletSkip = true; else try { sessionStorage.setItem(SKIP_KEY, '1'); } catch (e) {}
  startNow();
}

const BOARD_N = 25;
function boardLink(back) {
  const b = el('button', 'link', { type: 'button' }, [COPY.board]);
  b.addEventListener('click', () => showBoard(back));
  return b;
}
function boardRow(n, name, score, cls) {
  const nm = el('span', 'nm', null, [name]);
  if (cls && cls.indexOf('me') >= 0) nm.append(el('span', 'you', null, ['You']));
  return el('li', cls || null, null, [el('span', 'n', null, [String(n)]), nm, el('span', 'pts', null, [fmt(score)])]);
}
function showBoard(back) {
  const again = el('button', 'go', { type: 'button' }, [COPY.again]);
  const done = el('button', 'ghost', { type: 'button' }, [COPY.back]);
  const note = el('p', 'sub', null, ['Loading the board…']);
  const list = el('ol', 'board', { 'aria-label': COPY.boardTitle }, []);
  const eyebrow = el('p', 'eyebrow', null, [COPY.eyebrow]);
  const card = el('div', 'card', null, [eyebrow, el('h2', 'title', null, [COPY.boardTitle]), note, list,
    el('div', 'row', null, [again, done])]);
  again.addEventListener('click', () => { unmount(); if (S.onAgain) S.onAgain(); });
  done.addEventListener('click', () => { if (back) back(); else unmount(); });
  mount(card);
  const me = S.result || {};
  const url = ENDPOINT + (ENDPOINT.indexOf('?') >= 0 ? '&' : '?') + 'board=1&n=' + BOARD_N + '&_=' + Date.now();
  const load = demo() ? Promise.resolve({ ok: true, top: demoBoard().slice(0, BOARD_N), players: demoBoard().length, phase: 'open' })
    : fetch(url, { cache: 'no-store' }).then(r => r.json());
  load.then(b => {
    if (!card.isConnected) return;
    if (!b || !b.ok) throw new Error('board');
    const top = b.top || [], ph = b.phase || '';
    let mine = me.name ? top.findIndex(p => p.name === me.name && p.score === me.best) : -1;
    top.forEach((p, i) => list.append(boardRow(i + 1, p.name, p.score, i === mine ? 'me' : '')));
    if (mine < 0 && me.name && me.rank > top.length && me.best) list.append(boardRow(me.rank, me.name, me.best, 'me gap'));
    if (ph === 'practice') {
      eyebrow.textContent = 'Practice round';
      note.textContent = 'The board resets to zero when the contest opens ' + (CFG.opensLabel || 'soon') + '.';
    } else if (ph === 'closed') {
      note.textContent = 'The board is closed. Winners announced on our Instagram.';
    } else {
      note.textContent = fmt(b.players) + (b.players === 1 ? ' player' : ' players') + ' so far. Highest score at the close wins. The board closes '
        + (CFG.endsLabel || 'soon') + '.';
    }
    if (!top.length) note.textContent += ' No scores yet.';
    if (demo()) eyebrow.textContent = 'Sample board · test link only';
    const lit = list.querySelector('.' + P + 'me');
    if (lit && lit.scrollIntoView) try { lit.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }).catch(() => { if (card.isConnected) note.textContent = 'Couldn’t load the board. Check your connection and try again.'; });
  try { done.focus({ preventScroll: true }); } catch (e) {}
}

function showResult(r) {
  const me = r.rank, practice = r.phase === 'practice';
  const again = el('button', 'go', { type: 'button' }, [COPY.again]);
  const toBeat = r.toBeat || (r.top && r.top[0] && r.top[0].score) || 0;
  let sub = me === 1 ? 'You\'re on top. Hold it till ' + (CFG.endsLabel || 'the end') + '.'
    : 'Out of ' + fmt(r.players) + ' players. ' + (toBeat ? fmt(toBeat) + ' is the score to beat.' : '');
  if (S.lastScore && r.best > S.lastScore) sub += ' Your best is still ' + fmt(r.best) + '.';

  if (practice) sub = 'Practice round. The board resets to zero when the contest opens ' + (CFG.opensLabel || 'soon') + '.'
    + (me !== 1 && toBeat ? ' ' + fmt(toBeat) + ' is the practice score to beat.' : '');
  let change = null;
  if (!TABLET) {
    change = el('button', 'link', { type: 'button' }, [COPY.change]);
    change.addEventListener('click', () => openForm(null, null, null, 'edit'));
  }
  const card = el('div', 'card', null, [
    el('p', 'eyebrow', null, [(practice ? 'Practice run · ' : '') + 'Saved as ' + (r.name || '')]),
    el('p', 'rank', null, ['#' + me, el('small', null, null, [practice ? 'for now' : 'on the board'])]),
    el('p', 'sub', null, [sub]),
    el('div', 'row', null, [again, TABLET ? nextButton() : null]), boardLink(() => showResult(r)), change,
  ]);
  again.addEventListener('click', () => { unmount(); if (S.onAgain) S.onAgain(); });
  mount(card);
  try { again.focus({ preventScroll: true }); } catch (e) {}
}

function showHeld(r) {
  const again = el('button', 'go', { type: 'button' }, [COPY.again]);
  const card = el('div', 'card', null, [
    el('p', 'eyebrow', null, ['Saved as ' + (r.name || '')]),
    el('p', 'rank', null, [fmt(S.lastScore), el('small', null, null, ['points'])]),
    el('p', 'sub', null, ['Big run. Scores like this get a quick check before they go up on the board.']),
    el('div', 'row', null, [again, TABLET ? nextButton() : null]), boardLink(() => showHeld(r)),
  ]);
  again.addEventListener('click', () => { unmount(); if (S.onAgain) S.onAgain(); });
  mount(card);
  try { again.focus({ preventScroll: true }); } catch (e) {}
}

function showError(msg, final) {
  const retryBtn = el('button', 'go', { type: 'button' }, [final ? COPY.again : 'Try again']);
  let no;
  if (TABLET && final) no = nextButton();
  else {
    no = el('button', 'ghost', { type: 'button' }, [final ? 'Close' : COPY.later]);
    no.addEventListener('click', () => { unmount(); if (!final) later(); });
  }
  const card = el('div', 'card', null, [el('p', 'eyebrow', null, [COPY.eyebrow]), el('p', 'msg', null, [msg]),
    el('div', 'row', null, [retryBtn, no])]);
  retryBtn.addEventListener('click', () => {
    if (final) { unmount(); if (S.onAgain) S.onAgain(); }
    else { const me = getPlayer(); me && me.name ? save(me) : openForm(); }
  });
  mount(card);
}

function nextButton() {
  const b = el('button', 'ghost', { type: 'button' }, [COPY.next]);
  b.addEventListener('click', nextPlayer);
  return b;
}
function idleArm() { clearTimeout(S.idleTimer); S.idleTimer = setTimeout(nextPlayer, IDLE_SECS * 1000); }
function idlePoke() { if (TABLET && S.idleTimer) idleArm(); }
function idleStop() { clearTimeout(S.idleTimer); S.idleTimer = 0; }
function nextPlayer() {
  idleStop();
  tabletPlayer = null; tabletSkip = false; S.pending = null; S.onStart = null; S.onEscape = null;
  unmount(); hidePill();
  if (S.onNext) S.onNext();
}

function showPill() {
  css(); hidePill();
  S.pill = el('button', 'pill', { type: 'button' }, [COPY.pill]);
  for (const ev of ['pointerdown', 'pointerup', 'touchstart']) S.pill.addEventListener(ev, e => e.stopPropagation());
  S.pill.addEventListener('click', e => { e.stopPropagation(); openForm(); });
  document.body.append(S.pill);
}
function hidePill() { if (S.pill) { S.pill.remove(); S.pill = null; } }

function close() { clearTimeout(S.ticketTimer); idleStop(); unmount(); hidePill(); S.pending = null; }

window.Scores = {
  enabled, runStarted, close, askName,
  closed: () => !!ENDPOINT && Date.now() >= ENDS,
  finish(run, opts) { S.lastScore = run && run.score; finish(run, opts); },
  isOpen: () => !!S.root,
  status: () => ({ state: S.state, rank: S.result && S.result.rank, best: S.result && S.result.best,
    players: S.result && S.result.players, held: !!(S.result && S.result.held), error: S.error,
    practice: !!(S.result && S.result.phase === 'practice') }),
  checkpoint,
  allowTestRuns: TEST,
  tablet: TABLET,
  nextPlayer,
};
})();
