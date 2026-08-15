import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  /** 变化时重置错误状态，例如路由 pathname。 */
  resetKey: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 应用级错误边界：任何渲染期错误降级为可导航的错误页，
 * 不向用户暴露原始错误信息，细节进入 console 以便 Workers logs / 上报。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error boundary caught", {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-page">
          <p className="error-page__eyebrow">Something broke</p>
          <h1>The archive hit an unexpected error.</h1>
          <p className="error-page__hint">
            The failure has been logged. Reload to return to the archive entrance.
          </p>
          <div className="error-page__actions">
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
            <a href="/">Back to entrance</a>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
