// Сборка исходников справки WinHelp (ЛР3) из тех же тем, что и HTML-справка программы.
// Результат — папка winhelp/: KRASNY.RTF (темы), KRASNY.HPJ (проект), KRASNY.CNT (содержание).
// Картинки *.bmp готовит tools/make-bmp.ps1. Компиляция: Microsoft Help Workshop → File|Open KRASNY.HPJ → Save and Compile.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HELP_GROUPS, TOPICS, CONTEXT_HELP } from '../app/src/help.js';
import { BMP_NAMES } from './bmp-names.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'winhelp');
mkdirSync(out, { recursive: true });


// Кодировка Windows-1251: строим обратную таблицу из TextDecoder
const CP1251 = new Map();
const dec = new TextDecoder('windows-1251');
for (let b = 0x80; b <= 0xff; b++) CP1251.set(dec.decode(new Uint8Array([b])), b);
const toBytes = (s) => Buffer.from([...s].map((ch) => (ch.charCodeAt(0) < 0x80 ? ch.charCodeAt(0) : CP1251.get(ch) ?? 0x3f)));

// Экранирование текста для RTF: спецсимволы и кириллица через \'xx
// Символы, которых нет в Windows-1251, заменяем текстом
const NOT_IN_1251 = { '↑': 'Up', '↓': 'Down', '→': '->', '₽': 'руб.', '×': 'x', ' ': ' ' };
function esc(s) {
  let r = '';
  for (const ch of [...s].map((c) => NOT_IN_1251[c] ?? c).join('')) {
    if (ch === '\\' || ch === '{' || ch === '}') r += '\\' + ch;
    else if (ch.charCodeAt(0) < 0x80) r += ch;
    else if (CP1251.has(ch)) r += `\\'${CP1251.get(ch).toString(16)}`;
    else r += '?';
  }
  return r;
}

// Внутренняя разметка тем → RTF-коды WinHelp
const TOKEN = /(\[\[[^\]]+\]\]|\{\{[^}]+\}\}|<<[^>]+>>|\*\*[^*]+\*\*)/g;
function inline(text) {
  return text.split(TOKEN).map((part) => {
    if (part.startsWith('[[')) { const [id, label] = part.slice(2, -2).split('|'); return `{\\uldb ${esc(label)}}{\\v ${id}}`; }
    if (part.startsWith('{{')) { const [id, label] = part.slice(2, -2).split('|'); return `{\\ul ${esc(label)}}{\\v ${id}}`; }
    if (part.startsWith('<<')) { const [kws, label] = part.slice(2, -2).split('|'); return `{\\uldb ${esc(label)}}{\\v ${esc(`!KLink("${kws}", JUMP)`)}}`; }
    if (part.startsWith('**')) return `{\\b ${esc(part.slice(2, -2))}}`;
    return esc(part);
  }).join('');
}

const P = '\\pard\\plain\\f0\\fs20\\sa120 ';
const footnote = (mark, text) => `{\\up ${mark}}{\\footnote\\pard\\plain\\fs20 {\\up ${mark}} ${text}}`;

function topicRtf(t) {
  let r = '';
  r += footnote('#', t.id) + '\n';
  r += footnote('$', esc(t.title)) + '\n';
  if (t.keywords?.length) r += footnote('K', esc(t.keywords.join(';'))) + '\n';
  if (t.alinks?.length) r += footnote('A', esc(t.alinks.join(';'))) + '\n';
  if (t.browse) r += footnote('+', t.browse) + '\n';
  if (!t.popup) r += footnote('>', 'main') + '\n';
  // Заголовок — в непрокручиваемой области (Не отрывать от следующего = \keepn)
  r += t.popup
    ? `\\pard\\plain\\f0\\fs20\\sa80{\\b ${esc(t.title)}}\\par\n`
    : `\\pard\\plain\\keepn\\f0\\fs28\\sb80\\sa160\\cf2{\\b ${esc(t.title)}}\\par\n`;
  for (const b of t.body) {
    if (b.img) r += `${P}\\{bmc ${BMP_NAMES[b.img]}\\}\\par\n`;
    else if (b.h) r += `\\pard\\plain\\f0\\fs22\\sb120\\sa80{\\b ${esc(b.h)}}\\par\n`;
    else if (b.p) r += `${P}${inline(b.p)}\\par\n`;
    else if (b.ul || b.ol) (b.ul ?? b.ol).forEach((li, i) => {
      r += `\\pard\\plain\\f0\\fs20\\fi-280\\li400\\sa60\\tx400 ${b.ul ? '\\bullet' : `${i + 1}.`}\\tab ${inline(li)}\\par\n`;
    });
    else if (b.keys) b.keys.forEach(([k, v]) => { r += `\\pard\\plain\\f0\\fs20\\li200\\sa40\\tx2600 {\\b ${esc(k)}}\\tab ${esc(v)}\\par\n`; });
    else if (b.alink) r += `${P}\\{button ${esc(b.alink.label)},ALink(${esc(`"${b.alink.key}"`)}, JUMP)\\} ${esc('См. также')}\\par\n`;
  }
  return r;
}

// ---------- KRASNY.RTF ----------
const ordered = [TOPICS.find((t) => t.id === 'IDH_CONTENTS'), ...TOPICS.filter((t) => t.id !== 'IDH_CONTENTS')];
let rtf = '{\\rtf1\\ansi\\ansicpg1251\\deff0\n';
rtf += '{\\fonttbl{\\f0\\fswiss\\fcharset204 Arial;}{\\f1\\fmodern\\fcharset204 Courier New;}}\n';
rtf += '{\\colortbl;\\red0\\green0\\blue0;\\red168\\green20\\blue20;}\n';
rtf += ordered.map(topicRtf).join('\\page\n');
rtf += '}\n';
writeFileSync(join(out, 'KRASNY.RTF'), toBytes(rtf));

// ---------- KRASNY.HPJ ----------
const CONTEXT_IDS = Object.entries(CONTEXT_HELP).map(([, id], i) => [id, 1001 + i]);
const hpj = `; Проект справки «Красный фонарь — Касса» для Microsoft Help Workshop (HCW/HCRTF)
[OPTIONS]
LCID=0x419 0x0 0x0 ; Русский
REPORT=Yes
CONTENTS=IDH_CONTENTS
TITLE=Справка — Красный фонарь
COPYRIGHT=Учебный проект, 2026
HLP=.\\KRASNY.HLP
CNT=.\\KRASNY.CNT
BMROOT=.\\IMG
ERRORLOG=.\\KRASNY.LOG

[FILES]
KRASNY.RTF

[WINDOWS]
main="Справка — Красный фонарь",(120,60,760,900),60676,(r16777215),(r15790335),f2

[MAP]
${CONTEXT_IDS.map(([id, n]) => `${id}\t${n}`).join('\n')}

[CONFIG]
BrowseButtons()
`;
writeFileSync(join(out, 'KRASNY.HPJ'), toBytes(hpj.replace(/\n/g, '\r\n')));

// ---------- KRASNY.CNT ----------
let cnt = ':Base KRASNY.HLP>main\n:Title Справка — Красный фонарь\n:Index Справка — Красный фонарь=KRASNY.HLP\n';
cnt += '1 Содержание=IDH_CONTENTS\n';
for (const g of HELP_GROUPS) {
  const ts = TOPICS.filter((t) => t.group === g.key);
  cnt += `1 ${g.title}\n`;
  for (const t of ts) cnt += `2 ${t.title}=${t.id}\n`;
}
writeFileSync(join(out, 'KRASNY.CNT'), toBytes(cnt.replace(/\n/g, '\r\n')));

// Таблица контекстных идентификаторов для программы и отчёта
writeFileSync(join(out, 'context-ids.json'), JSON.stringify(Object.fromEntries(CONTEXT_IDS), null, 2));
console.log(`Темы: ${TOPICS.length}, байт RTF: ${rtf.length}`);
