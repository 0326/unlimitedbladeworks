/**
 * 极简 API client：统一错误结构 + 响应形状校验。
 * Phase 4 接入 D1 后仍保持同一 contract，仅扩展字段。
 */

export interface BladeSummary {
  slug: string;
  name: string;
  culture: string;
  era: string;
  authenticity: string;
  preservationStatus: string;
}

export interface BladeDetail extends BladeSummary {
  nativeName: string | null;
  type: string;
  publicationStatus: string;
  description: string;
  currentLocation: string | null;
  annotations: { id: string; title: string; body: string }[];
  sources: { id: string; title: string; locator: string }[];
  updatedAt: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasStringFields(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => typeof value[key] === "string");
}

export function isBladeSummary(value: unknown): value is BladeSummary {
  return (
    isRecord(value) &&
    hasStringFields(value, ["slug", "name", "culture", "era", "authenticity", "preservationStatus"])
  );
}

function isAnnotationArray(value: unknown): value is BladeDetail["annotations"] {
  return (
    Array.isArray(value) &&
    value.every((item) => isRecord(item) && hasStringFields(item, ["id", "title", "body"]))
  );
}

function isSourceArray(value: unknown): value is BladeDetail["sources"] {
  return (
    Array.isArray(value) &&
    value.every((item) => isRecord(item) && hasStringFields(item, ["id", "title", "locator"]))
  );
}

export function isBladeDetail(value: unknown): value is BladeDetail {
  return (
    isBladeSummary(value) &&
    isRecord(value) &&
    hasStringFields(value, ["type", "publicationStatus", "description", "updatedAt"]) &&
    (value.nativeName === null || typeof value.nativeName === "string") &&
    (value.currentLocation === null || typeof value.currentLocation === "string") &&
    isAnnotationArray(value.annotations) &&
    isSourceArray(value.sources)
  );
}

function isBladeListResponse(value: unknown): value is { blades: BladeSummary[] } {
  return isRecord(value) && Array.isArray(value.blades) && value.blades.every(isBladeSummary);
}

function isBladeDetailEnvelope(value: unknown): value is { blade: BladeDetail } {
  return isRecord(value) && isBladeDetail(value.blade);
}

async function requestJson<T>(path: string, validate: (value: unknown) => value is T): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError(0, "network_error", "Network request failed.");
  }

  let body: unknown = null;
  if ((response.headers.get("content-type") ?? "").includes("application/json")) {
    body = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : null;
    throw new ApiError(
      response.status,
      typeof error?.code === "string" ? error.code : "http_error",
      typeof error?.message === "string"
        ? error.message
        : `Request failed with status ${response.status}.`,
    );
  }

  if (!validate(body)) {
    throw new ApiError(response.status, "invalid_response", "Response failed schema validation.");
  }
  return body;
}

export function fetchBladeList(): Promise<{ blades: BladeSummary[] }> {
  return requestJson("/api/blades", isBladeListResponse);
}

export async function fetchBladeDetail(slug: string): Promise<BladeDetail> {
  const { blade } = await requestJson(
    `/api/blades/${encodeURIComponent(slug)}`,
    isBladeDetailEnvelope,
  );
  return blade;
}
