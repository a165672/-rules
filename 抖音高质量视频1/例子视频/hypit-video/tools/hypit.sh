#!/usr/bin/env bash
# 运行本项目的 Hypit：机器级状态（渲染引擎依赖、浏览器等）也放在本项目 tools/ 下，不写到用户目录。
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
export HYPIT_STATE_HOME="${HYPIT_STATE_HOME:-$here/tools/hypit-state}"
cd "$here"
exec node "$here/node_modules/@hypit/hypit/bin/hypit.mjs" "$@"
