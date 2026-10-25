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

// Grammatik-Karten (grammar.js) laufen im selben Karteikasten wie die Vokabeln
const TOPICS = window.GRAMMAR || [];
const TOPIC = Object.create(null);
const GITEMS = [];
for (const t of TOPICS) {
  TOPIC[t.id] = t;
  t.items.forEach((it, i) => {
    it.kind = 'g';
    it.topic = t.id;
    it.unit = t.unit;
    it.seq = i;
    prepGram(it, t);
    GITEMS.push(it);
    BY_ID[it.id] = it;
  });
}
const CARDS = WORDS.concat(GITEMS);
const EXAM = window.EXAM || null;
// Reihenfolge, in der die Grammatik-Themen neu dazukommen (je drei Karten im Wechsel)
const TOPIC_ORDER = ['tobe', 'plural', 'prep', 'therebe', 'questions', 'imper'].filter(id => TOPIC[id]);

function prep(w) {
  w.kind = 'v';
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
  w.rank = hash(w.id);   // feste, gemischte Reihenfolge für neue Wörter
}

// "She [is] 11." → Lücke mit erlaubten Antworten · order: Satz aus Wort-Kärtchen
function prepGram(it, t) {
  it.rank = hash(it.id);
  if (it.order) {
    it.form = 'order';
    it.end = (it.order.match(/[.!?]+$/) || [''])[0];
    const words = it.order.replace(/[.!?]+$/, '').replace(/,/g, '').split(/\s+/);
    // Erstes Wort klein, damit die Großschreibung nichts verrät (außer bei I / I'm)
    it.tokens = words.map((x, i) => (i === 0 && !/^I('m)?$/.test(x) ? x.toLowerCase() : x));
    it.full = it.order;
    it.main = it.order;
  } else {
    it.form = it.pic ? 'pic' : 'gap';
    const m = it.q.match(/^(.*?)\[([^\]]+)\](.*)$/);
    it.pre = m[1];
    it.post = m[3];
    it.answers = m[2].split('|');
    it.main = it.answers[0];
    it.accept = new Set(it.answers.map(norm));
    it.full = it.pre + it.main + it.post;
    it.choices = it.opts || t.opts || null;
  }
  it.say = it.full.split('→').pop().replace(/\s+–\s+/g, ' – ').trim();
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
  // Ein Wort mit ähnlicher Bedeutung (to talk statt to speak) gilt als „fast richtig“
  const syn = (w.syn || []).map(id => BY_ID[id]).find(o => o && (o.accept.has(n) || o.acceptNoTo.has(n)));
  if (syn) return { res: 'typo', near: norm(w.main), syn };
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

// Grammatik: hier zählt jeder Buchstabe (babys statt babies ist ein Grammatikfehler, kein Tippfehler).
// Nur ein vergessener Apostroph (Im statt I'm) gilt als „fast“.
function checkGram(it, input) {
  const n = norm(input);
  if (!n) return { res: 'wrong', empty: true };
  if (it.accept.has(n)) return { res: 'ok' };
  const noApo = s => s.replace(/'/g, '');
  for (const a of it.accept) if (noApo(a) === noApo(n)) return { res: 'typo', near: a, apo: true };
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
    g: {},          // Grammatik-Thema → Tag, an dem die Regelkarte zum ersten Mal kam
    ticks: {},      // Schularbeits-Zettel: abgehakte Punkte (Listening, Reading)
    write: {},      // Schreibaufgaben: gespeicherter Text, geschaffte Sätze
    stats: { xp: 0, streak: 0, best: 0, lastDay: '', answers: 0, right: 0, sessions: 0 },
    day: { date: '', newCount: 0, gCount: 0 },
    ui: { hideInstall: false, onboarded: false }
  };
}
function upgrade(s) {
  const d = fresh();
  const obj = x => (x && typeof x === 'object' ? x : {});
  return {
    v: 1,
    settings: { ...d.settings, ...(s.settings || {}) },
    w: obj(s.w),
    g: obj(s.g),
    ticks: obj(s.ticks),
    write: obj(s.write),
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
// Schularbeit (exam.js): bis zum Datum zählen alle genannten Units gleich
function examActive() { return !!EXAM && today() <= EXAM.date; }
// Ein selbst eingetragenes Testdatum gilt vor der Schularbeit aus exam.js
function testDate() {
  if (S.settings.testDate && S.settings.testDate >= today()) return S.settings.testDate;
  return examActive() ? EXAM.date : '';
}
function examMode() { return examActive() && testDate() === EXAM.date; }

// Schwerpunkt-Unit: bekommt die neuen Wörter zuerst, alle Wiederholungen und das Testdatum.
// Ältere Units werden nur eingestreut. null = alle Units gleich (nur eine Unit, oder so eingestellt).
function focusUnit() {
  const f = S.settings.focus;
  if (UNITS.length < 2 || f === 'all') return null;
  if (f && f !== 'auto' && UNITS.some(u => u.id === f)) return f;
  return UNITS[UNITS.length - 1].id;
}
// Units mit Vorrang; in der Schularbeits-Zeit sind das alle Units der Schularbeit
function focusSet() {
  if (examActive()) return EXAM.units;
  const f = focusUnit();
  return f ? [f] : null;
}
function inFocus(c) { const f = focusSet(); return !f || f.includes(c.unit); }
function unitTitle(id) { const u = UNITS.find(x => x.id === id); return u ? u.title : id; }
function unitIndex(c) { return UNITS.findIndex(u => u.id === c.unit); }

// Mit Testdatum wird keine Karte erst nach dem Test fällig. Bei der Schularbeit (viele Karten)
// verteilt sich der Endspurt auf die letzten drei Tage; schwache Karten kommen am Tag davor.
function effDue(c) {
  const st = S.w[c.id], t = testDate();
  if (t && inFocus(c)) {
    const days = daysBetween(today(), t);
    if (days >= 1) {
      const back = examMode() ? (st.lv <= 2 ? 1 : 1 + (c.rank % 3)) : 1;
      const cap = addDays(t, -back);
      if (st.last && st.last >= cap) return st.due;   // im Endspurt schon drangekommen
      // Schularbeit: kurz vorher sicher gewusst (ab Stufe 3) – dann braucht es keine Extra-Runde
      if (examMode() && st.lv >= 3 && st.last && daysBetween(st.last, t) <= 6) return st.due;
      return st.due < cap ? st.due : cap;
    }
  }
  return st.due;
}
// Eine Karte ist "geladen", wenn ihre Pause vorbei ist – höchstens einmal pro Tag
function isDue(c) { const st = S.w[c.id]; return !!st && st.lv >= 1 && st.last !== today() && effDue(c) <= today(); }
function dueWords() { return WORDS.filter(isDue); }
function dueCards() { return CARDS.filter(isDue); }
// Für die Mission: alles Geladene mit Vorrang, aus älteren Units höchstens OLD_PER_DAY pro Tag
const REVIEW_CAP = 55;   // Schularbeits-Zeit: höchstens so viele Wiederholungen pro Tag
const EXAM_DAY_CAP = 15; // am Tag der Schularbeit nur eine kurze Aufwärmrunde
function urgency(a, b) {
  return (S.w[a.id].lv - S.w[b.id].lv) || (effDue(a) < effDue(b) ? -1 : effDue(a) > effDue(b) ? 1 : 0);
}
function missionDue() {
  const due = examMode() ? capReviews(dueCards()) : dueCards();
  if (!focusSet()) return due;
  const t = today();
  const oldDone = CARDS.filter(c => !inFocus(c) && S.w[c.id] && S.w[c.id].last === t && S.w[c.id].since !== t).length;
  const old = due.filter(c => !inFocus(c))
    .sort((a, b) => (effDue(a) < effDue(b) ? -1 : effDue(a) > effDue(b) ? 1 : S.w[a.id].lv - S.w[b.id].lv))
    .slice(0, Math.max(0, OLD_PER_DAY - oldDone));
  return due.filter(inFocus).concat(old);
}
// Die wackeligsten zuerst; was heute schon wiederholt wurde, zählt mit
function capReviews(due) {
  const t = today();
  const done = CARDS.filter(c => S.w[c.id] && S.w[c.id].last === t && S.w[c.id].since !== t).length;
  const cap = today() === EXAM.date ? EXAM_DAY_CAP : REVIEW_CAP;
  return due.slice().sort(urgency).slice(0, Math.max(0, cap - done));
}
// Neue Wörter: Units mit Vorrang zuerst. In der Schularbeits-Zeit bunt gemischt, sonst Unit für Unit.
function unseenWords() {
  const mixed = examActive();
  return WORDS.filter(w => !S.w[w.id])
    .sort((a, b) => (inFocus(b) - inFocus(a)) || (mixed ? 0 : unitIndex(a) - unitIndex(b)) || (a.rank - b.rank));
}
// Neue Grammatik-Karten: je drei Karten pro Thema im Wechsel, Extra-Karten ganz zum Schluss
function unseenGram() {
  const lists = TOPIC_ORDER.map(id => TOPIC[id].items.filter(it => !S.w[it.id] && !it.bonus && inFocus(it)));
  const out = [];
  while (lists.some(l => l.length)) for (const l of lists) out.push(...l.splice(0, 3));
  for (const id of TOPIC_ORDER) out.push(...TOPIC[id].items.filter(it => !S.w[it.id] && it.bonus && inFocus(it)));
  return out;
}
function collectedWords() { return WORDS.filter(w => S.w[w.id]); }
function collectedCards() { return CARDS.filter(c => S.w[c.id]); }
function newToday(kind = 'v') {
  if (S.day.date !== today()) return 0;
  return kind === 'g' ? (S.day.gCount || 0) : S.day.newCount;
}

const GRAM_PER_DAY = 6;
// kind 'v' = Vokabeln, 'g' = Grammatik
function newQuota(kind = 'v') {
  const unseen = kind === 'g' ? unseenGram() : unseenWords();
  const done = newToday(kind);
  let per = kind === 'g' ? GRAM_PER_DAY : S.settings.newPerDay;
  const t = testDate();
  if (t) {
    const days = daysBetween(today(), t);
    const forTest = unseen.filter(inFocus).length;
    // Neues bis wenige Tage vor dem Test verteilen – die letzten Tage gehören der Wiederholung
    const lead = examMode() ? 2 : 1;
    if (days >= 1 && forTest) per = Math.max(per, Math.ceil((forTest + done) / Math.max(1, days - lead)));
  }
  let q = Math.max(0, Math.min(unseen.length, per - done));
  if (kind === 'g' && q > 0) q = Math.min(unseen.length, Math.ceil(q / 3) * 3);   // ganze Dreiergruppen
  return q;
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
  const td = testDate();
  const testSoon = td && daysBetween(t, td) <= 2;
  while (testSoon && picked.length < n && held.length) picked.push(held.shift());
  return picked;
}
// Neue Grammatik-Karten: höchstens drei neue Themen pro Tag
function pickGram(n) {
  if (n <= 0) return [];
  const t = today();
  let newTopics = TOPICS.filter(tp => S.g[tp.id] === t).length;
  const started = new Set();
  const picked = [];
  for (const it of unseenGram()) {
    if (picked.length >= n) break;
    if (!S.g[it.topic] && !started.has(it.topic)) {
      if (newTopics >= 3) continue;
      newTopics++;
      started.add(it.topic);
    }
    picked.push(it);
  }
  return picked;
}
function newCounts() {
  return { v: pickNew(newQuota('v')).length, g: pickGram(newQuota('g')).length };
}

function collect(id, lv = 1) {
  const t = today(), c = BY_ID[id];
  S.w[id] = { lv, due: addDays(t, INTERVALS[lv] || 1), last: t, ok: 0, bad: 0, since: t };
  if (S.day.date !== t) S.day = { date: t, newCount: 0, gCount: 0 };
  if (c && c.kind === 'g') S.day.gCount = (S.day.gCount || 0) + 1;
  else S.day.newCount++;
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
  const onlyRestDays = CARDS.every(c => S.w[c.id] && S.w[c.id].due > yesterday);
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

// Neue Vokabeln: erst abfragen („Kennst du das schon?“). Neue Grammatik: je Thema ein Paket,
// beim ersten Mal mit Regelkarte. Die Pakete werden zwischen die Wiederholungen gemischt.
function buildMission(vN, gN) {
  const reviews = shuffle(missionDue()).map(c => ({ id: c.id, type: c.kind === 'g' ? 'grev' : reviewType(c, S.w[c.id].lv), scored: true }));
  const vocab = pickNew(vN).map(w => [{ id: w.id, type: 'probe' }]);
  const byTopic = new Map();
  for (const it of pickGram(gN)) {
    if (!byTopic.has(it.topic)) byTopic.set(it.topic, []);
    byTopic.get(it.topic).push(it);
  }
  const gram = [];
  for (const [tid, its] of byTopic) {
    const pack = S.g[tid] ? [] : [{ id: its[0].id, type: 'grule', topic: tid }];
    its.forEach(it => pack.push({ id: it.id, type: 'gnew' }));
    gram.push(pack);
  }
  const packs = [];
  const step = Math.max(1, Math.floor(vocab.length / (gram.length + 1)));
  let gi = 0;
  vocab.forEach((p, i) => {
    packs.push(p);
    if (gi < gram.length && (i + 1) % step === 0) packs.push(gram[gi++]);
  });
  while (gi < gram.length) packs.push(gram[gi++]);

  const q = [];
  let r = 0, n = 0;
  while (r < reviews.length || n < packs.length) {
    if (q.length < 2 && r < reviews.length) { q.push(reviews[r++]); continue; }
    if (n < packs.length) q.push(...packs[n++]);
    for (let k = 0; k < 2 && r < reviews.length; k++) q.push(reviews[r++]);
  }
  return q;
}
function practiceType(id) { return BY_ID[id].kind === 'g' ? 'grev' : 'type'; }
function buildPractice(ids) { return shuffle(ids).map(id => ({ id, type: practiceType(id), practice: true })); }
function hardestIds(n) {
  const score = st => st.bad - st.ok * 0.25;
  return collectedCards()
    .sort((a, b) => (S.w[a.id].lv - S.w[b.id].lv) || (score(S.w[b.id]) - score(S.w[a.id])))
    .slice(0, n).map(c => c.id);
}
function buildTest(n, sel) {
  const pool = collectedWords().filter(w => !sel || sel === 'all' || w.unit === sel);
  return shuffle(pool).slice(0, n).map(w => ({ id: w.id, type: 'test' }));
}
// Gezielt ein Grammatik-Thema üben: erst Geladenes, dann Neues, dann der Rest zum Festigen
function buildTopic(tid) {
  const items = TOPIC[tid].items;
  const due = items.filter(isDue).map(it => ({ id: it.id, type: 'grev', scored: true }));
  const fresh = items.filter(it => !S.w[it.id]).slice(0, Math.max(0, 8 - due.length)).map(it => ({ id: it.id, type: 'gnew' }));
  const rest = shuffle(items.filter(it => S.w[it.id] && !isDue(it)))
    .slice(0, Math.max(0, 10 - due.length - fresh.length)).map(it => ({ id: it.id, type: 'grev', practice: true }));
  return [...due, ...fresh, ...rest];
}
// Generalprobe: so viele Aufgaben pro Teil wie in einer kurzen Schularbeit
const EXAM_PARTS = [['plural', 4], ['tobe', 4], ['therebe', 3], ['prep', 3], ['questions', 3], ['imper', 3]];
function buildExam() {
  const pick = (list, n) => shuffle(list.filter(c => S.w[c.id])).concat(shuffle(list.filter(c => !S.w[c.id]))).slice(0, n);
  const tasks = [];
  const units = EXAM ? EXAM.units : UNITS.map(u => u.id);
  const perUnit = Math.ceil(12 / units.length);
  units.forEach(u => pick(WORDS.filter(w => w.unit === u), perUnit).forEach(w => tasks.push({ id: w.id, type: 'test', sec: 'v' })));
  EXAM_PARTS.forEach(([tid, n]) => pick(TOPIC[tid].items, n).forEach(it => tasks.push({ id: it.id, type: 'gtest', sec: tid })));
  const room = makeRoom(4);
  tasks.push({ id: 'w', type: 'wtest', sec: 'write', room, target: 0 }, { id: 'w', type: 'wtest', sec: 'write', room, target: 1 });
  return tasks;
}

// ================================================================
// Schreiben (S.B. S. 20, Üb. 12): Bild beschreiben und Federpennal
// ================================================================
const OBJ_EN = {
  book: { sg: ['book'], pl: ['books'] },
  pen: { sg: ['pen'], pl: ['pens'] },
  pencil: { sg: ['pencil'], pl: ['pencils'] },
  ruler: { sg: ['ruler'], pl: ['rulers'] },
  rubber: { sg: ['rubber'], pl: ['rubbers'] },
  pencilcase: { sg: ['pencil case'], pl: ['pencil cases'] },
  schoolbag: { sg: ['school bag', 'schoolbag', 'bag'], pl: ['school bags', 'schoolbags', 'bags'] },
  ball: { sg: ['ball'], pl: ['balls'] },
  gluestick: { sg: ['glue stick'], pl: ['glue sticks'] },
  sharpener: { sg: ['pencil sharpener', 'sharpener'], pl: ['pencil sharpeners', 'sharpeners'] }
};
const OBJ_DE = {
  book: 'Buch', pen: 'Füllfeder', pencil: 'Bleistift', ruler: 'Lineal', rubber: 'Radiergummi', pencilcase: 'Federpennal',
  schoolbag: 'Schultasche', ball: 'Ball', gluestick: 'Klebestift', sharpener: 'Spitzer'
};
const COL_EN = ['red', 'yellow', 'blue', 'green', 'orange', 'brown', 'pink', 'white', 'black', 'grey'];
const NUM_EN = ['', 'one', 'two', 'three', 'four', 'five'];
const PREP_EN = ['in front of', 'next to', 'behind', 'under', 'on', 'in'];
const ROOM_SPOTS = {
  book: ['on-desk', 'under-desk', 'on-chair', 'under-chair'],
  pen: ['on-desk', 'on-chair'],
  pencil: ['on-desk', 'on-chair'],
  ruler: ['on-desk', 'on-chair', 'under-desk'],
  rubber: ['on-desk', 'on-chair'],
  pencilcase: ['on-desk', 'on-chair', 'under-desk'],
  schoolbag: ['under-desk', 'next-desk', 'next-chair', 'front-desk', 'on-chair'],
  ball: ['under-desk', 'under-chair', 'next-chair', 'next-desk', 'front-desk', 'on-chair']
};
const SPOT_ROOM = { 'on-desk': 3, 'under-desk': 2, 'next-desk': 1, 'on-chair': 1, 'under-chair': 1, 'next-chair': 1, 'front-desk': 1 };
const MANY = { pen: 3, pencil: 3, book: 2, ball: 2 };

function makeRoom(n) {
  const free = { ...SPOT_ROOM };
  const colours = shuffle(COL_EN);
  const out = [];
  for (const obj of shuffle(Object.keys(ROOM_SPOTS))) {
    if (out.length >= n) break;
    const spot = shuffle(ROOM_SPOTS[obj]).find(s => free[s] > 0);
    if (!spot) continue;
    free[spot]--;
    const cnt = MANY[obj] && Math.random() < 0.45 ? 2 + Math.floor(Math.random() * (MANY[obj] - 1)) : 1;
    out.push({ obj, colour: colours[out.length], n: cnt, place: spot });
  }
  return out;
}
function makeCase() {
  const colours = shuffle(COL_EN.filter(c => c !== 'white'));
  const objs = shuffle(['pen', 'pencil', 'ruler', 'rubber', 'gluestick', 'sharpener']).slice(0, 3 + (Math.random() < 0.5 ? 1 : 0));
  return objs.map((obj, i) => ({ obj, colour: colours[i], n: (obj === 'pen' || obj === 'pencil') && Math.random() < 0.6 ? 2 + Math.floor(Math.random() * 2) : 1 }));
}
function roomFacts(it) { const p = Scene.PLACES[it.place]; return { obj: it.obj, n: it.n, colour: it.colour, prep: p.prep, ref: p.ref }; }
function nounOf(obj, n) { return n > 1 ? OBJ_EN[obj].pl[0] : OBJ_EN[obj].sg[0]; }
function article(word) { return /^[aeiou]/.test(word) ? 'an' : 'a'; }
function modelRoom(f) {
  const noun = nounOf(f.obj, f.n);
  const art = f.n > 1 ? NUM_EN[f.n] : article(f.colour);
  return [`There ${f.n > 1 ? 'are' : 'is'} ${art} ${f.colour} ${noun} ${f.prep} the ${f.ref}.`,
    `The ${f.colour} ${noun} ${f.n > 1 ? 'are' : 'is'} ${f.prep} the ${f.ref}.`];
}
function modelCase(items) {
  const parts = items.map(f => `there ${f.n > 1 ? 'are' : 'is'} ${f.n > 1 ? NUM_EN[f.n] : article(f.colour)} ${f.colour} ${nounOf(f.obj, f.n)}`);
  return 'In my pencil case ' + (parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0]) + '.';
}
// Satz für die Prüfung vereinfachen: klein, ohne Satzzeichen, Kurzformen ausgeschrieben
function plain(text) {
  return ' ' + norm(text).replace(/-/g, ' ').replace(/\bthere's\b/g, 'there is').replace(/\bit's\b/g, 'it is')
    .replace(/\bthey're\b/g, 'they are').replace(/\bgray\b/g, 'grey').replace(/\s+/g, ' ').trim() + ' ';
}
// Alle Dinge, die im Text vorkommen – mit Farbe, Anzahl und dem davorstehenden there is/are
function findThings(s) {
  const forms = [];
  for (const [obj, f] of Object.entries(OBJ_EN)) {
    f.pl.forEach(x => forms.push([obj, x, true]));
    f.sg.forEach(x => forms.push([obj, x, false]));
  }
  forms.sort((a, b) => b[1].length - a[1].length);
  let text = s;
  const found = [];
  for (const [obj, form, plural] of forms) {
    let at = text.indexOf(' ' + form + ' ');
    while (at >= 0) {
      found.push({ obj, plural, form, pos: at });
      text = text.slice(0, at + 1) + '#'.repeat(form.length) + text.slice(at + 1 + form.length);
      at = text.indexOf(' ' + form + ' ');
    }
  }
  found.sort((a, b) => a.pos - b.pos);
  for (const f of found) {
    const before = s.slice(0, f.pos).trim().split(' ');
    let k = before.length - 1;
    const colours = [];
    while (k >= 0 && (COL_EN.includes(before[k]) || before[k] === 'and' || before[k] === 'light' || before[k] === 'dark')) {
      if (COL_EN.includes(before[k])) colours.push(before[k]);
      k--;
    }
    f.colours = colours;
    f.det = k >= 0 ? before[k] : '';
    const num = NUM_EN.indexOf(f.det);
    f.count = num > 0 ? num : /^\d$/.test(f.det) ? +f.det : (f.det === 'a' || f.det === 'an') ? 1 : null;
    const head = s.slice(0, f.pos);
    const iIs = head.lastIndexOf(' there is '), iAre = head.lastIndexOf(' there are ');
    f.verb = iIs > iAre ? 'is' : iAre > iIs ? 'are' : null;
    // there is/are steht direkt vor diesem Ding (nur Zahl/Farben dazwischen)?
    const vpos = Math.max(iIs, iAre);
    f.direct = vpos >= 0 && s.slice(vpos, f.pos).trim().split(' ').length <= 3 + colours.length;
  }
  return found;
}

// Ein Satz zum markierten Ding im Bild: stimmen Ding, Farbe, Ort, is/are, a/an?
function checkRoomSentence(text, f) {
  const raw = text.trim();
  const res = { ok: [], bad: [], tips: [] };
  if (raw.split(/\s+/).length < 3) { res.bad.push('Schreib einen ganzen Satz.'); res.score = 0; return res; }
  const s = plain(raw);
  const things = findThings(s);
  const pl = f.n > 1;
  const th = things.find(x => x.obj === f.obj) || things[0];
  if (!th) res.bad.push(`Welches Ding ist markiert? ${pl ? `${f.n} × ` : ''}${OBJ_DE[f.obj]} – wie heißt das auf Englisch?`);
  else if (th.obj !== f.obj) res.bad.push(`Markiert ist kein „${th.form}“ – schau nochmal aufs Bild.`);
  else if (th.plural !== pl) res.bad.push(pl ? `Es sind ${f.n} – Mehrzahl: ${nounOf(f.obj, 2)}` : `Es ist nur eins – Einzahl: ${nounOf(f.obj, 1)}`);
  else res.ok.push('Ding');

  const cols = s.trim().split(' ').filter(x => COL_EN.includes(x));
  if (!cols.length) res.bad.push('Welche Farbe hat es? Schreib die Farbe dazu.');
  else if (!cols.includes(f.colour)) res.bad.push('Die Farbe stimmt nicht – schau nochmal genau.');
  else res.ok.push('Farbe');

  let prep = null, ref = null;
  for (const p of PREP_EN) {
    const m = s.match(new RegExp(` ${p} (the|my|your|a) (desk|chair|table) `));
    if (m) { prep = p; ref = m[2] === 'table' ? 'desk' : m[2]; break; }
  }
  if (!prep) {
    const p2 = PREP_EN.find(p => new RegExp(` ${p} (desk|chair) `).test(s));
    res.bad.push(p2 ? `Vor desk / chair fehlt „the“: ${p2} the …` : 'Wo ist es? Schreib dazu, wo: on the desk, under the chair …');
  } else if (prep !== f.prep || ref !== f.ref) res.bad.push(`Stimmt der Ort? Schau nochmal genau, wo es ist.`);
  else res.ok.push('Ort');

  const thereIs = / there is /.test(s), thereAre = / there are /.test(s);
  if (thereIs && pl) res.bad.push('Mehrere → There are …');
  else if (thereAre && !pl) res.bad.push('Nur eins → There is …');
  else if (!thereIs && !thereAre) {
    const isV = / is /.test(s), areV = / are /.test(s);
    if (!isV && !areV) res.bad.push(`Es fehlt ${pl ? 'are' : 'is'}: The ${nounOf(f.obj, f.n)} ${pl ? 'are' : 'is'} …`);
    else if (isV && pl && !areV) res.bad.push(`Mehrere → are: The ${nounOf(f.obj, 2)} are …`);
    else if (areV && !pl && !isV) res.bad.push(`Nur eins → is: The ${nounOf(f.obj, 1)} is …`);
    else res.ok.push('is/are');
  } else res.ok.push('is/are');

  if (thereIs && !pl && th && th.obj === f.obj && th.direct && th.count !== 1) res.bad.push('Nach There is kommt a oder an: There is a …');
  if (/ a (orange|apple|insect|exercise) /.test(s)) res.bad.push('Vor a, e, i, o, u heißt es an: an orange …');
  if (/ an (red|yellow|blue|green|brown|pink|white|black|grey|book|pen|pencil|ruler|rubber|ball|school|glue|desk|chair) /.test(s)) res.bad.push('Hier heißt es a, nicht an.');
  if (pl && thereAre && th && th.obj === f.obj && th.count == null) res.tips.push(`Schreib dazu, wie viele: There are ${NUM_EN[f.n]} …`);
  else if (pl && th && th.plural && th.count && th.count !== f.n) res.bad.push(`Zähl nochmal: Es sind ${f.n} (${NUM_EN[f.n]}).`);

  if (raw[0] !== raw[0].toUpperCase()) res.tips.push('Satzanfang groß schreiben.');
  if (!/[.!]$/.test(raw)) res.tips.push('Am Ende fehlt der Punkt.');
  res.score = res.bad.length === 0 ? 2 : res.ok.length >= 3 ? 1 : 0;
  return res;
}

// Federpennal (Üb. 12 A): kommen alle Sachen vor – mit Anzahl, Farbe und dem richtigen there is/are?
function checkCaseText(text, items) {
  const raw = text.trim();
  const res = { ok: [], bad: [], tips: [] };
  // „In my pencil case …“ ist der Behälter, kein Ding im Federpennal
  const s = plain(raw).replace(/ (in|inside) (my|the|your) pencil case /g, ' ');
  const things = findThings(s);
  for (const f of items) {
    const th = things.find(x => x.obj === f.obj);
    const name = `${f.n > 1 ? NUM_EN[f.n] + ' ' : ''}${f.colour} ${nounOf(f.obj, f.n)}`;
    if (!th) { res.bad.push(`Es fehlt: ${OBJ_DE[f.obj]}${f.n > 1 ? ` (${f.n} Stück)` : ''}`); continue; }
    const errs = [];
    if (th.plural !== (f.n > 1)) errs.push(f.n > 1 ? `Mehrzahl: ${nounOf(f.obj, 2)}` : `Einzahl: ${nounOf(f.obj, 1)}`);
    if (f.n > 1 && th.count && th.count !== f.n) errs.push(`es sind ${NUM_EN[f.n]}`);
    if (f.n > 1 && !th.count) errs.push(`wie viele? ${NUM_EN[f.n]}`);
    if (f.n === 1 && th.direct && th.count !== 1) errs.push(`mit ${article(th.colours[th.colours.length - 1] || nounOf(f.obj, 1))} davor`);
    if (!th.colours.length) errs.push(`Farbe fehlt (${f.colour})`);
    else if (!th.colours.includes(f.colour)) errs.push(`Farbe: ${f.colour}`);
    if (th.direct && th.verb === 'is' && f.n > 1) errs.push('mehrere → there are');
    if (th.direct && th.verb === 'are' && f.n === 1) errs.push('eins → there is');
    if (errs.length) res.bad.push(`${name}: ${errs.join(', ')}`);
    else res.ok.push(name);
  }
  const extra = things.filter(x => !items.some(f => f.obj === x.obj));
  extra.forEach(x => res.bad.push(`„${x.form}“ ist nicht im Federpennal.`));
  if (!/ there (is|are) /.test(s)) res.bad.push('Verwende there is / there are: In my pencil case there is …');
  if (/ a (orange) /.test(s)) res.bad.push('Vor orange heißt es an: an orange …');
  if (raw && raw[0] !== raw[0].toUpperCase()) res.tips.push('Satzanfang groß schreiben.');
  if (raw && !/[.!]$/.test(raw)) res.tips.push('Am Ende fehlt der Punkt.');
  res.score = res.bad.length === 0 ? 2 : res.ok.length >= Math.ceil(items.length / 2) ? 1 : 0;
  return res;
}

// Ablenker fürs Auswählen: am liebsten aus derselben Gruppe (Zahlen zu Zahlen, Farben zu Farben)
function distractors(w, k) {
  const pool = WORDS.filter(o => o !== w && o.de !== w.de);
  const same = shuffle(pool.filter(o => w.grp && o.grp === w.grp));
  const kind = shuffle(pool.filter(o => o.verb === w.verb && !(w.grp && o.grp === w.grp)));
  const rest = shuffle(pool.filter(o => o.verb !== w.verb));
  return [...same, ...kind, ...rest].slice(0, k);
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
  const nn = newCounts();
  const quota = nn.v + nn.g;
  const counts = tierCounts();
  const collected = WORDS.length - counts[0];
  const L = levelInfo(S.stats.xp);
  const streak = S.stats.streak;
  const name = S.settings.name;
  const focus = focusUnit();
  const exam = examActive();
  const eyebrow = `Heute${!exam && focus ? ` · Schwerpunkt ${esc(unitTitle(focus))}` : ''}`;

  let mission;
  if (due.length || quota) {
    const mins = Math.max(1, Math.round((due.length * 10 + nn.v * 18 + nn.g * 12) / 60));
    const oldN = due.filter(c => !inFocus(c)).length;
    const news = [];
    if (nn.v) news.push(`<b>${nn.v}</b> ${nn.v === 1 ? 'neues Wort' : 'neue Wörter'}`);
    if (nn.g) news.push(`<b>${nn.g}</b> Grammatik-${nn.g === 1 ? 'Karte' : 'Karten'}`);
    let line;
    if (due.length && news.length) line = `<b>${due.length}</b> ${due.length === 1 ? 'Karte ist' : 'Karten sind'} geladen, dazu ${news.join(' und ')}.`;
    else if (due.length) line = `<b>${due.length}</b> ${due.length === 1 ? 'Karte ist' : 'Karten sind'} geladen.`;
    else line = `${news.join(' und ')} ${quota === 1 ? 'wartet' : 'warten'} auf dich.`;
    mission = `
      <div class="eyebrow">${eyebrow}</div>
      ${handHTML(due, quota)}
      <p class="mission-line">${line}</p>
      <p class="mission-time">ca. ${mins} ${mins === 1 ? 'Minute' : 'Minuten'}${oldN ? ` · ${oldN} ${oldN === 1 ? 'Karte' : 'Karten'} aus älteren Units` : ''}</p>
      <button class="btn go big" type="button" data-act="start">Start</button>`;
  } else {
    const tomorrow = addDays(today(), 1);
    const dueTomorrow = collectedCards().filter(c => effDue(c) <= tomorrow);
    const nTomorrow = focusSet()
      ? dueTomorrow.filter(inFocus).length + Math.min(OLD_PER_DAY, dueTomorrow.filter(c => !inFocus(c)).length)
      : dueTomorrow.length;
    const extra = pickNew(5).length + pickGram(3).length;
    let next = '';
    if (nTomorrow) next = `Morgen ${nTomorrow === 1 ? 'ist' : 'sind'} <b>${nTomorrow}</b> ${nTomorrow === 1 ? 'Karte' : 'Karten'} wieder geladen.`;
    else if (collected) {
      const soon = collectedCards().map(effDue).sort()[0];
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
  const td = testDate();
  if (td && !exam) {
    const d = daysBetween(today(), td);
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
    ${exam ? examPanel() : ''}
    ${installHint}
    <div class="shelf">
      <div class="shelf-head"><h2>Deine Sammlung</h2><span>${collected} von ${WORDS.length}</span></div>
      <div class="stacks">${counts.map((c, lv) => stackHTML(lv, c)).join('')}</div>
      ${UNITS.length > 1 ? `<div class="unitline">${UNITS.slice().reverse().map(u => {
        const ws = WORDS.filter(w => w.unit === u.id);
        const got = ws.filter(w => S.w[w.id]).length;
        const legend = ws.filter(w => S.w[w.id] && S.w[w.id].lv === 6).length;
        return `<span class="${!exam && u.id === focus ? 'on' : ''}">${esc(u.title)} ${legend === ws.length ? '👑' : `${got}/${ws.length}`}</span>`;
      }).join('')}</div>` : ''}
    </div>
    <div class="two">
      <button class="btn" type="button" data-act="test">📝 Probetest</button>
      <button class="btn" type="button" data-act="cards">🃏 Karten</button>
    </div>
    <button class="btn big ghostish" type="button" data-act="rules">📘 Grammatik-Regeln</button>
  </section>`;
}

// ---------- Schularbeit: Zettel der Lehrerin mit echtem Fortschritt ----------
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
function dateLabel(ds) {
  const [y, m, d] = ds.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return `${WEEKDAYS[dt.getDay()]}, ${d}. ${MONTHS[m - 1]}`;
}
function avg(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }
// Wie sicher sitzt eine Karte? Ab Stufe 3 wurde sie nach Pausen von 1 und 2 Tagen noch gewusst
function cardScore(c) { const st = S.w[c.id]; return st ? [0, 0.35, 0.7, 1, 1, 1, 1][st.lv] : 0; }
function partProgress(p) {
  if (p.kind === 'vocab') return avg(WORDS.filter(w => w.unit === p.unit).map(cardScore));
  if (p.kind === 'gram') return avg(TOPIC[p.topic].items.filter(it => !it.bonus).map(cardScore));
  if (p.kind === 'tick') { const t = S.ticks[p.id] || []; return p.ticks.filter((_, i) => t[i]).length / p.ticks.length; }
  if (p.kind === 'write') {
    const w = S.write[p.task] || {};
    if (p.task === 'me') return w.ok ? 1 : w.text ? 0.4 : 0;
    return Math.min(1, (w.done || 0) / (p.task === 'case' ? 3 : 8));
  }
  return 0;
}
const PART_WEIGHT = { vocab: 3, gram: 1, write: 1, tick: 0.5 };
function examReadiness() {
  let sum = 0, wsum = 0;
  for (const p of EXAM.parts) { const w = PART_WEIGHT[p.kind] || 1; sum += w * partProgress(p); wsum += w; }
  return wsum ? sum / wsum : 0;
}
function face(v) { return v >= 0.85 ? '😃' : v >= 0.5 ? '🙂' : v > 0.15 ? '😐' : '😟'; }
function planTip(d) {
  if (d <= 0) return 'Heute ist die Schularbeit – viel Glück! Eine kurze Aufwärmrunde in der Früh reicht.';
  if (d === 1) return 'Morgen ist die Schularbeit. Heute die Mission und die Generalprobe – dann früh schlafen gehen, im Schlaf festigt sich das Gelernte.';
  if (d <= 3) return 'Endspurt: Jetzt kommt jede Karte noch einmal dran. Mach in diesen Tagen auch die Generalprobe.';
  return `Jeden Tag die Mission machen. Alle neuen Karten sind bis ${dateLabel(addDays(EXAM.date, -3)).split(',')[0]} verteilt, danach wird nur noch wiederholt.`;
}
function partRow(p) {
  if (p.kind === 'tick') {
    const t = S.ticks[p.id] || [];
    return p.ticks.map((txt, i) => `<label class="xtick"><input type="checkbox" data-tick="${p.id}" data-i="${i}" ${t[i] ? 'checked' : ''}><i aria-hidden="true"></i><span>${esc(txt)}</span></label>`).join('');
  }
  const v = partProgress(p);
  return `<button class="xrow" type="button" data-act="part" data-id="${p.id}">
    <span class="xlabel">${esc(p.label)}<small>${esc(p.ref || '')}</small></span>
    <span class="xbar"><i style="width:${Math.round(v * 100)}%"></i></span>
    <span class="xface" aria-label="${Math.round(v * 100)} Prozent">${face(v)}</span>
  </button>`;
}
function examPanel() {
  const d = daysBetween(today(), EXAM.date);
  const areas = [];
  for (const p of EXAM.parts) {
    let a = areas.find(x => x.name === p.area);
    if (!a) areas.push(a = { name: p.area, parts: [] });
    a.parts.push(p);
  }
  const total = examReadiness();
  const last = S.write.exam;
  return `<div class="panel exam">
    <div class="exam-head">
      <div><div class="eyebrow">${esc(EXAM.title)}</div><h2 class="exam-date">${esc(dateLabel(EXAM.date))}</h2></div>
      <div class="countdown"><b>${Math.max(0, d)}</b><span>${d === 1 ? 'Tag' : 'Tage'}</span></div>
    </div>
    <div class="ready"><div class="xpbar"><i style="width:${Math.round(total * 100)}%"></i></div><span>${Math.round(total * 100)} % bereit</span></div>
    ${areas.map(a => `<h3 class="area">${esc(a.name)}</h3>${a.parts.map(partRow).join('')}`).join('')}
    ${last ? `<p class="lastexam">Letzte Generalprobe: <b>${last.grade}</b> (${last.pct} %) am ${esc(dateLabel(last.date).split(', ')[1])}</p>` : ''}
    <div class="two exam-btns">
      ${d <= 0 ? `<button class="btn go" type="button" data-act="warmup">🔥 Aufwärmen</button>` : `<button class="btn go" type="button" data-act="examGo">📝 Generalprobe</button>`}
      <button class="btn" type="button" data-act="writeHub">✍️ Schreiben</button>
    </div>
    <p class="fineprint">${esc(planTip(d))}</p>
  </div>`;
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
        if (g && g.sec === w.sec && g.grp === (w.grp || '')) g.words.push(w);
        else groups.push({ sec: w.sec, grp: w.grp || '', words: [w] });
      }
      const head = multi ? `<h2 class="unit-head outline">${esc(u.title)} <small>${esc(u.source || '')}</small></h2>` : '';
      const label = g => g.grp ? esc(g.grp) : g.sec ? (/^\d+$/.test(g.sec) ? 'Übung ' + esc(g.sec) : 'Abschnitt im Buch') : 'Einstieg';
      return head + groups.map(g => `
        <div class="group-head"><span class="secdot">${g.sec ? esc(g.sec) : '•'}</span>${label(g)}</div>
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
  sel = sel || (multi && !examActive() && focusUnit()) || 'all';
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

// ---------- Generalprobe ----------
const SEC_LABEL = {
  v: 'Vokabeln', plural: 'Plural', tobe: 'to be', therebe: 'there is / there are', prep: 'Präpositionen',
  questions: 'Fragen', imper: 'Befehlsformen', write: 'Schreiben'
};
async function examGo() {
  const v = await sheet(`<h2 class="sheet-title">Generalprobe</h2>
    <p>Wie eine echte Schularbeit: Vokabeln, alle Grammatik-Themen und zwei Sätze zu einem Bild. Keine Tipps, die Note gibt’s am Ende.</p>
    <p class="fineprint">ca. 15 Minuten · am besten in Ruhe, ohne Ablenkung</p>`,
    [{ label: 'Los geht’s', value: 'go', cls: 'go' }, { label: 'Später', value: null }]);
  if (v === 'go') startSession('exam', buildExam());
}
function examResult(s) {
  screen = 'examresult';
  const secs = Object.keys(SEC_LABEL).map(k => {
    const rs = s.results.filter(r => r.sec === k);
    return { label: SEC_LABEL[k], pts: rs.reduce((a, r) => a + r.pts, 0), max: rs.reduce((a, r) => a + (r.max || 1), 0) };
  }).filter(x => x.max);
  const pts = secs.reduce((a, x) => a + x.pts, 0), max = secs.reduce((a, x) => a + x.max, 0);
  const pct = max ? pts / max * 100 : 0;
  const [g, gname] = gradeOf(pct);
  S.write.exam = { date: today(), pct: Math.round(pct), grade: g };
  save();
  const misses = s.results.filter(r => r.pts < (r.max || 1));
  lastMisses = misses.filter(r => BY_ID[r.id]).map(r => r.id);
  const fmt = x => String(x).replace('.', ',');
  const rowFor = r => {
    if (r.sec === 'write') {
      const cls = r.pts === 2 ? 'good' : r.pts ? 'almost' : 'bad';
      return `<div class="rrow ${cls}"><span class="rmark">${r.pts}/2</span><span class="rde">Satz zum Bild</span><span class="ren">${esc(r.model)}<small>${r.input ? 'du: ' + esc(r.input) : 'leer gelassen'}</small></span></div>`;
    }
    const c = BY_ID[r.id];
    const mark = r.pts === 1 ? '✓' : r.pts > 0 ? '½' : '✗';
    const cls = r.pts === 1 ? 'good' : r.pts > 0 ? 'almost' : 'bad';
    const q = c.kind === 'g' ? (c.form === 'order' ? c.de : c.q.replace(/\[[^\]]+\]/, '___')) : c.de;
    const a = c.kind === 'g' ? c.full : c.en;
    return `<div class="rrow ${cls}"><span class="rmark">${mark}</span><span class="rde">${esc(q)}</span><span class="ren">${esc(a)}<small>${r.input ? 'du: ' + esc(r.input) : 'leer gelassen'}</small></span></div>`;
  };
  app.innerHTML = `
  <section class="screen result">
    <h1 class="outline hero center">Generalprobe</h1>
    <div class="stamp g${g}"><b>${g}</b><span>${gname}</span></div>
    <p class="score">${fmt(pts)} von ${max} Punkten · ${Math.round(pct)} %</p>
    <div class="panel secs">${secs.map(x => `<div class="secrow"><span>${esc(x.label)}</span><span class="xbar"><i style="width:${Math.round(x.pts / x.max * 100)}%"></i></span><b>${fmt(x.pts)}/${x.max}</b></div>`).join('')}</div>
    <p class="fineprint center">Ungefähre Note – die echte Schularbeit kann anders aufgebaut sein. Alles, was falsch war, kommt ab morgen öfter dran.</p>
    ${misses.length ? `<h2 class="sub">Das übst du noch</h2><div class="panel list">${misses.map(rowFor).join('')}</div>` : ''}
    ${lastMisses.length ? `<button class="btn go big" type="button" data-act="trainMisses">Fehler üben (${lastMisses.length})</button>` : ''}
    <button class="btn big" type="button" data-act="home">Fertig</button>
  </section>`;
  if (g <= 2) confetti();
  sfx(g <= 3 ? 'level' : 'tap');
}
// Aufwärmen am Tag der Schularbeit: vor allem sichere Karten, ein paar wackelige
function buildWarmup() {
  const got = collectedCards();
  const strong = shuffle(got.filter(c => S.w[c.id].lv >= 3)).slice(0, 8);
  const weak = shuffle(got.filter(c => S.w[c.id].lv < 3)).slice(0, 4);
  return buildPractice(shuffle([...strong, ...weak]).map(c => c.id));
}

// ---------- Grammatik-Regeln ----------
const BOOK_ORDER = ['plural', 'questions', 'imper', 'tobe', 'therebe', 'prep'];
function rulesScreen() {
  screen = 'rules';
  stopFx();
  app.innerHTML = `<section class="screen rules-screen">
    ${topbar('Grammatik')}
    <p class="lead">Alle Regeln für die Schularbeit – zum Nachlesen und gezielt Üben.</p>
    <div class="rlist">${BOOK_ORDER.filter(id => TOPIC[id]).map(id => {
      const tp = TOPIC[id];
      const v = avg(tp.items.filter(i => !i.bonus).map(cardScore));
      return `<button class="xrow big" type="button" data-act="topic" data-t="${id}">
        <span class="xlabel">${esc(tp.title)}<small>${esc(tp.sub)} · ${esc(tp.page)}</small></span>
        <span class="xbar"><i style="width:${Math.round(v * 100)}%"></i></span><span class="xface">${face(v)}</span></button>`;
    }).join('')}</div>
  </section>`;
}
function topicScreen(tid) {
  screen = 'topic';
  stopFx();
  const tp = TOPIC[tid];
  if (!S.g[tid]) { S.g[tid] = today(); save(); }
  const v = avg(tp.items.filter(i => !i.bonus).map(cardScore));
  const got = tp.items.filter(i => S.w[i.id]).length;
  app.innerHTML = `<section class="screen topic">
    ${topbar(esc(tp.title), 'rules')}
    <article class="vcard"><div class="band rule"><span>${esc(tp.sub)}</span><span>${esc(tp.page)}</span></div><div class="cbody rulebody">${ruleHTML(tp)}</div></article>
    <div class="panel lvlbox">
      <div class="lvlrow"><b>${Math.round(v * 100)} %</b><span>sicher</span><span class="facebig">${face(v)}</span></div>
      <div class="xpbar"><i style="width:${Math.round(v * 100)}%"></i></div>
      <small>${got} von ${tp.items.length} Karten gesammelt</small>
    </div>
    <button class="btn go big" type="button" data-act="topicGo" data-t="${tid}">Jetzt üben</button>
  </section>`;
}

// ---------- Schreiben ----------
function writeHub() {
  screen = 'write';
  stopFx();
  const w = S.write;
  const cs = (w.case && w.case.done) || 0, sc = (w.scene && w.scene.done) || 0, me = w.me || {};
  const card = (act, title, ref, desc, status, v) => `<div class="panel wcard">
    <div class="wtop"><div><div class="eyebrow">${esc(ref)}</div><h2>${esc(title)}</h2></div><span class="facebig">${face(v)}</span></div>
    <p>${esc(desc)}</p><p class="fineprint">${esc(status)}</p>
    <button class="btn go big" type="button" data-act="${act}">Los</button></div>`;
  app.innerHTML = `<section class="screen writehub">
    ${topbar('Schreiben')}
    <p class="lead">Wie in der Schularbeit: ganze Sätze mit <b>there is / there are</b>, Farben und Präpositionen. Die App prüft jeden Satz.</p>
    ${card('writeCase', 'Was ist in meinem Federpennal?', 'S.B. S. 20 · Übung 12 A', 'Schau ins Federpennal und schreib, was drin ist – mit Anzahl und Farbe.', `${cs} von 3 perfekt geschafft`, Math.min(1, cs / 3))}
    ${card('writeScene', 'Bild beschreiben', 'S.B. S. 20 · Übung 12 B', 'Wo liegt das markierte Ding, und welche Farbe hat es? Ein Satz pro Ding.', `${sc} von 8 Sätzen perfekt`, Math.min(1, sc / 8))}
    ${card('writeMe', 'Mein Text: ich & mein Klassenzimmer', 'S.B. S. 15 · Übung 18', 'Wie Mikes Text: wer du bist, wie dein Klassenzimmer aussieht und deine Schulsachen.', me.ok ? 'Fertig ✓ – du kannst ihn jederzeit verbessern.' : me.text ? 'Angefangen – prüf ihn noch.' : 'Noch nicht geschrieben', me.ok ? 1 : me.text ? 0.4 : 0)}
  </section>`;
}
function startWriteCase() { startSession('write', [{ id: 'w', type: 'wcase', items: makeCase() }, { id: 'w', type: 'wcase', items: makeCase() }]); }
function startWriteScene() {
  const room = makeRoom(4);
  startSession('write', [0, 1, 2, 3].map(i => ({ id: 'w', type: 'wscene', room, target: i })));
}

const ME_STARTERS = ["I'm …", "I'm … years old.", "I'm in class …", 'In my classroom, the floor is …', 'The desks and the chairs are …', 'The door is …', 'The board is …', 'My pencil case is …', '… is my favourite colour.'];
function writeMe() {
  screen = 'writeme';
  stopFx();
  const me = S.write.me || {};
  app.innerHTML = `<section class="screen writeme">
    ${topbar('Mein Text', 'writeHub')}
    <div class="panel"><div class="eyebrow">So schreibt Mike · S.B. S. 15</div>
      <div class="pair"><p class="model mike">${esc(EXAM ? EXAM.model : '')}</p>${sayBtnText(EXAM ? EXAM.model : '')}</div></div>
    <div class="panel form">
      <b>Jetzt du: Schreib über dich, dein Klassenzimmer und deine Schulsachen. Mindestens 5 Sätze.</b>
      <div class="starters">${ME_STARTERS.map(s => `<button class="chipbtn" type="button" data-act="starter" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <textarea id="me-text" rows="9" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="I'm …">${esc(me.text || '')}</textarea>
      <button class="btn go big" type="button" data-act="checkMe">Text prüfen</button>
      <div id="me-result"></div>
    </div>
    <p class="fineprint center">Tipp: Zeig deinen Text danach auch Mama oder Papa.</p>
  </section>`;
  const ta = $('#me-text');
  ta.addEventListener('input', () => { S.write.me = { ...(S.write.me || {}), text: ta.value, ok: false }; save(); });
}
function insertStarter(s) {
  const ta = $('#me-text');
  if (!ta) return;
  const before = s.startsWith('…');
  const clean = s.replace(/\s*…\s*/g, before ? ' ' : ' ').replace(/^ /, '').replace(/ years old\.$/, ' years old.').trimEnd();
  const text = ta.value.replace(/\s+$/, '');
  const sep = text ? (/[.!?]$/.test(text) ? ' ' : '. ') : '';
  let ins, caret;
  if (before) { ins = sep + clean; caret = (text + sep).length; }
  else if (/ years old\.$/.test(clean)) { ins = sep + clean.replace(/ years old\.$/, ''); caret = (text + ins).length; ins += ' years old.'; }
  else { ins = sep + clean + ' '; caret = (text + ins).length; }
  ta.value = text + ins;
  ta.focus();
  ta.setSelectionRange(caret, caret);
  ta.dispatchEvent(new Event('input'));
}

let LEX = null;
function lexicon() {
  if (LEX) return LEX;
  LEX = new Set();
  const add = t => String(t || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).forEach(x => {
    if (!x) return;
    LEX.add(x);
    LEX.add(x.replace(/'s$/, ''));
  });
  WORDS.forEach(w => { add(w.en); add(w.exPlain); (w.alt || []).forEach(add); });
  GITEMS.forEach(it => add(it.full));
  add(EXAM && EXAM.model);
  add("i i'm am is are isn't aren't not a an the and or my your our his her their in on under next to behind front of it it's its this that these those there there's they they're we we're he he's she she's you you're me us from years year old class email address favourite colour colours light dark with have has got like likes love very big small too also but school teacher teachers friend friends name many some lots lot near room classroom wall walls thanks hello hi best brother sister mum dad football");
  [...LEX].forEach(x => { if (/^[a-z]+$/.test(x)) { LEX.add(x + 's'); LEX.add(x + 'es'); } });
  return LEX;
}
const ROOM_WORDS = ['floor', 'desk', 'desks', 'chair', 'chairs', 'door', 'doors', 'board', 'window', 'windows', 'wall', 'walls', 'projector', 'sound system', 'classroom'];
const THING_WORDS = ['pencil case', 'pen', 'pens', 'pencil', 'pencils', 'ruler', 'rulers', 'rubber', 'school bag', 'scissors', 'glue stick', 'exercise book', 'pencil sharpener', 'tablet', 'paintbrush', 'watercolours', 'book', 'books'];
const PL_NOUNS = new Set(['desks', 'chairs', 'doors', 'windows', 'books', 'pens', 'pencils', 'rulers', 'rubbers', 'walls', 'children', 'scissors', 'watercolours', 'sunglasses', 'socks', 'shoes', 'friends']);
const SG_NOUNS = new Set(['desk', 'chair', 'door', 'window', 'board', 'floor', 'book', 'pen', 'pencil', 'ruler', 'rubber', 'wall', 'classroom', 'bag', 'case', 'tablet', 'projector', 'sharpener', 'colour']);

function checkMeText(text) {
  const raw = text.trim();
  // E-Mail-Adressen haben Punkte, die kein Satzende sind
  const noMail = raw.replace(/\S+@\S+?(?=[.!?]?(\s|$))/g, 'Mail');
  const s = plain(noMail);
  const sentences = (noMail.match(/[^.!?]+[.!?]*/g) || []).map(x => x.trim()).filter(x => /[a-z]/i.test(x));
  const has = list => list.filter(x => s.includes(' ' + x + ' ')).length;
  const out = [];
  const add = (ok, label, hint) => out.push({ ok, label, hint });
  add(sentences.length >= 5, `Mindestens 5 Sätze (du hast ${sentences.length})`, 'Schreib noch ein paar Sätze dazu.');
  const badStart = sentences.filter(x => x[0] !== x[0].toUpperCase()).length;
  const badEnd = sentences.filter(x => !/[.!?]$/.test(x)).length;
  add(!badStart && !badEnd, 'Jeder Satz beginnt groß und endet mit einem Punkt', badStart ? `${badStart} Satz/Sätze beginnen klein.` : `${badEnd} Satz/Sätze ohne Punkt am Ende.`);
  add(!/(^|[^A-Za-z'])i(\s|'m\b)/.test(raw), '„I“ immer groß geschrieben', 'Ich heißt immer I – auch mitten im Satz.');
  add(/ (i'm|i am|my name is) /.test(s), 'Über dich (I’m …, My name is …)', 'Fang mit dir an: I’m … I’m … years old.');
  add(has(ROOM_WORDS) >= 2, 'Dein Klassenzimmer (floor, desks, chairs, door, board …)', 'Beschreib dein Klassenzimmer: In my classroom, the floor is …');
  add(has(THING_WORDS) >= 1, 'Deine Schulsachen (pencil case, pen, ruler …)', 'Schreib über deine Schulsachen: My pencil case is …');
  add(s.trim().split(' ').filter(x => COL_EN.includes(x)).length >= 3, 'Mindestens 3 Farben', 'Welche Farben haben die Dinge?');
  const gram = [];
  for (const m of s.matchAll(/ (\w+) is /g)) if (PL_NOUNS.has(m[1])) gram.push(`${m[1]} is → ${m[1]} are`);
  for (const m of s.matchAll(/ (\w+) are /g)) if (SG_NOUNS.has(m[1])) gram.push(`${m[1]} are → ${m[1]} is`);
  if (/ there is (two|three|four|five|many|\d+) /.test(s)) gram.push('there is + mehrere → there are');
  if (/ there are (a|an|one) /.test(s)) gram.push('there are + eins → there is');
  if (/ a (orange|apple|insect|exercise) /.test(s)) gram.push('a orange → an orange');
  if (/ i (is|are) /.test(s)) gram.push("I is → I am (I'm)");
  if (/ (he|she|it) are /.test(s)) gram.push('he/she/it are → is');
  if (/ (we|they|you) is /.test(s)) gram.push('we/they/you is → are');
  add(!gram.length, 'is / are und there is / there are richtig', gram.join(' · '));
  // Rechtschreibung: nur kleingeschriebene Wörter prüfen – Großgeschriebenes können Namen sein
  const lex = lexicon();
  const unknown = [...new Set((noMail.replace(/[‘’]/g, "'").match(/[A-Za-z][A-Za-z']*/g) || [])
    .filter(x => /^[a-z]/.test(x) && x !== 'i' && x !== "i'm" && !lex.has(x) && !lex.has(x.replace(/'s$/, ''))))];
  const ok = out.every(c => c.ok);
  return { checks: out, unknown, ok };
}
function showMeResult() {
  const ta = $('#me-text');
  const r = checkMeText(ta.value);
  S.write.me = { text: ta.value, ok: r.ok, date: today() };
  if (r.ok) addXP(30);
  save();
  $('#me-result').innerHTML = `<ul class="checks">${r.checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✓' : '✗'} ${esc(c.label)}${c.ok ? '' : `<small>${esc(c.hint)}</small>`}</li>`).join('')}</ul>
    ${r.unknown.length ? `<p class="note">Prüf die Schreibweise: ${r.unknown.map(x => `<b>${esc(x)}</b>`).join(', ')}<br><small>Diese Wörter kennt die App nicht. Vielleicht stimmen sie trotzdem.</small></p>` : ''}
    ${r.ok ? '<p class="sched up">Stark! Dein Text hat alles, was in der Schularbeit wichtig ist. +30 XP</p>' : ''}`;
  if (r.ok) { confetti(); sfx('level'); } else sfx('tap');
}

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
        <small>${examActive() && !s.testDate ? `Die ${esc(EXAM.title)} am ${esc(dateLabel(EXAM.date))} ist schon eingeplant. Ein eigenes Datum hier geht vor.` : 'Mit Datum verteilt die App alle neuen Wörter rechtzeitig und holt am Tag vor dem Test jede Karte noch einmal heraus.'}</small></label>
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
    ${EXAM ? `<div class="panel prose">
      <h2>Schularbeits-Modus (bis ${esc(dateLabel(EXAM.date))})</h2>
      <p><b>Alles vom Zettel der Lehrerin.</b> Vokabeln von Unit 1 und 2, die sechs Grammatik-Themen aus dem Student’s Book und die beiden Schreibaufgaben. Listening und Reading macht ${kid} in digi4school und hakt es auf der Startseite ab.</p>
      <p><b>Erst abfragen, dann lernen.</b> Neue Wörter fragt die App zuerst ab. Kann ${kid} ein Wort schon, startet die Karte gleich weiter oben; nur Unbekanntes wird ausführlich gelernt. Das spart viel Zeit.</p>
      <p><b>Grammatik wie Vokabeln.</b> Jedes Thema beginnt mit der Regel aus dem Buch, danach kommen kurze Übungskarten im selben Karteikasten: zuerst auswählen, später selbst schreiben. Die Themen sind gemischt, damit ${kid} lernt, welche Regel wann gilt.</p>
      <p><b>Zeitplan.</b> Alle neuen Karten sind bis ${esc(dateLabel(addDays(EXAM.date, -3)))} verteilt. Danach wird nur noch wiederholt. Was nicht schon kurz vorher sicher gewusst wurde, kommt in den letzten drei Tagen noch einmal, Wackeliges am Tag davor. Höchstens ${REVIEW_CAP} Wiederholungen pro Tag, am Tag der Schularbeit nur eine kurze Aufwärmrunde.</p>
      <p><b>Schreiben mit Prüfung.</b> Bei den Bild- und Federpennal-Aufgaben prüft die App jeden Satz: Ding, Farbe, Ort, is/are, there is/are und a/an. Der eigene Text wird mit einer Checkliste geprüft. Am besten trotzdem einmal gemeinsam durchlesen.</p>
      <p><b>Generalprobe.</b> Eine Probe-Schularbeit mit allen Teilen und ungefährer Note. Ideal 2–3 Tage vor der Schularbeit, Fehler kommen danach öfter dran.</p>
    </div>` : ''}
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
      const c = BY_ID[it.id];
      const label = c.kind === 'g' ? (c.form === 'order' ? c.order : c.main) : c.en;
      const tag = c.kind === 'g' && it.tag === 'Neu' ? esc(TOPIC[c.topic].title) : it.tag;
      return `<div class="pcard ${c.kind === 'g' ? 'gram' : ''}" style="--tier:var(--t${it.lv});--d:${i * 70}ms">
        <span class="mband ${it.lv === 6 ? 'holo' : ''}">${tag}</span><b>${esc(label)}</b></div>`;
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
    ${parade(s.collected.map(id => ({ id, lv: S.w[id] ? S.w[id].lv : 1, tag: 'Neu' })), 'Neu gesammelt')}
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
    xp: 0, combo: 0, first: 0, right: 0, ups: [], collected: [], known: 0, scored: new Set(),
    results: [], hintUsed: false, emptyOnce: false, how: '', tiles: null, lvlBefore: levelInfo(S.stats.xp).lvl
  };
  sessionShell();
  next();
}
function startMission() { startSession('mission', buildMission(newQuota('v'), newQuota('g'))); }

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
      <textarea id="ses-area" rows="3" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" aria-label="Dein Satz" hidden></textarea>
      <button class="btn go big" id="ses-main" type="submit">Prüfen</button>
    </form>
    <button class="btn go big" id="ses-next" type="button" data-act="next" hidden>Weiter</button>
  </section>`;
  E = {
    card: $('#ses-card'), wrap: $('#ses-wrap'), chip: $('#ses-chip'), tools: $('#ses-tools'),
    choices: $('#ses-choices'), form: $('#ses-form'), input: $('#ses-input'), area: $('#ses-area'),
    main: $('#ses-main'), next: $('#ses-next'), bar: $('#ses-bar'), combo: $('#ses-combo')
  };
  E.form.addEventListener('submit', e => { e.preventDefault(); onSubmit(); });
  // Während der Rückmeldung bleibt die Tastatur offen, aber Tippen wird ignoriert (Enter = Weiter)
  const block = e => { if (SES && SES.phase === 'feedback') e.preventDefault(); };
  E.input.addEventListener('beforeinput', block);
  E.area.addEventListener('beforeinput', block);
  syncViewport();
}

function bar() {
  const total = SES.done + SES.queue.length + (SES.cur ? 1 : 0);
  E.bar.style.width = (total ? SES.done / total * 100 : 100) + '%';
  E.combo.innerHTML = SES.combo >= 2 ? `🔥${SES.combo}` : '';
}

// kind: type (Eingabefeld) · write (Textfeld für Sätze) · choices · next
function mode(kind, label) {
  const typing = kind === 'type' || kind === 'write';
  E.form.hidden = !typing;
  E.input.hidden = kind !== 'type';
  E.area.hidden = kind !== 'write';
  E.choices.hidden = kind !== 'choices';
  E.next.hidden = kind !== 'next';
  E.next.disabled = false;
  if (label) E.next.textContent = label;
  if (typing) focusInput(); else { E.input.blur(); E.area.blur(); }
}
function field() { return E.area.hidden ? E.input : E.area; }
function focusInput() {
  const f = field();
  try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
}

function next() {
  if (!SES) return;
  if (SES.cur) SES.done++;
  if (!SES.queue.length) { SES.cur = null; return finish(); }
  SES.cur = SES.queue.shift();
  showTask();
}

function showTask() {
  const t = SES.cur;
  SES.phase = t.type === 'intro' || t.type === 'grule' ? 'intro' : 'answer';
  SES.hintUsed = false;
  SES.emptyOnce = false;
  SES.tiles = null;
  SES.how = '';
  bar();
  E.choices.innerHTML = '';
  E.choices.className = 'choices';
  E.tools.innerHTML = '';
  for (const f of [E.input, E.area]) { f.value = ''; f.className = ''; }
  E.input.placeholder = 'auf Englisch …';
  const quiet = t.type === 'test' || t.type === 'gtest' || t.type === 'wtest';
  E.main.textContent = quiet ? 'Weiter' : 'Prüfen';
  E.wrap.scrollTop = 0;
  if (t.type === 'grule') return showRule(t);
  if (t.type === 'wscene' || t.type === 'wcase' || t.type === 'wtest') return showWrite(t);
  const c = BY_ID[t.id];
  if (c.kind === 'g') return showGram(t, c);
  showWord(t, c);
}

function testBand() {
  return `<div class="band test"><span>${SES.mode === 'exam' ? 'Generalprobe' : 'Probetest'}</span><span>${SES.done + 1}/${SES.total}</span></div>`;
}

function showWord(t, w) {
  const st = S.w[t.id];
  const lv = st ? st.lv : 0;
  let chip = '', band = tierBand(lv, null, inFocus(w) ? '' : unitTitle(w.unit)), body = '', kind = 'type';
  switch (t.type) {
    case 'intro':
      chip = t.fromProbe ? 'Neu für dich – schau dir die Schreibweise an' : 'Schau dir die Schreibweise genau an';
      band = `<div class="band new"><span>Neue Karte</span><span>✦</span></div>`;
      body = `<div class="row"><div class="en">${esc(w.en)}</div>${sayBtn(w)}</div>
        <div class="de">${esc(w.de)}</div>
        ${w.exPlain ? `<p class="ex">${exHTML(w)}</p>` : ''}
        ${w.tip ? `<p class="tip">💡 ${esc(w.tip)}</p>` : ''}`;
      kind = 'next';
      break;
    case 'probe':
      chip = 'Kennst du das schon?';
      band = `<div class="band new"><span>Neue Karte</span><span>?</span></div>`;
      body = `<div class="q">${esc(w.de)}</div>${w.hint ? `<div class="qhint">(${esc(w.hint)})</div>` : ''}`;
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
      if (t.type === 'test') band = testBand();
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
  if (t.type === 'probe') E.tools.innerHTML = `<button class="tool keepfocus" type="button" data-act="idk">Kenn ich noch nicht</button>`;
  E.chip.textContent = chip;
  E.card.innerHTML = band + `<div class="cbody">${body}</div>`;
  restartAnim(E.card, 'pop');
  mode(kind, t.type === 'intro' ? 'Gemerkt – jetzt tippen' : 'Weiter');
  if (t.type === 'intro' || t.type === 'mcEnDe') autoSay(w);
  if (t.type === 'listen') speak(w.say);
}

// ---------- Grammatik ----------
function ruleHTML(tp) {
  const scenes = tp.ruleScenes
    ? `<div class="rscenes">${tp.ruleScenes.map(([s, r, p, de]) => `<figure>${Scene.prep(s, r, p, { small: true })}<figcaption><b>${esc(p)}</b> ${esc(de)}</figcaption></figure>`).join('')}</div>`
    : '';
  return tp.rule + scenes;
}
function showRule(t) {
  const tp = TOPIC[t.topic];
  E.chip.textContent = 'Neue Regel – lies sie dir kurz durch';
  E.card.innerHTML = `<div class="band rule"><span>${esc(tp.title)}</span><span>${esc(tp.page)}</span></div><div class="cbody rulebody">${ruleHTML(tp)}</div>`;
  restartAnim(E.card, 'pop');
  mode('next', 'Verstanden – los geht’s');
}
function gapHTML(it, filled) {
  const gap = filled != null ? `<b class="filled">${esc(filled)}</b>` : `<span class="gap" style="--n:${Math.max(3, it.main.length)}"></span>`;
  return esc(it.pre) + gap + esc(it.post);
}
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

function showGram(t, it) {
  const st = S.w[it.id], lv = st ? st.lv : 0;
  const tp = TOPIC[it.topic];
  const test = t.type === 'gtest';
  const fresh = t.type === 'gnew';
  // Wort-Kärtchen für Satzbau, sonst am Anfang auswählen, später selbst tippen
  let how;
  if (it.form === 'order') how = 'tiles';
  else if (test) how = 'type';
  else if (it.form === 'pic') how = (fresh || lv <= 2) && it.choices ? 'choose' : 'type';
  else how = (fresh || lv <= 1) && it.choices ? 'choose' : 'type';
  SES.how = how;

  const band = test ? testBand()
    : fresh ? `<div class="band new"><span>${esc(tp.title)}</span><span>✦</span></div>`
    : tierBand(lv, null, tp.title);
  let body = '';
  if (it.form === 'pic') body += `<div class="picwrap">${Scene.prep(...it.pic)}</div>`;
  if (it.form === 'order') body += `<div class="q sm">${esc(it.de)}</div><div class="tline" id="tline"></div>`;
  else body += `<p class="gq">${gapHTML(it)}</p>${it.de ? `<div class="qhint">${esc(it.de)}</div>` : ''}`;
  E.chip.textContent = test ? `Frage ${SES.done + 1} von ${SES.total}` : how === 'tiles' ? 'Bau den Satz' : how === 'choose' ? 'Was passt in die Lücke?' : 'Füll die Lücke aus';
  E.card.innerHTML = band + `<div class="cbody">${body}</div>`;
  restartAnim(E.card, 'pop');

  if (how === 'tiles') return setupTiles(it);
  if (how === 'choose') {
    E.choices.className = it.choices.length > 4 ? 'choices grid2' : 'choices';
    E.choices.innerHTML = shuffle(it.choices).map(o =>
      `<button class="btn choice" type="button" data-act="choice" data-ok="${it.accept.has(norm(o)) ? 1 : 0}">${esc(o)}</button>`).join('');
    return mode('choices');
  }
  E.input.placeholder = 'Lücke …';
  if (!test) E.tools.innerHTML = `<button class="tool keepfocus" type="button" data-act="idk">Weiß nicht</button>`;
  mode('type');
}

function setupTiles(it) {
  const pool = shuffle(it.tokens.map((w, i) => ({ w, i })));
  if (pool.length > 1 && pool.every((p, k) => p.i === k)) pool.reverse();
  SES.tiles = { pool, placed: [] };
  mode('next', 'Prüfen');
  E.choices.hidden = false;
  renderTiles();
}
function renderTiles() {
  const it = BY_ID[SES.cur.id], T = SES.tiles;
  const line = $('#tline');
  line.innerHTML = T.placed.length
    ? T.placed.map((p, k) => `<button class="tile on" type="button" data-act="untile" data-k="${k}">${esc(k === 0 ? cap(p.w) : p.w)}</button>`).join('') + `<span class="tend">${esc(it.end)}</span>`
    : '<span class="tph">Tippe die Wörter der Reihe nach an.</span>';
  E.choices.className = 'tiles';
  E.choices.innerHTML = T.pool.map((p, k) => `<button class="tile" type="button" data-act="tile" data-k="${k}">${esc(p.w)}</button>`).join('');
  E.next.disabled = T.pool.length > 0;
}
function moveTile(from, to, k) {
  if (!SES || !SES.tiles || SES.phase !== 'answer') return;
  const [p] = SES.tiles[from].splice(k, 1);
  if (p) SES.tiles[to].push(p);
  sfx('tap');
  renderTiles();
}
function checkTiles() {
  const t = SES.cur, it = BY_ID[t.id], T = SES.tiles;
  if (T.pool.length) return;
  const built = T.placed.map(p => p.w).join(' ');
  const ok = built.toLowerCase() === it.tokens.join(' ').toLowerCase();
  const shown = cap(built) + it.end;
  if (t.type === 'gtest') return recordTest(ok ? 1 : 0, shown, ok ? 'ok' : 'wrong');
  if (t.type === 'gnew' && !S.w[it.id]) { collect(it.id); SES.collected.push(it.id); }
  resolve(ok ? 'ok' : 'wrong', { input: shown });
}

// ---------- Schreiben ----------
function roomSVG(t) { return Scene.room(t.room.map((it, i) => ({ ...it, mark: i === t.target }))); }
function showWrite(t) {
  const test = t.type === 'wtest';
  const isCase = t.type === 'wcase';
  const pic = isCase ? Scene.pencilCase(t.items) : roomSVG(t);
  const task = isCase
    ? 'Was ist in diesem Federpennal? Schreib alles auf – mit Anzahl und Farbe.'
    : 'Wo ist das markierte Ding, und welche Farbe hat es? Schreib einen ganzen Satz.';
  E.area.placeholder = isCase ? 'In my pencil case there is …' : 'There is a …  /  The … is …';
  const band = test ? testBand()
    : `<div class="band write"><span>Schreiben</span><span>S.B. S. 20 · Üb. 12 ${isCase ? 'A' : 'B'}</span></div>`;
  E.chip.textContent = test ? `Frage ${SES.done + 1} von ${SES.total}` : 'Schreib selbst';
  E.card.innerHTML = band + `<div class="cbody"><div class="picwrap wide">${pic}</div><p class="wtask">${esc(task)}</p><div id="wmodel"></div></div>`;
  restartAnim(E.card, 'pop');
  if (!test) E.tools.innerHTML = `<button class="tool keepfocus" type="button" data-act="wmodel">💡 Satzbau</button>`;
  mode('write');
}
function showWriteHelp() {
  const t = SES && SES.cur;
  const box = $('#wmodel');
  if (!t || !box || box.innerHTML) return;
  box.innerHTML = t.type === 'wcase'
    ? `<p class="pattern sm">In my pencil case there is a <i>Farbe Ding</i>,<br>there are <i>two Farbe Dinge</i> and …</p>`
    : `<p class="pattern sm">There is a <i>Farbe Ding</i> on / under / next to the <i>desk / chair</i>.<br>There are <i>two Farbe Dinge</i> …</p>`;
  SES.hintUsed = true;
  focusInput();
}
const CHECK_LABEL = { Ding: 'Das richtige Ding', Farbe: 'Die richtige Farbe', Ort: 'Der richtige Ort', 'is/are': 'is / are' };
function writeAnswer(val) {
  const t = SES.cur;
  if (val.trim().split(/\s+/).length < 3) { shake(E.area); toast('Schreib einen ganzen Satz.'); focusInput(); return; }
  const isCase = t.type === 'wcase';
  const facts = isCase ? null : roomFacts(t.room[t.target]);
  const r = isCase ? checkCaseText(val, t.items) : checkRoomSentence(val, facts);
  const perfect = r.bad.length === 0;
  SES.first++;
  S.stats.answers++;
  const key = isCase ? 'case' : 'scene';
  S.write[key] = S.write[key] || { done: 0 };
  if (perfect) {
    SES.right++;
    S.stats.right++;
    S.write[key].done = (S.write[key].done || 0) + 1;
    S.write[key].date = today();
    SES.combo++;
  } else SES.combo = 0;
  const xp = perfect ? (SES.hintUsed ? 10 : 15) : r.score ? 5 : 0;
  addXP(xp);
  save();

  SES.phase = 'feedback';
  const models = isCase ? [modelCase(t.items)] : modelRoom(facts);
  const items = [
    ...r.ok.map(x => `<li class="ok">✓ ${esc(CHECK_LABEL[x] || x)}</li>`),
    ...r.bad.map(x => `<li class="bad">✗ ${esc(x)}</li>`),
    ...r.tips.map(x => `<li class="tipli">💡 ${esc(x)}</li>`)
  ].join('');
  const cls = perfect ? 'good' : r.score ? 'almost' : 'bad';
  E.card.innerHTML = `<div class="band ${cls}"><span>${perfect ? 'Perfekter Satz!' : r.score ? 'Fast!' : 'Schau nochmal'}</span><span>${xp ? '+' + xp + ' XP' : ''}</span></div>
    <div class="cbody"><div class="picwrap wide">${isCase ? Scene.pencilCase(t.items) : roomSVG(t)}</div>
    <ul class="checks">${items}</ul>
    <div class="pair"><div class="pair-txt"><p class="model"><b>So geht’s:</b> ${models.map(esc).join('<br><b>oder:</b> ')}</p></div>${sayBtnText(models[0])}</div></div>`;
  restartAnim(E.card, perfect ? 'pop' : 'nudge');
  E.tools.innerHTML = '';
  bar();
  if (perfect) sfx('ok'); else sfx('bad');
  haptic();
  if (S.settings.autoSpeak) speak(models[0]);
  E.area.className = cls;
  E.main.textContent = 'Weiter';
  focusInput();
}
function writeTestAnswer(val) {
  const t = SES.cur;
  if (!val.trim() && !SES.emptyOnce) {
    SES.emptyOnce = true;
    shake(E.area);
    toast('Weißt du es nicht? Nochmal „Weiter“ lässt es leer.');
    focusInput();
    return;
  }
  const f = roomFacts(t.room[t.target]);
  const r = val.trim() ? checkRoomSentence(val, f) : { score: 0, bad: ['leer gelassen'] };
  SES.results.push({ id: 'w', sec: 'write', input: val.trim(), pts: r.score, max: 2, model: modelRoom(f)[0], bad: r.bad });
  save();
  sfx('tap');
  next();
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
  const t = SES.cur;
  if (SES.phase === 'intro') {
    if (t.type === 'grule') {
      if (!S.g[t.topic]) { S.g[t.topic] = today(); save(); }
      return next();
    }
    return startMemo();
  }
  if (SES.phase === 'answer' && SES.how === 'tiles') return checkTiles();
  if (SES.phase === 'feedback') return next();
}

function onSubmit() {
  if (!SES || !SES.cur) return;
  const t = SES.cur, val = field().value;
  if (SES.phase === 'feedback') return next();
  if (SES.phase === 'retype') return retype(val);
  if (SES.phase !== 'answer') return;
  if (t.type === 'test') return testAnswer(val);
  if (t.type === 'wtest') return writeTestAnswer(val);
  if (t.type === 'wscene' || t.type === 'wcase') return writeAnswer(val);
  const c = BY_ID[t.id];
  if (t.type === 'gtest') {
    if (!norm(val) && !SES.emptyOnce) {
      SES.emptyOnce = true;
      shake(E.input);
      toast('Weißt du es nicht? Nochmal „Weiter“ lässt es leer.');
      focusInput();
      return;
    }
    const r = checkGram(c, val);
    return recordTest(r.res === 'ok' ? 1 : r.res === 'typo' ? 0.5 : 0, val.trim(), r.res);
  }
  if (!norm(val)) { shake(E.input); focusInput(); return; }
  if (c.kind === 'g') {
    if (t.type === 'gnew' && !S.w[c.id]) { collect(c.id); SES.collected.push(c.id); }
    return resolve(checkGram(c, val).res, { r: checkGram(c, val), input: val });
  }
  if (t.type === 'probe') return probeAnswer(val);
  const r = check(c, val, t.type === 'cloze' ? 'cloze' : 'type');
  let res = r.res;
  if (SES.hintUsed && (res === 'ok' || res === 'noTo')) res = 'hint';
  resolve(res, { r, input: val });
}

// Neues Wort zuerst abfragen: Kann er es schon, startet die Karte gleich auf Stufe 2
function probeAnswer(val, idk) {
  const t = SES.cur, w = BY_ID[t.id];
  const r = idk ? { res: 'wrong' } : check(w, val, 'type');
  if (r.res === 'ok' || r.res === 'noTo') {
    collect(t.id, examMode() ? 3 : 2);
    SES.collected.push(t.id);
    SES.known++;
    return resolve(r.res, { r, input: val, known: true });
  }
  if (r.res === 'typo') {
    collect(t.id, 1);
    SES.collected.push(t.id);
    return resolve('typo', { r, input: val });
  }
  // Noch unbekannt: jetzt richtig kennenlernen (ansehen, anhören, aus dem Kopf schreiben)
  t.type = 'intro';
  t.fromProbe = true;
  showTask();
}

function onChoice(btn) {
  if (!SES || SES.phase !== 'answer') return;
  const ok = btn.dataset.ok === '1';
  E.choices.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.ok === '1') b.classList.add('right');
  });
  if (!ok) { btn.classList.add('wrong'); shake(btn); }
  const t = SES.cur, c = BY_ID[t.id];
  if (c.kind === 'g' && t.type === 'gnew' && !S.w[c.id]) { collect(c.id); SES.collected.push(c.id); }
  resolve(ok ? 'ok' : 'wrong', { input: ok ? '' : btn.textContent });
}

function push(task, offset) { SES.queue.splice(Math.min(offset, SES.queue.length), 0, task); }

function addXP(n) {
  if (!n) return;
  S.stats.xp += n;
  if (SES) SES.xp += n;
}

function resolve(res, info) {
  const t = SES.cur, c = BY_ID[t.id], st = S.w[t.id];
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
    xp = res === 'noTo' ? XP.noTo : t.type === 'intro' ? XP.memo : (t.type === 'mcEnDe' || SES.how === 'choose') ? XP.mc : XP.type;
    if (info.known) xp += 2;
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
  } else if (!good && again <= (c.kind === 'g' ? 1 : 2)) {
    const type = c.kind === 'g' ? 'grev' : t.type === 'mcEnDe' ? 'mcEnDe' : 'type';
    push({ id: t.id, type, practice: true, re: again }, res === 'hint' ? 5 : c.kind === 'g' ? 3 : 4);
  }

  save();
  if (c.kind === 'g') feedbackGram(res, info, sched, xp);
  else feedback(res, info, sched, xp);
}

function schedLine(sched, c, good, res) {
  if (!sched) return '';
  const d = inDays(daysBetween(today(), effDue(c)));
  if (sched.to > sched.from) return `<p class="sched up">${sched.to === 6 ? '👑 Legendär!' : `▲ Stufe ${sched.to}!`} Wieder geladen ${d}.</p>`;
  if (sched.to < sched.from) return `<p class="sched down">▼ Zurück auf Stufe ${sched.to} – kommt ${d} wieder.</p>`;
  if (!good || res === 'hint') return `<p class="sched">Bleibt auf Stufe ${sched.to} – kommt ${d} wieder.</p>`;
  return '';
}
function levelBadge(sched) {
  return sched && sched.to > sched.from
    ? `<div class="lvup ${sched.to === 6 ? 'holo' : ''}" style="--tier:var(--t${sched.to})">${sched.to === 6 ? '👑 Legendär' : '▲ Stufe ' + sched.to}</div>` : '';
}
function sayBtnText(text) {
  return TTS.ok ? `<button class="say keepfocus" type="button" data-act="say" data-say="${esc(text)}" aria-label="Vorlesen">🔊</button>` : '';
}

function feedback(res, info, sched, xp) {
  const t = SES.cur, w = BY_ID[t.id];
  const good = res === 'ok' || res === 'noTo' || res === 'hint';
  const typed = t.type !== 'mcEnDe';
  const needRetype = typed && (res === 'typo' || res === 'wrong');
  SES.phase = needRetype ? 'retype' : 'feedback';

  const r = info.r || {};
  const titles = {
    ok: info.known ? 'Kannst du schon!' : t.type === 'intro' ? 'Super, gemerkt!' : 'Richtig!',
    noTo: 'Richtig – fast perfekt',
    hint: 'Richtig – mit Tipp',
    typo: r.syn ? 'Fast! Anderes Wort' : 'Fast! Ein Tippfehler',
    wrong: r.confused ? 'Verwechselt!' : info.idk ? 'Kein Problem' : 'Nicht ganz'
  };
  const cls = good ? 'good' : res === 'typo' ? 'almost' : 'bad';
  let body = '';
  if (t.type === 'cloze') body += `<p class="ex big">${exHTML(w)}</p>`;
  body += `<div class="pair"><div class="pair-txt"><span class="de">${esc(w.de)}</span><span class="en sm">${esc(w.en)}</span></div>${sayBtn(w)}</div>`;
  const typedVal = (info.input || '').trim();
  if (res === 'typo' && !r.syn) body += `<div class="yours">Du: <s>${esc(typedVal)}</s> · richtig: <span class="fix">${diffMark(typedVal, r.near)}</span></div>`;
  else if ((res === 'wrong' || r.syn) && typedVal && !info.idk) body += `<div class="yours">Du: <s>${esc(typedVal)}</s></div>`;
  if (r.syn) body += `<p class="note">${esc(r.syn.en)} passt auch – gesucht ist aber <b>${esc(w.en)}</b>.</p>`;
  if (r.confused) body += `<p class="note">${esc(r.confused.en)} heißt „${esc(r.confused.de)}“.</p>`;
  if (res === 'noTo') body += `<p class="note">Bei Verben gehört das <b>to</b> dazu: <b>${esc(w.en)}</b></p>`;
  if (info.known) body += `<p class="sched up">⚡ Die Karte startet gleich auf Stufe ${S.w[t.id].lv}.</p>`;
  if (t.type !== 'cloze' && w.exPlain) body += `<p class="ex">${exHTML(w)}</p>`;
  if (w.tip) body += `<p class="tip">💡 ${esc(w.tip)}</p>`;
  body += schedLine(sched, w, good, res);
  if (needRetype) body += `<p class="retype">Schreib es einmal richtig ab:</p>`;

  const up = sched && sched.to > sched.from;
  const xpTxt = xp ? `+${xp} XP` : '';
  E.card.innerHTML = `<div class="band ${cls}"><span>${titles[res]}${up && xpTxt ? ' · ' + xpTxt : ''}</span><span>${up ? '' : xpTxt}</span></div>${levelBadge(sched)}<div class="cbody">${body}</div>`;
  E.wrap.scrollTop = 0;
  restartAnim(E.card, good ? 'pop' : 'nudge');
  E.tools.innerHTML = '';
  bar();

  if (good) sfx('ok'); else sfx('bad');
  haptic();
  if (up) setTimeout(() => sfx('level'), 260);
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

function feedbackGram(res, info, sched, xp) {
  const t = SES.cur, it = BY_ID[t.id];
  const good = res === 'ok';
  const typed = SES.how === 'type';
  const needRetype = typed && (res === 'typo' || res === 'wrong');
  SES.phase = needRetype ? 'retype' : 'feedback';
  const cls = good ? 'good' : res === 'typo' ? 'almost' : 'bad';
  const title = good ? 'Richtig!' : res === 'typo' ? 'Fast! Apostroph vergessen' : info.idk ? 'Kein Problem' : 'Nicht ganz';
  let body = '';
  if (it.form === 'pic') body += `<div class="picwrap sm">${Scene.prep(...it.pic)}</div>`;
  const sentence = it.form === 'order' ? esc(it.order) : gapHTML(it, it.main);
  body += `<div class="pair"><div class="pair-txt"><p class="gq big">${sentence}</p></div>${sayBtnText(it.say)}</div>`;
  const typedVal = (info.input || '').trim();
  if (!good && typedVal && !info.idk) body += `<div class="yours">Du: <s>${esc(typedVal)}</s></div>`;
  if (it.de && it.form === 'order') body += `<div class="qhint">${esc(it.de)}</div>`;
  if (it.why) body += `<p class="tip">💡 ${esc(it.why)}</p>`;
  body += schedLine(sched, it, good, res);
  if (needRetype) body += `<p class="retype">Schreib es einmal richtig:</p>`;

  const up = sched && sched.to > sched.from;
  const xpTxt = xp ? `+${xp} XP` : '';
  E.card.innerHTML = `<div class="band ${cls}"><span>${title}${up && xpTxt ? ' · ' + xpTxt : ''}</span><span>${up ? '' : xpTxt}</span></div>${levelBadge(sched)}<div class="cbody">${body}</div>`;
  E.wrap.scrollTop = 0;
  restartAnim(E.card, good ? 'pop' : 'nudge');
  E.tools.innerHTML = '';
  bar();

  if (good) sfx('ok'); else sfx('bad');
  haptic();
  if (up) setTimeout(() => sfx('level'), 260);
  if (S.settings.autoSpeak) speak(it.say);

  if (typed) {
    E.input.className = needRetype ? 'retype' : cls;
    if (needRetype) {
      E.input.value = '';
      E.input.placeholder = it.main;
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
  const t = SES.cur, c = BY_ID[t.id];
  const ok = c.kind === 'g' ? checkGram(c, val).res === 'ok' : check(c, val, t.type === 'cloze' ? 'cloze' : 'type').res === 'ok';
  if (ok) { sfx('tap'); return next(); }
  shake(field());
  if (c.kind !== 'g' && check(c, val, 'type').res === 'noTo') toast('Mit „to“ davor!');
  focusInput();
}

function recordTest(pts, input, res) {
  const t = SES.cur, st = S.w[t.id];
  SES.results.push({ id: t.id, input, res, pts, max: 1, sec: t.sec || 'v' });
  S.stats.answers++;
  if (pts === 1) S.stats.right++;
  if (st) {
    if (pts === 1) st.ok++;
    else {
      st.bad++;
      const tm = addDays(today(), 1);   // Fehler aus dem Test kommen spätestens morgen dran
      if (st.due > tm) st.due = tm;
    }
  }
  save();
  sfx('tap');
  next();
}

function testAnswer(val) {
  const t = SES.cur, w = BY_ID[t.id];
  if (!norm(val) && !SES.emptyOnce) {
    SES.emptyOnce = true;
    shake(E.input);
    toast('Weißt du es nicht? Nochmal „Weiter“ lässt es leer.');
    focusInput();
    return;
  }
  const r = check(w, val, 'type');
  const pts = r.res === 'ok' ? 1 : (r.res === 'noTo' || r.res === 'typo') ? 0.5 : 0;
  recordTest(pts, val.trim(), r.res);
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
  const t = SES.cur;
  if (t.type === 'probe') return probeAnswer('', true);
  const c = BY_ID[t.id];
  if (c && c.kind === 'g' && t.type === 'gnew' && !S.w[c.id]) { collect(c.id); SES.collected.push(c.id); }
  resolve('wrong', { idk: true, input: '' });
}

async function quit() {
  if (!SES) return home();
  const s = SES;
  E.input.blur();
  E.area.blur();
  const choice = await sheet(`<h2 class="sheet-title">Runde beenden?</h2><p>Alles, was du bis jetzt geübt hast, ist gespeichert.</p>`,
    [{ label: 'Weiterüben', value: 'stay', cls: 'go' }, { label: 'Beenden', value: 'quit' }]);
  if (choice !== 'quit') {
    if (SES === s && !E.form.hidden) focusInput();
    return;
  }
  if (s.mode !== 'test' && s.mode !== 'exam' && s.first >= 10) { markDay(); save(); }
  home();
}

function finish() {
  const s = SES;
  E.input.blur();
  E.area.blur();
  SES = null;
  document.body.classList.remove('in-session');
  if (s.mode === 'test') { markDay(); S.stats.sessions++; save(); return testResult(s); }
  if (s.mode === 'exam') { markDay(); S.stats.sessions++; save(); return examResult(s); }
  if (s.mode === 'mission') {
    const left = newCounts();
    if (!missionDue().length && !left.v && !left.g) { S.stats.xp += XP.mission; s.xp += XP.mission; }
  }
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
  extraNew: () => startSession('extra', buildMission(5, 3)),
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
  hideInstall: () => { S.ui.hideInstall = true; save(); home(); },
  tile: b => moveTile('pool', 'placed', +b.dataset.k),
  untile: b => moveTile('placed', 'pool', +b.dataset.k),
  wmodel: () => showWriteHelp(),
  part: b => {
    const p = EXAM && EXAM.parts.find(x => x.id === b.dataset.id);
    if (!p) return;
    if (p.kind === 'vocab') return cards('u:' + p.unit);
    if (p.kind === 'gram') return topicScreen(p.topic);
    if (p.kind === 'write') return p.task === 'me' ? writeMe() : p.task === 'case' ? startWriteCase() : startWriteScene();
  },
  rules: () => rulesScreen(),
  topic: b => topicScreen(b.dataset.t),
  topicGo: b => startSession('topic', buildTopic(b.dataset.t)),
  examGo: () => examGo(),
  warmup: () => startSession('practice', buildWarmup()),
  writeHub: () => writeHub(),
  writeCase: () => startWriteCase(),
  writeScene: () => startWriteScene(),
  writeMe: () => writeMe(),
  starter: b => insertStarter(b.dataset.s),
  checkMe: () => showMeResult()
};

app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const fn = ACT[b.dataset.act];
  if (fn) fn(b, e);
});
// Abhaken auf dem Schularbeits-Zettel (Listening, Reading)
app.addEventListener('change', e => {
  const el = e.target.closest('[data-tick]');
  if (!el) return;
  const id = el.dataset.tick;
  S.ticks[id] = S.ticks[id] || [];
  S.ticks[id][+el.dataset.i] = el.checked;
  save();
  if (el.checked) { sfx('ok'); haptic(); }
  const y = scrollY;
  home();
  scrollTo(0, y);
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
  get ses() { return SES && { cur: SES.cur, phase: SES.phase, how: SES.how, word: SES.cur && BY_ID[SES.cur.id], left: SES.queue.length, tiles: SES.tiles }; },
  checkGram: (id, input) => checkGram(BY_ID[id], input),
  room: (text, f) => checkRoomSentence(text, f),
  caseText: (text, items) => checkCaseText(text, items),
  meText: text => checkMeText(text),
  counts: () => ({ due: missionDue().length, ...newCounts(), unseenV: unseenWords().length, unseenG: unseenGram().length }),
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

// Offline-Cache nur auf der echten Seite – lokal beim Entwickeln stört er (mit ?sw trotzdem testen)
const devHost = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !/[?&]sw\b/.test(location.search);
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !devHost) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
})();
