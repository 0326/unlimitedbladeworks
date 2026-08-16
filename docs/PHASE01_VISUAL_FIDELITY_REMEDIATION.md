# Unlimited Blade Works — Phase 0+1 视觉还原调整方案与修复计划

> 评审基准：`CORE_PAGES_INTERACTION_DESIGN.md` + `assets/page1-6.png` + `assets/page7.png` + `assets/page8.png`  
> 当前实现：Phase 0 + Phase 1 工作区版本  
> 评审视口：1536 × 1024，Desktop Balanced  
> 日期：2026-08-16

## 1. 结论

当前版本已经完成了可复用的工程骨架：WebGL2/Static fallback、确定性实例放置、质量分级、场景暂停、基础拾取、筛选、键盘入口和性能采样都不应推倒重来。

还原度不足的根因不是单纯的 CSS 微调，而是以下四层没有与参考设计对齐：

1. **入口与路由层未接通**：正式 `/` 仍是无完整样式的文字占位页，真实 3D Home 只存在于 `/lab/blade-field`；`/explore` 没有注册为 React Router 路由。
2. **场景构图错误**：当前相机从高处俯视均匀分布的小剑，参考稿要求低机位、三层景深、明确前景大剑、纵深地平线和右侧主 Artifact。
3. **环境美术过于程序化原型**：天空是简单顶点渐变，山体是圆锥轮廓，地表是单色 flat-shaded 网格，无法形成参考稿的云层、岩石、逆光与电影级明暗层次。
4. **状态变化停留在 UI 覆盖层**：Selected 目前主要是卡片、全屏 dim 和 emissive；参考稿要求镜头重新构图、对象放大、环境降曝光、景深聚焦、HUD 退场共同完成“发现名剑”。

本轮正确策略是：**保留性能基础，重做视觉舞台和状态编排；先把 Page 01–03 做成稳定端点，再进入 Page 04–06。**

## 2. 评审证据与参考文件异常

### 2.1 当前页面实测

在本地预览中检查了以下状态：

- `/`：仅显示左上角文字版入口，没有参考稿中的 Blade Field、顶栏、日食、镜头或 Hero 构图。
- `/lab/blade-field?tier=balanced&instances=1000`：可以看到实时 3D Home，但画面为高位俯视、平面棕色天空、锯齿山体和均匀小剑。
- 点击 `Enter the Archive`：进入 Explore UI，但镜头和场景构图仍与参考稿差异明显。
- 选择 `Calibration Longsword`：卡片出现，但筛选层仍保留，镜头没有转向/靠近目标剑，页面编号仍为 02。

### 2.2 参考图映射异常

`page1-6.png` 是 Page 01–06 的六宫格合成参考，可正常作为构图与视觉语义依据。

`page7.png` 与 `page8.png` 的 SHA-256 完全相同：

```text
e82fd7408617abf7f45732fab25bf651ac754f1df47c0ff60ce1227741a5662b
```

两张图都展示 Page 08 Timeline，因此当前缺少独立的 Page 07 Archive 视觉稿。修复计划对 Page 07 只依据交互文档和共享视觉系统建立结构，不进行像素级还原验收；开始 Archive 实现前应补充正确的 Page 07 图片。

## 3. 当前可保留与必须调整的边界

### 3.1 直接保留

- `QUALITY_PARAMS` 三档模型及动态降级原则
- `generatePlacements` 的 seeded 可复现能力和空间哈希
- 10 个 InstancedMesh 变体的批处理结构
- Artifact Blade 与 Ambient Blade 分离的实体模型
- WebGL capability detection 与 Static fallback
- 页面不可见时暂停 frameloop
- API list/detail 基础能力
- Filter 的数据结构与世界 dimming 语义
- DebugBridge、预算脚本和 profiling 数据结构

### 3.2 重构但复用接口

- `App.tsx` / `HomePage.tsx`：正式入口改为持久化 Field Experience
- `BladeFieldPage.tsx`：从页面级布尔状态改为显式体验状态控制器
- `FieldCamera.tsx`：从固定三点相机扩展为 Home/Explore/Focused 的镜头 rig
- `placement.ts`：从单一均匀圆盘改为分层构图生成器
- `Sky.tsx` / `Terrain.tsx` / `MountainRing`：保留组件边界，替换视觉实现
- `ArtifactBlade.tsx`：保留实体/拾取接口，增加专用展示比例和 selected presentation
- `FieldEffects.tsx`：从 Bloom + Vignette 扩展为受质量档位控制的色调与景深策略
- `styles.css`：保留黑金 token 方向，重建响应式布局与状态可见性规则

### 3.3 本轮不做

- Page 04 Draw 的最终 Theatre.js 时间线
- Page 05–06 的生产 GLB Viewer
- Page 07 Archive 与 Page 08 Timeline 功能实现
- 第二把生产级高精模型
- WebGPU、物理系统、复杂体积云或实时全局光照

Page 04–08 在本方案中只定义共享接口和未来约束，避免本轮修复再次制造不可延续的临时代码。

## 4. 逐页差距分析

| 页面 | 当前状态 | 参考目标 | 差距等级 | 本轮处理 |
| --- | --- | --- | --- | --- |
| 01 Home | 正式 `/` 是文字占位；Lab 中有 3D 原型 | 低机位电影级 Blade Field + 双行 Hero + 日食 | Critical | 完整修复 |
| 02 Explore | 有筛选、罗盘、WASD、选剑 | 右侧主剑、水平罗盘、深景场、轻量 HUD | Critical | 完整修复 |
| 03 Selected | 有卡片、dim、emissive | 镜头聚焦、主剑放大、环境退场、空间卡片 | Critical | 完整修复 |
| 04 Draw | 未实现 | 物体从世界进入 Viewer 的连续转场 | Expected | 只定义状态/接口 |
| 05 Viewer | 当前只有文字详情页 | 60–70% Artifact 舞台 + 结构化侧栏 | Expected | 保留 Phase 2 实现 |
| 06 Inspection | 未实现 | 热点驱动相机/灯光/标注 | Expected | 保留 Phase 2 实现 |
| 07 Archive | 未实现且缺正确参考图 | 高密度检索、Grid/List、URL filters | Blocked reference | 等正确图片 |
| 08 Timeline | 未实现，有参考图 | 文化泳道、横向时间轴、上下文抽屉 | Expected | V0.2/后续阶段 |

### 4.1 视觉设计评分

该评分衡量当前正式入口和 Phase 1 Field 相对批准方向的完成度，不代表代码质量：

| 维度 | 当前分数 | 主要判断 |
| --- | ---: | --- |
| Visual hierarchy | 5/10 | Hero 有焦点，但标题比例和场景主次错误 |
| Typography | 6/10 | Field 的 serif/sans 方向正确，正式首页和字号体系未统一 |
| Color palette | 4/10 | 黑金方向存在，但大面积棕灰使层次和钢材质消失 |
| Spacing / negative space | 6/10 | HUD 基本克制，Selected 时双侧栏产生拥挤 |
| Visual consistency | 5/10 | `/`、Lab Field、Detail 像三个不同完成度的产品 |
| Imagery / graphics | 3/10 | 天空、山体、地面仍是明显技术占位 |
| Layout / composition | 4/10 | 当前高位均匀剑阵与参考低机位三层构图相反 |
| Component design | 6/10 | Filter/card 状态较完整，但 Compass 和公开调试入口不匹配方向 |
| Branding / personality | 5/10 | 日食、黑金、档案编号已出现，但电影感与博物馆感不足 |
| Modern execution | 5/10 | 工程结构现代，最终视觉仍停留在灰模原型阶段 |
| **Overall** | **49/100** | **可用技术原型，尚未达到可展示的视觉垂直切片** |

修复目标不是追求主观 100 分，而是 Page 01–03 达到 **75+/100** 且构图、状态连续性和品牌特征稳定。

### 4.2 组件审计

| 组件 | 状态 | 调整重点 |
| --- | --- | --- |
| AppHeader | Partial | 页码边框、状态编号、导航亮度和正式路由 |
| Home Hero | Critical | 正式入口接入、双行标题、比例和信息层级 |
| FilterPanel | Partial | 宽度、透明渐变、数据占位表达 |
| Compass | Replace visual | 圆形 HUD 改为顶部水平刻度 |
| Hover label | Partial | 保留世界锚点，收紧排版并避免出屏 |
| Selected card | Critical | 与筛选互斥、空间位置、状态 badge 和镜头联动 |
| Artifact Blade | Critical | 展示比例、构图锚点、材质和专用灯光 |
| Quality/debug controls | Internal only | 从公开 UI 移至 `debug=1` |
| Loading/error/static | Keep | 统一品牌视觉，不削弱可访问路径 |

当前设计系统成熟度约 **5/10**：已有颜色、字体和组件命名，但缺少场景/DOM token 分层、构图规范、稳定的响应式规则和视觉回归基线。

## 5. 视觉调整规格

### 5.1 Page 01 — Home / The Blade Field

#### 构图

- 地平线放在视口高度约 **58–64%**，不再放在当前约 35–42% 的高位俯视构图。
- 相机降到接近人的视点，保留微弱仰视天空的感觉；FOV 目标 **42–50°**，以固定 46° 开始调试。
- 三层剑阵必须在静态首帧中可读：
  - Foreground：3–5 把独立大剑，高度约 45–75vh，允许切出画面并轻度虚化。
  - Midground：60–180 把可辨识轮廓，构成主要密度。
  - Background：其余实例压向地平线，以雾和 silhouette 制造“无限”而不是“均匀撒点”。
- 保留中央视觉通道，避免 Hero 标题被剑身切碎；左右前景形成框景。
- 日食直径控制在约 **6–9vh**，位置在上方中央附近；当前尺寸过大且出现径向扇形穿帮。

#### Hero UI

- 标题恢复为两行：`UNLIMITED` / `BLADE`，整体宽度约 35–45vw，而不是单行铺满 85% 以上宽度。
- 信息层级顺序：Title → Archive subtitle → History/Myth/Imagination → Enter。
- `ENTER THE ARCHIVE` 保持文字主 CTA，小圆形图标只作为仪式性视觉提示。
- 左上页码采用参考稿的轻边框 badge；导航保持上方右侧，但字距和亮度要比 Hero 弱一层。
- 底部 `SCROLL TO BEGIN` 使用细竖线/鼠标符号，不应与主 CTA 同权重。

#### 环境运动

- idle camera 只做 6–12px 等价量的慢速呼吸漂移，不能破坏 Hero 对齐。
- 鼠标 parallax 仅影响 camera target 或 foreground group，不直接改变全场位置。
- 云层、尘埃和曝光变化保持 10–20 秒级周期，避免“屏保式循环”。

### 5.2 Page 02 — Explore / The Blade Field

#### 镜头与对象

- Enter 完成后把相机放在地表附近，向前推进而不是向下俯冲。
- 主 Artifact 置于画面右侧约 76–88% 的横向区域，高度约 60–78vh。
- Artifact 与相机距离单独调节，不使用环境剑的统一 scale；它必须成为第一视觉焦点。
- 背景山脉集中在远景右侧/地平线，左侧为筛选面板留出视觉负空间。

#### HUD

- Filter panel 占宽控制在 15–18vw，上限约 260px；背景由左至右渐隐，不形成厚重后台侧栏。
- 类目、计数和折叠组使用固定对齐列；占位组不展示“Available with full archive”常驻提示，只在展开时轻量说明。
- Compass 改为参考稿的**顶部中央水平 W/N/E 刻度**；当前右上圆形罗盘视觉偏游戏 HUD。
- Bottom hints 居中并贴近安全区底部，桌面显示 `WASD / MOUSE / CLICK`，移动端显示 `DRAG / TAP`。
- Balanced/Low/Static 和 Artifact 辅助按钮只保留在 `debug=1` 或设置菜单，不进入公开画面。

#### 筛选反馈

- 非匹配 Artifact：150–250ms 降低 emissive/opacity，并退出拾取。
- Ambient blades 需要有 category/cluster 的视觉映射后才能真正随 filter 淡出；在数据未准备好前，不能假装所有 2,000 个环境实例都已被语义过滤。
- 数量从 2 条 fixture 显示为 2 是工程正确但视觉破坏参考语义；正式视觉验收使用“demo display counts”或等待真实数据，必须明确标记非生产数据来源。

### 5.3 Page 03 — Blade Selected

#### 状态编排

选择 Artifact 后执行一个 700–1,000ms 的受控 focus transition：

```text
pointer/keyboard select
→ lock repeated input
→ camera dolly + target tween
→ selected blade presentation scale/rotation
→ environment exposure/fog adjustment
→ nonessential HUD fades
→ spatial card appears
```

- 页面 badge 切换为 `03 / BLADE SELECTED / 发现名剑`。
- Filter、Compass、bottom hints 退场或降到不可交互；当前版本保留 Filter 并把卡片放到其右侧，形成两层侧栏冲突。
- 卡片回到左侧约 3–6vw，宽约 18–22vw；不使用居中的传统 Modal。
- Selected blade 位于中间偏右，至少占 55–72vh；边缘金光只勾勒轮廓，不能把整把剑变成自发光黄色。
- 背景降低曝光并增加景深，而不是仅叠一个统一黑色 DOM 层。
- Close/Escape 执行逆向镜头过渡并恢复之前 Explore camera，而不是重置到默认视角。

#### 数据

- 视觉验收不再使用 `Calibration Longsword / Placeholder culture` 作为主展示内容。
- 在生产内容未完成前准备一条明确标注 demo 的 Excalibur 或原创测试条目，并保证名称长度、双语、标签和两行描述与参考排版接近。

### 5.4 Page 04–06 接口预留

本轮不实现最终画面，但状态和组件必须允许无重挂载地进入后续阶段：

```ts
type ExperienceState =
  | { kind: "home" }
  | { kind: "entering"; progress: number }
  | { kind: "explore"; camera: FieldCameraSnapshot }
  | { kind: "focused"; slug: string; camera: FieldCameraSnapshot }
  | { kind: "drawing"; slug: string; progress: number }
  | { kind: "viewer"; slug: string; focus?: string };
```

- `focused → drawing` 的触发只放在 `Inspect Blade` 用户事件中。
- 路由和相机状态不能依赖一串 Effects 相互触发。
- Theatre.js 未来只消费状态并驱动表现参数，不拥有业务状态。
- Viewer GLB preload 由 focused 状态启动；失败时仍停留在 Selected 并展示可恢复错误。

### 5.5 Page 07–08 共享视觉约束

- 继续使用同一顶部品牌导航、页码 badge、黑金 token、细边框和 display serif。
- Archive/Timeline 都进入同一个 `/blades/:slug` Viewer，返回时恢复 query、scroll/zoom 和 selection。
- Page 07 的正确视觉图补充前，不冻结卡片尺寸、列数和详情抽屉比例。
- Page 08 参考图可以冻结以下系统：左文化 lane、顶部年代轴、中央当前年份线、底部选中详情抽屉和 map context。

## 6. 3D 场景技术调整

### 6.1 天空

当前 `SkyDome` 只有上下渐变，无法表达参考稿的巨大云体和中心逆光。建议采用两级方案：

**Balanced**

- 原创/合法授权的 2K–4K equirectangular dramatic sky，或低频程序云 shader。
- 太阳/地平线光与 sky texture 的亮区方向一致。
- 独立薄云层可做极慢 UV drift，但不使用昂贵实时体积云作为 V0.1 前提。

**Low**

- 1K 压缩天空纹理或预烘焙渐变 + 云 silhouette。
- 关闭云层动画，保留地平线和色调结构。

日食需改为始终正对相机的 billboard/sprite 或正确四元数，并校正 depthTest/depthWrite/renderOrder，保证黑盘完整遮挡辉光，不再出现当前的径向切片。

### 6.2 山脉与地平线

- 用 2–3 条连续 ridge mesh 代替 44 个圆锥；前后 ridge 使用不同明度和 fog 深度。
- 山体轮廓要有主峰、次峰和长坡，不出现均匀三角锯齿。
- 地平线放置薄层暖色 atmospheric band，将亮度集中在太阳附近而不是让整片天空变棕。

### 6.3 地表

- 保留程序高度场，但降低 flat-shading 的均匀棕色观感。
- 增加低成本 triplanar/detail normal 或压缩 roughness/albedo 纹理。
- 用 instanced rocks/debris 建立近景尺度参照；Balanced 100–250 个，Low 30–80 个。
- 地表色从近黑焦土过渡到地平线暖灰，避免当前画面大面积相同亮度。

### 6.4 剑阵分层

将单一 `generatePlacements()` 拆为可测试的构图层：

```text
generateForegroundHeroBlades()  // 3–5，独立 mesh，允许 DOF
generateMidgroundBlades()       // 60–180，重要轮廓
generateBackgroundBlades()      // 余量，雾中 silhouette
generateArtifactAnchors()       // 手工构图锚点
```

- 保留 seeded deterministic 输出，便于视觉回归。
- 从圆盘均匀采样改为扇形/带状分布，按相机视锥分配密度。
- scale 与 depth 相关，不再全场仅使用 1.4–2.6 的窄范围。
- 近景剑至少有 3 种显著不同的 silhouette；背景才允许极简变体。
- `frustumCulled={false}` 应重新评估；分层后可以按 group bounds 恢复 culling。

### 6.5 材质、灯光与后处理

- Renderer 使用 ACES Filmic tone mapping，并明确 output color space 和 exposure token。
- 主光改为低角度逆光；hemisphere intensity 下调，避免把所有剑均匀照亮。
- Artifact 使用独立 key/rim light 或材质参数，不与 Ambient 共用展示逻辑。
- Balanced 增加受控 Depth of Field；Home 聚焦中景，Selected 聚焦 Artifact。
- Bloom 只服务日食、尘埃和剑缘高光，设置 luminance threshold，避免整体泛黄。
- Vignette 减弱到只压画角；通过实际光照建立层次，不用后处理掩盖平面场景。
- Motion blur 不进入本轮稳定端点，只在未来 Draw transition 评估。

## 7. 路由、状态与 React 调整

### 7.1 正式路由

目标路由：

```text
/                 → FieldExperience(kind=home)
/explore          → FieldExperience(kind=explore)
/blades/:slug     → Viewer/可访问详情
/lab/blade-field  → 同一 FieldExperience + debug controls
```

- `/` 和 `/explore` 必须通过 React Router 注册，不使用裸 `window.history.replaceState()` 绕过 Router。
- Home/Explore 共用一个持久化 `Canvas`；切 URL 不应重载 WebGL context 或重新生成 placements。
- `/explore` 刷新必须直接进入 Explore 稳定端点。
- 浏览器 Back 从 Explore 回 Home 时执行可预测的 UI/镜头恢复，而不是落入 404。

### 7.2 状态控制

- 用 reducer/state machine 表达 `home → entering → explore → focused`。
- Enter、Select、Dismiss、Inspect 都在用户事件处理器中发出单一 transition event。
- 当前 cursor、keyboard、visibility、network fetch 等与外部系统同步的 Effects 可以保留，但需要 cleanup/AbortController。
- 不新增 `selected → camera effect → animation done effect → navigate effect` 链式 Effects。
- Field camera 的 Three.js 同步 Effect 是合理边界，但镜头 tween 应由一个 transition controller 驱动并可取消。
- Selected 数据预取使用 AbortController 或缓存层，避免 slug 快速切换时写入过期结果。

## 8. 设计系统调整

### 8.1 Token

新增或冻结以下 token，禁止在组件内继续散落相近色值：

```text
color.bg.void         #030507
color.bg.field        #090b0d
color.surface.glass   rgba(6, 8, 10, .78)
color.line.subtle     rgba(224, 203, 158, .14)
color.line.accent     rgba(201, 168, 108, .42)
color.text.primary    #ebe6d9
color.text.secondary  #918b7d
color.accent          #c9a86c
color.accent.bright   #ecd29a
```

场景中的 fog/terrain/sky token 与 DOM token 分组，避免 UI 金色和天空棕色互相污染。

### 8.2 Typography

- Display：Cinzel/合法可分发的高对比 serif；不要依赖用户设备大概率不存在的 Trajan Pro。
- UI：窄字距 uppercase sans；正文使用可读 system sans。
- Hero title：两行，font-weight 400，letter-spacing 0.16–0.24em。
- 小型 HUD 最低视觉字号 11–12px，但可访问文本不低于 14px 等价可读尺度。

### 8.3 响应式

- 1536×1024 为参考视觉回归主视口。
- 1440×900 和 1280×720 验证桌面构图不塌陷。
- ≤896px 时 Filter 改为抽屉/底部 sheet，不保留 260px 常驻侧栏。
- coarse pointer 自动 Low 仍保留，但 Low 不能退化为无构图的均匀剑阵。

## 9. 验收标准

### 9.1 Page 01

- `/` 直接呈现实时或 Static Blade Field，不再显示文字占位首页。
- 首帧可明确辨认 foreground/midground/background 三层。
- 地平线处于 58–64% 高度范围。
- Hero 标题双行且不超过 45vw；不与主要剑轮廓冲突。
- 日食是干净暗盘 + 暖色 corona，无径向扇形穿帮。
- Enter 过渡结束后 Canvas 不重建，URL 正确变为 `/explore`。

### 9.2 Page 02

- 主 Artifact 在右侧形成第一焦点，高度至少 60vh。
- Filter ≤18vw；水平 Compass 位于上方中心。
- 公共画面不显示 quality/debug/artifact 辅助按钮。
- `/explore` 可刷新、可 Back/Forward，并保持稳定状态。

### 9.3 Page 03

- 选择后 1 秒内完成镜头聚焦、环境降权和卡片出现。
- Filter/Compass 不再与 Selected card 竞争。
- Artifact 占画面高度 55–72%，轮廓与材质可读。
- Dismiss 恢复选择前镜头，而不是重置或跳页。
- 键盘 Enter/Escape 与 pointer 路径一致。

### 9.4 性能不回退

- Balanced draw calls ≤100；Mobile Low ≤60。
- Field 初始传输 ≤3MB。
- 新天空/地表资源计入预算并提供压缩版本。
- 1,000 实例基准相对 Phase 1 trace 不出现超过 20% 的 frame-time 回退；如回退必须附视觉收益与 Gate 决策。

## 10. 视觉回归策略

新增确定性视觉模式：

```text
?visual=1&tier=balanced&instances=1000
```

该模式需要：

- 固定 seed、viewport、DPR、时间、camera、云层 offset 和粒子位置。
- 禁止 idle drift、随机动画和自动质量降级。
- 为 Page 01、02、03 分别暴露稳定状态入口或测试事件。
- 从 `page1-6.png` 裁出 Page 01–06 独立参考图，避免六宫格缩放干扰。
- WebGL 截图使用感知差异/结构阈值，不追求跨 GPU 的逐像素完全一致。
- 同时保留 DOM 几何断言：Hero bounding box、panel width、horizon guide、Artifact screen bounds。

建议基线：

```text
visual/home-1536x1024.png
visual/explore-1536x1024.png
visual/selected-1536x1024.png
visual/home-390x844.png
visual/explore-390x844.png
```

## 11. 修复实施计划

总工期：**9–14 个工程工作日**。不包含生产级 3D 模型或天空资产外包等待时间。

### R0 — 冻结参考和证据（0.5–1 天）

- [x] 将 `page1-6.png` 裁为 6 张独立参考图，仅用于内部视觉 QA
- [x] 标注参考图的 horizon、Hero、Filter、Artifact、card 安全区
- [x] 确认 `page7.png/page8.png` 重复并登记缺失 Page 07
- [x] 保存当前 Home/Explore/Selected 截图和 Phase 1 性能数据
- [x] 建立 `?visual=1` 确定性模式任务

**Exit：** 所有人使用同一视口、同一状态和同一参考图讨论“还原度”。

### R1 — 路由和体验状态修复（1–1.5 天）

- [x] `/` 与 `/explore` 注册到持久化 `FieldExperience`
- [x] 删除裸 history 同步，改由 Router/state event 控制
- [x] 建立 `home/entering/explore/focused` reducer
- [x] URL refresh、Back/Forward、reduced-motion 路径测试
- [x] 更新过时 E2E 语义，不先改视觉

**Exit：** 正式 `/` 展示 3D Home；`/explore` 刷新不 404；Canvas 不因 Home→Explore 重建。

### R2 — 场景构图重建（2–3 天）

- [x] 调整 camera rig、FOV、target 和 horizon
- [x] 拆分 foreground/midground/background placement
- [x] 手工冻结 1 个 Home 构图 seed 和 1 个 Explore Artifact anchor
- [x] 替换连续 ridge 山体
- [x] 修复 Eclipse billboard/depth

**Exit：** 即使关闭纹理和后处理，灰模也能匹配参考稿的构图层级。

### R3 — 环境美术与光照（2–3 天）

- [x] 原创/授权天空资产或低频云 shader
- [x] 地表 detail、岩石/debris instances
- [x] 低角度逆光、Artifact 独立 rim/key
- [x] ACES/exposure/bloom/vignette 参数冻结
- [x] Balanced DOF 与 Low 替代方案

**Exit：** 首帧达到“黑色焦土 + 暖色地平线 + 高动态天空”，不再是均匀棕色程序原型。

### R4 — Page 01 UI 与 Enter 过渡（1–1.5 天）

- [x] 双行 Hero、subtitle、CTA、page badge、top nav
- [x] idle drift/parallax 限幅
- [x] Home→Explore UI fade + camera dolly
- [x] reduced-motion 直接切换但保持端点构图

**Exit：** Page 01 在 1536×1024 通过构图和 DOM 几何验收。

### R5 — Page 02/03 HUD 与聚焦状态（1.5–2 天）

- [x] Filter 样式、水平 Compass、bottom hints
- [x] 隐藏公开 debug/quality controls
- [x] Selected camera tween、UI 退场、badge 03、spatial card
- [x] Dismiss 恢复 camera snapshot
- [x] pointer/keyboard/coarse pointer 路径统一

**Exit：** Explore 和 Selected 两个端点均可稳定截图，核心视觉层级与参考一致。

### R6 — 回归、性能与文档（1–2 天）

- [x] 修复全部 E2E 并新增 Page 01–03 状态测试
- [x] 添加视觉截图/DOM 几何断言（`tests/e2e/visual.spec.ts`）
- [x] 运行 typecheck、unit、build、budget、E2E、profile
- [x] 1536×1024、1440×900、1280×720、390×844 人工 QA
- [x] 更新 profile 证据（`docs/data/phase1-profile.json`）

**Exit：** 所有自动化通过；视觉修复没有突破现有资源与 draw-call Gate。

## 12. Issue 拆分与依赖

| ID | Issue | 依赖 | 估算 |
| --- | --- | --- | ---: |
| VF-01 | Freeze visual references and deterministic visual mode | 无 | 1d |
| VF-02 | Mount persistent FieldExperience at `/` and `/explore` | VF-01 | 1d |
| VF-03 | Introduce explicit Home/Explore/Focused state reducer | VF-02 | 0.5d |
| VF-04 | Rebuild camera rigs and horizon composition | VF-03 | 1d |
| VF-05 | Split blade placement into three visual depth layers | VF-04 | 1–1.5d |
| VF-06 | Replace mountain/eclipsing celestial prototypes | VF-04 | 1d |
| VF-07 | Add production-ready sky and terrain treatment | VF-05, VF-06 | 1.5–2d |
| VF-08 | Rebuild Page 01 Hero and Enter choreography | VF-02, VF-07 | 1d |
| VF-09 | Align Explore filter, compass and HUD layout | VF-07 | 0.5–1d |
| VF-10 | Implement Selected camera focus and reversible UI state | VF-03, VF-07 | 1–1.5d |
| VF-11 | Replace stale E2E expectations and add state-path tests | VF-02, VF-03 | 1d |
| VF-12 | Add visual regression and final performance evidence | VF-08–VF-11 | 1d |

VF-07 的天空/地表资产准备可与 VF-02–VF-05 并行，但资产来源和授权必须在合入前确认。

## 13. 当前测试状态与修复门禁

修复后验证结果（2026-08-16）：

- `pnpm typecheck`：通过
- `pnpm test`：41/41 通过
- `pnpm e2e`：21/21 通过（含 1536×1024、390×844、Back/Forward 与 Selected dismiss 契约）
- `pnpm build`：通过
- `pnpm check:budgets`：通过（初始 JS gzip 71.1 KB / 150 KB）
- `pnpm profile:field`：500/1000/2000 阶梯采样完成，结果写入 `docs/data/phase1-profile.json`

旧测试已按新的 Home → Explore → Selected 契约更新；`visual=1` 参数关闭环境漂移，供 DOM 几何验收使用。

## 14. 最终 Gate

视觉修复完成需要同时满足：

1. Page 01–03 在指定视口达到本文构图与交互验收标准。
2. 正式路由与状态恢复正确，不再依赖 Lab 路径展示核心体验。
3. typecheck、unit、E2E、build、budget 全部通过。
4. 视觉模式可重复生成稳定截图。
5. Phase 1 draw calls、传输预算通过确定性 Gate；SwiftShader frame-time 作为回归参考记录，真实 GPU frame-time 按 QUALITY_BASELINE §2 复测。
6. Page 04–06 可以消费同一 state/asset contract，不需要再次重写 Field 路由和选中逻辑。

在这个 Gate 通过前，不进入 Draw transition、Viewer 美术或 Archive/Timeline 实现。
