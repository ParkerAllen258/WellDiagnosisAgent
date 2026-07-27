import { ConfigProvider } from 'antd'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../styles/global.css'
import { AppErrorBoundary } from '../components/AppErrorBoundary'
import { appRoutes } from './router'
import { themeConfig } from './theme'

const router = createBrowserRouter(appRoutes)

export function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <AppErrorBoundary>
        <RouterProvider router={router} />
      </AppErrorBoundary>
    </ConfigProvider>
  )
}
