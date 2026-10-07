/* 05 解法 83.6 – 110.2（荧光绿章节；所有时间点均按参考视频逐帧实测对齐）
 *  A 83.93 – 88.13  听起来反直觉，但答案是： → 85.05 重拍（第 182 拍）荧光绿巨字「先动起来。」+ 镜头轻震
 *  B 88.15 – 92.18  计时环 00:00 → 05:00（88.62–91.45 inOutCubic，与参考计数曲线一致）+ 只动 5 分钟 / 副标题 / 脚注 + 出处小字
 *  C 92.24 – 96.34  ① 给它一个具体计划 → 三个红色胶囊依次弹出 → 写清：哪天、几点、先做哪一步， / 脑子才更容易把它放下。
 *  D 96.35 – 100.72 ② 把第一步缩到可笑：左右两列 灰字 → 红线划掉 → 箭头 → 荧光绿新任务；100.37 起与顶部章节标记一起上移淡出
 *  E 100.74 – 102.8 红色圆环 + 白色光点绕行 → 101.96 断裂成碎片爆散 → 102.34 荧光绿播放键弹出
 *  F 103.1 – 110.2  ▶ 现在，放下手机。/ 站起来，去做那件事的第一步。/ 脚注 + 就医提示小字；109.78 起整体模糊变暗（引擎淡出到黑）
 */
(function () {
  const { E } = V;

  /* ---------- 背景辉光（> 83.6 的关键帧归本文件管理） ----------
   * 参考：84–85 近乎中性的暗色 → 85.0 重拍时橄榄绿辉光升起 → ≈99.8–100.72 绿光退成中性暗底（与 D 段出场同步）
   * → 100.72–101.2 红光升起（圆环段）→ 102.5–103 回到绿色 */
  for (let i = V.bgKeys.length - 1; i >= 0; i--) if (V.bgKeys[i][0] > 83.6) V.bgKeys.splice(i, 1);
  const NEU = [70, 60, 80, 0.04, 50, 45];
  const LIME = [128, 150, 52, 0.12, 50, 42];
  const RED = [160, 36, 52, 0.09, 50, 40];
  const LIME2 = [128, 150, 52, 0.13, 50, 44];
  V.bgKeys.push(
    [84.5, ...NEU],
    [84.98, ...NEU],
    [85.5, ...LIME],
    [99.82, ...LIME],
    [100.72, ...NEU],
    [101.2, ...RED],
    [102.4, ...RED],
    [103.05, ...LIME2],
    [110.2, ...LIME2],
  );

  /* ---------- 局部样式 ---------- */
  const css = `
  .c05-grey { color:#93938a; font-weight:500; letter-spacing:.04em; }
  .c05-big { font-size:122px; color:#cff64e; letter-spacing:.01em;
    text-shadow:0 0 22px rgba(200,245,60,.62), 0 0 58px rgba(200,245,60,.26), 0 0 4px rgba(232,255,150,.9); }
  .c05-title { font-size:48px; color:#d2f55a; letter-spacing:.02em;
    text-shadow:0 0 16px rgba(200,245,60,.42), 0 0 3px rgba(225,255,120,.6); }
  .c05-title .c05-num { font-family:'NSans', sans-serif; font-weight:500; margin-right:.06em; position:relative; top:-.02em; }
  .c05-white { color:#f4f1ea; text-shadow:0 0 18px rgba(255,248,235,.14); }
  .c05-lime { color:#d0f64f; text-shadow:0 0 14px rgba(200,245,60,.62), 0 0 34px rgba(200,245,60,.24), 0 0 3px rgba(225,255,120,.75); }
  .c05-time { font-family:'NSans', sans-serif; font-weight:700; font-size:80px; color:#f6f3ec; line-height:1; white-space:nowrap;
    text-shadow:0 0 18px rgba(255,250,235,.12); }
  .c05-time .c05-dg { display:inline-block; width:.575em; text-align:center; }
  .c05-time .c05-col { display:inline-block; width:.3em; text-align:center; position:relative; top:-.06em; }
  .c05-pill { position:absolute; white-space:nowrap; padding:8px 19px 9px; border-radius:999px; border:2px solid #ff2d2d;
    background:rgba(16,8,9,.92); color:#ff3c3f; font-size:23px; font-weight:700; letter-spacing:.05em; line-height:1.4;
    box-shadow:0 0 12px rgba(255,45,45,.42), inset 0 0 9px rgba(255,45,45,.16); text-shadow:0 0 8px rgba(255,45,45,.45); }
  .c05-foot { color:#7d7b72; font-weight:500; letter-spacing:.06em; }
  .c05-foot .g { text-shadow:0 0 10px rgba(200,245,60,.45); }
  .c05-src { color:#5c5a53; font-weight:400; letter-spacing:.05em; }
  /* 参考：顶部章节标记随 D 段一起上移淡出（≈100.42–100.75），此后（圆环 / 爆散 / 结语）不再出现。
   * 引擎每帧会写 mark 的行内 opacity/filter，这里用 !important 覆盖；规则只在 c05-mk 场景显示时生效
   * （:has 匹配引擎设置的 display:block），所以任何时刻跳转/回放都是 t 的纯函数，不影响其它章节。 */
  #stage:has(> #scenes > .scene[data-id="c05-mk"][style*="block"]) #chrome .mark {
    opacity: var(--c05-mo, 1) !important; filter: var(--c05-mf, none) !important;
    transform: translateY(var(--c05-my, 0px)) !important; }
  `;
  V.el('style', { text: css, parent: document.head });

  /* ---------- 局部辉光：竖向椭圆，集中在画面中部（参考的绿色/红色辉光比引擎的横向辉光更集中） ----------
   * [时间, r, g, b, alpha]，相邻关键帧之间 smoothstep 插值 */
  const WASH = [
    [84.95, 150, 175, 60, 0],
    [85.45, 150, 175, 60, 0.11],
    [99.75, 150, 175, 60, 0.11],
    [100.71, 150, 175, 60, 0],
    [100.72, 190, 40, 58, 0],
    [101.15, 190, 40, 58, 0.15],
    [102.4, 190, 40, 58, 0.15],
    [103.0, 150, 175, 60, 0.145],
    [110.2, 150, 175, 60, 0.145],
  ];
  const washAt = (t) => {
    if (t <= WASH[0][0]) return WASH[0];
    for (let i = 0; i < WASH.length - 1; i++) {
      const a = WASH[i], b = WASH[i + 1];
      if (t < b[0]) { const k = V.prog(t, a[0], b[0] - a[0]); const s = k * k * (3 - 2 * k); return a.map((v, j) => V.lerp(v, b[j], s)); }
    }
    return WASH[WASH.length - 1];
  };
  let wash;
  V.addScene({
    id: 'c05-bg', start: 84.9, end: 110.2,
    build(root) { wash = V.el('div', { cls: 'layer', parent: root }); },
    update(lt, t) {
      const w = washAt(t);
      const key = w.map((v) => v.toFixed(3)).join();
      if (wash._k === key) return;
      wash._k = key;
      const c = `${w[1] | 0},${w[2] | 0},${w[3] | 0}`;
      wash.style.background = `radial-gradient(ellipse 470px 560px at 640px 390px, rgba(${c},${w[4].toFixed(3)}) 0%, rgba(${c},${(w[4] * 0.55).toFixed(3)}) 42%, rgba(${c},0) 100%)`;
    },
  });

  /** whole-group exit: fade (+ optional drift). 参考逐帧：本章 A/B/C 段出场约 0.37s、亮度近似线性下降，
   *  字形全程保持清晰、不位移（与上一帧的模板相关度一直 ≥0.9）→ 只留极轻的模糊 */
  const exitGroup = (el, t, s, d = 0.37, o = {}) => {
    const k = V.prog(t, s, d);
    V.set(el, { o: 1 - k, blur: k * k * (o.blur ?? 1.5), y: k * (o.dy || 0), s: 1 + k * (o.ds || 0) });
    return k;
  };

  /* =====================================================================
   * A：听起来反直觉，但答案是： → 先动起来。  83.6 – 88.15
   * ===================================================================== */
  const A_HIT = V.beat(182) + 0.05; // ≈85.05（参考 85.067 帧首次出现）
  const A_OUT = 87.75;
  let aWrap, aLine, aBig;
  V.addScene({
    id: 'c05-a', start: 83.6, end: 88.15,
    build(root) {
      aWrap = V.el('div', { cls: 'layer', parent: root });
      aLine = new V.Text(aWrap, '听起来反直觉，但答案是：', { cls: 'c05-grey', x: 640, y: 240, style: { fontSize: '26px' } });
      aBig = new V.Text(aWrap, '先动起来。', { cls: 'serif c05-big', x: 640, y: 400 });
    },
    update(lt, t) {
      aLine.reveal(t, 83.93, { stagger: 0.035, dur: 0.32, blur: 9, dy: 6 });
      // 重拍：整句瞬间出现（参考首帧清晰但只有约一半亮度、放大约 1.35 倍），约 3 帧内亮度补满并急速缩回；之后极缓慢推近
      const ap = t < A_HIT ? 0 : 0.5 + 0.5 * V.prog(t, A_HIT, 0.08);
      const zp = V.ep(t, A_HIT, 0.16, E.outCubic);
      const push = 1 + 0.018 * V.ep(t, A_HIT + 0.2, 2.6, E.outSine);
      V.set(aBig.el, { o: ap, s: V.lerp(1.4, 1, zp) * push, blur: (1 - zp) * 3 });
      // 重拍瞬间的辉光爆亮，随后回落
      const gl = 1 - V.ep(t, A_HIT + 0.05, 0.9, E.outCubic);
      if (aBig._gl !== gl) {
        aBig._gl = gl;
        aBig.el.style.textShadow = `0 0 ${(22 + 26 * gl).toFixed(1)}px rgba(200,245,60,${(0.62 + 0.3 * gl).toFixed(3)}), 0 0 ${(58 + 40 * gl).toFixed(1)}px rgba(200,245,60,${(0.26 + 0.2 * gl).toFixed(3)}), 0 0 4px rgba(232,255,150,.9)`;
      }
      // 镜头轻微震动（参考 85.03–85.2）
      const u = t - (A_HIT - 0.01);
      const sh = u > 0 ? Math.exp(-u * 16) : 0;
      const k = exitGroup(aWrap, t, A_OUT, 0.38);
      if (k <= 0) V.set(aWrap, { x: sh * 5 * Math.sin(u * 55), y: sh * 4 * Math.sin(u * 47 + 1.2) });
    },
  });

  /* =====================================================================
   * B：计时环 00:00 → 05:00  88.1 – 92.15
   * ===================================================================== */
  const RC = { x: 427, y: 373, r: 149 };
  const B_CNT0 = 88.62, B_CNT1 = 91.45, B_OUT = 91.77, B_TOTAL = 300; // 5 分钟
  let bWrap, bSvg, bTrack, bArcG, bArc, bHead, bTime, bDigits, bTitle, bSub, bFoot, bSrc, bGlow;
  V.addScene({
    id: 'c05-b', start: 88.1, end: 92.15,
    build(root) {
      bWrap = V.el('div', { cls: 'layer', parent: root });
      // 环内淡淡的绿色辉光（完成时略亮）
      bGlow = V.el('div', { parent: bWrap, style: { position: 'absolute', left: RC.x - 210 + 'px', top: RC.y - 210 + 'px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,245,60,.10) 0%, rgba(200,245,60,.04) 45%, rgba(200,245,60,0) 70%)', opacity: 0 } });
      bSvg = V.svgLayer(bWrap);
      bTrack = V.svg('circle', { cx: RC.x, cy: RC.y, r: RC.r, fill: 'none', stroke: 'rgba(225,225,205,.17)', 'stroke-width': 1.6 }, bSvg);
      bArcG = V.svg('g', {}, bSvg);
      bArcG.style.filter = 'drop-shadow(0 0 7px rgba(200,245,60,.75))';
      bArc = V.svg('path', { d: `M ${RC.x} ${RC.y - RC.r} A ${RC.r} ${RC.r} 0 1 1 ${RC.x - 0.01} ${RC.y - RC.r}`, fill: 'none', stroke: '#cdf54a', 'stroke-width': 8, 'stroke-linecap': 'round' }, bArcG);
      bHead = V.svg('circle', { cx: RC.x, cy: RC.y - RC.r, r: 3.4, fill: '#d6ff5c' }, bArcG);
      // 计时数字：每位固定宽度，计数时不抖动
      bTime = V.el('div', { cls: 'c05-time', parent: bWrap });
      V.place(bTime, RC.x, RC.y - 1, 'c');
      bDigits = [];
      for (let i = 0; i < 5; i++) {
        const s = V.el('span', { cls: i === 2 ? 'c05-col' : 'c05-dg', text: i === 2 ? ':' : '0', parent: bTime });
        bDigits.push(s);
      }
      bTitle = new V.Text(bWrap, '只动 5 分钟', { cls: 'serif c05-white', x: 668, y: 326, anchor: 'l', style: { fontSize: '56px', letterSpacing: '.01em' } });
      bSub = new V.Text(bWrap, '不求做完 · 不求做好 · 先让身体醒过来', { cls: 'c05-grey', x: 669, y: 398, anchor: 'l', style: { fontSize: '21px', letterSpacing: '.05em' } });
      bFoot = new V.Text(bWrap, '研究：低强度运动 6 周，疲劳感下降约 <g>65%</g>', { cls: 'c05-foot', x: 669, y: 445, anchor: 'l', style: { fontSize: '16px', color: '#85847b' } });
      bSrc = new V.Text(bWrap, '佐治亚大学 2008 · 36 名久坐、常感疲劳的年轻人 · 每周 3 次 × 20 分钟', { cls: 'c05-src', x: 670, y: 470, anchor: 'l', style: { fontSize: '12.5px' } });
    },
    update(lt, t) {
      // 入场：数字模糊淡入，顶部光点，轨道环
      const tp = V.ep(t, 88.15, 0.3, E.outCubic);
      V.set(bTime, { o: tp, blur: (1 - tp) * 8, s: V.lerp(0.96, 1, tp) });
      const trk = V.ep(t, 88.2, 0.2, E.outCubic);
      bTrack.setAttribute('opacity', trk.toFixed(3));
      V.set(bSvg, { s: V.lerp(0.97, 1, trk) });
      bSvg.style.transformOrigin = `${RC.x}px ${RC.y}px`;
      bHead.setAttribute('opacity', V.ep(t, 88.15, 0.2).toFixed(3));

      // 计数（与参考同一条缓动曲线）
      const p = E.inOutCubic(V.prog(t, B_CNT0, B_CNT1 - B_CNT0));
      V.draw(bArc, p);
      const sec = Math.min(B_TOTAL, Math.floor(p * B_TOTAL + 1e-6));
      const mm = Math.floor(sec / 60), ss = sec % 60;
      const str = [Math.floor(mm / 10), mm % 10, ':', Math.floor(ss / 10), ss % 10];
      for (let i = 0; i < 5; i++) if (i !== 2 && bDigits[i].textContent !== String(str[i])) bDigits[i].textContent = String(str[i]);
      // 完成瞬间：辉光轻轻一亮
      const done = V.prog(t, B_CNT1 - 0.05, 0.08) * (1 - V.ep(t, B_CNT1 + 0.03, 0.6, E.outCubic));
      bArcG.style.filter = `drop-shadow(0 0 ${(9 + 7 * done).toFixed(1)}px rgba(200,245,60,${(0.85 + 0.15 * done).toFixed(3)}))`;
      bGlow.style.opacity = (V.ep(t, 88.3, 0.5) * (0.5 + 0.5 * p) + 0.5 * done).toFixed(3);

      // 右侧文字
      bTitle.reveal(t, 88.7, { stagger: 0.065, dur: 0.36, blur: 12, dy: 6 });
      bSub.reveal(t, 89.38, { stagger: 0.03, dur: 0.4, blur: 8, dy: 5 });
      bFoot.reveal(t, 90.0, { stagger: 0.018, dur: 0.38, blur: 6, dy: 4 });
      bSrc.reveal(t, 90.3, { stagger: 0.008, dur: 0.36, blur: 5, dy: 3 });

      exitGroup(bWrap, t, B_OUT);
    },
  });

  /* =====================================================================
   * C：① 给它一个具体计划  92.2 – 96.35
   * ===================================================================== */
  const PILLS = [
    { text: '没回的消息', x: 425, t: 92.97 },
    { text: '拖着的报告', x: 640, t: 93.2 },
    { text: '该打的电话', x: 855, t: 93.46 },
  ];
  const C_OUT = 95.96;
  let cWrap, cTitle, cPills = [], cSub, cLine;
  V.addScene({
    id: 'c05-c', start: 92.2, end: 96.35,
    build(root) {
      cWrap = V.el('div', { cls: 'layer', parent: root });
      cTitle = new V.Text(cWrap, '<b class="c05-num">①</b> 给它一个具体计划', { cls: 'serif c05-title', x: 640, y: 172 });
      for (const p of PILLS) {
        const el = V.el('div', { cls: 'c05-pill', text: p.text, parent: cWrap });
        V.place(el, p.x, 300, 'c');
        cPills.push({ el, ...p });
      }
      cSub = new V.Text(cWrap, '写清：哪天、几点、先做哪一步，', { cls: 'c05-grey', x: 640, y: 421, style: { fontSize: '24px' } });
      cLine = new V.Text(cWrap, '脑子才更容易把它放下。', { cls: 'serif c05-white', x: 640, y: 488, style: { fontSize: '44px', letterSpacing: '.02em' } });
    },
    update(lt, t) {
      cTitle.reveal(t, 92.24, { stagger: 0.035, dur: 0.32, blur: 12, dy: 6 });
      // 胶囊：从小弹出（带回弹），模糊消散
      for (const p of cPills) {
        const k = V.prog(t, p.t, 0.32);
        const s = V.lerp(0.3, 1, E.outBack(k));
        V.set(p.el, { o: V.clamp(k * 5), s, blur: (1 - V.clamp(k * 2.5)) * 4 });
      }
      cSub.reveal(t, 94.0, { stagger: 0.022, dur: 0.32, blur: 8, dy: 5 });
      cLine.reveal(t, 94.45, { stagger: 0.036, dur: 0.32, blur: 12, dy: 7 });
      exitGroup(cWrap, t, C_OUT);
    },
  });

  /* =====================================================================
   * D：② 把第一步缩到可笑  96.3 – 100.75
   * ===================================================================== */
  const COLS = [
    { x: 373, old: '学习一整晚', neu: '打开书，读一页', tOld: 96.95, tStrike: 97.57, tChev: 97.86, tNew: 97.93 },
    { x: 906, old: '收拾整个房间', neu: '只收拾一个桌角', tOld: 98.12, tStrike: 98.84, tChev: 99.04, tNew: 99.12 },
  ];
  // 参考实测：≈100.37 起整屏（含顶部章节标记）上移约 16px 并近似线性淡出，100.72 消失；模糊只在后半段出现
  const D_OUT = 100.37, D_OUT_DUR = 0.35;
  const dExit = (t) => {
    const p = V.prog(t, D_OUT, D_OUT_DUR);
    return { p, o: 1 - p, y: -16 * E.outCubic(p), blur: 9 * p * p };
  };
  let dWrap, dTitle, dCols = [];
  V.addScene({
    id: 'c05-d', start: 96.3, end: 100.8,
    build(root) {
      dWrap = V.el('div', { cls: 'layer', parent: root });
      dTitle = new V.Text(dWrap, '<b class="c05-num">②</b> 把第一步缩到可笑', { cls: 'serif c05-title', x: 640, y: 172 });
      const svg = V.svgLayer(dWrap);
      for (const c of COLS) {
        const old = new V.Text(dWrap, c.old, { cls: 'c05-grey', x: c.x, y: 312, style: { fontSize: '26px', letterSpacing: '.08em' } });
        const strike = new V.Strike(old, { left: -8, right: -4, top: 50, thickness: 4 });
        const g = V.svg('g', {}, svg);
        g.style.filter = 'drop-shadow(0 0 4px rgba(200,245,60,.7))';
        const chev = V.svg('path', { d: `M ${c.x - 11} 359 L ${c.x} 369 L ${c.x + 11} 359`, fill: 'none', stroke: '#cdf54a', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        const neu = new V.Text(dWrap, c.neu, { cls: 'serif c05-lime', x: c.x, y: 436, style: { fontSize: '42px', letterSpacing: '.01em' } });
        dCols.push({ ...c, oldT: old, strike, chev: g, neu });
      }
    },
    update(lt, t) {
      dTitle.reveal(t, 96.35, { stagger: 0.045, dur: 0.32, blur: 12, dy: 6 });
      for (const c of dCols) {
        c.oldT.reveal(t, c.tOld, { stagger: 0.04, dur: 0.34, blur: 8, dy: 5 });
        c.strike.update(t, c.tStrike, 0.24, E.inOutCubic);
        // 划掉后旧任务变暗
        const dim = V.ep(t, c.tStrike + 0.05, 0.35);
        V.set(c.oldT.el, { o: 1 - 0.38 * dim });
        const ch = V.ep(t, c.tChev, 0.25, E.outCubic);
        c.chev.setAttribute('opacity', ch.toFixed(3));
        c.chev.setAttribute('transform', `translate(0 ${((1 - ch) * -7).toFixed(2)})`);
        c.neu.reveal(t, c.tNew, { stagger: 0.045, dur: 0.32, blur: 12, dy: 7 });
      }
      const dx = dExit(t);
      V.set(dWrap, { o: dx.o, y: dx.y, blur: dx.blur });
    },
  });

  /* 顶部章节标记：与 D 段同步上移淡出，之后保持隐藏（见 CSS 中 :has 规则；本场景无可见 DOM） */
  let markEl;
  V.addScene({
    id: 'c05-mk', start: 100.3, end: V.DURATION,
    build() { markEl = document.querySelector('#chrome .mark'); },
    update(lt, t) {
      if (!markEl) return;
      const dx = dExit(t);
      const key = dx.p.toFixed(4);
      if (markEl._c05 === key) return;
      markEl._c05 = key;
      markEl.style.setProperty('--c05-mo', dx.o.toFixed(4));
      markEl.style.setProperty('--c05-my', dx.y.toFixed(2) + 'px');
      markEl.style.setProperty('--c05-mf', dx.blur > 0.05 ? `blur(${dx.blur.toFixed(2)}px)` : 'none');
    },
  });

  /* =====================================================================
   * E + F：红色圆环 → 爆散 → ▶ → 结语  100.7 – 110.2
   * ===================================================================== */
  const EC = { x: 640, y: 252, r: 116 };
  const RING_IN = 100.75, BURST = 101.963, TRI = 102.34, END_OUT = 109.78;
  const dotAng = (t) => 228 + 520 * (t - 101.0); // 度，顶部为 0，顺时针（参考实测 ≈520°/s）
  const NDASH = 26;
  const RING_GLOW = 'drop-shadow(0 0 5px rgba(255,40,45,.9)) drop-shadow(0 0 16px rgba(255,40,45,.42))';
  let fWrap, eGlow, eSvg, eRingG, eRing, eDot, eDashG, dashes = [], triG, tri, fL1, fL2, fFoot, fNote;
  V.addScene({
    id: 'c05-ef', start: 100.7, end: 110.2,
    build(root) {
      fWrap = V.el('div', { cls: 'layer', parent: root });
      eGlow = V.el('div', { parent: fWrap, style: { position: 'absolute', left: EC.x - 260 + 'px', top: EC.y - 260 + 'px', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,40,50,.09) 0%, rgba(255,40,50,.045) 40%, rgba(255,40,50,0) 70%)', opacity: 0 } });
      eSvg = V.svgLayer(fWrap);
      eRingG = V.svg('g', {}, eSvg);
      eRingG.style.filter = RING_GLOW;
      eRing = V.svg('circle', { cx: EC.x, cy: EC.y, r: EC.r, fill: 'none', stroke: '#ff3438', 'stroke-width': 6 }, eRingG);
      eDot = V.svg('circle', { cx: EC.x, cy: EC.y - EC.r, r: 7.5, fill: '#ffffff' }, eSvg);
      eDot.style.filter = 'drop-shadow(0 0 5px rgba(255,255,255,.9))';
      // 爆散碎片
      eDashG = V.svg('g', {}, eSvg);
      eDashG.style.filter = 'drop-shadow(0 0 4px rgba(255,40,45,.85))';
      const rnd = V.rng(5051);
      for (let i = 0; i < NDASH; i++) {
        const a = ((i + (rnd() - 0.5) * 0.5) / NDASH) * Math.PI * 2;
        dashes.push({
          el: V.svg('line', { stroke: '#ff3a3c', 'stroke-width': 5.5, 'stroke-linecap': 'round' }, eDashG),
          a,
          len: 15 + rnd() * 7,
          v: 330 + rnd() * 260, // 外飞速度 px/s（参考实测中位 ≈450；碎片基本保持在同一圆周上）
          jit: (rnd() - 0.5) * 26, // 断裂瞬间的径向错位
          rot0: (rnd() - 0.5) * 0.7, // 断裂瞬间的角度偏差 rad
          spin: (rnd() - 0.5) * 7, // rad/s
          fade: 0.75 + rnd() * 0.25,
        });
      }
      // 播放键（质心在 EC）
      triG = V.svg('g', {}, eSvg);
      triG.style.filter = 'drop-shadow(0 0 10px rgba(200,245,60,.7)) drop-shadow(0 0 22px rgba(200,245,60,.3))';
      tri = V.svg('polygon', { points: `${EC.x - 27},${EC.y - 44} ${EC.x - 27},${EC.y + 44} ${EC.x + 52},${EC.y}`, fill: '#cdf54a', stroke: '#cdf54a', 'stroke-width': 5, 'stroke-linejoin': 'round' }, triG);

      fL1 = new V.Text(fWrap, '现在，放下手机。', { cls: 'serif c05-white', x: 640, y: 455, style: { fontSize: '44px', letterSpacing: '.03em' } });
      fL2 = new V.Text(fWrap, '站起来，去做那件事的<g>第一步</g>。', { cls: 'serif c05-white', x: 640, y: 535, style: { fontSize: '44px', letterSpacing: '.03em' } });
      fFoot = new V.Text(fWrap, '很多时候，让你累的不是事情本身，而是迟迟没开始的念头。', { cls: 'c05-foot', x: 640, y: 627, style: { fontSize: '20px', color: '#85847b' } });
      fNote = new V.Text(fWrap, '若长期疲惫、提不起兴趣，请及时就医。', { cls: 'c05-src', x: 640, y: 656, style: { fontSize: '13px' } });
    },
    update(lt, t) {
      /* --- 圆环：整体淡入（略微放大到位）+ 白色光点顺时针绕行 --- */
      const ri = V.prog(t, RING_IN - 0.02, 0.19); // 参考逐帧：100.733 尚无、100.767 约 1/4 亮且发虚，≈100.92 全亮
      const ringOn = t < BURST;
      eRingG.style.display = ringOn ? '' : 'none';
      if (ringOn) {
        const s = V.lerp(0.94, 1, ri);
        eRingG.setAttribute('transform', `translate(${EC.x} ${EC.y}) scale(${s.toFixed(4)}) translate(${-EC.x} ${-EC.y})`);
        eRingG.setAttribute('opacity', ri.toFixed(3));
        // 参考：圆环先是柔和发虚，约 0.4s 后才完全清晰
        const sharp = V.ep(t, RING_IN, 0.42, E.inOutSine);
        eRingG.style.filter = (sharp < 0.999 ? `blur(${((1 - sharp) * 3).toFixed(2)}px) ` : '') + RING_GLOW;
      }
      eGlow.style.opacity = (ri * (1 - V.ep(t, BURST + 0.1, 0.8))).toFixed(3);
      const dotOn = t >= RING_IN - 0.015 && t < BURST - 0.03;
      eDot.style.display = dotOn ? '' : 'none';
      if (dotOn) {
        const a = (dotAng(t) * Math.PI) / 180;
        eDot.setAttribute('cx', (EC.x + EC.r * Math.sin(a)).toFixed(2));
        eDot.setAttribute('cy', (EC.y - EC.r * Math.cos(a)).toFixed(2));
        eDot.setAttribute('opacity', (V.ep(t, RING_IN - 0.015, 0.1) * (1 - V.prog(t, BURST - 0.075, 0.04))).toFixed(3));
      }

      /* --- 爆散：圆环断成切线方向的碎片，向外飞散、旋转、变暗 --- */
      const bOn = t >= BURST && t < 103.2;
      eDashG.style.display = bOn ? '' : 'none';
      if (bOn) {
        const u = t - BURST;
        const pop = E.outCubic(V.clamp(u / 0.03));
        for (const d of dashes) {
          // 断裂瞬间整体弹开 ≈+40px，随后近似匀速外飞（略减速）
          const r = EC.r + (34 + d.jit) * pop + d.v * u * (1 - 0.18 * u);
          const cx = EC.x + r * Math.sin(d.a), cy = EC.y - r * Math.cos(d.a);
          const rot = d.a + d.rot0 * pop + d.spin * u; // 切线方向 + 旋转
          const hl = d.len / 2;
          const dx = Math.cos(rot) * hl, dy = Math.sin(rot) * hl;
          d.el.setAttribute('x1', (cx - dx).toFixed(2)); d.el.setAttribute('y1', (cy - dy).toFixed(2));
          d.el.setAttribute('x2', (cx + dx).toFixed(2)); d.el.setAttribute('y2', (cy + dy).toFixed(2));
          const o = (1 - E.inQuad(V.clamp(u / (0.85 * d.fade)))) * (1 - 0.35 * V.clamp(u / 0.35));
          d.el.setAttribute('opacity', V.clamp(o).toFixed(3));
        }
      }

      /* --- 播放键：从中心弹出（回弹），之后保持并轻微呼吸 --- */
      // 参考实测：约 0.23s 内近似匀速放大到 1.05，再回落到 1
      const tu = t - TRI;
      triG.style.display = tu >= 0 ? '' : 'none';
      if (tu >= 0) {
        const ts = tu < 0.23 ? 0.2 + 0.85 * (tu / 0.23) : 1 + 0.05 * (1 - E.outCubic(V.clamp((tu - 0.23) / 0.22)));
        const breathe = 1 + 0.012 * Math.sin(tu * 2.2) * V.ep(t, TRI + 0.5, 1.2);
        triG.setAttribute('transform', `translate(${EC.x} ${EC.y}) scale(${(ts * breathe).toFixed(4)}) translate(${-EC.x} ${-EC.y})`);
        triG.setAttribute('opacity', V.clamp(tu / 0.03).toFixed(3));
      }

      /* --- 结语 --- */
      fL1.reveal(t, 103.1, { stagger: 0.07, dur: 0.4, blur: 12, dy: 7 });
      fL2.reveal(t, 104.38, { stagger: 0.062, dur: 0.4, blur: 12, dy: 7 });
      fFoot.reveal(t, 106.35, { stagger: 0.028, dur: 0.42, blur: 8, dy: 5 });
      fNote.reveal(t, 107.1, { stagger: 0.018, dur: 0.4, blur: 6, dy: 3 });

      // 片尾：参考在 ≈109.75 前保持清晰，之后整体模糊 + 变暗（变暗主要由引擎的整屏淡出到黑完成）
      const k = V.ep(t, END_OUT, 0.38, E.inOutSine);
      V.set(fWrap, { o: 1 - 0.35 * k, blur: k * 8, s: 1 + 0.01 * k });
    },
  });
})();
