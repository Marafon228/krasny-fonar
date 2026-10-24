// Снимки экранов прототипа для отчётов и справки.
// Запуск: node tools/shots.mjs (dev-сервер должен работать на http://localhost:5173)
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'shots');
const helpDir = join(root, 'app', 'public', 'help');
mkdirSync(out, { recursive: true });
mkdirSync(helpDir, { recursive: true });

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5173/';

const SHOTS = [
  // экранные формы (ЛР2) — они же картинки справки (ЛР3)
  ['shot_orders', ''],
  ['shot_order', 'screen=order'],
  ['shot_guests', 'screen=guests&origin=order'],
  ['shot_guest', 'screen=guest'],
  ['shot_dishes', 'screen=dishes&origin=order'],
  ['shot_dish', 'screen=dish'],
  ['shot_kitchen', 'screen=kitchen'],
  ['shot_pay', 'screen=order&modal=pay'],
  ['shot_print', 'screen=order&modal=print'],
  // состояния меню (ЛР1): раздел «Действия» с номерами операций
  ['menu_M1', 'ops=1&menu=actions'],
  ['menu_M2', 'screen=order&ops=1&menu=actions'],
  ['menu_M3', 'screen=guests&origin=orders&ops=1&menu=actions'],
  ['menu_M4', 'screen=guests&origin=order&ops=1&menu=actions'],
  ['menu_M5', 'screen=guest&ops=1&menu=actions'],
  ['menu_M6', 'screen=dishes&origin=orders&ops=1&menu=actions'],
  ['menu_M7', 'screen=dishes&origin=order&ops=1&menu=actions'],
  ['menu_M8', 'screen=dish&ops=1&menu=actions'],
  ['menu_M9', 'screen=kitchen&ops=1&menu=actions'],
  ['menu_lists_M1', 'ops=1&menu=lists'],
  ['menu_lists_M2', 'screen=order&ops=1&menu=lists'],
  ['menu_search_M1', 'ops=1&menu=search'],
  ['menu_file', 'menu=file'],
  ['menu_help', 'menu=help'],
  // справка (ЛР3)
  ['help_contents', 'help=IDH_CONTENTS'],
  ['help_topic', 'screen=order&help=IDH_HOW_NEW_ORDER'],
  ['help_form', 'help=IDH_FORM_ORDER'],
];

const only = process.argv.slice(2);
for (const [name, query] of SHOTS) {
  if (only.length && !only.includes(name)) continue;
  const file = join(out, `${name}.png`);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1440,900', '--virtual-time-budget=5000', `--screenshot=${file}`, BASE + (query ? `?${query}` : ''),
  ], { stdio: 'ignore' });
  if (name.startsWith('shot_')) copyFileSync(file, join(helpDir, `${name}.png`));
  console.log('✓', name);
}
