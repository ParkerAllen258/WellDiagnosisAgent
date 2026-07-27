import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

describe('OptimizationPage', () => {
  it('selects a real well and adopts its plan', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/optimization'],
    })

    render(
      <ConfigProvider theme={themeConfig}>
        <RouterProvider router={router} />
      </ConfigProvider>,
    )

    expect(await screen.findByText('洗井周期优化')).toBeInTheDocument()
    await screen.findByRole('option', { name: 'H3-2-7' })
    await user.selectOptions(screen.getByLabelText('选择井号'), 'H3-2-7')

    expect(screen.getByText('H3-2-7 风险趋势')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '采用方案' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '采用方案' }))
    await user.click(screen.getByRole('button', { name: '确认采用' }))

    expect(await screen.findByText('优化方案已采用')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '已采用' })).toBeDisabled()
  })
})
