import { Component, type ErrorInfo, type ReactNode } from "react";

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
      return (
        <div className="scene-fallback" role="alert">
          <p className="scene-fallback__title">The 3D scene failed to start.</p>
          <p className="scene-fallback__hint">
            Your device may not support WebGL, or the scene hit a rendering error. The text archive
            remains fully available.
          </p>
          <div className="error-page__actions">
            <button type="button" onClick={() => window.location.reload()}>
              Retry scene
            </button>
            <a href="/blades/calibration-katana">Open a text record</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
