import { Link } from "react-router";
import { useI18n } from "../lib/i18n-context";

export interface HeaderBadge {
  num: string;
  en: string;
  zh: string;
}

/**
 * 全页通用顶栏（设计稿 01/02/08 共用）：
 * 左侧页码角标（编号 + EN + 中文名），右侧主导航。
 * COLLECTIONS / TIMELINE / ABOUT 均为可访问的正式路由；页面内容按阶段逐步丰富。
 */
export function AppHeader({
  badge,
  active,
  onExplore,
}: {
  badge: HeaderBadge;
  active?: "explore" | "collections" | "timeline" | "about" | "archive";
  onExplore?: () => void;
}) {
  const { t, locale, setLocale } = useI18n();
  return (
    <header className="app-header">
      <div className="app-header__badge" aria-label={t("header.currentPage")}>
        <span className="app-header__num">{badge.num}</span>
        <span className="app-header__name">{locale === "zh" ? badge.zh : badge.en}</span>
        <span className="app-header__zh">/ {locale === "zh" ? badge.en : badge.zh}</span>
      </div>
      <nav className="app-header__nav" aria-label={t("header.primary")}>
        <Link
          to="/explore"
          className={active === "explore" ? "is-active" : ""}
          onClick={(event) => {
            if (!onExplore) return;
            event.preventDefault();
            onExplore();
          }}
        >
          {t("nav.explore")}
        </Link>
        <Link to="/collections" className={active === "collections" ? "is-active" : ""}>
          {t("nav.collections")}
        </Link>
        <Link to="/timeline" className={active === "timeline" ? "is-active" : ""}>
          {t("nav.timeline")}
        </Link>
        <Link to="/about" className={active === "about" ? "is-active" : ""}>
          {t("nav.about")}
        </Link>
        <button
          type="button"
          className="app-header__locale"
          aria-label={t(locale === "zh" ? "nav.switchToEnglish" : "nav.switchToChinese")}
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
        >
          {t("nav.switchLanguage")}
        </button>
      </nav>
    </header>
  );
}
