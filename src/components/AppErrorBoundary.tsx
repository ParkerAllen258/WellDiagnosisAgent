import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('页面渲染失败', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <section className="app-error__card">
            <span className="app-error__code">SYSTEM RECOVERY · 页面保护</span>
            <h1>页面暂时无法显示</h1>
            <p>当前页面遇到了意外问题，可以重新加载，或返回运行总览继续使用。</p>
            <div className="app-error__actions">
              <button type="button" onClick={() => location.reload()}>
                重新加载页面
              </button>
              <a href="/overview">返回运行总览</a>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
