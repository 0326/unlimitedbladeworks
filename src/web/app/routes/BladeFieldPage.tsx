import { SceneErrorBoundary } from "../../components/SceneErrorBoundary";

/**
 * Blade Field 占位页：Phase 1 在 SceneErrorBoundary 内挂载 R3F Canvas。
 * 边界先行就位，保证届时场景崩溃不会带崩整个应用。
 */
export default function BladeFieldPage() {
  return (
    <main className="field-page">
      <header className="field-page__header">
        <a className="field-page__back" href="/">
          ← Archive
        </a>
        <h1 className="field-page__title">Blade Field</h1>
      </header>
      <SceneErrorBoundary>
        <section className="field-page__scene" aria-label="3D blade field placeholder">
          <p className="field-page__scene-note">
            Scene skeleton lands in Phase 1.
            <br />
            Terrain, ambient blade instancing, and artifact picking will render here.
          </p>
        </section>
      </SceneErrorBoundary>
    </main>
  );
}
