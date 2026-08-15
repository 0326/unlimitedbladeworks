import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError, fetchBladeDetail, type BladeDetail } from "../../lib/api";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; blade: BladeDetail };

export default function BladeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchBladeDetail(slug)
      .then((blade) => {
        if (!cancelled) setState({ status: "ready", blade });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof ApiError ? error.message : "The record could not be loaded.";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, reloadToken]);

  // slug 切换（客户端导航到另一条记录）时旧数据不展示，派生为 loading，
  // 避免 effect 内同步 setState。
  const view: LoadState =
    state.status === "ready" && state.blade.slug !== slug ? { status: "loading" } : state;

  const retry = () => {
    setState({ status: "loading" });
    setReloadToken((token) => token + 1);
  };

  return (
    <main className="detail-page">
      <header className="detail-page__header">
        <Link className="detail-page__back" to="/">
          ← Archive
        </Link>
      </header>

      {view.status === "loading" && (
        <p className="detail-page__status" role="status">
          Loading record…
        </p>
      )}

      {view.status === "error" && (
        <section className="detail-page__error" role="alert">
          <h1>Record unavailable</h1>
          <p>{view.message}</p>
          <div className="error-page__actions">
            <button type="button" onClick={retry}>
              Retry
            </button>
            <Link to="/">Back to entrance</Link>
          </div>
        </section>
      )}

      {view.status === "ready" && (
        <article className="detail-page__record">
          <p className="detail-page__eyebrow">
            {view.blade.culture} · {view.blade.era}
          </p>
          <h1>{view.blade.name}</h1>
          <dl className="detail-page__meta">
            <div>
              <dt>Type</dt>
              <dd>{view.blade.type}</dd>
            </div>
            <div>
              <dt>Authenticity</dt>
              <dd>{view.blade.authenticity}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{view.blade.preservationStatus}</dd>
            </div>
          </dl>
          <p className="detail-page__description">{view.blade.description}</p>

          <section className="detail-page__annotations">
            <h2>Structure</h2>
            {view.blade.annotations.length === 0 ? (
              <p className="detail-page__empty">No published annotations yet.</p>
            ) : (
              <ul>
                {view.blade.annotations.map((annotation) => (
                  <li key={annotation.id}>
                    <h3>{annotation.title}</h3>
                    <p>{annotation.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="detail-page__sources">
            <h2>Sources</h2>
            {view.blade.sources.length === 0 ? (
              <p className="detail-page__empty">
                No published sources yet. Claims land only after the Phase 4 sourcing review.
              </p>
            ) : (
              <ul>
                {view.blade.sources.map((source) => (
                  <li key={source.id}>
                    {source.title} — {source.locator}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      )}
    </main>
  );
}
