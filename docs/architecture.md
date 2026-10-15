# 架构与设计

## 分层

```
┌─ 编排层 SKILL.md / AGENTS.md ── 选型决策树 + 工作流 + 防翻车规则
├─ 工具层 scripts/ ────────────── render.mjs(确定性渲染) · env-check · probe
├─ 模板层 templates/ ──────────── starter.html(帧=f(t) 骨架 + 相机 + 节拍)
├─ 知识层 references/ ─────────── workflow · storyboard · techniques · qc · audio · backends
└─ 风格层 styles/ ─────────────── 15 种商用级配方(调色板/技法/运动/避坑)
```

## 为什么统一在「帧 = f(t)」

三种能力共享同一个前提：
1. **并行渲染**：帧之间无依赖才能多 worker 出帧；
2. **逐帧自检**：任意时刻可单独截帧核对分镜；
3. **复渲一致**：改一帧只重渲一帧，成本 O(1)。

因此契约只有一条：页面暴露 `C2V.draw(frame)`，内部禁状态、禁真随机、禁时钟。

## 渲染管线

```
HTML(+C2V 契约) → headless Chrome(N 个 page)
  → 逐帧 page.evaluate(draw(f)) → 2×rAF 刷 → screenshot
  → PNG 序列 → ffmpeg(libx264, yuv420p, 可混音) → MP4
```

静帧模式与 contact sheet 模式复用同一条管线，只是帧列表不同——这保证"自检看到的"和"成片渲染的"是同一个画面来源。

## 与上游社区的关系（致谢）

- 「用 Opus 一句话出片」社区案例库（提示词方法论、成本实测）
- JohnHeibel/PDoomVideo 与 ClaudeAnimationBase（MIT）——手绘动画流水线与"渲染-目检"循环的思想来源
- Remotion 官方生态——数据驱动后端
- 「十五种 MG 风格」展示片——风格目录片型的观察对象

本项目文档与代码均为原创重写：规则用自己的语言重新表述，配方代码从零实现，不包含上游文本或源码的复制。若需完整原始内容请访问各上游项目。

## 版本

v1.0.0 — 首个公开版本：编排层 / Canvas 后端渲染器 / 15 风格配方 / 六篇参考文档 / 最小示例。
