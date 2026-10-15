# code2video (English)

**One prompt, one film — every frame drawn in code.**

`code2video` is an agent skill for programmatic video: it makes AI agents draw every frame in code and render a real MP4 — no generated assets, no diffusion video models. Every frame is a pure function of the frame number: deterministic, self-checkable, parallelizable, re-renderable.

See the [Chinese README](README.md) for the full document. Quick facts:

- **Two backends**: zero-asset single-file HTML Canvas (default) and React+Remotion (data-driven / batch).
- **15 production-grade style recipes**: frame-by-frame hand-drawn, isometric, flat vector, line art, 3D, morphing, sticker explainer, cyberpunk HUD, collage, glassmorphism, Bauhaus, synthwave, pixel art, liquid motion, variety-show lettering.
- **Deterministic tooling**: `scripts/render.mjs` (MP4 / stills / contact sheets, multi-worker), env check, encode probe.
- **Agent-agnostic**: `SKILL.md` for Agent-Skills hosts, `AGENTS.md` for any shell-capable agent, plain CLI for humans.

```bash
node scripts/env-check.mjs
npm i playwright-core
node scripts/render.mjs examples/hello-drop.html out.mp4
```

MIT © 2026 code2video contributors. All code and docs are original; see docs/architecture.md for upstream inspiration credits.
