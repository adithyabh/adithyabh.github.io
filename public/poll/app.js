import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, onValue, set, update, remove, onDisconnect } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const db = getDatabase(initializeApp(window.FIREBASE_CONFIG));
const QS = window.QUESTIONS;
const params = new URLSearchParams(location.search);
const IS_HOST = params.has('host');
const ROOM = (params.get('room') || 'main').replace(/[^\w-]/g, '');
const base = `rooms/${ROOM}`;
const app = document.getElementById('app');

const cid = (() => {
  const k = 'poll-cid';
  try { let v = localStorage.getItem(k); if (!v) { v = crypto.randomUUID().slice(0, 12); localStorage.setItem(k, v); } return v; }
  catch { return 'anon-' + Math.random().toString(36).slice(2, 10); }
})();

const joinUrl = location.origin + location.pathname + (ROOM === 'main' ? '' : `?room=${ROOM}`);
const prettyJoin = joinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

// ---------- helpers ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function fmt(n) {
  const units = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']];
  for (const [d, u] of units) if (n >= d) { const v = n / d; return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')) + u; }
  return String(Math.round(n));
}
const sig2 = n => { const p = 10 ** (Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; };
function median(xs) {
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.exp((Math.log(s[m - 1]) + Math.log(s[m])) / 2); // geometric midpoint on log data
}
function qr(el, size) {
  el.innerHTML = '';
  new QRCode(el, { text: joinUrl, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
}

// ---------- log-scale number line ----------
// Draws today's reference items on a log axis; optionally a "your guess" pin,
// and on reveal a beeswarm of everyone's guesses with the room median.
function logLineSVG(q, { width, fontSize = 12, guess = null, votes = null, mine = null, animate = true }) {
  const W = Math.max(300, width), padX = 14;
  const lmin = Math.log10(q.min), lmax = Math.log10(q.max);
  const x = v => padX + (W - 2 * padX) * (Math.log10(v) - lmin) / (lmax - lmin);
  const charW = fontSize * 0.56, rowH = fontSize * 1.35;
  const out = [];

  // beeswarm layout (dodge upward)
  const r = votes ? Math.max(4, Math.min(fontSize * 0.6, W / 120)) : 0;
  const placed = [];
  if (votes) {
    const pts = votes.map(v => ({ v: v.value, x: x(Math.min(q.max, Math.max(q.min, v.value))), mine: v.id === mine })).sort((a, b) => a.x - b.x);
    for (const p of pts) {
      const near = placed.filter(o => Math.abs(o.x - p.x) < 2 * r);
      const cands = [0, ...near.map(o => o.y + Math.sqrt(4 * r * r - (o.x - p.x) ** 2) + 0.5)].sort((a, b) => a - b);
      p.y = cands.find(y => near.every(o => (o.x - p.x) ** 2 + (o.y - y) ** 2 >= 4 * r * r - 0.5));
      placed.push(p);
    }
  }
  const swarmH = placed.length ? Math.max(...placed.map(p => p.y)) + 2 * r : 0;
  const topPad = fontSize * 2.6 + (guess != null ? fontSize * 1.6 : 0);
  const axisY = topPad + swarmH + fontSize * 1.6;

  // decade ticks
  for (let e = Math.ceil(lmin); e <= Math.floor(lmax); e++) {
    const tx = x(10 ** e);
    out.push(`<line class="tick" x1="${tx}" x2="${tx}" y1="${axisY - 5}" y2="${axisY + 5}"/>`);
    out.push(`<text class="tick-label" x="${tx}" y="${axisY - 10}" text-anchor="middle" font-size="${fontSize * 0.9}">${fmt(10 ** e)}</text>`);
  }
  out.push(`<line class="axis" x1="${padX}" x2="${W - padX}" y1="${axisY}" y2="${axisY}"/>`);

  // reference labels in non-overlapping rows below the axis
  const rows = [], leaders = [], labels = [];
  const refs = [...q.reference].sort((a, b) => a.value - b.value);
  const labelTop = axisY + fontSize * 1.5;
  for (const it of refs) {
    const cx = x(it.value), text = `${it.label} ${fmt(it.value)}`;
    const w = text.length * charW + 8;
    let lx = Math.min(Math.max(cx - w / 2, 0), W - w);
    let row = rows.findIndex(end => lx > end);
    if (row < 0) { row = rows.length; rows.push(-1e9); }
    rows[row] = lx + w;
    const ly = labelTop + row * rowH;
    leaders.push(`<line class="ref-leader" x1="${cx}" x2="${cx}" y1="${axisY}" y2="${ly - fontSize * 0.9}"/>`);
    labels.push(`<text x="${lx + 4}" y="${ly}" font-size="${fontSize}">${esc(it.label)} <tspan class="ref-val">${fmt(it.value)}</tspan></text>`);
  }
  out.push(...leaders, ...labels);
  for (const it of refs) out.push(`<circle class="ref-dot" cx="${x(it.value)}" cy="${axisY}" r="${fontSize * 0.32}"/>`);
  const H = labelTop + Math.max(0, rows.length - 1) * rowH + fontSize * 0.6;

  // today's median marker
  if (q.baseline) {
    const bx = x(q.baseline);
    out.push(`<line class="baseline" x1="${bx}" x2="${bx}" y1="${fontSize * 1.6}" y2="${axisY}"/>`);
    out.push(`<text class="baseline-label" x="${bx}" y="${fontSize * 1.1}" text-anchor="middle" font-size="${fontSize * 0.9}">${esc(q.baselineLabel)} ${fmt(q.baseline)}</text>`);
  }

  // participant's live guess pin
  if (guess != null) {
    const gx = x(guess);
    const anchor = gx < W * 0.15 ? 'start' : gx > W * 0.85 ? 'end' : 'middle';
    out.push(`<line class="median" x1="${gx}" x2="${gx}" y1="${topPad - fontSize * 0.2}" y2="${axisY}" style="animation:none"/>`);
    out.push(`<circle class="guess" cx="${gx}" cy="${axisY}" r="${fontSize * 0.55}"/>`);
    out.push(`<text class="guess-label" x="${gx}" y="${topPad - fontSize * 0.6}" text-anchor="${anchor}" font-size="${fontSize * 1.1}">your guess ${fmt(guess)}</text>`);
  }

  // reveal: swarm + room median
  if (placed.length) {
    placed.forEach((p, i) => out.push(`<circle class="vote${p.mine ? ' mine' : ''}" cx="${p.x}" cy="${axisY - fontSize * 1.6 - p.y - r}" r="${p.mine ? r * 1.3 : r}" style="animation-delay:${Math.min(i * 25, 1500)}ms"/>`));
    const med = median(placed.map(p => p.v)), mx = x(med);
    const anchor = mx < W * 0.2 ? 'start' : mx > W * 0.8 ? 'end' : 'middle';
    const mult = q.baseline ? ` · ${(med / q.baseline).toFixed(med / q.baseline >= 10 ? 0 : 1)}× ${esc(q.baselineLabel)}` : '';
    out.push(`<line class="median" x1="${mx}" x2="${mx}" y1="${fontSize * 2.4 + fontSize * 0.3}" y2="${axisY}" style="animation-delay:${Math.min(placed.length * 25, 1500)}ms"/>`);
    out.push(`<text class="median-label" x="${mx}" y="${fontSize * 2.4}" text-anchor="${anchor}" font-size="${fontSize * 1.15}" style="animation-delay:${Math.min(placed.length * 25, 1500)}ms">room median ${fmt(med)}${mult}</text>`);
  }
  return `<svg class="${animate ? '' : 'still'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${out.join('')}</svg>`;
}

// ---------- question types ----------
const TYPES = {
  logslider: {
    // participant input; calls onChange(value) as the user drags
    input(el, q, initial, onChange) {
      const lmin = Math.log10(q.min), lmax = Math.log10(q.max);
      const toV = s => sig2(10 ** (lmin + (lmax - lmin) * s / 1000));
      const toS = v => Math.round(1000 * (Math.log10(v) - lmin) / (lmax - lmin));
      el.innerHTML = `
        <div class="readout"><span class="big"></span><span class="unit">${esc(q.unit || '')}</span></div>
        <input type="range" min="0" max="1000" step="1" value="${toS(initial ?? q.start)}" aria-label="Your answer">
        <div class="range-ends"><span>${fmt(q.min)}</span><span>${fmt(q.max)}</span></div>`;
      const inp = el.querySelector('input'), big = el.querySelector('.big');
      const sync = () => { const v = toV(+inp.value); big.textContent = fmt(v); onChange(v); };
      inp.addEventListener('input', sync);
      sync();
    },
    guessChart: true,
    valid: v => typeof v === 'number' && v > 0,
    chart(q, opts) { return logLineSVG(q, opts); },
    yours(q, v, votes) { return `Your guess <b>${fmt(v)}</b> · room median <b>${fmt(median(votes.map(x => x.value)))}</b>`; },
    fake(q) { // log-normal around 3× start, for testing reveals
      const mu = Math.log10(q.start) + 0.5, sd = 0.55;
      const g = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      return sig2(Math.min(q.max, Math.max(q.min, 10 ** (mu + sd * g()))));
    },
  },

  // Several 0–100% piles (e.g. one per year). A pile is the bills dropped on it,
  // drawn as discrete bills of fixed thickness, so small and large values both stay legible.
  piles: {
    valid: v => v && typeof v === 'object' && Object.values(v).every(x => typeof x === 'number'),
    context(q) {
      return `<div class="breakdown"><div class="bd-head">${esc(q.context)}</div>${q.breakdown.map(b =>
        `<div class="bd-row"><span>${esc(b.label)}</span><b>${esc(b.value)}</b></div>`).join('')}</div>${refBars(q)}`;
    },
    input(el, q, initial, onChange) {
      const vals = Object.fromEntries(q.piles.map(p => [p.key, initial?.[p.key] ?? q.start]));
      el.innerHTML = `
        <div class="piles">${q.piles.map(p => `
          <div class="pile-col">
            <div class="pile-val" data-k="${p.key}"></div>
            <div class="pile" data-k="${p.key}"></div>
            <div class="pile-label">${esc(p.label)}</div>
            <div class="pile-adj"><button data-k="${p.key}" data-d="-1" aria-label="minus 1%">−</button><button data-k="${p.key}" data-d="1" aria-label="plus 1%">+</button></div>
          </div>`).join('')}</div>
        <div class="tray"><span class="muted">Drag bills onto a pile ↑</span>${[...q.bills].sort((a, b) => a - b).map(b => billHTML(b, q)).join('')}</div>
        <div class="tray-hint muted">Tap a bill in a pile to take it back · today ≈ ${q.baseline}%</div>`;
      const sync = () => {
        for (const p of q.piles) {
          el.querySelector(`.pile[data-k="${p.key}"]`).innerHTML = makeChange(vals[p.key], q.bills).map(d => billHTML(d, q, true)).join('');
          el.querySelector(`.pile-val[data-k="${p.key}"]`).textContent = vals[p.key] + '%';
        }
        onChange({ ...vals });
      };
      const setK = (k, v) => { vals[k] = Math.max(0, Math.min(100, Math.round(v * 2) / 2)); sync(); };
      el.querySelectorAll('.pile-adj button').forEach(b => b.onclick = () => setK(b.dataset.k, vals[b.dataset.k] + +b.dataset.d));
      el.querySelectorAll('.pile').forEach(pile => pile.addEventListener('click', e => {
        const b = e.target.closest('.bill'); if (b) setK(pile.dataset.k, vals[pile.dataset.k] - +b.dataset.v);
      }));

      // drag a bill from the tray onto a pile
      el.querySelectorAll('.tray .bill').forEach(bill => bill.addEventListener('pointerdown', e => {
        e.preventDefault();
        const ghost = bill.cloneNode(true); ghost.classList.add('ghost'); document.body.appendChild(ghost);
        let target = null;
        const move = ev => {
          ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
          const pile = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.pile-col')?.querySelector('.pile');
          if (pile !== target) { target?.classList.remove('hover'); target = pile; target?.classList.add('hover'); }
        };
        const up = () => {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
          ghost.remove();
          if (target) { target.classList.remove('hover'); setK(target.dataset.k, vals[target.dataset.k] + +bill.dataset.v); target.classList.add('bump'); setTimeout(() => target.classList.remove('bump'), 300); }
        };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
        move(e);
      }));
      sync();
    },
    // Bill piles at today's level and at the room median per year, each with a log-scale dot strip of all guesses.
    chart(q, { width, fontSize = 12, votes = null, mine = null, animate = true, side = false }) {
      side = side && votes && q.references;   // presenter reveal: references sit beside the chart
      const W = Math.max(300, side ? width - 400 : width);
      const cols = [{ label: 'Today', today: true }, ...q.piles];
      const colW = W / cols.length, pileW = Math.min(colW * 0.78, 150), gap = 1.5;
      const meds = cols.map(c => c.today ? q.baseline : votes ? median(votes.map(v => Math.max(v.value[c.key], 0.5))) : null);
      const stacks = meds.map(m => m == null ? [] : makeChange(Math.round(m * 2) / 2, q.bills));
      // honest heights: bill thickness ∝ denomination, scaled so the tallest pile fills the area
      const pileArea = fontSize * (votes ? 13 : 7), unit = pileArea / Math.max(...meds.filter(m => m != null).map(m => Math.max(0.5, Math.round(m * 2) / 2)), 10);
      const top = fontSize * 2.6, pileBottom = top + pileArea, labelY = pileBottom + fontSize * 1.5;
      // log-scale strip (1% … 100%) of everyone's guesses: the honest view, since pile height ≠ value
      const strips = cols.map((c, i) => {
        if (!votes || c.today) return null;
        const cx = colW * (i + 0.5), sx0 = cx - colW * 0.42, sx1 = cx + colW * 0.42;
        const LO = Math.log10(0.5), sx = v => sx0 + (sx1 - sx0) * (Math.log10(Math.min(100, Math.max(0.5, v))) - LO) / (2 - LO);
        const r = Math.max(2.5, Math.min(fontSize * 0.36, colW / 55)), placed = [];
        const pts = votes.map(v => ({ x: sx(v.value[c.key]), mine: v.id === mine })).sort((a, b) => a.x - b.x);
        for (const p of pts) {
          const near = placed.filter(o => Math.abs(o.x - p.x) < 2 * r);
          const cands = [0, ...near.map(o => o.y + Math.sqrt(4 * r * r - (o.x - p.x) ** 2) + 0.3)].sort((a, b) => a - b);
          p.y = cands.find(y => near.every(o => (o.x - p.x) ** 2 + (o.y - y) ** 2 >= 4 * r * r - 0.5));
          placed.push(p);
        }
        return { sx, sx0, sx1, r, placed, h: Math.max(...placed.map(p => p.y), 0) + 2 * r };
      });
      const stripH = votes ? Math.min(fontSize * 9, Math.max(fontSize * 5, ...strips.filter(Boolean).map(s => s.h))) : 0;
      const stripTop = labelY + fontSize * 1.4, stripAxis = stripTop + stripH;
      const H = stripAxis + (votes ? fontSize * 1.8 : fontSize * 0.4);
      const out = [];
      const denoms = [...q.bills].sort((a, b) => a - b);
      const delay = ms => animate ? `animation-delay:${ms}ms` : '';
      cols.forEach((c, i) => {
        const cx = colW * (i + 0.5);
        out.push(`<text x="${cx}" y="${labelY}" text-anchor="middle" font-size="${fontSize * 1.15}" font-weight="700" class="${c.today ? 'muted-text' : ''}">${esc(c.label)}</text>`);
        out.push(`<line class="grid" x1="${cx - pileW / 2 - 4}" x2="${cx + pileW / 2 + 4}" y1="${pileBottom}" y2="${pileBottom}"/>`);
        if (meds[i] == null) {
          out.push(`<text x="${cx}" y="${pileBottom - fontSize * 1.2}" text-anchor="middle" font-size="${fontSize * 3}" font-weight="700" class="muted-text">?</text>`);
          return;
        }
        let yb = pileBottom;
        stacks[i].forEach((d, j) => {
          const tier = denoms.indexOf(d) + (denoms[0] < 1 ? 0 : 1), w = d < 1 ? pileW * 0.5 : pileW * (0.7 + 0.3 * (tier - 1) / 3);
          const h = Math.max(1.5, d * unit - gap); yb -= d * unit;
          out.push(`<g class="sbill${c.today ? ' today' : ''}" style="${delay(c.today ? 0 : (i - 1) * 400 + j * 90)}">
            <rect class="t${tier}" x="${cx - w / 2}" y="${yb + gap}" width="${w}" height="${h}" rx="${Math.min(3, h / 3)}"/>
            ${h >= fontSize * 1.1 ? `<text x="${cx}" y="${yb + gap + h / 2 + fontSize * 0.28}" text-anchor="middle" font-size="${fontSize * 0.8}" class="bill-text">$ ${d}%</text>` : ''}</g>`);
        });
        const ly = yb - fontSize * 0.6;
        out.push(`<text class="${c.today ? 'baseline-label' : 'median-label'}" x="${cx}" y="${ly}" text-anchor="middle" font-size="${fontSize * (c.today ? 1 : 1.3)}" style="${c.today ? '' : delay((i - 1) * 400 + stacks[i].length * 90 + 150)}">${c.today ? '' : 'median '}${fmtPct(meds[i])}</text>`);

        const st = strips[i];
        if (!st) return;
        const { sx, sx0, sx1, r, placed } = st;
        placed.forEach(p => p.y = Math.min(stripH - 2 * r, p.y));
        out.push(`<line class="axis" x1="${sx0}" x2="${sx1}" y1="${stripAxis}" y2="${stripAxis}"/>`);
        [[0.5, 'start'], [10, 'middle'], [100, 'end']].filter(([t]) => t !== 10 || colW > 170).forEach(([t, a]) => {
          out.push(`<line class="tick" x1="${sx(t)}" x2="${sx(t)}" y1="${stripAxis}" y2="${stripAxis + 4}"/>`);
          out.push(`<text class="tick-label" x="${sx(t)}" y="${stripAxis + fontSize * 1.1}" text-anchor="${a}" font-size="${fontSize * 0.75}">${t}%</text>`);
        });
        placed.forEach((p, j) => out.push(`<circle class="vote${p.mine ? ' mine' : ''}" cx="${p.x}" cy="${stripAxis - r - 1 - p.y}" r="${p.mine ? r * 1.4 : r}" style="${delay((i - 1) * 400 + Math.min(j * 10, 400))}"/>`));
        out.push(`<line class="median" x1="${sx(meds[i])}" x2="${sx(meds[i])}" y1="${stripTop}" y2="${stripAxis}" style="${delay((i - 1) * 400 + 500)}"/>`);
      });
      const svg = `<svg class="${animate ? '' : 'still'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${out.join('')}</svg>`;
      const refs = votes ? refBars(q, meds.slice(1).map((m, i) => ({ label: q.piles[i].label, value: m }))) : '';
      return side ? `<div class="side-by-side">${svg}<div class="side">${calloutHTML(q)}${refs}</div></div>` : svg + refs;
    },
    yours(q, v, votes) {
      return q.piles.map(p => {
        const med = median(votes.map(x => Math.max(x.value[p.key], 0.5)));
        return `${esc(p.label)}: you <b>${v[p.key]}%</b> · room <b>${fmtPct(med)}</b>`;
      }).join('<br>');
    },
    fake(q) { // rising with the year
      const out = {}; let prev = q.baseline;
      q.piles.forEach((p, i) => { prev = Math.min(100, Math.round(prev * (1 + Math.random() * (1.5 + i)) + Math.random() * 3 * i)); out[p.key] = prev; });
      return out;
    },
  },
  // Headcount per area, drawn as crowds of person icons (1 icon = q.per people).
  // Below today the missing people become robots; above today new hires are highlighted.
  crowds: {
    valid: v => v && typeof v === 'object' && Object.values(v).every(x => typeof x === 'number' && x >= 0),
    context(q) {
      return `<div class="breakdown"><div class="bd-head">${esc(q.context)}</div>${q.buckets.map(b =>
        `<div class="bd-row"><span>${esc(b.label)} <span class="muted">(${esc(b.split)})</span></span><b>~${b.today}</b></div>`).join('')}</div>`;
    },
    input(el, q, initial, onChange) {
      const vals = Object.fromEntries(q.buckets.map(b => [b.key, initial?.[b.key] ?? b.today]));
      el.innerHTML = q.buckets.map(b => `
        <div class="crowd-card" data-k="${b.key}">
          <div class="cc-head"><b>${esc(b.label)}</b><span class="muted">today ~${b.today}</span></div>
          <div class="cc-num"><input type="number" inputmode="numeric" min="0" max="${q.max}" step="${q.per}" aria-label="${esc(b.label)} headcount"><span class="cc-delta"></span></div>
          <div class="crowd"></div>
          <div class="cc-btns"><button data-op="half">÷2</button><button data-op="minus">−${q.per}</button><button data-op="plus">+${q.per}</button><button data-op="double">×2</button></div>
        </div>`).join('') + `<div class="tray-hint muted">${personSVG('kept')} = ${q.per} people · ${personSVG('robot')} = replaced by AI · ${personSVG('new')} = new hires</div>`;
      const sync = (k, fromInput) => {
        const b = q.buckets.find(x => x.key === k), card = el.querySelector(`.crowd-card[data-k="${k}"]`);
        if (!fromInput) card.querySelector('input').value = vals[k];
        const r = vals[k] / b.today;
        card.querySelector('.cc-delta').textContent = `×${r >= 10 ? r.toFixed(0) : r.toFixed(2).replace(/0$/, '')} vs today`;
        card.querySelector('.cc-delta').className = 'cc-delta ' + (r < 0.97 ? 'down' : r > 1.03 ? 'up' : '');
        renderCrowd(card.querySelector('.crowd'), vals[k], b.today, q.per);
      };
      const set = (k, v, fromInput) => { vals[k] = Math.max(0, Math.min(q.max, Math.round(v))); sync(k, fromInput); onChange({ ...vals }); };
      el.querySelectorAll('.crowd-card').forEach(card => {
        const k = card.dataset.k;
        card.querySelectorAll('button').forEach(btn => btn.onclick = () => {
          const v = vals[k], op = btn.dataset.op;
          set(k, op === 'half' ? v / 2 : op === 'double' ? Math.max(v * 2, q.per) : op === 'plus' ? v + q.per : v - q.per);
        });
        card.querySelector('input').addEventListener('input', e => { if (e.target.value !== '') set(k, +e.target.value, true); });
        card.querySelector('input').addEventListener('change', () => sync(k));
      });
      q.buckets.forEach(b => sync(b.key));
      onChange({ ...vals });
    },
    // today's crowds (question) or room-median crowds with stats + log strip (reveal)
    chart(q, { width, fontSize = 12, votes = null, mine = null, animate = true }) {
      const colW = Math.max(100, width / q.buckets.length - 24);
      return `<div class="crowds-chart${animate ? '' : ' still'}" style="--icon:${Math.min(fontSize * 1.25, colW / 11)}px">${q.buckets.map((b, i) => {
        const head = `<div class="cr-head"><b>${esc(b.label)}</b></div>`;
        if (!votes) return `<div class="cr-col">${head}<div class="crowd big">${crowdIcons(b.today, b.today, q.per)}</div><div class="cr-sub">today ~${b.today}</div><div class="cr-q">2030: ?</div></div>`;
        const vs = votes.map(v => ({ v: v.value[b.key], mine: v.id === mine })).filter(v => typeof v.v === 'number');
        if (!vs.length) return `<div class="cr-col">${head}</div>`;
        const med = median(vs.map(v => Math.max(v.v, 1))), r = med / b.today;
        const shrink = Math.round(100 * vs.filter(v => v.v < b.today * 0.97).length / vs.length);
        const grow = Math.round(100 * vs.filter(v => v.v > b.today * 1.03).length / vs.length);
        return `<div class="cr-col">${head}
          <div class="crowd big">${crowdIcons(med, b.today, q.per, animate ? i * 500 : null)}</div>
          <div class="cr-sub">today ~${b.today} → <b class="acc">room median ${Math.round(med)}</b> <span class="muted">(×${r >= 10 ? r.toFixed(0) : r.toFixed(2).replace(/0$/, '')})</span></div>
          <div class="cr-stat"><span class="down"><b>${shrink}%</b> expect it to shrink</span><span class="up"><b>${grow}%</b> to grow</span></div>
          ${logStripSVG(vs, { lo: q.stripMin, hi: q.max, width: colW, fontSize, today: b.today, med, animate, delay: i * 500 })}</div>`;
      }).join('')}</div>`;
    },
    yours(q, v, votes) {
      return q.buckets.map(b => `${esc(b.label)}: you <b>${v[b.key]}</b> · room <b>${Math.round(median(votes.map(x => Math.max(x.value[b.key], 1))))}</b> · today ~${b.today}`).join('<br>');
    },
    fake(q) {
      const g = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      return Object.fromEntries(q.buckets.map((b, i) => [b.key, Math.round(Math.min(q.max, b.today * 10 ** ([-0.15, 0.1, 0.25][i] + 0.4 * g())) / 5) * 5]));
    },
  },
  // Learning curve: a fixed starting point plus draggable points (e.g. today, 2030) on a 0–100% axis.
  curve: {
    valid: v => v && typeof v === 'object' && Object.values(v).every(x => typeof x === 'number'),
    context(q) {
      return `<ol class="steps">${q.steps.map(s => `<li><b>${esc(s.head)}</b> ${esc(s.text)}</li>`).join('')}</ol>`;
    },
    input(el, q, initial, onChange) {
      const vals = Object.fromEntries(q.points.filter(p => p.key).map(p => [p.key, initial?.[p.key] ?? q.start]));
      const draw = () => {
        el.innerHTML = curveSVG(q, { width: Math.round(el.clientWidth || 340), fontSize: 13, lines: [], mineVals: vals, interactive: true })
          + `<div class="tray-hint muted">Drag the orange dots up or down</div>`;
        el.querySelectorAll('[data-k]').forEach(hit => hit.addEventListener('pointerdown', e => {
          const svg = el.querySelector('svg'), k = hit.dataset.k;
          const { top, bottom } = svg.querySelector('.plot').getBoundingClientRect();
          const at = ev => { vals[k] = Math.max(0, Math.min(100, Math.round(100 * (bottom - ev.clientY) / (bottom - top)))); update(); };
          hit.setPointerCapture(e.pointerId); at(e);
          hit.onpointermove = at; hit.onpointerup = () => { hit.onpointermove = null; };
        }));
      };
      // move dots/line in place while dragging (no re-render, so pointer capture survives)
      const update = () => {
        const svg = el.querySelector('svg'), yOf = v => +svg.dataset.bottom - (+svg.dataset.bottom - +svg.dataset.top) * v / 100;
        for (const [k, v] of Object.entries(vals)) {
          const g = svg.querySelector(`.pt[data-pt="${k}"]`);
          g.querySelector('circle').setAttribute('cy', yOf(v));
          g.querySelector('text').setAttribute('y', yOf(v) - 14);
          g.querySelector('text').textContent = v + '%';
        }
        const pts = q.points.map(p => p.fixed ?? vals[p.key]);
        svg.querySelector('.my-line').setAttribute('points', pts.map((v, i) => `${svg.dataset['x' + i]},${yOf(v)}`).join(' '));
        onChange({ ...vals });
      };
      draw(); update();
    },
    chart(q, { width, fontSize = 12, votes = null, mine = null, animate = true }) {
      const lines = votes ? votes.map(v => ({ vals: v.value, mine: v.id === mine })) : [];
      return curveSVG(q, { width, fontSize, lines, animate, reveal: !!votes });
    },
    yours(q, v, votes) {
      return '<span class="muted">Dashed line = your curve · orange = room median</span><br>' + q.points.filter(p => p.key).map(p => `${esc(p.label)}: you <b>${v[p.key]}%</b> · room <b>${Math.round(median(votes.map(x => Math.max(x.value[p.key], 0.5))))}%</b>`).join('<br>');
    },
    fake(q) {
      const t = Math.min(95, Math.max(5, Math.round(q.start + 5 + Math.random() * 30)));
      return { today: t, y2030: Math.min(100, Math.round(t + Math.random() * 55)) };
    },
  },
  // Sort task cards into bins (drag, or tap a card then a bin). Value: { taskId: binIndex }.
  bins: {
    valid: v => v && typeof v === 'object' && Object.keys(v).length > 0,
    context(q) { return exampleHTML(q.example); },
    input(el, q, initial, onChange) {
      const assign = { ...(initial || {}) };
      let selected = null;
      el.innerHTML = `<div class="tray-hint muted" style="margin:0 0 8px">Drag each task into a bin, or tap a task and then a bin. Tap a placed icon to take it back.</div>
        <div class="task-tray"></div>
        <div class="bins">${q.bins.map((b, i) => `<div class="bin" data-b="${i}" style="--c:${b.color}"><div class="bin-h">${b.icon} ${esc(b.short)} <span class="bin-n"></span></div><div class="bin-items"></div></div>`).join('')}</div>`;
      const tray = el.querySelector('.task-tray');
      const render = () => {
        tray.innerHTML = q.tasks.filter(t => assign[t.id] == null).map(t =>
          `<div class="task${selected === t.id ? ' sel' : ''}" data-id="${t.id}"><span class="ti">${t.icon}</span><span>${esc(t.label)}</span></div>`).join('')
          || '<div class="muted center" style="padding:8px">All sorted ✓</div>';
        el.querySelectorAll('.bin').forEach(bin => {
          const ts = q.tasks.filter(t => assign[t.id] === +bin.dataset.b);
          bin.querySelector('.bin-items').innerHTML = ts.map(t => `<span class="chip" data-id="${t.id}" title="${esc(t.label)}">${t.icon}</span>`).join('');
          bin.querySelector('.bin-n').textContent = ts.length || '';
          bin.classList.toggle('armed', selected != null);
        });
        onChange({ ...assign });
      };
      const place = (id, b) => { assign[id] = b; selected = null; render(); };
      el.querySelector('.bins').addEventListener('click', e => {
        const bin = e.target.closest('.bin'), chip = e.target.closest('.chip');
        if (bin && selected) place(selected, +bin.dataset.b);          // a selected task wins over chip taps
        else if (chip) { delete assign[chip.dataset.id]; render(); }
      });
      // pointer: small movement = tap (select), larger = drag to a bin
      tray.addEventListener('pointerdown', e => {
        const card = e.target.closest('.task'); if (!card) return;
        const id = card.dataset.id, x0 = e.clientX, y0 = e.clientY;
        let ghost = null, target = null;
        const move = ev => {
          if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) {
            ghost = card.cloneNode(true); ghost.classList.add('ghost'); document.body.appendChild(ghost);
          }
          if (!ghost) return;
          ev.preventDefault();
          ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
          const bin = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.bin');
          if (bin !== target) { target?.classList.remove('hover'); target = bin; target?.classList.add('hover'); }
        };
        const up = () => {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
          if (ghost) { ghost.remove(); target?.classList.remove('hover'); if (target) place(id, +target.dataset.b); }
          else { selected = selected === id ? null : id; render(); }
        };
        window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up);
      });
      render();
    },
    // question: task cards + bin legend; reveal: one stacked bar per task, sorted by mean bin
    chart(q, { width, fontSize = 12, votes = null, mine = null, animate = true }) {
      const legend = `<div class="bin-legend">${q.bins.map(b => `<span style="--c:${b.color}"><i></i>${b.icon} ${esc(b.label)}</span>`).join('')}</div>`;
      if (!votes) return legend + `<div class="task-grid">${q.tasks.map(t => `<div class="task static"><span class="ti">${t.icon}</span><span>${esc(t.label)}</span></div>`).join('')}</div>`;
      const myAns = votes.find(v => v.id === mine)?.value || {};
      const rows = q.tasks.map(t => {
        const counts = q.bins.map(() => 0);
        votes.forEach(v => { const b = v.value[t.id]; if (b != null) counts[b]++; });
        const n = counts.reduce((a, b) => a + b, 0) || 1, p = counts.map(c => c / n);
        const mean = p.reduce((a, x, i) => a + x * i, 0), ent = -p.reduce((a, x) => a + (x ? x * Math.log(x) : 0), 0);
        return { t, p, mean, ent, n };
      }).sort((a, b) => a.mean - b.mean);
      const hot = new Set([...rows].sort((a, b) => b.ent - a.ent).slice(0, 3).map(r => r.t.id));
      return legend + `<div class="bin-rows${animate ? '' : ' still'}">${rows.map((r, j) => `
        <div class="bin-row"><div class="br-label"><span class="ti">${r.t.icon}</span>${esc(r.t.label)}${hot.has(r.t.id) ? ' <span class="hot">🔥 split</span>' : ''}</div>
          <div class="br-bar">${r.p.map((x, i) => x ? `<span style="--c:${q.bins[i].color};width:${100 * x}%;animation-delay:${animate ? j * 60 : 0}ms" class="${myAns[r.t.id] === i ? 'mine' : ''}">${x >= 0.14 ? Math.round(100 * x) + '%' : ''}</span>` : '').join('')}</div></div>`).join('')}</div>`;
    },
    yours(q, v, votes) {
      const n = Object.keys(v).length;
      return `<span class="muted">You sorted ${n} of ${q.tasks.length} tasks · your pick is outlined in each bar</span>`;
    },
    fake(q) {
      return Object.fromEntries(q.tasks.map(t => [t.id, Math.max(0, Math.min(3, t.guess + Math.round((Math.random() - 0.5) * 2.4)))]));
    },
  },
  // Funnel of stages (e.g. applicants → admitted) on one shared log scale; drag each bar's edge.
  funnel: {
    valid: v => v && typeof v === 'object' && Object.values(v).every(x => typeof x === 'number' && x > 0),
    context(q) {
      return `<div class="breakdown"><div class="bd-head">${esc(q.context)}</div>${q.stages.map(st =>
        `<div class="bd-row"><span>${esc(st.label)} <span class="muted">(${esc(st.note)})</span></span><b>~${st.today.toLocaleString()}</b></div>`).join('')}</div>`;
    },
    input(el, q, initial, onChange) {
      const vals = Object.fromEntries(q.stages.map(st => [st.key, initial?.[st.key] ?? st.today]));
      const draw = () => {
        el.innerHTML = funnelSVG(q, { width: Math.round(el.clientWidth || 340), fontSize: 13, mine: vals, interactive: true })
          + `<div class="f-btns">${q.stages.map(st => `<span>${esc(st.short)} <button data-k="${st.key}" data-f="0.9">−</button><button data-k="${st.key}" data-f="1.1">+</button></span>`).join('')}</div>`
          + `<div class="tray-hint muted">Drag the edge of each bar (log scale) or fine-tune with −/+ · dashed outline = today</div>`;
        el.querySelectorAll('.f-btns button').forEach(b => b.onclick = () => {
          const i = q.stages.findIndex(s => s.key === b.dataset.k), k = b.dataset.k;
          let v = vals[k] * +b.dataset.f;
          v = v >= 100 ? sig2(v) : Math.max(1, Math.round(v) + (b.dataset.f > 1 && Math.round(v) === vals[k] ? 1 : 0) - (b.dataset.f < 1 && Math.round(v) === vals[k] ? 1 : 0));
          const prev = q.stages[i - 1], next = q.stages[i + 1];
          if (prev) v = Math.min(v, vals[prev.key]);
          if (next) v = Math.max(v, vals[next.key]);
          vals[k] = Math.max(1, Math.min(q.max, v)); update();
        });
        el.querySelectorAll('.f-hit').forEach(hit => hit.addEventListener('pointerdown', e => {
          const svg = el.querySelector('svg'), k = hit.dataset.k, i = q.stages.findIndex(s => s.key === k);
          const at = ev => {
            const r = svg.getBoundingClientRect(), W = +svg.dataset.w, sc = W / r.width;
            const frac = Math.abs((ev.clientX - r.left) * sc - W / 2) / (+svg.dataset.half);
            let v = 10 ** (Math.min(1, Math.max(0, frac)) * Math.log10(q.max));
            v = v >= 100 ? sig2(v) : Math.max(1, Math.round(v));
            const prev = q.stages[i - 1], next = q.stages[i + 1];      // keep the funnel narrowing
            if (prev) v = Math.min(v, vals[prev.key]);
            if (next) v = Math.max(v, vals[next.key]);
            vals[k] = v; update();
          };
          hit.setPointerCapture(e.pointerId); at(e);
          hit.onpointermove = at; hit.onpointerup = () => { hit.onpointermove = null; };
        }));
      };
      const update = () => {   // swap in a fresh SVG body without losing the captured pointer target
        const tmp = document.createElement('div');
        tmp.innerHTML = funnelSVG(q, { width: +el.querySelector('svg').dataset.w, fontSize: 13, mine: vals, interactive: true });
        el.querySelector('svg .f-draw').replaceWith(tmp.querySelector('.f-draw'));
        onChange({ ...vals });
      };
      draw(); onChange({ ...vals });
    },
    chart(q, { width, fontSize = 12, votes = null, mine = null, animate = true }) {
      return funnelSVG(q, { width, fontSize, votes, mineId: mine, animate });
    },
    yours(q, v, votes) {
      return q.stages.map(st => `${esc(st.label)}: you <b>${v[st.key].toLocaleString()}</b> · room <b>${Math.round(median(votes.map(x => x.value[st.key]))).toLocaleString()}</b> · today ~${st.today.toLocaleString()}`).join('<br>');
    },
    fake(q) {
      const g = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      const a = sig2(Math.min(q.max, q.stages[0].today * 10 ** (0.3 + 0.35 * g())));
      return { [q.stages[0].key]: a, [q.stages[1].key]: Math.max(1, Math.min(a, Math.round(q.stages[1].today * 10 ** (0.1 + 0.3 * g())))) };
    },
  },
  // Free-text predictions written on glass tubes (length = how big it'll be), dropped into one hat per year.
  // Presenter reveal steps, per year: hat → spill onto a wall → spotlights (loudest + wildcards); then both walls.
  tubes: {
    valid: v => v && typeof v === 'object' && Object.values(v).some(a => tubeList(a).length),
    context(q) { return `<div class="muted">${esc(q.context)}</div>`; },
    input(el, q, initial, onChange) {
      const st = q.years.map(y => ({ hat: tubeList(initial?.[y.key]).map(t => ({ t: t.t, n: t.n || q.startN })), bench: [] }));
      st.forEach(s => { while (s.hat.length + s.bench.length < q.perYear) s.bench.push({ t: '', n: q.startN }); });
      const emit = () => onChange(Object.fromEntries(q.years.map((y, i) => [y.key, st[i].hat.filter(t => t.t.trim())])));
      el.innerHTML = q.years.map((y, i) => `<div class="ty" data-y="${i}" style="--yc:${y.color}"><div class="ty-head">${esc(y.label)}</div><div class="bench"></div><div class="hat-zone" data-y="${i}"></div></div>`).join('')
        + `<div class="tray-hint muted">Type a topic, stretch the tube with the knob to set how many submissions it gets (1k–200k, log scale), then drag it by the cork into the hat, or tap ⤵.</div>`;
      const renderYear = i => {
        const sec = el.querySelector(`.ty[data-y="${i}"]`), s = st[i];
        sec.querySelector('.bench').innerHTML = s.bench.map((t, j) => `
          <div class="tube-row" data-j="${j}"><div class="tube" data-j="${j}" style="--f:${tubeFrac(q, t.n)}">
            <span class="cork" title="Drag into the hat"></span>
            <input value="${esc(t.t)}" maxlength="48" placeholder="topic…" aria-label="Topic for ${esc(q.years[i].label)}">
            <span class="tube-n" title="Predicted submissions">${fmt(t.n)}</span>
            <span class="knob" title="Drag to resize"></span>
          </div><button class="to-hat" title="Drop into the hat" aria-label="Drop into the hat">⤵</button></div>`).join('') || '<div class="muted bench-empty">All tubes are in the hat 🎩</div>';
        sec.querySelector('.hat-zone').innerHTML = hatSVG(s.hat.map(t => tubeFrac(q, t.n)), { clickable: true })
          + `<div class="hat-cap">${s.hat.length ? `${s.hat.length} in the hat · tap a tube to take it out` : 'the hat is empty'}</div>`;
        sec.querySelectorAll('.tube').forEach(tube => wireTube(i, tube));
      };
      const toHat = (i, j, tube, from) => {
        const t = st[i].bench[j];
        if (!t.t.trim()) { tube.classList.remove('shake'); void tube.offsetWidth; tube.classList.add('shake'); tube.querySelector('input').focus(); return; }
        const hat = el.querySelector(`.hat-zone[data-y="${i}"] svg`), hr = hat.getBoundingClientRect(), r = (from || tube).getBoundingClientRect();
        const ghost = tube.cloneNode(true); ghost.classList.add('flying');
        Object.assign(ghost.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px' });
        document.body.appendChild(ghost);
        const dx = hr.left + hr.width / 2 - (r.left + r.width / 2), dy = hr.top + hr.height * 0.3 - (r.top + r.height / 2);
        ghost.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy - 40}px) rotate(-70deg) scale(.6)`, offset: .6 }, { transform: `translate(${dx}px, ${dy}px) rotate(-90deg) scale(.2)`, opacity: 0 }],
          { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => ghost.remove();
        st[i].bench.splice(j, 1); st[i].hat.push({ t: t.t.trim(), n: t.n });
        renderYear(i); emit();
        const h = el.querySelector(`.hat-zone[data-y="${i}"] svg`); h.classList.add('gulp'); setTimeout(() => h.classList.remove('gulp'), 600);
      };
      const wireTube = (i, tube) => {
        const j = +tube.dataset.j, t = st[i].bench[j];
        tube.querySelector('input').addEventListener('input', e => { t.t = e.target.value; });
        tube.parentElement.querySelector('.to-hat').onclick = () => toHat(i, j, tube);
        // resize: drag the knob; width maps to size 1–5
        tube.querySelector('.knob').addEventListener('pointerdown', e => {
          e.preventDefault(); const knob = e.target; knob.setPointerCapture(e.pointerId);
          const rowW = tube.parentElement.getBoundingClientRect().width - 40;   // minus the ⤵ button
          knob.onpointermove = ev => {
            const frac = (ev.clientX - tube.getBoundingClientRect().left) / rowW;
            const f = Math.max(0, Math.min(1, (frac - .42) / .58));
            t.n = sig2(q.minN * (q.maxN / q.minN) ** f);
            tube.style.setProperty('--f', tubeFrac(q, t.n)); tube.querySelector('.tube-n').textContent = fmt(t.n);
          };
          knob.onpointerup = () => { knob.onpointermove = null; };
        });
        // drag by the cork into the hat
        tube.querySelector('.cork').addEventListener('pointerdown', e => {
          e.preventDefault();
          const r = tube.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
          const ghost = tube.cloneNode(true); ghost.classList.add('dragging');
          Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
          document.body.appendChild(ghost); tube.classList.add('lifted');
          let over = null;
          const move = ev => {
            ghost.style.left = ev.clientX - ox + 'px'; ghost.style.top = ev.clientY - oy + 'px';
            const z = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(`.hat-zone[data-y="${i}"]`);
            if (z !== over) { over?.classList.remove('hover'); over = z; over?.classList.add('hover'); }
          };
          const up = () => {
            window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
            tube.classList.remove('lifted'); over?.classList.remove('hover');
            if (over) toHat(i, j, tube, ghost);
            ghost.remove();
          };
          window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
        });
      };
      el.addEventListener('click', e => {   // tap a tube sticking out of the hat to take it back out
        const stick = e.target.closest('.stick'); if (!stick) return;
        const i = +stick.closest('.hat-zone').dataset.y, k = +stick.dataset.k;
        const [t] = st[i].hat.splice(k, 1);
        const empty = st[i].bench.findIndex(b => !b.t.trim());
        if (empty >= 0) st[i].bench.splice(empty, 1);
        st[i].bench.unshift(t); renderYear(i); emit();
      });
      q.years.forEach((_, i) => renderYear(i)); emit();
    },
    steps(q, votes) { return tubePlan(q, votes).length; },
    chart(q, { votes = null, mine = null, animate = true, step = null }) {
      if (!votes) return `<div class="hats-row">${q.years.map(y => `<div class="hat-big" style="--yc:${y.color}">${hatSVG([])}<div class="hat-label">${esc(y.label)}</div></div>`).join('')}</div>`;
      if (step == null) return `<div class="walls final">${q.years.map((y, yi) => wallHTML(q, yi, tubeGroups(q, votes, yi, mine), { mineHL: true })).join('')}</div>`;
      const plan = tubePlan(q, votes), p = plan[Math.min(step, plan.length - 1)];
      if (p.mode === 'final') return `<div class="walls final">${q.years.map((y, yi) => wallHTML(q, yi, tubeGroups(q, votes, yi))).join('')}</div>`;
      const y = q.years[p.yi], groups = tubeGroups(q, votes, p.yi), n = groups.reduce((a, g) => a + g.texts.length, 0);
      if (p.mode === 'hat') return `<div class="hat-stage" style="--yc:${y.color}"><div class="hat-big${animate ? ' wobble' : ''}">${hatSVG(groups.flatMap(g => g.ns.map(n => tubeFrac(q, n))).slice(0, 40))}</div>
        <div class="hat-label">${esc(y.label)} · ${n} tubes from the room</div><div class="muted">press → to spill</div></div>`;
      return wallHTML(q, p.yi, groups, { spill: p.mode === 'wall' && animate, spot: p.mode === 'spot' ? p.spot : null, hatMini: true });
    },
    mounted(el, { animate }) {
      if (!animate) return;
      const wall = el.querySelector('.wall.spill'), hat = el.querySelector('.hat-mini');
      if (!wall || !hat) return;
      const hr = hat.getBoundingClientRect(), hx = hr.left + hr.width * 0.75, hy = hr.top + hr.height * 0.25;
      wall.querySelectorAll('.wtube').forEach((t, i) => {
        const r = t.getBoundingClientRect(), rot = t.dataset.r;
        const dx = hx - (r.left + r.width / 2), dy = hy - (r.top + r.height / 2);
        t.animate([
          { transform: `translate(${dx}px, ${dy}px) rotate(${-120 + i * 37 % 90}deg) scale(.15)`, opacity: 0 },
          { opacity: 1, offset: .2 },
          { transform: `rotate(${rot}deg)` },
        ], { duration: 750, delay: 250 + Math.min(i * 45, 1400), easing: 'cubic-bezier(.2,.9,.3,1.15)', fill: 'backwards' });
      });
    },
    yours(q, v) {
      return q.years.map(y => `${esc(y.label)}: ${tubeList(v[y.key]).map(t => `<b>${esc(t.t)}</b>`).join(', ') || '<span class="muted">—</span>'}`).join('<br>')
        + '<br><span class="muted">Your tubes are outlined</span>';
    },
    fake(q) {
      const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
      return Object.fromEntries(q.years.map((y, i) => [y.key, pick(FAKE_TOPICS[i], 1 + Math.floor(Math.random() * 3)).map(t => ({ t, n: sig2(q.minN * (q.maxN / q.minN) ** (Math.random() ** 1.6)) }))]));
    },
  },
  // Social / meta question: answer Yes/No yourself, then predict the room's % Yes on a dial.
  meta: {
    valid: v => v && (v.ans === 'yes' || v.ans === 'no') && typeof v.pred === 'number',
    context(q) { return `<div class="muted">${esc(q.context)}</div>`; },
    input(el, q, initial, onChange) {
      const val = { ans: initial?.ans ?? null, pred: initial?.pred ?? 50 };
      el.innerHTML = `<div class="meta-step">1 · ${esc(q.ask)}</div>
        <div class="yn">${['yes', 'no'].map(a => `<button data-a="${a}" class="${a}">${a === 'yes' ? '👍 Yes' : '👎 No'}</button>`).join('')}</div>
        <div class="meta-step">2 · ${esc(q.predict)}</div><div class="dial-box"></div>
        <div class="tray-hint muted">Drag the needle</div>`;
      const box = el.querySelector('.dial-box');
      const draw = () => {
        el.querySelectorAll('.yn button').forEach(b => b.classList.toggle('on', b.dataset.a === val.ans));
        box.innerHTML = dialSVG({ width: Math.round(box.clientWidth || 320), fontSize: 13, needle: val.pred, interactive: true });
        if (val.ans) onChange({ ...val });
      };
      el.querySelectorAll('.yn button').forEach(b => b.onclick = () => { val.ans = b.dataset.a; draw(); });
      box.addEventListener('pointerdown', e => {
        box.setPointerCapture(e.pointerId);   // capture on the container: the SVG is redrawn on every move
        const at = ev => {
          const svg = box.querySelector('svg'), r = svg.getBoundingClientRect(), W = +svg.dataset.w, sc = W / r.width;
          const x = (ev.clientX - r.left) * sc - +svg.dataset.cx, y = +svg.dataset.cy - (ev.clientY - r.top) * sc;
          val.pred = Math.round(100 * (1 - Math.atan2(Math.max(y, 0), x) / Math.PI));
          draw();
        };
        at(e); box.onpointermove = at; box.onpointerup = () => { box.onpointermove = null; };
      });
      draw();
    },
    chart(q, { width, fontSize = 12, votes = null, mine = null, animate = true }) {
      if (!votes) return `<div class="meta-wrap">${dialSVG({ width: Math.min(width, 620), fontSize, question: true })}</div>`;
      const vs = votes.filter(v => TYPES.meta.valid(v.value)), n = vs.length || 1;
      const yes = vs.filter(v => v.value.ans === 'yes'), actual = 100 * yes.length / n;
      const medPred = median(vs.map(v => Math.max(v.value.pred, 0.5)));
      const avg = a => a.length ? a.reduce((s, v) => s + v.value.pred, 0) / a.length : null;
      const py = avg(yes), pn = avg(vs.filter(v => v.value.ans === 'no')), mean = avg(vs);
      const sp = actual > mean + 2 ? 'Yes' : actual < mean - 2 ? 'No' : null;
      const close = vs.filter(v => Math.abs(v.value.pred - actual) <= 5).length;
      const seats = [...vs].sort((a, b) => (a.value.ans === 'yes' ? 0 : 1) - (b.value.ans === 'yes' ? 0 : 1)).map(v => `<span class="seat ${v.value.ans}${v.id === mine ? ' mine' : ''}">${v.value.ans === 'yes' ? '👍' : '👎'}</span>`).join('');
      return `<div class="meta-wrap${animate ? '' : ' still'}">
        ${dialSVG({ width: Math.min(width * (width > 700 ? .55 : 1), 620), fontSize, needle: actual, preds: vs.map(v => ({ p: v.value.pred, mine: v.id === mine })), medPred, animate })}
        <div class="meta-side">
          <div class="meta-big"><b>${Math.round(actual)}%</b> said Yes <span class="muted">· room predicted ${Math.round(medPred)}% (median)</span></div>
          <div class="seats">${seats}</div>
          <div class="meta-fact"><b>False consensus?</b> Yes-voters guessed <b class="y">${py == null ? '–' : Math.round(py) + '%'}</b> would say Yes; No-voters guessed <b class="n">${pn == null ? '–' : Math.round(pn) + '%'}</b>.</div>
          <div class="meta-fact"><b>Surprisingly popular:</b> ${sp ? `<b class="${sp === 'Yes' ? 'y' : 'n'}">${sp}</b> (more common than the room predicted)` : 'neither: the room predicted itself well'}</div>
          <div class="meta-fact muted">${close} of ${vs.length} guessed within 5 points</div>
        </div></div>`;
    },
    yours(q, v, votes) {
      const vs = votes.filter(x => TYPES.meta.valid(x.value)), actual = Math.round(100 * vs.filter(x => x.value.ans === 'yes').length / (vs.length || 1));
      return `You said <b>${v.ans === 'yes' ? 'Yes' : 'No'}</b> and predicted <b>${v.pred}%</b> · actual <b>${actual}%</b> (off by ${Math.abs(v.pred - actual)})`;
    },
    fake() {
      const ans = Math.random() < 0.65 ? 'yes' : 'no';
      return { ans, pred: Math.max(0, Math.min(100, Math.round((ans === 'yes' ? 68 : 40) + (Math.random() - 0.5) * 40))) };
    },
  },
};
const fmtPct = v => (v < 10 ? +v.toFixed(1) : Math.round(v)) + '%';
// Learning-curve plot: columns for each point, 0–100% y axis. Input mode draws the participant's
// draggable curve; reveal mode overlays everyone's curves with the median curve on top.
function curveSVG(q, { width, fontSize = 12, lines = [], mineVals = null, interactive = false, animate = true, reveal = false }) {
  const W = Math.max(300, Math.min(width, 900)), left = fontSize * 3, right = fontSize * 2;
  const top = fontSize * 2.4, H = Math.min(380, Math.max(260, W * 0.55)), bottom = H - fontSize * 3.2;
  const n = q.points.length, xs = q.points.map((_, i) => left + (W - left - right) * (i + 0.5) / n);
  const y = v => bottom - (bottom - top) * v / 100;
  const out = [`<rect class="plot" x="${left}" y="${top}" width="${W - left - right}" height="${bottom - top}" fill="transparent"/>`];
  for (const g of [0, 25, 50, 75, 100]) {
    out.push(`<line class="grid" x1="${left}" x2="${W - right}" y1="${y(g)}" y2="${y(g)}"/>`);
    out.push(`<text class="tick-label" x="${left - 8}" y="${y(g) + fontSize * 0.35}" text-anchor="end" font-size="${fontSize * 0.85}">${g}%</text>`);
  }
  q.points.forEach((p, i) => out.push(`<text x="${xs[i]}" y="${bottom + fontSize * 1.5}" text-anchor="middle" font-size="${fontSize}" font-weight="700">${esc(p.label)}</text>`
    + (p.sub ? `<text class="tick-label" x="${xs[i]}" y="${bottom + fontSize * 2.7}" text-anchor="middle" font-size="${fontSize * 0.8}">${esc(p.sub)}</text>` : '')));
  const ptsOf = vals => q.points.map(p => p.fixed ?? vals[p.key]);
  const d = ms => animate ? `animation-delay:${ms}ms` : '';
  if (reveal && lines.length) {
    // everyone's curves, then the median curve
    lines.forEach((l, j) => out.push(`<polyline class="spaghetti${l.mine ? ' mine' : ''}" points="${ptsOf(l.vals).map((v, i) => `${xs[i]},${y(v)}`).join(' ')}" style="${d(Math.min(j * 25, 1200))}"/>`));
    const meds = q.points.map(p => p.fixed ?? median(lines.map(l => Math.max(l.vals[p.key], 0.5))));
    const md = Math.min(lines.length * 25, 1200) + 200;
    out.push(`<polyline class="median-curve" points="${meds.map((v, i) => `${xs[i]},${y(v)}`).join(' ')}" style="${d(md)}"/>`);
    meds.forEach((v, i) => out.push(`<circle class="med-dot${q.points[i].fixed != null ? ' fixed' : ''}" cx="${xs[i]}" cy="${y(v)}" r="${fontSize * 0.55}" style="${d(md)}"/>`
      + `<text class="${q.points[i].fixed != null ? 'baseline-label' : 'median-label'}" x="${xs[i] + fontSize * 0.9}" y="${y(v) + fontSize * 0.4}" font-size="${fontSize * (q.points[i].fixed != null ? 1 : 1.3)}" style="${d(md)}">${Math.round(v)}%</text>`));
  } else if (mineVals) {
    const pts = ptsOf(mineVals);
    out.push(`<polyline class="my-line" points="${pts.map((v, i) => `${xs[i]},${y(v)}`).join(' ')}"/>`);
    q.points.forEach((p, i) => {
      if (p.fixed != null) { out.push(`<circle class="med-dot fixed" cx="${xs[i]}" cy="${y(p.fixed)}" r="${fontSize * 0.5}"/><text class="baseline-label" x="${xs[i]}" y="${y(p.fixed) - 14}" text-anchor="middle" font-size="${fontSize}">${p.fixed}%</text>`); return; }
      const colW = (W - left - right) / n;
      out.push(`<g class="pt" data-pt="${p.key}"><circle class="drag-dot" cx="${xs[i]}" cy="${y(pts[i])}" r="${fontSize * 0.85}"/><text class="median-label" x="${xs[i]}" y="${y(pts[i]) - 14}" text-anchor="middle" font-size="${fontSize * 1.2}">${pts[i]}%</text></g>`);
      if (interactive) out.push(`<rect data-k="${p.key}" class="hit" x="${xs[i] - colW / 2}" y="${top - fontSize}" width="${colW}" height="${bottom - top + 2 * fontSize}"/>`);
    });
  } else {
    // presenter, question phase: just the fixed starting point and question marks
    q.points.forEach((p, i) => out.push(p.fixed != null
      ? `<circle class="med-dot fixed" cx="${xs[i]}" cy="${y(p.fixed)}" r="${fontSize * 0.55}"/><text class="baseline-label" x="${xs[i] + fontSize * 0.9}" y="${y(p.fixed) + fontSize * 0.4}" font-size="${fontSize * 1.1}">${p.fixed}%</text>`
      : `<text class="muted-text" x="${xs[i]}" y="${y(50)}" text-anchor="middle" font-size="${fontSize * 3}" font-weight="700">?</text>`));
  }
  const ds = xs.map((x, i) => `data-x${i}="${x}"`).join(' ');
  return `<svg class="${animate ? '' : 'still'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-top="${top}" data-bottom="${bottom}" ${ds} style="max-width:${W}px;margin:0 auto">${out.join('')}</svg>`;
}
// Funnel plot: one horizontal bar per stage, centred, half-width ∝ log10(value) on a shared scale.
// Shows today's funnel as a dashed outline; the participant's (input) or the room-median (reveal) funnel filled.
function funnelSVG(q, { width, fontSize = 12, mine = null, votes = null, mineId = null, interactive = false, animate = true }) {
  const W = Math.max(300, Math.min(width, 980)), cx = W / 2, half = W / 2 - fontSize * 0.8;
  const barH = fontSize * 3, gapH = fontSize * 4.4, top = fontSize * 3.6;
  const hw = v => half * Math.max(0.03, Math.min(1, Math.log10(Math.max(1, v)) / Math.log10(q.max)));
  const ys = q.stages.map((_, i) => top + i * (barH + gapH));
  const H = ys[ys.length - 1] + barH + (votes ? fontSize * 6.4 : fontSize * 1.2);
  const out = [];
  // shared log ticks along the top, mirrored on both sides
  for (let e = 1; e <= Math.floor(Math.log10(q.max)); e++) for (const s of [-1, 1]) {
    const x = cx + s * hw(10 ** e);
    out.push(`<line class="grid" x1="${x}" x2="${x}" y1="${top - 4}" y2="${ys[ys.length - 1] + barH}"/>`);
    if (s > 0 || W > 500) out.push(`<text class="tick-label" x="${x}" y="${top - fontSize * 1.9}" text-anchor="middle" font-size="${fontSize * 0.75}">${fmt(10 ** e)}</text>`);
  }
  const todayV = q.stages.map(s => s.today);
  const funnel = (vs, cls) => {
    const parts = [];
    vs.forEach((v, i) => {
      if (i) parts.push(`<polygon class="${cls}-neck" points="${cx - hw(vs[i - 1])},${ys[i - 1] + barH} ${cx + hw(vs[i - 1])},${ys[i - 1] + barH} ${cx + hw(v)},${ys[i]} ${cx - hw(v)},${ys[i]}"/>`);
      parts.push(`<rect class="${cls}" x="${cx - hw(v)}" y="${ys[i]}" width="${2 * hw(v)}" height="${barH}" rx="6"/>`);
    });
    return parts.join('');
  };
  out.push(funnel(todayV, 'f-today'));
  const draw = [];
  let shown = mine ? q.stages.map(s => mine[s.key]) : null;
  const vs = votes ? votes.filter(v => q.stages.every(s => typeof v.value[s.key] === 'number')) : [];
  if (votes && vs.length) shown = q.stages.map(s => median(vs.map(v => v.value[s.key])));
  const d = ms => animate ? `style="animation-delay:${ms}ms"` : '';
  if (shown) {
    draw.push(`<g class="f-fill" ${d(0)}>${funnel(shown, 'f-mine')}</g>`);
    q.stages.forEach((s, i) => {
      const r = shown[i] / s.today, lbl = `${Math.round(shown[i]).toLocaleString()}`;
      const fits = 2 * hw(shown[i]) > lbl.length * fontSize * 0.9 + 16;   // number inside the bar, else just outside it
      draw.push(`<text class="f-val${fits ? '' : ' out'}" x="${fits ? cx : cx + hw(shown[i]) + 10}" y="${ys[i] + barH * 0.62}" text-anchor="${fits ? 'middle' : 'start'}" font-size="${fontSize * 1.35}">${lbl}</text>`);
      draw.push(`<text class="f-sub" x="${cx}" y="${ys[i] - fontSize * 0.45}" text-anchor="middle" font-size="${fontSize * 0.85}">${esc(s.label)} · ×${r >= 10 ? r.toFixed(0) : r.toFixed(1)} vs today</text>`);
      if (mine) {   // drag handles on both edges
        for (const sgn of [-1, 1]) draw.push(`<rect class="f-handle" x="${cx + sgn * hw(shown[i]) - 5}" y="${ys[i] + 6}" width="10" height="${barH - 12}" rx="5"/>`);
      }
    });
    if (votes) {
      // everyone's answers as dots under each bar's right edge positions
      q.stages.forEach((s, i) => {
        const r = Math.max(2.5, fontSize * 0.28), placed = [];
        vs.map(v => ({ x: cx + hw(v.value[s.key]), mine: v.id === mineId })).sort((a, b) => a.x - b.x).forEach(p => {
          const near = placed.filter(o => Math.abs(o.x - p.x) < 2 * r);
          p.y = 0; while (near.some(o => o.y === p.y && Math.abs(o.x - p.x) < 2 * r)) p.y += 2 * r;
          placed.push(p);
        });
        placed.forEach((p, j) => draw.push(`<circle class="vote${p.mine ? ' mine' : ''}" cx="${p.x}" cy="${ys[i] + barH + 3 + r + Math.min(p.y, (i < q.stages.length - 1 ? gapH - fontSize * 1.6 : fontSize * 4) - 2 * r)}" r="${p.mine ? r * 1.4 : r}" ${d(300 + Math.min(j * 10, 400))}/>`));
      });
      const rate = shown[shown.length - 1] / shown[0], tRate = todayV[todayV.length - 1] / todayV[0];
      draw.push(`<text class="median-label" x="${cx}" y="${H - fontSize * 0.8}" text-anchor="middle" font-size="${fontSize * 1.1}">admit rate: today ~${(100 * tRate).toFixed(1)}% → room ${(100 * rate).toFixed(1)}%</text>`);
    }
  } else {
    q.stages.forEach((s, i) => draw.push(`<text class="f-sub" x="${cx}" y="${ys[i] - fontSize * 0.45}" text-anchor="middle" font-size="${fontSize * 0.85}">${esc(s.label)} · today ~${s.today.toLocaleString()}</text>`
      + `<text class="f-q" x="${cx}" y="${ys[i] + barH * 0.7}" text-anchor="middle" font-size="${fontSize * 1.8}">?</text>`));
  }
  out.push(`<g class="f-draw">${draw.join('')}</g>`);
  // hit areas live outside .f-draw so redrawing while dragging keeps pointer capture
  if (interactive) q.stages.forEach((s, i) => out.push(`<rect class="f-hit" data-k="${s.key}" x="0" y="${ys[i] - 6}" width="${W}" height="${barH + 12}"/>`));
  return `<svg class="funnel${animate ? '' : ' still'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-w="${W}" data-half="${half}" style="max-width:${W}px;margin:0 auto">${out.join('')}</svg>`;
}
// Semicircle dial, 0% on the left to 100% on the right. Optional needle, prediction dots and median tick.
function dialSVG({ width, fontSize = 12, needle = null, preds = null, medPred = null, interactive = false, animate = true, question = false }) {
  const W = Math.max(260, width), R = W * 0.38, cx = W / 2, cy = R + fontSize * 3.2, H = cy + fontSize * 2.4;
  const pt = (p, r) => [cx - r * Math.cos(Math.PI * p / 100), cy - r * Math.sin(Math.PI * p / 100)];
  const arc = (p0, p1, r) => { const [x0, y0] = pt(p0, r), [x1, y1] = pt(p1, r); return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`; };
  const out = [`<path d="${arc(0, 100, R)}" class="dial-track" stroke-width="${R * 0.16}"/>`];
  if (needle != null && !interactive) out.push(`<path d="${arc(0, Math.max(0.01, needle), R)}" class="dial-yes" stroke-width="${R * 0.16}" pathLength="100" style="--len:${needle}"/>`);
  for (const t of [0, 25, 50, 75, 100]) {
    const [x0, y0] = pt(t, R * 0.9), [x1, y1] = pt(t, R * 1.1), [tx, ty] = pt(t, R * 1.1 + fontSize * 1.1);
    out.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="tick"/><text x="${tx}" y="${ty + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize * 0.85}" class="tick-label">${t}%</text>`);
  }
  if (preds) {   // everyone's predictions as dots just outside the arc, stacked outward when crowded
    const used = {};
    preds.sort((a, b) => a.p - b.p).forEach((d, j) => {
      const b = Math.round(d.p / 2.5); used[b] = (used[b] || 0) + 1;
      const [x, y] = pt(d.p, R * 1.1 + fontSize * 2.2 + (used[b] - 1) * fontSize * 0.75);
      out.push(`<circle cx="${x}" cy="${y}" r="${d.mine ? fontSize * 0.42 : fontSize * 0.3}" class="vote${d.mine ? ' mine' : ''}" style="animation-delay:${animate ? 200 + j * 15 : 0}ms"/>`);
    });
  }
  if (medPred != null) { const [x0, y0] = pt(medPred, R * 0.78), [x1, y1] = pt(medPred, R * 1.08); out.push(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="dial-med"/>`); }
  if (needle != null) {
    const [nx, ny] = pt(0, R * 0.92);
    out.push(`<g class="needle${interactive ? '' : ' swing'}" style="--a:${needle * 1.8}deg;transform-origin:${cx}px ${cy}px;${interactive ? `transform:rotate(${needle * 1.8}deg)` : ''}">
      <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}"/><circle cx="${nx}" cy="${ny}" r="${fontSize * 0.5}"/></g><circle cx="${cx}" cy="${cy}" r="${fontSize * 0.7}" class="hub"/>`);
    out.push(`<text x="${cx}" y="${cy - R * 0.32}" text-anchor="middle" font-size="${fontSize * (interactive ? 2.4 : 2.8)}" class="dial-val">${Math.round(needle)}%</text>`);
  }
  if (question) out.push(`<text x="${cx}" y="${cy - R * 0.3}" text-anchor="middle" font-size="${fontSize * 3.4}" class="muted-text" font-weight="800">?</text>`);
  return `<svg class="dial${animate ? '' : ' still'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-w="${W}" data-cx="${cx}" data-cy="${cy}" style="max-width:${W}px">${out.join('')}</svg>`;
}
// ---------- helpers for the tubes type ----------
// Tube length ∝ log(predicted submissions) between q.minN and q.maxN.
const tubeFrac = (q, n) => Math.max(0, Math.min(1, Math.log(n / q.minN) / Math.log(q.maxN / q.minN))).toFixed(3);
const tubeList = a => (a ? Object.values(a) : []).filter(t => t && typeof t.t === 'string' && t.t.trim());
// Conservative topic key: only near-identical answers merge (case, punctuation, plurals, word order, a few synonyms).
const TOPIC_SYNONYMS = [[/reinforcement learning/g, 'rl'], [/mixture of experts?/g, 'moe'], [/chains? of thought/g, 'cot'],
  [/\bagentic\b/g, 'agent'], [/\bmech interp\b/g, 'mechanistic interpretability'], [/\binterp\b/g, 'interpretability'],
  [/large language models?/g, 'llm'], [/\bai\b/g, 'ai']];
const TOPIC_STOP = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'in', 'on', 'with', 'to', 'llm', 'llms', 'lm', 'lms', 'based', 'via']);
function normTopic(s) {
  let x = ' ' + s.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
  for (const [re, to] of TOPIC_SYNONYMS) x = x.replace(re, to);
  const toks = x.split(' ').filter(w => w && !TOPIC_STOP.has(w)).map(w => w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
  return [...new Set(toks)].sort().join(' ');
}
function tubeGroups(q, votes, yi, mine = null) {
  const key = q.years[yi].key, m = new Map();
  for (const v of votes) for (const t of tubeList(v.value[key])) {
    const k = normTopic(t.t); if (!k) continue;
    const g = m.get(k) || { k, texts: [], ns: [], mine: false };
    g.texts.push(t.t.trim()); g.ns.push(t.n || q.startN); g.mine ||= v.id === mine; m.set(k, g);
  }
  return [...m.values()].map(g => {
    const counts = {}; g.texts.forEach(t => counts[t] = (counts[t] || 0) + 1);
    return { ...g, text: Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0],
      n: median(g.ns), score: g.texts.length * 1e7 + median(g.ns) };   // most people first, then biggest predicted size
  });
}
// Small deterministic RNG so spill order, tilt and wildcards stay stable across redraws.
function seeded(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
function tubeSpots(q, groups) {
  const byScore = [...groups].sort((a, b) => b.score - a.score || a.k.localeCompare(b.k));
  const loud = byScore.slice(0, q.loud).map((g, i) => ({ g, tag: `📣 Loudest call #${i + 1}` }));
  const rest = byScore.slice(q.loud), rnd = seeded(rest.map(g => g.k).join('|'));
  const wild = rest.map(g => [rnd(), g]).sort((a, b) => a[0] - b[0]).slice(0, q.wild).map(([, g]) => ({ g, tag: '🎲 Wildcard' }));
  return [...loud, ...wild];
}
function tubePlan(q, votes) {
  const plan = [];
  q.years.forEach((y, yi) => {
    plan.push({ mode: 'hat', yi }, { mode: 'wall', yi });
    tubeSpots(q, tubeGroups(q, votes, yi)).forEach(spot => plan.push({ mode: 'spot', yi, spot }));
  });
  plan.push({ mode: 'final' });
  return plan;
}
function hatSVG(sizes, { clickable = false } = {}) {
  const n = sizes.length, sticks = sizes.map((s, k) => {
    const x = 34 + (n === 1 ? 26 : 52 * k / Math.max(1, n - 1)) - 3, h = 10 + s * 35, tilt = (k % 2 ? 1 : -1) * (4 + (k * 7) % 9);
    return `<g class="stick" data-k="${k}" transform="rotate(${tilt} ${x + 3} 44)"><rect x="${x}" y="${44 - h}" width="7" height="${h + 8}" rx="3.5" class="stick-glass"/><rect x="${x}" y="${44 - h}" width="7" height="6" rx="2" class="stick-cork"/></g>`;
  }).join('');
  return `<svg class="hat${clickable ? ' clickable' : ''}" viewBox="0 0 120 112">${sticks}
    <path d="M30 40 Q30 34 36 34 H84 Q90 34 90 40 V92 H30 Z" class="hat-crown"/>
    <rect x="30" y="74" width="60" height="11" class="hat-band"/>
    <ellipse cx="60" cy="94" rx="54" ry="9" class="hat-brim"/>
    <ellipse cx="60" cy="38" rx="27" ry="4" class="hat-mouth"/></svg>`;
}
function wallHTML(q, yi, groups, { spill = false, spot = null, hatMini = false, mineHL = false } = {}) {
  const y = q.years[yi], rnd = seeded(y.key + groups.length);
  const order = groups.map(g => [rnd(), g]).sort((a, b) => a[0] - b[0]).map(([, g]) => g);
  const tubes = order.map(g => {
    const r = ((rnd() - 0.5) * 8).toFixed(1);
    return `<div class="wtube${mineHL && g.mine ? ' mine' : ''}${spot && spot.g.k === g.k ? ' lit' : ''}" data-r="${r}" style="--f:${tubeFrac(q, g.n)};transform:rotate(${r}deg)">
      <span class="cork"></span><span class="wt">${esc(g.text)}</span><span class="tube-n">${fmt(g.n)}</span>${g.texts.length > 1 ? `<b class="x">×${g.texts.length}</b>` : ''}</div>`;
  }).join('');
  const spotHTML = spot ? `<div class="spot"><div class="spot-tag">${spot.tag}</div>
      <div class="bigtube" style="--f:${tubeFrac(q, spot.g.n)}"><span class="cork"></span><span class="wt">${esc(spot.g.text)}</span><span class="tube-n">${fmt(spot.g.n)}</span></div>
      <div class="spot-meta">${spot.g.texts.length > 1 ? `${spot.g.texts.length} people wrote this` : '1 person wrote this'} · median guess ${fmt(spot.g.n)} submissions${spot.g.texts.length > 1 && new Set(spot.g.texts).size > 1 ? ` · also as “${esc([...new Set(spot.g.texts)].filter(t => t !== spot.g.text).slice(0, 2).join('”, “'))}”` : ''}</div></div>` : '';
  return `<div class="wall-wrap" style="--yc:${y.color}">
    <div class="wall-head">${hatMini ? `<div class="hat-mini${spill ? ' spill' : ' tipped'}">${hatSVG([])}</div>` : ''}<b>${esc(y.label)}</b> <span class="muted">${groups.reduce((a, g) => a + g.texts.length, 0)} tubes · ${groups.length} distinct</span></div>
    <div class="wall${spill ? ' spill' : ''}${spot ? ' dim' : ''}">${tubes}</div>${spotHTML}</div>`;
}
const FAKE_TOPICS = [
  ['Agents', 'agentic RL', 'RL for reasoning', 'Reasoning RL', 'Test-time compute', 'World models', 'Mechanistic interpretability', 'mech interp', 'Long context',
   'Diffusion LMs', 'Multimodal reasoning', 'AI for science', 'Self-improvement', 'Synthetic data', 'Efficient inference', 'Evaluation', 'Tool use', 'Code agents',
   'Formal math / Lean', 'Latent reasoning', 'CoT monitorability', 'Multi-agent systems', 'Continual learning', 'Memory', 'RL environments'],
  ['Recursive self-improvement', 'Self-improvement', 'World models', 'AI scientists', 'Automated AI research', 'Continual learning', 'Robotics foundation models',
   'Scalable oversight', 'Alignment of superhuman models', 'Latent reasoning', 'Looped transformers', 'Agents', 'agent economies', 'Interpretability',
   'Reviewing AI-written papers', 'Post-training at scale', 'Embodied agents', 'Neuro-symbolic', 'Energy-efficient models', 'Multi-agent societies'],
];
// Person / robot icons for the crowds type.
const PERSON = '<circle cx="5" cy="3" r="2.6"/><path d="M0.8 13.6v-3.4a4.2 4.2 0 0 1 8.4 0v3.4z"/>';
const ROBOT = '<rect x="1.4" y="1.6" width="7.2" height="5.4" rx="1.3"/><rect x="4.4" y="0" width="1.2" height="1.8"/><rect x="1" y="8" width="8" height="5.6" rx="1"/><circle cx="3.6" cy="4.2" r=".8" class="eye"/><circle cx="6.4" cy="4.2" r=".8" class="eye"/>';
const personSVG = kind => `<svg class="ic ${kind}" viewBox="0 0 10 14">${kind === 'robot' ? ROBOT : PERSON}</svg>`;
function iconKinds(v, today, per) {
  const n = Math.round(v / per), t = Math.round(today / per), out = [];
  for (let i = 0; i < Math.max(n, t); i++) out.push(i < Math.min(n, t) ? 'kept' : n < t ? 'robot' : 'new');
  return out;
}
function crowdIcons(v, today, per, delay0 = null) {
  return iconKinds(v, today, per).map((k, i) => delay0 == null ? personSVG(k)
    : personSVG(k).replace('<svg ', `<svg style="animation-delay:${delay0 + Math.min(i * 12, 900)}ms" `)).join('');
}
// Incrementally update a crowd so only newly added icons animate in.
function renderCrowd(el, v, today, per) {
  const kinds = iconKinds(v, today, per);
  while (el.children.length > kinds.length) el.lastElementChild.remove();
  kinds.forEach((k, i) => {
    const ex = el.children[i];
    if (!ex) el.insertAdjacentHTML('beforeend', personSVG(k));
    else if (!ex.classList.contains(k)) ex.outerHTML = personSVG(k);
  });
}
// Small log-scale dot strip of answers with today's level and the median marked.
function logStripSVG(vs, { lo, hi, width, fontSize, today, med, animate, delay = 0 }) {
  const W = width, pad = 6, L0 = Math.log10(lo), L1 = Math.log10(hi);
  const x = v => pad + (W - 2 * pad) * (Math.log10(Math.min(hi, Math.max(lo, v))) - L0) / (L1 - L0);
  const r = Math.max(2.5, Math.min(fontSize * 0.34, W / 50)), placed = [];
  for (const p of vs.map(v => ({ x: x(v.v), mine: v.mine })).sort((a, b) => a.x - b.x)) {
    const near = placed.filter(o => Math.abs(o.x - p.x) < 2 * r);
    const cands = [0, ...near.map(o => o.y + Math.sqrt(4 * r * r - (o.x - p.x) ** 2) + 0.3)].sort((a, b) => a - b);
    p.y = Math.min(fontSize * 4, cands.find(y => near.every(o => (o.x - p.x) ** 2 + (o.y - y) ** 2 >= 4 * r * r - 0.5)));
    placed.push(p);
  }
  const top = fontSize * 1.2, axis = top + Math.max(fontSize * 2, ...placed.map(p => p.y + 2 * r)), H = axis + fontSize * 1.3;
  const out = [`<line class="axis" x1="${pad}" x2="${W - pad}" y1="${axis}" y2="${axis}"/>`];
  for (let e = Math.ceil(L0); e <= Math.floor(L1); e++) out.push(`<text class="tick-label" x="${x(10 ** e)}" y="${axis + fontSize}" text-anchor="${e === Math.ceil(L0) ? 'start' : e === Math.floor(L1) ? 'end' : 'middle'}" font-size="${fontSize * 0.75}">${fmt(10 ** e)}</text>`);
  out.push(`<line class="baseline" x1="${x(today)}" x2="${x(today)}" y1="${top - 4}" y2="${axis}"/><text class="baseline-label" x="${x(today)}" y="${top - 6}" text-anchor="middle" font-size="${fontSize * 0.75}">today</text>`);
  const d = ms => animate ? `animation-delay:${ms}ms` : '';
  placed.forEach((p, j) => out.push(`<circle class="vote${p.mine ? ' mine' : ''}" cx="${p.x}" cy="${axis - r - 1 - p.y}" r="${p.mine ? r * 1.4 : r}" style="${d(delay + Math.min(j * 10, 400))}"/>`));
  out.push(`<line class="median" x1="${x(med)}" x2="${x(med)}" y1="${top}" y2="${axis}" style="${d(delay + 500)}"/>`);
  return `<div class="chart"><svg class="${animate ? '' : 'still'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${out.join('')}</svg></div>`;
}
// Greedy change-making: 22 → [10, 10, 1, 1], largest first (bottom of the pile).
function makeChange(v, bills) {
  const out = [];
  for (const b of [...bills].sort((a, b) => b - a)) while (v >= b) { out.push(b); v -= b; }
  return out;
}
function billHTML(d, q, inPile = false) {
  const denoms = [...q.bills].sort((a, b) => a - b), tier = denoms.indexOf(d) + (denoms[0] < 1 ? 0 : 1);
  if (d < 1) return `<div class="bill coin" data-v="${d}"><span>${d}%</span></div>`;
  const w = inPile ? `style="width:${62 + 38 * (tier - 1) / 3}%"` : '';
  return `<div class="bill t${tier}" data-v="${d}" ${w}><i>$</i><span>${d}%</span></div>`;
}
// "About the game" panel: an animated Othello board (black plays b4 and flips three white discs) + facts.
function othelloSVG() {
  const S = 22, B = 'b', W = 'w';
  const pos = {   // [row, col] → colour; row 3 holds the demo line
    '2,2': W, '2,3': B, '2,4': W, '3,2': W, '3,3': W, '3,4': W, '3,5': B,
    '4,2': B, '4,3': B, '4,4': W, '4,5': W, '5,3': W, '5,4': B, '0,0': B, '1,1': W,
  };
  const out = [`<rect width="${8 * S}" height="${8 * S}" rx="6" class="ob-board"/>`];
  for (let i = 1; i < 8; i++) out.push(`<line x1="${i * S}" x2="${i * S}" y1="0" y2="${8 * S}" class="ob-grid"/><line y1="${i * S}" y2="${i * S}" x1="0" x2="${8 * S}" class="ob-grid"/>`);
  for (const [c, r] of [[0, 0], [7, 0], [0, 7], [7, 7]]) out.push(`<rect x="${c * S + 1}" y="${r * S + 1}" width="${S - 2}" height="${S - 2}" class="ob-corner"/>`);
  for (const [k, col] of Object.entries(pos)) {
    const [r, c] = k.split(',').map(Number), flip = r === 3 && c >= 2 && c <= 4;
    out.push(`<circle cx="${c * S + S / 2}" cy="${r * S + S / 2}" r="${S * 0.38}" class="ob-${col}${flip ? ' ob-flip' : ''}" ${flip ? `style="animation-delay:${(c - 2) * 0.12}s"` : ''}/>`);
  }
  out.push(`<circle cx="${1 * S + S / 2}" cy="${3 * S + S / 2}" r="${S * 0.38}" class="ob-b ob-place"/>`);
  return `<svg class="ob" viewBox="-2 -2 ${8 * S + 4} ${8 * S + 4}" role="img" aria-label="Othello board: black plays and flips three white discs">${out.join('')}</svg>`;
}
const aboutHTML = q => q.about ? `<div class="about"><div class="about-head">${esc(q.about.title)}</div><div class="about-body">${othelloSVG()}<ul>${q.about.facts.map(f => `<li>${f}</li>`).join('')}</ul></div></div>` : '';
// A worked example rendered as a mini chain-of-thought transcript, with headline stats.
const exampleHTML = ex => !ex ? '' : `<div class="cot-ex"><div class="cx-head">${esc(ex.title)}</div>
  <div class="cx-msg user"><b>Prompt</b>${esc(ex.prompt)}</div>
  <div class="cx-msg think"><b>Chain of thought</b><i>${esc(ex.cot)}</i></div>
  <div class="cx-msg ans"><b>Answer</b>${esc(ex.answer)}</div>
  <div class="cx-stats">${ex.stats.map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
  <div class="cx-src">${esc(ex.source)}</div></div>`;
// Presenter-only aside, e.g. the Anthropic staff-survey figure.
const calloutHTML = q => q.callout ? `<div class="callout"><div class="c-head">${esc(q.callout.head)}</div><div class="c-main">${q.callout.main}</div><div class="c-sub">${esc(q.callout.sub)}</div></div>` : '';
// "For scale" bars: historical peaks (and, on reveal, the room's medians) on a shared linear axis.
function refBars(q, extra = []) {
  if (!q.references) return '';
  const rows = [...q.references.map(r => ({ ...r })), ...extra.map(e => ({ ...e, room: true }))].sort((a, b) => b.value - a.value);
  const max = Math.max(...rows.map(r => r.value));
  return `<div class="refs"><div class="refs-head">${extra.length ? 'Room medians vs. history' : 'For scale: biggest things in US history'} <span class="muted">(peak share of GDP)</span></div>${rows.map(r => `
    <div class="ref-row${r.room ? ' room' : ''}${r.now ? ' now' : ''}"><span class="ref-name">${r.room ? 'AI in ' : ''}${esc(r.label)}</span>
      <span class="ref-bar"><i style="width:${Math.max(0.6, 100 * r.value / max)}%"></i></span><b>${fmtPct(r.value)}</b></div>`).join('')}</div>`;
}

// ---------- shared state ----------
let state = null;     // { q, phase: 'question' | 'reveal' }
let answers = {};     // answers for current question: { cid: value }
let unsubAnswers = null, answersFor = null;

function watchAnswers(qid) {
  if (answersFor === qid) return;
  unsubAnswers?.(); answers = {}; answersFor = qid;
  if (qid) unsubAnswers = onValue(ref(db, `${base}/answers/${qid}`), s => { answers = s.val() || {}; onAnswers(); });
}
const votes = () => { const T = TYPES[QS[state?.q]?.type]; return Object.entries(answers).map(([id, value]) => ({ id, value })).filter(v => T?.valid(v.value)); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const contextHTML = (q, T) => T.context ? T.context(q) : esc(q.context || '');
const chartWidth = el => Math.round(el.clientWidth || 600);
let animatedKey = null;
function firstDraw(withStep = true) { const k = `${state.q}:${state.phase}:${withStep ? state.step || 0 : ''}`; const first = animatedKey !== k; animatedKey = k; return first; }

// ---------- participant ----------
let pRenderedKey = null, myValue = null;

function renderParticipant() {
  const q = QS[state?.q];
  if (!q) { pRenderedKey = 'wait'; app.innerHTML = `<div class="waiting"><div><h2>You’re in 👋</h2><p class="muted">Waiting for the presenter to start…</p></div></div>`; return; }
  const key = `${state.q}:${state.phase}`;
  if (key === pRenderedKey) return onAnswers();
  pRenderedKey = key;
  const T = TYPES[q.type];
  const top = `<div class="p-top"><span>Question ${state.q + 1} of ${QS.length}</span><span>${state.phase === 'reveal' ? 'Results' : 'Answer'}</span></div>`;

  if (state.phase === 'question') {
    app.innerHTML = `<div class="p-wrap">${top}
      <h1 class="p-title">${esc(q.title)}</h1>
      <div class="context">${contextHTML(q, T)}</div>${aboutHTML(q)}
      <div class="chart" id="chart"></div>
      <div class="card"><div id="input"></div>
        <button class="btn full" id="submit">Submit</button>
        <div class="status" id="status"></div></div>
      ${q.footnote ? `<div class="footnote">${esc(q.footnote)}</div>` : ''}</div>`;
    const chartEl = document.getElementById('chart'), status = document.getElementById('status');
    const draw = () => { if (T.guessChart) chartEl.innerHTML = T.chart(q, { width: chartWidth(chartEl), fontSize: 12, guess: myValue }); };
    const saved = answers[cid];
    let submitted = saved;
    T.input(document.getElementById('input'), q, saved, v => {
      myValue = v; draw();
      status.className = 'status' + (same(submitted, v) ? ' ok' : '');
      status.textContent = submitted == null ? '' : same(submitted, v) ? 'Locked in ✓ (you can change it until the reveal)' : 'Not submitted yet';
    });
    document.getElementById('submit').onclick = async () => {
      await set(ref(db, `${base}/answers/${q.id}/${cid}`), myValue);
      submitted = myValue; status.className = 'status ok'; status.textContent = 'Locked in ✓ (you can change it until the reveal)';
    };
    window.onresize = draw;
  } else {
    app.innerHTML = `<div class="p-wrap">${top}
      <h1 class="p-title">${esc(q.title)}</h1>
      <div class="chart" id="chart" style="margin-top:16px"></div>
      <div class="yours" id="yours"></div></div>`;
    window.onresize = onAnswers;
    onAnswers();
  }
}

function onAnswersParticipant() {
  const q = QS[state?.q];
  if (!q || state.phase !== 'reveal') return;
  const chartEl = document.getElementById('chart'); if (!chartEl) return;
  const vs = votes(), T = TYPES[q.type];
  const animate = firstDraw(false);   // phones ignore the presenter's reveal steps
  chartEl.innerHTML = vs.length ? T.chart(q, { width: chartWidth(chartEl), fontSize: 12, votes: vs, mine: cid, animate }) : '<p class="muted center">No answers yet.</p>';
  if (vs.length) T.mounted?.(chartEl, { animate });
  document.getElementById('yours').innerHTML = answers[cid] != null && vs.length ? T.yours(q, answers[cid], vs) : '<span class="muted">You didn’t answer this one.</span>';
}

// ---------- host ----------
function setState(s) { return set(ref(db, `${base}/state`), s); }
function go(i) { setState({ q: Math.max(-1, Math.min(QS.length - 1, i)), phase: 'question' }); }
// ←/→ walk through a type's reveal steps (if it has any) before moving between questions.
function advance(d) {
  const q = QS[state?.q], T = TYPES[q?.type];
  if (q && state.phase === 'reveal' && T.steps) {
    const s = (state.step || 0) + d;
    if (s >= 0 && s < T.steps(q, votes())) return setState({ ...state, step: s });
  }
  go((state?.q ?? -1) + d);
}

function renderHost() {
  const qi = state?.q ?? -1, q = QS[qi], phase = state?.phase || 'question';
  const controls = `<div class="controls">
      <button class="btn ghost" id="prev">◀ Prev</button>
      <button class="btn" id="reveal">${phase === 'reveal' ? 'Hide results' : 'Reveal'} (space)</button>
      <button class="btn ghost" id="next">Next ▶</button>
      <span class="sep"></span>
      <button class="btn ghost" id="fake">+20 fake answers</button>
      <button class="btn ghost" id="clear">Clear answers</button>
      <button class="btn ghost" id="reset">Reset room</button>
      <span class="room">room: ${esc(ROOM)}</span></div>`;

  if (!q) {
    app.innerHTML = `<div class="h-wrap"><div class="h-lobby"><div>
      <h1>Grab your phone 📱</h1><p class="muted" style="font-size:20px">Scan to join the poll</p>
      <div class="qr" id="qr"></div><div class="url">${esc(prettyJoin)}</div>
      <p class="h-count" id="count"></p></div></div>${controls}</div>`;
    qr(document.getElementById('qr'), 300);
  } else {
    app.innerHTML = `<div class="h-wrap">
      <div class="h-top"><div><div class="h-qnum">Question ${qi + 1} / ${QS.length}</div><h1 class="h-title">${esc(q.title)}</h1></div>
        <div class="h-join"><div><b>${esc(prettyJoin)}</b>scan to join</div><div class="qr" id="qr"></div></div></div>
      <div class="h-stage"><div class="context"><div>${phase === 'reveal' ? 'What the room thinks' : contextHTML(q, TYPES[q.type])}</div>${phase === 'question' ? calloutHTML(q) : ''}</div>
        <div class="stage-row"><div class="chart" id="chart"></div>${phase === 'question' ? aboutHTML(q) : ''}</div><div class="h-count" id="count"></div></div>
      ${q.footnote ? `<div class="h-foot">${esc(q.footnote)}</div>` : ''}${controls}</div>`;
    qr(document.getElementById('qr'), 96);
  }
  document.getElementById('prev').onclick = () => advance(-1);
  document.getElementById('next').onclick = () => advance(1);
  document.getElementById('reveal').onclick = toggleReveal;
  document.getElementById('fake').onclick = addFake;
  document.getElementById('clear').onclick = clearAnswers;
  document.getElementById('reset').onclick = resetRoom;
  window.onresize = onAnswers;
  onAnswers();
}

function onAnswersHost() {
  const q = QS[state?.q], count = document.getElementById('count');
  if (!q) { if (count) count.innerHTML = `<b>${presentCount}</b> joined`; return; }
  const vs = votes(), chartEl = document.getElementById('chart');
  count.innerHTML = `<b>${vs.length}</b> response${vs.length === 1 ? '' : 's'}${state.phase === 'question' ? ' · results hidden until reveal' : ''}`;
  const T = TYPES[q.type], animate = state.phase === 'reveal' && vs.length ? firstDraw() : true;
  chartEl.innerHTML = T.chart(q, { width: chartWidth(chartEl), fontSize: 16, votes: state.phase === 'reveal' ? vs : null, side: true, animate, step: state.step || 0 });
  T.mounted?.(chartEl, { animate });   // for animations that need measured layout
}

function toggleReveal() { if (QS[state?.q]) setState({ q: state.q, phase: state.phase === 'reveal' ? 'question' : 'reveal', step: 0 }); }
function addFake() {
  const q = QS[state?.q]; if (!q) return;
  const upd = {}; for (let i = 0; i < 20; i++) upd[`fake-${Math.random().toString(36).slice(2, 9)}`] = TYPES[q.type].fake(q);
  update(ref(db, `${base}/answers/${q.id}`), upd);
}
// Wipe every answer in this room and send everyone back to the join screen.
function resetRoom() {
  if (confirm(`Reset room “${ROOM}”? This deletes ALL answers for every question and returns to the join screen.`))
    update(ref(db, base), { answers: null, state: { q: -1, phase: 'question' } });
}
function clearAnswers() {
  const q = QS[state?.q];
  if (q && confirm(`Delete all answers for “${q.title}” in room “${ROOM}”?`)) remove(ref(db, `${base}/answers/${q.id}`));
}

// ---------- wiring ----------
let presentCount = 0;
const onAnswers = () => (IS_HOST ? onAnswersHost : onAnswersParticipant)();

if (IS_HOST) {
  document.title = 'Lab Poll · Presenter';
  onValue(ref(db, `${base}/present`), s => { presentCount = Object.keys(s.val() || {}).length; if (!QS[state?.q]) onAnswers(); });
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') advance(1);
    else if (e.key === 'ArrowLeft') advance(-1);
    else if (e.key === ' ') { e.preventDefault(); toggleReveal(); }
  });
} else {
  const me = ref(db, `${base}/present/${cid}`);
  onValue(ref(db, '.info/connected'), s => { if (s.val()) { onDisconnect(me).remove(); set(me, true); } });
}

onValue(ref(db, `${base}/state`), s => {
  state = s.val() || { q: -1, phase: 'question' };
  if (state.phase !== 'reveal') animatedKey = null;
  const q = QS[state.q];
  watchAnswers(q?.id);
  IS_HOST ? renderHost() : renderParticipant();
});
