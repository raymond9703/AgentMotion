# code2video

**一句话出片 · 纯代码视频生成统一框架 / One prompt, one film — every frame drawn in code.**

`code2video` 是一个面向 AI Agent 的视频创作技能（Agent Skill）：让模型用**代码逐帧绘制**并渲染出真正的 MP4——不生成素材、不调用扩散视频模型，每一帧都是帧号的纯函数 `frame = f(t)`，完全确定性、可自检、可并行、可复渲。

适用于：故事短片 · 科普讲解 · 产品宣传 · 数据盘点（Wrapped 式）· 风格目录片 · 无缝循环。

---

## 它解决什么问题

社区已经证明「强推理模型 + Node/Chrome/ffmpeg」就能纯代码出片，但相关知识散落在十几个独立技能与案例库里，入口互不相通。`code2video` 把它们统一为**一个入口 + 两种后端 + 15 种风格配方 + 一条质检流水线**：

| 层 | 内容 |
|---|---|
| 编排 | `SKILL.md`（Agent 入口）：选后端 → 选风格 → 分镜 → 自检 → 渲染 → 质检 → 交付 |
| 后端 | §1 零素材单文件 Canvas（默认）· §2 React+Remotion（数据驱动/批量）· §3 纯网页动画 |
| 风格 | 15 种商用级配方（逐帧手绘 / 等轴 / 扁平矢量 / 线条 / 3D / 形变 / 贴纸科普 / 赛博 HUD / 拼贴 / 玻璃拟态 / 包豪斯 / Synthwave / 像素 / 液态 / 综艺花字） |
| 工具 | `render.mjs` 确定性渲染（MP4 / 静帧 / contact sheet / 多 worker 并行）· 环境体检 · 编码断言 |
| 知识 | 工作流 · 分镜与节拍 · 绘制技法 · 质检清单 · 音画对齐（切点防惊吓） |

## 快速开始

```bash
# 0) 环境（Node 18+ / ffmpeg / Chrome 或 Edge）
node scripts/env-check.mjs
npm i playwright-core          # 在你的项目目录装

# 1) 跑通最小示例
node scripts/render.mjs examples/hello-drop.html sheet.jpg --sheet 1   # 先看拼图
node scripts/render.mjs examples/hello-drop.html out.mp4               # 全片 8s

# 2) 做你自己的片
cp templates/starter.html my-film.html   # 改 SECTIONS / SHOTS / PALETTE / 世界绘制
node scripts/render.mjs my-film.html preview.mp4 --workers 6
node scripts/probe.mjs preview.mp4 1920x1080 30
```

## 怎么被 Agent 调用

- **Claude Code / WorkBuddy 等 Agent Skills 宿主**：把本仓库放入技能目录，`SKILL.md` 的 frontmatter 会自动匹配"用代码做视频"类请求。
- **任意有 shell 的 Agent（Cursor / Codex / 自研）**：读 `AGENTS.md` 即可——它指向同一套契约与 CLI，无宿主锁定。
- **CLI 直用**：所有能力都是普通 node 脚本，人也能用。

## 设计原则

1. **帧 = f(t)**：纯函数是确定性渲染、并行出帧、逐帧自检的共同前提，写进每条规则。
2. **自检先于渲染，静帧先于全片**：contact sheet 与指定时刻静帧是最便宜的纠错面。
3. **音画同源**：画面与配乐读同一份 `SECTIONS/SHOTS/EVENTS` 时间数据，切点天然在拍上。
4. **知识可审计**：每个配方都写到"调色板/技法/运动/避坑"粒度，模型照做即可复现质感。

## 与上游社区的关系

本项目受社区公开案例与方法论启发（"用 Opus 一句话出片"的提示词案例库、PDoomVideo/ClaudeAnimationBase 的手绘动画流水线、Remotion 官方生态等），**所有代码与文档均为原创重写**，未复制任何上游受版权保护的内容。详见 [docs/architecture.md](docs/architecture.md) 的致谢一节。

## 路线图

- [ ] `sync-check.mjs`：切点在拍与响度跳变自动校验（当前在 references/audio.md 中给出规则，工具待发布）
- [ ] `layout-check.mjs`：文字碰撞自动检测
- [ ] Remotion 官方模板脚手架（`templates/remotion/`）
- [ ] 配乐合成模板库（Web Audio `SCORE`）
- [ ] MCP Server 封装

## License

MIT © 2026 code2video contributors
