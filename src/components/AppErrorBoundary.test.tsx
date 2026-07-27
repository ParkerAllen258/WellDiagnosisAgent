import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function BrokenPage(): never {
  throw new Error('页面渲染失败')
}

describe('AppErrorBoundary', () => {
  it('shows recovery actions and reloads the page', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <AppErrorBoundary>
        <BrokenPage />
      </AppErrorBoundary>,
    )

    expect(
      screen.getByRole('heading', { name: '页面暂时无法显示' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '返回运行总览' }),
    ).toHaveAttribute('href', '/overview')

    await user.click(screen.getByRole('button', { name: '重新加载页面' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
