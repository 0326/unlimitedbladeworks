# Unlimited Blade Works — 产品技术方案

> Domain: `unlimitedblade.work`  
> Repository: `0326/unlimitedbladeworks`  
> Stage: V0.1 / Technical Prototype  
> Updated: 2026-08-16

## 1. 产品定义

Unlimited Blade Works 是一个以实时 3D 为核心交互的数字名剑档案馆。网站收录历史、神话、传说以及经过明确版权边界处理的虚构兵器，并通过沉浸式“剑之荒原”与博物馆级 3D Artifact Viewer，让用户从探索空间进入单件藏品研究。

产品不定位为普通图片百科，也不直接复刻任何现有影视或动画场景。视觉上借鉴“无尽兵器荒原、巨大天空、风沙、进入异世界”的空间叙事，但建立独立的 Unlimited Blade 品牌语言。

核心体验：

`进入剑之荒原 → 发现名剑 → 选择/拔出 → 进入 3D Artifact Viewer → 查看历史、结构与细节 → 返回荒原`

## 2. 产品目标

### 2.1 V0.1 目标

验证三个关键假设：

1. 浏览器端可以稳定呈现具有电影感的高密度剑丘场景。
2. 用户能够自然理解“探索 → 选择剑 → 检视藏品”的空间交互。
3. 单剑 3D Viewer 不只是展示模型，而能够承载历史、工艺和结构信息。

### 2.2 V0.1 非目标

首版不实现：

- 用户账户与社交系统
- 评论、评分、UGC
- 完整知识图谱
- AR/VR
- 大规模 CMS
- 数千把真实高精模型同时渲染
- 复杂地图和完整历史时间轴

先把最核心的 3D 体验做对。

## 3. 信息架构

```text
/
  The Field / cinematic landing scene

/explore
  Archive Explorer

/blades/:slug
  3D Artifact Viewer + archive record

/collections/:slug
  Curated exhibitions

/cultures/:slug
  Cultural collections

/eras/:slug
  Era collections

/lab/*
  Internal technical prototypes
```

V0.1 首先实现：

```text
/
/lab/blade-field
/blades/:slug
/api/blades
/api/blades/:slug
```

## 4. 视觉设计方向

### 4.1 品牌关键词

- Dark
- Cinematic
- Monumental
- Museum
- Ancient
- Minimal UI
- Steel / ash / earth / restrained gold

### 4.2 首页

首页不是传统 Hero Banner，而是一个实时 3D 空间。

场景构成：

- 荒芜地表
- 大量插入地面的剑
- 巨大且具有戏剧性的天空
- 远景山体/地平线
- 雾、尘埃、风等环境粒子
- 少量可交互名剑
- 极简标题与导航

Opening sequence：

```text
0.0s  black
0.5s  ambient wind
1.2s  sky exposure rises
2.0s  camera slowly pushes forward
3.0s  foreground silhouettes appear
4.5s  dust becomes visible
6.0s  UNLIMITED BLADE
8.0s  ENTER THE ARCHIVE
```

该 sequence 由 Theatre.js 管理 camera、light、fog、post-processing 和 UI opacity。

### 4.3 原创性与版权边界

可以借鉴：

- 无限延伸的兵器空间概念
- 荒原
- 超现实天空
- 风沙与末世氛围
- 进入另一个世界的仪式感

不直接复制：

- Fate / Unlimited Blade Works 的具体场景构图
- 标志性齿轮天空
- 原作 UI、Logo、字体
- 动画截图
- 官方角色、武器模型和受保护素材
- 原作台词作为主要品牌文案

最终目标是让用户感受到相似的宏大空间叙事，但视觉资产与品牌识别属于 Unlimited Blade 自身。

## 5. 核心交互

### 5.1 The Field

场景中的剑分为两种：

**Ambient Blade**

用于构建规模感，不对应真实藏品。通过少量低模 base meshes + GPU instancing 生成数百至数千把视觉兵器。

**Artifact Blade**

对应数据库中的真实藏品实体，拥有稳定 Blade ID、独立位置、交互碰撞区域和详情入口。

原则：

`Visual swords != Collection objects`

### 5.2 Hover / Focus

鼠标或 pointer 接近 Artifact Blade 时：

```text
HONJŌ MASAMUNE
Japan · Kamakura Period
Historical · Lost
```

同时：

- 环境亮度轻微下降
- 目标剑 rim light 增强
- camera focus 轻微偏移
- 显示极简信息卡

### 5.3 Select / Draw transition

用户选择一把剑：

```text
pointer select
→ blade vibration
→ blade rises from terrain
→ camera follows
→ environment fades
→ artifact lighting takes over
→ Blade Viewer
```

返回 Field 时执行逆向或简化的插剑动画。

### 5.4 Artifact Viewer

Viewer 必须支持：

- rotate
- zoom
- reset camera
- focus points
- annotations
- material/lighting presets
- component highlight
- fullscreen

推荐信息层：

```text
Overview
History
Craftsmanship
Details
Gallery
Sources
Related
```

日本刀示例热点：

```text
Blade
Hamon
Kissaki
Tsuba
Tsuka
Nakago
Mei
Saya
```

点击热点后 camera 自动 tween 至对应区域，并显示结构/历史说明。

## 6. 技术架构

```text
GitHub
   │ push
   ▼
Cloudflare Workers Builds
   │
   ├── Worker
   │     Hono API
   │
   ├── Static Assets
   │     React / Vite
   │     R3F / Three.js
   │
   ├── D1
   │     structured archive metadata
   │
   └── R2
         GLB / KTX2
         HDRI
         images
         audio
```

### 6.1 前端

- React
- TypeScript
- Vite
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- Theatre.js
- Zustand（仅在跨场景状态确有需要时使用）

不在 V0.1 引入 Next.js。该项目核心是客户端实时 3D，React + Vite + Cloudflare Workers 能保持部署与运行模型简单。

### 6.2 Worker/API

使用 Hono：

```text
GET /api/blades
GET /api/blades/:slug
GET /api/collections
GET /api/search?q=
```

Worker 负责：

- API routing
- D1 queries
- R2 asset authorization/routing when required
- caching headers
- future search endpoints

Worker 不参与实时 3D 图形计算。

### 6.3 数据

D1 存储结构化信息：

```text
Blade
Smith
Culture
Era
Person
Museum
Collection
Source
BladeRelation
Asset
Annotation
```

R2 存储大型非结构化资产：

```text
blades/{slug}/
  model-lod0.glb
  model-lod1.glb
  model.glb
  preview.webp
  textures/*.ktx2
  gallery/*
```

## 7. 3D Asset Convention

统一 glTF/GLB 节点命名非常重要。

建议基础规范：

```text
BladeRoot
├── blade
├── tip
├── guard
├── handle
├── pommel
├── inscription
└── scabbard
```

日本刀扩展：

```text
KatanaRoot
├── blade
├── kissaki
├── hamon
├── habaki
├── tsuba
├── tsuka
├── nakago
├── mei
└── saya
```

使用 `gltfjsx` 将模型转换为可控 React component，便于组件级高亮、动画和 annotation anchor。

## 8. 渲染策略

### 8.1 LOD

```text
LOD 0 / distant ambient
100–500 tris
shared material

LOD 1 / nearby ambient
1k–5k tris
shared/variant materials

LOD 2 / selected field artifact
10k–30k tris
optimized PBR

LOD 3 / artifact viewer
20k–100k+ tris
high quality PBR textures
```

最终预算根据移动端 profiling 调整，而不是把以上数字视为硬限制。

### 8.2 Instancing

Field 中数百/数千把环境剑使用 InstancedMesh 或 Drei Instances。

例如：

```text
10–20 base sword meshes
× position
× rotation
× scale
× material variation
= 500–2000 apparent swords
```

Artifact Blade 独立渲染并拥有可交互 ID。

### 8.3 Texture

优先：

- KTX2 / Basis compression
- 合理 texture atlas
- 避免无意义 4K/8K
- viewer 高精纹理 lazy load

### 8.4 WebGPU / WebGL

V0.1 不强制 WebGPU。

策略：

```text
capability detection
→ supported path
→ WebGPU experiments
→ stable WebGL fallback
```

优先保证 WebGL2 主路径稳定，再逐步评估 WebGPU renderer。

## 9. 场景模块

```text
src/web/scene/
  BladeField.tsx
  AmbientBladeInstances.tsx
  ArtifactBlade.tsx
  Terrain.tsx
  Atmosphere.tsx
  Sky.tsx
  DustParticles.tsx
  FieldCamera.tsx
  FieldInteraction.tsx
  FieldPostProcessing.tsx
```

Viewer：

```text
src/web/viewer/
  BladeViewer.tsx
  ArtifactCamera.tsx
  ArtifactLighting.tsx
  AnnotationLayer.tsx
  PartHighlight.tsx
  ViewerControls.tsx
```

## 10. 性能预算

V0.1 目标：

Desktop：

- 1080p mainstream discrete GPU: target 60 FPS
- acceptable floor: 45 FPS during cinematic transitions

Mobile：

- target 30–60 FPS depending on device
- aggressive DPR cap
- reduced particles
- reduced shadow resolution
- fewer instances
- simplified post-processing

加载：

- 首屏不下载高精 Artifact GLB
- 首屏优先加载 terrain + low-poly instance meshes
- Artifact GLB 在 hover intent / select 时预取
- HDRI 与音频按场景阶段加载

性能指标通过真实设备 profiling 决定，而非只看桌面开发机。

## 11. Progressive Enhancement

低性能设备自动降级：

```text
Ultra
High
Balanced
Low
Static fallback
```

可依据：

- devicePixelRatio
- renderer capabilities
- frame-time sampling
- device memory hints
- user preference / reduced motion

`prefers-reduced-motion` 下取消强制 cinematic camera movement，提供直接进入 Archive 的方式。

## 12. 数据模型草案

```sql
CREATE TABLE blades (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT,
  culture_id TEXT,
  era_id TEXT,
  type TEXT,
  status TEXT,
  authenticity TEXT,
  description TEXT,
  current_location TEXT,
  model_asset_key TEXT,
  preview_asset_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

真实性建议枚举：

```text
artifact
historically_documented
legendary_disputed
mythological
fictional
```

每个事实性页面必须能够关联 Source，避免档案逐渐演化成无法验证的内容集合。

## 13. 内容与版权

每个 Asset 记录：

```text
source
creator
copyright holder
license
license URL
attribution
commercial-use allowed
modification allowed
```

历史藏品优先使用：

- public domain
- museum open-access
- CC0
- 明确允许再利用的开放授权
- 自制/委托制作 3D 模型

虚构兵器页面以评论、研究、索引为主，不把未经授权的官方模型、截图或插画作为站点核心视觉资产。

## 14. 搜索与 SEO

虽然核心体验是 3D，内容仍需要可索引 HTML。

每把剑拥有 canonical URL：

```text
/blades/honjo-masamune
/blades/excalibur
/blades/kusanagi-no-tsurugi
```

页面需要：

- semantic metadata
- Open Graph
- JSON-LD where appropriate
- server/API accessible metadata
- 可访问的文字版藏品信息

未来可增加：

```text
/types/katana
/cultures/japanese
/eras/kamakura
/smiths/masamune
```

## 15. 可访问性

3D 不应该成为访问内容的唯一方式。

必须提供：

- keyboard navigation
- text archive
- reduced motion
- sufficient contrast
- meaningful focus states
- alternative text/content for 3D annotations
- skip cinematic intro

## 16. 部署

目标：GitHub commit 自动触发 Cloudflare 部署。

```text
feature branch
→ push
→ preview build/deployment
→ merge main
→ production deployment
→ unlimitedblade.work
```

推荐 Cloudflare Workers Builds / Git integration 作为主路径；若后续需要复杂测试矩阵，再增加 GitHub Actions，而不是一开始重复维护两套部署逻辑。

Secrets 不进入 Git：

```text
Cloudflare secrets / environment variables
D1 bindings
R2 bindings
```

## 17. 推荐目录结构

```text
unlimitedbladeworks/
├── docs/
│   └── PRODUCT_TECHNICAL_DESIGN.md
├── migrations/
├── public/
│   └── assets/
├── src/
│   ├── worker/
│   │   ├── api/
│   │   └── index.ts
│   └── web/
│       ├── app/
│       ├── scene/
│       ├── viewer/
│       ├── components/
│       ├── hooks/
│       └── lib/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc
```

## 18. V0.1 实施计划

### Phase 0 — Foundation

- React/Vite/Worker skeleton
- Cloudflare deployment
- basic route system
- 3D canvas boot

### Phase 1 — `/lab/blade-field`

目标：技术验证，不接正式数据库。

实现：

- terrain
- sky
- fog
- lighting
- 500+ instanced swords
- dust particles
- camera movement
- hover picking
- desktop/mobile profiling

完成标准：主流桌面环境视觉稳定，移动端具有明确降级路径。

### Phase 2 — Artifact Viewer

实现一把示范藏品：

- optimized GLB
- PBR
- orbit/focus camera
- annotation
- part highlight
- metadata panel
- lazy loading

### Phase 3 — Field → Viewer

实现：

- artifact sword in field
- hover information
- draw transition
- viewer transition
- back-to-field transition

这是 V0.1 的核心 milestone。

### Phase 4 — Archive Data

- D1 schema
- Blade API
- Source model
- 5–10 curated blades
- R2 asset pipeline

### Phase 5 — Production Polish

- responsive UI
- performance tiers
- reduced motion
- SEO metadata
- error boundaries
- analytics/performance telemetry
- domain production deployment

## 19. 第一批建议藏品

V0.1 不追求数量，建议 5–10 把具有明显文化差异、模型形态差异和故事性的藏品，例如：

- Honjō Masamune
- Kusanagi-no-Tsurugi
- Excalibur（legendary）
- Durandal（legendary）
- Gram（legendary）
- Chinese Jian representative artifact / documented blade
- European longsword representative artifact

历史与传说必须通过 authenticity 字段明确区分。

## 20. 技术参考

重点研究：

- Three.js examples — renderer、instancing、shader、post-processing
- React Three Fiber — React 3D architecture
- Drei — reusable R3F primitives
- gltfjsx — GLTF → React component workflow
- Theatre.js — cinematic camera/light/material sequences
- Google `<model-viewer>` — artifact viewer UX and annotations
- PlayCanvas Model Viewer — professional model inspection UX
- Bruno Simon portfolio — 3D world as website/navigation

参考作品用于学习交互模式与工程方法，不复制其受保护视觉资产。

## 21. Architecture Decision Summary

| Area | Decision |
| --- | --- |
| Runtime | Cloudflare Workers |
| Deployment | GitHub → Cloudflare automatic deployment |
| Frontend | React + TypeScript + Vite |
| 3D | Three.js + React Three Fiber |
| Helpers | Drei |
| Cinematics | Theatre.js |
| API | Hono |
| Structured data | Cloudflare D1 |
| 3D/media assets | Cloudflare R2 |
| Asset format | GLB/glTF + KTX2 |
| Field rendering | GPU instancing + LOD |
| High-detail models | Lazy loaded per artifact |
| WebGPU | Progressive experiment, WebGL2 first |
| Initial scope | 3D Field + one Artifact Viewer + transition |

## 22. 核心原则

1. **3D is the interface, not decoration.**
2. **The Field creates emotion; the Viewer creates knowledge.**
3. **Hundreds of visible swords do not mean hundreds of expensive models.**
4. **Every historical claim should be sourceable.**
5. **Every major 3D experience needs an accessible fallback.**
6. **Build an original Unlimited Blade identity rather than a Fate replica.**
7. **Profile before optimizing, but establish budgets before content scales.**

---

V0.1 的第一项工程任务应为 `/lab/blade-field`：先用占位低模完成 500+ 剑实例、terrain、sky、fog、camera、hover picking 和性能分级。在这一原型稳定之前，不投入大规模藏品数据录入和高精 3D 资产制作。
