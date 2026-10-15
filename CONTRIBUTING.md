# 贡献指南

欢迎 PR。约定：

## 提交内容

- **新风格配方**：放 `styles/recipes.md`，必须包含调色板 / 核心技法 / 运动规律 / 避坑四段，且给出可用 `render.mjs` 验证的实现要点（欢迎附 examples 链接）。
- **脚本改进**：`scripts/` 下保持零硬依赖（仅 playwright-core + ffmpeg）；Windows/macOS/Linux 三平台可用。
- **参考文档**：`references/` 下新规则必须是"实测过会翻车的坑"，注明症状与处方。

## 质量门槛

1. `node scripts/env-check.mjs` 全绿
2. 示例可渲染：`node scripts/render.mjs examples/xxx.html out.mp4 && node scripts/probe.mjs out.mp4`
3. 新增页面遵守契约：`window.C2V`、`draw(frame)` 纯函数、种子随机
4. 文档语言：中文为主、关键标题附英文

## 原则

- 不引入生成式素材（图片/字体文件/扩散模型输出）；"零素材"是本项目的核心承诺
- 引用社区方法时注明来源；不复制受版权保护的内容
