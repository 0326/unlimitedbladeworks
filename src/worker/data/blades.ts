/**
 * Phase 0 占位档案数据。
 *
 * 这些记录只用于打通 API 与前端骨架，全部标记为 placeholder，
 * 不包含任何未经验证的历史声明；真实档案在 Phase 4（C-01 内容校对）后落库。
 * publicationStatus 遵循设计文档：只有 published 记录进入公开 API。
 */

export type PublicationStatus = "draft" | "review" | "published" | "archived";

export type Authenticity =
  "artifact" | "historically_documented" | "legendary_disputed" | "mythological" | "fictional";

export interface BladeAnnotation {
  id: string;
  title: string;
  body: string;
}

export interface BladeRecord {
  slug: string;
  name: string;
  nativeName: string | null;
  culture: string;
  era: string;
  type: string;
  authenticity: Authenticity;
  preservationStatus: string;
  publicationStatus: PublicationStatus;
  description: string;
  currentLocation: string | null;
  annotations: BladeAnnotation[];
  /** 空数组表示“暂无可信来源”；Phase 4 前不虚构任何 source。 */
  sources: { id: string; title: string; locator: string }[];
  updatedAt: string;
}

const PLACEHOLDER_NOTE =
  "Phase 0 placeholder record. Verified archive content and sources arrive with the Phase 4 content review.";

const BLADES: BladeRecord[] = [
  {
    slug: "calibration-katana",
    name: "Calibration Katana",
    nativeName: null,
    culture: "Placeholder culture",
    era: "Placeholder era",
    type: "katana",
    authenticity: "fictional",
    preservationStatus: "unknown",
    publicationStatus: "published",
    description: PLACEHOLDER_NOTE,
    currentLocation: null,
    annotations: [
      {
        id: "blade",
        title: "Blade",
        body: "Placeholder annotation anchor for the blade segment.",
      },
      {
        id: "hamon",
        title: "Hamon",
        body: "Placeholder annotation anchor for the temper line.",
      },
      {
        id: "tsuba",
        title: "Tsuba",
        body: "Placeholder annotation anchor for the guard.",
      },
    ],
    sources: [],
    updatedAt: "2026-08-16T00:00:00.000Z",
  },
  {
    slug: "calibration-longsword",
    name: "Calibration Longsword",
    nativeName: null,
    culture: "Placeholder culture",
    era: "Placeholder era",
    type: "longsword",
    authenticity: "fictional",
    preservationStatus: "unknown",
    publicationStatus: "published",
    description: PLACEHOLDER_NOTE,
    currentLocation: null,
    annotations: [
      {
        id: "blade",
        title: "Blade",
        body: "Placeholder annotation anchor for the blade segment.",
      },
      {
        id: "guard",
        title: "Guard",
        body: "Placeholder annotation anchor for the crossguard.",
      },
      {
        id: "pommel",
        title: "Pommel",
        body: "Placeholder annotation anchor for the pommel.",
      },
    ],
    sources: [],
    updatedAt: "2026-08-16T00:00:00.000Z",
  },
  {
    slug: "draft-jiangjun-jian",
    name: "Draft Chinese Jian",
    nativeName: null,
    culture: "Placeholder culture",
    era: "Placeholder era",
    type: "jian",
    authenticity: "fictional",
    preservationStatus: "unknown",
    publicationStatus: "draft",
    description: PLACEHOLDER_NOTE,
    currentLocation: null,
    annotations: [],
    sources: [],
    updatedAt: "2026-08-16T00:00:00.000Z",
  },
];

export function listPublishedBlades(): BladeRecord[] {
  return BLADES.filter((blade) => blade.publicationStatus === "published");
}

export function getBladeBySlug(slug: string): BladeRecord | undefined {
  return BLADES.find((blade) => blade.slug === slug);
}
