---
name: code2video
description: 一句话出片 · 纯代码视频生成统一框架。用代码逐帧绘制并渲染出 MP4 —— 无素材、无 AI 视频模型、帧=f(t) 完全确定性。当用户要"用代码做视频""做一支动画/讲解片/宣传片/数据视频/风格目录片""逐帧绘制动画""把数据变成可分享视频""不知道用什么风格/技法"时使用。统一调度两种渲染后端（零素材 HTML Canvas / React+Remotion）、15 种商用级风格配方与完整质检循环。Not for editing existing video files, and not for diffusion-model video generation (Wan/Hunyuan/LTX).
version: 1.0.0
license: MIT
---

# code2video — 纯代码视频生成统一框架

把"一句话"变成一支全部由代码绘制出来的 MP4。本技能是**编排层**：它帮你选后端、选风格、走流程、过质检；具体绘制知识在 `references/` 与 `styles/`。

## 核心不变量（所有后端共用）

**每一帧都是帧号的纯函数：`frame = f(t)`。** 不用 `Math.random()`（用种子随机）、不用 `Date.now()`、不用 rAF 累积状态。这是确定性渲染、并行出帧、逐帧自检能成立的前提。违反它，渲染和预览就会对不上。

## 第一步：选后端（决策树）

| 场景 | 后端 | 参考 |
|---|---|---|
| 短片（≤60s）、零外部素材、插画/手绘/风格化 | **单文件 HTML Canvas** | `references/backends.md` §1 |
| 数据驱动、批量个性化（一条数据一支片）、字幕/旁白烧录、3D/图表组件生态 | **React + Remotion** | `references/backends.md` §2 |
| 网页里直接播放的交互动画（不需要 MP4） | 单文件 HTML，交付 HTML 而非渲染 | `references/backends.md` §3 |

拿不准就选 Canvas 单文件：依赖最少、agent 最容易一遍写对。

## 第二步：选风格

查 `styles/recipes.md`（15 种商用级风格：调色板 / 核心技法 / 运动规律 / 避坑）。用户说不出风格时，让他挑或按主题推荐；两支不同的片子**默认不复用**同一套视觉与配乐。

## 第三步：标准工作流（不要中途停下问）

1. **读题**：从用户输入推断片型（故事/讲解/盘点/循环/数据片）、时长（默认 15-20s）、画幅（默认 1920×1080；数据分享片用 1080×1920）。字幕语言跟随用户输入语言。
2. **分镜**：先定 BPM 与段落数据（`SECTIONS`/`SHOTS`/`EVENTS`），画面与配乐都读同一份时间数据，音画天然对齐（`references/storyboard.md`）。
3. **搭骨架**：从 `templates/starter.html` 复制（Canvas 后端），替换调色板与世界绘制。保持契约：页面暴露 `window.C2V = { fps, frames, width, height, draw(frame) }`，`draw` 是纯函数。
4. **自检后渲染**（顺序不能反）：

```bash
node scripts/render.mjs film.html sheet.jpg --sheet 1          # 1帧/秒 拼图， stepping off cuts
node scripts/render.mjs film.html still.png --stills 0,90,300  # 指定时刻静帧
node scripts/env-check.mjs                                      # 环境体检
node scripts/render.mjs film.html out.mp4 --audio music.mp3     # 全片渲染（可选配乐）
node scripts/probe.mjs out.mp4 1920x1080 30                     # 断言编码参数
```

5. **目检两轮**（`references/qc.md`）：① 分镜符合度——在每个镜头的动作节拍处截帧，对照分镜行核对；② 导演轮——看 contact sheet，评节奏/景别多样性/死帧/每个动作是否有声音。至少两轮，改哪帧只重渲哪帧。
6. **交付**：MP4 + HTML（HTML 可在浏览器直接播放）。结尾一两句提供可变更项：换风格、换配乐、改时长。

Remotion 后端的渲染与验证用 `npx remotion still` → 目检 → `npx remotion render`（见 `references/backends.md` §2）。

## 防翻车规则（最高频失败）

- **纯函数**。任何状态累积都会导致并行渲染错帧。
- **手绘线条要"沸腾"不要"抖动"**：wobble 种子每 4 帧一换（≈7.5 次/秒），每帧一换读起来是噪声。
- **身体用椭圆与圆角矩形**，少点多边形读起来像路牌。
- **绘制顺序显式从后往前**，多数"脸被挡住"是画序问题。
- **文字永不碰撞**：给文字块与关键物体占位（claim），交付前逐帧查版面。
- **切点与动作点落在节拍上**，且响度跳变 ≤+6dB，否则读起来像惊吓（`references/audio.md`）。

## 文件地图

| 文件 | 内容 |
|---|---|
| `scripts/render.mjs` | 确定性渲染核心：MP4 / 静帧 / contact sheet，多 worker 并行 |
| `scripts/env-check.mjs` / `probe.mjs` | 环境体检 / MP4 编码断言 |
| `templates/starter.html` | 帧=f(t) 骨架：契约、种子随机、缓动、相机、节拍 |
| `styles/recipes.md` | 15 种风格代码级配方 |
| `references/*.md` | 工作流 / 分镜 / 技法 / 质检 / 配乐 / 后端选型 |
| `examples/hello-drop.html` | 可立即运行的最小示例 |

## 依赖

Node 18+、ffmpeg（PATH 可达）、Chrome 或 Edge；`npm i playwright-core`（在**你的项目目录**装，不是本技能目录）。
