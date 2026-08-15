# Unlimited Blade Works — 产品技术方案

> Domain: `unlimitedblade.work` · Repository: `0326/unlimitedbladeworks` · Stage: V0.1 / Vertical Slice · Updated: 2026-08-16

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

### 2.3 V0.1 收敛后的交付边界

V0.1 不是“缩小版完整产品”，而是一条可发布、可测量的垂直切片：

```text
一个 Blade Field
+ 一把可交互 Artifact Blade
+ 一个完整 Artifact Viewer
+ 三条有来源的档案记录（其中一条绑定高精 3D）
+ 一条 Field → Viewer → Field 闭环
+ 一个无 3D / reduced-motion 可访问入口
```

在垂直切片通过性能、可用性和内容合规闸门之前，不扩充到 5–10 把高精模型，不建设通用 CMS，也不把 WebGPU、物理系统或复杂搜索放入关键路径。

### 2.4 成功标准

V0.1 同时满足以下条件才视为完成：

| 维度 | 指标 | 验收方式 |
| --- | --- | --- |
| 体验闭环 | 新用户无需说明即可完成“进入 → 选剑 → 查看热点 → 返回” | 5 名目标用户可用性测试，至少 4 名独立完成 |
| 桌面渲染 | 基准桌面 1080p、Balanced 档位，探索阶段稳定 60 FPS，1% low 不低于 45 FPS | 固定镜头脚本 + Chrome Performance trace |
| 移动渲染 | 基准移动设备 Low 档位稳定 30 FPS，交互期间无持续卡顿 | 真实设备录制 60 秒 frame-time |
| 首次可交互 | 3D 首屏不依赖高精 GLB；可跳过片头并快速进入文字档案 | 冷缓存、模拟 Fast 4G 与真实 Wi-Fi 测试 |
| 稳定性 | 资源失败有重试/降级，WebGL 不可用时仍可访问档案 | 故障注入与 E2E 测试 |
| 内容可信度 | 每项事实声明可追溯到 Source，所有资产有授权记录 | 发布检查清单 |

具体加载秒数在 Phase 0 用真实占位资产建立基线后冻结，避免在资源体积未知时给出虚假精度。

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

V0.1 使用 Hono 提供两个公开只读接口：

```text
GET /api/blades
GET /api/blades/:slug
```

后续版本再增加：

```text
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

推荐请求路径：

```text
/assets/*                 → Workers Static Assets（应用代码与轻量 UI 资源）
/api/*                    → Worker / Hono → D1
assets.unlimitedblade.work → R2 Custom Domain（GLB/KTX2/HDR/大图）
其他前端路由              → SPA fallback / index.html
```

大体积公开资产不默认经过 Worker 转发。R2 使用自定义域名接入 Cloudflare Cache；生产资产采用内容哈希文件名和长期 `immutable` 缓存，manifest/记录本身使用短缓存并可更新。只有私有、受限授权或需要审计的资产才走 Worker 鉴权。

Cloudflare Vite plugin 作为本地开发、构建和运行时集成的唯一主路径。SPA fallback 与 `/api/*` Worker 路由必须在 `wrangler.jsonc` 中显式配置并通过预览环境测试，避免 API 404 被错误返回为 `index.html`。

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

系统只在 D1 中保存 R2 object key、hash、媒体类型、尺寸、版本和授权元数据，不保存带域名的最终 URL。这样可以独立切换资产域名、缓存策略与受限访问方式。

### 6.4 状态边界

- URL 是当前藏品与可分享视图的真相来源，例如 `/blades/:slug?focus=hamon`。
- React 本地状态负责 hover、面板开关和临时相机状态。
- Zustand 仅负责跨 Field/Viewer 的短生命周期 transition context，不复制服务端档案数据。
- Theatre.js 只驱动镜头、灯光、雾和 UI 时间线，不承载路由或业务状态。
- 服务端数据通过带 schema 校验的 API client 读取；V0.1 不引入复杂客户端缓存框架。

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
- 初始 JavaScript 与 3D 资源分包；Viewer、编辑/调试工具不得进入 Field 首包
- production source map 不对公网暴露，但保留到错误监控流程

资产初始预算（Phase 0 profiling 后冻结）：

| 资源 | 建议上限 | 说明 |
| --- | ---: | --- |
| Field 初始压缩传输 | 3 MB | 不含按用户手势启动的音频 |
| Ambient blade geometry | 500 KB | 10–20 个共享低模，压缩后合计 |
| Field textures | 2 MB | 优先 KTX2，共享贴图/atlas |
| Viewer 示例 GLB | 8 MB | 首版硬上限，按需加载 |
| 单张 gallery image | 400 KB | AVIF/WebP 响应式尺寸 |

运行时预算：

- Field 稳态 draw calls：Desktop ≤ 100，Mobile ≤ 60
- GPU textures：Desktop ≤ 256 MB，Mobile ≤ 128 MB
- DPR：Desktop 上限 1.5，Mobile 上限 1.25，动态档位可继续下调
- 同时存在的高精 Artifact：最多 1 个；离开 Viewer 后显式释放 geometry、material、texture 和 render target
- 粒子、阴影、后处理必须能被质量档位独立关闭

性能指标通过真实设备 profiling 决定，而非只看桌面开发机。

基准设备在 Phase 0 记录具体型号、浏览器、OS、屏幕分辨率和电源模式。以后所有“性能改善”都必须与同一脚本、同一设备矩阵对比。

## 11. Progressive Enhancement

V0.1 只实现三个可验证档位：

```text
Balanced
Low
Static fallback
```

V0.2 根据真实设备数据再决定是否拆分 `High / Ultra`，避免首版维护五套未经验证的参数组合。

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
  preservation_status TEXT,
  authenticity TEXT,
  publication_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'review', 'published', 'archived')),
  description TEXT,
  current_location TEXT,
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

V0.1 至少落地以下关系，而不是只实现单张 `blades` 表：

```text
blades 1─N blade_names
blades 1─N assets
blades 1─N annotations
blades N─N sources（通过 blade_sources，带 claim/note/page locator）
assets N─1 licenses
```

发布状态使用 `draft | review | published | archived`；只有 `published` 数据进入公开 API。所有写操作在 V0.1 通过 migration/seed 完成，公开 API 只读。D1 查询全部使用绑定参数，schema 变更只通过版本化 migration 进入 preview 和 production。

API 响应返回稳定字段、`updatedAt` 和 asset manifest version。列表接口不返回长正文、完整 sources 或 Viewer 高精资产详情，避免首页查询演化成超大 payload。

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

环境严格分离：

```text
local   → local/preview bindings + fixture assets
preview → 独立 D1、独立 R2 prefix/bucket、预览域名
prod    → production D1、production R2、unlimitedblade.work
```

上线顺序固定为：先上传内容哈希资产，再执行向后兼容 migration，再部署 Worker/前端，最后发布引用新 manifest 的记录。回滚应用版本时，旧 hash 资产仍然可用；不在部署过程中覆盖同名 GLB。

Secrets 不进入 Git：

```text
Cloudflare secrets / environment variables
D1 bindings
R2 bindings
```

最低发布门禁：typecheck、unit、API contract、Playwright 主流程、asset validation、production build、bundle/asset budget。preview 通过人工视觉与性能抽查后才能合并 main。

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

实施采用风险优先的闸门制。以下为 1 名全职工程师、不包含高精模型外包等待时间的粗估；每个阶段只有通过 Gate 才进入下一阶段。

### Phase 0 — 可部署骨架与测量基线（2–3 天）

- React/Vite + Cloudflare Vite plugin + Worker/Hono
- `/`、`/lab/blade-field`、`/blades/:slug` 与 `/api/health`
- preview/prod 环境骨架、错误边界、基础日志
- 固定 profiling 脚本、设备矩阵与资源预算检查脚本

**Gate 0：** preview 可访问，SPA/API 路由正确，CI 可阻止超预算构建。

### Phase 1 — Blade Field 风险验证（5–7 天）

- 10–20 个 placeholder base meshes，500/1,000/2,000 实例阶梯测试
- terrain、sky、fog、lighting；粒子和后处理先作为可关闭能力
- camera、hover/picking、键盘焦点与 reduced-motion 路径
- 自动质量档位只做 `Balanced / Low / Static` 三档，先不做五档

**Gate 1：** 基准桌面/移动设备达到第 10 节 frame-time 与内存预算；Static fallback 能完成内容访问。未通过时优先降低实例、DPR、阴影和后处理，不继续制作高精内容。

### Phase 2 — 单剑 Viewer 与资产流水线（5–7 天）

- 一把授权清晰的示范藏品：PBR、orbit/focus、3 个 annotations、part highlight
- Blender node convention → validate → optimize/compress → preview → upload → manifest
- GLB/KTX2 lazy load、进度、取消、失败重试和显存释放
- Viewer 的 HTML 等价内容与键盘操作

**Gate 2：** 示例资产通过命名、授权、体积、视觉和移动显存检查；Viewer 不影响 Field 首包。

### Phase 3 — 垂直切片闭环（4–6 天）

- Artifact Blade hover card
- select/draw → route → Viewer；返回时恢复 Field 状态
- 刷新、深链、前进/后退、加载失败、reduced-motion 全路径
- Theatre.js 只编排可跳过的表现层 sequence

**Gate 3：** 5 名测试用户中至少 4 名无需指导完成核心任务；浏览器导航和失败恢复无死路。

### Phase 4 — 可信内容与 API（4–6 天）

- D1 migrations：Blade、Asset、Annotation、Source、License 及关联表
- 3 条已校对档案记录，其中 1 条绑定完整 3D
- 列表/详情只读 API、缓存策略、JSON-LD 与可索引 HTML
- R2 自定义资产域名、hash manifest、preview/prod 隔离

**Gate 4：** 每项事实与每个公开资产均可追溯；API contract 与 migration 在 preview 验证通过。

### Phase 5 — 发布硬化（4–6 天）

- 响应式与跨浏览器检查
- WebGL context lost、离线/慢网、404、资源损坏故障注入
- 核心事件、Web Vitals、frame-time、质量降级与 Worker 错误观测
- 安全 headers、缓存检查、域名与 production smoke test

**Gate 5：** 第 2.4 节全部成功标准和发布门禁通过。

### V0.2 扩展条件

只有 V0.1 发布后数据证明用户能发现并完成 Viewer 交互，才扩展到 5–10 把藏品、collections/cultures/eras、复杂搜索和更多质量档位。WebGPU、Rapier、CMS、账户系统继续独立评估，不自动进入 V0.2。

## 19. 内容批次建议

V0.1 只发布 3 条经过校对的档案记录，并只为其中 1 条制作完整高精 3D。候选池可包含：

- Honjō Masamune
- Kusanagi-no-Tsurugi
- Excalibur（legendary）
- Durandal（legendary）
- Gram（legendary）
- Chinese Jian representative artifact / documented blade
- European longsword representative artifact

历史与传说必须通过 authenticity 字段明确区分。候选名单不是发布承诺；最终选择优先服从“可靠来源 + 清晰授权 + 可在预算内制作资产”，而不是知名度。

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

关键补充约束：

| Area | Guardrail |
| --- | --- |
| R2 delivery | Public hashed assets via custom domain/cache; Worker proxy only when access control is needed |
| Client routing | SPA fallback, with `/api/*` explicitly routed to Worker |
| State | URL for shareable state; local state by default; Zustand only for transition context |
| Cinematics | Theatre.js is presentation-only and always skippable |
| Content | 3 records in V0.1, 1 full 3D asset |
| Release | Measurable gates; no content expansion before performance and usability pass |

## 22. 核心原则

1. **3D is the interface, not decoration.**
2. **The Field creates emotion; the Viewer creates knowledge.**
3. **Hundreds of visible swords do not mean hundreds of expensive models.**
4. **Every historical claim should be sourceable.**
5. **Every major 3D experience needs an accessible fallback.**
6. **Build an original Unlimited Blade identity rather than a Fate replica.**
7. **Profile before optimizing, but establish budgets before content scales.**
8. **Ship one trustworthy vertical slice before building a large archive.**
9. **Make every cinematic path skippable, resumable and URL-addressable.**

---

V0.1 的第一项工程任务是 Phase 0 的可部署骨架与测量基线，随后才是 `/lab/blade-field`。在 Gate 1 通过之前，不投入大规模藏品录入和高精 3D 资产制作；在 Gate 3 通过之前，不扩展第二把完整 3D 藏品。
