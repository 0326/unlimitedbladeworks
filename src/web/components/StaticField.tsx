import { Link } from "react-router";
import type { BladeSummary } from "../lib/api";

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
  return (
    <section className="static-field" aria-label="Text archive">
      <p className="static-field__eyebrow">The field is resting — text archive</p>
      <h2 className="static-field__title">Archive Records</h2>

      {error && (
        <div className="static-field__error" role="alert">
          <p>The archive list could not be loaded.</p>
          <div className="error-page__actions">
            <button type="button" onClick={onRetry}>
              Retry
            </button>
            <Link to="/">Back to entrance</Link>
          </div>
        </div>
      )}

      {!error && !blades && (
        <p className="static-field__status" role="status">
          Loading records…
        </p>
      )}

      {blades && blades.length === 0 && (
        <p className="static-field__status">No published records yet.</p>
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
