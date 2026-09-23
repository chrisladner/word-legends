/* Word Legends – Vokabeltrainer
   Vanilla JS, keine Abhängigkeiten. Fortschritt liegt in localStorage.
   Lernmodell: Leitner-Karteikasten als Kartenstufen 1–6 ("Legendär"). */
(() => {
'use strict';

// ================================================================
// Konstanten
// ================================================================
const STORE_KEY = 'wordlegends.v1';
const INTERVALS = [0, 1, 2, 4, 7, 14, 30];   // Tage Pause nach Erreichen der Stufe
const LEGEND_INTERVAL = 60;                  // Legendär und wieder richtig → 60 Tage
const TIER_LABEL = ['Neu', 'Stufe 1', 'Stufe 2', 'Stufe 3', 'Stufe 4', 'Stufe 5', 'Legendär'];
const TIER_SHORT = ['Neu', '1', '2', '3', '4', '5', '👑'];
const XP = { type: 10, memo: 5, mc: 5, intro: 5, noTo: 8, hint: 4, typo: 3, levelUp: 5, combo: 10, mission: 20 };
const OLD_PER_DAY = 6;   // so viele Karten aus älteren Units werden pro Tag höchstens eingestreut
const TITLES = [[1, 'Rookie'], [4, 'Wortjäger'], [8, 'Vokabel-Profi'], [14, 'Sprach-Ninja'], [22, 'Word Legend']];

const $ = s => document.querySelector(s);
const app = $('#app');

// ================================================================
// Wörter vorbereiten
// ================================================================
const UNITS = window.UNITS || [];
const WORDS = [];
const BY_ID = Object.create(null);
const APART = Object.create(null);   // id → ids, die nicht am selben Tag neu kommen sollen
for (const unit of UNITS) {
  for (const w of unit.words) {
    w.unit = unit.id;
    prep(w);
    WORDS.push(w);
    BY_ID[w.id] = w;
  }
  for (const group of unit.apart || []) {
    for (const id of group) APART[id] = (APART[id] || []).concat(group.filter(x => x !== id));
  }
}

function prep(w) {
  w.verb = /^to /i.test(w.en);
  const base = (w.alt || [w.en]).map(norm);
  w.accept = new Set(base);
  w.acceptNoTo = new Set(w.verb ? base.map(a => a.replace(/^to /, '')) : []);
  w.main = w.main || w.en;
  w.say = w.say || w.en.replace(/[.…]+$/, '').trim();
  const m = w.ex ? w.ex.match(/\[([^\]]+)\]([a-z']*)/i) : null;
  w.gap = m ? m[1] : null;
  w.gapTail = m ? m[2] : '';
  w.exPlain = w.ex ? w.ex.replace(/[[\]]/g, '') : '';
  w.order = hash(w.id);   // feste, gemischte Reihenfolge für neue Wörter
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ================================================================
// Antworten prüfen
// ================================================================
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[.,!?;:…"“”„«»()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Abstand mit Vertauschung (Damerau): "freind" → "friend" = 1
function dist(a, b) {
  const m = a.length, n = b.length;
  const d = [];
  for (let i = 0; i <= m; i++) { d.push(new Array(n + 1).fill(0)); d[i][0] = i; }
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}

// res: ok | noTo (Verb ohne "to") | typo (1 Buchstabe daneben) | wrong
function check(w, input, kind) {
  const n = norm(input);
  if (!n) return { res: 'wrong', empty: true };
  const acc = new Set(w.accept);
  const accNoTo = new Set(w.acceptNoTo);
  if (kind === 'cloze' && w.gap) {
    acc.add(norm(w.gap));
    acc.add(norm(w.gap + w.gapTail));
    accNoTo.forEach(a => acc.add(a));   // im Satz steht das Verb ohne "to"
    accNoTo.clear();
  }
  if (acc.has(n)) return { res: 'ok' };
  if (accNoTo.has(n)) return { res: S.settings.strictTo ? 'noTo' : 'ok' };
  const other = WORDS.find(o => o !== w && (o.accept.has(n) || o.acceptNoTo.has(n)));
  if (other) return { res: 'wrong', confused: other };
  let best = Infinity, near = '';
  for (const a of [...acc, ...accNoTo]) {
    const d = dist(n, a);
    if (d < best) { best = d; near = a; }
  }
  if (best === 1 && near.replace(/[^a-z]/g, '').length >= 4) return { res: 'typo', near };
  return { res: 'wrong' };
}

// Markiert im richtigen Wort die Buchstaben, die in der Eingabe fehlen oder falsch sind
function diffMark(input, target) {
  const a = norm(input), b = target.toLowerCase(), m = a.length, n = b.length;
  if (m === n) {   // gleich lang: vertauschte oder falsche Buchstaben direkt markieren
    return [...target].map((c, k) => (a[k] === b[k] ? esc(c) : `<mark>${esc(c)}</mark>`)).join('');
  }
  const L = [];
  for (let i = 0; i <= m; i++) L.push(new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  }
  const keep = new Array(n).fill(false);
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { keep[j] = true; i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  return [...target].map((c, k) => (keep[k] || c === ' ') ? esc(c) : `<mark>${esc(c)}</mark>`).join('');
}

// "to give" → "to g _ _ _"
function pattern(s) {
  const parts = s.replace(/[.…?!]+$/, '').split(' ');
  return parts.map((p, i) => (i === 0 && p.toLowerCase() === 'to' && parts.length > 1)
    ? 'to'
    : p.replace(/[a-z]/gi, (c, k) => (k === 0 ? c : '_'))).join('   ');
}

// ================================================================
// Datum (lokale Tage, keine Uhrzeiten)
// ================================================================
let dayOffset = 0;   // nur zum Testen: sessionStorage 'wl.dayOffset'
try { dayOffset = parseInt(sessionStorage.getItem('wl.dayOffset') || '0', 10) || 0; } catch (e) { /* egal */ }

function fmt(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function today() { return fmt(new Date(Date.now() + dayOffset * 864e5)); }
function addDays(ds, n) {
  const [y, m, d] = ds.split('-').map(Number);
  return fmt(new Date(y, m - 1, d + n, 12));
}
function daysBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
}
function inDays(n) {
  if (n <= 0) return 'heute';
  if (n === 1) return 'morgen';
  return `in ${n} Tagen`;
}

// ================================================================
// Speicher
// ================================================================
function fresh() {
  return {
    v: 1,
    settings: { name: '', newPerDay: 8, testDate: '', strictTo: true, autoSpeak: true, sfx: true, focus: 'auto' },
    w: {},
    stats: { xp: 0, streak: 0, best: 0, lastDay: '', answers: 0, right: 0, sessions: 0 },
    day: { date: '', newCount: 0 },
    ui: { hideInstall: false, onboarded: false }
  };
}
function upgrade(s) {
  const d = fresh();
  return {
    v: 1,
    settings: { ...d.settings, ...(s.settings || {}) },
    w: s.w && typeof s.w === 'object' ? s.w : {},
    stats: { ...d.stats, ...(s.stats || {}) },
    day: { ...d.day, ...(s.day || {}) },
    ui: { ...d.ui, ...(s.ui || {}) }
  };
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return upgrade(JSON.parse(raw));
  } catch (e) { /* frisch starten */ }
  return fresh();
}
let S = load();
let saveWarned = false;
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) {
    if (!saveWarned) { saveWarned = true; toast('Speichern klappt gerade nicht. Ist privates Surfen an?'); }
  }
}

// ================================================================
// Karteikasten-Logik
// ================================================================
// Schwerpunkt-Unit: bekommt die neuen Wörter zuerst, alle Wiederholungen und das Testdatum.
// Ältere Units werden nur eingestreut. null = alle Units gleich (nur eine Unit, oder so eingestellt).
function focusUnit() {
  const f = S.settings.focus;
  if (UNITS.length < 2 || f === 'all') return null;
  if (f && f !== 'auto' && UNITS.some(u => u.id === f)) return f;
  return UNITS[UNITS.length - 1].id;
}
function inFocus(w) { const f = focusUnit(); return !f || w.unit === f; }
function unitTitle(id) { const u = UNITS.find(x => x.id === id); return u ? u.title : id; }
function unitIndex(w) { return UNITS.findIndex(u => u.id === w.unit); }

// Mit Testdatum: keine Karte der Schwerpunkt-Unit wird erst nach dem Tag vor dem Test fällig
function effDue(w) {
  const st = S.w[w.id], t = S.settings.testDate;
  if (t && inFocus(w) && daysBetween(today(), t) >= 1) {
    const cap = addDays(t, -1);
    return st.due < cap ? st.due : cap;
  }
  return st.due;
}
// Eine Karte ist "geladen", wenn ihre Pause vorbei ist – höchstens einmal pro Tag
function isDue(w) { const st = S.w[w.id]; return !!st && st.lv >= 1 && st.last !== today() && effDue(w) <= today(); }
function dueWords() { return WORDS.filter(isDue); }
// Für die Mission: alles Geladene aus der Schwerpunkt-Unit, aus älteren Units höchstens OLD_PER_DAY pro Tag
function missionDue() {
  const due = dueWords();
  const f = focusUnit();
  if (!f) return due;
  const t = today();
  const oldDone = WORDS.filter(w => w.unit !== f && S.w[w.id] && S.w[w.id].last === t && S.w[w.id].since !== t).length;
  const old = due.filter(w => w.unit !== f)
    .sort((a, b) => (effDue(a) < effDue(b) ? -1 : effDue(a) > effDue(b) ? 1 : S.w[a.id].lv - S.w[b.id].lv))
    .slice(0, Math.max(0, OLD_PER_DAY - oldDone));
  return due.filter(w => w.unit === f).concat(old);
}
// Neue Wörter: Schwerpunkt-Unit zuerst, danach ältere Units der Reihe nach
function unseenWords() {
  return WORDS.filter(w => !S.w[w.id])
    .sort((a, b) => (inFocus(b) - inFocus(a)) || (unitIndex(a) - unitIndex(b)) || (a.order - b.order));
}
function collectedWords() { return WORDS.filter(w => S.w[w.id]); }
function newToday() { return S.day.date === today() ? S.day.newCount : 0; }

function newQuota() {
  const unseen = unseenWords();
  const done = newToday();
  let per = S.settings.newPerDay;
  const t = S.settings.testDate;
  if (t) {
    const days = daysBetween(today(), t);
    const forTest = unseen.filter(inFocus).length;
    // Alle neuen Wörter bis zwei Tage vor dem Test – der letzte Tag gehört der Wiederholung
    if (days >= 1 && forTest) per = Math.max(per, Math.ceil((forTest + done) / Math.max(1, days - 1)));
  }
  return Math.max(0, Math.min(unseen.length, per - done));
}

// Die nächsten neuen Wörter – ohne Gegensatzpaare am selben Tag.
// Nur kurz vor dem Test wird aufgefüllt, damit trotzdem alles rechtzeitig drankommt.
function pickNew(n) {
  if (n <= 0) return [];
  const t = today(), picked = [], held = [];
  for (const w of unseenWords()) {
    if (picked.length >= n) break;
    const clash = (APART[w.id] || []).some(p => picked.some(x => x.id === p) || (S.w[p] && S.w[p].since === t));
    (clash ? held : picked).push(w);
  }
  const testSoon = S.settings.testDate && daysBetween(t, S.settings.testDate) <= 2;
  while (testSoon && picked.length < n && held.length) picked.push(held.shift());
  return picked;
}

function collect(id) {
  const t = today();
  S.w[id] = { lv: 1, due: addDays(t, 1), last: t, ok: 0, bad: 0, since: t };
  if (S.day.date !== t) S.day = { date: t, newCount: 0 };
  S.day.newCount++;
}

// Nur der erste Versuch des Tages bei einer geladenen Karte zählt für die Stufe
function review(id, res) {
  const st = S.w[id], t = today(), from = st.lv;
  if (res === 'ok' || res === 'noTo') {
    st.lv = Math.min(6, from + 1);
    st.due = addDays(t, from === 6 ? LEGEND_INTERVAL : INTERVALS[st.lv]);
  } else if (res === 'typo' || res === 'hint') {
    st.due = addDays(t, 1);
  } else {
    st.lv = Math.max(1, from - 2);
    st.due = addDays(t, 1);
  }
  st.last = t;
  return { from, to: st.lv, due: st.due };
}

function tierCounts() {
  const c = [0, 0, 0, 0, 0, 0, 0];
  for (const w of WORDS) { const st = S.w[w.id]; c[st ? st.lv : 0]++; }
  return c;
}

// Streak: reißt nur, wenn an einem verpassten Tag wirklich etwas zu tun gewesen wäre.
// Muss geprüft werden, bevor am neuen Tag geübt wird – danach sind die Fälligkeiten schon verschoben.
function refreshStreak() {
  const last = S.stats.lastDay;
  if (!last || !S.stats.streak || daysBetween(last, today()) <= 1) return;
  const yesterday = addDays(today(), -1);
  const onlyRestDays = WORDS.every(w => S.w[w.id] && S.w[w.id].due > yesterday);
  if (!onlyRestDays) { S.stats.streak = 0; save(); }
}
function markDay() {
  const t = today();
  if (S.stats.lastDay === t) return false;
  S.stats.streak += 1;
  S.stats.best = Math.max(S.stats.best, S.stats.streak);
  S.stats.lastDay = t;
  return true;
}

function levelInfo(xp) {
  let lvl = 1, base = 0, need = 100;
  while (xp >= base + need) { base += need; lvl++; need = 100 + (lvl - 1) * 50; }
  let title = TITLES[0][1];
  for (const [l, name] of TITLES) if (lvl >= l) title = name;
  return { lvl, into: xp - base, need, title };
}

// ================================================================
// Aufgaben zusammenstellen
// ================================================================
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Abfrageart nach Stufe: am Anfang Deutsch → Englisch tippen, später auch Lückensatz und Hördiktat
function reviewType(w, lv) {
  const r = Math.random();
  const cloze = !!w.gap;
  const listen = S.settings.autoSpeak && TTS.ok;
  if (lv <= 1) return 'type';
  if (lv === 2) return cloze && r < 0.45 ? 'cloze' : 'type';
  if (listen && r < 0.25) return 'listen';
  if (cloze && r < 0.55) return 'cloze';
  return 'type';
}

function buildMission(newCount) {
  const reviews = shuffle(missionDue()).map(w => ({ id: w.id, type: reviewType(w, S.w[w.id].lv), scored: true }));
  const intros = pickNew(newCount).map(w => ({ id: w.id, type: 'intro' }));
  const q = [];
  let r = 0, n = 0;
  while (r < reviews.length || n < intros.length) {
    if (q.length < 2 && r < reviews.length) { q.push(reviews[r++]); continue; }
    if (n < intros.length) q.push(intros[n++]);
    for (let k = 0; k < 2 && r < reviews.length; k++) q.push(reviews[r++]);
  }
  return q;
}
function buildPractice(ids) { return shuffle(ids).map(id => ({ id, type: 'type', practice: true })); }
function hardestIds(n) {
  const score = st => st.bad - st.ok * 0.25;
  return collectedWords()
    .sort((a, b) => (S.w[a.id].lv - S.w[b.id].lv) || (score(S.w[b.id]) - score(S.w[a.id])))
    .slice(0, n).map(w => w.id);
}
function buildTest(n, sel) {
  const pool = collectedWords().filter(w => !sel || sel === 'all' || w.unit === sel);
  return shuffle(pool).slice(0, n).map(w => ({ id: w.id, type: 'test' }));
}

function distractors(w, k) {
  const same = shuffle(WORDS.filter(o => o !== w && o.verb === w.verb && o.de !== w.de));
  const rest = shuffle(WORDS.filter(o => o !== w && o.verb !== w.verb));
  return [...same, ...rest].slice(0, k);
}

// ================================================================
// Ton: Aussprache, Effekte, Vibration
// ================================================================
const TTS = { ok: 'speechSynthesis' in window, voice: null };
function pickVoice() {
  if (!TTS.ok) return;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return;
  const pref = ['Daniel', 'Arthur', 'Serena', 'Kate', 'Martha', 'Oliver', 'Stephanie', 'Google UK English Female', 'Google UK English Male'];
  const rank = v => {
    let r = pref.findIndex(p => v.name.includes(p));
    if (r < 0) r = 50;
    if (/enhanced|premium/i.test(v.name)) r -= 20;
    return r;
  };
  const gb = vs.filter(v => /en[-_]GB/i.test(v.lang));
  const pool = gb.length ? gb : vs.filter(v => /^en/i.test(v.lang));
  TTS.voice = pool.sort((a, b) => rank(a) - rank(b))[0] || null;
}
if (TTS.ok) {
  pickVoice();
  try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { speechSynthesis.onvoiceschanged = pickVoice; }
}
function speak(text) {
  if (!TTS.ok || !text) return;
  try {
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = TTS.voice ? TTS.voice.lang : 'en-GB';
    if (TTS.voice) u.voice = TTS.voice;
    u.rate = 0.9;
    speechSynthesis.speak(u);
  } catch (e) { /* kein Ton */ }
}
function autoSay(w) { if (S.settings.autoSpeak) speak(w.say); }

let actx = null;
function sfx(kind) {
  if (!S.settings.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const seq = {
      ok: [[660, 0], [990, 0.09]],
      bad: [[220, 0], [165, 0.11]],
      tap: [[520, 0]],
      level: [[523, 0], [659, 0.09], [784, 0.18], [1046, 0.27]]
    }[kind] || [];
    for (const [f, d] of seq) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'bad' ? 'square' : 'triangle';
      o.frequency.value = f;
      const peak = kind === 'bad' ? 0.05 : 0.16;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(peak, t + d + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
      o.connect(g).connect(actx.destination);
      o.start(t + d);
      o.stop(t + d + 0.2);
    }
  } catch (e) { /* kein Ton */ }
}
// iPhone hat keine Vibration-API; ein unsichtbarer Schalter (iOS 18+) löst ein kurzes Haptik-Feedback aus
function haptic() {
  if (!S.settings.sfx) return;
  try {
    if (navigator.vibrate) { navigator.vibrate(18); return; }
    const label = document.createElement('label');
    label.ariaHidden = 'true';
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    label.remove();
  } catch (e) { /* egal */ }
}

// ================================================================
// Kleine UI-Helfer
// ================================================================
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function exHTML(w) { return esc(w.ex).replace(/\[([^\]]+)\]/, '<b>$1</b>'); }
function clozeHTML(w) { return esc(w.ex).replace(/\[([^\]]+)\]/, (_, g) => `<span class="gap" style="--n:${g.length}"></span>`); }
function sayBtn(w, cls = '') {
  return TTS.ok ? `<button class="say keepfocus ${cls}" type="button" data-act="say" data-say="${esc(w.say)}" aria-label="Vorlesen">🔊</button>` : '';
}
// tag: kleiner Hinweis im Band, z. B. "Unit 1" bei eingestreuten Karten aus älteren Units
function tierBand(lv, right, tag) {
  const cls = lv === 6 ? 'band holo' : 'band';
  const stars = lv >= 1 && lv <= 5 ? '★'.repeat(lv) + '<span class="dim">' + '★'.repeat(5 - lv) + '</span>' : (lv === 6 ? '👑' : '');
  return `<div class="${cls}" style="--tier:var(--t${lv})"><span>${TIER_LABEL[lv]}${tag ? `<em class="utag">${esc(tag)}</em>` : ''}</span><span>${right || stars}</span></div>`;
}
function restartAnim(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function shake(el) { restartAnim(el, 'shake'); }

let toastTimer = 0;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// Einfaches Bottom-Sheet. buttons: [{ label, value, cls }]
function sheet(html, buttons) {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}
      <div class="sheet-btns">${(buttons || []).map((b, i) => `<button class="btn ${b.cls || ''}" type="button" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div>`;
    const close = val => { wrap.remove(); resolve(val); };
    wrap.addEventListener('click', e => {
      if (e.target === wrap) return close(null);
      const b = e.target.closest('[data-i]');
      if (b) close(buttons[+b.dataset.i].value);
      const s = e.target.closest('[data-act="say"]');
      if (s) speak(s.dataset.say);
    });
    document.body.appendChild(wrap);
    const first = wrap.querySelector('textarea, input');
    if (first) first.focus();
  });
}

let fxToken = 0;
function stopFx() {
  fxToken++;
  const cv = $('#fx');
  cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const token = ++fxToken;
  const cv = $('#fx'), ctx = cv.getContext('2d');
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#B6F23A', '#FFD23F', '#2FD0F0', '#B26BFF', '#FF9A2B', '#FF5168', '#FFFFFF'];
  const P = Array.from({ length: 110 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.3,
    vx: (Math.random() - 0.5) * 11, vy: -Math.random() * 12 - 5,
    r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
    w: 7 + Math.random() * 7, h: 10 + Math.random() * 8,
    c: colors[Math.floor(Math.random() * colors.length)]
  }));
  let last = performance.now();
  const frame = now => {
    if (token !== fxToken) return;   // Bildschirm gewechselt
    const k = Math.min(2, (now - last) / 16.7);
    last = now;
    ctx.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of P) {
      p.vy += 0.38 * k; p.vx *= 0.995; p.x += p.vx * k; p.y += p.vy * k; p.r += p.vr * k;
      if (p.y > H + 30) continue;
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#131849';
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(frame);
}

// Sichtbare Höhe über der Tastatur (iPhone) für das Layout der Abfrage
function syncViewport() {
  const vv = window.visualViewport;
  const h = vv ? vv.height : innerHeight;
  document.documentElement.style.setProperty('--vvh', h + 'px');
  document.body.classList.toggle('kb', !!vv && innerHeight - vv.height > 120);
}
if (window.visualViewport) visualViewport.addEventListener('resize', syncViewport);
addEventListener('resize', syncViewport);

// ================================================================
// Screens
// ================================================================
let screen = '';

function topbar(title, back = 'home') {
  return `<header class="topbar">
    <button class="icon-btn" type="button" data-act="${back}" aria-label="Zurück">‹</button>
    <h1 class="outline">${title}</h1>
  </header>`;
}

// ---------- Willkommen ----------
function welcome() {
  screen = 'welcome';
  stopFx();
  app.innerHTML = `
  <section class="screen welcome">
    <div class="logo-fan" aria-hidden="true">
      <span class="mini" style="--i:-1;--tier:var(--t3)"></span>
      <span class="mini" style="--i:1;--tier:var(--t4)"></span>
      <span class="mini hero-card" style="--i:0"><b>W</b></span>
    </div>
    <h1 class="outline hero">Word Legends</h1>
    <p class="lead">Jedes Wort ist eine Karte.<br>Bring alle ${WORDS.length} auf <span class="legend-word">Legendär</span>!</p>
    <ul class="rules">
      <li><span>⚡</span><p><b>Geladene Karten</b> kannst du eine Stufe hochleveln – einmal pro Tag.</p></li>
      <li><span>⏳</span><p>Danach <b>lädt die Karte auf</b>: 1, 2, 4, 7, 14, dann 30 Tage. So wandert das Wort ins Langzeitgedächtnis.</p></li>
      <li><span>✍️</span><p>Du <b>tippst die Wörter selbst</b>, so wie im Test.</p></li>
    </ul>
    <form class="panel name-form" id="welcome-form">
      <label for="nm">Wie heißt du?</label>
      <input id="nm" type="text" maxlength="20" placeholder="Dein Name" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go" value="${esc(S.settings.name)}">
      <button class="btn go big" type="submit">Los geht’s</button>
    </form>
  </section>`;
  $('#welcome-form').addEventListener('submit', e => {
    e.preventDefault();
    S.settings.name = $('#nm').value.trim().slice(0, 20);
    S.ui.onboarded = true;
    save();
    $('#nm').blur();
    home();
  });
}

// ---------- Start ----------
function isStandalone() { return navigator.standalone === true || matchMedia('(display-mode: standalone)').matches; }
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }

function home() {
  screen = 'home';
  stopFx();
  SES = null;
  document.body.classList.remove('in-session');
  refreshStreak();
  const due = missionDue();
  const quota = pickNew(newQuota()).length;
  const counts = tierCounts();
  const collected = WORDS.length - counts[0];
  const L = levelInfo(S.stats.xp);
  const streak = S.stats.streak;
  const name = S.settings.name;
  const focus = focusUnit();
  const eyebrow = `Heute${focus ? ` · Schwerpunkt ${esc(unitTitle(focus))}` : ''}`;

  let mission;
  if (due.length || quota) {
    const mins = Math.max(1, Math.round((due.length * 15 + quota * 45) / 60));
    const oldN = due.filter(w => !inFocus(w)).length;
    let line;
    if (due.length && quota) line = `<b>${due.length}</b> ${due.length === 1 ? 'Karte ist' : 'Karten sind'} geladen, <b>${quota}</b> neue ${quota === 1 ? 'wartet' : 'warten'}.`;
    else if (due.length) line = `<b>${due.length}</b> ${due.length === 1 ? 'Karte ist' : 'Karten sind'} geladen.`;
    else line = collected ? `<b>${quota}</b> neue ${quota === 1 ? 'Karte wartet' : 'Karten warten'} auf dich.` : `Deine ersten <b>${quota}</b> Karten warten auf dich.`;
    mission = `
      <div class="eyebrow">${eyebrow}</div>
      ${handHTML(due, quota)}
      <p class="mission-line">${line}</p>
      <p class="mission-time">ca. ${mins} ${mins === 1 ? 'Minute' : 'Minuten'}${oldN ? ` · ${oldN} ${oldN === 1 ? 'Karte' : 'Karten'} aus älteren Units` : ''}</p>
      <button class="btn go big" type="button" data-act="start">Start</button>`;
  } else {
    const tomorrow = addDays(today(), 1);
    const dueTomorrow = collectedWords().filter(w => effDue(w) <= tomorrow);
    const nTomorrow = focus
      ? dueTomorrow.filter(w => w.unit === focus).length + Math.min(OLD_PER_DAY, dueTomorrow.filter(w => w.unit !== focus).length)
      : dueTomorrow.length;
    const extra = pickNew(5).length;
    let next = '';
    if (nTomorrow) next = `Morgen ${nTomorrow === 1 ? 'ist' : 'sind'} <b>${nTomorrow}</b> ${nTomorrow === 1 ? 'Karte' : 'Karten'} wieder geladen.`;
    else if (collected) {
      const soon = collectedWords().map(effDue).sort()[0];
      next = `Die nächste Karte ist ${inDays(daysBetween(today(), soon))} wieder geladen.`;
    }
    mission = `
      <div class="eyebrow">${eyebrow}</div>
      <p class="mission-done">Mission geschafft ✓</p>
      <p class="mission-line">${next}</p>
      <div class="two">
        ${extra ? `<button class="btn" type="button" data-act="extraNew">+${extra} Karten</button>` : ''}
        ${collected ? `<button class="btn" type="button" data-act="practiceHard">Freies Üben</button>` : ''}
      </div>
      <p class="fineprint">Extra-Runden bringen XP. Karten leveln aber erst wieder, wenn sie geladen sind.</p>`;
  }

  let testPill = '';
  if (S.settings.testDate) {
    const d = daysBetween(today(), S.settings.testDate);
    if (d >= 0) testPill = `<div class="pill test">📝 ${d === 0 ? 'Test heute – viel Glück!' : d === 1 ? 'Test morgen' : `Test in ${d} Tagen`}</div>`;
  }

  const installHint = (!isStandalone() && isIOS() && !S.ui.hideInstall) ? `
    <div class="panel install">
      <p><b>Als App aufs iPhone:</b> unten auf <span class="share">⬆︎</span> Teilen tippen, dann „Zum Home-Bildschirm“. So bleibt dein Fortschritt sicher gespeichert.</p>
      <button class="link" type="button" data-act="hideInstall">Ausblenden</button>
    </div>` : '';

  app.innerHTML = `
  <section class="screen home">
    <header class="home-top">
      <h1 class="outline hello">${name ? `Hi ${esc(name)}!` : 'Hi!'}</h1>
      <button class="icon-btn" type="button" data-act="settings" aria-label="Einstellungen">⚙︎</button>
    </header>
    <div class="pills">
      <div class="pill streak ${streak ? '' : 'off'}">🔥 ${streak} ${streak === 1 ? 'Tag' : 'Tage'}</div>
      <div class="pill level">★ Level ${L.lvl}<span class="xpmini"><i style="width:${Math.round(L.into / L.need * 100)}%"></i></span></div>
      ${testPill}
    </div>
    <div class="panel mission">${mission}</div>
    ${installHint}
    <div class="shelf">
      <div class="shelf-head"><h2>Deine Sammlung</h2><span>${collected} von ${WORDS.length}</span></div>
      <div class="stacks">${counts.map((c, lv) => stackHTML(lv, c)).join('')}</div>
      ${UNITS.length > 1 ? `<div class="unitline">${UNITS.slice().reverse().map(u => {
        const ws = WORDS.filter(w => w.unit === u.id);
        const got = ws.filter(w => S.w[w.id]).length;
        const legend = ws.filter(w => S.w[w.id] && S.w[w.id].lv === 6).length;
        return `<span class="${u.id === focus ? 'on' : ''}">${esc(u.title)} ${legend === ws.length ? '👑' : `${got}/${ws.length}`}</span>`;
      }).join('')}</div>` : ''}
    </div>
    <div class="two">
      <button class="btn" type="button" data-act="test">📝 Probetest</button>
      <button class="btn" type="button" data-act="cards">🃏 Karten</button>
    </div>
  </section>`;
}

function handHTML(due, quota) {
  const minis = due.slice(0, 3).map(w => `var(--t${S.w[w.id].lv})`);
  const backs = Math.min(quota, 5 - minis.length);
  const all = [...minis.map(t => ({ t })), ...Array.from({ length: backs }, () => ({ back: true }))];
  const mid = (all.length - 1) / 2;
  return `<div class="hand" aria-hidden="true">${all.map((m, i) => m.back
    ? `<span class="mini back" style="--i:${i - mid}"></span>`
    : `<span class="mini charged" style="--i:${i - mid};--tier:${m.t}"></span>`).join('')}</div>`;
}

function stackHTML(lv, c) {
  const edges = c ? Math.max(1, Math.round(12 * c / WORDS.length)) : 0;
  return `<button class="stack s${lv} ${c ? '' : 'empty'}" type="button" data-act="cards" data-lv="${lv}" style="--tier:var(--t${lv})" aria-label="${TIER_LABEL[lv]}: ${c} Karten">
    <span class="cnt">${c}</span>
    <span class="pile">${'<i></i>'.repeat(Math.max(0, edges - 1))}<em>${TIER_SHORT[lv]}</em></span>
  </button>`;
}

// ---------- Karten-Übersicht ----------
function cardState(w) {
  const st = S.w[w.id];
  if (!st) return 'noch nicht gesammelt';
  if (isDue(w)) return '⚡ geladen';
  if (st.last === today() && effDue(w) <= today()) return 'heute schon geübt';
  return `lädt · ${inDays(daysBetween(today(), effDue(w)))}`;
}

function cards(filter = 'all') {
  screen = 'cards';
  stopFx();
  const f = String(filter);
  const unitSel = f.startsWith('u:') ? f.slice(2) : null;
  let list = WORDS.slice();
  if (f === 'due') list = list.filter(isDue);
  else if (f === 'hard') list = list.filter(w => S.w[w.id] && S.w[w.id].bad >= 2).sort((a, b) => S.w[b.id].bad - S.w[a.id].bad);
  else if (/^\d$/.test(f)) list = list.filter(w => (S.w[w.id] ? S.w[w.id].lv : 0) === +f);
  else if (unitSel) list = list.filter(w => w.unit === unitSel);

  const chip = (v, label) => `<button class="chipbtn ${f === v ? 'on' : ''}" type="button" data-act="filter" data-f="${v}">${label}</button>`;
  const levelChip = /^\d$/.test(f) ? chip(f, TIER_LABEL[+f]) : '';
  const unitChips = UNITS.length > 1 ? UNITS.slice().reverse().map(u => chip('u:' + u.id, esc(u.title))).join('') : '';
  const multi = UNITS.length > 1;

  let body = '';
  if (!list.length) {
    body = `<p class="empty-note">${f === 'due' ? 'Gerade ist keine Karte geladen. Schau morgen wieder rein!' : f === 'hard' ? 'Keine schwierigen Karten – stark!' : 'Hier ist noch keine Karte.'}</p>`;
  } else if (f === 'all' || unitSel) {
    // Nach Units (neueste zuerst) und darin nach Übungsnummern wie im Buch
    body = UNITS.slice().reverse().map(u => {
      const ws = list.filter(w => w.unit === u.id);
      if (!ws.length) return '';
      const groups = [];
      for (const w of ws) {
        const g = groups[groups.length - 1];
        if (g && g.sec === w.sec) g.words.push(w);
        else groups.push({ sec: w.sec, words: [w] });
      }
      const head = multi ? `<h2 class="unit-head outline">${esc(u.title)} <small>${esc(u.source || '')}</small></h2>` : '';
      return head + groups.map(g => `
        <div class="group-head"><span class="secdot">${g.sec ? esc(g.sec) : '•'}</span>${g.sec ? (/^\d+$/.test(g.sec) ? 'Übung ' + esc(g.sec) : esc(g.sec)) : 'Einstieg'}</div>
        <div class="grid">${g.words.map(w => miniCardBtn(w)).join('')}</div>`).join('');
    }).join('');
  } else {
    body = `<div class="grid">${list.map(w => miniCardBtn(w, multi)).join('')}</div>`;
  }

  app.innerHTML = `
  <section class="screen cards">
    ${topbar('Karten')}
    <div class="chips">${chip('all', 'Alle')}${chip('due', '⚡ Geladen')}${chip('hard', 'Schwierig')}${unitChips}${levelChip}</div>
    ${body}
  </section>`;
}

function miniCardBtn(w, showUnit) {
  const st = S.w[w.id], lv = st ? st.lv : 0;
  return `<button class="mcard ${lv ? '' : 'unseen'}" type="button" data-act="card" data-id="${w.id}" style="--tier:var(--t${lv})">
    <span class="mband ${lv === 6 ? 'holo' : ''}">${lv ? (lv === 6 ? '👑 Legendär' : 'Stufe ' + lv) : 'Neu'}${showUnit ? ` · ${esc(unitTitle(w.unit))}` : ''}</span>
    <b class="men">${esc(w.en)}</b>
    <span class="mde">${esc(w.de)}</span>
    <span class="mstate">${cardState(w)}</span>
  </button>`;
}

function cardDetail(id) {
  const w = BY_ID[id], st = S.w[id], lv = st ? st.lv : 0;
  speak(w.say);
  const stats = st ? `<p class="detail-stats">${cardState(w)} · ✓ ${st.ok} · ✗ ${st.bad}</p>` : `<p class="detail-stats">Kommt bald als neue Karte.</p>`;
  sheet(`
    <article class="vcard detail">
      ${tierBand(lv)}
      <div class="cbody">
        <div class="row"><div class="en">${esc(w.en)}</div>${sayBtn(w)}</div>
        <div class="de">${esc(w.de)}</div>
        ${w.exPlain ? `<p class="ex">${exHTML(w)}</p>` : ''}
        ${w.tip ? `<p class="tip">💡 ${esc(w.tip)}</p>` : ''}
        ${stats}
      </div>
    </article>`, [{ label: 'Schließen', value: null, cls: 'go' }]);
}

// ---------- Probetest ----------
// sel: Unit-id oder 'all'. Standard ist die Schwerpunkt-Unit – da kommt ja der nächste Test.
function testSetup(sel) {
  screen = 'test';
  stopFx();
  const multi = UNITS.length > 1;
  sel = sel || (multi && focusUnit()) || 'all';
  const n = collectedWords().filter(w => sel === 'all' || w.unit === sel).length;
  const unitChips = multi ? `<div class="chips">${UNITS.slice().reverse().map(u =>
    `<button class="chipbtn ${sel === u.id ? 'on' : ''}" type="button" data-act="testUnit" data-sel="${u.id}">${esc(u.title)}</button>`).join('')}
    <button class="chipbtn ${sel === 'all' ? 'on' : ''}" type="button" data-act="testUnit" data-sel="all">Alle Units</button></div>` : '';
  let body;
  if (n < 5) {
    body = `<div class="panel"><p>Sammle zuerst mindestens <b>5 Karten</b>${multi && sel !== 'all' ? ` aus ${esc(unitTitle(sel))}` : ''}, dann kannst du dich testen.</p>
      <button class="btn go big" type="button" data-act="home">Zur Mission</button></div>`;
  } else {
    const sizes = [...new Set([10, 20, n].filter(k => k <= n))];
    body = `<div class="panel">
      <p class="lead dark">Wie in der Schule: Du siehst das deutsche Wort und schreibst es auf Englisch. Keine Tipps. Die Note gibt’s am Ende.</p>
      <p class="fineprint">Halbe Punkte für einen Tippfehler${S.settings.strictTo ? ' oder ein fehlendes „to“' : ''}. Nur Karten, die du schon gesammelt hast (${n}).</p>
      <div class="sizes">${sizes.map(k => `<button class="btn ${k === Math.min(20, n) ? 'go' : ''}" type="button" data-act="testGo" data-n="${k}" data-sel="${sel}">${k === n ? `Alle ${k}` : `${k} Wörter`}</button>`).join('')}</div>
    </div>`;
  }
  app.innerHTML = `<section class="screen">${topbar('Probetest')}${unitChips}${body}</section>`;
}

function gradeOf(pct) {
  if (pct >= 90) return [1, 'Sehr gut'];
  if (pct >= 80) return [2, 'Gut'];
  if (pct >= 65) return [3, 'Befriedigend'];
  if (pct >= 50) return [4, 'Genügend'];
  return [5, 'Nicht genügend'];
}

function testResult(s) {
  screen = 'testresult';
  const max = s.results.length;
  const pts = s.results.reduce((a, r) => a + r.pts, 0);
  const pct = max ? pts / max * 100 : 0;
  const [g, gname] = gradeOf(pct);
  const misses = s.results.filter(r => r.pts < 1);
  const fmtPts = x => String(x).replace('.', ',');
  lastMisses = misses.map(r => r.id);
  app.innerHTML = `
  <section class="screen result">
    <h1 class="outline hero center">Probetest</h1>
    <div class="stamp g${g}"><b>${g}</b><span>${gname}</span></div>
    <p class="score">${fmtPts(pts)} von ${max} Punkten · ${Math.round(pct)} %</p>
    <p class="fineprint center">Ungefähre Note – jede Lehrerin und jeder Lehrer bewertet ein bisschen anders.</p>
    <div class="panel list">
      ${s.results.map(r => {
        const w = BY_ID[r.id];
        const mark = r.pts === 1 ? '✓' : r.pts > 0 ? '½' : '✗';
        const cls = r.pts === 1 ? 'good' : r.pts > 0 ? 'almost' : 'bad';
        return `<div class="rrow ${cls}"><span class="rmark">${mark}</span><span class="rde">${esc(w.de)}</span><span class="ren">${esc(w.en)}${r.pts < 1 ? `<small>${r.input ? 'du: ' + esc(r.input) : 'leer gelassen'}</small>` : ''}</span></div>`;
      }).join('')}
    </div>
    ${misses.length ? `<button class="btn go big" type="button" data-act="trainMisses">Fehler üben (${misses.length})</button>` : ''}
    <button class="btn big" type="button" data-act="home">Fertig</button>
  </section>`;
  if (g <= 2) confetti();
  sfx(g <= 3 ? 'level' : 'tap');
}
let lastMisses = [];

// ---------- Einstellungen ----------
function toggleHTML(key, title, help) {
  return `<label class="toggle">
    <span><b>${title}</b>${help ? `<small>${help}</small>` : ''}</span>
    <input type="checkbox" data-set="${key}" ${S.settings[key] ? 'checked' : ''}>
    <i aria-hidden="true"></i>
  </label>`;
}

function settings() {
  screen = 'settings';
  stopFx();
  const s = S.settings;
  app.innerHTML = `
  <section class="screen settings">
    ${topbar('Einstellungen')}
    <div class="panel form">
      <label class="field"><b>Name</b>
        <input id="set-name" type="text" maxlength="20" value="${esc(s.name)}" autocomplete="off" autocorrect="off" spellcheck="false"></label>
      <div class="field"><b>Neue Wörter pro Tag</b>
        <div class="seg">${[5, 8, 12, 20].map(n => `<button type="button" class="${s.newPerDay === n ? 'on' : ''}" data-act="setNew" data-n="${n}">${n}</button>`).join('')}</div>
      </div>
      ${UNITS.length > 1 ? `<label class="field"><b>Schwerpunkt</b>
        <select id="set-focus">
          <option value="auto" ${!s.focus || s.focus === 'auto' ? 'selected' : ''}>Neueste Unit (${esc(UNITS[UNITS.length - 1].title)})</option>
          ${UNITS.slice().reverse().map(u => `<option value="${u.id}" ${s.focus === u.id ? 'selected' : ''}>${esc(u.title)}</option>`).join('')}
          <option value="all" ${s.focus === 'all' ? 'selected' : ''}>Alle Units gleich</option>
        </select>
        <small>Aus dieser Unit kommen die neuen Wörter zuerst, und für sie gilt das Testdatum. Ältere Units werden mit höchstens ${OLD_PER_DAY} Karten pro Tag eingestreut. „Alle gleich“ passt, wenn eine Schularbeit mehrere Units abfragt.</small></label>` : ''}
      <label class="field"><b>Testdatum</b>
        <span class="daterow"><input id="set-test" type="date" value="${esc(s.testDate)}">${s.testDate ? '<button class="link" type="button" data-act="clearTest">löschen</button>' : ''}</span>
        <small>Mit Datum verteilt die App alle neuen Wörter rechtzeitig und holt am Tag vor dem Test jede Karte noch einmal heraus.</small></label>
      ${toggleHTML('strictTo', '„to“ bei Verben verlangen', 'Ohne „to“ gibt es im Probetest nur einen halben Punkt.')}
      ${toggleHTML('autoSpeak', 'Wörter vorlesen', 'Britische Aussprache. Ab Stufe 3 kommen auch Hör-Aufgaben.')}
      ${toggleHTML('sfx', 'Töne & Vibration', '')}
    </div>
    <button class="btn big" type="button" data-act="about">So funktioniert’s</button>
    <div class="panel form">
      <div class="field"><b>Fortschritt sichern</b>
        <small>Der Code enthält den ganzen Fortschritt. Damit kannst du alles wiederherstellen, z. B. auf einem neuen Handy.</small></div>
      <div class="two"><button class="btn" type="button" data-act="exportCode">Code kopieren</button><button class="btn" type="button" data-act="importCode">Code einfügen</button></div>
    </div>
    <button class="btn danger big" type="button" data-act="reset">Fortschritt löschen</button>
    <p class="fineprint center">Word Legends · ${WORDS.length} Wörter · ${window.UNITS.map(u => esc(u.title)).join(', ')}</p>
  </section>`;

  $('#set-name').addEventListener('change', e => { S.settings.name = e.target.value.trim().slice(0, 20); save(); });
  const focusSel = $('#set-focus');
  if (focusSel) focusSel.addEventListener('change', e => { S.settings.focus = e.target.value; save(); toast('Schwerpunkt gespeichert.'); });
  $('#set-test').addEventListener('change', e => {
    const v = e.target.value;
    if (v && daysBetween(today(), v) < 0) { toast('Das Datum liegt in der Vergangenheit.'); e.target.value = S.settings.testDate; return; }
    S.settings.testDate = v;
    save();
    settings();
    if (v) toast(`Test ${inDays(daysBetween(today(), v))} – alles klar!`);
  });
  app.querySelectorAll('[data-set]').forEach(el => el.addEventListener('change', () => {
    S.settings[el.dataset.set] = el.checked;
    save();
    if (el.checked && el.dataset.set === 'sfx') { sfx('ok'); haptic(); }
    if (el.checked && el.dataset.set === 'autoSpeak') speak('Hello!');
  }));
}

function about() {
  screen = 'about';
  stopFx();
  const kid = S.settings.name ? esc(S.settings.name) : 'dein Kind';
  app.innerHTML = `
  <section class="screen about">
    ${topbar('So funktioniert’s', 'settings')}
    <div class="panel prose">
      <h2>Kurz gesagt</h2>
      <ul>
        <li><b>Jeden Tag eine Mission</b>, meistens 5–10 Minuten.</li>
        <li><b>Eine Karte steigt höchstens eine Stufe pro Tag</b> – und nur, wenn sie geladen ist. Viel auf einmal pauken bringt deshalb nichts, regelmäßig üben schon.</li>
        <li><b>Fehler sind okay.</b> Die Karte fällt zwei Stufen zurück und kommt morgen wieder. Genau so lernt dein Kopf am meisten.</li>
      </ul>
    </div>
    <div class="panel prose">
      <h2>Für Eltern: die Methode dahinter</h2>
      <p><b>Abrufen statt Anschauen.</b> Jede Aufgabe verlangt, dass ${kid} das Wort selbst aus dem Gedächtnis holt. Sich selbst abzufragen bringt deutlich mehr, als die Liste wieder und wieder zu lesen (Testing-Effekt).</p>
      <p><b>Verteilte Wiederholung.</b> Karteikasten nach Leitner, als Kartenstufen: Pausen von 1, 2, 4, 7, 14 und 30 Tagen. Nur der erste Versuch des Tages zählt, deshalb bringt Pauken am selben Tag keine Stufe. Ein Fehler kostet zwei Stufen, ein Tippfehler hält die Karte auf ihrer Stufe.</p>
      <p><b>Üben wie im Test.</b> Hauptaufgabe ist Deutsch → Englisch tippen, mit genauer Rechtschreibprüfung und ausgeschalteter Autokorrektur. Multiple Choice gibt es nur beim Kennenlernen neuer Wörter.</p>
      <p><b>Fehler sofort ausbessern.</b> Nach einem Fehler wird das Wort einmal richtig abgeschrieben und kommt in derselben Runde noch einmal dran (Look – Cover – Write – Check).</p>
      <p><b>Kontext und Aussprache.</b> Die Beispielsätze aus dem Buch werden zu Lückensätzen, dazu britische Aussprache und ab Stufe 3 Hördiktate.</p>
      <p><b>Kleine Portionen.</b> Standardmäßig 8 neue Wörter pro Tag, gemischt mit Wiederholungen. Gegensatzpaare wie open/close und leicht verwechselbare Wörter wie their/your/our kommen nie am selben Tag neu dazu.</p>
      <p><b>Testdatum.</b> In den Einstellungen eintragen: Dann kommen alle neuen Wörter rechtzeitig dran, und am Tag vor dem Test wird jede Karte noch einmal abgefragt.</p>
      <p><b>Neue Units.</b> Die neueste Unit hat Vorrang: Ihre Wörter kommen zuerst, und das Testdatum gilt für sie. Ältere Units laufen im Hintergrund weiter. Ihre Karten kommen in immer längeren Abständen wieder, höchstens ${OLD_PER_DAY} pro Tag, damit nichts vergessen wird und die Runde trotzdem kurz bleibt.</p>
    </div>
  </section>`;
}

// ---------- Zusammenfassung ----------
function summary(s, extra) {
  screen = 'summary';
  $('#toast').classList.remove('show');
  const L = levelInfo(S.stats.xp);
  const streak = S.stats.streak;
  const title = s.mode === 'mission' ? 'Mission geschafft!' : 'Runde geschafft!';
  const parade = (items, label) => items.length ? `
    <h2 class="sub">${label}</h2>
    <div class="parade">${items.map((it, i) => {
      const w = BY_ID[it.id];
      return `<div class="pcard" style="--tier:var(--t${it.lv});--d:${i * 70}ms">
        <span class="mband ${it.lv === 6 ? 'holo' : ''}">${it.tag}</span><b>${esc(w.en)}</b></div>`;
    }).join('')}</div>` : '';
  app.innerHTML = `
  <section class="screen summary">
    <h1 class="outline hero center">${title}</h1>
    ${extra.streakUp && streak ? `<p class="streak-up">🔥 ${streak === 1 ? 'Tag 1 – der Anfang!' : `${streak} Tage in Folge!`}</p>` : ''}
    <div class="statrow">
      <div class="stat"><b>${s.right}/${s.first}</b><span>richtig</span></div>
      <div class="stat"><b>+${s.xp}</b><span>XP</span></div>
      ${!s.ups.length && s.collected.length
        ? `<div class="stat"><b>${s.collected.length}</b><span>Neue Karten</span></div>`
        : `<div class="stat"><b>${s.ups.length}</b><span>Level-ups</span></div>`}
    </div>
    ${parade(s.ups.map(u => ({ id: u.id, lv: u.to, tag: u.to === 6 ? '👑 Legendär' : `▲ Stufe ${u.to}` })), 'Level-ups')}
    ${parade(s.collected.map(id => ({ id, lv: 1, tag: 'Neu' })), 'Neu gesammelt')}
    <div class="panel lvlbox">
      <div class="lvlrow"><b>Level ${L.lvl}</b><span>${L.title}</span>${L.lvl > s.lvlBefore ? '<em>Level up!</em>' : ''}</div>
      <div class="xpbar"><i style="width:${Math.round(L.into / L.need * 100)}%"></i></div>
      <small>noch ${L.need - L.into} XP bis Level ${L.lvl + 1}</small>
    </div>
    <button class="btn go big" type="button" data-act="home">Fertig</button>
  </section>`;
  confetti();
  sfx('level');
}

// ================================================================
// Abfrage-Runde
// ================================================================
let SES = null;
let E = {};

function startSession(mode, queue) {
  if (!queue.length) { toast('Gerade gibt es nichts zu üben.'); return home(); }
  refreshStreak();
  SES = {
    mode, queue, total: queue.length, cur: null, phase: '', done: 0,
    xp: 0, combo: 0, first: 0, right: 0, ups: [], collected: [], scored: new Set(),
    results: [], hintUsed: false, emptyOnce: false, lvlBefore: levelInfo(S.stats.xp).lvl
  };
  sessionShell();
  next();
}
function startMission() { startSession('mission', buildMission(newQuota())); }

function sessionShell() {
  screen = 'session';
  stopFx();
  document.body.classList.add('in-session');
  app.innerHTML = `
  <section class="session">
    <header class="ses-top">
      <button class="icon-btn" type="button" data-act="quit" aria-label="Runde beenden">✕</button>
      <div class="bar"><i id="ses-bar"></i></div>
      <div class="combo" id="ses-combo" aria-live="polite"></div>
    </header>
    <div class="ses-label"><span class="chip" id="ses-chip"></span><span class="tools" id="ses-tools"></span></div>
    <div class="ses-cardwrap" id="ses-wrap"><article class="vcard" id="ses-card" aria-live="polite"></article></div>
    <div class="choices" id="ses-choices" hidden></div>
    <form class="answer" id="ses-form" autocomplete="off" novalidate hidden>
      <input id="ses-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="go" aria-label="Deine Antwort">
      <button class="btn go big" id="ses-main" type="submit">Prüfen</button>
    </form>
    <button class="btn go big" id="ses-next" type="button" data-act="next" hidden>Weiter</button>
  </section>`;
  E = {
    card: $('#ses-card'), wrap: $('#ses-wrap'), chip: $('#ses-chip'), tools: $('#ses-tools'),
    choices: $('#ses-choices'), form: $('#ses-form'), input: $('#ses-input'), main: $('#ses-main'),
    next: $('#ses-next'), bar: $('#ses-bar'), combo: $('#ses-combo')
  };
  E.form.addEventListener('submit', e => { e.preventDefault(); onSubmit(); });
  // Während der Rückmeldung bleibt die Tastatur offen, aber Tippen wird ignoriert (Enter = Weiter)
  E.input.addEventListener('beforeinput', e => { if (SES && SES.phase === 'feedback') e.preventDefault(); });
  syncViewport();
}

function bar() {
  const total = SES.done + SES.queue.length + (SES.cur ? 1 : 0);
  E.bar.style.width = (total ? SES.done / total * 100 : 100) + '%';
  E.combo.innerHTML = SES.combo >= 2 ? `🔥${SES.combo}` : '';
}

function mode(kind, label) {
  const typing = kind === 'type';
  E.form.hidden = !typing;
  E.choices.hidden = kind !== 'choices';
  E.next.hidden = kind !== 'next';
  if (label) E.next.textContent = label;
  if (typing) focusInput(); else E.input.blur();
}
function focusInput() {
  try { E.input.focus({ preventScroll: true }); } catch (e) { E.input.focus(); }
}

function next() {
  if (!SES) return;
  if (SES.cur) SES.done++;
  if (!SES.queue.length) { SES.cur = null; return finish(); }
  SES.cur = SES.queue.shift();
  showTask();
}

function showTask() {
  const t = SES.cur, w = BY_ID[t.id], st = S.w[t.id];
  const lv = st ? st.lv : 0;
  SES.phase = t.type === 'intro' ? 'intro' : 'answer';
  SES.hintUsed = false;
  SES.emptyOnce = false;
  bar();
  E.choices.innerHTML = '';
  E.tools.innerHTML = '';
  E.input.value = '';
  E.input.className = '';
  E.input.placeholder = 'auf Englisch …';
  E.main.textContent = t.type === 'test' ? 'Weiter' : 'Prüfen';

  let chip = '', band = tierBand(lv, null, inFocus(w) ? '' : unitTitle(w.unit)), body = '', kind = 'type';
  switch (t.type) {
    case 'intro':
      chip = 'Schau dir die Schreibweise genau an';
      band = `<div class="band new"><span>Neue Karte</span><span>✦</span></div>`;
      body = `<div class="row"><div class="en">${esc(w.en)}</div>${sayBtn(w)}</div>
        <div class="de">${esc(w.de)}</div>
        ${w.exPlain ? `<p class="ex">${exHTML(w)}</p>` : ''}
        ${w.tip ? `<p class="tip">💡 ${esc(w.tip)}</p>` : ''}`;
      kind = 'next';
      break;
    case 'mcEnDe': {
      chip = 'Auf Deutsch?';
      body = `<div class="row"><div class="en">${esc(w.en)}</div>${sayBtn(w)}</div>`;
      const opts = shuffle([w, ...distractors(w, 3)]);
      E.choices.innerHTML = opts.map(o => `<button class="btn choice" type="button" data-act="choice" data-ok="${o === w ? 1 : 0}">${esc(o.de)}</button>`).join('');
      kind = 'choices';
      break;
    }
    case 'type':
    case 'test':
      chip = t.type === 'test' ? `Frage ${SES.done + 1} von ${SES.total}` : 'Auf Englisch?';
      if (t.type === 'test') band = `<div class="band test"><span>Probetest</span><span>${SES.done + 1}/${SES.total}</span></div>`;
      body = `<div class="q">${esc(w.de)}</div>${w.hint ? `<div class="qhint">(${esc(w.hint)})</div>` : ''}`;
      break;
    case 'cloze':
      chip = 'Was fehlt?';
      body = `<p class="cloze">${clozeHTML(w)}</p><div class="qhint">${esc(w.de)}</div>`;
      break;
    case 'listen':
      chip = 'Hör zu & schreib';
      body = `<button class="bigsay keepfocus" type="button" data-act="say" data-say="${esc(w.say)}">🔊<span>Nochmal hören</span></button>
        <button class="link keepfocus" type="button" data-act="showDe">Kein Ton? Deutsch zeigen</button>
        <div class="qhint" id="listen-de" hidden>${esc(w.de)}</div>`;
      break;
  }
  if (t.type === 'type' || t.type === 'cloze' || t.type === 'listen') {
    E.tools.innerHTML = `<button class="tool keepfocus" type="button" data-act="hint">💡 Tipp</button><button class="tool keepfocus" type="button" data-act="idk">Weiß nicht</button>`;
  }
  E.chip.textContent = chip;
  E.card.innerHTML = band + `<div class="cbody">${body}</div>`;
  E.wrap.scrollTop = 0;
  restartAnim(E.card, 'pop');
  mode(kind, t.type === 'intro' ? 'Gemerkt – jetzt tippen' : 'Weiter');
  if (t.type === 'intro' || t.type === 'mcEnDe') autoSay(w);
  if (t.type === 'listen') speak(w.say);
}

// Neue Karte: Wort verdecken, aus dem Kopf tippen
function startMemo() {
  const t = SES.cur, w = BY_ID[t.id];
  if (!S.w[t.id]) {
    collect(t.id);
    SES.collected.push(t.id);
    addXP(XP.intro);
    save();
  }
  SES.phase = 'answer';
  E.chip.textContent = 'Jetzt du: auf Englisch?';
  E.card.innerHTML = `<div class="band new"><span>Neue Karte</span><span>✦</span></div>
    <div class="cbody"><div class="q">${esc(w.de)}</div>${w.hint ? `<div class="qhint">(${esc(w.hint)})</div>` : ''}
    <p class="covered">Das englische Wort ist jetzt verdeckt. Schreib es aus dem Kopf.</p></div>`;
  restartAnim(E.card, 'flip');
  mode('type');
}

function onNext() {
  if (!SES) return;
  if (SES.phase === 'intro') return startMemo();
  if (SES.phase === 'feedback') return next();
}

function onSubmit() {
  if (!SES || !SES.cur) return;
  const t = SES.cur, val = E.input.value;
  if (SES.phase === 'feedback') return next();
  if (SES.phase === 'retype') return retype(val);
  if (SES.phase !== 'answer') return;
  if (t.type === 'test') return testAnswer(val);
  if (!norm(val)) { shake(E.input); focusInput(); return; }
  const r = check(BY_ID[t.id], val, t.type === 'cloze' ? 'cloze' : 'type');
  let res = r.res;
  if (SES.hintUsed && (res === 'ok' || res === 'noTo')) res = 'hint';
  resolve(res, { r, input: val });
}

function onChoice(btn) {
  if (!SES || SES.phase !== 'answer') return;
  const ok = btn.dataset.ok === '1';
  E.choices.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.ok === '1') b.classList.add('right');
  });
  if (!ok) { btn.classList.add('wrong'); shake(btn); }
  resolve(ok ? 'ok' : 'wrong', { input: ok ? '' : btn.textContent });
}

function push(task, offset) { SES.queue.splice(Math.min(offset, SES.queue.length), 0, task); }

function addXP(n) {
  if (!n) return;
  S.stats.xp += n;
  if (SES) SES.xp += n;
}

function resolve(res, info) {
  const t = SES.cur, st = S.w[t.id];
  const good = res === 'ok' || res === 'noTo';

  SES.first++;
  S.stats.answers++;
  if (good) { SES.right++; S.stats.right++; st.ok++; }
  else if (res !== 'hint') st.bad++;

  let sched = null;
  if (t.scored && !SES.scored.has(t.id)) {
    SES.scored.add(t.id);
    sched = review(t.id, res);
    if (sched.to > sched.from) SES.ups.push({ id: t.id, from: sched.from, to: sched.to });
  }

  let xp = 0;
  if (good) {
    xp = res === 'noTo' ? XP.noTo : t.type === 'intro' ? XP.memo : t.type === 'mcEnDe' ? XP.mc : XP.type;
    SES.combo++;
    if (SES.combo % 5 === 0) { xp += XP.combo; toast(`Combo ×${SES.combo}! +${XP.combo} XP`); }
  } else {
    xp = res === 'hint' ? XP.hint : res === 'typo' ? XP.typo : 0;
    SES.combo = 0;
  }
  if (sched && sched.to > sched.from) xp += XP.levelUp;
  addXP(xp);

  // In dieser Runde noch einmal: neue Wörter zweimal, Fehler bis zu zweimal
  const again = (t.re || 0) + 1;
  if (t.type === 'intro') {
    push({ id: t.id, type: 'mcEnDe', practice: true }, 2);
    push({ id: t.id, type: 'type', practice: true }, 5);
  } else if (!good && again <= 2) {
    push({ id: t.id, type: t.type === 'mcEnDe' ? 'mcEnDe' : 'type', practice: true, re: again }, res === 'hint' ? 5 : 4);
  }

  save();
  feedback(res, info, sched, xp);
}

function feedback(res, info, sched, xp) {
  const t = SES.cur, w = BY_ID[t.id];
  const good = res === 'ok' || res === 'noTo' || res === 'hint';
  const typed = t.type !== 'mcEnDe';
  const needRetype = typed && (res === 'typo' || res === 'wrong');
  SES.phase = needRetype ? 'retype' : 'feedback';

  const r = info.r || {};
  const titles = {
    ok: t.type === 'intro' ? 'Super, gemerkt!' : 'Richtig!',
    noTo: 'Richtig – fast perfekt',
    hint: 'Richtig – mit Tipp',
    typo: 'Fast! Ein Tippfehler',
    wrong: r.confused ? 'Verwechselt!' : info.idk ? 'Kein Problem' : 'Nicht ganz'
  };
  const cls = good ? 'good' : res === 'typo' ? 'almost' : 'bad';
  let body = '';
  if (t.type === 'cloze') body += `<p class="ex big">${exHTML(w)}</p>`;
  body += `<div class="pair"><div class="pair-txt"><span class="de">${esc(w.de)}</span><span class="en sm">${esc(w.en)}</span></div>${sayBtn(w)}</div>`;
  const typedVal = (info.input || '').trim();
  if (res === 'typo') body += `<div class="yours">Du: <s>${esc(typedVal)}</s> · richtig: <span class="fix">${diffMark(typedVal, r.near)}</span></div>`;
  else if (res === 'wrong' && typedVal && !info.idk) body += `<div class="yours">Du: <s>${esc(typedVal)}</s></div>`;
  if (r.confused) body += `<p class="note">${esc(r.confused.en)} heißt „${esc(r.confused.de)}“.</p>`;
  if (res === 'noTo') body += `<p class="note">Bei Verben gehört das <b>to</b> dazu: <b>${esc(w.en)}</b></p>`;
  if (t.type !== 'cloze' && w.exPlain) body += `<p class="ex">${exHTML(w)}</p>`;
  if (w.tip) body += `<p class="tip">💡 ${esc(w.tip)}</p>`;
  if (sched) {
    const d = inDays(daysBetween(today(), effDue(w)));
    if (sched.to > sched.from) body += `<p class="sched up">${sched.to === 6 ? '👑 Legendär!' : `▲ Stufe ${sched.to}!`} Wieder geladen ${d}.</p>`;
    else if (sched.to < sched.from) body += `<p class="sched down">▼ Zurück auf Stufe ${sched.to} – kommt ${d} wieder.</p>`;
    else if (!good || res === 'hint') body += `<p class="sched">Bleibt auf Stufe ${sched.to} – kommt ${d} wieder.</p>`;
  }
  if (needRetype) body += `<p class="retype">Schreib es einmal richtig ab:</p>`;

  const up = sched && sched.to > sched.from;
  const xpTxt = xp ? `+${xp} XP` : '';
  const badge = up
    ? `<div class="lvup ${sched.to === 6 ? 'holo' : ''}" style="--tier:var(--t${sched.to})">${sched.to === 6 ? '👑 Legendär' : '▲ Stufe ' + sched.to}</div>` : '';
  E.card.innerHTML = `<div class="band ${cls}"><span>${titles[res]}${up && xpTxt ? ' · ' + xpTxt : ''}</span><span>${up ? '' : xpTxt}</span></div>${badge}<div class="cbody">${body}</div>`;
  E.wrap.scrollTop = 0;
  restartAnim(E.card, good ? 'pop' : 'nudge');
  E.tools.innerHTML = '';
  bar();

  if (good) sfx('ok'); else sfx('bad');
  haptic();
  if (sched && sched.to > sched.from) setTimeout(() => sfx('level'), 260);
  autoSay(w);

  if (typed) {
    E.input.className = needRetype ? 'retype' : cls;
    if (needRetype) {
      E.input.value = '';
      E.input.placeholder = t.type === 'cloze' ? w.gap : w.main;
      E.main.textContent = 'Prüfen';
    } else {
      E.main.textContent = 'Weiter';
    }
    focusInput();
  } else {
    mode('next', 'Weiter');
  }
}

function retype(val) {
  const t = SES.cur, w = BY_ID[t.id];
  const r = check(w, val, t.type === 'cloze' ? 'cloze' : 'type');
  if (r.res === 'ok') { sfx('tap'); return next(); }
  shake(E.input);
  if (r.res === 'noTo') toast('Mit „to“ davor!');
  focusInput();
}

function testAnswer(val) {
  const t = SES.cur, w = BY_ID[t.id], st = S.w[t.id];
  if (!norm(val) && !SES.emptyOnce) {
    SES.emptyOnce = true;
    shake(E.input);
    toast('Weißt du es nicht? Nochmal „Weiter“ lässt es leer.');
    focusInput();
    return;
  }
  const r = check(w, val, 'type');
  const pts = r.res === 'ok' ? 1 : (r.res === 'noTo' || r.res === 'typo') ? 0.5 : 0;
  SES.results.push({ id: t.id, input: val.trim(), res: r.res, pts });
  S.stats.answers++;
  if (pts === 1) { S.stats.right++; st.ok++; }
  else {
    st.bad++;
    const tm = addDays(today(), 1);   // Fehler aus dem Probetest kommen spätestens morgen dran
    if (st.due > tm) st.due = tm;
  }
  save();
  sfx('tap');
  next();
}

function hint() {
  if (!SES || SES.phase !== 'answer' || SES.hintUsed) return;
  const t = SES.cur, w = BY_ID[t.id];
  SES.hintUsed = true;
  const target = t.type === 'cloze' ? w.gap : w.main;
  E.card.querySelector('.cbody').insertAdjacentHTML('beforeend', `<div class="pattern">${esc(pattern(target))}</div>`);
  const b = E.tools.querySelector('[data-act="hint"]');
  if (b) b.disabled = true;
  focusInput();
}

function idk() {
  if (!SES || SES.phase !== 'answer') return;
  resolve('wrong', { idk: true, input: '' });
}

async function quit() {
  if (!SES) return home();
  const s = SES;
  E.input.blur();
  const choice = await sheet(`<h2 class="sheet-title">Runde beenden?</h2><p>Alles, was du bis jetzt geübt hast, ist gespeichert.</p>`,
    [{ label: 'Weiterüben', value: 'stay', cls: 'go' }, { label: 'Beenden', value: 'quit' }]);
  if (choice !== 'quit') {
    if (SES === s && !E.form.hidden) focusInput();
    return;
  }
  if (s.mode !== 'test' && s.first >= 10) { markDay(); save(); }
  home();
}

function finish() {
  const s = SES;
  E.input.blur();
  SES = null;
  document.body.classList.remove('in-session');
  if (s.mode === 'test') { markDay(); S.stats.sessions++; save(); return testResult(s); }
  if (s.mode === 'mission' && !missionDue().length && !pickNew(newQuota()).length) { S.stats.xp += XP.mission; s.xp += XP.mission; }
  const streakUp = markDay();
  S.stats.sessions++;
  save();
  summary(s, { streakUp });
}

// ================================================================
// Export / Import / Reset
// ================================================================
async function exportCode() {
  const code = 'WL1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  try {
    await navigator.clipboard.writeText(code);
    toast('Code kopiert. Am besten in eine Notiz einfügen.');
  } catch (e) {
    sheet(`<h2 class="sheet-title">Dein Sicherungs-Code</h2><p>Alles markieren und kopieren:</p><textarea class="code" readonly>${esc(code)}</textarea>`,
      [{ label: 'Fertig', value: null, cls: 'go' }]);
  }
}
async function importCode() {
  importBuffer = '';
  const val = await sheet(`<h2 class="sheet-title">Code einfügen</h2><p>Achtung: Das ersetzt den Fortschritt auf diesem Gerät.</p><textarea class="code" id="imp" placeholder="WL1:…"></textarea>`,
    [{ label: 'Wiederherstellen', value: 'go', cls: 'go' }, { label: 'Abbrechen', value: null }]);
  if (val !== 'go') return;
  const raw = importBuffer;
  try {
    const txt = raw.trim().replace(/^WL1:/, '');
    const obj = JSON.parse(decodeURIComponent(escape(atob(txt))));
    if (!obj || typeof obj.w !== 'object' || !obj.settings) throw new Error('kein Word-Legends-Code');
    S = upgrade(obj);
    save();
    toast('Fortschritt wiederhergestellt ✓');
    home();
  } catch (e) {
    toast('Der Code passt nicht. Bitte ganz kopieren.');
  }
}
let importBuffer = '';
document.addEventListener('input', e => { if (e.target && e.target.id === 'imp') importBuffer = e.target.value; });

async function resetAll() {
  const v = await sheet(`<h2 class="sheet-title">Fortschritt löschen?</h2><p>Alle Karten, XP und der Streak gehen verloren. Name und Einstellungen bleiben.</p>`,
    [{ label: 'Ja, alles löschen', value: 'yes', cls: 'danger' }, { label: 'Abbrechen', value: null, cls: 'go' }]);
  if (v !== 'yes') return;
  const keep = { settings: S.settings, ui: S.ui };
  S = fresh();
  S.settings = keep.settings;
  S.ui = keep.ui;
  save();
  toast('Alles zurückgesetzt.');
  home();
}

// ================================================================
// Aktionen
// ================================================================
const ACT = {
  home: () => home(),
  start: () => startMission(),
  extraNew: () => startSession('extra', buildMission(5)),
  practiceHard: () => startSession('practice', buildPractice(hardestIds(10))),
  trainMisses: () => startSession('practice', buildPractice(lastMisses)),
  cards: b => cards(b.dataset.lv !== undefined ? b.dataset.lv : 'all'),
  filter: b => cards(b.dataset.f),
  card: b => cardDetail(b.dataset.id),
  test: () => testSetup(),
  testGo: b => startSession('test', buildTest(+b.dataset.n, b.dataset.sel)),
  testUnit: b => testSetup(b.dataset.sel),
  settings: () => settings(),
  about: () => about(),
  next: () => onNext(),
  quit: () => quit(),
  say: b => { speak(b.dataset.say); if (SES && !E.form.hidden) focusInput(); },
  showDe: b => { const d = $('#listen-de'); if (d) d.hidden = false; b.remove(); focusInput(); },
  hint: () => hint(),
  idk: () => idk(),
  choice: b => onChoice(b),
  setNew: b => { S.settings.newPerDay = +b.dataset.n; save(); settings(); },
  clearTest: () => { S.settings.testDate = ''; save(); settings(); },
  exportCode: () => exportCode(),
  importCode: () => importCode(),
  reset: () => resetAll(),
  hideInstall: () => { S.ui.hideInstall = true; save(); home(); }
};

app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const fn = ACT[b.dataset.act];
  if (fn) fn(b, e);
});
// Tipp-/Lautsprecher-Knöpfe sollen die Tastatur nicht schließen
app.addEventListener('mousedown', e => { if (e.target.closest('.keepfocus')) e.preventDefault(); });

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && screen === 'home') home();
});

// Nur zum Testen am Mac: WL.shiftDays(1) springt einen Tag weiter
window.WL = {
  get state() { return S; },
  today,
  check: (id, input, kind) => check(BY_ID[id], input, kind || 'type'),
  get ses() { return SES && { cur: SES.cur, phase: SES.phase, word: SES.cur && BY_ID[SES.cur.id], left: SES.queue.length }; },
  shiftDays(n) {
    dayOffset += n;
    try { sessionStorage.setItem('wl.dayOffset', String(dayOffset)); } catch (e) { /* egal */ }
    if (screen === 'home') home();
    return today();
  }
};

// ================================================================
// Start
// ================================================================
syncViewport();
if (S.ui.onboarded) home(); else welcome();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
})();
