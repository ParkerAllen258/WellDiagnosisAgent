import { ConfigProvider } from 'antd'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../styles/global.css'
import { appRoutes } from './router'
import { themeConfig } from './theme'

const router = createBrowserRouter(appRoutes)

export function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}
