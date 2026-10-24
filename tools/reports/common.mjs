// Общие элементы оформления отчётов: титульный лист, заголовки, абзацы, списки, таблицы, рисунки.
// Оформление близко к ГОСТ 7.32: Times New Roman 14 pt, полуторный интервал, абзацный отступ 1,25 см.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, LevelFormat, Packer, PageBreak, PageNumber,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const SHOTS = join(ROOT, 'shots');

// Данные титульного листа — заполните перед сдачей
export const TITLE = {
  university: '[Название университета]',
  department: 'Кафедра [название кафедры]',
  discipline: 'Проектирование человеко-машинного интерфейса',
  students: '[ФИО студентов подгруппы]',
  group: '[номер группы]',
  teacher: '[ФИО преподавателя]',
  city: '[Город]',
  year: '2026',
};

const FONT = 'Times New Roman';
const SIZE = 28; // 14 pt
const CONTENT_DXA = 9354; // A4 минус поля 30 и 15 мм

const counters = { fig: 0, tab: 0, list: 0 };
export const resetCounters = () => { counters.fig = 0; counters.tab = 0; counters.list = 0; };

// **полужирный**, __курсив__, `моноширинный`
export function runs(text, base = {}) {
  return String(text).split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/).filter(Boolean).map((t) => {
    if (t.startsWith('**')) return new TextRun({ ...base, text: t.slice(2, -2), bold: true });
    if (t.startsWith('__')) return new TextRun({ ...base, text: t.slice(2, -2), italics: true });
    if (t.startsWith('`')) return new TextRun({ ...base, text: t.slice(1, -1), font: 'Courier New', size: (base.size ?? SIZE) - 4 });
    return new TextRun({ ...base, text: t });
  });
}

export const p = (text, opts = {}) => new Paragraph({
  children: Array.isArray(text) ? text : runs(text, opts.run),
  alignment: opts.align ?? AlignmentType.JUSTIFIED,
  indent: opts.noIndent ? undefined : { firstLine: 709 },
  spacing: { line: 360, after: opts.after ?? 0, before: opts.before ?? 0 },
  keepNext: opts.keepNext,
});
export const center = (text, opts = {}) => p(text, { ...opts, align: AlignmentType.CENTER, noIndent: true });

export const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text })], pageBreakBefore: false, keepNext: true });
export const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text })], keepNext: true });
export const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

export function bullets(items) {
  return items.map((t) => new Paragraph({ children: runs(t), numbering: { reference: 'dash', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 } }));
}
export function numbered(items) {
  const instance = ++counters.list;
  return items.map((t) => new Paragraph({ children: runs(t), numbering: { reference: 'num', level: 0, instance }, alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 } }));
}

export function code(lines) {
  return lines.map((l) => new Paragraph({
    children: [new TextRun({ text: l || ' ', font: 'Courier New', size: 18 })],
    spacing: { line: 240 }, shading: { type: ShadingType.CLEAR, fill: 'F3F3F3' },
  }));
}

const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const borders = { top: border, bottom: border, left: border, right: border };

// Таблица: headers — строки заголовка, rows — массив строк, widths — доли ширины
export function table(caption, headers, rows, widths, opts = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cols = widths.map((w) => Math.round((w / total) * CONTENT_DXA));
  cols[cols.length - 1] += CONTENT_DXA - cols.reduce((a, b) => a + b, 0);
  const size = opts.size ?? 24;
  const cell = (text, i, head, fill) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA }, borders,
    shading: head ? { type: ShadingType.CLEAR, fill: 'E8E8E8' } : fill ? { type: ShadingType.CLEAR, fill } : undefined,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: String(text).split('\n').map((line) => new Paragraph({
      children: runs(line, { size, bold: head || undefined, color: opts.dim?.(text) ? '9A9A9A' : undefined }),
      alignment: head ? AlignmentType.CENTER : AlignmentType.LEFT,
    })),
  });
  const out = [];
  if (caption) {
    counters.tab += 1;
    out.push(new Paragraph({ children: [new TextRun({ text: `Таблица ${counters.tab} – ${caption}`, font: FONT, size: SIZE })], keepNext: true, spacing: { before: 120, after: 60, line: 360 } }));
  }
  out.push(new Table({
    width: { size: CONTENT_DXA, type: WidthType.DXA }, columnWidths: cols,
    rows: [
      ...(headers ? [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) })] : []),
      ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, opts.fill?.(r, i))) })),
    ],
  }));
  out.push(new Paragraph({ children: [], spacing: { after: 120 } }));
  return out;
}
export const tabNo = () => counters.tab + 1;
export const figNo = () => counters.fig + 1;

function pngSize(file) {
  const b = readFileSync(file);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

// Рисунок с подписью «Рисунок N – …». widthPx — ширина на странице (≤ 620)
export function figure(name, caption, widthPx = 600) {
  const file = join(SHOTS, `${name}.png`);
  const [w, h] = pngSize(file);
  counters.fig += 1;
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120 },
      children: [new ImageRun({ type: 'png', data: readFileSync(file), transformation: { width: widthPx, height: Math.round((h / w) * widthPx) } })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200, line: 360 }, children: [new TextRun({ text: `Рисунок ${counters.fig} – ${caption}`, font: FONT, size: SIZE })] }),
  ];
}

export function titlePage(no, theme) {
  const blank = (n = 1) => Array.from({ length: n }, () => new Paragraph({ children: [] }));
  const c = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, font: FONT, size: o.size ?? SIZE, bold: o.bold })] });
  const r = (t) => new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: t, font: FONT, size: SIZE })] });
  return [
    c('Министерство науки и высшего образования Российской Федерации'),
    c(TITLE.university), c(TITLE.department),
    ...blank(6),
    c('ОТЧЁТ', { bold: true, size: 32 }),
    c(`по лабораторной работе № ${no}`),
    c(`«${theme}»`, { bold: true }),
    c(`по дисциплине «${TITLE.discipline}»`),
    ...blank(2),
    c('Тема проекта: интерфейс АИС ресторана быстрого обслуживания «Красный фонарь»'),
    ...blank(5),
    r(`Выполнили: студенты группы ${TITLE.group}`), r(TITLE.students),
    ...blank(1),
    r(`Проверил: ${TITLE.teacher}`),
    ...blank(6),
    c(`${TITLE.city} ${TITLE.year}`),
    pageBreak(),
  ];
}

export async function save(file, children) {
  const doc = new Document({
    creator: 'Красный фонарь',
    styles: {
      default: { document: { run: { font: FONT, size: SIZE } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 32, bold: true }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0, indent: { firstLine: 709 } } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 28, bold: true }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1, indent: { firstLine: 709 } } },
      ],
    },
    numbering: {
      config: [
        { reference: 'dash', levels: [{ level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1069, hanging: 360 } } } }] },
        { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1)', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1069, hanging: 360 } } } }] },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } }, titlePage: true },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
      children,
    }],
  });
  writeFileSync(file, await Packer.toBuffer(doc));
  console.log('✓', file);
}
