// Схема навигации (рис. 1 ЛР1), граф состояний меню (рис. 2 ЛР1) и карта справочной системы (ЛР3).
// SVG собираются из spec.js / help.js и переводятся в PNG через headless Chrome.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { STATES, TRANSITIONS } from '../app/src/spec.js';
import { HELP_GROUPS, TOPICS } from '../app/src/help.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'shots');
mkdirSync(out, { recursive: true });
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FONT = 'Segoe UI, Arial, sans-serif';
const x = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function box(n) {
  const lines = n.lines.map((t, i) => `<text x="${n.x + n.w / 2}" y="${n.y + 26 + i * 19}" text-anchor="middle" font-size="${i === 0 ? 17 : 13}" font-weight="${i === 0 ? 700 : 400}" fill="${i === 0 ? '#1a1a1a' : '#555'}">${x(t)}</text>`).join('');
  return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="${n.fill ?? '#fff'}" stroke="${n.stroke ?? '#c92a2a'}" stroke-width="2"/>${lines}`;
}

// Точка на границе прямоугольника по направлению к (tx, ty)
function edgePoint(n, tx, ty) {
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2, dx = tx - cx, dy = ty - cy;
  const s = Math.min(Math.abs((n.w / 2 + 4) / (dx || 1e-9)), Math.abs((n.h / 2 + 4) / (dy || 1e-9)));
  return [cx + dx * s, cy + dy * s];
}

function arrow(a, b, label, offset = 0, color = '#333') {
  const ac = [a.x + a.w / 2, a.y + a.h / 2], bc = [b.x + b.w / 2, b.y + b.h / 2];
  const len = Math.hypot(bc[0] - ac[0], bc[1] - ac[1]);
  const nx = -(bc[1] - ac[1]) / len * offset, ny = (bc[0] - ac[0]) / len * offset;
  const p1 = edgePoint(a, bc[0] + nx, bc[1] + ny), p2 = edgePoint(b, ac[0] + nx, ac[1] + ny);
  const [x1, y1, x2, y2] = [p1[0] + nx, p1[1] + ny, p2[0] + nx, p2[1] + ny];
  const mx = (x1 + x2) / 2 + nx * 1.6, my = (y1 + y2) / 2 + ny * 1.6;
  const w = 10 + label.length * 8;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.8" marker-end="url(#ah)"/>`
    + `<rect x="${mx - w / 2}" y="${my - 11}" width="${w}" height="22" rx="11" fill="#fff4e6" stroke="#f08c00"/>`
    + `<text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#a34700">${x(label)}</text>`;
}

const svgWrap = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}">
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#333"/></marker></defs>
<rect width="100%" height="100%" fill="#fff"/>${title ? `<text x="20" y="30" font-size="15" fill="#666">${x(title)}</text>` : ''}${body}</svg>`;

function render(name, svg, w, h) {
  const svgFile = join(out, `${name}.svg`);
  const htmlFile = join(out, `_${name}.html`);
  writeFileSync(svgFile, svg);
  writeFileSync(htmlFile, `<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', `--window-size=${w},${h}`, `--screenshot=${join(out, `${name}.png`)}`, pathToFileURL(htmlFile).href], { stdio: 'ignore' });
  console.log('✓', name);
}

// ---------- Рис. 1. Схема навигации ----------
{
  const W = 1200, H = 760, bw = 230, bh = 84;
  const N = {
    kitchen: { x: 60, y: 70, w: bw, h: bh, lines: ['Экран кухни', 'внутри: 25'] },
    orders: { x: 485, y: 70, w: bw, h: bh, lines: ['Журнал заказов', 'внутри: 2, 3'] },
    guests: { x: 60, y: 330, w: bw, h: bh, lines: ['Список гостей', 'внутри: 8'] },
    order: { x: 485, y: 390, w: bw, h: bh, lines: ['Текущий заказ', 'внутри: 19, 20, 21, 22, 23'] },
    dishes: { x: 910, y: 330, w: bw, h: bh, lines: ['Меню ресторана', 'внутри: 15'] },
    guest: { x: 60, y: 600, w: bw, h: bh, lines: ['Карточка гостя'] },
    dish: { x: 910, y: 600, w: bw, h: bh, lines: ['Карточка блюда'] },
  };
  const blocks = [
    ['Блок «Гости»', 40, 310, 270, 400, '#e7f5ff'],
    ['Блок «Заказы»', 465, 50, 270, 450, '#fff5f5'],
    ['Блок «Меню ресторана»', 890, 310, 270, 400, '#ebfbee'],
    ['Блок «Кухня»', 40, 50, 270, 130, '#fff9db'],
  ].map(([t, bx, by, w, h, f]) => `<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="16" fill="${f}" stroke="#adb5bd" stroke-dasharray="6 5"/><text x="${bx + 12}" y="${by + h - 12}" font-size="13" fill="#495057" font-style="italic">${t}</text>`).join('');
  const E = [
    ['orders', 'order', '1, 4', 10], ['order', 'orders', '26', 10],
    ['orders', 'guests', '7', 10], ['guests', 'orders', '9', 10],
    ['orders', 'dishes', '14', 10], ['dishes', 'orders', '17', 10],
    ['orders', 'kitchen', '24', 10], ['kitchen', 'orders', '26', 10],
    ['order', 'guests', '5', 10], ['guests', 'order', '12', 10],
    ['order', 'dishes', '6', 10], ['dishes', 'order', '18', 10],
    ['guests', 'guest', '10, 11', 10], ['guest', 'guests', '13', 10],
    ['dishes', 'dish', '16', 10], ['dish', 'dishes', 'Esc', 10],
    ['order', 'dish', '16', 0],
  ];
  const body = blocks + E.map(([a, b, l, o]) => arrow(N[a], N[b], l, o)).join('') + Object.values(N).map(box).join('');
  render('nav_scheme', svgWrap(W, H, body, 'Цифры на стрелках — номера операций (п. 4.5); «внутри» — операции, выполняемые без перехода'), W, H);
}

// ---------- Рис. 2. Граф состояний меню ----------
{
  const W = 1200, H = 780, bw = 220, bh = 78;
  const pos = { M3: [80, 70], M1: [490, 70], M9: [900, 70], M5: [80, 350], M2: [490, 350], M6: [900, 350], M4: [280, 620], M7: [700, 620], M8: [900, 470] };
  pos.M8 = [960, 620]; pos.M7 = [620, 620]; pos.M4 = [240, 620];
  const short = { M1: 'Журнал заказов', M2: 'Текущий заказ', M3: 'Список гостей (7)', M4: 'Список гостей (5)', M5: 'Карточка гостя', M6: 'Меню ресторана (14)', M7: 'Меню ресторана (6)', M8: 'Карточка блюда', M9: 'Экран кухни' };
  const N = Object.fromEntries(Object.keys(STATES).map((k) => [k, { x: pos[k][0], y: pos[k][1], w: bw, h: bh, lines: [k.replace('M', 'М'), short[k]], fill: '#fff' }]));
  // объединяем переходы с одинаковыми концами
  const merged = new Map();
  for (const [a, b, op] of TRANSITIONS) { const k = `${a}>${b}`; merged.set(k, [...(merged.get(k) ?? []), op]); }
  const body = [...merged.entries()].map(([k, ops]) => { const [a, b] = k.split('>'); return arrow(N[a], N[b], ops.join(', '), 11); }).join('')
    + Object.values(N).map(box).join('');
  render('menu_graph', svgWrap(W, H, body, 'Вершины — состояния меню, дуги — операции (команды меню). Из любого состояния М2–М9 команда 26 (F2) ведёт в М1.'), W, H);
}

// ---------- Карта справочной системы (ЛР3) ----------
{
  const W = 1300, H = 820;
  const root0 = { x: 545, y: 50, w: 210, h: 56, lines: ['Содержание', 'IDH_CONTENTS'], fill: '#fff5f5' };
  const cols = HELP_GROUPS.map((g, i) => ({ g, x: 30 + i * 320 }));
  let body = box(root0);
  for (const { g, x: gx } of cols) {
    const gNode = { x: gx, y: 160, w: 290, h: 50, lines: [g.title], fill: '#fff9db', stroke: '#f08c00' };
    body += `<line x1="${root0.x + root0.w / 2}" y1="${root0.y + root0.h}" x2="${gx + 145}" y2="160" stroke="#868e96" stroke-width="1.5" marker-end="url(#ah)"/>` + box(gNode);
    const ts = TOPICS.filter((t) => t.group === g.key);
    ts.forEach((t, i) => {
      const y = 240 + i * 62;
      body += `<line x1="${gx + 14}" y1="${210}" x2="${gx + 14}" y2="${y + 25}" stroke="#ced4da"/><line x1="${gx + 14}" y1="${y + 25}" x2="${gx + 30}" y2="${y + 25}" stroke="#ced4da"/>`;
      body += box({ x: gx + 30, y, w: 260, h: 50, lines: [t.title, t.id] });
    });
    if (g.key === 'glossary') {
      const pops = TOPICS.filter((t) => t.popup);
      body += `<text x="${gx + 30}" y="${330}" font-size="13" fill="#555">Всплывающие окна (12 терминов):</text>`;
      pops.forEach((t, i) => {
        body += `<rect x="${gx + 30}" y="${342 + i * 32}" width="260" height="26" rx="6" fill="#fffbe6" stroke="#fab005" stroke-dasharray="4 3"/><text x="${gx + 40}" y="${360 + i * 32}" font-size="12">${x(t.title)} — ${t.id}</text>`;
      });
    }
  }
  render('help_map', svgWrap(W, H, body, 'Сплошные рамки — темы основного окна, пунктир — всплывающие окна глоссария'), W, H);
}
