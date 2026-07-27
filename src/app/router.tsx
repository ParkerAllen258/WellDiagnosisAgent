import { Navigate, type RouteObject } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { NotFoundPage } from '../pages/NotFoundPage'

const placeholder = (title: string) => <h1>{title}</h1>

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: placeholder('运行总览') },
      { path: 'diagnosis', element: placeholder('异常诊断') },
      { path: 'optimization', element: placeholder('洗井优化') },
      { path: 'tasks', element: placeholder('任务派发') },
      { path: 'rules', element: placeholder('规则库管理') },
      { path: 'knowledge', element: placeholder('知识学习') },
      { path: 'settings', element: placeholder('系统设置') },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
