import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

describe('OverviewPage', () => {
  it('filters the health overview by region', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/overview'],
    })

    render(
      <ConfigProvider theme={themeConfig}>
        <RouterProvider router={router} />
      </ConfigProvider>,
    )

    expect(await screen.findByText('井场运行健康度')).toBeInTheDocument()
    expect(screen.getByLabelText('健康度 91 分')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('区域'), 'north')

    expect(screen.getByText('北区健康排名')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('时间范围'), '30d')
    expect(
      screen.getByRole('heading', { name: '近 30 日产量与含水率趋势' }),
    ).toBeInTheDocument()
  })
})
