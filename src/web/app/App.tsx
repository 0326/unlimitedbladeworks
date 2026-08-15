import { Suspense, lazy } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { PageFallback } from "./PageFallback";

const HomePage = lazy(() => import("./routes/HomePage"));
const BladeFieldPage = lazy(() => import("./routes/BladeFieldPage"));
const BladeDetailPage = lazy(() => import("./routes/BladeDetailPage"));

function AppRoutes() {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/lab/blade-field" element={<BladeFieldPage />} />
          <Route path="/blades/:slug" element={<BladeDetailPage />} />
          <Route
            path="*"
            element={
              <main className="error-page">
                <p className="error-page__eyebrow">404</p>
                <h1>This path does not exist.</h1>
                <p className="error-page__hint">
                  The page you requested is not part of the archive.
                </p>
                <div className="error-page__actions">
                  <Link to="/">Back to entrance</Link>
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
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
