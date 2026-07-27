import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

function renderKnowledgePage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/knowledge'],
  })

  render(
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>,
  )
}

describe('KnowledgePage', () => {
  it('searches real cases and clears both empty-result filters', async () => {
    const user = userEvent.setup()
    renderKnowledgePage()

    expect(
      await screen.findByRole('heading', { name: '知识学习' }),
    ).toBeInTheDocument()
    await screen.findByText('抽油井结蜡导致电流持续抬升')
    const searchInput = screen.getByLabelText('搜索案例')

    await user.type(searchInput, '供液不足')
    expect(screen.getByText('供液不足引发间歇欠载')).toBeInTheDocument()
    expect(
      screen.queryByText('抽油井结蜡导致电流持续抬升'),
    ).not.toBeInTheDocument()

    await user.clear(searchInput)
    await user.selectOptions(screen.getByLabelText('案例类别'), '电气')
    await user.type(searchInput, '没有这个案例')
    await user.click(
      screen.getByRole('button', { name: '清除搜索条件' }),
    )

    expect(searchInput).toHaveValue('')
    expect(screen.getByLabelText('案例类别')).toHaveValue('all')
    expect(
      screen.getByText('抽油井结蜡导致电流持续抬升'),
    ).toBeInTheDocument()
  })

  it('favorites a real knowledge case with clear feedback', async () => {
    const user = userEvent.setup()
    renderKnowledgePage()

    const caseTitle = await screen.findByText('供液不足引发间歇欠载')
    const caseCard = caseTitle.closest('article')
    expect(caseCard).not.toBeNull()

    await user.click(
      within(caseCard!).getByRole('button', {
        name: '收藏供液不足引发间歇欠载',
      }),
    )

    expect(await screen.findByText('案例已收藏')).toBeInTheDocument()
    expect(
      within(caseCard!).getByRole('button', {
        name: '取消收藏供液不足引发间歇欠载',
      }),
    ).toBeInTheDocument()
  })

  it('simulates importing a complete placeholder case', async () => {
    const user = userEvent.setup()
    renderKnowledgePage()

    await screen.findByText('KC-001')
    await user.click(screen.getByRole('button', { name: '模拟导入案例' }))
    await user.type(screen.getByLabelText('案例标题'), '气锁导致产液波动')
    await user.selectOptions(screen.getByLabelText('案例分类'), '供液')
    await user.click(screen.getByRole('button', { name: '确认导入' }))

    expect(await screen.findByText('案例导入成功')).toBeInTheDocument()
    const importedTitle = screen.getByText('气锁导致产液波动')
    const importedCard = importedTitle.closest('article')
    expect(importedCard).not.toBeNull()
    expect(within(importedCard!).getByText('待补充')).toBeInTheDocument()
  })
})
