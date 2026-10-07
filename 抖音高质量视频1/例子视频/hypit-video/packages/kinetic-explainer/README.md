# @lazy/kinetic-explainer

《为什么你什么都不干，却还是很累》的整片画面组件。章节标记、进度条、背景辉光和六个章节共享一个舞台和一个时钟，
因此由**一个** browser program 逐帧绘制（`render(localFrame)` 只根据帧号计算完整画面，可任意跳帧、分段并行渲染）。

```svml
<import as="kx" from="@lazy/kinetic-explainer@1"/>
<kx:Scene id="explainer" timeline={animation.timeline} canvas={canvas} during="program"
  serif-black={serif-black} serif-bold={serif-bold}
  sans-regular={sans-regular} sans-medium={sans-medium} sans-bold={sans-bold}/>
```

- `canvas`：16:9 任意尺寸；设计坐标 1280×720，按比例缩放（成片 1920×1080）。
- 五个字体输入是 `media:Font` 声明的精确字形文件（思源宋体 Black/Bold、思源黑体 Regular/Medium/Bold），
  以 Artifact 形式随渲染下发，程序内用 `@font-face` 引用。
- 内部时间表跟随节目时钟（秒 = 帧 / 帧率），所有出字都卡在复用配乐的节拍上，因此固定为 110.2s 的节目。

## 结构
- `web/engine.js`：时间驱动的动效引擎（缓动、逐字出现、划线、描边、背景、章节栏、进度条、闪屏）。
- `web/scenes/*.js`：各章节（intro、ch01–ch05），文案和编舞都在这里。
- `web/index.html`：独立预览页（浏览器打开 `?t=12.3` 定格、`?play` 实时播放）；`../../tools/preview.cjs` 用它快速出帧并与参考视频对比。
- `scripts/bundle.mjs`：把 `web/` 打包进 `src/web-bundle.ts`；`src/render.ts` 生成 VisualTrack；`src/activation.ts` 声明 Module、Producer 与 Surface。

修改 `web/` 后运行 `npm run build`（在本目录）再渲染。
