/*
 * 时间驱动的动效引擎（确定性逐帧渲染）。
 * 每一帧都由 V.renderAt(t) 根据绝对时间 t（秒）完整计算出画面，
 * 不依赖 CSS transition / requestAnimationFrame，所以逐帧截图结果可复现。
 *
 * 设计坐标：1280×720（与参考视频一致），渲染时用 deviceScaleFactor=1.5 输出 1920×1080。
 */
(function () {
  const V = (window.V = {});
  V.W = 1280; V.H = 720; V.FPS = 30; V.DURATION = 110.2;
  // 参考配乐 ≈129.2 BPM：首拍 0.46s，拍间隔 ≈0.4645s
  V.BEAT0 = 0.46; V.BEAT = 0.4645;
  V.beat = (n) => V.BEAT0 + n * V.BEAT;
  V.CHAPTERS = [
    { n: '01', name: '内耗循环', t: 16.5 },
    { n: '02', name: '省电本能', t: 35.5 },
    { n: '03', name: '假休息', t: 51.6 },
    { n: '04', name: '真相', t: 64.5 },
    { n: '05', name: '解法', t: 83.6, lime: true },
  ];

  /* ---------------- math ---------------- */
  V.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  V.lerp = (a, b, k) => a + (b - a) * k;
  /** 0→1 progress of t over [start, start+dur] */
  V.prog = (t, start, dur) => (dur <= 0 ? (t >= start ? 1 : 0) : V.clamp((t - start) / dur));
  V.E = {
    linear: (x) => x,
    inQuad: (x) => x * x,
    outQuad: (x) => 1 - (1 - x) * (1 - x),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outQuart: (x) => 1 - Math.pow(1 - x, 4),
    inOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
    outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
    outSine: (x) => Math.sin((x * Math.PI) / 2),
    outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    outElastic: (x) => { const c4 = (2 * Math.PI) / 3; return x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1; },
  };
  /** eased progress */
  V.ep = (t, start, dur, ease = V.E.outCubic) => ease(V.prog(t, start, dur));
  /**
   * in/out envelope: 0→1 over [inStart, inStart+inDur], then 1→0 over [outStart, outStart+outDur]
   * returns {a: in-progress, b: remaining (1 until out starts), v: a*b}
   */
  V.io = (t, inStart, inDur, outStart = null, outDur = 0.5, inEase = V.E.outCubic, outEase = V.E.inOutCubic) => {
    const a = inEase(V.prog(t, inStart, inDur));
    const b = outStart == null ? 1 : 1 - outEase(V.prog(t, outStart, outDur));
    return { a, b, v: a * b };
  };
  /** deterministic PRNG (mulberry32) */
  V.rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let r = Math.imul(s ^ (s >>> 15), 1 | s);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  /** smooth deterministic noise in [-1,1] (sum of sines), handy for jitter/glitch */
  V.wobble = (t, seed = 0) => (Math.sin(t * 7.13 + seed * 1.7) * 0.5 + Math.sin(t * 13.7 + seed * 3.1) * 0.3 + Math.sin(t * 29.3 + seed * 5.3) * 0.2);

  /* ---------------- DOM helpers ---------------- */
  V.el = (tag, o = {}) => {
    const e = document.createElement(tag);
    if (o.cls) e.className = o.cls;
    if (o.html != null) e.innerHTML = o.html;
    if (o.text != null) e.textContent = o.text;
    if (o.style) Object.assign(e.style, o.style);
    if (o.attrs) for (const k in o.attrs) e.setAttribute(k, o.attrs[k]);
    if (o.parent) o.parent.appendChild(e);
    return e;
  };
  const SVGNS = 'http://www.w3.org/2000/svg';
  V.svg = (tag, attrs = {}, parent = null) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  /**
   * Position an absolutely-positioned element at (x, y) in stage coords.
   * anchor: 'c' centre, 'l' left-middle, 'r' right-middle, 'tl' top-left, 't' top-centre.
   * Stores the anchor transform so V.set() can compose extra transforms on top.
   */
  const ANCH = { c: 'translate(-50%,-50%)', l: 'translate(0,-50%)', r: 'translate(-100%,-50%)', tl: 'none', t: 'translate(-50%,0)', b: 'translate(-50%,-100%)' };
  V.place = (e, x, y, anchor = 'c') => {
    e.style.position = 'absolute';
    e.style.left = x + 'px';
    e.style.top = y + 'px';
    e._base = ANCH[anchor] === 'none' ? '' : ANCH[anchor];
    e.style.transform = e._base;
    return e;
  };
  /**
   * Set visual state each frame. Keys: o (opacity), x, y (px offset), s (scale), sx, sy, r (deg),
   * blur (px), bright (filter brightness), extra (raw transform appended)
   */
  V.set = (e, p = {}) => {
    if (p.o != null) e.style.opacity = p.o <= 0.001 ? 0 : p.o >= 0.999 ? 1 : p.o.toFixed(4);
    let tf = e._base || '';
    if (p.x || p.y) tf += ` translate(${(p.x || 0).toFixed(2)}px,${(p.y || 0).toFixed(2)}px)`;
    if (p.s != null && p.s !== 1) tf += ` scale(${p.s.toFixed(4)})`;
    if ((p.sx != null && p.sx !== 1) || (p.sy != null && p.sy !== 1)) tf += ` scale(${(p.sx ?? 1).toFixed(4)},${(p.sy ?? 1).toFixed(4)})`;
    if (p.r) tf += ` rotate(${p.r.toFixed(3)}deg)`;
    if (p.extra) tf += ' ' + p.extra;
    e.style.transform = tf.trim() || 'none';
    const f = [];
    if (p.blur && p.blur > 0.05) f.push(`blur(${p.blur.toFixed(2)}px)`);
    if (p.bright != null && p.bright !== 1) f.push(`brightness(${p.bright.toFixed(3)})`);
    e.style.filter = f.length ? f.join(' ') : 'none';
    return e;
  };
  /** convenience: fade+blur in, optional fade+blur out (whole element) */
  V.fadeIO = (e, t, inStart, inDur = 0.6, outStart = null, outDur = 0.6, o = {}) => {
    const { a, b } = V.io(t, inStart, inDur, outStart, outDur);
    const blurIn = o.blur ?? 10, blurOut = o.blurOut ?? 12, dy = o.dy ?? 10;
    V.set(e, {
      o: a * b * (o.opacity ?? 1),
      y: (1 - a) * dy + (o.y || 0),
      x: o.x || 0,
      s: (o.s ?? 1) * (o.scaleIn ? V.lerp(o.scaleIn, 1, a) : 1) * (o.scaleOut ? V.lerp(o.scaleOut, 1, b) : 1),
      blur: (1 - a) * blurIn + (1 - b) * blurOut,
    });
    return a * b;
  };

  /* ---------------- Text with per-character animation ----------------
   * markup: plain text with colour tags <r>红</r> <g>绿</g> <w>白</w> <d>灰</d> <f>暗</f>
   * and <b>…</b> for bigger-weight span; tags can carry extra classes: <r class="big">.
   */
  V.Text = class {
    constructor(parent, markup, o = {}) {
      this.el = V.el('div', { cls: 'txt ' + (o.cls || ''), parent, style: o.style || {} });
      this.chars = [];
      this._parse(markup);
      if (o.x != null) V.place(this.el, o.x, o.y, o.anchor || 'c');
    }
    _parse(markup) {
      const re = /<(\/?)([a-z]+)([^>]*)>|([^<]+)/g;
      const stack = [this.el];
      let m;
      while ((m = re.exec(markup))) {
        if (m[4] != null) {
          for (const c of Array.from(m[4])) {
            const s = V.el('span', { cls: 'ch', text: c, parent: stack[stack.length - 1] });
            this.chars.push(s);
          }
        } else if (m[1] === '/') {
          stack.pop();
        } else {
          const extra = (m[3].match(/class="([^"]*)"/) || [])[1] || '';
          const s = V.el('span', { cls: (m[2] + ' ' + extra).trim(), parent: stack[stack.length - 1] });
          stack.push(s);
        }
      }
    }
    /** reveal characters one by one starting at `start` */
    reveal(t, start, o = {}) {
      const st = o.stagger ?? 0.05, d = o.dur ?? 0.5, bl = o.blur ?? 10, dy = o.dy ?? 8, ease = o.ease || V.E.outCubic;
      const n = this.chars.length;
      for (let i = 0; i < n; i++) {
        const c = this.chars[i];
        const p = ease(V.prog(t, start + i * st, d));
        if (c._p === p) continue;
        c._p = p;
        c.style.opacity = p >= 0.999 ? 1 : p.toFixed(4);
        c.style.filter = p >= 0.999 ? 'none' : `blur(${((1 - p) * bl).toFixed(2)}px)`;
        c.style.transform = p >= 0.999 ? 'none' : `translateY(${((1 - p) * dy).toFixed(2)}px)${o.scale ? ` scale(${V.lerp(o.scale, 1, p).toFixed(4)})` : ''}`;
      }
      return this;
    }
    /** whole-block state (fade out, move, scale…) – call after reveal() */
    block(p) { V.set(this.el, p); return this; }
    /** typical: reveal at `start`, fade-out with blur at `outStart` */
    anim(t, start, outStart = null, o = {}) {
      this.reveal(t, start, o);
      const b = outStart == null ? 1 : 1 - V.E.inOutCubic(V.prog(t, outStart, o.outDur ?? 0.5));
      V.set(this.el, { o: b * (o.opacity ?? 1), blur: (1 - b) * (o.outBlur ?? 12), y: o.y || 0, x: o.x || 0, s: o.s ?? 1 });
      return this;
    }
    /** duration needed to reveal all chars */
    span(o = {}) { return (this.chars.length - 1) * (o.stagger ?? 0.05) + (o.dur ?? 0.5); }
  };

  /* ---------------- Strike-through line ---------------- */
  /** draws a red glowing line across `target` (a V.Text or element) */
  V.Strike = class {
    constructor(target, o = {}) {
      const host = target.el || target;
      this.line = V.el('div', {
        parent: host,
        style: {
          position: 'absolute', left: (o.left ?? -4) + 'px', right: (o.right ?? -4) + 'px', top: (o.top ?? 52) + '%',
          height: (o.thickness ?? 4) + 'px', background: o.color || 'var(--red)', borderRadius: '2px',
          boxShadow: o.glow === false ? 'none' : '0 0 10px rgba(255,45,45,.85), 0 0 2px #ff6b5e',
          transformOrigin: 'left center', transform: `scaleX(0) rotate(${o.angle ?? 0}deg)`,
        },
      });
      this.angle = o.angle ?? 0;
    }
    update(t, start, dur = 0.35, ease = V.E.outQuart) {
      const p = ease(V.prog(t, start, dur));
      this.line.style.transform = `rotate(${this.angle}deg) scaleX(${p.toFixed(4)})`;
      this.line.style.opacity = p > 0 ? 1 : 0;
      return p;
    }
  };

  /* ---------------- SVG path drawing ---------------- */
  /** make an SVG overlay covering the stage (or given size) */
  V.svgLayer = (parent, w = V.W, h = V.H) => {
    const s = V.svg('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}` }, parent);
    s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; s.style.overflow = 'visible';
    return s;
  };
  /** set stroke reveal 0..1 on a path/circle/ellipse; caches total length */
  V.draw = (pathEl, p, reverse = false) => {
    if (pathEl._len == null) {
      pathEl._len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${pathEl._len} ${pathEl._len}`;
    }
    const off = pathEl._len * (1 - V.clamp(p));
    pathEl.style.strokeDashoffset = reverse ? -off : off;
    pathEl.style.opacity = p > 0.0005 ? '' : 0;
  };
  /** point along a path at fraction p */
  V.pointAt = (pathEl, p) => {
    if (pathEl._len == null) pathEl._len = pathEl.getTotalLength();
    return pathEl.getPointAtLength(pathEl._len * V.clamp(p));
  };

  /* ---------------- components ---------------- */
  V.pill = (parent, text, variant = '', x = 0, y = 0) => {
    const e = V.el('div', { cls: 'pill ' + variant, text, parent });
    e.style.left = x + 'px'; e.style.top = y + 'px';
    e._base = 'translate(-50%,-50%)';
    return e;
  };
  /** checkbox row. returns {el, box, tick, setChecked(p)} */
  V.check = (parent, text, x, y, o = {}) => {
    const e = V.el('div', { cls: 'chk ' + (o.cls || ''), parent });
    V.place(e, x, y, 'l');
    const box = V.el('span', { cls: 'box', parent: e });
    if (o.boxColor) box.style.borderColor = o.boxColor;
    const s = V.svg('svg', { width: 20, height: 20, viewBox: '0 0 20 20' }, box);
    const tick = V.svg('path', { d: 'M3.5 10.5 L8.2 15 L16.5 4.8', fill: 'none', stroke: o.tickColor || '#f1ede6', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
    const label = V.el('span', { text, parent: e });
    const api = { el: e, box, tick, label, setChecked: (p) => V.draw(tick, p) };
    api.setChecked(0);
    return api;
  };

  /* ---------------- scenes ---------------- */
  V.scenes = [];
  /**
   * V.addScene({ id, start, end, build(root), update(lt, t, root) })
   *  - build(root): create DOM once (root = full-stage div)
   *  - update(lt, t): lt = t - start (local time), t = absolute time
   *  Scene is displayed only for start <= t < end.
   */
  V.addScene = (s) => { V.scenes.push(s); };

  /* flashes: V.addFlash({ t, dur, color, peak, attack }) – full-screen overlay above everything */
  V.flashes = [];
  V.addFlash = (f) => V.flashes.push(Object.assign({ color: '#ffffff', peak: 0.9, attack: 0.06, hold: 0, dur: 0.4 }, f));

  /* ---------------- background ---------------- */
  // glow keys: [time, r, g, b, alpha, cx%, cy%] – interpolated with smoothstep. Scenes may push extra keys
  // via V.bgKeys before init (sorted automatically).
  V.bgKeys = [
    [0, 150, 18, 22, 0.30, 50, 45],
    [1.6, 130, 16, 20, 0.20, 50, 40],
    [7.0, 125, 14, 18, 0.17, 50, 55],
    [16.5, 120, 14, 18, 0.17, 35, 50],
    [35.5, 120, 14, 18, 0.16, 50, 45],
    [51.6, 90, 14, 16, 0.07, 50, 45],
    [64.5, 120, 14, 18, 0.12, 50, 45],
    [83.0, 120, 14, 18, 0.07, 50, 45],
    [84.5, 110, 150, 30, 0.13, 50, 40],
    [100.4, 140, 18, 22, 0.16, 50, 50],
    [102.4, 110, 150, 30, 0.14, 50, 50],
    [110.2, 110, 150, 30, 0.08, 50, 50],
  ];
  const smooth = (x) => x * x * (3 - 2 * x);
  function bgAt(t) {
    const k = V.bgKeys;
    if (t <= k[0][0]) return k[0];
    for (let i = 0; i < k.length - 1; i++) {
      if (t < k[i + 1][0]) {
        // hold most of the segment, blend over the last 0.9s before the next key
        const blendStart = Math.max(k[i][0], k[i + 1][0] - 0.9);
        const p = smooth(V.prog(t, blendStart, k[i + 1][0] - blendStart));
        return k[i].map((v, j) => (j === 0 ? t : V.lerp(v, k[i + 1][j], p)));
      }
    }
    return k[k.length - 1];
  }

  /* ---------------- build / render ---------------- */
  let stage, bgGlow, grain, grainCtx, scenesLayer, chrome, flashEl, mark, markNum, markName, markSq, fill, chromeEls;
  /** build every layer and scene inside `stageEl` (defaults to #stage in the standalone preview) */
  V.init = (stageEl) => {
    if (V._inited) return;
    V._inited = true;
    stage = stageEl || document.getElementById('stage');
    V.bgKeys.sort((a, b) => a[0] - b[0]);
    const bg = V.el('div', { cls: 'layer', parent: stage, attrs: { id: 'bg' } });
    bgGlow = V.el('div', { cls: 'layer', parent: bg });
    V.el('div', { cls: 'layer', parent: bg, style: { background: 'radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,.72) 100%)' } });
    scenesLayer = V.el('div', { cls: 'layer', parent: stage, attrs: { id: 'scenes' } });
    chrome = V.el('div', { cls: 'layer', parent: stage, attrs: { id: 'chrome' } });
    chromeEls = {
      tl: V.el('div', { cls: 'abs tl', text: 'ENERGY  DRAIN', parent: chrome }),
      tr: V.el('div', { cls: 'abs tr', text: '疲惫的心理学', parent: chrome }),
    };
    mark = V.el('div', { cls: 'abs mark', parent: chrome });
    markSq = V.el('span', { cls: 'sq', parent: mark });
    markNum = V.el('span', { cls: 'num', parent: mark });
    markName = V.el('span', { cls: 'name', parent: mark });
    const bar = V.el('div', { cls: 'abs bar', parent: chrome });
    fill = V.el('div', { cls: 'fill', parent: bar });
    for (const c of V.CHAPTERS) V.el('div', { cls: 'tick', parent: bar, style: { left: (c.t / V.DURATION) * 1186 + 'px' } });
    // film grain
    grain = V.el('canvas', { cls: 'layer', parent: stage, attrs: { width: 640, height: 360 }, style: { width: '1280px', height: '720px', opacity: 0.03, mixBlendMode: 'screen' } });
    grainCtx = grain.getContext('2d');
    flashEl = V.el('div', { cls: 'layer', parent: stage, style: { opacity: 0 } });

    for (const s of V.scenes) {
      s.root = V.el('div', { cls: 'scene', parent: scenesLayer, attrs: { 'data-id': s.id } });
      s.build(s.root);
    }
    V.scenes.sort((a, b) => a.start - b.start);
  };

  function drawGrain(frame) {
    const r = V.rng(frame * 7919 + 13);
    const img = grainCtx.createImageData(640, 360);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (r() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    grainCtx.putImageData(img, 0, 0);
  }

  function updateChrome(t) {
    // chrome hidden during the opening thought-wall, appears after the white flash
    const vis = V.ep(t, 1.55, 0.6);
    chromeEls.tl.style.opacity = vis; chromeEls.tr.style.opacity = vis;
    fill.parentNode.style.opacity = vis;
    fill.style.width = (V.clamp(t / V.DURATION) * 1186).toFixed(2) + 'px';
    // chapter marker
    // 与参考一致：旧章节标记保持到边界后 ≈0.1s 才淡出（与内容的出场同步），新标记随后淡入
    const HOLD = 0.12;
    let ci = -1;
    for (let i = 0; i < V.CHAPTERS.length; i++) if (t >= V.CHAPTERS[i].t + HOLD) ci = i;
    if (ci < 0) { mark.style.opacity = 0; return; }
    const c = V.CHAPTERS[ci];
    const next = V.CHAPTERS[ci + 1];
    const a = V.ep(t, c.t + 0.3, 0.45);
    const b = next ? 1 - V.ep(t, next.t - 0.06, 0.18, V.E.inOutCubic) : 1;
    mark.style.opacity = (a * b).toFixed(3);
    mark.style.filter = a < 1 ? `blur(${((1 - a) * 6).toFixed(2)}px)` : 'none';
    if (markNum.textContent !== c.n) { markNum.textContent = c.n; markName.textContent = c.name; }
    const col = c.lime ? 'var(--lime)' : 'var(--red)';
    markNum.style.color = col; markSq.style.background = col;
    markSq.style.boxShadow = c.lime ? '0 0 8px rgba(200,245,60,.7)' : '0 0 8px rgba(255,45,45,.7)';
  }

  function updateFlash(t) {
    let o = 0, col = '#fff';
    for (const f of V.flashes) {
      if (t < f.t || t > f.t + f.dur) continue;
      const lt = t - f.t;
      const v = lt < f.attack ? lt / f.attack : lt < f.attack + f.hold ? 1 : 1 - V.E.outCubic((lt - f.attack - f.hold) / Math.max(1e-6, f.dur - f.attack - f.hold));
      if (v * f.peak > o) { o = v * f.peak; col = f.color; }
    }
    // 全片结尾淡出到黑（按成片时间计算，不受时间映射里末段减速的影响）
    const end = V.T != null ? V.ep(V.T, V.SCORE.duration - 0.75, 0.72, V.E.inOutSine) : V.ep(t, V.DURATION - 0.75, 0.72, V.E.inOutSine);
    if (end > o) { o = end; col = '#000'; }
    flashEl.style.opacity = o.toFixed(3);
    flashEl.style.background = col;
  }

  /** t = 设计时间（秒）；frame 省略时由 t 推出（独立预览）。成片请用 V.renderReal。 */
  V.renderAt = (t, frame = Math.round(t * V.FPS)) => {
    V.t = t;
    const g = bgAt(t);
    bgGlow.style.background = `radial-gradient(ellipse 70% 75% at ${g[5]}% ${g[6]}%, rgba(${g[1] | 0},${g[2] | 0},${g[3] | 0},${g[4].toFixed(3)}) 0%, rgba(${g[1] | 0},${g[2] | 0},${g[3] | 0},0) 70%)`;
    for (const s of V.scenes) {
      const on = t >= s.start && t < s.end;
      if (on !== s._on) { s.root.style.display = on ? 'block' : 'none'; s._on = on; }
      if (on) s.update(t - s.start, t, s.root);
    }
    updateChrome(t);
    updateFlash(t);
    drawGrain(frame);
  };

  /** all text in the document – used to force-load font glyphs before capture */
  V.allText = () => {
    let s = '';
    for (const sc of V.scenes) s += sc.root.textContent;
    s += chrome.textContent + '0123456789:%.!?！？，。、“”「」·—+-=①②③';
    return Array.from(new Set(Array.from(s))).join('');
  };

  /* ---------------- 成片时间 → 设计时间 ----------------
   * 场景按参考视频配乐的节拍设计（V.beat：首拍 0.46s，拍长 0.4645s）。成片改用《运气的形状》的 BGM：
   * 首拍 0.070s，拍长 0.5314s（112.9 BPM），时长 130.0s。V.TIME_ANCHORS 以“拍号”给出 [设计拍, 新配乐拍]，
   * 相邻锚点之间线性插值：设计拍数 = 新拍数的段落逐拍对齐（每个出字依旧落在新配乐的拍点上）；
   * 拍数不同的段落只放在画面静止的停留/转场处（多出的设计拍 = 加速跳过，少的 = 放慢停留）。 */
  V.SCORE = { beat0: 0.070, beat: 0.5314, duration: 130.0 };
  // [设计拍, 新配乐拍]。两首曲子的第一个 drop 都在第 32 拍，开场逐拍一致；
  // 设计第 182 拍（荧光绿「先动起来。」）要落到新配乐第二个 drop（第 176 拍，93.6s）→ 之前在静止处共删 6 拍；
  // 之后新配乐还长 14.4 拍 → 在解法章节的静止停留处放慢。逐拍静止度见 productions/why-tired/PROGRESS.md。
  V.TIME_ANCHORS = [
    [104, 104], [108, 106], // 02 标题「省电本能」停留：4 拍并作 2 拍
    [132, 130], [136, 132], // 03「假装在休息」停留：4 → 2
    [152, 148], [154, 149], // 04「念头」停留：2 → 1
    [176, 171], [178, 172], // 04 走神研究脚注停留：2 → 1 ⇒ 设计 182 = 新 176（drop B）
    [184, 178], [188, 184], // 05「先动起来。」停留：4 → 6
    [194, 190], [196, 193], // 计时 05:00 停留：2 → 3
    [199, 196], [202, 201], // ① 具体计划 停留：3 → 5
    [208, 207], [210, 210], // ② 两列之间：2 → 3
    [229, 229], [234, 240], // 结尾行动号召 + 脚注：5 → 11；其后到 130.0s 为整体淡出
  ];
  // 参考配乐在 60s 处循环时拍点后移约 0.06s，场景里 60s 之后的时间按实测对齐，这里同步
  const designAt = (b) => V.BEAT0 + V.BEAT * b + (b >= 129 ? 0.06 : 0);
  const realAt = (b) => V.SCORE.beat0 + V.SCORE.beat * b;
  let mapCache = null;
  const timeMap = () => {
    if (mapCache) return mapCache;
    const pts = [[0, designAt((0 - V.SCORE.beat0) / V.SCORE.beat)]]; // 片头：t=0 对应设计拍 −0.13
    for (const [db, rb] of V.TIME_ANCHORS) pts.push([realAt(rb), designAt(db)]);
    pts.push([V.SCORE.duration, V.DURATION]);
    for (let i = 1; i < pts.length; i++) {
      if (!(pts[i][0] > pts[i - 1][0] && pts[i][1] >= pts[i - 1][1])) throw new Error('TIME_ANCHORS must increase: ' + JSON.stringify(pts));
    }
    return (mapCache = pts);
  };
  /** 成片时间 T（秒）→ 设计时间 t（秒） */
  V.designTime = (T) => {
    const pts = timeMap();
    if (T <= 0) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (T <= pts[i][0]) {
        const [r0, d0] = pts[i - 1], [r1, d1] = pts[i];
        return d0 + ((T - r0) / (r1 - r0)) * (d1 - d0);
      }
    }
    return V.DURATION;
  };
  /** 按成片时间渲染（Hypit 程序与成片预览都走这里） */
  V.renderReal = (T) => {
    V.T = T;
    V.renderAt(V.designTime(T), Math.round(T * V.FPS));
  };

  /** register @font-face rules: [{ family, weight, url }] */
  V.installFonts = (faces) => {
    const css = faces.map((f) => `@font-face{font-family:'${f.family}';src:url('${f.url}');font-weight:${f.weight};font-style:normal;font-display:block;}`).join('\n');
    V.el('style', { text: css, parent: document.head });
  };

  // Hypit 渲染（browser program）里由 setup 主动调用 V.init；独立预览页面则在 DOM 就绪后自动初始化
  V.ready = window.__KX_PROGRAM__ ? Promise.resolve(true) : (async () => {
    await new Promise((r) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', r) : r()));
    V.init();
    const txt = V.allText();
    const faces = ['900 40px NSerif', '700 40px NSerif', '400 40px NSans', '500 40px NSans', '700 40px NSans'];
    await Promise.all(faces.map((f) => document.fonts.load(f, txt)));
    await document.fonts.ready;
    V.renderAt(0);
    return true;
  })();
  window.__render = (t) => { V.T = null; V.renderAt(t); };
  window.__renderReal = (T) => V.renderReal(T);
})();
