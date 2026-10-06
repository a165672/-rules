#!/usr/bin/env bash
# 从 GitHub (notofonts/noto-cjk) 下载渲染所需的思源宋体 / 思源黑体（简体中文子集）
set -euo pipefail
cd "$(dirname "$0")/fonts" 2>/dev/null || { mkdir -p "$(dirname "$0")/fonts"; cd "$(dirname "$0")/fonts"; }
B=https://raw.githubusercontent.com/notofonts/noto-cjk/main
for f in Serif/SubsetOTF/SC/NotoSerifSC-Black.otf Serif/SubsetOTF/SC/NotoSerifSC-Bold.otf \
         Sans/SubsetOTF/SC/NotoSansSC-Bold.otf Sans/SubsetOTF/SC/NotoSansSC-Medium.otf Sans/SubsetOTF/SC/NotoSansSC-Regular.otf; do
  [ -s "$(basename "$f")" ] || curl -fL -o "$(basename "$f")" "$B/$f"
done
ls -la
