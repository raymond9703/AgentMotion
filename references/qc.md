# 质检清单（渲染前必须全绿）

## 自动检查

```bash
node scripts/render.mjs film.html sheet.jpg --sheet 1       # contact sheet
node scripts/render.mjs film.html still.png --stills 90,300 # 指定时刻
node scripts/render.mjs film.html out.mp4                   # 全片
node scripts/probe.mjs out.mp4 1920x1080 30                 # 编码断言
```

- [ ] 页面无 `[pageerror]`（渲染器会把页面异常打到 stderr）
- [ ] probe OK：h264 / 尺寸 / 帧率正确，能被普通播放器解码

## 第一轮：分镜符合度

在每个镜头的**动作节拍处**截一张静帧，对照 SHOTS 那一行：
- [ ] 主体在 blocking 说的位置，做该行说的事
- [ ] 每个 read 落地：首次观看能读懂这一刻的意思

## 第二轮：导演轮（看 contact sheet，≥2 遍）

- [ ] 节奏：无死帧（连续 3 张几乎一样 = 太长）；开场 2s 内入戏
- [ ] 景别多样性：全是一样大小的构图 = 平；至少一次推近、一次拉开
- [ ] 每个可见动作有对应声音重音（配乐 CUES 覆盖）
- [ ] 视觉气质匹配受众（儿童向更圆更亮，商务向更克制）
- [ ] 文字：无碰撞、无越界、无被裁切、无字体缺字（中文查 `≈` 类字形回退）

## 常见翻车 → 处方

| 症状 | 病根 |
|---|---|
| 渲染结果和浏览器预览不一样 | 违反纯函数（rAF 状态/随机数/日期） |
| 画面整体抖成噪声 | wobble 种子每帧在换 → 改每 4 帧一换 |
| 角色像路牌 | 椭圆换掉多边形；加挤压拉伸 |
| 脸/手被挡 | 画序从后往前 |
| 声音切点吓人 | 响度跳变 >+6dB，见 audio.md |
| 中文出现方框 | 字体栈没兜底 CJK |
| 片长和 SECTIONS 对不上 | 帧数 = Σbars×4/(BPM/60)×fps，别手算 |
