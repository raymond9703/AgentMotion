# 代码绘制技法（Canvas 为例，思想通用）

## 纯函数画法

```js
function draw(frame) {                 // 唯一入口，只依赖 frame
  const t = frame / C2V.fps;
  // 所有"随机"来自 rng(seed)、所有时间来自 t
}
```

- 种子随机：`rng(seed)`（mulberry32）；网格噪声 `hash2(x,y)`
- 沸腾线（手绘感）：线条控制点 + `wobble = (rng(boilSeed(key,frame))()-.5)*amp`，
  种子每 4 帧一换。**每帧一换 = 噪声，7.5 次/秒 = 手绘**
- 弹性出现：`back.out` 起手；数据滚动：`outCubic` + `tabular-nums`
- 挤压拉伸：运动方向 scale 拉长、落点压扁（ squash & stretch ）

## 造型语言

| 要画 | 用 |
|---|---|
| 身体/角色 | 椭圆 + 圆角矩形组合；少点多边形读起来像路牌 |
| 手绘线 | 二次贝塞尔 + 微噪声；粗细随速度变化 |
| 纸纹/颗粒 | 低透明度随机圆点，沸腾种子按区域分配 |
| 光晕 | `globalCompositeOperation = 'lighter'` 径向渐变 |
| 文字 | 系统 CJK 栈 `'PingFang SC','Microsoft YaHei'`；逐字出现用 hash 决定次序 |

## 绘制顺序（显式从后往前）

背景 → 远景 → 主体后方件 → 角色 → 前景件 → 特效 → 文字。
多数"脸被挡住 / 手指穿模"是画序，不是造型。

## 相机

- `withCamera(ctx, {x,y,zoom,rot}, fn)`：镜头内一律世界坐标
- 推拉用 zoom 插值 + outCubic；手持感 = 极慢的正弦漂移（振幅 <10px）
- 转场四件套：交叉溶解 0.6s / 白闪 3 帧 / whip-pan（rot+位移冲出）/ 匹配剪辑（同形异义）

## 文字排版（零碰撞）

```js
// 给每块文字声明矩形，渲染前查询重叠
const claimed = [];
function claimText(x, y, w, h) {           // 返回 false = 与已声明区域重叠，需挪位
  const hit = claimed.some(r => x < r.x+r.w && x+w > r.x && y < r.y+r.h && y+h > r.y);
  if (!hit) claimed.push({x,y,w,h});
  return !hit;
}
```

交付前用 `--stills` 抽每个文字出现时刻逐帧目检。

## 性能预算

目标 ≤1.5s/帧。成本 ≈ fill/stroke 次数：宁少勿碎，大形状优先；
静态复杂背景可预渲染到离屏 canvas（每帧 blit 一次）。
