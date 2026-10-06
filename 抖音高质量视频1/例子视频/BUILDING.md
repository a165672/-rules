# 制作说明（工程结构 / 如何重新渲染 / 场景开发规范）

```
例子视频/
├─ STORYBOARD.md          分镜脚本（文案 + 时间轴）
├─ reference/参考视频.mp4  参考视频（原片）
├─ reference/frames/      参考视频每秒一帧（g_NNN.jpg 对应第 NNN-1 秒）
├─ audio/配乐.m4a          从参考视频无损提取的配乐
├─ tools/fonts/           从 GitHub notofonts/noto-cjk 下载的思源宋体 / 思源黑体
├─ tools/get_tools.sh     重新下载字体
├─ src/                   动画源码（HTML + JS，时间驱动、逐帧确定）
│   ├─ engine.js          引擎：时间轴、缓动、逐字动画、划线、描边、背景、章节栏、进度条
│   ├─ style.css
│   └─ scenes/*.js        每个章节一个文件
├─ render/render.js       Playwright 逐帧截图
├─ render/build.sh        一键：渲染全部帧 → ffmpeg 合成 → 混入配乐
└─ output/                成片
```

## 重新渲染
需要 Node 18+、ffmpeg、Playwright（`npm i -D playwright && npx playwright install chromium`）。

```bash
bash tools/get_tools.sh          # 下载字体（若 tools/fonts 为空）
bash render/build.sh             # 输出 output/为什么你什么都不干却还是很累.mp4
```

预览某些时刻（并与参考视频同一时刻上下对比）：
```bash
node render/render.js preview --from 16.5 --to 35.5 --step 1 --out build/preview/ch01 --compare
```
在浏览器中打开 `src/index.html?t=20` 可以定格查看某一时刻，`src/index.html?play` 可以实时播放（无声）。

## 场景开发规范
- 设计坐标 1280×720，渲染时 ×1.5 输出 1080p。
- 每个场景：`V.addScene({ id, start, end, build(root), update(lt, t) })`。`build` 只建一次 DOM，`update` 每帧根据时间设置样式。
- 一切动画必须是时间 t 的纯函数：不要用 CSS transition/animation、`Math.random`、`Date`；随机用 `V.rng(seed)`。
- 文字：`new V.Text(parent, '大脑先拉响了<r>警报</r>。', {cls:'serif', x, y, style:{fontSize:'40px'}})`，
  `T.reveal(t, start, {stagger, dur, blur, dy})` 逐字出现，`T.anim(t, start, outStart)` 出现 + 模糊淡出。
  颜色标签：`<r>` 红辉光、`<g>` 荧光绿、`<w>` 白、`<d>` 灰、`<f>` 暗灰。
- 划线：`new V.Strike(target, {...}).update(t, start, dur)`；SVG 描边：`V.draw(path, p)`、`V.pointAt(path, p)`。
- 节拍：`V.beat(n)` = 第 n 拍的时间（≈129 BPM），关键动作尽量落在拍点上。
- 全屏闪光：`V.addFlash({t, attack, hold, dur, peak, color})`。
- 背景辉光关键帧：`V.bgKeys`（引擎内），场景如需局部辉光请在自己的 root 里加元素。
