import { Suspense, lazy } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { I18nProvider } from "../lib/i18n";
import { useI18n } from "../lib/i18n-context";
import { PageFallback } from "./PageFallback";

const BladeFieldPage = lazy(() => import("./routes/BladeFieldPage"));
const BladeDetailPage = lazy(() => import("./routes/BladeDetailPage"));
const ArchiveSectionPage = lazy(() => import("./routes/ArchiveSectionPage"));

function AppRoutes() {
  const location = useLocation();
  const { t } = useI18n();
  const exploreState = location.state as { fromHome?: boolean } | null;
  const exploreMode = exploreState?.fromHome ? "transition" : "explore";
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<BladeFieldPage key={location.key} initialMode="home" />} />
          <Route
            path="/explore"
            element={<BladeFieldPage key={location.key} initialMode={exploreMode} />}
          />
          <Route path="/lab/blade-field" element={<BladeFieldPage key={location.key} />} />
          <Route path="/blades/:slug" element={<BladeDetailPage />} />
          <Route path="/collections" element={<ArchiveSectionPage section="collections" />} />
          <Route path="/timeline" element={<ArchiveSectionPage section="timeline" />} />
          <Route path="/about" element={<ArchiveSectionPage section="about" />} />
          <Route
            path="*"
            element={
              <main className="error-page">
                <p className="error-page__eyebrow">404</p>
                <h1>{t("error.notFound")}</h1>
                <p className="error-page__hint">{t("error.notFoundHint")}</p>
                <div className="error-page__actions">
                  <Link to="/">{t("detail.backEntrance")}</Link>
                </div>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  );
}
