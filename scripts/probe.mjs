#!/usr/bin/env node
/** AgentMotion — assert an MP4's codec/size/fps. usage: node probe.mjs out.mp4 [WxH] [fps] */
import { spawnSync } from "node:child_process";

const file = process.argv[2];
if (!file) { console.error("usage: node probe.mjs <out.mp4> [WxH] [fps]"); process.exit(2); }
const wantSize = process.argv[3], wantFps = process.argv[4];

const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
  "-show_entries", "stream=codec_name,width,height,avg_frame_rate",
  "-of", "default=noprint_wrappers=1", file]);
if (r.status !== 0) { console.error("ffprobe failed"); process.exit(1); }
const out = r.stdout.toString();
console.log(out.trim());

const get = (k) => (out.match(new RegExp(k + "=(.+)")) || [])[1];
let ok = true;
if (wantSize) {
  const [w, h] = wantSize.split("x");
  if (get("width") !== w || get("height") !== h) { console.error(`size mismatch, want ${wantSize}`); ok = false; }
}
if (wantFps && get("avg_frame_rate") !== `${wantFps}/1`) { console.error(`fps mismatch, want ${wantFps}`); ok = false; }
if (get("codec_name") !== "h264") { console.error("codec should be h264 for shareability"); ok = false; }
console.log(ok ? "probe OK" : "probe FAILED");
process.exit(ok ? 0 : 1);
