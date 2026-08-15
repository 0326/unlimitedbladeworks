# Unlimited Blade Works — V0.1 开发计划

> 基于 `PRODUCT_TECHNICAL_DESIGN.md` · 计划版本：V0.1 · 更新：2026-08-16

## 1. 交付目标

在 6 周基线周期内完成一条可公开发布的垂直切片，另预留 1 周风险缓冲：

```text
Blade Field
→ 发现并选择一把 Artifact Blade
→ 进入完整 Artifact Viewer
→ 查看至少 3 个结构热点及可信档案
→ 返回并恢复 Field 状态
```

V0.1 发布内容：

- 1 个实时 3D Blade Field
- 1 把完整高精 3D 藏品
- 3 条经过来源校对的档案记录
- `Balanced / Low / Static` 三档体验
- 桌面、移动端、键盘和 reduced-motion 可用路径
- Cloudflare preview 与 production 部署

## 2. 计划假设

- 1 名全职工程师负责前端、Worker、数据和部署。
- 3D 模型制作/清理与内容研究可以并行；若由同一人完成，应启用第 7 周缓冲。
- 以 1 个工作日为最小估算单位；半天任务合并处理。
- 每一阶段必须通过 Gate 才进入下一阶段，不以“功能基本可见”代替验收。
- V0.1 不临时加入 CMS、账户、Rapier、WebGPU 主路径、复杂搜索或第二把高精藏品。

## 3. 总体排期

| 周次 | 阶段 | 核心产出 | Gate |
| --- | --- | --- | --- |
| Week 1 | Phase 0：基础与测量 | 可部署骨架、路由、CI、profiling 基线 | Gate 0 |
| Week 2 | Phase 1：Blade Field | 实例化剑场、交互、质量降级 | Gate 1 |
| Week 3 | Phase 2：Viewer | 单剑 Viewer、热点、资产流水线 | Gate 2 |
| Week 4 | Phase 3：体验闭环 | Field → Viewer → Field、深链与恢复 | Gate 3 |
| Week 5 | Phase 4：数据与内容 | D1、API、3 条档案、R2 发布 | Gate 4 |
| Week 6 | Phase 5：发布硬化 | 跨端测试、观测、安全、生产发布 | Gate 5 |
| Week 7 | 风险缓冲 | 仅处理未通过 Gate 的问题 | 不增加范围 |

预估为 24–35 个工程工作日，不包含外部模型委托的等待时间。

## 4. 工作流与依赖

```text
P0 工程骨架 ──→ P1 Blade Field ──→ P3 体验闭环 ──→ P5 发布
     │                 ↑                 ↑              ↑
     ├─→ P2 Viewer ────┘                 │              │
     ├─→ A 资产流水线 ───────────────────┤              │
     └─→ C 内容与授权 ──→ P4 D1/API ─────┴──────────────┘
```

关键路径是 `P0 → P1/P2 → P3 → P4 → P5`。资产与内容工作必须从 Week 1 开始，不能等到 Phase 2/4 才启动。

## 5. 分阶段任务

### Phase 0 — 基础与测量（Week 1，2–3 天核心 + 余量）

#### P0-01 工程初始化

- [x] 创建 React + TypeScript + Vite 应用
- [x] 集成 Cloudflare Vite plugin 和 Worker/Hono 入口
- [x] 配置统一的 lint、format、typecheck、unit test
- [x] 固定 Node 与包管理器版本，提交 lockfile

完成标准：本地 `dev`、production build 和 preview 均可运行，类型检查无错误。

#### P0-02 路由与应用边界

- [x] 创建 `/`、`/lab/blade-field`、`/blades/:slug`
- [x] 创建 `/api/health`、`/api/blades`、`/api/blades/:slug` 骨架
- [x] 配置 SPA fallback，并保证 `/api/*` 优先进入 Worker
- [x] 添加 404、应用错误边界和 3D 场景错误边界

完成标准：刷新深层路由不 404；未知 API 返回 JSON 404，不返回 `index.html`。

#### P0-03 环境和部署

- [x] 创建 local、preview、production 配置约定
- [ ] 建立 Cloudflare preview 部署
- [x] 启用基础 Workers logs/metrics
- [x] 配置 `.dev.vars*`、Wrangler 临时目录与密钥忽略规则

完成标准：preview URL 可访问，代码中不包含环境密钥。

> 2026-08-16 状态：本地网络对 Cloudflare API 上传不稳定（Node fetch 直连被重置、本地代理亦不稳定），`wrangler deploy --env preview` 暂未完成；wrangler 已登录、配置就绪。按设计文档 §16 主路径改由 GitHub → Workers Builds 触发 preview 部署，待仓库连接后补验。

#### P0-04 质量基线

- [x] 建立桌面与移动基准设备记录
- [x] 创建固定 60 秒场景 profiling 脚本/操作步骤
- [x] 建立 bundle 和静态资源体积检查
- [x] 建立最小 Playwright smoke test

**Gate 0：** preview、SPA/API 路由、typecheck、unit、smoke、预算检查全部通过。

> 2026-08-16 验证证据：typecheck / lint / format 均通过；vitest 12/12（Worker API contract + 前端校验器）；Playwright smoke 7/7（深链刷新、JSON 404、SPA 404、客户端导航）；初始 JS 70.9 KB gz（预算 150 KB）。仅 preview 线上部署因上述网络问题待 Workers Builds 接管后补验。

### Phase 1 — Blade Field（Week 2，5–7 天）

#### P1-01 场景骨架

- [ ] Canvas、camera、renderer、lighting、fog、terrain
- [ ] WebGL capability detection 和 Static fallback
- [ ] 页面可见性变化时暂停渲染

#### P1-02 Ambient Blade Instancing

- [ ] 准备 10–20 个低模 placeholder base meshes
- [ ] 建立可复现的 seeded placement
- [ ] 测试 500、1,000、2,000 实例
- [ ] 记录 draw calls、frame time、纹理内存和总传输体积

#### P1-03 交互与相机

- [ ] Artifact Blade 独立实体和稳定 ID
- [ ] pointer hover/select 与可控制的 picking 范围
- [ ] 键盘 focus/select 和屏幕阅读器可见文本
- [ ] 相机边界、reset、跳过片头

#### P1-04 质量档位

- [ ] `Balanced / Low / Static` 参数表
- [ ] 动态 DPR 与 frame-time 采样降级
- [ ] 粒子、阴影、后处理独立开关
- [ ] `prefers-reduced-motion` 直接进入可控场景或文字档案

**Gate 1：** 基准桌面 Balanced 达到目标帧率，基准移动 Low 稳定 30 FPS；Static 路径可完成藏品访问。未通过时停止高精场景扩展。

### Phase 2 — Artifact Viewer 与资产流水线（Week 3，5–7 天）

#### P2-01 Viewer 基础

- [ ] GLB lazy load、进度、取消、超时、重试
- [ ] orbit、zoom、reset 和 fullscreen
- [ ] 独立灯光环境与 responsive layout
- [ ] 离开 Viewer 后释放 geometry、material、texture、render target

#### P2-02 语义热点

- [ ] 按 glTF node convention 读取部件
- [ ] 至少 3 个 annotation anchors
- [ ] camera focus tween 和部件高亮
- [ ] Overview、History、Craftsmanship、Sources 最小信息层

#### A-01 资产流水线

- [ ] Blender 节点/单位/朝向/export checklist
- [ ] glTF/GLB 节点、缺失纹理和 bounds 自动验证
- [ ] mesh/texture 压缩与体积门禁
- [ ] 生成 preview、hash manifest、license metadata
- [ ] 上传到 preview R2，验证缓存与跨域访问

**Gate 2：** 示例 GLB 不超过 8 MB；节点、授权、纹理和热点校验通过；Viewer 不进入 Field 初始包；移动端退出后内存可回落。

### Phase 3 — 体验闭环（Week 4，4–6 天）

#### P3-01 Field 选择体验

- [ ] hover card 显示名称、文化、时期与真实性
- [ ] selected Artifact Blade 的 rim light、环境弱化和反馈
- [ ] 防误触、重复点击和 transition 中输入锁定

#### P3-02 状态与路由

- [ ] select → transition → `/blades/:slug`
- [ ] `?focus=<annotation>` 可深链和分享
- [ ] back/forward、刷新和直接访问路径正确
- [ ] 返回 Field 时恢复相机、选择和质量档位

#### P3-03 Cinematic sequence

- [ ] Theatre.js 只控制 camera/light/fog/UI opacity
- [ ] sequence 可跳过、可取消、reduced-motion 可替代
- [ ] 路由和业务状态不依赖 timeline 完成事件

#### P3-04 可用性测试

- [ ] 准备统一测试任务和观察记录表
- [ ] 5 名目标用户完成“进入 → 选剑 → 热点 → 返回”
- [ ] 记录首次犹豫点、误触、失败和完成时间
- [ ] 只修复阻塞核心路径的问题，其余进入 V0.2 backlog

**Gate 3：** 至少 4/5 用户无需指导完成闭环；导航、取消和错误恢复没有死路。

### Phase 4 — 数据、内容与资产发布（Week 5，4–6 天）

#### P4-01 D1 schema

- [ ] 创建 Blade、BladeName、Asset、Annotation、Source、BladeSource、License 表
- [ ] 加入 publication status、索引、约束和 timestamps
- [ ] 创建版本化 migration 与独立 fixture seed
- [ ] 在 preview D1 完整演练 migration

#### P4-02 API contract

- [ ] 列表接口只返回卡片所需摘要
- [ ] 详情接口返回档案、annotations、sources 和 asset manifest
- [ ] 参数绑定、输入校验、统一错误结构和缓存 headers
- [ ] API contract tests 与未发布记录过滤测试

#### C-01 内容与授权

- [ ] 确定 3 条 V0.1 档案，其中 1 条绑定高精 3D
- [ ] 每项事实关联 Source，并记录页码/章节或稳定 URL
- [ ] 每个 Asset 记录 creator、holder、license、attribution 和允许用途
- [ ] 完成事实、拼写、真实性分类和版权复核

#### P4-03 R2 production pipeline

- [ ] 配置资产自定义域名
- [ ] 使用内容哈希 key，禁止覆盖同名生产 GLB
- [ ] hash 资产长期 immutable，manifest/记录短缓存
- [ ] 演练“先资产 → migration → 应用 → 发布记录”的发布顺序

#### P4-04 可索引与可访问内容

- [ ] canonical、Open Graph 和适用的 JSON-LD
- [ ] 不启动 WebGL 也可读取完整档案与 Sources
- [ ] annotation 有 HTML 等价内容

**Gate 4：** 3 条记录与所有资产可追溯；preview migration、API contract、缓存和深链测试通过。

### Phase 5 — 发布硬化（Week 6，4–6 天）

#### P5-01 测试矩阵

- [ ] Chrome、Safari、Firefox 当前稳定版桌面测试
- [ ] iOS Safari 与 Android Chrome 真机测试
- [ ] 键盘、reduced-motion、200% zoom、对比度检查
- [ ] 慢网、离线、GLB 404/损坏、API 500、WebGL context lost 故障注入

#### P5-02 性能验收

- [ ] 冷缓存记录首屏资源和首次可交互基线
- [ ] 固定 60 秒脚本记录 FPS、1% low、draw calls、GPU textures
- [ ] 检查 Viewer 进入/退出的内存变化
- [ ] 保留 trace、截图和构建体积报告作为 Gate 证据

#### P5-03 可观测性

- [ ] Worker request、error、duration 和 D1/R2 错误可查询
- [ ] 记录 `field_ready`、`blade_focused`、`blade_selected`
- [ ] 记录 `viewer_ready`、`annotation_opened`、`returned_to_field`
- [ ] 记录 quality tier、降级原因、资源加载失败和 frame-time 摘要
- [ ] 不采集不必要的个人数据或高频逐帧原始数据

#### P5-04 发布与回滚

- [ ] 配置安全 headers、缓存策略和 production bindings
- [ ] 运行 production migration、deploy 和 smoke test
- [ ] 验证域名、canonical、robots 和分享卡片
- [ ] 演练应用回滚；确认旧 hash 资产仍可访问
- [ ] 建立上线后 24 小时检查清单

**Gate 5：** 产品技术方案第 2.4 节成功标准全部通过，阻塞级和严重级缺陷为 0。

## 6. 测试策略

| 层级 | 覆盖内容 | 执行时机 |
| --- | --- | --- |
| Unit | seeded placement、质量档位、URL state、schema parsing | 每次提交 |
| API contract | 列表/详情、错误结构、publication filter、缓存 headers | 每次提交 |
| Asset validation | glTF nodes、纹理、bounds、体积、license manifest | 每次资产变更 |
| Component | Viewer controls、annotation、fallback、错误状态 | Pull request |
| E2E | 首页、选剑、深链、热点、返回、Static 路径 | Pull request / preview |
| Performance | 固定场景脚本、包体、GLB 与纹理预算 | 每阶段 Gate |
| Manual | 真机视觉、相机手感、可用性、音频与动效 | Gate 1/2/3/5 |

Lighthouse/Web Vitals 用于传统网页层，不代替 WebGL frame-time、显存和真机测试。

## 7. Issue 与交付规则

### Definition of Ready

任务进入开发前必须具备：

- 明确的用户或工程结果
- 可验证的完成标准
- 已知依赖与资产输入
- 不超出当前 Phase 的范围

### Definition of Done

任务完成必须满足：

- 实现、错误态、fallback 同时完成
- typecheck、相关 tests 和 production build 通过
- 新增 3D 资产通过 asset validation 与授权检查
- 性能敏感变更附前后对比数据
- 行为或架构变化同步更新文档
- 在 preview 环境完成验收

### 优先级

- `P0`：阻塞 Gate 或发布，立即处理
- `P1`：核心体验明显受损，在当前 Phase 处理
- `P2`：不阻塞闭环，进入当前阶段余量或 V0.2
- `P3`：探索性优化，不进入 V0.1

## 8. 风险触发器与应对

| 风险触发器 | 应对动作 |
| --- | --- |
| 1,000 实例在移动 Low 低于 30 FPS | 降到 500、移除实时阴影、降低 DPR；不先写复杂 shader |
| Viewer GLB 超过 8 MB | 重拓扑、纹理降级/KTX2、拆除不可见细节；不提高预算掩盖问题 |
| 高精模型授权无法确认 | 立即更换为 public-domain/open-access 或自制示范模型 |
| Theatre.js 阻塞路由或恢复 | 保留 route-first 逻辑，sequence 降级为非阻塞表现层 |
| Safari/WebGL 兼容问题无法在 2 天内解决 | 关闭对应效果并进入 Low/Static，而不是延误主闭环 |
| 内容校对未在 Week 5 前完成 | 发布 1 个完整档案 + 2 个明确标记的简版记录，禁止虚构来源 |
| 任一 Gate 延迟超过 2 天 | 启用 Week 7 缓冲并删除 P2/P3 优化项，不增加人月范围 |

## 9. 首批可创建的 Issues

按以下顺序开始：

1. `P0-01 Scaffold React/Vite/Worker application`
2. `P0-02 Configure SPA and API routing`
3. `P0-03 Create preview deployment and environment boundaries`
4. `P0-04 Add build, smoke test and performance-budget baseline`
5. `A-01 Define and validate the V0.1 blade asset contract`
6. `C-01 Select the production artifact and confirm reuse rights`
7. `P1-01 Build the Blade Field scene skeleton`
8. `P1-02 Benchmark instanced ambient blades`

其中 `A-01` 和 `C-01` 在 P0 骨架完成后立即并行启动。

## 10. 周度汇报模板

```text
本周 Gate：
已完成：
验证证据：preview / trace / test report / asset report
未完成及原因：
新增风险：
范围变化：应为 none；如有必须说明替代掉了什么
下周前三项：
```

项目只报告可验证结果，不使用“完成度 80%”作为 Gate 判断。
