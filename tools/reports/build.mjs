// Сборка всех трёх отчётов: node tools/reports/build.mjs
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, SHOTS } from './common.mjs';
import { lr1 } from './lr1.mjs';
import { lr2 } from './lr2.mjs';
import { lr3 } from './lr3.mjs';

mkdirSync(join(ROOT, 'Отчёты'), { recursive: true });

// Фрагменты снимков с открытым меню (левый верхний угол окна)
const crops = [['menu_M1', 'menu_crop_M1'], ['menu_lists_M2', 'menu_crop_lists_M2'], ['menu_M4', 'menu_crop_M4'], ['menu_M7', 'menu_crop_M7']];
const ps = `Add-Type -AssemblyName System.Drawing
${crops.map(([src, dst]) => `$i = [System.Drawing.Image]::FromFile('${join(SHOTS, src + '.png')}'); $b = New-Object System.Drawing.Bitmap(560, 420); $g = [System.Drawing.Graphics]::FromImage($b); $g.DrawImage($i, (New-Object System.Drawing.Rectangle(0,0,560,420)), (New-Object System.Drawing.Rectangle(0,0,560,420)), [System.Drawing.GraphicsUnit]::Pixel); $b.Save('${join(SHOTS, dst + '.png')}', [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $b.Dispose(); $i.Dispose()`).join('\n')}`;
execFileSync('powershell', ['-NoProfile', '-Command', ps]);

await lr1();
await lr2();
await lr3();
