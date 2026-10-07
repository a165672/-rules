/* 开场 0 – 16.5s
 *  A 0–1.45   念头墙：12 行横向漂移的内心独白 + 中间大字随节拍切换（首帧即封面）
 *  B 1.42–6.8 你不是懒。→ 内耗循环
 *  C 6.9–16.5 你心里有很多想做的事 → 三张勾选卡片 → 红色念头冒出 → 你却已经累了。
 */
(function () {
  const { E } = V;

  /* ---------- 背景辉光（0–16.5 的关键帧归本文件管理） ----------
   * 参考：念头墙强红 → 闪白后红光在 2–3.8s 退去 → 4–10.7 近乎中性的暗色 → 10.8 起红光整体升起 */
  for (let i = V.bgKeys.length - 1; i >= 0; i--) if (V.bgKeys[i][0] < 16.5) V.bgKeys.splice(i, 1);
  V.bgKeys.push(
    [0, 150, 18, 22, 0.30, 50, 45],
    [1.6, 140, 18, 22, 0.27, 50, 42],
    [2.7, 130, 16, 20, 0.17, 50, 45],
    [3.8, 46, 50, 104, 0.05, 50, 50], // 参考此段是偏冷的蓝灰暗底
    [10.75, 46, 50, 104, 0.05, 50, 50],
    [11.7, 160, 44, 48, 0.10, 50, 52], // + 场景内的整屏红色辉光（见 C）
  );

  /* ---------- 局部样式 ---------- */
  const css = `
  .intro-row { position:absolute; left:0; top:0; height:32px; line-height:32px; white-space:nowrap; font-size:27px; letter-spacing:.1em; font-weight:500; }
  .intro-row.red { font-weight:700; color:#e3313a; text-shadow:0 0 12px rgba(255,40,40,.6), 0 0 3px rgba(255,70,60,.55); }
  .intro-row .intro-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:currentColor; margin:0 74px; vertical-align:middle; position:relative; top:-2px; }
  .intro-band { position:absolute; left:0; right:0; top:248px; height:224px;
    background:linear-gradient(to bottom, rgba(6,4,6,0) 0%, rgba(6,4,6,.62) 7%, rgba(6,4,6,.7) 50%, rgba(6,4,6,.62) 93%, rgba(6,4,6,0) 100%); }
  .intro-word { font-size:106px; letter-spacing:.045em; }
  .intro-card { position:absolute; width:320px; height:80px; box-sizing:border-box; border-radius:12px;
    border:1.5px solid rgba(255,255,255,.12); background:rgba(255,255,255,.035); }
  .intro-card .intro-box { position:absolute; left:26px; top:27px; width:26px; height:26px; box-sizing:border-box; border:2px solid #8f8a86; border-radius:2px; }
  .intro-card .intro-lab { position:absolute; left:75px; top:0; line-height:78px; font-size:27px; font-weight:700; color:#f1ede6; letter-spacing:.03em; white-space:nowrap; }
  .intro-wash { position:absolute; inset:0; background:radial-gradient(ellipse 55% 110% at 50% 45%, rgba(150,30,36,.17) 0%, rgba(150,30,36,.15) 35%, rgba(150,30,36,0) 100%); }
  .intro-worry { position:absolute; white-space:nowrap; font-weight:700; color:#ff3a35; letter-spacing:.02em;
    text-shadow:0 0 14px rgba(255,40,40,.75), 0 0 3px rgba(255,90,80,.85); }
  `;
  V.el('style', { text: css, parent: document.head });

  /* =====================================================================
   * A：念头墙 0 – 1.45
   * ===================================================================== */
  const PHR = ['就躺一会儿', '刷完这条就起', '明天一定开始', '今天状态不好', '等我休息够了', '好累啊',
    '什么都不想干', '再看一集', '我怎么这么废', '下周一再说', '起不来', '等会儿再弄'];
  // 每行：颜色 / 景深模糊 / 速度系数（偶数行向左，奇数行向右；参考里向左的行更快）
  const ROWS = [
    { c: '#45383c', blur: 2.0, s: 1.35 },
    { c: '#4c4044', blur: 0.6, s: 0.95 },
    { c: '#655759', blur: 0, s: 1.55 },
    { red: true, blur: 0, s: 1.0 },
    { c: '#2e2428', blur: 2.2, s: 1.4 },
    { c: '#2b2226', blur: 2.6, s: 0.9 },
    { c: '#2b2226', blur: 2.6, s: 1.45 },
    { c: '#2e2428', blur: 2.2, s: 1.0 },
    { red: true, blur: 0, s: 1.5 },
    { c: '#5c4f52', blur: 0, s: 1.0 },
    { c: '#45383c', blur: 1.3, s: 1.4 },
    { c: '#5a4b4f', blur: 0.7, s: 1.05 },
  ];
  const ROW_Y0 = 80, ROW_DY = 51.2;
  const ADV = 27 * 1.1; // 每个汉字的步进（字号 + 字距）
  const GAP = 156; // 字距尾巴 + 圆点 + 两侧留白
  // 漂移距离：速度随时间指数加速（参考 0.4s ≈ 550px/s，1.0s ≈ 1500px/s）
  const drift = (t) => 200 * (Math.exp(1.5 * t) - 1);
  const speed = (t) => 300 * Math.exp(1.5 * t);

  let rows = [], words;
  V.addScene({
    id: 'intro-wall', start: 0, end: 1.45,
    build(root) {
      const wall = V.el('div', { cls: 'layer', parent: root });
      root._wall = wall;
      const defs = V.svg('svg', { width: 0, height: 0 }, root);
      defs.style.position = 'absolute';
      const rnd = V.rng(20261006);
      ROWS.forEach((cfg, i) => {
        const el = V.el('div', { cls: 'intro-row' + (cfg.red ? ' red' : ''), parent: wall });
        if (!cfg.red) el.style.color = cfg.c;
        const k0 = (i * 5 + 2) % 12;
        let html = '', w = 0;
        for (let k = 0; k < 28; k++) {
          const p = PHR[(k0 + k) % 12];
          html += `<span>${p}</span><span class="intro-dot"></span>`;
          w += p.length * ADV + GAP;
        }
        el.innerHTML = html;
        const left = i % 2 === 0;
        // 向左的行从屏幕左侧外开始；向右的行让右端略超出屏幕
        const x0 = left ? -60 - rnd() * 320 : 1280 + 120 + rnd() * 300 - w;
        el.style.top = (ROW_Y0 + i * ROW_DY - 16).toFixed(1) + 'px';
        // 水平运动模糊（SVG 滤镜，仅 x 方向）+ 景深模糊
        const f = V.svg('filter', { id: 'intro-mb' + i, x: '-1%', y: '-60%', width: '102%', height: '220%', 'color-interpolation-filters': 'sRGB' }, defs);
        const g = V.svg('feGaussianBlur', { stdDeviation: `${cfg.blur} ${cfg.blur}` }, f);
        el.style.filter = `url(#intro-mb${i})`;
        rows.push({ el, x0, dir: left ? -1 : 1, cfg, g, last: '' });
      });
      V.el('div', { cls: 'intro-band', parent: wall }); // 中间压暗的横带
      words = [
        new V.Text(wall, '再躺五分钟', { cls: 'serif intro-word', x: 640, y: 357 }),
        new V.Text(wall, '明天再开始', { cls: 'serif intro-word', x: 640, y: 357 }),
      ];
    },
    update(lt, t, root) {
      // 行漂移
      const sp = speed(t);
      for (const r of rows) {
        const x = r.x0 + r.dir * r.cfg.s * drift(t);
        r.el.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
        const mb = Math.min(6, (sp * r.cfg.s) / 650) * (t > 0.02 ? 1 : 0); // 参考后段横向拖影很重
        const sx = Math.hypot(r.cfg.blur, mb).toFixed(2), sy = r.cfg.blur.toFixed(2);
        const sd = `${sx} ${sy}`;
        if (sd !== r.last) { r.g.setAttribute('stdDeviation', sd); r.last = sd; }
      }
      // 中间大字：0.5 变红（重拍）→ 0.95 换成“明天再开始”（白）→ 1.16 再变红
      const SW = 0.95, R1 = 0.5, R2 = 1.16;
      const idx = t < SW ? 0 : 1;
      words.forEach((w, i) => { w.el.style.opacity = i === idx ? 1 : 0; });
      const w = words[idx];
      const red = (idx === 0 && t >= R1) || (idx === 1 && t >= R2);
      const kick = idx === 0 ? (t >= R1 ? R1 : -9) : (t >= R2 ? R2 : SW);
      const amp = kick === SW ? 0.32 : 0.14;
      const kp = V.prog(t, kick, 0.11);
      const punch = 1 + amp * (1 - E.outCubic(kp));
      if (red) {
        w.el.style.color = '#ff2f2c';
        w.el.style.textShadow = '0 0 22px rgba(255,35,35,.75), 0 0 54px rgba(255,30,30,.35), 0 0 3px rgba(255,90,80,.9)';
      } else {
        w.el.style.color = '#f4f0ea';
        w.el.style.textShadow = '0 0 26px rgba(0,0,0,.95), 0 0 60px rgba(0,0,0,.7), 0 0 18px rgba(255,245,235,.12)';
      }
      // 整体：持续轻微推近；结尾（白闪前）加速放大 + 提亮
      const push = 1 + 0.025 * t;
      const endP = E.inCubic(V.prog(t, 1.36, 0.09));
      V.set(w.el, { s: punch * push * (1 + 0.03 * endP), blur: (1 - E.outCubic(kp)) * (kick === SW ? 4 : 2) });
      V.set(root._wall, { s: 1 + 0.02 * endP, bright: 1 + 0.6 * endP });
    },
  });

  /* =====================================================================
   * B：你不是懒。 1.42 – 6.8
   * ===================================================================== */
  V.addFlash({ t: 1.44, attack: 0.03, dur: 0.3, peak: 0.88, color: '#fbf7f2' });

  let h1, strike, sub, big, ellipse, svg, dot, tail, ringSvg, ringR, ringW;
  const sparks = [];
  const RC = [636, 258]; // 光环中心
  // 椭圆参数（与参考一致）：描边从左上 -112° 开始顺时针画；光点按参数角加速绕行
  const EC = { cx: 640, cy: 535, rx: 282, ry: 80, th0: -112 };
  const eP = (deg) => { const a = (deg * Math.PI) / 180; return [EC.cx + EC.rx * Math.cos(a), EC.cy + EC.ry * Math.sin(a)]; };
  const dotTh = (t) => -81 + 375 * (t - 4.3) + 210 * (t - 4.3) * (t - 4.3); // 参考实测：≈375°/s 起步，逐渐加速
  const dotW = (t) => 375 + 420 * (t - 4.3);
  V.addScene({
    id: 'intro-notlazy', start: 1.42, end: 6.8,
    build(root) {
      // 闪白后扩散的双层光环（红外圈 + 白内圈）+ 标题周围漂浮的红白光尘
      ringSvg = V.svgLayer(root);
      ringSvg.style.filter = 'drop-shadow(0 0 6px rgba(255,40,40,.75))';
      ringR = V.svg('ellipse', { cx: RC[0], cy: RC[1], rx: 10, ry: 6, fill: 'none', stroke: '#ff3a34', 'stroke-width': 3 }, ringSvg);
      ringW = V.svg('ellipse', { cx: RC[0], cy: RC[1], rx: 10, ry: 6, fill: 'none', stroke: '#f6e6e4', 'stroke-width': 3.2 }, ringSvg);
      const rs = V.rng(1450);
      const g3 = () => (rs() + rs() + rs() - 1.5) / 1.5;
      for (let i = 0; i < 58; i++) {
        const x0 = 640 + g3() * 300, y0 = 262 + g3() * 140;
        const dx = x0 - 640, dy = y0 - 258, len = Math.hypot(dx, dy) || 1, v = 18 + rs() * 40;
        sparks.push({
          el: V.svg('circle', { r: (1.4 + rs() * 1.8).toFixed(2), fill: rs() < 0.5 ? '#ff4a3c' : '#fff3ee' }, ringSvg),
          x0, y0, vx: (dx / len) * v, vy: (dy / len) * v * 0.7 - 10, b: 1.5 + rs() * 0.25, life: 0.9 + rs() * 0.9, ph: rs() * 6.28, f: 9 + rs() * 14,
        });
      }
      h1 = new V.Text(root, '你不是<r>懒</r>。', { cls: 'serif', x: 640, y: 252, style: { fontSize: '128px', letterSpacing: '-0.01em' } });
      // 白色划线穿过“懒”
      const lazy = h1.chars[3];
      lazy.style.position = 'relative';
      strike = new V.Strike(lazy, { left: -70, right: -18, top: 50, thickness: 5, color: '#f4efe8', glow: false });
      strike.line.style.boxShadow = '0 0 12px rgba(255,255,255,.55)';

      sub = new V.Text(root, '你只是，被困在一个', { x: 640, y: 434, style: { fontSize: '25px', color: '#8f8a84', fontWeight: 500, letterSpacing: '.04em' } });
      big = new V.Text(root, '内耗循环', { cls: 'serif', x: 640, y: 533, style: { fontSize: '76px', textShadow: '0 0 18px rgba(255,244,236,.55), 0 0 42px rgba(255,240,230,.25)' } });

      svg = V.svgLayer(root);
      svg.style.filter = 'drop-shadow(0 0 5px rgba(255,40,40,.9))';
      const f2 = (p) => p.map((v) => v.toFixed(2)).join(' ');
      let d = `M ${f2(eP(EC.th0))}`;
      for (let k = 1; k <= 3; k++) d += ` A ${EC.rx} ${EC.ry} 0 0 1 ${f2(eP(EC.th0 + 120 * k))}`;
      ellipse = V.svg('path', { d, fill: 'none', stroke: '#ff2d2d', 'stroke-width': 2.2 }, svg);
      tail = [];
      for (let i = 0; i < 12; i++) tail.push(V.svg('circle', { r: (3.0 - i * 0.17).toFixed(2), fill: '#ff4b3e' }, svg));
      dot = V.svg('circle', { r: 6, fill: '#fff' }, svg);
    },
    update(lt, t) {
      // 主标题：闪白中已出现，轻微推近
      const zin = V.ep(t, 1.42, 1.1, E.outQuart);
      const out = 1 - V.ep(t, 6.42, 0.34, E.inOutCubic); // 参考 6.45 起模糊淡出
      // 闪白后第一帧（1.467）整句已在：参考里此刻是放大 ~1.7 倍的完整标题
      h1.reveal(t, 1.44, { stagger: 0.004, dur: 0.04, blur: 10, dy: 0 });
      // 闪白瞬间从 1.7 倍急速缩回（~0.1s 内回到 1.05），再缓慢推近（参考同款）
      const zfast = V.ep(t, 1.445, 0.13, E.outCubic);
      V.set(h1.el, { o: out, s: V.lerp(1.7, 1, zfast) * V.lerp(1.05, 1, zin), blur: (1 - out) * 9 + (1 - zfast) * 3 });
      strike.update(t, V.beat(4) - 0.05, 0.32);

      // 闪白后的扩散光环 + 光尘（1.5 – 3.1）
      const ringOn = t < 2.3;
      ringSvg.style.display = t < 3.15 ? '' : 'none';
      if (ringOn) {
        const ur = Math.max(0, t - 1.5), uw = Math.max(0, t - 1.58);
        // 参考实测：两圈都在扩散中减速，最终停在画面边缘外沿
        const urc = Math.min(ur, 0.4545), uwc = Math.min(uw, 0.571);
        const rxR = 60 + 3000 * urc - 3300 * urc * urc, rxW = 60 + 2400 * uwc - 2100 * uwc * uwc;
        ringR.setAttribute('rx', rxR.toFixed(1)); ringR.setAttribute('ry', (rxR * 0.61).toFixed(1));
        ringW.setAttribute('rx', rxW.toFixed(1)); ringW.setAttribute('ry', (rxW * 0.6).toFixed(1));
        ringR.setAttribute('opacity', (V.prog(t, 1.5, 0.05) * (1 - V.ep(t, 1.86, 0.36, E.inQuad))).toFixed(3));
        ringW.setAttribute('opacity', (0.9 * V.prog(t, 1.58, 0.05) * (1 - V.ep(t, 1.92, 0.36, E.inQuad))).toFixed(3));
      } else { ringR.setAttribute('opacity', 0); ringW.setAttribute('opacity', 0); }
      if (t < 3.15) {
        for (const p of sparks) {
          const u = t - p.b;
          if (u <= 0 || u >= p.life) { p.el.setAttribute('opacity', 0); continue; }
          const k = u / p.life;
          const o = V.clamp(u / 0.12) * (1 - E.inQuad(V.clamp((k - 0.45) / 0.55))) * (0.65 + 0.35 * Math.sin(t * p.f + p.ph));
          p.el.setAttribute('cx', (p.x0 + p.vx * u).toFixed(1));
          p.el.setAttribute('cy', (p.y0 + p.vy * u).toFixed(1));
          p.el.setAttribute('opacity', (o * out).toFixed(3));
        }
      }

      sub.anim(t, 3.28, 6.4, { stagger: 0.03, dur: 0.35, blur: 8, outDur: 0.34, outBlur: 8 });
      big.reveal(t, 3.68, { stagger: 0.02, dur: 0.22, blur: 16, dy: 0, scale: 1.25 });
      V.set(big.el, { o: out, blur: (1 - out) * 9 });

      // 椭圆描边（4.04–4.48，从左上顺时针）+ 光点加速绕行（拖尾随速度拉长）
      const pd = E.inOutSine(V.prog(t, 4.04, 0.44));
      V.draw(ellipse, pd);
      svg.style.opacity = (pd > 0 ? 1 : 0) * out;
      const dv = V.prog(t, 4.2, 0.08);
      const th = dotTh(t), gap = V.clamp(dotW(t) * 0.014, 4, 9);
      const hp = eP(th);
      dot.setAttribute('cx', hp[0].toFixed(2)); dot.setAttribute('cy', hp[1].toFixed(2));
      dot.setAttribute('opacity', dv.toFixed(3));
      tail.forEach((c, i) => {
        const p = eP(th - gap * (i + 1));
        c.setAttribute('cx', (p[0] + Math.sin(i * 2.1 + t * 9) * 1.2).toFixed(2));
        c.setAttribute('cy', (p[1] + Math.cos(i * 1.7 + t * 7) * 1.2).toFixed(2));
        c.setAttribute('opacity', ((1 - i / 12) * 0.9 * dv).toFixed(3));
      });
    },
  });

  /* =====================================================================
   * C：你心里有很多想做的事 6.9 – 16.5
   * ===================================================================== */
  const CARDS = [
    { text: '早起跑步', x: 267, t: 7.7, ph: 0.0 },
    { text: '学一项新技能', x: 640, t: 8.1, ph: 2.1 },
    { text: '把房间收拾干净', x: 1013, t: 8.5, ph: 4.4 },
  ];
  const CARD_Y = 320;
  // 红色念头：出现时间 / 位置 / 字号（对应参考同一时刻、同一位置）
  const WORRY = [
    { text: '想太多', t: 10.8, x: 172, y: 452, fs: 28 },
    { text: '好累', t: 11.02, x: 1106, y: 252, fs: 35 },
    { text: '没状态', t: 11.3, x: 512, y: 470, fs: 31 },
    { text: '我好废', t: 11.6, x: 846, y: 458, fs: 29 },
    { text: '来不及了', t: 11.9, x: 1107, y: 458, fs: 28 },
    { text: '明天吧', t: 12.2, x: 170, y: 252, fs: 27 },
  ];
  // 整体模糊淡出：参考在 16.4 仍清晰、16.5 后才退场；本窗口 16.5 截止，所以尽量晚开始，16.47 前完全消失
  const C_OUT = 16.3, C_OUT_D = 0.17;

  let cWrap, wash, title, subC, cards = [], worries = [], line1, line2, tiredSpan;
  V.addScene({
    id: 'intro-plan', start: 6.9, end: 16.5,
    build(root) {
      wash = V.el('div', { cls: 'intro-wash', parent: root, style: { opacity: 0 } });
      cWrap = V.el('div', { cls: 'layer', parent: root });
      title = new V.Text(cWrap, '你心里有很多想做的事', { cls: 'serif', x: 640, y: 140, style: { fontSize: '42px', letterSpacing: '.02em', textShadow: '0 0 18px rgba(255,245,235,.16)' } });
      subC = new V.Text(cWrap, '可现实里——你只想躺着。', { x: 640, y: 196, style: { fontSize: '24px', color: '#8d8882', fontWeight: 500, letterSpacing: '.03em' } });
      for (const c of CARDS) {
        const el = V.el('div', { cls: 'intro-card', parent: cWrap });
        V.place(el, c.x, CARD_Y, 'c');
        V.el('span', { cls: 'intro-box', parent: el });
        V.el('span', { cls: 'intro-lab', text: c.text, parent: el });
        cards.push({ el, ...c });
      }
      for (const w of WORRY) {
        const el = V.el('div', { cls: 'intro-worry', text: w.text, parent: cWrap, style: { fontSize: w.fs + 'px' } });
        V.place(el, w.x, w.y, 'c');
        worries.push({ el, ...w });
      }
      line1 = new V.Text(cWrap, '明明什么都还没做，', { x: 640, y: 576, style: { fontSize: '23px', color: '#8d8882', fontWeight: 500, letterSpacing: '.04em' } });
      line2 = new V.Text(cWrap, '你却已经<r>累</r>了。', { cls: 'serif', x: 640, y: 632, style: { fontSize: '42px', letterSpacing: '.02em', textShadow: '0 0 18px rgba(255,245,235,.14)' } });
      tiredSpan = line2.el.querySelector('.r');
      tiredSpan.style.display = 'inline-block';
    },
    update(lt, t) {
      // 标题 / 副标题
      title.reveal(t, 7.08, { stagger: 0.04, dur: 0.32, blur: 12, dy: 8 });
      subC.reveal(t, 8.2, { stagger: 0.035, dur: 0.38, blur: 8, dy: 6 });

      // 卡片：逐张模糊入场；10.8 起红色念头出现，卡片开始发抖、边框变红
      const tense = V.ep(t, 10.75, 0.8, E.inOutSine);
      const redB = V.ep(t, 10.8, 1.5, E.inOutSine);
      cards.forEach((c, i) => {
        const p = V.ep(t, c.t, 0.32, E.outCubic);
        const sh = tense;
        const dx = sh * (3.0 * Math.sin(t * 31.4 + c.ph) + 1.2 * Math.sin(t * 53.1 + c.ph * 1.7));
        const dy = sh * (1.5 * Math.sin(t * 26.7 + c.ph * 2.3) + 0.6 * Math.sin(t * 61.3 + c.ph));
        V.set(c.el, { o: p, y: (1 - p) * 16 + dy, x: dx, s: V.lerp(0.97, 1, p), blur: (1 - p) * 9 });
        if (c._rb !== redB) {
          c._rb = redB;
          const a = (0.12 + 0.34 * redB).toFixed(3);
          const r = Math.round(V.lerp(255, 255, redB)), g = Math.round(V.lerp(255, 52, redB)), b = Math.round(V.lerp(255, 52, redB));
          c.el.style.borderColor = `rgba(${r},${g},${b},${a})`;
          c.el.style.boxShadow = redB > 0.001 ? `0 0 ${(14 * redB).toFixed(1)}px rgba(255,40,40,${(0.2 * redB).toFixed(3)}), inset 0 0 14px rgba(255,40,40,${(0.06 * redB).toFixed(3)})` : 'none';
          c.el.style.background = `rgba(${Math.round(V.lerp(255, 255, redB))},${Math.round(V.lerp(255, 70, redB))},${Math.round(V.lerp(255, 70, redB))},${(0.035 + 0.02 * redB).toFixed(3)})`;
        }
      });

      // 红色念头：与参考一致，从极小整体放大弹出（约 6 帧），之后缓慢漂移
      worries.forEach((w, i) => {
        const p = V.prog(t, w.t, 0.22);
        const sx = V.lerp(0.12, 1, E.outCubic(p)), sy = sx;
        const o = V.clamp(p * 3);
        const lt2 = Math.max(0, t - w.t);
        const dx = Math.sin(lt2 * 0.9 + i * 1.3) * 5 * Math.min(1, lt2);
        const dy = Math.cos(lt2 * 0.75 + i * 2.1) * 4 * Math.min(1, lt2);
        V.set(w.el, { o, sx, sy, x: dx, y: dy, blur: (1 - p) * 5 });
      });

      // 底部两行（参考：小字 12.8 起、13.0 已读完；大字 13.06 起逐字，重点词落在第 28 拍）
      line1.reveal(t, 12.78, { stagger: 0.025, dur: 0.3, blur: 8, dy: 6 });
      // 你却已经 → 停半拍 → “累”在第 28 拍砸下来 → 了。
      const tb = V.beat(28);
      const L2 = [13.06, 13.115, 13.17, 13.225, tb - 0.1, tb, tb + 0.05];
      line2.chars.forEach((c, i) => {
        const slam = i === 4;
        const p = E.outCubic(V.prog(t, L2[i], slam ? 0.2 : 0.3));
        if (c._p === p) return;
        c._p = p;
        c.style.opacity = p >= 0.999 ? 1 : p.toFixed(4);
        c.style.filter = p >= 0.999 ? 'none' : `blur(${((1 - p) * (slam ? 6 : 10)).toFixed(2)}px)`;
        c.style.transform = p >= 0.999 || slam ? 'none' : `translateY(${((1 - p) * 8).toFixed(2)}px)`;
      });
      // “累”：从 1.55 倍砸回原位（与出现同步，无跳变）+ 辉光在落点爆亮后回落
      const kp = V.prog(t, tb - 0.1, 0.32);
      const sc = V.lerp(1.55, 1, E.outCubic(kp));
      tiredSpan.style.transform = kp >= 1 ? 'none' : `scale(${sc.toFixed(4)})`;
      const glow = 1 - E.outCubic(V.prog(t, tb, 1.2));
      tiredSpan.style.textShadow = `0 0 ${(18 + 22 * glow).toFixed(1)}px rgba(255,40,40,${(0.55 + 0.35 * glow).toFixed(3)}), 0 0 4px rgba(255,70,60,.8)`;

      // 结尾：整体模糊淡出（16.5 前完全消失）
      const out = V.ep(t, C_OUT, C_OUT_D, E.inOutSine);
      V.set(cWrap, { o: 1 - out, blur: out * 14, s: 1 + out * 0.015 });
      // 红色辉光随念头升起（10.85–11.8），淡出时一起退去
      wash.style.opacity = (V.ep(t, 10.85, 0.95, E.inOutSine) * (1 - out)).toFixed(3);
    },
  });
})();
