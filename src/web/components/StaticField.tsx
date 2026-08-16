import { Link } from "react-router";
import type { BladeSummary } from "../lib/api";
import { useI18n } from "../lib/i18n-context";

/**
 * Static 降级路径（无 WebGL / 手动 Static 档 / reduced-motion 文字入口）：
 * 无 3D 也能完成藏品访问（Gate 1 要求）。
 */
export function StaticField({
  blades,
  error,
  onRetry,
}: {
  blades: BladeSummary[] | null;
  error: boolean;
  onRetry: () => void;
}) {
  const { t } = useI18n();
  return (
    <section className="static-field" aria-label={t("detail.archive")}>
      <p className="static-field__eyebrow">{t("field.availableLater")}</p>
      <h2 className="static-field__title">{t("detail.archive")}</h2>

      {error && (
        <div className="static-field__error" role="alert">
          <p>{t("detail.unavailable")}</p>
          <div className="error-page__actions">
            <button type="button" onClick={onRetry}>
              {t("detail.retry")}
            </button>
            <Link to="/">{t("detail.backEntrance")}</Link>
          </div>
        </div>
      )}

      {!error && !blades && (
        <p className="static-field__status" role="status">
          {t("detail.loading")}
        </p>
      )}

      {blades && blades.length === 0 && (
        <p className="static-field__status">{t("detail.noSources")}</p>
      )}

      {blades && blades.length > 0 && (
        <ul className="static-field__list">
          {blades.map((blade) => (
            <li key={blade.slug}>
              <Link to={`/blades/${blade.slug}`} className="static-field__card">
                <h3>{blade.name}</h3>
                <p>
                  {blade.culture} · {blade.era}
                </p>
                <p className="static-field__authenticity">{blade.authenticity}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
