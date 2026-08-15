export function PageFallback() {
  return (
    <main className="page-fallback" role="status" aria-busy="true">
      <span className="page-fallback__label">Loading</span>
    </main>
  );
}
