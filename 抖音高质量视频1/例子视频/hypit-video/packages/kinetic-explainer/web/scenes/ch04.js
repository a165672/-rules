/* 04 真相（64.5 – 83.6s）
 *
 * 时间轴（与参考视频同一时刻对齐，数值取自参考逐帧测量）：
 *  A 64.5 – 73.34
 *   65.12  灰色小字「让你累的」逐字
 *   65.74  宋体大字「不是事情」逐字（由暗到亮）
 *   67.44  红线自左向右划过（≈0.3s），文字同时变暗；67.83 镜头抖动（参考逐帧位移表）
 *   68.41  灰色小字「而是那些」
 *   69.02  宋体中字「一直在后台运行的」
 *   69.74  红色辉光升起 → 70.53 镜头抖动 + 70.57 红色巨字「念头」砸下（放大→落定）
 *   72.75 – 73.32  整体淡出（轻微模糊）
 *  B 73.34 – 83.6
 *   73.62  灰色小标题「哈佛的「走神实验」」
 *   74.04 / 74.33 / 74.53  三个数字滚动计数（2250 / 25→25万 / 22）+ 灰色小标签
 *   76.20 / 76.73 / 77.32  三句常见想法依次出现
 *   78.77  三条红线同时划过，想法变暗；79.23 大幅镜头抖动（首帧 16px）
 *   79.27  红色巨字「46.9%」砸下 + 整屏红色辉光；79.75 右侧白字说明（整组居中）
 *   81.13  灰色脚注；红色辉光 81.3 – 82.3 退去
 *   83.29 – 83.59  整体淡出（83.6 前完全消失）
 */
(function () {
  const { E } = V;
  const START = 64.5, MID = 73.34, END = 83.6;
  // 出场曲线：参考的淡出接近线性、末段略加速
  const fadeOut = (x) => 0.55 * x + 0.45 * x * x;

  /* ---------- 背景：参考本章为中性暗色（与 03 相同的冷灰微光），只改本章窗口内的关键帧 ---------- */
  for (let i = V.bgKeys.length - 1; i >= 0; i--) {
    const k = V.bgKeys[i][0];
    if (k >= START && k < END) V.bgKeys.splice(i, 1);
  }
  V.bgKeys.push(
    [START, 140, 140, 215, 0.015, 50, 46],
    [83.0, 140, 140, 215, 0.015, 50, 46],
  );

  /* ---------- 局部样式 ---------- */
  const css = `
  .c04-layer { position:absolute; inset:0; }
  .c04-wash { position:absolute; inset:0; opacity:0;
    background:radial-gradient(ellipse 62% 70% at 50% 46%, rgba(190,48,46,.30) 0%, rgba(190,48,46,.16) 45%, rgba(190,48,46,0) 100%); }
  .c04-small { font-size:33px; color:#8f8e92; font-weight:500; letter-spacing:.0em; }
  .c04-big { font-size:100px; color:#f1ede6; letter-spacing:0; text-shadow:0 0 18px rgba(255,245,235,.12); }
  .c04-mid { font-size:54px; color:#f6f1ec; letter-spacing:0; text-shadow:0 0 16px rgba(255,245,235,.14); }
  .c04-word { font-size:133px; color:#ff3b30; letter-spacing:0;
    text-shadow:1.5px 2px 0 rgba(150,135,138,.5), 0 0 18px rgba(255,40,36,.85), 0 0 46px rgba(255,30,30,.45), 0 0 4px rgba(255,90,80,.9); }
  .c04-title { font-size:26px; color:#8e8d91; font-weight:500; letter-spacing:.03em; }
  .c04-num { position:absolute; white-space:nowrap; font-family:'NSerif',serif; font-weight:900; font-size:80px; line-height:1;
    color:#f6f3f0; font-variant-numeric:tabular-nums; text-shadow:0 0 16px rgba(255,245,235,.12); }
  .c04-num .c04-unit { display:inline-block; font-size:.62em; margin-left:.04em; }
  .c04-lab { font-size:18px; color:#87868b; font-weight:500; letter-spacing:.06em; }
  .c04-quote { font-size:24px; color:#c4c3c7; font-weight:700; letter-spacing:.01em; }
  .c04-stat { position:absolute; white-space:nowrap; font-family:'NSerif',serif; font-weight:900; font-size:150px; line-height:1;
    color:#ff3b30; text-shadow:2px 2px 0 rgba(150,135,138,.5), 0 0 18px rgba(255,40,36,.85), 0 0 46px rgba(255,30,30,.42), 0 0 4px rgba(255,90,80,.9); }
  .c04-stat .c04-pct { display:inline-block; font-size:.6em; margin-left:.03em; }
  .c04-cap { font-size:30px; color:#f8eeee; font-weight:700; letter-spacing:.02em; }
  .c04-foot { font-size:24px; color:#8d898c; font-weight:500; letter-spacing:.03em; }
  `;
  V.el('style', { text: css, parent: document.head });

  /** 撞击震动：逐帧位移表（px），由参考视频逐帧相位相关测得。
   *  参考是整帧“镜头抖动”：首帧猛踢，之后随机方向、≈0.35–0.45s 内衰减；按 30fps 帧号取值（纯时间函数）。 */
  const SHAKES = [
    // 67.833 「不是事情」被划掉后
    [67.8333, [[2.8, 4.7], [-4.7, 2.7], [3.3, -3.2], [-1.0, 0.4], [-0.8, 2.0], [1.3, -1.2], [-1.0, -0.4], [0.2, 0.5], [0.1, 0], [-0.3, -0.5], [0.2, 0]]],
    // 70.533 「念头」砸下
    [70.5333, [[-5.9, 4.7], [-1.4, -7.5], [4.9, 1.2], [-4.2, 3.9], [1.9, -2.1], [0.3, -0.8], [-1.2, 2.0], [1.3, -0.1], [-0.7, -0.7], [0, 0.7], [0.3, 0.4], [-0.2, -0.1], [0.1, 0.4]]],
    // 79.233 「46.9%」砸下（首帧大踢）
    [79.2333, [[-16, -16], [8.5, 4.0], [-0.2, 6.9], [-4.4, -5.6], [4.9, -1.1], [-2.8, 3.5], [0.1, -1.1], [1.2, -1.6], [-1.5, 1.3], [0.9, 0.1], [-0.1, -0.9], [-0.3, 0.1], [0.4, 0.1], [-0.2, -0.6]]],
  ].map(([t0, d]) => ({ f0: Math.round(t0 * V.FPS), d }));
  const shake = (t) => {
    const f = Math.round(t * V.FPS);
    for (const s of SHAKES) {
      const i = f - s.f0;
      if (i >= 0 && i < s.d.length) return { x: s.d[i][0], y: s.d[i][1] };
    }
    return { x: 0, y: 0 };
  };
  const mix = (a, b, k) => a.map((v, i) => Math.round(V.lerp(v, b[i], k)));
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  /* =====================================================================
   * A：让你累的 / 不是事情 / 而是那些 / 一直在后台运行的 / 念头
   * ===================================================================== */
  const A = {};
  const T_L1 = 65.12, T_BIG = 65.74, T_STRIKE = 67.44, T_L2 = 68.41, T_MID = 69.02, T_WORD = 70.57, A_OUT = 72.75;
  V.addScene({
    id: 'ch04-a', start: START, end: MID,
    build(root) {
      A.wash = V.el('div', { cls: 'c04-wash', parent: root });
      A.wrap = V.el('div', { cls: 'c04-layer', parent: root });
      A.l1 = new V.Text(A.wrap, '让你累的', { cls: 'c04-small', x: 640, y: 162 });
      A.big = new V.Text(A.wrap, '不是事情', { cls: 'serif c04-big', x: 640, y: 251 });
      A.strike = new V.Strike(A.big, { left: -22, right: -22, top: 55.4, thickness: 10, color: '#ff3b34' });
      A.strike.line.style.borderRadius = '5px';
      A.strike.line.style.boxShadow = '0 0 5px rgba(255,45,45,.45)';
      A.l2 = new V.Text(A.wrap, '而是那些', { cls: 'c04-small', x: 640, y: 357 });
      A.mid = new V.Text(A.wrap, '一直在后台运行的', { cls: 'serif c04-mid', x: 640, y: 427 });
      A.word = new V.Text(A.wrap, '念头', { cls: 'serif c04-word', x: 640, y: 556 });
    },
    update(lt, t) {
      A.l1.reveal(t, T_L1, { stagger: 0.035, dur: 0.27, blur: 8, dy: 6 });

      // 大字：逐字由暗到亮（轻微模糊 + 缩放），划线时变暗
      A.big.reveal(t, T_BIG, { stagger: 0.085, dur: 0.3, blur: 6, dy: 0, scale: 1.06, ease: E.outQuad });
      const dim = V.ep(t, T_STRIKE + 0.04, 0.26, E.inOutSine);
      if (A.big._dim !== dim) {
        A.big._dim = dim;
        A.big.el.style.color = rgb(mix([241, 237, 230], [96, 93, 97], dim));
        // 白色微光随变暗一起淡掉（插值，避免在 dim=0.5 处突然消失）
        A.big.el.style.textShadow = dim >= 0.999 ? 'none' : `0 0 18px rgba(255,245,235,${(0.12 * (1 - dim)).toFixed(3)})`;
      }
      A.strike.update(t, T_STRIKE, 0.3, E.inOutCubic);

      A.l2.reveal(t, T_L2, { stagger: 0.035, dur: 0.27, blur: 8, dy: 6 });
      A.mid.reveal(t, T_MID, { stagger: 0.035, dur: 0.32, blur: 9, dy: 10 });

      // 念头：放大 + 模糊 → 落定
      const wp = V.prog(t, T_WORD - 0.02, 0.2);
      const wo = E.outCubic(V.clamp(wp * 1.6));
      V.set(A.word.el, { o: wo, s: V.lerp(1.2, 1, E.outCubic(wp)), blur: (1 - E.outCubic(wp)) * 9 });

      // 红色辉光：念头落下前升起（参考 69.77 起亮，70.2 前大部分到位）
      const wash = V.ep(t, 69.74, 0.6, E.inOutSine);
      // 整体出场
      const out = V.ep(t, A_OUT, 0.57, fadeOut);
      A.wash.style.opacity = (0.31 * wash * (1 - out)).toFixed(3);

      const j = shake(t);
      V.set(A.wrap, { o: 1 - out, blur: out * 4, x: j.x, y: j.y, s: 1 + out * 0.01 });
    },
  });

  /* =====================================================================
   * B：哈佛的「走神实验」
   * ===================================================================== */
  const B = {};
  const COLS = [
    { x: 371, to: 2250, unit: '', lab: '名成年人', t: 74.04 },
    { x: 640, to: 25, unit: '万', lab: '次实时采样', t: 74.33 },
    { x: 906, to: 22, unit: '', lab: '种日常活动', t: 74.53 },
  ];
  const NUM_Y = 240, LAB_Y = 300, COUNT_DUR = 1.3;
  const QUOTES = [
    { text: '“躺着就是在休息。”', x: 266, t: 76.2 },
    { text: '“放空一下就好了。”', x: 640, t: 76.73 },
    { text: '“我又没干什么。”', x: 1013, t: 77.32 },
  ];
  const Q_Y = 377, T_QSTRIKE = 78.77, T_STAT = 79.27, T_CAP = 79.75, T_FOOT = 81.13, B_OUT = 83.29;
  const STAT_Y = 502, CAP_Y = 514;

  V.addScene({
    id: 'ch04-b', start: MID, end: END,
    build(root) {
      B.wash = V.el('div', { cls: 'c04-wash', parent: root });
      B.wrap = V.el('div', { cls: 'c04-layer', parent: root });
      B.title = new V.Text(B.wrap, '哈佛的「走神实验」', { cls: 'c04-title', x: 640, y: 152 });
      B.cols = COLS.map((c) => {
        const el = V.el('div', { cls: 'c04-num', parent: B.wrap });
        const dig = V.el('span', { text: '0', parent: el });
        let unit = null;
        if (c.unit) unit = V.el('span', { cls: 'c04-unit', text: c.unit, parent: el });
        V.place(el, c.x, NUM_Y, 'c');
        const lab = new V.Text(B.wrap, c.lab, { cls: 'c04-lab', x: c.x, y: LAB_Y });
        return { ...c, el, dig, unit, lab, last: '' };
      });
      B.quotes = QUOTES.map((q) => {
        const T = new V.Text(B.wrap, q.text, { cls: 'c04-quote', x: q.x, y: Q_Y });
        // 线略低于字心：避开「一」的横画，划掉后仍能读出原句
        const s = new V.Strike(T, { left: -15, right: -15, top: 61, thickness: 3, color: '#e8333c' });
        s.line.style.boxShadow = '0 0 4px rgba(255,45,45,.5)';
        return { ...q, T, s };
      });
      // 46.9% + 说明（整组水平居中）
      B.statRow = V.el('div', { cls: 'c04-layer', parent: B.wrap });
      B.stat = V.el('div', { cls: 'c04-stat', parent: B.statRow, html: '46.9<span class="c04-pct">%</span>' });
      B.cap = new V.Text(B.statRow, '的清醒时间，大脑都在走神', { cls: 'c04-cap' });
      B.foot = new V.Text(B.wrap, '而走神时的人，明显更不快乐。', { cls: 'c04-foot', x: 640, y: 631 });
      B._laid = false;
    },
    layout() {
      // 依据实际字宽，把「46.9%」与说明作为一组水平居中
      // 「万」弹出前数字自身居中，弹出时整组滑到最终居中位置
      for (const c of B.cols) c.shift = c.unit ? c.unit.offsetWidth / 2 + 1.5 : 0;
      const GAP = 34;
      const sw = B.stat.offsetWidth, cw = B.cap.el.offsetWidth;
      const x0 = 640 - (sw + GAP + cw) / 2;
      V.place(B.stat, x0 + sw / 2, STAT_Y, 'c');
      V.place(B.cap.el, x0 + sw + GAP, CAP_Y, 'l');
      B._laid = true;
    },
    update(lt, t) {
      this.layout(); // 每帧按实际字宽排版（字体加载、任意起始帧都成立）
      B.title.reveal(t, 73.62, { stagger: 0.025, dur: 0.3, blur: 8, dy: 5 });

      // 数字滚动计数
      for (const c of B.cols) {
        const a = V.ep(t, c.t, 0.28, E.outCubic);
        const k = V.ep(t, c.t, COUNT_DUR, E.outCubic);
        const v = Math.round(c.to * k);
        const s = String(v);
        if (s !== c.last) { c.dig.textContent = s; c.last = s; }
        const tu = c.t + COUNT_DUR - 0.12;
        const slide = c.unit ? c.shift * (1 - V.ep(t, tu - 0.04, 0.34, E.inOutCubic)) : 0;
        V.set(c.el, { o: a, x: slide, y: (1 - a) * 8, blur: (1 - a) * 8 });
        if (c.unit) {
          const up = V.prog(t, tu, 0.26);
          c.unit.style.opacity = E.outCubic(V.clamp(up * 1.8)).toFixed(3);
          const us = V.lerp(1.5, 1, E.outBack(up));
          c.unit.style.transform = up >= 1 ? 'none' : `scale(${us.toFixed(4)})`;
          c.unit.style.filter = up >= 1 ? 'none' : `blur(${((1 - up) * 6).toFixed(2)}px)`;
        }
        c.lab.reveal(t, c.t + 0.06, { stagger: 0.03, dur: 0.3, blur: 6, dy: 4 });
      }

      // 三句想法 → 划掉、变暗
      const qd = V.ep(t, T_QSTRIKE + 0.03, 0.3, E.inOutSine);
      const qd2 = V.ep(t, 80.8, 1.8, E.inOutSine);
      const qc = rgb(mix(mix([196, 195, 199], [80, 77, 81], qd), [66, 64, 67], qd2));
      for (const q of B.quotes) {
        q.T.reveal(t, q.t, { stagger: 0.025, dur: 0.3, blur: 8, dy: 6 });
        if (q.T._c !== qc) { q.T._c = qc; q.T.el.style.color = qc; }
        q.s.update(t, T_QSTRIKE, 0.32, E.inOutCubic);
      }

      // 46.9%：放大 + 模糊 → 落定
      // 参考：首帧已是放大、偏暗、轻微模糊的完整数字，≈0.15s 内缩回并提亮（不是重模糊淡入）
      const sp = V.prog(t, T_STAT - 0.02, 0.16);
      V.set(B.stat, {
        o: E.outCubic(V.clamp(sp * 2.5)), s: V.lerp(1.16, 1, E.outCubic(sp)),
        blur: (1 - E.outCubic(sp)) * 5, bright: V.lerp(0.6, 1, E.outQuad(sp)),
      });
      B.cap.reveal(t, T_CAP, { stagger: 0.028, dur: 0.28, blur: 8, dy: 6 });
      B.foot.reveal(t, T_FOOT, { stagger: 0.035, dur: 0.34, blur: 7, dy: 5 });

      const out = V.ep(t, B_OUT, 0.3, fadeOut);
      // 红色辉光：79.2 起 ≈0.25s 升满（参考非瞬间跳变）；81.3 起 ≈1s 退去
      const washOut = (x) => 0.6 * x + 0.4 * E.inOutSine(x);
      const wash = V.ep(t, 79.2, 0.25, E.inOutSine) * (1 - V.ep(t, 81.3, 0.95, washOut));
      B.wash.style.opacity = (0.47 * wash * (1 - out)).toFixed(3);
      const j = shake(t);
      V.set(B.wrap, { o: 1 - out, blur: out * 4.5, x: j.x, y: j.y, s: 1 + out * 0.01 });
    },
  });
})();
