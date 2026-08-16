import { useI18n } from "../lib/i18n-context";

export function PageFallback() {
  const { t } = useI18n();
  return (
    <main className="page-fallback" role="status" aria-busy="true">
      <span className="page-fallback__label">{t("detail.loading")}</span>
    </main>
  );
}
