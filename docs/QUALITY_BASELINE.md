# Quality Baseline — Phase 0 测量基线

> 建立于 2026-08-16 · 所有后续性能结论必须与本文的设备矩阵和脚本对比，不允许换设备后直接引用旧数据。

## 1. 基准设备矩阵

| 档位 | 设备目标 | 浏览器 | 条件 |
| --- | --- | --- | --- |
| 桌面基准 | MacBook Pro（Apple Silicon，16GB+）外接或内建 1080p+ | Chrome 稳定版 | 电源接通，无后台重度任务 |
| 桌面对照 | Windows 中端独显台式机（如 GTX 1660 / RTX 3060 级） | Chrome 稳定版 | 电源接通 |
| 移动基准 | iPhone（近两代 SE/mini 或更新） | iOS Safari | 省电模式关闭，Wi-Fi |
| 移动对照 | Android 中端机（如 Pixel a 系列） | Chrome 稳定版 | 省电模式关闭，Wi-Fi |

Phase 1 profiling 时将实际设备型号、OS 版本、屏幕分辨率、DPR 逐台登记到本表，之后冻结。

## 2. 固定 60 秒 profiling 步骤（Phase 1 起执行）

1. 冷启动：清缓存或隐身窗口，进入 `/lab/blade-field`，跳过片头（若已实现）。
2. 录制 Chrome Performance trace（移动端用真机录制 frame-time）：
   - 0–10s：静止镜头，记录稳态帧率。
   - 10–30s：按固定路径缓慢平移/环绕相机。
   - 30–50s：hover/选择 Artifact Blade（Phase 3 后）。
   - 50–60s：回到静止镜头，确认无降频。
3. 记录指标：平均 FPS、1% low、draw calls（`renderer.info.render.calls`）、GPU textures 内存、JS heap。
4. 产物归档：trace 文件 + 截图 + 数据填入本文件附录。

## 3. 资源预算（Gate 检查项）

| 预算 | 当前值 | 检查方式 |
| --- | ---: | --- |
| 初始 JS（gzip） | ≤ 150 KB | `pnpm check:budgets`（构建后） |
| 单 chunk（gzip） | ≤ 300 KB | `pnpm check:budgets` |
| Field 初始传输 | ≤ 3 MB | Phase 1 加入 3D 后并入脚本 |
| Viewer GLB | ≤ 8 MB | Phase 2 asset validation |
| Field 稳态 draw calls | 桌面 ≤ 100 / 移动 ≤ 60 | Phase 1 profiling |

预算变更规则：只允许在 Gate 评审后调整并附 profiling 证据，不允许“先超标后放宽”。

## 4. Gate 0 命令清单

```bash
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm test          # vitest（Worker API + 前端校验器）
pnpm build         # production 构建
pnpm check:budgets # 资源预算门禁
pnpm e2e           # Playwright smoke（自动 build + vite preview）
```

## 5. Phase 0 基线记录（2026-08-16）

- 初始 JS（gzip）：70.9 KB（入口 1 个 chunk；React 19.2 + react-router 8.3 + 骨架页面）
- 懒加载路由 chunk（gzip）：HomePage 0.42 KB / BladeFieldPage 0.73 KB / BladeDetailPage 1.48 KB
- CSS（gzip）：1.43 KB；Worker bundle（gzip）：约 15.7 KB
- 构建产物：`dist/client`（静态资源）+ `dist/unlimitedbladeworks`（Worker）
- 加载秒数基线：待 Phase 1 真实占位资产就绪后，以 Fast 4G 节流录制并冻结具体秒数（设计文档 §2.4）。

验证证据：typecheck / lint / format 通过；vitest 12/12；Playwright smoke 7/7（Chromium 1.62）。

## 6. Phase 1 Blade Field 采样（2026-08-16）

采样方式：`pnpm profile:field`（headless Chromium + SwiftShader，1280×720，每档采样 10 秒取中位数，intro 结束后起测）。原始数据：`docs/data/phase1-profile.json`。

| instances | 实际档位 | fps* | frame ms* | draw calls | triangles | geometries | textures |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 500 | low（自动降级） | 11.5 | 87 | 20 | 85,246 | 21 | 5 |
| 1000 | low（自动降级） | 8 | 125 | 20 | 149,998 | 21 | 5 |
| 2000 | low（自动降级） | 5 | 200 | 20 | 280,522 | 23 | 21 |

\* SwiftShader 为 CPU 光栅化，fps/frame time 仅作回归对比，不代表真实 GPU 表现（真实设备指标待 §2 的固定 60 秒 profiling 录制）。

结论：

- **Draw calls 恒定约 20，与实例数无关**——GPU instancing 生效，远低于桌面预算 100（§3）；Low 档关闭云层和前景框景以控制固定开销。
- 三角形数随实例数线性增长（约 140 tris/实例），几何合并符合预期。
- geometries 21–23 / textures 5–21：base mesh 变体仍合并为 InstancedMesh，新增连续山脊、云纹理、Bloom/DOF 后处理资源计入固定对象。
- Field 页面总传输（gzip）：344 KB（JS 340 KB + CSS 4 KB，含懒加载 3D chunk），低于 §3 的 3 MB 预算。
- 初始 JS（gzip，入口闭包）：71.1 KB / 150 KB（3D 全部在懒加载 chunk，未进首包）。
- 本次视觉修复在 Low 档将固定 draw calls 控制为 20，保留在移动 ≤60 / 桌面 ≤100 Gate 内；SwiftShader 帧时间受宿主负载影响较大，仅作 CPU 参考，QualitySampler 按设计触发 balanced → low 单向降级（e2e 已覆盖该路径）。真实 GPU 设备需按 §2 的固定 60 秒矩阵复测。
