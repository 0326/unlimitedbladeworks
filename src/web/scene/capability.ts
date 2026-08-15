/**
 * WebGL2 能力探测。失败 → Static fallback（设计文档 §11、§15）。
 * doc 参数可注入，便于在无 DOM 的测试环境验证逻辑。
 */
export function detectWebGL2(doc?: Pick<Document, "createElement">): boolean {
  const documentLike = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!documentLike) return false;
  try {
    const canvas = documentLike.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}
