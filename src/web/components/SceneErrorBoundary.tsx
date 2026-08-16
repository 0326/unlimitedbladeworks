import { Component, type ErrorInfo, type ReactNode } from "react";
import { useI18n } from "../lib/i18n-context";

interface SceneErrorBoundaryProps {
  /** 3D 场景的 HTML 等价内容入口，失败时仍可访问档案。 */
  children: ReactNode;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

/**
 * 3D 场景专用错误边界：场景崩溃只降级场景本身，
 * 页面导航与文字档案路径保持可用（设计文档 §15 可访问性要求）。
 */
export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D scene error boundary caught", {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <SceneErrorContent />;
    }
    return this.props.children;
  }
}

function SceneErrorContent() {
  const { t } = useI18n();
  return (
    <div className="scene-fallback" role="alert">
      <p className="scene-fallback__title">{t("error.sceneTitle")}</p>
      <p className="scene-fallback__hint">{t("error.sceneHint")}</p>
      <div className="error-page__actions">
        <button type="button" onClick={() => window.location.reload()}>
          {t("error.retryScene")}
        </button>
        <a href="/blades/calibration-katana">{t("error.openRecord")}</a>
      </div>
    </div>
  );
}
