import { useMemo, useState, type ReactNode } from "react";
import { useEffect } from "react";
import { I18nContext, type I18nValue } from "./i18n-context";

export type Locale = "en" | "zh";

type Dictionary = Record<string, string>;

const messages: Record<Locale, Dictionary> = {
  en: {
    "nav.explore": "Explore",
    "nav.collections": "Collections",
    "nav.timeline": "Timeline",
    "nav.about": "About",
    "nav.switchLanguage": "中文",
    "nav.switchToChinese": "Switch to Chinese",
    "nav.switchToEnglish": "Switch to English",
    "header.currentPage": "Current page",
    "header.primary": "Primary",
    "page.home": "Home",
    "page.homeZh": "剑之荒原",
    "page.explore": "Explore",
    "page.exploreZh": "剑丘探索",
    "page.selected": "Blade Selected",
    "page.selectedZh": "发现名剑",
    "hero.eyebrow": "An archive of legendary blades",
    "hero.sub": "History · Myth · Imagination",
    "hero.enter": "Enter the Archive",
    "hero.scroll": "Scroll to begin",
    "field.explore": "Explore the Field",
    "field.filters": "Field filters",
    "field.allBlades": "All Blades",
    "field.historical": "Historical",
    "field.legendary": "Legendary",
    "field.mythical": "Mythical",
    "field.fictional": "Fictional",
    "field.availableLater": "Available with the full archive",
    "field.culture": "Culture",
    "field.era": "Era",
    "field.type": "Type",
    "field.smith": "Smith",
    "field.length": "Length",
    "field.status": "Status",
    "field.resetFilters": "Reset Filters",
    "field.resetView": "Reset view",
    "field.artifacts": "Artifact blades",
    "field.sceneMetrics": "Scene metrics",
    "field.quality": "Quality tier",
    "field.drag": "Drag",
    "field.tap": "Tap",
    "field.look": "look",
    "field.select": "select",
    "field.move": "move",
    "field.mouse": "Mouse",
    "field.click": "Click",
    "field.backExplore": "Back to exploration",
    "field.selectedBlade": "Selected blade",
    "field.inspect": "Inspect Blade →",
    "section.collections": "Collections",
    "section.timeline": "Timeline",
    "section.about": "About",
    "section.collectionsBody": "Curated collections are being prepared for the archive.",
    "section.timelineBody": "The history of every blade will unfold here.",
    "section.aboutBody":
      "Unlimited Blade Works is a living archive of blades, history, and imagination.",
    "section.backField": "Back to the field",
    "detail.archive": "Archive",
    "detail.loading": "Loading record…",
    "detail.unavailable": "Record unavailable",
    "detail.retry": "Retry",
    "detail.backEntrance": "Back to entrance",
    "detail.type": "Type",
    "detail.authenticity": "Authenticity",
    "detail.status": "Status",
    "detail.structure": "Structure",
    "detail.sources": "Sources",
    "detail.noAnnotations": "No published annotations yet.",
    "detail.noSources":
      "No published sources yet. Claims land only after the Phase 4 sourcing review.",
    "error.notFound": "This path does not exist.",
    "error.notFoundHint": "The page you requested is not part of the archive.",
    "error.sceneTitle": "The 3D scene failed to start.",
    "error.sceneHint":
      "Your device may not support WebGL, or the scene hit a rendering error. The text archive remains fully available.",
    "error.retryScene": "Retry scene",
    "error.openRecord": "Open a text record",
  },
  zh: {
    "nav.explore": "探索",
    "nav.collections": "藏品",
    "nav.timeline": "时间线",
    "nav.about": "关于",
    "nav.switchLanguage": "EN",
    "nav.switchToChinese": "切换到中文",
    "nav.switchToEnglish": "切换到英文",
    "header.currentPage": "当前页面",
    "header.primary": "主导航",
    "page.home": "首页",
    "page.homeZh": "剑之荒原",
    "page.explore": "探索",
    "page.exploreZh": "剑丘探索",
    "page.selected": "已选名剑",
    "page.selectedZh": "发现名剑",
    "hero.eyebrow": "传奇名剑数字档案",
    "hero.sub": "历史 · 神话 · 想象",
    "hero.enter": "进入档案馆",
    "hero.scroll": "滚动开始",
    "field.explore": "探索剑丘",
    "field.filters": "剑场筛选",
    "field.allBlades": "全部名剑",
    "field.historical": "历史名剑",
    "field.legendary": "传奇名剑",
    "field.mythical": "神话名剑",
    "field.fictional": "虚构名剑",
    "field.availableLater": "完整档案将在后续开放",
    "field.culture": "文化",
    "field.era": "年代",
    "field.type": "类型",
    "field.smith": "铸剑师",
    "field.length": "长度",
    "field.status": "状态",
    "field.resetFilters": "重置筛选",
    "field.resetView": "重置视角",
    "field.artifacts": "名剑列表",
    "field.sceneMetrics": "场景指标",
    "field.quality": "画质档位",
    "field.drag": "拖动",
    "field.tap": "点击",
    "field.look": "观察",
    "field.select": "选择",
    "field.move": "移动",
    "field.mouse": "鼠标",
    "field.click": "点击",
    "field.backExplore": "返回探索",
    "field.selectedBlade": "已选名剑",
    "field.inspect": "查看名剑 →",
    "section.collections": "藏品",
    "section.timeline": "时间线",
    "section.about": "关于",
    "section.collectionsBody": "精选藏品正在整理，即将进入档案馆。",
    "section.timelineBody": "每一把名剑的历史将在这里展开。",
    "section.aboutBody": "Unlimited Blade Works 是一座关于名剑、历史与想象的持续档案馆。",
    "section.backField": "返回剑丘",
    "detail.archive": "档案馆",
    "detail.loading": "正在加载档案…",
    "detail.unavailable": "档案不可用",
    "detail.retry": "重试",
    "detail.backEntrance": "返回入口",
    "detail.type": "类型",
    "detail.authenticity": "真实性",
    "detail.status": "状态",
    "detail.structure": "结构",
    "detail.sources": "来源",
    "detail.noAnnotations": "暂无已发布的注释。",
    "detail.noSources": "暂无已发布的来源。所有主张将在第四阶段来源审查后收录。",
    "error.notFound": "此路径不存在。",
    "error.notFoundHint": "你请求的页面不属于当前档案馆。",
    "error.sceneTitle": "3D 场景启动失败。",
    "error.sceneHint": "你的设备可能不支持 WebGL，或场景渲染遇到错误。文字档案仍可正常访问。",
    "error.retryScene": "重试场景",
    "error.openRecord": "打开文字档案",
  },
};

const LOCALE_KEY = "ubw-locale";

function detectLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    // Storage can be unavailable in private browsing; use browser preference.
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // Locale remains available for the current session.
    }
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => messages[locale][key] ?? messages.en[key] ?? key,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
