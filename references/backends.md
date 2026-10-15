# 后端选型

## §1 单文件 HTML Canvas（默认）

**是什么**：一个 HTML 文件 = 全部画面。无依赖、无构建、无字体/图片资源（零素材可审计）。
headless Chrome 逐帧调用 `C2V.draw(frame)` 截屏 → ffmpeg 编码。

- 适合：短片、插画/手绘/风格化、循环 GIF、"每个像素都被算出来"的片子
- 优点：agent 一遍写对概率最高；交付物同时是网页（可互动预览）
- 限制：复杂文字排版、3D 生态、批量数据换装弱于 Remotion
- 契约：`window.C2V = { fps, frames, width, height, draw(frame) }` + 可选 `window.CUES`
- 起点：`templates/starter.html`

## §2 React + Remotion

**是什么**：React 组件逐帧渲染。`useCurrentFrame()` 驱动，spring/interpolate 做动画。

- 适合：数据驱动模板（一条 JSON = 一支片）、批量个性化（Wrapped 场景，一条数据一支 MP4）、烧录字幕/旁白、图表组件生态、云端/Lambda 渲染
- 关键纪律：
  - 动画一律 `useCurrentFrame()` + `spring`/`interpolate`；禁 `setState`/`setInterval`/`Date.now()`
  - Composition 注册：`<Composition schema={zod} defaultProps>` —— 每条数据先过 schema 校验再渲
  - 字幕与场景切点用**同一份时间数组**驱动，永不漂移
  - 时长数据依赖时在 `calculateMetadata` 里算
- 验证循环：`npx remotion still <Comp> f.png --frame=N --props='{...}'` → 目检 → `npx remotion render`
- 批量：`bundle()` + 循环 `renderMedia({ inputProps: row })`，文件名按记录命名
- 起点：`npx create-video@latest`

## §3 只交付网页动画（不渲染 MP4）

若观众在浏览器里看（互动、hover、滚动），交付**单 HTML + 主时间线 + `?t=N` 定格**：

- 全片一条 GSAP 时间线（或一个 rAF 时钟），`?t=N` → `tl.pause(); tl.seek(N)`
- 验证：`npx playwright screenshot --wait-for-timeout=500 "file://$PWD/x.html?t=1.2" f.png`
- 检查三时刻（start/mid/end）+ `prefers-reduced-motion` 显示最终静止画面

## 什么时候升级后端

| 信号 | 动作 |
|---|---|
| 出现"同一支片 × N 份不同数据" | Canvas → Remotion |
| 需要烧录旁白字幕且时长 >60s | Remotion |
| 需要 3D 遮挡/阴影/真透视 | Three.js（Canvas 页内或 R3F） |
| 只是网页里动一下 | 别渲染，交付 HTML |
