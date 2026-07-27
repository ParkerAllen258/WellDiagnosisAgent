import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoadablePanel } from './LoadablePanel'

afterEach(cleanup)

describe('LoadablePanel', () => {
  it('announces the loading state', () => {
    render(
      <LoadablePanel
        loading
        error={null}
        empty={false}
        onRetry={vi.fn()}
      >
        <div>内容</div>
      </LoadablePanel>,
    )

    expect(screen.getByLabelText('正在加载')).toBeInTheDocument()
  })

  it('offers retry after a request failure', async () => {
    const onRetry = vi.fn()
    render(
      <LoadablePanel
        loading={false}
        error="数据加载失败"
        empty={false}
        onRetry={onRetry}
      >
        <div>内容</div>
      </LoadablePanel>,
    )

    expect(screen.getByText('数据加载失败')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '重新加载' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders a clear empty state', () => {
    render(
      <LoadablePanel
        loading={false}
        error={null}
        empty
        onRetry={vi.fn()}
      >
        <div>内容</div>
      </LoadablePanel>,
    )

    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })
})
