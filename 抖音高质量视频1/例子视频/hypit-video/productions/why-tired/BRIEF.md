# Brief

**用户要的**：一条与参考视频（[`../../references/lazy-reference/`](../../references/lazy-reference/)）同等质量、同款风格的抖音横屏视频。
- 配乐：**用户后来指定**改用抖音《运气的形状》（Iwanau · Vibe知识大赏，https://v.douyin.com/j2OCi0dCkw8/）的音乐。
  云端环境的网络策略拦截了抖音，用户直接上传了该视频的 BGM（`assets/music/luck-shape-bgm.m4a`，130.0s，AAC）。
  参考视频的原配乐保留为 `assets/music/reference-score.m4a`（不再使用）。
- 内容改为：人为什么会懒；为什么什么都不干也很累；为什么心里想做很多事，现实却只想一直躺着。
- 工具（字体、渲染引擎、浏览器、Hypit 本身）从 GitHub 等处下载，和成片一起放在 `抖音高质量视频1/例子视频` 目录下；只读写这个目录。
- 用 GitHub 上的 hypit-ai/hypit 制作（已安装为 Skill，并以项目依赖 `@hypit/hypit@0.2.17` 使用）。

**约束与事实**
- 纯动效，无旁白、无生成模型 → 不产生任何模型服务费用（全部本地渲染，无需账号）。
- 时长、节拍、章节切换跟随所用 BGM：130.0s，30fps，112.9 BPM。
- 画面里的科学说法必须准确（已做事实核查，见 `../../../STORYBOARD.md` 末尾）。
- 云端环境无法直接写入用户的 `D:\`；成片放在本目录的 `output/`，并直接发给用户。

**付费范围**：无（未连接任何付费服务）。
