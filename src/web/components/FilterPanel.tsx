import { useMemo, useState } from "react";
import type { BladeSummary } from "../lib/api";
import { EMPTY_FILTER, type FieldFilter } from "../lib/fieldFilter";
import { useI18n } from "../lib/i18n-context";

const CATEGORY_ORDER = ["historical", "legendary", "mythical", "fictional"] as const;

/** 折叠组占位（设计稿 02）：数据维度未入库前展示占位行。 */
const PLACEHOLDER_GROUPS = ["type", "smith", "length", "status"] as const;

/**
 * 02 Explore 左侧筛选面板：
 * 类目计数（ALL/HISTORICAL/LEGENDARY/MYTHICAL/FICTIONAL）+ CULTURE/ERA 实数据折叠组
 * + TYPE/SMITH/LENGTH/STATUS 占位组 + RESET FILTERS。
 */
export function FilterPanel({
  blades,
  filter,
  onChange,
}: {
  blades: BladeSummary[];
  filter: FieldFilter;
  onChange: (next: FieldFilter) => void;
}) {
  const { t } = useI18n();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const blade of blades) {
      const key = blade.authenticity.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [blades]);

  const cultures = useMemo(
    () => [...new Set(blades.map((b) => b.culture))].sort((a, b) => a.localeCompare(b)),
    [blades],
  );
  const eras = useMemo(
    () => [...new Set(blades.map((b) => b.era))].sort((a, b) => a.localeCompare(b)),
    [blades],
  );

  const toggleGroup = (key: string) =>
    setOpenGroups((current) => ({ ...current, [key]: !current[key] }));

  return (
    <aside className="filter-panel" aria-label={t("field.filters")}>
      <h2 className="filter-panel__title">{t("field.explore")}</h2>

      <ul className="filter-panel__cats">
        <li>
          <button
            type="button"
            className={`filter-panel__cat${filter.category === null ? " is-active" : ""}`}
            onClick={() => onChange({ ...filter, category: null })}
          >
            {t("field.allBlades")}
            <span className="filter-panel__count">{blades.length}</span>
          </button>
        </li>
        {CATEGORY_ORDER.map((category) => (
          <li key={category}>
            <button
              type="button"
              className={`filter-panel__cat${filter.category === category ? " is-active" : ""}`}
              onClick={() =>
                onChange({ ...filter, category: filter.category === category ? null : category })
              }
            >
              {t(`field.${category}`)}
              <span className="filter-panel__count">{categoryCounts.get(category) ?? 0}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="filter-panel__groups">
        <FilterGroup
          name="culture"
          options={cultures}
          active={filter.culture}
          open={!!openGroups.culture}
          onToggle={() => toggleGroup("culture")}
          onSelect={(value) =>
            onChange({ ...filter, culture: filter.culture === value ? null : value })
          }
        />
        <FilterGroup
          name="era"
          options={eras}
          active={filter.era}
          open={!!openGroups.era}
          onToggle={() => toggleGroup("era")}
          onSelect={(value) => onChange({ ...filter, era: filter.era === value ? null : value })}
        />
        {PLACEHOLDER_GROUPS.map((name) => (
          <div className="filter-group" key={name}>
            <button
              type="button"
              className="filter-group__head"
              aria-expanded={!!openGroups[name]}
              onClick={() => toggleGroup(name)}
            >
              {t(`field.${name}`)}
            </button>
            {openGroups[name] && (
              <div className="filter-group__body">
                <p className="filter-group__empty">{t("field.availableLater")}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="filter-panel__reset" onClick={() => onChange(EMPTY_FILTER)}>
        {t("field.resetFilters")}
      </button>
    </aside>
  );
}

function FilterGroup({
  name,
  options,
  active,
  open,
  onToggle,
  onSelect,
}: {
  name: string;
  options: string[];
  active: string | null;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="filter-group">
      <button type="button" className="filter-group__head" aria-expanded={open} onClick={onToggle}>
        {t(`field.${name}`)}
      </button>
      {open && (
        <div className="filter-group__body">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-group__opt${active === option ? " is-active" : ""}`}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
