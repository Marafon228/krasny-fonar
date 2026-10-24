// Картинки для WinHelp (ЛР3): пиктограммы и уменьшенные снимки экранов в формате BMP.
// Пиктограммы рисуются из иконок Tabler через headless Chrome, перевод в BMP — средствами .NET (System.Drawing).
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BMP_NAMES } from './bmp-names.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const img = join(root, 'winhelp', 'IMG');
const tmp = join(root, 'shots', '_icons');
mkdirSync(img, { recursive: true });
mkdirSync(tmp, { recursive: true });
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function svgOf(name, color) {
  const mod = await import(pathToFileURL(join(root, 'app/node_modules/@tabler/icons-react/dist/esm/icons', `${name}.mjs`)).href);
  const inner = mod.__iconNode.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const ICONS = [
  ['logo', 'IconLamp', '#7a0e0e', 'radial-gradient(circle at 50% 45%, #ffe066 0%, #ffa94d 45%, #e03131 100%)', '50%'],
  ['icon_pay', 'IconCash', '#c92a2a', '#ffe3e3', '12px'],
  ['icon_print', 'IconPrinter', '#c92a2a', '#ffe3e3', '12px'],
  ['icon_kitchen', 'IconChefHat', '#c92a2a', '#ffe3e3', '12px'],
];

const jobs = [];
for (const [key, icon, color, bg, radius] of ICONS) {
  const html = `<!doctype html><html><body style="margin:0;background:#fff">
    <div style="width:64px;height:64px;border-radius:${radius};background:${bg};display:flex;align-items:center;justify-content:center">${await svgOf(icon, color)}</div></body></html>`;
  const htmlFile = join(tmp, `${key}.html`);
  const png = join(tmp, `${key}.png`);
  writeFileSync(htmlFile, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=400,200', `--screenshot=${png}`, pathToFileURL(htmlFile).href], { stdio: 'ignore' });
  jobs.push({ src: png, dst: join(img, BMP_NAMES[key]), crop: [0, 0, 64, 64] });
}
for (const [key, file] of Object.entries(BMP_NAMES)) {
  if (key.startsWith('shot_')) jobs.push({ src: join(root, 'shots', `${key}.png`), dst: join(img, file), width: 560 });
}

// PowerShell + System.Drawing: обрезка/масштабирование и сохранение в 24-битный BMP
const ps = `Add-Type -AssemblyName System.Drawing
$jobs = '${JSON.stringify(jobs).replace(/'/g, "''")}' | ConvertFrom-Json
foreach ($j in $jobs) {
  $src = [System.Drawing.Image]::FromFile($j.src)
  if ($j.crop) { $w = $j.crop[2]; $h = $j.crop[3]; $rect = New-Object System.Drawing.Rectangle($j.crop[0], $j.crop[1], $w, $h) }
  else { $w = $j.width; $h = [int]($src.Height * $j.width / $src.Width); $rect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, $src.Height) }
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save($j.dst, [System.Drawing.Imaging.ImageFormat]::Bmp)
  $g.Dispose(); $bmp.Dispose(); $src.Dispose()
  Write-Output ("OK " + $j.dst)
}`;
const psFile = join(tmp, 'convert.ps1');
writeFileSync(psFile, '\ufeff' + ps);
console.log(execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psFile], { encoding: 'utf8' }));
