/* 02 省电本能（35.5 – 51.6s）
 *
 * 时间轴（与参考视频「杏仁核劫持」同一时刻对齐）：
 *  35.55  章节开场：画面中央一团暗红辉光升起又退去
 *  36.25  红点（省力本能）模糊→清晰；36.52 标签逐字；36.7 外环扩开；36.86 小字
 *  37.12  荧光绿点（前额叶）模糊→清晰，37.28 外环；37.52 标签；37.95 小字；37.6 两点之间虚线连起
 *  38.44  文案①「想起身时，」→ 38.64「两个你在拔河。」
 *  41.12  文案①模糊淡出，41.26 两点标签随后淡出
 *  41.42  文案②「越是疲惫，」→ 41.72「本能越容易赢。」（本能=红，42.22 重音）
 *  41.80  红点持续膨胀、绿点缩小变暗；42.22 起每拍一圈涟漪向外扩散
 *  43.76  硬切：全屏红色警报 + 横向故障条 + RGB 分离抖动「别动！」；43.87 起每 5 帧一次频闪（同参考）
 *  44.81  追加「省电！」→「别动！省电！」，按拍抖动
 *  46.23 – 46.76  红色阶梯式退去（同频闪节奏），大字变灰并模糊消失
 *  46.72  标题「省电本能」逐字；47.65 红色下划线自左画出
 *  48.14  「省力本能 压过了 前额叶」；49.20「于是，你又躺下了。」；49.60 分隔线 + 49.70 脚注
 *  51.30 – 51.733  章节转场：线性淡出 + 整体上移 15px + 渐虚（与参考逐帧一致，跨过 51.6；03 章内容 51.95 才出现）
 */
(function () {
  const { E } = V;
  const START = 35.5, END = 51.6;

  /* ---------- 几何（取自参考视频同一时刻测量） ---------- */
  const RX = 413, LX = 866, DY = 313; // 两个点的中心
  const DOT_R = 36; // 圆点半径
  const RING_R = 71, LRING_R = 73; // 外环半径
  const TAKE_T = 43.76; // 红色警报硬切
  const TAKE2_T = 44.81; // 「省电！」追加
  const TITLE_T = 46.72;
  const FOOT_T = V.beat(106); // ≈49.70 脚注（「于是，你又躺下了。」49.78 出齐之后）
  // 章节转场（参考五处章节切换完全相同，逐帧实测）：以 M 为中点，M-0.2 → M+0.233 近似线性淡出，
  // M-0.17 → M+0.15 整体上移 15px（smoothstep），越到后面越虚。本章 M = 51.5（参考 51.733 清空）
  const XF_M = 51.5, XF_END = XF_M + 0.25;
  const xfade = (t, M) => {
    const p = V.prog(t, M - 0.2, 0.433), q = V.prog(t, M - 0.17, 0.32);
    return { p, o: 1 - p, y: -15 * q * q * (3 - 2 * q), blur: 6 * p * p };
  };
  const GROW_T = 41.8; // 红点开始膨胀（参考：41.8 → 43.6 近似匀速变大）
  const GROW_D = 1.8;
  const KICK_T = 42.22; // 「本能」重音（≈第 90 拍）
  const RIPPLE_T = [42.22, 42.68, 43.15, 43.62]; // 涟漪发射时刻（≈拍点）

  /* ---------- 样式（c02- 前缀） ---------- */
  const css = `
  .c02-layer { position:absolute; inset:0; }
  .c02-dot { position:absolute; border-radius:50%; }
  .c02-dot.red { background:radial-gradient(circle at 50% 50%, #ff4a3e 0%, #ff3a31 62%, #f2332c 100%);
    box-shadow:0 0 18px rgba(255,52,42,.95), 0 0 46px rgba(255,40,40,.6); }
  .c02-dot.lime { background:radial-gradient(circle at 50% 50%, #ddff4a 0%, #d2fb3c 62%, #c4ef34 100%);
    box-shadow:0 0 18px rgba(210,250,60,.85), 0 0 42px rgba(200,245,60,.42); }
  .c02-halo { position:absolute; border-radius:50%; }
  /* closest-side：辉光半径 = 元素半径（参考里是贴着圆点的一团光，而不是半屏的泛光） */
  .c02-halo.red { background:radial-gradient(circle closest-side, rgba(255,40,36,.36) 0%, rgba(225,30,30,.22) 30%, rgba(185,20,24,.09) 62%, rgba(180,20,24,0) 100%); }
  .c02-halo.lime { background:radial-gradient(circle closest-side, rgba(205,245,60,.40) 0%, rgba(178,218,50,.25) 30%, rgba(140,170,40,.08) 62%, rgba(140,170,40,0) 100%); }
  .c02-wash { position:absolute; inset:0; background:radial-gradient(ellipse 62% 78% at 50% 48%, rgba(120,30,36,.17) 0%, rgba(100,24,32,.11) 45%, rgba(70,14,24,0) 100%); }
  .c02-bloom { position:absolute; inset:0; background:radial-gradient(ellipse 42% 48% at 50% 47%, rgba(140,24,26,.24) 0%, rgba(120,20,22,.09) 50%, rgba(120,20,22,0) 100%); }
  .c02-lab { font-size:36px; letter-spacing:.02em; color:#f4f0ea; text-shadow:0 0 14px rgba(255,245,235,.18); }
  .c02-lab.lime { color:#d2f73e; text-shadow:0 0 16px rgba(200,245,60,.38), 0 0 3px rgba(215,255,90,.5); }
  .c02-sub { font-size:19px; color:#8f8a84; font-weight:500; letter-spacing:.04em; }
  .c02-cap1 { font-size:24px; color:#9a9590; font-weight:500; letter-spacing:.05em; }
  /* 宋体文案 44px：与 01 / 05 的同类文案一致（参考逐字比对 ≈ 41px × 1.07） */
  .c02-cap2 { font-size:44px; letter-spacing:.01em; color:#f4f0ea; text-shadow:0 0 18px rgba(255,245,235,.14); }

  /* 红色警报 */
  .c02-abg { position:absolute; inset:0;
    background:radial-gradient(ellipse 72% 82% at 54% 46%, #942a25 0%, #85221f 30%, #6a1a19 58%, #461112 86%, #380d0f 100%); }
  .c02-ahot { position:absolute; inset:0;
    background:radial-gradient(ellipse 55% 65% at 58% 44%, rgba(214,58,50,.75) 0%, rgba(190,44,40,.35) 45%, rgba(190,44,40,0) 80%); }
  .c02-scan { position:absolute; inset:0; opacity:.2;
    background:repeating-linear-gradient(to bottom, rgba(0,0,0,.16) 0px, rgba(0,0,0,.16) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px); }
  /* 不规则的竖向色块（参考里的数字故障「像素列」），随频闪每 5 帧重排 */
  .c02-col { position:absolute; top:0; bottom:0; }
  /* 横向故障条：柔边的暗带 + 少量细线 + 一条错位的亮条 */
  .c02-band { position:absolute; left:0; background:linear-gradient(to bottom, rgba(34,5,7,0) 0%, rgba(34,5,7,.6) 26%, rgba(26,3,5,.72) 58%, rgba(255,120,104,.07) 86%, rgba(34,5,7,0) 100%); }
  .c02-band.thin { background:rgba(30,4,6,.55); }
  .c02-band.lit { background:linear-gradient(to bottom, rgba(255,110,96,0), rgba(255,110,96,.075) 30%, rgba(255,110,96,.075) 70%, rgba(255,110,96,0)); }
  .c02-big { position:absolute; left:0; top:0; white-space:nowrap; font-family:'NSerif',serif; font-weight:900;
    font-size:159px; line-height:1; letter-spacing:-.025em; }
  .c02-big.w { color:#f3eee8; }
  .c02-big.c { color:#19c4bc; }
  .c02-big.r { color:#ff2236; }
  .c02-avig { position:absolute; inset:0; background:radial-gradient(ellipse 80% 85% at 50% 48%, rgba(0,0,0,0) 55%, rgba(20,0,0,.45) 100%); }

  /* 标题段 */
  .c02-title { font-size:92px; letter-spacing:.01em; color:#f3ece8;
    text-shadow:0 0 12px rgba(255,242,236,.6), 0 0 32px rgba(255,236,228,.3), 0 6px 18px rgba(0,0,0,.55); }
  .c02-uline { position:absolute; height:4px; border-radius:2px; background:#ff3434;
    box-shadow:0 0 10px rgba(255,45,45,.85), 0 0 2px #ff6b5e; transform-origin:left center; }
  .c02-l2 { font-size:32px; font-weight:700; letter-spacing:.02em; }
  .c02-l2 .r { color:#ff3a36; text-shadow:0 0 12px rgba(255,40,40,.35); }
  .c02-l2 .c02-mid { color:#a59d99; }
  .c02-l2 .w { color:#f4efe9; }
  .c02-l3 { font-size:24px; color:#958f8a; font-weight:500; letter-spacing:.05em; }
  .c02-foot { font-size:16px; color:#857f79; font-weight:500; letter-spacing:.05em; }
  .c02-fline { position:absolute; height:1px; background:linear-gradient(to right, rgba(140,130,125,0), rgba(140,130,125,.45), rgba(140,130,125,0)); }
  `;
  V.el('style', { text: css, parent: document.head });

  const cssPx = (v) => v.toFixed(2) + 'px';

  /* =====================================================================
   * A：两个点 35.5 – 43.95
   * ===================================================================== */
  let A = {};
  V.addScene({
    id: 'c02-dots', start: START, end: 43.95,
    build(root) {
      A.wash = V.el('div', { cls: 'c02-wash', parent: root, style: { opacity: 0 } });
      A.bloom = V.el('div', { cls: 'c02-bloom', parent: root, style: { opacity: 0 } });
      A.wrap = V.el('div', { cls: 'c02-layer', parent: root });
      const mk = (cls, size, x, y) => {
        const e = V.el('div', { cls, parent: A.wrap, style: { width: size + 'px', height: size + 'px' } });
        V.place(e, x, y, 'c');
        return e;
      };
      A.rHalo = mk('c02-halo red', 400, RX, DY);
      A.lHalo = mk('c02-halo lime', 400, LX, DY);

      // SVG：外环 / 涟漪 / 虚线
      A.svg = V.svgLayer(A.wrap);
      A.link = V.svg('line', { x1: RX, y1: DY, x2: RX, y2: DY, stroke: 'rgba(225,205,200,.30)', 'stroke-width': 1.1, 'stroke-dasharray': '5 6' }, A.svg);
      A.rRing = V.svg('circle', { cx: RX, cy: DY, r: RING_R, fill: 'none', stroke: 'rgba(255,72,62,.62)', 'stroke-width': 1.3 }, A.svg);
      A.rRing2 = V.svg('circle', { cx: RX, cy: DY, r: RING_R, fill: 'none', stroke: 'rgba(255,72,62,.5)', 'stroke-width': 1.1 }, A.svg);
      A.rOuter = V.svg('circle', { cx: RX, cy: DY, r: 215, fill: 'none', stroke: 'rgba(255,60,52,.22)', 'stroke-width': 1.1, 'stroke-dasharray': '46 9 120 14 70 7' }, A.svg);
      A.lRing = V.svg('circle', { cx: LX, cy: DY, r: LRING_R, fill: 'none', stroke: 'rgba(206,246,70,.55)', 'stroke-width': 1.3 }, A.svg);
      A.ripples = RIPPLE_T.map(() => V.svg('circle', { cx: RX, cy: DY, r: 40, fill: 'none', stroke: 'rgba(255,66,56,.5)', 'stroke-width': 1.2 }, A.svg));
      A.svg.style.filter = 'drop-shadow(0 0 3px rgba(255,60,50,.35))';

      A.rDot = mk('c02-dot red', DOT_R * 2, RX, DY);
      A.lDot = mk('c02-dot lime', DOT_R * 2, LX, DY);

      A.rLab = new V.Text(A.wrap, '省力本能', { cls: 'serif c02-lab', x: RX, y: 430 });
      A.rSub = new V.Text(A.wrap, '演化留下的默认倾向', { cls: 'c02-sub', x: RX, y: 471 });
      A.lLab = new V.Text(A.wrap, '前额叶', { cls: 'serif c02-lab lime', x: LX, y: 430 });
      A.lSub = new V.Text(A.wrap, '负责计划和自控', { cls: 'c02-sub', x: LX, y: 471 });

      A.c1a = new V.Text(A.wrap, '想起身时，', { cls: 'c02-cap1', x: 640, y: 574 });
      A.c1b = new V.Text(A.wrap, '两个你在拔河。', { cls: 'serif c02-cap2', x: 640, y: 631 });
      A.c2a = new V.Text(A.wrap, '越是疲惫，', { cls: 'c02-cap1', x: 640, y: 574 });
      A.c2b = new V.Text(A.wrap, '<r>本能</r>越容易赢。', { cls: 'serif c02-cap2', x: 640, y: 631 });
      A.instinct = A.c2b.el.querySelector('.r');
      A.instinct.style.display = 'inline-block';
    },
    update(lt, t) {
      // 开场辉光（35.55 – 36.7）
      const bl = V.ep(t, 35.55, 0.4, E.inOutSine) * (1 - V.ep(t, 36.0, 0.55, E.inOutSine));
      A.bloom.style.opacity = bl.toFixed(3);
      A.wash.style.opacity = V.ep(t, 35.6, 1.0, E.inOutSine).toFixed(3);

      /* ---- 红点 ---- */
      const rIn = V.ep(t, 36.24, 0.52, E.inOutSine);
      const gp = V.prog(t, GROW_T, GROW_D);
      const grow = 0.25 * E.inOutSine(gp) + 0.75 * gp; // 0→1 膨胀（近似匀速，两端略缓）
      // 呼吸：两拍一个周期
      const breath = Math.sin(((t - 36.7) / (V.BEAT * 2)) * Math.PI * 2);
      const rScale = (1 + 0.04 * breath * (1 - grow)) * V.lerp(1, 1.97, grow);
      V.set(A.rDot, { o: rIn, s: rScale * V.lerp(0.8, 1, rIn), blur: (1 - rIn) * 9, bright: V.lerp(0.55, 1, rIn) });
      const haloIn = V.ep(t, 36.45, 0.8, E.outCubic);
      V.set(A.rHalo, { o: haloIn * (0.85 + 0.15 * breath * (1 - grow)) * V.lerp(1, 1.25, grow), s: V.lerp(0.7, 1, haloIn) * V.lerp(1, 1.55, grow) });

      const rRingIn = V.ep(t, 36.7, 0.5, E.outCubic); // 参考 ≈36.75 外环已隐约可见
      const ringR = (V.lerp(RING_R * 0.72, RING_R, rRingIn) + 1.5 * breath * (1 - grow)) * V.lerp(1, 2.0, grow);
      A.rRing.setAttribute('r', ringR.toFixed(2));
      A.rRing.setAttribute('opacity', (rRingIn * V.lerp(1, 0.9, grow)).toFixed(3));
      // 第二道环（膨胀后出现的双环）
      const r2 = ringR * V.lerp(1, 0.94, grow) - 2;
      A.rRing2.setAttribute('r', Math.max(1, r2).toFixed(2));
      A.rRing2.setAttribute('opacity', (V.ep(t, KICK_T + 0.3, 0.5) * 0.85).toFixed(3));
      // 外层虚环（缓慢旋转）
      const oIn = V.ep(t, KICK_T + 0.2, 0.9, E.outCubic);
      A.rOuter.setAttribute('r', (V.lerp(150, 215, oIn)).toFixed(2));
      A.rOuter.setAttribute('opacity', (oIn * 0.9).toFixed(3));
      A.rOuter.setAttribute('transform', `rotate(${((t - KICK_T) * 14).toFixed(2)} ${RX} ${DY})`);

      // 涟漪：每拍一圈，从红点边缘扩散到 ~260 并消失
      const dotR = DOT_R * rScale;
      RIPPLE_T.forEach((t0, i) => {
        const c = A.ripples[i];
        const p = V.prog(t, t0, 1.25);
        if (p <= 0 || p >= 1) { c.setAttribute('opacity', 0); return; }
        const r = V.lerp(dotR + 6, 265, E.outCubic(p));
        c.setAttribute('r', r.toFixed(2));
        c.setAttribute('opacity', (0.75 * (1 - E.inQuad(p))).toFixed(3));
      });

      /* ---- 荧光绿点 ---- */
      const lIn = V.ep(t, 37.12, 0.6, E.outCubic);
      const shrink = V.ep(t, GROW_T, 1.6, E.outQuad);
      const lBreath = Math.sin(((t - 37.6) / (V.BEAT * 2)) * Math.PI * 2 + 1.3);
      const lScale = (1 + 0.035 * lBreath * (1 - shrink)) * V.lerp(1, 0.5, shrink) * V.lerp(0.82, 1, lIn);
      V.set(A.lDot, { o: lIn, s: lScale, blur: (1 - lIn) * 9, bright: V.lerp(0.5, 1, lIn) });
      if (shrink > 0.001) A.lDot.style.filter = `brightness(${V.lerp(1, 0.74, shrink).toFixed(3)}) saturate(${V.lerp(1, 0.8, shrink).toFixed(3)})`;
      const lHaloIn = V.ep(t, 37.3, 0.8, E.outCubic);
      V.set(A.lHalo, { o: lHaloIn * V.lerp(1, 0.25, shrink), s: V.lerp(0.7, 1, lHaloIn) * V.lerp(1, 0.6, shrink) });
      const lRingIn = V.ep(t, 37.28, 0.5, E.outCubic); // 参考：外环随圆点一起出现（≈37.3）
      const lRingR = V.lerp(LRING_R * 0.75, LRING_R, lRingIn) * V.lerp(1, 0.51, shrink) + 1.2 * lBreath * (1 - shrink);
      A.lRing.setAttribute('r', lRingR.toFixed(2));
      A.lRing.setAttribute('opacity', (lRingIn * V.lerp(1, 0.75, shrink)).toFixed(3));

      /* ---- 虚线连线：从红环外沿到绿环外沿（37.6 自左向右画出） ---- */
      const linkP = V.ep(t, 37.62, 0.6, E.inOutCubic);
      const x1 = RX + ringR + 8, x2end = LX - lRingR - 8;
      A.link.setAttribute('x1', x1.toFixed(2));
      A.link.setAttribute('x2', V.lerp(x1, x2end, linkP).toFixed(2));
      A.link.setAttribute('opacity', (linkP > 0.001 ? 1 : 0) * V.lerp(1, 0.75, grow));

      /* ---- 标签：参考里文案①先退（41.12），两点标签随后（41.26）模糊淡出 ---- */
      const OUT1 = 41.12, OUT_LAB = 41.26;
      A.rLab.anim(t, 36.52, OUT_LAB, { stagger: 0.055, dur: 0.36, blur: 10, dy: 6, outDur: 0.36 });
      A.rSub.anim(t, 36.86, OUT_LAB, { stagger: 0.035, dur: 0.32, blur: 8, dy: 4, outDur: 0.36 });
      A.lLab.anim(t, 37.52, OUT_LAB, { stagger: 0.065, dur: 0.38, blur: 10, dy: 6, outDur: 0.36 });
      A.lSub.anim(t, 37.95, OUT_LAB, { stagger: 0.04, dur: 0.32, blur: 8, dy: 4, outDur: 0.36 });

      /* ---- 文案 ---- */
      A.c1a.anim(t, 38.44, OUT1, { stagger: 0.035, dur: 0.32, blur: 8, dy: 6, outDur: 0.32 });
      A.c1b.anim(t, 38.64, OUT1, { stagger: 0.055, dur: 0.36, blur: 12, dy: 8, outDur: 0.32 });
      A.c2a.anim(t, 41.42, null, { stagger: 0.03, dur: 0.32, blur: 8, dy: 6 });
      A.c2b.anim(t, 41.72, null, { stagger: 0.05, dur: 0.36, blur: 12, dy: 8 });
      // 「本能」在红点开始膨胀时一同加重
      const kp = V.prog(t, KICK_T - 0.02, 0.5);
      const sc = 1 + 0.16 * (1 - E.outCubic(kp)) * (kp > 0 ? 1 : 0);
      A.instinct.style.transform = sc !== 1 ? `scale(${sc.toFixed(4)})` : 'none';
      const glow = 1 - E.outCubic(V.prog(t, KICK_T, 1.2));
      A.instinct.style.textShadow = `0 0 ${(18 + 20 * glow * (t >= KICK_T ? 1 : 0)).toFixed(1)}px rgba(255,40,40,${(0.55 + 0.35 * glow * (t >= KICK_T ? 1 : 0)).toFixed(3)}), 0 0 4px rgba(255,70,60,.8)`;
    },
  });

  /* =====================================================================
   * B：红色警报 43.76 – 46.8
   * ===================================================================== */
  const B = {};
  const BAND_N = 5, COL_N = 12;
  const TXT_X = 640, TXT_Y = 359; // 「别动！省电！」整行居中（「别动！」单独出现时自然落在左侧）
  const STROBE0 = 1316; // 参考：自 43.867s（第 1316 帧）起每 5 帧一次亮闪
  // 退场：与频闪同步的阶梯式变暗（参考实测 46.23 / 46.40 / 46.57 / 46.70）
  const DIM_STEPS = [[46.23, 0.8], [46.39, 0.6], [46.56, 0.38], [46.69, 0.16], [46.76, 0]];
  V.addScene({
    id: 'c02-alarm', start: TAKE_T - 0.001, end: 46.8,
    build(root) {
      B.root = root;
      B.bg = V.el('div', { cls: 'c02-layer', parent: root });
      V.el('div', { cls: 'c02-abg', parent: B.bg });
      B.hot = V.el('div', { cls: 'c02-ahot', parent: B.bg });
      B.cols = [];
      for (let i = 0; i < COL_N; i++) B.cols.push(V.el('div', { cls: 'c02-col', parent: B.bg }));
      V.el('div', { cls: 'c02-avig', parent: B.bg });
      // 0–1：柔边暗带；2–3：细线；4：错位亮条
      B.bands = [];
      for (let i = 0; i < BAND_N; i++) B.bands.push(V.el('div', { cls: 'c02-band' + (i === 2 || i === 3 ? ' thin' : i === 4 ? ' lit' : ''), parent: B.bg }));
      V.el('div', { cls: 'c02-scan', parent: B.bg });

      // 文字：青 / 红 两层错位 + 白色主体（拆成上 / 中 / 下三段，中段可横向撕裂）
      B.txt = V.el('div', { cls: 'c02-layer', parent: root });
      const html = '别动！<span class="c02-p2">省电！</span>';
      const mk = (cls) => {
        const e = V.el('div', { cls: 'c02-big ' + cls, html, parent: B.txt });
        V.place(e, TXT_X, TXT_Y, 'c');
        return e;
      };
      B.cy = mk('c');
      B.rd = mk('r');
      B.wp = [mk('w'), mk('w'), mk('w')];
      B.p2 = [B.cy, B.rd, ...B.wp].map((e) => e.querySelector('.c02-p2'));
      B.lastSeg = -99;
    },
    update(lt, t) {
      const fr = Math.round(t * 30);
      // 进场：硬切；参考里前 3 帧底下的两个点和文案仍逐帧变淡地透出来
      const fo = fr - Math.round(TAKE_T * 30);
      const inA = fo <= 0 ? 0.66 : fo === 1 ? 0.8 : fo === 2 ? 0.92 : 1;
      // 频闪：每 5 帧一次（亮 → 半亮 → 正常）
      const ph = fr - STROBE0;
      const strobe = ph < 0 ? 0 : (ph % 5 === 0 ? 1 : ph % 5 === 1 ? 0.45 : 0);
      // 退场阶梯
      let lvl = 1;
      for (const [ts, v] of DIM_STEPS) if (t >= ts) lvl = v;
      const dimming = t >= DIM_STEPS[0][0];
      B.bg.style.opacity = (inA * lvl).toFixed(3);
      const br = 1 + (dimming ? 0.25 : 0.42) * strobe;
      B.bg.style.filter = br > 1.001 ? `brightness(${br.toFixed(3)})` : 'none';
      const breathe = 0.5 + 0.5 * Math.sin((t - TAKE_T) * 2.3);
      B.hot.style.opacity = (0.3 + 0.25 * breathe).toFixed(3);

      // 故障条：每 5 帧（随频闪）重新排布
      const seg = ph < 0 ? -1 : Math.floor(ph / 5);
      if (seg !== B.lastSeg) {
        B.lastSeg = seg;
        const r = V.rng((seg + 7) * 7919 + 211);
        B.bands.forEach((b, i) => {
          const thin = i === 2 || i === 3, lit = i === 4;
          const on = i < 2 || r() < (thin ? 0.5 : 0.6);
          b.style.display = on ? '' : 'none';
          if (!on) return;
          const y = 40 + r() * 620;
          const h = thin ? 1.5 + r() * 1.5 : lit ? 16 + r() * 26 : 10 + r() * 16;
          const full = i < 2 || r() < 0.45;
          const x0 = full ? 0 : r() * 520;
          const w = full ? 1280 : 360 + r() * 760;
          b.style.top = y.toFixed(1) + 'px';
          b.style.height = h.toFixed(1) + 'px';
          b.style.left = x0.toFixed(1) + 'px';
          b.style.width = w.toFixed(1) + 'px';
          b.style.opacity = (thin ? 0.45 + r() * 0.35 : 0.65 + r() * 0.35).toFixed(3);
        });
        // 竖向色块：宽窄不一，多数偏暗、少数偏亮
        let x = -20 + r() * 60;
        B.cols.forEach((c) => {
          const w = 28 + r() * 120;
          const gap = 10 + r() * 110;
          const dark = r() < 0.7;
          const a = dark ? 0.04 + r() * 0.1 : 0.02 + r() * 0.035;
          c.style.left = x.toFixed(1) + 'px';
          c.style.width = w.toFixed(1) + 'px';
          c.style.background = dark ? `rgba(20,0,2,${a.toFixed(3)})` : `rgba(255,120,104,${a.toFixed(3)})`;
          x += w + gap;
        });
      }

      // 文字
      const show2 = t >= TAKE2_T;
      for (const s of B.p2) s.style.visibility = show2 ? 'visible' : 'hidden';
      const rr = V.rng(fr * 104729 + 17);
      const k1 = 1 - E.outCubic(V.prog(t, TAKE_T, 0.25));
      const k2 = 1 - E.outCubic(V.prog(t, TAKE2_T, 0.25));
      const burst = Math.max(k1, k2, strobe * 0.6);
      const jx = (rr() - 0.5) * (1.6 + 9 * burst);
      const jy = (rr() - 0.5) * (0.8 + 3 * burst);
      const pop = 1 + 0.05 * k1 + 0.03 * k2;
      const sx = 3.4 + 3.5 * burst + rr() * 1.2;
      const sy = 1.8 + 1.5 * burst;
      // 退场：白字随阶梯变灰，最后模糊消失
      const txtA = dimming ? V.lerp(0.42, 1, V.clamp((lvl - 0.38) / 0.62)) : 1;
      const txtOut = V.ep(t, 46.56, 0.16, E.inCubic); // 参考 46.67 仍是灰字，46.73 已消失（标题 46.72 进场前清空）
      const ghost = (dimming ? V.clamp((lvl - 0.6) / 0.4) : 1) * (1 - txtOut);
      const blur = txtOut * 9;
      // 撕裂：频闪亮帧 / 进场 / 追加时出现
      const tear = !dimming && (burst > 0.55 || rr() < 0.08);
      const a = tear ? 18 + rr() * 50 : 50, hgt = tear ? 6 + rr() * 12 : 0;
      const tdx = tear ? (rr() < 0.5 ? -1 : 1) * (8 + rr() * (8 + 16 * burst)) : 0;
      // 不撕裂时只用一层完整的白字（分段裁切的接缝会留下一条细线）
      const clips = tear
        ? [`inset(0 0 ${(100 - a).toFixed(2)}% 0)`, `inset(${a.toFixed(2)}% 0 ${(100 - a - hgt).toFixed(2)}% 0)`, `inset(${(a + hgt).toFixed(2)}% 0 0 0)`]
        : ['none', 'none', 'none'];
      B.wp.forEach((e, i) => {
        if (e._clip !== clips[i]) { e.style.clipPath = clips[i]; e._clip = clips[i]; }
        V.set(e, { x: jx + (i === 1 ? tdx : 0), y: jy, s: pop, o: (tear || i === 0 ? 1 : 0) * (1 - txtOut), blur });
        e.style.color = txtA < 0.999 ? `rgba(243,238,232,${txtA.toFixed(3)})` : '';
      });
      V.set(B.cy, { x: jx - sx, y: jy + sy, s: pop, o: 0.92 * ghost, blur: blur + 0.5 });
      V.set(B.rd, { x: jx + sx * 0.75, y: jy - sy * 0.4, s: pop, o: 0.92 * ghost, blur: blur + 0.5 });
    },
  });

  /* =====================================================================
   * C：省电本能 46.6 – 51.6
   * ===================================================================== */
  const C = {};
  V.addScene({
    id: 'c02-title', start: 46.6, end: XF_END,
    build(root) {
      C.wash = V.el('div', { cls: 'c02-wash', parent: root, style: { opacity: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 56%, rgba(120,30,36,.18) 0%, rgba(100,24,32,.12) 45%, rgba(70,14,24,0) 100%)' } });
      C.wrap = V.el('div', { cls: 'c02-layer', parent: root });
      C.title = new V.Text(C.wrap, '省电本能', { cls: 'serif c02-title', x: 640, y: 286 });
      C.uline = V.el('div', { cls: 'c02-uline', parent: C.wrap });
      C.l2 = new V.Text(C.wrap, '<r>省力本能</r> <d class="c02-mid">压过了</d> <w>前额叶</w>', { cls: 'c02-l2', x: 640, y: 428 });
      for (const c of C.l2.chars) if (c.textContent === ' ') c.style.width = '17px'; // 词间留白与参考一致
      C.l3 = new V.Text(C.wrap, '于是，你又躺下了。', { cls: 'c02-l3', x: 640, y: 494 });
      C.fline = V.el('div', { cls: 'c02-fline', parent: C.wrap });
      C.foot = new V.Text(C.wrap, '脑电实验发现：躲开「躺着」的画面，比躲开「运动」的画面更费脑力。', { cls: 'c02-foot', x: 644, y: 600 });
    },
    update(lt, t) {
      if (C.title.el.offsetWidth !== C.uw) { // 字体加载前后字宽不同：宽度变化时重新排版
        C.uw = C.title.el.offsetWidth;
        const w = C.uw - 6;
        C.uline.style.left = (640 - w / 2).toFixed(1) + 'px';
        C.uline.style.top = '354px';
        C.uline.style.width = w.toFixed(1) + 'px';
        const fw = 360;
        C.fline.style.left = (640 - fw / 2) + 'px';
        C.fline.style.top = '570px';
        C.fline.style.width = fw + 'px';
      }
      C.title.reveal(t, TITLE_T, { stagger: 0.075, dur: 0.4, blur: 14, dy: 0, scale: 1.08 });
      const up = V.ep(t, 47.62, 0.36, E.inOutCubic);
      C.uline.style.transform = `scaleX(${up.toFixed(4)})`;
      C.uline.style.opacity = up > 0.001 ? 1 : 0;
      C.l2.reveal(t, 48.14, { stagger: 0.045, dur: 0.32, blur: 9, dy: 6 }); // 参考首字 ≈48.15
      C.l3.reveal(t, 49.2, { stagger: 0.032, dur: 0.32, blur: 8, dy: 5 });
      C.foot.reveal(t, FOOT_T, { stagger: 0.014, dur: 0.32, blur: 6, dy: 4 }); // 32 字：提早到第 106 拍并加快逐字节奏，保证退场前约 1 秒可读
      const fl = V.ep(t, FOOT_T - 0.1, 0.6, E.inOutCubic);
      C.fline.style.opacity = (fl * 0.9).toFixed(3);
      C.fline.style.transform = `scaleX(${fl.toFixed(4)})`;

      // 标题持续极缓慢推近；结尾整体模糊淡出
      const xf = xfade(t, XF_M), out = xf.p;
      const drift = 1 + 0.012 * V.ep(t, TITLE_T, 4.5, E.outSine);
      V.set(C.wrap, { o: xf.o, blur: xf.blur, y: xf.y, s: drift * (1 + 0.015 * out) });
      C.wash.style.opacity = (V.ep(t, 46.6, 0.5, E.inOutSine) * (1 - out)).toFixed(3);
    },
  });
})();
