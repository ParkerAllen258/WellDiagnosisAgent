import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from 'antd'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from '../app/router'
import { themeConfig } from '../app/theme'

afterEach(cleanup)

function renderRulesPage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/rules'],
  })

  render(
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>,
  )
}

describe('RulesPage', () => {
  it('requires confirmation before disabling an enabled rule', async () => {
    const user = userEvent.setup()
    renderRulesPage()

    expect(
      await screen.findByRole('heading', { name: '规则库管理' }),
    ).toBeInTheDocument()
    const ruleName = await screen.findByText('结蜡趋势持续跟踪')
    const ruleRow = ruleName.closest('tr')
    expect(ruleRow).not.toBeNull()
    const ruleSwitch = within(ruleRow!).getByRole('switch', {
      name: '结蜡趋势持续跟踪启停',
    })

    await user.click(ruleSwitch)
    expect(ruleSwitch).toBeChecked()
    expect(
      screen.getByRole('dialog', { name: '确认停用规则' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '确认停用' }))
    expect(await screen.findByText('规则已停用')).toBeInTheDocument()
    expect(ruleSwitch).not.toBeChecked()
  })

  it('creates a pressure rule from the shared rule drawer', async () => {
    const user = userEvent.setup()
    renderRulesPage()

    await screen.findByText('RL-001')
    await user.click(screen.getByRole('button', { name: '新建规则' }))

    await user.type(screen.getByLabelText('规则名称'), '套压连续下降预警')
    await user.selectOptions(screen.getByLabelText('分类'), '压力')
    await user.type(screen.getByLabelText('监测对象'), '套压')
    await user.type(
      screen.getByLabelText('规则表达式'),
      '套压连续 3 小时下降 ≥ 15%',
    )
    await user.click(screen.getByRole('button', { name: '创建规则' }))

    expect(await screen.findByText('规则创建成功')).toBeInTheDocument()
    const createdRow = screen.getByText('套压连续下降预警').closest('tr')
    expect(createdRow).not.toBeNull()
    expect(within(createdRow!).getByText('RL-007')).toBeInTheDocument()
    expect(within(createdRow!).getByText('压力')).toBeInTheDocument()
  })

  it('prefills the shared drawer and replaces an edited rule', async () => {
    const user = userEvent.setup()
    renderRulesPage()

    const ruleName = await screen.findByText('结蜡趋势持续跟踪')
    const ruleRow = ruleName.closest('tr')
    expect(ruleRow).not.toBeNull()
    await user.click(within(ruleRow!).getByRole('button', { name: '编辑' }))

    const nameInput = screen.getByLabelText('规则名称')
    expect(nameInput).toHaveValue('结蜡趋势持续跟踪')
    expect(screen.getByLabelText('分类')).toHaveValue('结蜡')
    await user.clear(nameInput)
    await user.type(nameInput, '结蜡趋势重点跟踪')
    await user.click(screen.getByRole('button', { name: '保存修改' }))

    expect(await screen.findByText('规则已更新')).toBeInTheDocument()
    expect(screen.getByText('结蜡趋势重点跟踪')).toBeInTheDocument()
    expect(screen.queryByText('结蜡趋势持续跟踪')).not.toBeInTheDocument()
  })
})
