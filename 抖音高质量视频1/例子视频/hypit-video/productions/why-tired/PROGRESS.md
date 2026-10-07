# Progress

**现在**：成片已交付——`../../../output/为什么你什么都不干却还是很累.mp4`（Build `bld_20261007T110149916Z_44E5E20486`，`final.video`）。
1920×1080，30fps，3900 帧，130.0s，H.264 2.6 Mbps + AAC 48k 立体声；音轨与 BGM 源文件 0 ms 偏移，片尾 1s 淡出。
已抽帧核对：17.0s 第一个 drop、87.2s 弱拍段起点（旧观念划掉）、93.6s 第二个 drop（「先动起来。」）、129.95s 黑场。

**若要修改**：改 `packages/kinetic-explainer/web/` → `npm --prefix packages/kinetic-explainer run build` →
`tools/hypit.sh build productions/why-tired/runs/final.svrun --title <名字> --follow` → `tools/hypit.sh get <build-id> --output final.video --to <路径>`。

**已完成**
- Hypit 0.2.17 安装为项目依赖；Skill 部署在 `~/.claude/skills/hypit`（→ `../../../tools/hypit/skills/hypit`）。
- 渲染程序：@hyperframes/engine 0.7.101 + Chrome Headless Shell 152.0.7928.2（`tools/chrome`、`tools/hypit-state`）。
- 六个章节逐 0.25s 对照参考审片并修正 + 全片一致性检查（章节交接、字号、辉光）；文案已按事实核查修改。
- 配乐换成用户上传的《运气的形状》BGM（130.0s，112.9 BPM，网格 t = 0.070 + 0.5314·n，8 个乐句漂移 < 5ms）。
  引擎时间映射 `V.TIME_ANCHORS`（`packages/kinetic-explainer/web/engine.js`）：
  - 开场逐拍一致（两曲第一个 drop 都在第 32 拍，17.1s）；
  - drop 前在 4 处静止停留共加速跳过 6 拍：设计第 169 拍（旧观念被划掉）= 新配乐弱拍段起点 87.2s，
    设计第 182 拍（荧光绿「先动起来。」）= 第二个 drop 93.6s；
  - drop 后在 5 处静止停留共放慢 +14 拍，片尾整体淡出到 130.0s。
  静止度依据：`build/static` 逐拍帧差（S = 仅剩胶片颗粒的变化）。
- 开场试渲染 Build `bld_20261007T092208568Z_866808B4FA`（旧配乐时的 0–16.5s）验证了字体、程序与混音链路。
