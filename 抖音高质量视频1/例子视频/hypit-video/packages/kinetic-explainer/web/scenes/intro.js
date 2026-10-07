/* 开场 0 – 16.5s
 *  A 0–1.45   念头墙：12 行横向漂移的内心独白 + 中间大字随节拍切换（首帧即封面）
 *  B 1.42–6.8 白闪 → 你不是懒。（双层光环扩散、整屏抖动、白线划掉“懒”）→ 内耗循环
 *  C 6.9–16.5 你心里有很多想做的事 → 三张勾选卡片 → 红色念头冒出 → 你却已经累了。
 *    出场跨过 16.5（与参考相同的章节转场：16.3 – 16.733 线性淡出 + 整体上移 15px，01 章内容 16.93 才出现）
 * 所有时间点均按参考视频逐帧（30fps）实测对齐。
 */
(function () {
  const { E } = V;

  /* ---------- 背景辉光（0–16.5 的关键帧归本文件管理） ----------
   * 参考：念头墙强红 → 闪白后中下部红光更浓（1.6–2.3）→ 3.2 前退成偏冷的蓝灰暗底 → 10.8 起红光整体升起 */
  for (let i = V.bgKeys.length - 1; i >= 0; i--) if (V.bgKeys[i][0] < 16.5) V.bgKeys.splice(i, 1);
  V.bgKeys.push(
    [0, 165, 22, 28, 0.38, 50, 45],
    [1.6, 150, 40, 46, 0.20, 50, 52], // + 场景内整屏偏平的暗红辉光（见 B 的 bGlow）
    [2.3, 150, 40, 46, 0.20, 50, 52],
    [3.2, 46, 50, 104, 0.05, 50, 50], // 参考此段是偏冷的蓝灰暗底
    [10.75, 46, 50, 104, 0.05, 50, 50],
    [11.7, 160, 44, 48, 0.07, 50, 52], // + 场景内的整屏红色辉光（见 C）
  );

  /* ---------- 局部样式 ---------- */
  const css = `
  .intro-row { position:absolute; left:0; top:0; height:32px; line-height:32px; white-space:nowrap; font-size:27px; letter-spacing:.1em; font-weight:500; }
  .intro-row.red { font-weight:700; color:#e3313a; text-shadow:0 0 12px rgba(255,40,40,.6), 0 0 3px rgba(255,70,60,.55); }
  .intro-row .intro-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:currentColor; margin:0 74px; vertical-align:middle; position:relative; top:-2px; }
  .intro-band { position:absolute; left:0; right:0; top:248px; height:224px;
    background:linear-gradient(to bottom, rgba(6,4,6,0) 0%, rgba(6,4,6,.62) 7%, rgba(6,4,6,.7) 50%, rgba(6,4,6,.62) 93%, rgba(6,4,6,0) 100%); }
  .intro-word { font-size:106px; letter-spacing:.045em; }
  .intro-bglow { position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse 52% 88% at 50% 52%, rgba(150,40,46,.17) 0%, rgba(150,40,46,.13) 50%, rgba(150,40,46,0) 100%); }
  .intro-flash { position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse 700px 1100px at 640px 360px, rgba(251,250,249,1) 0%, rgba(251,250,249,1) 36%, rgba(251,250,249,.85) 53%, rgba(251,250,249,.69) 71%, rgba(251,250,249,.55) 89%, rgba(251,250,249,.44) 97%, rgba(251,250,249,.42) 100%); }
  .intro-strike { position:absolute; left:0; top:0; height:9px; border-radius:4.5px; background:#f4efe8;
    box-shadow:0 0 10px rgba(255,255,255,.45), 0 0 2px rgba(255,255,255,.8); transform-origin:left center; }
  .intro-card { position:absolute; width:320px; height:80px; box-sizing:border-box; border-radius:12px;
    border:1.5px solid rgba(255,255,255,.12); background:rgba(255,255,255,.035); }
  .intro-card .intro-box { position:absolute; left:26px; top:27px; width:26px; height:26px; box-sizing:border-box; border:2px solid #8f8a86; border-radius:2px; }
  .intro-card .intro-lab { position:absolute; left:75px; top:0; line-height:78px; font-size:27px; font-weight:700; color:#f1ede6; letter-spacing:.03em; white-space:nowrap; }
  .intro-wash { position:absolute; inset:0; background:radial-gradient(ellipse 46% 105% at 50% 45%, rgba(150,30,36,.18) 0%, rgba(150,30,36,.15) 35%, rgba(150,30,36,0) 100%); }
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
  // 中间大字的重拍（参考逐帧：0.5 / 0.8 / 1.1 各砸一次，首帧放大 ≈1.35 倍、两帧内回到原大小）
  // 阈值比参考帧（第 15 / 24 / 33 帧）早 0.01s，保证 t = 帧号/30 时稳定落在新状态
  const SW = 0.79, R1 = 0.49, R2 = 1.09;

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
      // 中间大字：0.5 变红 → 0.8 换成“明天再开始”（白）→ 1.1 再变红；每次都从 1.35 倍砸回（两帧内回到原大小）
      const idx = t < SW ? 0 : 1;
      words.forEach((w, i) => { w.el.style.opacity = i === idx ? 1 : 0; });
      const w = words[idx];
      const red = (idx === 0 && t >= R1) || (idx === 1 && t >= R2);
      const kick = t >= R2 ? R2 : t >= SW ? SW : t >= R1 ? R1 : -9;
      const kd = Math.max(0, t - kick);
      const kk = Math.min(1, Math.exp(-60 * (kd - 0.012)));
      const punch = 1 + 0.35 * kk;
      if (red) {
        w.el.style.color = '#ff2f2c';
        w.el.style.textShadow = '0 0 22px rgba(255,35,35,.75), 0 0 54px rgba(255,30,30,.35), 0 0 3px rgba(255,90,80,.9)';
      } else {
        w.el.style.color = '#f4f0ea';
        w.el.style.textShadow = '0 0 26px rgba(0,0,0,.95), 0 0 60px rgba(0,0,0,.7), 0 0 18px rgba(255,245,235,.12)';
      }
      // 整体：持续轻微推近；结尾（白闪前）略放大提亮
      const push = 1 + 0.025 * t;
      const endP = E.inCubic(V.prog(t, 1.36, 0.09));
      V.set(w.el, { s: punch * push * (1 + 0.03 * endP), blur: 5 * kk });
      V.set(root._wall, { s: 1 + 0.02 * endP, bright: 1 + 0.3 * endP });
    },
  });

  /* =====================================================================
   * B：你不是懒。 1.42 – 6.8
   * ===================================================================== */
  // 白闪（参考 1.467 那一帧最亮：中心 ≈0.78、左右边缘 ≈0.4 的径向白，约 0.2s 线性退到 1.667）——用场景内的径向层代替全屏平涂闪白
  const flashA = (t) => (t < 1.44 ? 0 : t < 1.465 ? (0.8 * (t - 1.44)) / 0.025 : Math.max(0, 0.8 - 4.0 * (t - 1.465)));

  // 整屏抖动（参考逐帧实测，单位 px，帧号 = round(t*30)）：68–109 帧在 ±26 / ±15 之间跳动，115–121 帧“内耗循环”落下时小抖
  const SHAKE0 = 68;
  const SHAKE = [
    [26, 0], [15, -7], [32, 21], [-28, 17], [-28, 11], [-22, -13], [-2, 2], [0, -1], [-26, -14], [-26, 16], // 68–77
    [-26, 14], [26, 16], [26, -14], [26, -13], [0, -2], [26, -12], [26, -16], [26, 16], [-26, 13], [-26, 16], // 78–87
    [-26, -16], [0, 2], [0, 0], [-26, -13], [-26, 14], [-26, 16], [26, 14], [26, -13], [26, -13], [0, 0], // 88–97
    [26, -14], [26, -14], [26, 15], [-26, 15], [-26, 15], [-26, -14], [0, 1], [0, 1], [-26, -14], [-26, 15], // 98–107
    [-26, 15], [26, 15], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [-2, 8], [6, 2], [-6, -4], // 108–117
    [2, 2], [0, 3], [-2, -1], [2, 0], // 118–121
  ];
  const shakeAt = (t) => {
    const k = Math.round(t * 30) - SHAKE0;
    return k >= 0 && k < SHAKE.length ? SHAKE[k] : [0, 0];
  };

  let bGlow, bWrap, flashEl, h1, lazy, strikeEl, lazyBlur, sub, big, ellipse, svg, dot, tail, ringSvg, ringR, ringW, lazyBlurLast = '';
  const sparks = [];
  // 双层光环（参考逐帧实测 ry；rx ≈ 1.6·ry）：红圈 1.47 起、白圈 1.6 起，减速外扩
  const RC = [638, 252];
  const ryR = (t) => 161 + 564 * (1 - Math.exp(-(t - 1.567) / 0.4));
  const ryW = (t) => 131 + 540 * (1 - Math.exp(-(t - 1.667) / 0.36));
  // 椭圆参数（与参考一致）：描边从左上 -112° 开始顺时针画；光点按参数角加速绕行
  const EC = { cx: 640, cy: 535, rx: 282, ry: 80, th0: -112 };
  const eP = (deg) => { const a = (deg * Math.PI) / 180; return [EC.cx + EC.rx * Math.cos(a), EC.cy + EC.ry * Math.sin(a)]; };
  // 光点参数角：参考 4.37–6.33s 逐帧拟合（残差 < 3°）
  const dotTh = (t) => { const u = t - 4.3; return -92.36 + 318.8 * u + 228.5 * u * u; };
  const dotW = (t) => 318.8 + 457 * (t - 4.3);
  const TAIL = 12;
  V.addScene({
    id: 'intro-notlazy', start: 1.42, end: 6.8,
    build(root) {
      bGlow = V.el('div', { cls: 'intro-bglow', parent: root, style: { opacity: 0 } });
      bWrap = V.el('div', { cls: 'layer', parent: root });
      // “懒”被划掉后的横向拖影（仅 x 方向模糊）
      const defs = V.svg('svg', { width: 0, height: 0 }, root);
      defs.style.position = 'absolute';
      const lf = V.svg('filter', { id: 'intro-lazyblur', x: '-20%', y: '-5%', width: '140%', height: '110%', 'color-interpolation-filters': 'sRGB' }, defs);
      lazyBlur = V.svg('feGaussianBlur', { stdDeviation: '0 0' }, lf);

      // 闪白后扩散的双层光环（红外圈 + 白内圈）+ 标题周围漂浮的红白光尘
      ringSvg = V.svgLayer(bWrap);
      ringSvg.style.filter = 'drop-shadow(0 0 5px rgba(255,40,48,.6))';
      ringR = V.svg('ellipse', { cx: RC[0], cy: RC[1], rx: 10, ry: 6, fill: 'none', stroke: '#e0303f', 'stroke-width': 3.6 }, ringSvg);
      ringW = V.svg('ellipse', { cx: RC[0], cy: RC[1], rx: 10, ry: 6, fill: 'none', stroke: '#f2d0d2', 'stroke-width': 5 }, ringSvg);
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
      h1 = new V.Text(bWrap, '你不是<r>懒</r>。', { cls: 'serif', x: 640, y: 246, style: { fontSize: '134px', letterSpacing: '-0.01em' } });
      lazy = h1.chars[3];
      // 参考里“懒”是不发光的实心红（≈#f93b33），只留极淡的一圈
      const lazyR = h1.el.querySelector('.r');
      lazyR.style.color = '#f93b33';
      lazyR.style.textShadow = '0 0 8px rgba(255,45,40,.15)';
      // 白色划线：挂在标题块里（随标题缩放/抖动），每帧按“懒”的实际排版位置定位
      strikeEl = V.el('div', { cls: 'intro-strike', parent: h1.el, style: { opacity: 0 } });

      sub = new V.Text(bWrap, '你只是，被困在一个', { x: 640, y: 435, style: { fontSize: '29px', color: '#8b888b', fontWeight: 500, letterSpacing: '.05em' } });
      big = new V.Text(bWrap, '内耗循环', { cls: 'serif', x: 640, y: 530, style: { fontSize: '90px', textShadow: '0 0 4px rgba(255,248,240,.85), 0 0 12px rgba(255,244,236,.55), 0 0 30px rgba(255,240,230,.2)' } });

      svg = V.svgLayer(bWrap);
      svg.style.filter = 'drop-shadow(0 0 5px rgba(255,40,40,.8))';
      const f2 = (p) => p.map((v) => v.toFixed(2)).join(' ');
      let d = `M ${f2(eP(EC.th0))}`;
      for (let k = 1; k <= 3; k++) d += ` A ${EC.rx} ${EC.ry} 0 0 1 ${f2(eP(EC.th0 + 120 * k))}`;
      ellipse = V.svg('path', { d, fill: 'none', stroke: '#ff2d2d', 'stroke-width': 1.8 }, svg);
      tail = [];
      for (let i = 0; i < TAIL; i++) tail.push(V.svg('circle', { r: (5.0 - i * 0.3).toFixed(2), fill: '#ff2f2a' }, svg));
      dot = V.svg('circle', { r: 5.5, fill: '#fff' }, svg);

      flashEl = V.el('div', { cls: 'intro-flash', parent: root, style: { opacity: 0 } });
    },
    update(lt, t) {
      // 白闪
      const fa = flashA(t);
      flashEl.style.opacity = fa.toFixed(3);
      flashEl.style.display = fa > 0.001 ? '' : 'none';

      // 闪白后整屏偏平的暗红辉光：1.47 亮起，2.3 起 0.9s 退到冷灰底
      bGlow.style.opacity = (V.prog(t, 1.46, 0.06) * (1 - V.ep(t, 2.3, 0.9, E.inOutSine))).toFixed(3);

      // 整屏抖动（标题 + 光环 + 副标题 + 椭圆一起动，与参考同帧）
      const [sx, sy] = shakeAt(t);
      bWrap.style.transform = sx || sy ? `translate(${sx}px,${sy}px)` : 'none';

      // 退场：参考是整体变暗为主、轻微发虚——标题 6.3 起近似线性暗下去，6.73 消失；其余晚 ≈0.03s
      const oT = 1 - E.inOutSine(V.prog(t, 6.27, 0.5));
      const oB = 1 - E.inOutSine(V.prog(t, 6.3, 0.5));

      // 主标题：闪白那一帧已是放大 ≈1.87 倍的完整标题，随后指数回落（参考 1.5:1.42 / 1.533:1.21 / 1.6:1.05）
      h1.reveal(t, 1.44, { stagger: 0.004, dur: 0.04, blur: 10, dy: 0 });
      const dz = t - 1.4667;
      const zs = Math.min(2.0, 1 + 0.87 * Math.exp(-21.5 * dz));
      const zb = Math.min(10, 8 * Math.exp(-30 * dz));
      V.set(h1.el, { o: oT, s: zs, blur: (1 - oT) * 4 + zb });

      // 白线划掉“懒”：2.28 起 0.2s 从左往右划过（参考 2.367 到“懒”左缘、2.47 到头）
      const L = lazy.offsetLeft, W = lazy.offsetWidth, T = lazy.offsetTop, H = lazy.offsetHeight;
      strikeEl.style.left = (L - 0.58 * W).toFixed(1) + 'px';
      strikeEl.style.width = (W * 1.7).toFixed(1) + 'px';
      strikeEl.style.top = (T + H * 0.571 - 4.5).toFixed(1) + 'px';
      const sp = E.inOutSine(V.prog(t, 2.28, 0.2));
      strikeEl.style.transform = `scaleX(${sp.toFixed(4)})`;
      strikeEl.style.opacity = sp > 0 ? 1 : 0;
      // “懒”的故障拖影：抖动期间横向模糊（跳位帧更重），3.65 后 0.25s 收干净
      let lb = 0;
      if (t >= 2.3 && t < 3.9) {
        const base = t < 3.65 ? 1 : 1 - V.prog(t, 3.65, 0.25);
        lb = base * (1.6 + 0.07 * Math.abs(sx));
      }
      const lbs = lb > 0.05 ? `${lb.toFixed(2)} 0.3` : '';
      if (lbs !== lazyBlurLast) {
        lazyBlurLast = lbs;
        if (lbs) lazyBlur.setAttribute('stdDeviation', lbs);
      }
      if (t >= 1.5) lazy.style.filter = lbs ? 'url(#intro-lazyblur)' : 'none';

      // 闪白后的扩散光环 + 光尘（1.47 – 3.15）
      ringSvg.style.display = t < 3.15 ? '' : 'none';
      if (t < 2.3) {
        const rr = Math.max(0, ryR(t)), rw = Math.max(0, ryW(t));
        ringR.setAttribute('rx', (rr * 1.605).toFixed(1)); ringR.setAttribute('ry', rr.toFixed(1));
        ringW.setAttribute('rx', (rw * 1.61).toFixed(1)); ringW.setAttribute('ry', rw.toFixed(1));
        // 红圈 1.78 起退、2.2 消失；白圈 1.8 起线性退、2.13 消失（参考逐帧亮度）
        ringR.setAttribute('opacity', (0.9 * V.prog(t, 1.49, 0.04) * (1 - V.ep(t, 1.78, 0.42, E.outSine))).toFixed(3));
        ringW.setAttribute('opacity', (0.92 * V.prog(t, 1.6, 0.04) * (1 - V.prog(t, 1.8, 0.45))).toFixed(3));
      } else { ringR.setAttribute('opacity', 0); ringW.setAttribute('opacity', 0); }
      if (t < 3.15) {
        for (const p of sparks) {
          const u = t - p.b;
          if (u <= 0 || u >= p.life) { p.el.setAttribute('opacity', 0); continue; }
          const k = u / p.life;
          const o = V.clamp(u / 0.12) * (1 - E.inQuad(V.clamp((k - 0.45) / 0.55))) * (0.65 + 0.35 * Math.sin(t * p.f + p.ph));
          p.el.setAttribute('cx', (p.x0 + p.vx * u).toFixed(1));
          p.el.setAttribute('cy', (p.y0 + p.vy * u).toFixed(1));
          p.el.setAttribute('opacity', o.toFixed(3));
        }
      }

      // 副标题 3.28 起逐字；大字 3.845 整词带模糊放大落下（参考 3.867 首帧、3.93 清晰）
      sub.reveal(t, 3.28, { stagger: 0.028, dur: 0.3, blur: 8, dy: 6 });
      V.set(sub.el, { o: oB, blur: (1 - oB) * 3 });
      big.reveal(t, 3.845, { stagger: 0.01, dur: 0.12, blur: 14, dy: 0, scale: 1.18 });
      V.set(big.el, { o: oB, blur: (1 - oB) * 4 });

      // 椭圆描边（3.97–4.41，从左上顺时针、越画越快）+ 光点 4.24 出现后加速绕行
      const pd = E.inQuad(V.prog(t, 3.97, 0.44));
      V.draw(ellipse, pd);
      svg.style.opacity = ((pd > 0 ? 1 : 0) * oB).toFixed(3);
      const dv = V.prog(t, 4.24, 0.04);
      const th = dotTh(t);
      const gap = (34 + 0.006 * dotW(t)) / TAIL; // 拖尾约 36°→42°（参考实测）
      const hp = eP(th);
      dot.setAttribute('cx', hp[0].toFixed(2)); dot.setAttribute('cy', hp[1].toFixed(2));
      dot.setAttribute('opacity', dv.toFixed(3));
      tail.forEach((c, i) => {
        const p = eP(th - gap * (i + 1));
        c.setAttribute('cx', (p[0] + Math.sin(i * 2.1 + t * 9) * 0.8).toFixed(2));
        c.setAttribute('cy', (p[1] + Math.cos(i * 1.7 + t * 7) * 0.8).toFixed(2));
        c.setAttribute('opacity', (Math.pow(1 - i / TAIL, 0.8) * dv).toFixed(3));
      });
    },
  });

  /* =====================================================================
   * C：你心里有很多想做的事 6.9 – 16.5
   * ===================================================================== */
  // 卡片入场（参考：7.75 / 8.09 / 8.46 起淡入，从下方升起、略冲过头 ≈4px 再落定）
  const CARDS = [
    { text: '早起跑步', x: 267, t: 7.75, ph: 0.0 },
    { text: '学一项新技能', x: 640, t: 8.09, ph: 2.1 },
    { text: '把房间收拾干净', x: 1013, t: 8.46, ph: 4.4 },
  ];
  const CARD_Y = 320;
  const backOut = (x) => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  // 红色念头：出现时间（参考逐帧）/ 位置 / 字号（对应参考同一时刻、同一位置）
  const WORRY = [
    { text: '想太多', t: 10.75, x: 172, y: 452, fs: 28 },
    { text: '好累', t: 11.03, x: 1106, y: 252, fs: 35 },
    { text: '没状态', t: 11.31, x: 512, y: 470, fs: 31 },
    { text: '我好废', t: 11.59, x: 846, y: 458, fs: 29 },
    { text: '来不及了', t: 11.89, x: 1107, y: 458, fs: 28 },
    { text: '明天吧', t: 12.16, x: 170, y: 252, fs: 27 },
  ];
  // 章节转场（参考五处章节切换完全相同，逐帧实测）：以 M 为中点，M-0.2 → M+0.233 近似线性淡出，
  // M-0.17 → M+0.15 整体上移 15px（smoothstep），越到后面越虚。开场 M = 16.5 → 16.733 清空（01 章 16.93 才出字）
  const XF_M = 16.5, XF_END = XF_M + 0.25;
  const xfade = (t, M) => {
    const p = V.prog(t, M - 0.2, 0.433), q = V.prog(t, M - 0.17, 0.32);
    return { p, o: 1 - p, y: -15 * q * q * (3 - 2 * q), blur: 6 * p * p };
  };

  let cWrap, wash, title, subC, cards = [], worries = [], line1, line2, tiredSpan;
  V.addScene({
    id: 'intro-plan', start: 6.9, end: XF_END,
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
      // 标题 7.06 起逐字（参考 7.07 首字淡入、每字 ≈0.045s）/ 副标题 8.24 起
      title.reveal(t, 7.06, { stagger: 0.04, dur: 0.3, blur: 12, dy: 8 });
      subC.reveal(t, 8.24, { stagger: 0.03, dur: 0.32, blur: 8, dy: 6 });

      // 卡片：逐张模糊升起（带一点回弹）；10.75 起红色念头出现，卡片开始发抖、边框变红
      const tense = V.ep(t, 10.75, 0.8, E.inOutSine);
      const redB = V.ep(t, 10.8, 1.5, E.inOutSine);
      cards.forEach((c) => {
        const u = V.prog(t, c.t, 0.6);
        const pa = V.ep(t, c.t, 0.18, E.outQuad);
        const pb = V.ep(t, c.t, 0.18, E.outCubic);
        const sh = tense;
        const dx = sh * (3.0 * Math.sin(t * 31.4 + c.ph) + 1.2 * Math.sin(t * 53.1 + c.ph * 1.7));
        const dy = sh * (1.5 * Math.sin(t * 26.7 + c.ph * 2.3) + 0.6 * Math.sin(t * 61.3 + c.ph));
        V.set(c.el, { o: pa, y: 24 * (1 - backOut(u)) + dy, x: dx, s: V.lerp(0.97, 1, pb), blur: (1 - pb) * 6 });
        if (c._rb !== redB) {
          c._rb = redB;
          const a = (0.12 + 0.34 * redB).toFixed(3);
          const g = Math.round(V.lerp(255, 52, redB)), b = Math.round(V.lerp(255, 52, redB));
          c.el.style.borderColor = `rgba(255,${g},${b},${a})`;
          c.el.style.boxShadow = redB > 0.001 ? `0 0 ${(14 * redB).toFixed(1)}px rgba(255,40,40,${(0.2 * redB).toFixed(3)}), inset 0 0 14px rgba(255,40,40,${(0.06 * redB).toFixed(3)})` : 'none';
          c.el.style.background = `rgba(255,${Math.round(V.lerp(255, 70, redB))},${Math.round(V.lerp(255, 70, redB))},${(0.035 + 0.02 * redB).toFixed(3)})`;
        }
      });

      // 红色念头：与参考一致，从极小整体放大弹出（≈0.27s，冲到 1.09 倍）再回落，之后缓慢漂移
      worries.forEach((w, i) => {
        const p = V.prog(t, w.t, 0.27);
        const s = p < 1 ? V.lerp(0.1, 1.09, E.outCubic(p)) : 1 + 0.09 * (1 - E.inOutSine(V.prog(t, w.t + 0.29, 0.2)));
        const o = V.clamp(p * 3);
        const lt2 = Math.max(0, t - w.t);
        const dx = Math.sin(lt2 * 0.9 + i * 1.3) * 5 * Math.min(1, lt2);
        const dy = Math.cos(lt2 * 0.75 + i * 2.1) * 4 * Math.min(1, lt2);
        V.set(w.el, { o, s, x: dx, y: dy, blur: (1 - p) * 5 });
      });

      // 底部两行（参考：小字 12.79 起、13.0 读完；大字 13.09 起逐字 ≈0.045s/字，红字 13.40–13.6 亮起）
      line1.reveal(t, 12.79, { stagger: 0.025, dur: 0.22, blur: 8, dy: 6 });
      // 你却已经（13.09 起逐字）→ 停半拍 → “累”13.40–13.6 慢慢亮起 → 了。
      const L2 = [13.09, 13.14, 13.19, 13.24, 13.4, 13.5, 13.55];
      line2.chars.forEach((c, i) => {
        const key = i === 4;
        const p = key ? E.inOutSine(V.prog(t, L2[i], 0.2)) : E.outCubic(V.prog(t, L2[i], 0.2));
        if (c._p === p) return;
        c._p = p;
        c.style.opacity = p >= 0.999 ? 1 : p.toFixed(4);
        c.style.filter = p >= 0.999 ? 'none' : `blur(${((1 - p) * (key ? 9 : 8)).toFixed(2)}px)`;
        c.style.transform = p >= 0.999 || key ? 'none' : `translateY(${((1 - p) * 6).toFixed(2)}px)`;
      });
      // “累”：轻微放大回落 + 辉光在落点爆亮后回落
      const kp = V.prog(t, 13.4, 0.32);
      const sc = V.lerp(1.12, 1, E.outCubic(kp));
      tiredSpan.style.transform = kp >= 1 ? 'none' : `scale(${sc.toFixed(4)})`;
      const glow = V.prog(t, 13.48, 0.1) * (1 - E.outCubic(V.prog(t, 13.58, 1.2)));
      tiredSpan.style.textShadow = `0 0 ${(18 + 22 * glow).toFixed(1)}px rgba(255,40,40,${(0.55 + 0.35 * glow).toFixed(3)}), 0 0 4px rgba(255,70,60,.8)`;

      // 结尾：章节转场（淡出 + 上移 + 变虚，16.733 清空）
      const xf = xfade(t, XF_M), out = xf.p;
      V.set(cWrap, { o: xf.o, y: xf.y, blur: xf.blur, s: 1 + out * 0.01 });
      // 红色辉光随念头升起（10.85–11.8），淡出时一起退去
      wash.style.opacity = (V.ep(t, 10.85, 0.95, E.inOutSine) * (1 - out)).toFixed(3);
    },
  });
})();
