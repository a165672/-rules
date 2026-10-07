# Hypit 工程：为什么你什么都不干，却还是很累

用 [hypit-ai/hypit](https://github.com/hypit-ai/hypit)（0.2.17）制作的纯动效知识视频，复刻 `../reference/参考视频.mp4` 的风格与配乐。

```
hypit-video/
├─ references/lazy-reference/   参考视频的整体解读（ANALYSIS）与时间线（TIMELINE）
├─ productions/why-tired/       BRIEF / TREATMENT / PROGRESS + authors/main.svml + recipes/ + runs/
├─ packages/kinetic-explainer/  项目组件：整片画面（web/ 下是引擎与各章节场景）
├─ assets/fonts/                思源宋体 / 思源黑体（GitHub notofonts/noto-cjk，tools/get_fonts.sh 可重新下载）
├─ assets/music/                参考视频原配乐（无损提取）
├─ tools/hypit.sh               运行 Hypit（机器级状态也放在 tools/hypit-state）
├─ tools/preview.cjs            快速预览 / 与参考视频逐时刻对比
└─ hypit.runtime.json           本地渲染配置（HyperFrames + FFmpeg，浏览器缓存在 tools/chrome）
```

## 重新渲染
需要 Node 22.15+ 和 FFmpeg。

```bash
npm install                                   # 安装 @hypit/hypit 与项目组件
bash tools/get_fonts.sh                       # 若 assets/fonts 为空
npm --prefix packages/kinetic-explainer run build
tools/hypit.sh programs prepare --endpoint hyperframes.local   # 首次：准备渲染引擎与 Chrome Headless Shell
tools/hypit.sh check productions/why-tired/authors/main.svml
tools/hypit.sh build productions/why-tired/runs/final.svrun --title final --follow
tools/hypit.sh get <build-id> --output final.video --to ../output/为什么你什么都不干却还是很累.mp4
```

只看某一段：`runs/opening.svrun`（0–16.5s）。快速看帧：`node tools/preview.cjs preview --from 16.5 --to 35.5 --step 1 --out build/preview/ch01 --compare`。
