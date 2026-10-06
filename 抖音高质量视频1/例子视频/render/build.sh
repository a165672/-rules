#!/usr/bin/env bash
# 一键渲染：逐帧截图 → x264 编码 → 混入参考配乐（音频流直接复制，与原片完全一致）
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="output/为什么你什么都不干却还是很累.mp4"
WORKERS="${WORKERS:-4}"
rm -rf build/frames
node render/render.js frames --out build/frames --workers "$WORKERS"
ffmpeg -hide_banner -loglevel warning -y -framerate 30 -i build/frames/f_%05d.jpg -i audio/配乐.m4a \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -tune animation \
  -c:a copy -shortest -movflags +faststart "$OUT"
ffprobe -hide_banner -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
echo "done -> $OUT"
