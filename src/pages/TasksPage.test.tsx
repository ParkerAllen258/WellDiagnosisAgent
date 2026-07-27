import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

function renderTasksPage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/tasks'],
  })

  render(
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>,
  )
}

describe('TasksPage', () => {
  it('creates a task and places it at the top of the table', async () => {
    const user = userEvent.setup()
    renderTasksPage()

    expect(
      await screen.findByRole('heading', { name: '任务派发' }),
    ).toBeInTheDocument()
    await screen.findByText('RW-002')
    await user.click(screen.getByRole('button', { name: '新建任务' }))

    await user.type(screen.getByLabelText('任务名称'), '北区井组现场巡检')
    await user.type(screen.getByLabelText('井号'), 'H4-8-2')
    await user.type(screen.getByLabelText('负责人'), '采油工周宁')
    await user.click(screen.getByRole('button', { name: '创建任务' }))

    expect(await screen.findByText('任务创建成功')).toBeInTheDocument()
    const createdRow = screen.getByText('北区井组现场巡检').closest('tr')
    expect(createdRow).not.toBeNull()
    expect(within(createdRow!).getByText('RW-004')).toBeInTheDocument()
    expect(screen.getAllByRole('row')[1]).toContainElement(createdRow)
  })

  it('advances the pending RW-003 task through processing to completion', async () => {
    const user = userEvent.setup()
    renderTasksPage()

    const taskId = await screen.findByText('RW-003')
    const pendingRow = taskId.closest('tr')
    expect(pendingRow).not.toBeNull()

    await user.click(
      within(pendingRow!).getByRole('button', { name: '开始处理' }),
    )
    expect(within(pendingRow!).getByText('处理中')).toBeInTheDocument()
    expect(
      within(pendingRow!).getByRole('progressbar', { name: '任务进度 45%' }),
    ).toBeInTheDocument()

    await user.click(
      within(pendingRow!).getByRole('button', { name: '完成任务' }),
    )
    expect(
      within(pendingRow!).getByText('已完成', {
        selector: '[data-status="completed"]',
      }),
    ).toBeInTheDocument()
    expect(
      within(pendingRow!).getByRole('progressbar', { name: '任务进度 100%' }),
    ).toBeInTheDocument()
    expect(
      within(pendingRow!).getByRole('button', { name: '已完成' }),
    ).toBeDisabled()
  })
})
