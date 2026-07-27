import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

function renderSettingsPage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/settings'],
  })

  render(
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>,
  )

  return router
}

describe('SettingsPage', () => {
  it('validates the data source URL and refresh interval', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    expect(
      await screen.findByRole('heading', { name: '系统设置' }),
    ).toBeInTheDocument()
    await screen.findByDisplayValue('https://api.oilfield.example/v1')
    const endpointInput = screen.getByLabelText('数据接口地址')
    const refreshInput = screen.getByRole('spinbutton', {
      name: '刷新间隔',
    })

    await user.clear(endpointInput)
    await user.type(endpointInput, 'oilfield.local')
    await user.clear(refreshInput)
    await user.type(refreshInput, '4')
    await user.click(screen.getByRole('button', { name: '保存设置' }))

    expect(await screen.findByText('请输入有效的 URL')).toBeInTheDocument()
    expect(
      await screen.findByText('刷新间隔需在 5 到 300 秒之间'),
    ).toBeInTheDocument()
    expect(screen.queryByText('设置已保存')).not.toBeInTheDocument()
  })

  it('shows confidence as a percentage and resets dirty state after save', async () => {
    const user = userEvent.setup()
    renderSettingsPage()

    await screen.findByDisplayValue('https://api.oilfield.example/v1')
    const saveButton = screen.getByRole('button', { name: '保存设置' })
    expect(saveButton).toBeDisabled()

    await user.click(screen.getByRole('tab', { name: '诊断模型' }))
    const confidenceInput = screen.getByRole('spinbutton', {
      name: '置信度阈值',
    })
    expect(confidenceInput).toHaveValue('78')

    await user.clear(confidenceInput)
    await user.type(confidenceInput, '85')
    expect(saveButton).toBeEnabled()
    await user.click(saveButton)

    expect(await screen.findByText('设置已保存')).toBeInTheDocument()
    expect(confidenceInput).toHaveValue('85')
    expect(saveButton).toBeDisabled()
  })

  it('blocks internal navigation until the user resolves dirty changes', async () => {
    const user = userEvent.setup()
    const router = renderSettingsPage()

    const endpointInput = await screen.findByDisplayValue(
      'https://api.oilfield.example/v1',
    )
    await user.clear(endpointInput)
    await user.type(endpointInput, 'https://api.oilfield.example/v2')

    await act(async () => {
      await router.navigate('/overview')
    })
    expect(
      screen.getByRole('dialog', { name: '存在未保存的修改' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '继续编辑' }))
    expect(
      screen.getByRole('heading', { name: '系统设置' }),
    ).toBeInTheDocument()
    expect(endpointInput).toHaveValue('https://api.oilfield.example/v2')

    await act(async () => {
      await router.navigate('/overview')
    })
    await user.click(screen.getByRole('button', { name: '放弃修改' }))
    expect(
      await screen.findByRole('heading', { name: '运行总览' }),
    ).toBeInTheDocument()
  })
})
