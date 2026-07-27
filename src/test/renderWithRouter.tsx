import { ConfigProvider } from 'antd'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, type RenderOptions } from '@testing-library/react'
import { themeConfig } from '../app/theme'

interface RouterRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: RouterRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ConfigProvider theme={themeConfig}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </ConfigProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
