import { Link } from "react-router";

export interface HeaderBadge {
  num: string;
  en: string;
  zh: string;
}

/**
 * 全页通用顶栏（设计稿 01/02/08 共用）：
 * 左侧页码角标（编号 + EN + 中文名），右侧主导航。
 * COLLECTIONS / TIMELINE / ABOUT 为后续阶段占位（aria-disabled）。
 */
export function AppHeader({
  badge,
  active,
}: {
  badge: HeaderBadge;
  active?: "explore" | "archive";
}) {
  return (
    <header className="app-header">
      <div className="app-header__badge" aria-label="Current page">
        <span className="app-header__num">{badge.num}</span>
        <span className="app-header__name">{badge.en}</span>
        <span className="app-header__zh">/ {badge.zh}</span>
      </div>
      <nav className="app-header__nav" aria-label="Primary">
        <Link to="/explore" className={active === "explore" ? "is-active" : ""}>
          Explore
        </Link>
        <span aria-disabled="true" title="Coming in a later phase">
          Collections
        </span>
        <span aria-disabled="true" title="Coming in a later phase">
          Timeline
        </span>
        <span aria-disabled="true" title="Coming in a later phase">
          About
        </span>
      </nav>
    </header>
  );
}
