import { Alert, Button, Empty, Skeleton } from 'antd'
import type { ReactNode } from 'react'

export interface LoadablePanelProps {
  loading: boolean
  error: string | null
  empty: boolean
  onRetry: () => void
  children: ReactNode
}

export function LoadablePanel({
  loading,
  error,
  empty,
  onRetry,
  children,
}: LoadablePanelProps) {
  if (loading) {
    return (
      <div aria-label="正在加载" aria-live="polite">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        action={
          <Button size="small" onClick={onRetry}>
            重新加载
          </Button>
        }
        description="请检查数据连接后重试。"
        message={error}
        showIcon
        type="error"
      />
    )
  }

  if (empty) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
  }

  return children
}
