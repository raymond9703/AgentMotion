#!/usr/bin/env node
/** AgentMotion — environment check: node, ffmpeg, browser, playwright-core */
import { spawnSync } from "node:child_process";


let ok = true;
const say = (name, good, detail = "") => {
  console.log(`${good ? "OK  " : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!good) ok = false;
};

const v = process.versions.node;
say("node", parseInt(v) >= 18, `v${v} (need >= 18)`);

const ff = spawnSync("ffmpeg", ["-version"]);
say("ffmpeg", ff.status === 0, ff.status === 0 ? ff.stdout.toString().split("\n")[0].slice(0, 60) : "not on PATH");

let pw = null;
try { pw = await import("playwright-core"); say("playwright-core", true, "resolvable"); }
catch { say("playwright-core", false, "run: npm i playwright-core (at repo root)"); }

try {
  if (pw) {
    const { chromium } = pw;
    let found = null;
    const opts = [];
    const envPath = process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    if (envPath) opts.push({ executablePath: envPath });
    for (const channel of ["chrome", "msedge"]) opts.push({ channel });
    for (const o of opts) {
      try { const b = await chromium.launch({ ...o, headless: true }); found = o.executablePath || o.channel; await b.close(); break; } catch {}
    }
    say("browser", !!found, found ? `${found} launches` : "no Chrome/Edge launchable");
  }
} catch {}

console.log(ok ? "\nenvironment ready" : "\nfix the FAIL items above");
process.exit(ok ? 0 : 1);
