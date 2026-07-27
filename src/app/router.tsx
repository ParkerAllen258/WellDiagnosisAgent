import { Navigate, type RouteObject } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import DiagnosisPage from '../pages/DiagnosisPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import OptimizationPage from '../pages/OptimizationPage'
import OverviewPage from '../pages/OverviewPage'
import TasksPage from '../pages/TasksPage'

const placeholder = (title: string) => <h1>{title}</h1>

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'diagnosis', element: <DiagnosisPage /> },
      { path: 'optimization', element: <OptimizationPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'rules', element: placeholder('规则库管理') },
      { path: 'knowledge', element: placeholder('知识学习') },
      { path: 'settings', element: placeholder('系统设置') },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
