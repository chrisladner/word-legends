/* Word Legends – Bilder für Präpositionen und Schreibaufgaben (SVG, ohne Abhängigkeiten).
   prep():  Figur + Gegenstand als Emoji, so wie der Frosch und der Schuh im Student's Book S. 20.
   room():  Tisch und Sessel mit Schulsachen in den Farben der Vokabelliste (S.B. S. 20, Üb. 12 B).
   pencilCase(): offenes Federpennal mit Inhalt (S.B. S. 20, Üb. 12 A). */
window.Scene = (() => {
  const INK = '#131849';
  const COLOURS = {
    red: '#E53935', yellow: '#FDD835', blue: '#1E88E5', green: '#43A047', orange: '#FB8C00',
    brown: '#8D5B3F', pink: '#F48FB1', white: '#FFFFFF', black: '#2E2E2E', grey: '#9E9E9E'
  };
  const SUB = { frog: '🐸', cat: '🐱', ball: '⚽', monkey: '🐵', book: '📘', penguin: '🐧', dog: '🐶', mouse: '🐭', parrot: '🦜' };
  // top: Oberkante als Anteil der Schriftgröße.
  // pos: genaue Plätze, wo die allgemeine Regel nicht gut aussieht – dx/dy relativ zur Mitte und
  // zum Boden, s = Größe der Figur, back = hinter dem Gegenstand gezeichnet (teilweise verdeckt)
  const REF = {
    shoe: { e: '👞', size: 92, top: 0.52, under: 'lift', pos: {
      in: { dx: 18, dy: -46, s: 0.72, back: true },
      behind: { dx: 44, dy: -5, s: 0.86, back: true } } },
    bag: { e: '🎒', size: 88, top: 0.86, under: 'lift', pos: {
      in: { dx: 2, dy: -60, s: 0.95, back: true },
      behind: { dx: 34, dy: -12, s: 0.86, back: true } } },
    chair: { e: '🪑', size: 92, top: 0.5, under: 'between', pos: {
      under: { dx: -4, dy: 2, s: 0.82, back: true } } },
    tree: { e: '🌳', size: 112, top: 0.9, under: 'lift', pos: {
      in: { dx: 6, dy: -62, s: 0.8, back: false },
      behind: { dx: 40, dy: -18, s: 0.84, back: true } } },
    stone: { e: '🪨', size: 84, top: 0.62, under: 'lift', pos: {
      behind: { dx: 36, dy: -12, s: 0.86, back: true } } }
  };

  function emoji(ch, x, y, size, extra = '') {
    return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" ${extra}>${ch}</text>`;
  }

  // Offene Kiste als Zeichnung (Emoji-Kisten sind zu), damit "in" eindeutig aussieht
  function boxBack(cx, base, w, h) {
    const x = cx - w / 2, y = base - h;
    return `<path d="M${x + 6} ${y} L${x + 18} ${y - 16} L${x + w - 18} ${y - 16} L${x + w - 6} ${y} Z" fill="#C8955C" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  function boxFront(cx, base, w, h) {
    const x = cx - w / 2, y = base - h;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#E0AE70" stroke="${INK}" stroke-width="3"/>
      <path d="M${x} ${y} L${x - 12} ${y - 12} M${x + w} ${y} L${x + w + 12} ${y - 12}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${x + 10}" y1="${y + h / 2}" x2="${x + w - 10}" y2="${y + h / 2}" stroke="#B9824B" stroke-width="3"/>`;
  }

  // Figur (sub) relativ zum Gegenstand (ref) – wie die Bildchen im Buch
  function prep(sub, ref, p, opts = {}) {
    const W = 240, H = 160, base = 134, cx = 120;
    const s = SUB[sub] || sub;
    const bg = `<rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="${opts.bg || '#FFF6DA'}"/>
      <ellipse cx="${cx}" cy="${base + 8}" rx="${opts.small ? 60 : 78}" ry="9" fill="rgba(19,24,73,.12)"/>`;
    let back = '', mid = '', front = '';

    if (ref === 'box') {
      const bw = 92, bh = 58, top = base - bh;
      const subSize = 48;
      const pos = {
        in: [cx + 2, top + 10, subSize, 'mid'],
        on: [cx, top - 12, subSize, 'front'],
        under: [cx, base + 4, subSize, 'back'],
        'next to': [cx + bw / 2 + 32, base + 2, subSize, 'front'],
        behind: [cx + bw / 2 + 8, base - 14, subSize * 0.95, 'back'],
        'in front of': [cx - 14, base + 14, subSize * 1.12, 'front']
      }[p];
      const fig = emoji(s, pos[0], pos[1], pos[2]);
      back = boxBack(cx, base, bw, bh);
      if (pos[3] === 'back') back = fig + back;
      if (pos[3] === 'mid') mid = fig;
      if (pos[3] === 'front') front = fig;
      return svg(W, H, bg + back + mid + boxFront(cx, base, bw, bh) + front);
    }

    const r = REF[ref];
    const rs = r.size;
    let refBase = base;
    const subSize = 46;
    const refTop = () => refBase - rs * r.top;
    let fig;
    const special = r.pos && r.pos[p];
    if (special) {
      fig = { x: cx + special.dx, y: base + special.dy, size: subSize * special.s, layer: special.back ? 'back' : 'front' };
    } else switch (p) {
      case 'on':
        fig = { x: cx + 2, y: refTop() + 8, size: subSize, layer: 'front' };
        break;
      case 'under':
        if (r.under === 'lift') {
          // Gegenstand liegt auf der Figur drauf (wie der Schuh im Buch)
          fig = { x: cx, y: base + 6, size: subSize, layer: 'back' };
          refBase = base - subSize * 0.62;
        } else {
          fig = { x: cx - 4, y: base + 2, size: subSize * 0.72, layer: 'back' };
        }
        break;
      case 'in':
        fig = { x: cx, y: refTop() + subSize * 0.55, size: subSize * 0.92, layer: "back" };
        break;
      case 'next to':
        fig = { x: cx + rs / 2 + subSize / 2 + 6, y: base + 2, size: subSize, layer: 'front' };
        break;
      case 'behind':
        fig = { x: cx + rs * 0.26, y: base - rs * 0.28, size: subSize * 0.86, layer: 'back' };
        break;
      case 'in front of':
        fig = { x: cx - rs * 0.12, y: base + 14, size: subSize * 1.14, layer: 'front' };
        break;
    }
    const figSvg = emoji(s, fig.x, fig.y, fig.size);
    const refSvg = emoji(r.e, cx, refBase, rs);
    const body = fig.layer === 'back' ? figSvg + refSvg : refSvg + figSvg;
    return svg(W, H, bg + body);
  }

  function svg(w, h, inner, cls = 'scene') {
    return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // ---------- Gezeichnete Schulsachen (eigene Farben) ----------
  function fill(c) { return COLOURS[c] || c; }
  const stroke = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;

  const DRAW = {
    book(x, y, c) {   // liegend, x/y = linke untere Ecke
      return `<rect x="${x}" y="${y - 14}" width="46" height="14" rx="3" fill="${fill(c)}" ${stroke}/>
        <rect x="${x + 5}" y="${y - 10}" width="38" height="5" rx="1" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
    },
    pen(x, y, c) {
      return `<g><path d="M${x} ${y - 4} l6 -3 h32 a3 3 0 0 1 0 6 h-32 z" fill="${fill(c)}" ${stroke}/>
        <rect x="${x + 26}" y="${y - 8.5}" width="13" height="9" rx="2" fill="${fill(c)}" ${stroke}/>
        <line x1="${x + 30}" y1="${y - 8}" x2="${x + 44}" y2="${y - 12}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>`;
    },
    pencil(x, y, c) {
      return `<g><path d="M${x} ${y - 4} l9 -4 v8 z" fill="#F3D3A1" ${stroke}/>
        <path d="M${x} ${y - 4} l3 -1.4 v2.8 z" fill="${INK}"/>
        <rect x="${x + 9}" y="${y - 8}" width="30" height="8" fill="${fill(c)}" ${stroke}/>
        <rect x="${x + 39}" y="${y - 8}" width="7" height="8" rx="2" fill="#F48FB1" ${stroke}/></g>`;
    },
    ruler(x, y, c) {
      let ticks = '';
      for (let i = 6; i < 52; i += 6) ticks += `<line x1="${x + i}" y1="${y - 9}" x2="${x + i}" y2="${y - (i % 12 ? 6 : 4)}" stroke="${INK}" stroke-width="1.5"/>`;
      return `<rect x="${x}" y="${y - 9}" width="56" height="9" rx="2" fill="${fill(c)}" ${stroke}/>${ticks}`;
    },
    rubber(x, y, c) {
      return `<rect x="${x}" y="${y - 12}" width="24" height="12" rx="3" fill="${fill(c)}" ${stroke}/>
        <rect x="${x + 12}" y="${y - 12}" width="12" height="12" rx="2" fill="#fff" ${stroke}/>`;
    },
    pencilcase(x, y, c) {
      return `<rect x="${x}" y="${y - 24}" width="60" height="24" rx="10" fill="${fill(c)}" ${stroke}/>
        <path d="M${x + 6} ${y - 15} h48" stroke="${INK}" stroke-width="2" stroke-dasharray="3 3"/>
        <circle cx="${x + 52}" cy="${y - 15}" r="3.5" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    },
    schoolbag(x, y, c) {
      return `<g><path d="M${x + 14} ${y - 54} a10 9 0 0 1 20 0" fill="none" stroke="${INK}" stroke-width="3"/>
        <rect x="${x}" y="${y - 52}" width="48" height="52" rx="12" fill="${fill(c)}" ${stroke}/>
        <path d="M${x} ${y - 30} q24 -14 48 0 v-12 a12 12 0 0 0 -12 -10 h-24 a12 12 0 0 0 -12 10 z" fill="rgba(0,0,0,.18)" ${stroke}/>
        <rect x="${x + 10}" y="${y - 22}" width="28" height="16" rx="5" fill="rgba(255,255,255,.28)" ${stroke}/></g>`;
    },
    ball(x, y, c) {
      return `<circle cx="${x + 13}" cy="${y - 13}" r="13" fill="${fill(c)}" ${stroke}/>
        <path d="M${x + 2} ${y - 18} q11 6 22 0 M${x + 3} ${y - 7} q10 -6 20 0" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2.5"/>`;
    },
    gluestick(x, y, c) {
      return `<rect x="${x}" y="${y - 30}" width="14" height="30" rx="4" fill="${fill(c)}" ${stroke}/>
        <rect x="${x - 1}" y="${y - 36}" width="16" height="9" rx="3" fill="#fff" ${stroke}/>`;
    },
    sharpener(x, y, c) {
      return `<rect x="${x}" y="${y - 14}" width="18" height="14" rx="3" fill="${fill(c)}" ${stroke}/>
        <circle cx="${x + 7}" cy="${y - 7}" r="3" fill="${INK}"/>`;
    }
  };
  // Breite und Höhe für das Platzieren und die Markierung
  const SIZE = {
    book: [46, 14], pen: [44, 12], pencil: [46, 8], ruler: [56, 9], rubber: [24, 12], pencilcase: [60, 24],
    schoolbag: [48, 58], ball: [26, 26], gluestick: [16, 36], sharpener: [18, 14]
  };

  function desk(x, top) {
    return `<rect x="${x + 6}" y="${top + 8}" width="9" height="${150 - top}" fill="#8A5A36" ${stroke}/>
      <rect x="${x + 141}" y="${top + 8}" width="9" height="${150 - top}" fill="#8A5A36" ${stroke}/>
      <rect x="${x}" y="${top}" width="156" height="12" rx="3" fill="#C98B55" ${stroke}/>`;
  }
  function chair(x, seat) {
    return `<rect x="${x + 50}" y="${seat - 52}" width="9" height="${200 - seat}" rx="3" fill="#6E7FA8" ${stroke}/>
      <rect x="${x + 4}" y="${seat + 6}" width="8" height="${152 - seat}" fill="#6E7FA8" ${stroke}/>
      <rect x="${x}" y="${seat}" width="60" height="10" rx="3" fill="#8FA0C8" ${stroke}/>`;
  }

  // Plätze im Zimmer: Unterkante (y) und waagrechter Bereich für die Sachen
  const PLACES = {
    'on-desk': { prep: 'on', ref: 'desk', y: 98, xs: [76, 124, 168] },
    'under-desk': { prep: 'under', ref: 'desk', y: 160, xs: [88, 142] },
    'next-desk': { prep: 'next to', ref: 'desk', y: 162, xs: [6] },
    'on-chair': { prep: 'on', ref: 'chair', y: 126, xs: [250] },
    'under-chair': { prep: 'under', ref: 'chair', y: 162, xs: [253] },
    'next-chair': { prep: 'next to', ref: 'chair', y: 162, xs: [310] },
    'front-desk': { prep: 'in front of', ref: 'desk', y: 194, xs: [104, 150] }
  };

  // items: [{ obj, colour, n, place, mark }]
  function room(items) {
    const W = 362, H = 205;
    let back = '', front = '', marks = '';
    const used = {};
    for (const it of items) {
      const pl = PLACES[it.place];
      const k = used[it.place] = (used[it.place] || 0);
      used[it.place]++;
      const [w, h] = SIZE[it.obj];
      const big = it.place === 'front-desk' ? 1.25 : 1;
      let x0 = pl.xs[Math.min(k, pl.xs.length - 1)];
      let g = '';
      for (let i = 0; i < (it.n || 1); i++) {
        const dy = it.obj === 'ball' || it.obj === 'schoolbag' || it.obj === 'gluestick' ? 0 : i * (h + 1);
        const dx = it.obj === 'ball' || it.obj === 'schoolbag' || it.obj === 'gluestick' ? i * (w + 4) : i * 4;
        g += DRAW[it.obj](0 + dx, 0 - dy, it.colour);
      }
      const totalW = (it.obj === 'ball' || it.obj === 'schoolbag' || it.obj === 'gluestick') ? (w + 4) * (it.n || 1) - 4 : w + 4 * ((it.n || 1) - 1);
      const totalH = (it.obj === 'ball' || it.obj === 'schoolbag' || it.obj === 'gluestick') ? h : h + (h + 1) * ((it.n || 1) - 1);
      const el = `<g transform="translate(${x0} ${pl.y}) scale(${big})">${g}</g>`;
      if (it.mark) {
        const cx = x0 + totalW * big / 2, cy = pl.y - totalH * big / 2;
        const rx = totalW * big / 2 + 12, ry = totalH * big / 2 + 11;
        marks += `<ellipse class="mark" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#FF5168" stroke-width="4" stroke-dasharray="7 6"/>`;
      }
      if (it.place === 'under-desk' || it.place === 'under-chair' || it.place === 'next-desk' || it.place === 'next-chair') back += el;
      else front += el;
    }
    const wall = `<rect width="${W}" height="${H}" rx="18" fill="#F3F5FF"/><rect y="150" width="${W}" height="${H - 150}" fill="#DCE3F7"/>
      <line x1="0" y1="150" x2="${W}" y2="150" stroke="#B8C3E6" stroke-width="2"/>`;
    return svg(W, H, wall + back + desk(64, 98) + chair(244, 126) + front + marks, 'scene room');
  }

  // Offenes Federpennal: jede Sorte bekommt einen Platz, mehrere gleiche liegen sichtbar übereinander
  function pencilCase(items) {
    const W = 330, H = 190;
    let inner = '';
    const slots = [[48, 96], [184, 96], [48, 146], [184, 146]];
    items.slice(0, 4).forEach((it, k) => {
      const [x, y] = slots[k];
      const sc = it.obj === 'gluestick' ? 1.15 : it.obj === 'ruler' ? 1.45 : 1.6;
      let g = '';
      for (let i = (it.n || 1) - 1; i >= 0; i--) g += `<g transform="translate(${i * 6} ${-i * 9})">${DRAW[it.obj](0, 0, it.colour)}</g>`;
      inner += `<g transform="translate(${x} ${y}) scale(${sc})">${g}</g>`;
    });
    const caseShape = `<rect width="${W}" height="${H}" rx="18" fill="#FFF6DA"/>
      <rect x="16" y="26" width="298" height="140" rx="38" fill="#5B6BD8" stroke="${INK}" stroke-width="3"/>
      <rect x="28" y="38" width="274" height="116" rx="30" fill="#EEF1FF" stroke="${INK}" stroke-width="2.5"/>
      <path d="M44 32 h242" stroke="#FFD23F" stroke-width="4" stroke-dasharray="6 5"/>`;
    return svg(W, H, caseShape + inner, 'scene case');
  }

  return { prep, room, pencilCase, COLOURS, PLACES, SIZE };
})();
