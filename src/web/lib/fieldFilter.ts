import type { BladeSummary } from "./api";

export interface FieldFilter {
  /** authenticity 类目；null = ALL */
  category: string | null;
  /** culture 单选；null = 全部 */
  culture: string | null;
  /** era 单选；null = 全部 */
  era: string | null;
}

export const EMPTY_FILTER: FieldFilter = { category: null, culture: null, era: null };

export function isBladeVisible(blade: BladeSummary, filter: FieldFilter): boolean {
  if (filter.category && blade.authenticity.toLowerCase() !== filter.category) return false;
  if (filter.culture && blade.culture !== filter.culture) return false;
  if (filter.era && blade.era !== filter.era) return false;
  return true;
}
