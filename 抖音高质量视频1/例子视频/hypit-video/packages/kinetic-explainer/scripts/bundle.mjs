// 把 web/ 下的引擎与各章节场景（按 index.html 中的 <script> 顺序）打包成 src/web-bundle.ts，
// 让 Hypit 的 browser program 与独立预览页运行同一份代码。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const html = readFileSync(join(web, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
if (scripts[0] !== "engine.js" || scripts.length < 2) throw new Error("index.html must load engine.js first, then the scenes.");
const engine = scripts.map((file) => `/* ---- ${file} ---- */\n${readFileSync(join(web, file), "utf8")}`).join("\n;\n");
const style = readFileSync(join(web, "style.css"), "utf8");
writeFileSync(join(root, "src", "web-bundle.ts"),
  `// 由 scripts/bundle.mjs 生成，请勿手改；修改 web/ 后运行 npm run build。\n` +
  `export const SCRIPT_FILES: readonly string[] = ${JSON.stringify(scripts)};\n` +
  `export const ENGINE_SOURCE: string = ${JSON.stringify(engine)};\n` +
  `export const STYLE_SOURCE: string = ${JSON.stringify(style)};\n`);
console.log(`bundled ${scripts.length} scripts (${(engine.length / 1024).toFixed(0)} KiB) + style.css`);
