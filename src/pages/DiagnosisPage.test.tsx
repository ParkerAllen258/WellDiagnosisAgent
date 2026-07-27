import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

function renderDiagnosis() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/diagnosis'],
  })
  return render(
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>,
  )
}

describe('DiagnosisPage', () => {
  it('dispatches an anomaly after confirmation', async () => {
    const user = userEvent.setup()
    renderDiagnosis()

    expect((await screen.findAllByText('H2-4-1')).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('接入油水井')).toHaveTextContent('128')
    expect(screen.getByLabelText('今日新增异常')).toHaveTextContent('7')
    expect(screen.getByLabelText('待处理任务')).toHaveTextContent('4')
    expect(screen.getByLabelText('本月洗井作业')).toHaveTextContent('23')
    expect(screen.getByTestId('column-chart')).toBeInTheDocument()
    expect(screen.getByText('RW-002')).toBeInTheDocument()
    expect(screen.getByText('RW-003')).toBeInTheDocument()
    expect(screen.getByText('RW-001')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('严重度'), 'high')
    await user.selectOptions(screen.getByLabelText('刷新频率'), '300')
    expect(screen.getByLabelText('严重度')).toHaveValue('high')
    expect(screen.getByLabelText('刷新频率')).toHaveValue('300')

    await user.click(screen.getAllByRole('button', { name: '一键派单' })[0])

    expect(
      screen.getByRole('dialog', { name: '派发异常处理任务' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认派单' }))

    expect(await screen.findByText('任务已派发')).toBeInTheDocument()
    expect(screen.getByText('已派发')).toBeInTheDocument()
  })

  it('adopts the wash recommendation after confirmation', async () => {
    const user = userEvent.setup()
    renderDiagnosis()

    await user.click(await screen.findByRole('button', { name: '采纳建议' }))
    await user.click(screen.getByRole('button', { name: '确认采纳' }))

    expect(await screen.findByText('建议已采纳')).toBeInTheDocument()
    expect(screen.getByText('已采纳')).toBeInTheDocument()
  })
})
