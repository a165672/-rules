#!/usr/bin/env node
/*
 * 快速预览器（Playwright + Chromium）：直接打开组件的独立预览页，与参考视频同一时刻上下对比。
 * 成片由 Hypit 渲染（见 README）；这里只用于迭代动效时快速看帧。
 *
 * 预览若干时刻（1280×720 PNG，可与参考视频同一时刻并排对比）：
 *   node tools/preview.cjs preview --times 2,4.5,10 --out build/preview/intro [--compare] [--scale 1]
 *   node tools/preview.cjs preview --from 16.5 --to 35.5 --step 1 --out build/preview/ch01 --compare
 *   加 --real：时间按成片（新配乐，130s）计算，经引擎时间映射后出帧
 *
 * 渲染全片帧序列（1920×1080 JPEG），再交给 ffmpeg 合成：
 *   node tools/preview.cjs frames --out build/frames [--from 0 --to 110.2] [--workers 4] [--scale 1.5]
 */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

let pw;
try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }

const ROOT = path.resolve(__dirname, '..'); // hypit-video/
const PAGE = 'file://' + path.join(ROOT, 'packages', 'kinetic-explainer', 'web', 'index.html');
const REF = path.join(ROOT, '..', 'reference', '参考视频.mp4');
const FPS = 30, DURATION = 110.2, REAL_DURATION = 130.0;

function args() {
  const a = process.argv.slice(2);
  const o = { mode: a[0] };
  for (let i = 1; i < a.length; i++) {
    if (a[i].startsWith('--')) {
      const k = a[i].slice(2);
      const v = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
      o[k] = v;
    }
  }
  return o;
}

async function openPage(browser, scale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(PAGE);
  await page.evaluate(() => V.ready);
  if (errors.length) console.error('[page errors]\n' + errors.join('\n'));
  page._errors = errors;
  return page;
}

async function shot(page, t, file, type, real) {
  // real = 成片时间（新配乐）；否则为设计时间（与参考视频同一时刻对比）
  await page.evaluate(([tt, r]) => (r ? window.__renderReal(tt) : window.__render(tt)), [t, !!real]);
  const el = await page.$('#stage');
  if (type === 'jpeg') await el.screenshot({ path: file, type: 'jpeg', quality: 94 });
  else await el.screenshot({ path: file, type: 'png' });
}

async function preview(o) {
  const scale = parseFloat(o.scale || 1);
  let times = [];
  if (o.times) times = String(o.times).split(',').map(Number);
  else {
    const from = parseFloat(o.from || 0), to = parseFloat(o.to || (o.real ? REAL_DURATION : DURATION)), step = parseFloat(o.step || 1);
    for (let t = from; t < to + 1e-6; t += step) times.push(+t.toFixed(3));
  }
  const out = path.resolve(o.out || path.join(ROOT, 'build', 'preview'));
  fs.mkdirSync(out, { recursive: true });
  const browser = await pw.chromium.launch({ args: ['--font-render-hinting=none'] });
  const page = await openPage(browser, scale);
  const files = [];
  for (const t of times) {
    const f = path.join(out, `t_${t.toFixed(2).padStart(6, '0')}.png`);
    await shot(page, t, f, 'png', o.real);
    files.push([t, f]);
    if (o.compare && !o.real && fs.existsSync(REF)) {
      const rf = path.join(out, `ref_${t.toFixed(2).padStart(6, '0')}.png`);
      spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(t), '-i', REF, '-frames:v', '1', rf]);
      const cf = path.join(out, `cmp_${t.toFixed(2).padStart(6, '0')}.png`);
      // 上：我们的画面；下：参考视频同一时刻
      spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', f, '-i', rf, '-filter_complex',
        '[0]scale=960:540[a];[1]scale=960:540[b];[a][b]vstack', cf]);
      fs.unlinkSync(rf);
    }
  }
  await browser.close();
  // contact sheet of our frames
  if (files.length > 1 && files.length <= 48 && !o.nosheet) {
    const list = path.join(out, 'list.txt');
    const cols = Math.min(4, files.length);
    const rows = Math.ceil(files.length / cols);
    const inputs = [];
    files.forEach(([, f]) => inputs.push('-i', f));
    const lab = files.map(([t], i) => `[${i}]scale=480:270,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${t.toFixed(2)}':x=6:y=6:fontsize=16:fontcolor=yellow[v${i}]`).join(';');
    const pad = cols * rows - files.length;
    let chain = lab;
    let ins = files.map((_, i) => `[v${i}]`).join('');
    for (let i = 0; i < pad; i++) { chain += `;color=black:s=480x270:d=1[p${i}]`; ins += `[p${i}]`; }
    const layout = Array.from({ length: cols * rows }, (_, i) => `${(i % cols) * 480}_${Math.floor(i / cols) * 270}`).join('|');
    chain += `;${ins}xstack=inputs=${cols * rows}:layout=${layout}`;
    spawnSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', chain, '-frames:v', '1', path.join(out, 'sheet.jpg')]);
    if (fs.existsSync(list)) fs.unlinkSync(list);
  }
  if (page._errors.length) { console.error('PAGE ERRORS:', page._errors.join('\n')); process.exitCode = 2; }
  console.log(`preview: ${files.length} frames -> ${out}`);
}

async function frames(o) {
  const scale = parseFloat(o.scale || 1.5);
  const out = path.resolve(o.out || path.join(ROOT, 'build', 'frames'));
  fs.mkdirSync(out, { recursive: true });
  const from = Math.round(parseFloat(o.from || 0) * FPS);
  const to = Math.round(parseFloat(o.to || (o.real ? REAL_DURATION : DURATION)) * FPS); // exclusive
  const workers = parseInt(o.workers || 4, 10);
  const idx = [];
  for (let i = from; i < to; i++) {
    const f = path.join(out, `f_${String(i).padStart(5, '0')}.jpg`);
    if (o.resume && fs.existsSync(f) && fs.statSync(f).size > 0) continue;
    idx.push(i);
  }
  const browser = await pw.chromium.launch({ args: ['--font-render-hinting=none'] });
  const t0 = Date.now();
  let done = 0;
  // contiguous chunks per worker
  const chunk = Math.ceil(idx.length / workers);
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const mine = idx.slice(w * chunk, (w + 1) * chunk);
    if (!mine.length) return;
    const page = await openPage(browser, scale);
    for (const i of mine) {
      await shot(page, i / FPS, path.join(out, `f_${String(i).padStart(5, '0')}.jpg`), 'jpeg', o.real);
      done++;
      if (done % 100 === 0) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${done}/${idx.length} frames, ${(done / el).toFixed(1)} fps, eta ${((idx.length - done) / (done / el)).toFixed(0)}s`);
      }
    }
    if (page._errors.length) { console.error('PAGE ERRORS:', page._errors.join('\n')); process.exitCode = 2; }
  }));
  await browser.close();
  console.log(`frames: ${done} rendered -> ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

(async () => {
  const o = args();
  if (o.mode === 'preview') await preview(o);
  else if (o.mode === 'frames') await frames(o);
  else { console.log('usage: node tools/preview.cjs preview|frames [...]'); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
