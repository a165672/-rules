/* 03 假休息（51.6 – 64.5s）
 *
 * 时间轴（与参考视频「可你明明很忙?」同一时刻对齐，数值取自参考逐帧测量）：
 *  51.95  标题「可你明明在休息？」逐字：先以暗灰、近乎清晰出现，再提亮（参考同款，非大模糊）
 *  52.68  副标题「身体躺平了，大脑却在“加班”。」逐字
 *  53.53 / 54.07 / 54.63 / 55.16 / 55.74  左侧清单逐行自右滑入
 *  53.68 / 54.21 / 54.78 / 55.35 / 55.88  每行方框先出现起笔圆点，再加速画完勾（≈0.25s）
 *  56.75  红色倾斜贴纸「比如现在」弹出（第 1 行旁）
 *  57.52  右侧整块淡入：☐ 真正的休息 + 进度条 0%；57.58 中间竖线自上而下快速画出
 *  58.02  右侧红框开始闪烁（≈1.0445s 一个周期，亮 0.525s / 暗，硬切）
 *  59.35  底部红色辉光大字「假装在休息」逐字
 *  60.32  灰色小字「刷手机，往往不是真正的休息。」逐字
 *  64.27 – 64.73  章节转场：自下而上依次线性淡出 + 整体上移 15px + 渐虚（与参考逐帧一致，跨过 64.5；04 章内容 65.12 才出现）
 */
(function () {
  const { E } = V;
  const START = 51.6, END = 64.5;

  /* ---------- 几何（参考视频同一时刻测量，单位：设计坐标 px） ---------- */
  const TITLE_Y = 158, SUB_Y = 219;
  const ROW_X = 199, ROW_Y0 = 292.5, ROW_DY = 51, LABEL_X = 249;
  const DIV_X = 673.5, DIV_Y0 = 280, DIV_Y1 = 507;
  const RBOX_X = 739, RBOX_Y = 348, RBOX = 35;
  const RLAB_X = 795, RLAB_Y = 366;
  const BAR_X = 740, BAR_W = 346, BAR_Y = 424;
  const PCT_X = 1104;
  const BIG_Y = 589, FOOT_Y = 645;

  /* ---------- 时间 ---------- */
  // 逐帧实测参考：标题首字 51.967 可见、约 0.05s/字；副标题 ≈52.7；
  // 清单行首次可见 53.567 / 54.100 / 54.667 / 55.200 / 55.767；勾的起笔圆点 53.70 / 54.23 / 54.80 / 55.37 / 55.90，画完 53.92 / 54.47 / 55.0 / 55.57 / 56.1
  const T_TITLE = 51.945, T_SUB = 52.68;
  const ROWS = [
    { text: '刷了 3 小时短视频', a: 53.53, k: 53.675 },
    { text: '一口气看完 6 集剧', a: 54.07, k: 54.21 },
    { text: '回了 40 条消息', a: 54.63, k: 54.775 },
    { text: '第 20 次想“明天开始”', a: 55.16, k: 55.345 },
    { text: '睡前复盘自己有多废', a: 55.74, k: 55.875 },
  ];
  const T_STICK = 56.75;
  const T_RIGHT = 57.52, T_DIV = 57.575;
  // 红框闪烁：参考亮起于 58.033 / 59.067 / 60.133 / 61.167 / 62.233 / 63.267 / 64.30，每次亮 16 帧
  const T_BLINK = 58.02, BLINK_P = 1.0445, BLINK_ON = 0.525;
  const T_BIG = 59.35, T_FOOT = 60.32;
  // 章节转场（参考五处章节切换完全相同，逐帧实测）：以 M 为中点，M-0.2 → M+0.233 近似线性淡出，
  // M-0.17 → M+0.15 整体上移 15px（smoothstep）。本章保留自下而上的先后顺序（各元素起点相差 ≤0.06s）
  const XF_M = 64.5, XF_END = XF_M + 0.25;

  /* ---------- 样式（c03- 前缀） ---------- */
  const css = `
  .c03-layer { position:absolute; inset:0; }
  .c03-vig { position:absolute; inset:0; opacity:0;
    background:radial-gradient(ellipse 54% 100% at 50% 46%, rgba(2,2,6,0) 38%, rgba(2,2,6,.42) 72%, rgba(2,2,6,.62) 100%); }
  .c03-title { font-size:56px; letter-spacing:0; color:#f6f2ec; text-shadow:0 0 18px rgba(255,245,235,.16); }
  .c03-sub { font-size:24px; color:#908f92; font-weight:500; letter-spacing:.03em; }
  .c03-row { position:absolute; white-space:nowrap; height:30px; }
  .c03-box { position:absolute; left:0; top:0; width:30px; height:30px; box-sizing:border-box;
    border:2px solid #75747a; border-radius:2px; }
  .c03-tick { position:absolute; left:0; top:0; overflow:visible; }
  .c03-lab { position:absolute; left:${LABEL_X - ROW_X}px; top:50%; transform:translateY(-50%); line-height:1;
    font-size:25px; font-weight:500; color:#dfdee1; letter-spacing:.02em; -webkit-text-stroke:.35px #dfdee1; }
  .c03-stick { position:absolute; white-space:nowrap; padding:0 12px; height:34px; line-height:34px; border-radius:17px;
    background:#fc3e33; color:#140303; font-size:17px; font-weight:700; letter-spacing:.02em; -webkit-text-stroke:.4px #140303;
    box-shadow:0 0 16px rgba(255,50,40,.42), 0 0 3px rgba(255,80,60,.6); }
  .c03-div { position:absolute; left:${DIV_X}px; top:${DIV_Y0}px; width:1.5px; height:${DIV_Y1 - DIV_Y0}px;
    background:#2b2a2e; transform-origin:50% 0; }
  .c03-rbox { position:absolute; left:${RBOX_X}px; top:${RBOX_Y}px; width:${RBOX}px; height:${RBOX}px; box-sizing:border-box;
    border:2.5px solid #8c2424; border-radius:1px; }
  .c03-rlab { font-size:34px; letter-spacing:.01em; color:#f6f2ec; text-shadow:0 0 16px rgba(255,245,235,.14); }
  .c03-bar { position:absolute; left:${BAR_X}px; top:${BAR_Y - 3}px; width:${BAR_W}px; height:6px; border-radius:3px;
    background:#262529; box-shadow:0 0 3px 1px rgba(38,37,41,.7); }
  .c03-cap { position:absolute; left:0; top:0; width:4px; height:6px; border-radius:2px 0 0 2px; background:#dc3a52;
    box-shadow:0 0 5px rgba(255,50,70,.65); }
  .c03-pct { font-size:27px; font-weight:700; color:#c93444; letter-spacing:.01em; }
  .c03-big { font-size:46px; letter-spacing:0; color:#ff4440;
    text-shadow:-.5px -1.5px 0 rgba(165,140,142,.5), 1px 2px 0 rgba(140,10,6,.7), 0 0 13px rgba(255,40,36,.85), 0 0 24px rgba(255,30,30,.34), 0 0 4px rgba(255,90,80,.85); }
  .c03-foot { font-size:22px; color:#96959a; font-weight:500; letter-spacing:.04em; }
  `;
  V.el('style', { text: css, parent: document.head });

  /* ---------- 背景：参考本章为偏冷的深蓝黑（中心 ≈(15,14,19)，左右两侧明显更暗 ≈(7,6,9)），
   * 只在本章窗口内加关键帧；两侧压暗由本章 root 内的 .c03-vig 完成（随章节淡入 / 淡出，不影响相邻章节） ---------- */
  V.bgKeys.push(
    [52.4, 30, 40, 190, 0.026, 50, 46],
    [63.9, 30, 40, 190, 0.026, 50, 46],
  );

  let vig, title, sub, rows = [], stick, divEl, right, rbox, big, foot;

  V.addScene({
    id: 'ch03', start: START, end: XF_END,
    build(root) {
      vig = V.el('div', { cls: 'c03-vig', parent: root });
      /* 标题 + 副标题 */
      title = new V.Text(root, '可你明明在休息？', { cls: 'serif c03-title', x: 655, y: TITLE_Y }); // 全角问号右侧留白：x+15 使字形视觉居中
      sub = new V.Text(root, '身体躺平了，大脑却在“加班”。', { cls: 'c03-sub', x: 648, y: SUB_Y });

      /* 左侧清单 */
      const rowsWrap = V.el('div', { cls: 'c03-layer', parent: root });
      ROWS.forEach((r, i) => {
        const el = V.el('div', { cls: 'c03-row', parent: rowsWrap });
        V.place(el, ROW_X, ROW_Y0 + i * ROW_DY, 'l');
        V.el('span', { cls: 'c03-box', parent: el });
        const svg = V.svg('svg', { class: 'c03-tick', width: 30, height: 30, viewBox: '0 0 30 30' }, el);
        const tick = V.svg('path', { d: 'M6 15.2 L12 21.6 L23.6 7.8', fill: 'none', stroke: '#e3e2e5', 'stroke-width': 2.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
        const lab = V.el('span', { cls: 'c03-lab', text: r.text, parent: el });
        rows.push({ el, tick, lab, ...r });
      });

      /* 贴纸：紧跟第 1 行文字 */
      stick = V.el('div', { cls: 'c03-stick', text: '比如现在', parent: root });

      /* 中间竖线 + 右侧块 */
      divEl = V.el('div', { cls: 'c03-div', parent: root });
      right = V.el('div', { cls: 'c03-layer', parent: root });
      rbox = V.el('div', { cls: 'c03-rbox', parent: right });
      new V.Text(right, '真正的休息', { cls: 'serif c03-rlab', x: RLAB_X, y: RLAB_Y, anchor: 'l' });
      const bar = V.el('div', { cls: 'c03-bar', parent: right });
      V.el('div', { cls: 'c03-cap', parent: bar });
      new V.Text(right, '0%', { cls: 'c03-pct', x: PCT_X, y: BAR_Y, anchor: 'l' });

      /* 底部 */
      big = new V.Text(root, '假装在休息', { cls: 'serif c03-big', x: 640, y: BIG_Y });
      foot = new V.Text(root, '刷手机，往往不是真正的休息。', { cls: 'c03-foot', x: 647, y: FOOT_Y });
    },

    update(lt, t) {
      /* 两侧压暗：章节开头随背景过渡淡入，出场时淡出（与 04 的背景无缝衔接） */
      vig.style.opacity = (V.ep(t, START, 0.8, E.inOutSine) * (1 - V.ep(t, 64.2, 0.53, E.inOutSine))).toFixed(3);

      /* 出场：自下而上依次线性淡出（64.27 起，0.4s），整体上移 15px，64.733 前全部消失 */
      const xq = V.prog(t, XF_M - 0.17, 0.32), xy = -15 * xq * xq * (3 - 2 * xq);
      const out = (s) => {
        const p = V.prog(t, 64.27 + (s - 64.24) * 0.6, 0.4);
        return { o: 1 - p, blur: 6 * p * p, y: xy };
      };

      /* 标题 / 副标题 */
      title.reveal(t, T_TITLE, { stagger: 0.05, dur: 0.32, blur: 4, dy: 7, ease: E.outQuad });
      title.block(out(64.34));
      sub.reveal(t, T_SUB, { stagger: 0.033, dur: 0.3, blur: 3, dy: 5, ease: E.outQuad });
      sub.block(out(64.33));

      /* 清单：整行自右滑入（24px → 0，模糊 → 清晰），随后打勾 */
      const oR = out(64.32);
      rows.forEach((r) => {
        const p = V.ep(t, r.a, 0.3, E.outCubic);
        V.set(r.el, { o: p * oR.o, x: 24 * (1 - p), y: oR.y, blur: (1 - p) * 1.5 + oR.blur });
        // 参考：先出现起笔圆点，随后加速画完（≈0.25s）
        const kp = V.prog(t, r.k, 0.25);
        V.draw(r.tick, kp > 0 ? 0.06 + 0.94 * E.inCubic(kp) : 0);
      });

      /* 贴纸：压扁的小胶囊 → 回弹放大 → 落定，带 -4° 倾斜 */
      {
        // 位置依赖字体排版：每帧按第 1 行的实际字宽定位（字体可能在之后才加载完）
        const sx = LABEL_X + rows[0].lab.offsetWidth + 48 + stick.offsetWidth / 2;
        if (sx !== stick._x) { stick._x = sx; V.place(stick, sx, ROW_Y0 - 2, 'c'); }
      }
      {
        const p = V.prog(t, T_STICK, 0.4);
        const c1 = 1.9, c3 = c1 + 1, x = p - 1;
        const back = 1 + c3 * x * x * x + c1 * x * x; // outBack（更大的回弹）
        const s = V.lerp(0.45, 1, back);
        const sy = V.lerp(0.4, 1, E.outCubic(V.prog(t, T_STICK, 0.14)));
        const oo = out(64.31);
        const o = V.clamp((t - T_STICK) / 0.035) * oo.o;
        V.set(stick, { o, sx: s, sy: s * sy, r: V.lerp(-9, -4, E.outCubic(p)), y: oo.y, blur: oo.blur + (1 - V.clamp(p * 3)) * 2 });
      }

      /* 中间竖线：自上而下画出 */
      {
        const p = V.ep(t, T_DIV, 0.42, E.outCubic);
        const oo = out(64.30);
        divEl.style.opacity = (p > 0 ? oo.o * V.lerp(0.45, 1, V.ep(t, T_DIV, 0.35, E.outQuad)) : 0).toFixed(3);
        divEl.style.transform = `translateY(${oo.y.toFixed(2)}px) scaleY(${p.toFixed(4)})`;
      }

      /* 右侧块：整体模糊淡入；红框亮 / 暗闪烁 */
      {
        const a = V.ep(t, T_RIGHT, 0.48, E.outQuad);
        const oo = out(64.28);
        const sh = V.ep(t, T_RIGHT, 0.22, E.outCubic); // 模糊比透明度收得更快：先清晰、再慢慢变亮
        V.set(right, { o: a * oo.o, blur: (1 - sh) * 2 + oo.blur, y: oo.y });
        let on = false;
        if (t >= T_BLINK) on = ((t - T_BLINK) % BLINK_P) < BLINK_ON;
        if (rbox._on !== on) {
          rbox._on = on;
          rbox.style.borderColor = on ? '#ff3328' : '#8c2424';
          rbox.style.boxShadow = on ? '0 0 10px rgba(255,45,40,.45), inset 0 0 6px rgba(255,45,40,.2)' : 'none';
        }
      }

      /* 底部红色辉光大字 + 灰色小字 */
      big.reveal(t, T_BIG, { stagger: 0.075, dur: 0.34, blur: 5, dy: 8, ease: E.outQuad });
      big.block(out(64.26));
      foot.reveal(t, T_FOOT, { stagger: 0.04, dur: 0.3, blur: 3, dy: 5, ease: E.outQuad });
      foot.block(out(64.24));
    },
  });
})();
