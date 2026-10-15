#!/usr/bin/env node
/**
 * code2video — deterministic renderer
 *
 * Contract: the page must expose
 *   window.C2V = { fps, frames, width, height, draw(frame) }
 * where draw() is a pure function of the frame number.
 *
 * Usage:
 *   node render.mjs film.html out.mp4 [--audio music.mp3] [--workers 4] [--fps N] [--crf 18]
 *   node render.mjs film.html sheet.jpg --sheet 1        # contact sheet, 1 frame per second
 *   node render.mjs film.html still.png --stills 0,90,300
 */
import { chromium } from "playwright-core";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// ---------- args ----------
const args = process.argv.slice(2);
const input = args[0];
const output = args[1];
if (!input || !output) {
  console.error("usage: node render.mjs <film.html> <out.(mp4|png|jpg)> [--sheet N] [--stills a,b,c] [--audio f] [--workers N] [--fps N] [--crf N]");
  process.exit(2);
}
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i === -1 ? def : args[i + 1];
};
const intFlag = (name, def) => (args.includes(name) ? parseInt(flag(name, def), 10) : def);
const sheetSec   = args.includes("--sheet") ? parseFloat(flag("--sheet", "1")) : null;
const stills     = args.includes("--stills") ? flag("--stills", "").split(",").map(Number) : null;
const workers    = Math.max(1, intFlag("--workers", 4));
const crf        = intFlag("--crf", 18);
const audio      = args.includes("--audio") ? flag("--audio", "") : null;

const absInput = path.resolve(input);
const absOutput = path.resolve(output);
if (!fs.existsSync(absInput)) { console.error(`input not found: ${absInput}`); process.exit(2); }

// ---------- helpers ----------
function run(cmd, cmdArgs, opts = {}) {
  const r = spawnSync(cmd, cmdArgs, { stdio: ["ignore", "pipe", "pipe"], ...opts });
  if (r.status !== 0) {
    console.error(`${cmd} failed:\n${r.stderr?.toString().slice(-2000)}`);
    process.exit(1);
  }
  return r;
}
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "c2v-"));

async function launch() {
  for (const channel of ["chrome", "msedge", "chrome-beta", "edge"]) {
    try { return await chromium.launch({ channel, headless: true }); }
    catch { /* try next */ }
  }
  console.error("No Chrome/Edge found. Install one, or pass playwright chromium executable.");
  process.exit(1);
}

async function openPage(browser, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error(`[pageerror] ${e.message}`));
  const sep = absInput.replace(/\\/g, "/").includes("?") ? "&" : "?";
  await page.goto("file://" + absInput.replace(/\\/g, "/") + sep + "still=1");
  await page.waitForFunction(() => window.C2V && typeof window.C2V.draw === "function", { timeout: 15000 });
  return page;
}

async function grabFrame(page, frame) {
  await page.evaluate((f) => { window.C2V.draw(f); }, frame);
  // two rAFs: guarantee the canvas paint is flushed before screenshot
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return page.screenshot({ type: "png" });
}

// ---------- main ----------
const browser = await launch();
const probe0 = await openPage(browser, 1280, 720);
const cfg = await probe0.evaluate(() => ({
  fps: +window.C2V.fps, frames: +window.C2V.frames,
  width: +window.C2V.width, height: +window.C2V.height,
}));
await probe0.close();
if (!cfg.frames || !cfg.fps) { console.error("page must define C2V.fps and C2V.frames"); process.exit(2); }
const fps = intFlag("--fps", cfg.fps);
console.log(`film: ${cfg.frames} frames @ ${fps}fps, ${cfg.width}x${cfg.height}`);

const pages = [];
const browser2 = await launch();
for (let i = 0; i < Math.min(workers, cfg.frames); i++) {
  pages.push(await openPage(browser2, cfg.width, cfg.height));
}

async function renderFrames(frameList, dir) {
  let idx = 0, done = 0;
  const total = frameList.length;
  await Promise.all(pages.map(async (page) => {
    while (true) {
      const k = idx++;
      if (k >= total) return;
      const buf = await grabFrame(page, frameList[k]);
      fs.writeFileSync(path.join(dir, `f${String(k + 1).padStart(5, "0")}.png`), buf);
      if (++done % 30 === 0 || done === total) console.log(`  ${done}/${total}`);
    }
  }));
}

function tileSheet(frameList, dir, out, cols) {
  const n = frameList.length;
  const rows = Math.ceil(n / cols);
  const list = fs.readdirSync(dir).filter(f => f.endsWith(".png")).sort()
    .map(f => path.join(dir, f));
  // re-copy in order to guarantee contiguous names for image2 demuxer
  const seq = fs.mkdtempSync(path.join(os.tmpdir(), "c2vseq-"));
  list.forEach((f, i) => fs.copyFileSync(f, path.join(seq, `s${String(i + 1).padStart(5, "0")}.png`)));
  run("ffmpeg", ["-y", "-framerate", "1", "-i", path.join(seq, "s%05d.png"),
    "-vf", `scale=480:-1,tile=${cols}x${rows}`, "-frames:v", "1", "-q:v", "3", out]);
  fs.rmSync(seq, { recursive: true, force: true });
}

try {
  if (stills) {
    const dir = tmpRoot;
    const pagesCopy = pages;
    let idx = 0;
    await Promise.all(pagesCopy.map(async (page) => {
      while (true) {
        const k = idx++; if (k >= stills.length) return;
        const f = stills[k];
        const buf = await grabFrame(page, f);
        const out = stills.length === 1 ? absOutput
          : absOutput.replace(/(\.\w+)?$/, `_${String(f).padStart(5, "0")}$1`);
        fs.writeFileSync(out.endsWith(".png") ? out : out + ".png", buf);
        console.log(`still @frame ${f} -> ${out}`);
      }
    }));
  } else if (sheetSec) {
    const step = Math.max(1, Math.round(fps * sheetSec));
    const frameList = [];
    for (let f = 0; f < cfg.frames; f += step) frameList.push(f);
    await renderFrames(frameList, tmpRoot);
    const cols = Math.min(6, Math.ceil(Math.sqrt(frameList.length)));
    tileSheet(frameList, tmpRoot, absOutput, cols);
    console.log(`sheet (${frameList.length} frames) -> ${absOutput}`);
  } else {
    const frameList = Array.from({ length: cfg.frames }, (_, i) => i);
    await renderFrames(frameList, tmpRoot);
    const fArgs = ["-y", "-framerate", String(fps), "-i", path.join(tmpRoot, "f%05d.png"),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", String(crf), "-preset", "medium"];
    if (audio) fArgs.push("-i", path.resolve(audio), "-c:a", "aac", "-b:a", "192k", "-shortest");
    fArgs.push(absOutput);
    run("ffmpeg", fArgs);
    console.log(`mp4 -> ${absOutput}`);
  }
} finally {
  await browser.close().catch(() => {});
  await browser2.close().catch(() => {});
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}
