import { cleanup, render, screen } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from './router'
import { themeConfig } from './theme'

afterEach(cleanup)

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  return render(
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>,
  )
}

describe('application routing', () => {
  it('renders the application shell and marks the current section', () => {
    renderRoute('/diagnosis')

    for (const label of [
      '运行总览',
      '异常诊断',
      '洗井优化',
      '任务派发',
      '规则库管理',
      '知识学习',
      '系统设置',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: '异常诊断' })).toHaveClass('active')
    expect(screen.getByRole('link', { name: '异常诊断' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('油水井运行异常诊断智能体')).toBeInTheDocument()
    expect(screen.getByText('双引擎 · 大模型运行中')).toBeInTheDocument()
    expect(screen.getByText('智能诊断')).toBeInTheDocument()
    expect(screen.getByText('工艺室管理员')).toBeInTheDocument()
  })

  it('redirects the root route to the overview', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('heading', { name: '运行总览' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '运行总览' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('renders a helpful page for an unknown route', () => {
    renderRoute('/missing')

    expect(screen.getByText('页面不存在')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回运行总览' })).toHaveAttribute(
      'href',
      '/overview',
    )
  })
})
