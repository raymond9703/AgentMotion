# AGENTS.md — 给任意 Agent 的使用说明

本仓库是一个"纯代码做视频"的工具包。宿主若是 Agent Skills 标准环境（Claude Code / WorkBuddy 等），优先读 `SKILL.md`。否则按本文件操作。

## 契约

页面（HTML）必须暴露：

```js
window.C2V = { fps, frames, width, height, draw(frame) }  // draw 为纯函数
window.CUES = [{ frame, name }]                            // 可选：切点/重音
```

禁止 `Math.random` / `Date.now` / rAF 累积状态。随机用种子随机，时间只来自帧号。

## 命令

```bash
npm i playwright-core                    # 一次性，在项目目录
node scripts/env-check.mjs               # 环境体检
node scripts/render.mjs film.html sheet.jpg --sheet 1    # 拼图（1帧/秒）
node scripts/render.mjs film.html still.png --stills 0,90,300
node scripts/render.mjs film.html out.mp4 --workers 6 [--audio music.mp3]
node scripts/probe.mjs out.mp4 1920x1080 30              # 编码断言
```

## 工作流（不要中途停下问，除非完全没有主题）

1. 读题：片型/时长/画幅 → 见 `references/workflow.md` 默认表
2. 选风格 → `styles/recipes.md`（15 种）
3. 分镜 → `references/storyboard.md`（BPM/SECTIONS/SHOTS/EVENTS 数据先行）
4. 从 `templates/starter.html` 起步实现
5. 自检 → `references/qc.md`：静帧核对分镜 → contact sheet 导演轮 ≥2 遍
6. 全片渲染 + probe → 交付 MP4 与 HTML，结尾一两句给可变更项

数据驱动/批量个性化场景改用 Remotion 后端：`references/backends.md` §2。
