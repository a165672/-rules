/* 01 内耗循环（16.5 – 35.5s）
 *
 * 时间轴（与参考视频「回避循环」同一时刻对齐）：
 *  16.90  右侧标题「内耗循环」逐字模糊→清晰
 *  17.76  上节点「想做的事」弹出 → 18.31 弧线画向右侧 → 18.64 箭头
 *  18.77  右节点「脑内预演」（红框）→ 19.31 弧线 → 19.64 箭头
 *  19.77  下节点「躺着 · 刷手机」→ 20.31 弧线 → 20.64 箭头
 *  20.77  左节点「自责」→ 21.31 弧线回到顶部 → 21.64 箭头
 *  22.25  圆环变红；中心电量「100」+「% 剩 余 电 量」淡入；白色光点带红色彗尾开始绕圈
 *  22.88  文案①「什么都没做，/ 电却一直在漏。」；23.17 左侧红色胶囊「= 耗电」
 *  每过顶部一次（24.75 26.47 27.86 29.06 30.13 31.11 32.01 32.86 33.66 34.41 35.13）电量下降一截并弹跳，
 *  光点逐圈加速，圆环逐圈变粗、变亮、发光；30.13 电量跌破 40 → 数字变红
 *  26.85  文案②「想得越多，/ 做得越少。」   30.85 文案③「每转一圈，/ 你就更累一点。」
 *  35.20 – 35.48 整体模糊淡出
 */
(function () {
  const { E } = V;
  const START = 16.5, END = 35.5;
  const CX = 480, CY = 395, R = 167;
  const RAD = Math.PI / 180;
  const RED = '#ff2d2d';

  /* ---------- 圈数（光点经过顶部的时刻，取自参考视频逐帧测量） ---------- */
  const LAP_T = [22.25, 24.75, 26.47, 27.862, 29.061, 30.132, 31.11, 32.014, 32.86, 33.657, 34.412, 35.133];
  const BATT = [100, 91, 81, 70, 57, 39, 31, 24, 18, 12, 7, 3];
  // 单调三次 Hermite（PCHIP）插值：t → 累计圈数 L
  const lapD = (() => {
    const n = LAP_T.length, sec = [], d = new Array(n);
    for (let i = 0; i < n - 1; i++) sec.push(1 / (LAP_T[i + 1] - LAP_T[i]));
    d[0] = 0.34; d[n - 1] = 1.41;
    for (let i = 1; i < n - 1; i++) {
      const h0 = LAP_T[i] - LAP_T[i - 1], h1 = LAP_T[i + 1] - LAP_T[i];
      const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
      d[i] = (w1 + w2) / (w1 / sec[i - 1] + w2 / sec[i]);
    }
    return d;
  })();
  const STOP_TAU = 0.1;
  function laps(t) {
    const n = LAP_T.length;
    if (t <= LAP_T[0]) return 0;
    if (t >= LAP_T[n - 1]) {
      // 最后一圈过顶后迅速减速停住（参考在 ~35.25 停住）
      return n - 1 + lapD[n - 1] * STOP_TAU * (1 - Math.exp(-(t - LAP_T[n - 1]) / STOP_TAU));
    }
    let i = 0;
    while (t >= LAP_T[i + 1]) i++;
    const h = LAP_T[i + 1] - LAP_T[i], s = (t - LAP_T[i]) / h;
    const h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    return h00 * i + h10 * h * lapD[i] + h01 * (i + 1) + h11 * h * lapD[i + 1];
  }
  const lapSpeed = (t) => (laps(t + 0.01) - laps(t - 0.01)) / 0.02;

  /* ---------- 几何 ---------- */
  const pt = (deg, r = R) => ({ x: CX + r * Math.cos(deg * RAD), y: CY + r * Math.sin(deg * RAD) });
  const ringD = `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX} ${CY + R} A ${R} ${R} 0 1 1 ${CX} ${CY - R}`;
  const f2 = (v) => v.toFixed(2);

  /* ---------- 节奏点 ---------- */
  const NODE_T = [17.76, 18.77, 19.77, 20.77];
  const ARC_T = [18.31, 19.31, 20.31, 21.31];
  const CHEV_T = [18.64, 19.64, 20.64, 21.64];
  const RED_T = 22.25; // 圆环变红 + 光点出发
  const TAG_T = 23.17;
  const CAP = [
    { a: '什么都没做，', b: '电却一直在<r>漏</r>。', t: 22.8, out: 26.36 },
    { a: '想得越多，', b: '做得越少。', t: 26.8, out: 30.36 },
    { a: '每转一圈，', b: '你就更<r>累</r>一点。', t: 30.8, out: null },
  ];
  const EXIT_T = 35.29, EXIT_D = 0.2;

  /* ---------- 背景辉光（本章窗口内的关键帧归本文件管理） ----------
   * 参考：转场后（~17.2）背景是中性偏冷的暗灰微光（环形图后方略亮），并不发红；
   * 红色由本章的 haze 随圈数逐渐升起。保留 16.5 的键（开场结尾的过渡依赖它）。 */
  for (let i = V.bgKeys.length - 1; i >= 0; i--) {
    const k = V.bgKeys[i][0];
    if (k > START && k < END) V.bgKeys.splice(i, 1);
  }
  V.bgKeys.push([17.3, 80, 80, 175, 0.05, 38, 50], [34.4, 80, 80, 175, 0.05, 38, 50]);

  /* ---------- 样式（仅本章使用，c01- 前缀） ---------- */
  const css = `
  .c01-wrap { position:absolute; inset:0; }
  .c01-node { position:absolute; white-space:nowrap; padding:7px 14px 7px; border-radius:999px;
    border:2px solid #74706b; background:rgba(7,7,10,.97); color:#f3efe9; font-size:23px; font-weight:700;
    letter-spacing:.01em; line-height:1.3; box-shadow:0 0 0 1px rgba(0,0,0,.35); }
  .c01-node.neg { border-color:#ff3530; color:#ff3b33; text-shadow:0 0 10px rgba(255,45,45,.35);
    box-shadow:0 0 12px rgba(255,45,45,.28), inset 0 0 8px rgba(255,45,45,.10); }
  .c01-node .dot { display:inline-block; margin:0 .45em; }
  .c01-tag { position:absolute; white-space:nowrap; padding:5px 16px 6px; border-radius:999px; background:#ff3b30;
    color:#fff; font-size:19px; font-weight:700; letter-spacing:.02em; line-height:1.4;
    box-shadow:0 0 14px rgba(255,45,45,.42); }
  .c01-num { position:absolute; font-family:'NSerif',serif; font-weight:900; font-size:104px; line-height:1;
    white-space:nowrap; color:#f3efe9; }
  .c01-lbl { position:absolute; white-space:nowrap; font-size:16px; color:#8d8882; letter-spacing:.32em; font-weight:500; }
  .c01-haze { position:absolute; inset:0; }
  .c01-vig { position:absolute; inset:0; background:radial-gradient(ellipse 780px 680px at 480px 380px, rgba(0,0,0,0) 22%, rgba(0,0,0,.62) 100%); }
  .c01-cap .r { color:#ff2f2b; text-shadow:0 0 14px rgba(255,40,40,.5), 0 0 2px rgba(255,60,50,.6); }
  `;

  let wrap, vig, haze, title, svgBuild, arcs, chevs, svgRing, ringBase, svgComet, comet, cometCore, dot, dotHalo,
    nodes, tag, numEl, lblEl, caps, sparks;
  let lastNum = null;

  V.addScene({
    id: 'c01-loop', start: START, end: END,
    build(root) {
      V.el('style', { text: css, parent: root });
      wrap = V.el('div', { cls: 'c01-wrap', parent: root });
      // 参考在本章的暗角更重（右侧远端接近纯黑），环形图后方相对亮
      vig = V.el('div', { cls: 'c01-vig', parent: wrap });
      haze = V.el('div', { cls: 'c01-haze', parent: wrap });

      /* 右侧标题 */
      title = new V.Text(wrap, '内耗循环', { cls: 'serif', x: 935, y: 240, style: { fontSize: '68px', letterSpacing: '.01em', textShadow: '0 0 22px rgba(255,244,236,.16)' } });

      /* 搭建阶段：灰色弧线 + 白色箭头 */
      svgBuild = V.svgLayer(wrap);
      arcs = [];
      for (let i = 0; i < 4; i++) {
        const a0 = -90 + 90 * i, a1 = a0 + 90;
        const p0 = pt(a0), p1 = pt(a1);
        arcs.push(V.svg('path', { d: `M ${f2(p0.x)} ${f2(p0.y)} A ${R} ${R} 0 0 1 ${f2(p1.x)} ${f2(p1.y)}`, fill: 'none', stroke: '#8a857f', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svgBuild));
      }

      /* 红色圆环：亮度/粗细/辉光随圈数连续提升 */
      svgRing = V.svgLayer(wrap);
      ringBase = V.svg('path', { d: ringD, fill: 'none', stroke: RED, 'stroke-width': 1.4 }, svgRing);

      /* 箭头（位于 45° 对角，指向顺时针方向） */
      const svgChev = V.svgLayer(wrap);
      chevs = [];
      for (let i = 0; i < 4; i++) {
        const phi = -45 + 90 * i;
        const p = pt(phi);
        const back = { x: Math.sin(phi * RAD), y: -Math.cos(phi * RAD) }; // 逆切线方向
        const rot = (v, a) => ({ x: v.x * Math.cos(a * RAD) - v.y * Math.sin(a * RAD), y: v.x * Math.sin(a * RAD) + v.y * Math.cos(a * RAD) });
        const L = 13, u = rot(back, 45), w = rot(back, -45);
        const g = V.svg('g', {}, svgChev);
        const pl = V.svg('polyline', {
          points: `${f2(p.x + u.x * L)},${f2(p.y + u.y * L)} ${f2(p.x)},${f2(p.y)} ${f2(p.x + w.x * L)},${f2(p.y + w.y * L)}`,
          fill: 'none', stroke: '#e9e4dd', 'stroke-width': 2.5, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter',
        }, g);
        g.style.transformOrigin = `${f2(p.x)}px ${f2(p.y)}px`;
        chevs.push({ g, pl, phi });
      }

      /* 彗尾 + 光点 */
      svgComet = V.svgLayer(wrap);
      comet = V.svg('path', { d: '', fill: '#ff2f2a' }, svgComet);
      cometCore = V.svg('path', { d: '', fill: '#ff6650' }, svgComet);
      sparks = [];
      for (let i = 0; i < 14; i++) sparks.push(V.svg('line', { stroke: '#ff4a3c', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0 }, svgComet));
      dotHalo = V.svg('circle', { r: 11.5, fill: 'rgba(255,255,255,.07)' }, svgComet);
      dot = V.svg('circle', { r: 8.6, fill: '#fff' }, svgComet);

      /* 节点胶囊（盖在环之上） */
      const mk = (html, x, y, cls = '') => {
        const e = V.el('div', { cls: 'c01-node ' + cls, html, parent: wrap });
        V.place(e, x, y, 'c');
        return e;
      };
      nodes = [
        mk('想做的事', CX, CY - R),
        mk('脑内预演', CX + R, CY, 'neg'),
        mk('躺着<span class="dot">·</span>刷手机', CX, CY + R),
        mk('自责', CX - R, CY),
      ];
      tag = V.el('div', { cls: 'c01-tag', text: '= 耗电', parent: wrap });
      V.place(tag, CX - R + 1, 453, 'c');

      /* 中心电量 */
      numEl = V.el('div', { cls: 'c01-num', text: '100', parent: wrap });
      V.place(numEl, CX, 376, 'c');
      lblEl = V.el('div', { cls: 'c01-lbl', text: '% 剩 余 电 量', parent: wrap });
      V.place(lblEl, CX + 2, 453, 'c');

      /* 右侧文案 */
      caps = CAP.map((c) => ({
        c,
        a: new V.Text(wrap, c.a, { x: 932, y: 372, style: { fontSize: '25px', color: '#8f8a84', fontWeight: 500, letterSpacing: '.03em' } }),
        b: new V.Text(wrap, c.b, { cls: 'serif c01-cap', x: 933, y: 432, style: { fontSize: '44px', letterSpacing: '.01em', textShadow: '0 0 18px rgba(255,245,235,.14)' } }),
      }));
    },

    update(lt, t) {
      const L = laps(t);
      const k = Math.min(LAP_T.length - 1, Math.floor(L + 1e-6));
      const frac = L - Math.floor(L);
      const going = t >= RED_T;
      const spd = going ? lapSpeed(Math.min(t, 35.1)) : 0;

      /* ---- 整体出场 ---- */
      const out = V.ep(t, EXIT_T, EXIT_D, E.inOutCubic);
      V.set(wrap, { o: 1 - out, blur: out * 12, s: 1 + out * 0.015 });

      /* ---- 背景红雾：随圈数加深 ---- */
      // 参考：红雾以画面中部偏右（环与文案之间）为中心，覆盖上下全高，左右边缘渐暗；
      // 强度随圈数 ≈ (L/11)^0.75 增长（按参考逐帧采样拟合）
      const heat = going ? V.clamp(L / 11) : 0;
      const ha = 0.24 * Math.pow(heat, 0.75);
      const hs = (k) => `rgba(150,46,42,${(ha * k).toFixed(4)})`;
      vig.style.opacity = V.ep(t, START, 0.8, E.inOutSine).toFixed(3);
      haze.style.background = `radial-gradient(ellipse 50% 75% at 52% 52%, ${hs(1)} 0%, ${hs(0.88)} 45%, ${hs(0.62)} 60%, ${hs(0.36)} 75%, ${hs(0.12)} 88%, ${hs(0)} 100%)`;

      /* ---- 标题 ---- */
      title.reveal(t, 16.9, { stagger: 0.067, dur: 0.32, blur: 16, dy: 0, scale: 1.12 });

      /* ---- 节点弹出 ---- */
      nodes.forEach((e, i) => {
        const p = V.prog(t, NODE_T[i], 0.3);
        const s = p <= 0 ? 0.3 : V.lerp(0.3, 1, E.outBack(p));
        V.set(e, { o: V.clamp(p * 3), s });
      });
      {
        const p = V.prog(t, TAG_T, 0.26);
        V.set(tag, { o: V.clamp(p * 3), s: p <= 0 ? 0.3 : V.lerp(0.3, 1, E.outBack(p)) });
      }

      /* ---- 搭建：灰色弧线 ---- */
      const toRed = V.ep(t, RED_T - 0.06, 0.1, E.inOutQuad); // 参考在 22.2 左右整环转红
      arcs.forEach((a, i) => V.draw(a, V.ep(t, ARC_T[i], 0.4, E.outCubic)));
      svgBuild.style.opacity = (1 - toRed).toFixed(3);

      /* ---- 红色圆环：等级随圈数提升 ---- */
      // 圆环等级：x = 圈数（连续）。逐圈变亮、变粗、发光（按参考逐帧测得的亮度曲线）
      const lvl = (x) => {
        const e = 1 - Math.exp(-Math.max(0, x) / 3.4);
        // 线宽：参考的环在第 2–4 圈已明显变粗（核心 ~4px），后段 ~6.5px
        const w = 1.5 + 5.1 * Math.pow(V.clamp(x / 10), 0.62);
        const r = Math.round(128 + 127 * Math.min(1, e * 1.02)), g = Math.round(V.lerp(38, 50, e)), b = Math.round(V.lerp(46, 46, e));
        const glow = 1.5 + 11 * e, ga = 0.25 + 0.7 * e;
        return { w, col: `rgb(${r},${g},${b})`, glow: x <= 0 ? 0 : glow, ga };
      };
      const pulse = going && k >= 1 ? 1 - V.ep(t, LAP_T[k], 0.42, E.outCubic) : 0;
      const setRing = (svg, path, x, extra = 0) => {
        const l = lvl(x);
        path.setAttribute('stroke', l.col);
        path.setAttribute('stroke-width', (l.w + extra * 1.2).toFixed(2));
        const gl = l.glow + extra * 6;
        // 两层辉光：贴身的热晕（参考环两侧 ±4px 仍很亮）+ 大范围泛光
        const near = x <= 0 ? 0 : Math.min(1, 0.15 + 0.75 * (1 - Math.exp(-x / 2.5)) + extra * 0.2);
        svg.style.filter = gl > 0.2 ? `drop-shadow(0 0 ${(1.5 + 1.5 * near).toFixed(2)}px rgba(255,52,40,${near.toFixed(2)})) drop-shadow(0 0 ${gl.toFixed(1)}px rgba(255,40,36,${Math.min(1, l.ga + extra * 0.3).toFixed(2)}))` : 'none';
      };
      svgRing.style.opacity = toRed.toFixed(3);
      setRing(svgRing, ringBase, going ? L : 0, pulse);

      /* ---- 箭头：搭建时白色弹出，第一圈结束（24.75）时变红 ---- */
      chevs.forEach((c, i) => {
        const p = V.prog(t, CHEV_T[i], 0.18);
        const redK = going ? V.ep(t, LAP_T[1] - 0.02, 0.16) : 0; // 第一圈结束时一起变红
        const r = Math.round(V.lerp(233, 255, redK)), g = Math.round(V.lerp(228, 58, redK)), b = Math.round(V.lerp(221, 50, redK));
        c.pl.setAttribute('stroke', `rgb(${r},${g},${b})`);
        const lv = lvl(L);
        c.pl.setAttribute('stroke-width', (2.5 + (going ? Math.max(0, lv.w - 2.6) * 0.3 : 0)).toFixed(2));
        c.g.style.opacity = V.clamp(p * 2.5).toFixed(3);
        c.g.style.transform = `scale(${(p <= 0 ? 0.4 : V.lerp(0.4, 1, E.outBack(p))).toFixed(3)})`;
      });

      /* ---- 光点 + 彗尾 ---- */
      if (going) {
        svgComet.style.display = '';
        const headDeg = -90 + frac * 360;
        const hp = pt(headDeg);
        dot.setAttribute('cx', f2(hp.x)); dot.setAttribute('cy', f2(hp.y));
        dotHalo.setAttribute('cx', f2(hp.x)); dotHalo.setAttribute('cy', f2(hp.y));
        const appear = V.ep(t, RED_T, 0.15);
        // 尾巴长度 ≈ 0.3s 的行程（度），起步时从 0 长出
        const trailLen = Math.min(78, Math.max(36, spd * 360 * 0.3)) * V.ep(t, RED_T, 0.4);
        const hw = 7.6 + 0.8 * V.clamp((spd - 0.4) / 1.0); // 头部半宽（参考彗尾头部与光点几乎等粗）
        // 高速时（后段）参考的彗尾边缘是毛糙的锯齿状（运动残影），这里让轮廓逐顶点随机起伏
        const sparkA = V.clamp((spd - 0.85) / 0.4);
        const fr = Math.round(t * 30);
        const N = 48, outer = [], inner = [], o2 = [], i2 = [];
        for (let j = 0; j <= N; j++) {
          const s = j / N;
          const ang = headDeg - s * trailLen;
          const w = hw * Math.pow(1 - s, 1.2);
          const fray = sparkA * V.clamp(s / 0.08) * (1 - s * 0.5);
          const rj = V.rng(fr * 977 + j * 13 + 3);
          const wo = w * (1 + fray * (rj() - 0.35) * 0.9), wi = w * (1 + fray * (rj() - 0.35) * 0.9);
          const po = pt(ang, R + wo), pi = pt(ang, R - wi);
          outer.push(`${f2(po.x)} ${f2(po.y)}`); inner.push(`${f2(pi.x)} ${f2(pi.y)}`);
          if (s <= 0.4) {
            const w2 = w * 0.36;
            const qo = pt(ang, R + w2), qi = pt(ang, R - w2);
            o2.push(`${f2(qo.x)} ${f2(qo.y)}`); i2.push(`${f2(qi.x)} ${f2(qi.y)}`);
          }
        }
        comet.setAttribute('d', `M ${outer.join(' L ')} L ${inner.reverse().join(' L ')} Z`);
        cometCore.setAttribute('d', `M ${o2.join(' L ')} L ${i2.reverse().join(' L ')} Z`);
        cometCore.setAttribute('opacity', (0.42 - 0.27 * sparkA).toFixed(3));
        const cg = 6 + 8 * heat;
        svgComet.style.filter = `drop-shadow(0 0 ${cg.toFixed(1)}px rgba(255,45,40,.85))`;
        svgComet.style.opacity = appear.toFixed(3);

        // 后段高速时彗尾上的火花（毛刺感）
        sparks.forEach((sp, j) => {
          if (sparkA <= 0) { sp.setAttribute('opacity', 0); return; }
          const rr = V.rng(fr * 31 + j * 7 + 5);
          const s = rr() * 0.75;
          const ang = headDeg - s * trailLen;
          const len = (3 + rr() * 9) * (1 - s);
          const side = rr() < 0.5 ? -1 : 1;
          const a0 = pt(ang, R + side * 1.5), a1 = pt(ang + (rr() - 0.5) * 2, R + side * (1.5 + len));
          sp.setAttribute('x1', f2(a0.x)); sp.setAttribute('y1', f2(a0.y));
          sp.setAttribute('x2', f2(a1.x)); sp.setAttribute('y2', f2(a1.y));
          sp.setAttribute('opacity', (sparkA * (0.5 + rr() * 0.5) * (1 - s)).toFixed(3));
        });
      } else {
        svgComet.style.display = 'none';
      }

      /* ---- 中心电量 ---- */
      const nIn = V.ep(t, RED_T - 0.03, 0.7, E.outCubic); // 参考 22.25 已能看到暗灰数字
      const val = BATT[going ? k : 0];
      if (val !== lastNum) { numEl.textContent = String(val); lastNum = val; }
      const low = val < 40;
      const pop = going && k >= 1 ? 1 - V.ep(t, LAP_T[k], 0.3, E.outCubic) : 0;
      const sz = val >= 100 ? 0.9 : 1;
      if (low) {
        numEl.style.color = '#ff3a32';
        numEl.style.textShadow = `0 0 ${(16 + 10 * heat + 10 * pop).toFixed(1)}px rgba(255,40,36,${(0.7 + 0.3 * pop).toFixed(2)}), 0 0 4px rgba(255,80,64,.75)`;
      } else {
        const gw = 4 + 14 * V.clamp(L / 5);
        numEl.style.color = '#f3efe9';
        numEl.style.textShadow = `0 0 ${(gw + 10 * pop).toFixed(1)}px rgba(255,246,238,${(0.12 + 0.32 * V.clamp(L / 5) + 0.25 * pop).toFixed(2)})`;
      }
      V.set(numEl, { o: nIn, blur: (1 - nIn) * 3, s: sz * (1 + 0.18 * pop) * V.lerp(1.06, 1, nIn), bright: V.lerp(0.45, 1, nIn) });
      V.set(lblEl, { o: V.ep(t, RED_T, 0.55), blur: (1 - V.ep(t, RED_T, 0.55)) * 5 });

      /* ---- 文案 ---- */
      caps.forEach(({ c, a, b }) => {
        a.anim(t, c.t, c.out, { stagger: 0.028, dur: 0.3, blur: 8, dy: 6, outDur: 0.42, outBlur: 10 });
        b.anim(t, c.t + 0.22, c.out, { stagger: 0.055, dur: 0.3, blur: 12, dy: 10, outDur: 0.42, outBlur: 12 });
      });
    },
  });
})();
