import { Link } from "react-router";
import { AppHeader, type HeaderBadge } from "../../components/AppHeader";
import { useI18n } from "../../lib/i18n-context";

type Section = "collections" | "timeline" | "about";

const BADGES: Record<Section, HeaderBadge> = {
  collections: { num: "04", en: "Collections", zh: "藏品" },
  timeline: { num: "08", en: "Timeline", zh: "时间线" },
  about: { num: "09", en: "About", zh: "关于" },
};

export default function ArchiveSectionPage({ section }: { section: Section }) {
  const { t } = useI18n();
  return (
    <main className="archive-section-page">
      <AppHeader badge={BADGES[section]} active={section} />
      <section className="archive-section-page__content">
        <p className="archive-section-page__eyebrow">UNLIMITED BLADE WORKS</p>
        <h1>{t(`section.${section}`)}</h1>
        <p>{t(`section.${section}Body`)}</p>
        <Link to="/explore">{t("section.backField")}</Link>
      </section>
    </main>
  );
}
