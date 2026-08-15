/**
 * Worker 绑定的环境变量与 secret 类型。
 * Phase 4 将在此扩展 D1/R2 bindings。
 */
export interface Env {
  /** 运行环境标识：local / preview / production。本地开发经 .dev.vars 覆盖。 */
  ENVIRONMENT?: "local" | "preview" | "production";
}
