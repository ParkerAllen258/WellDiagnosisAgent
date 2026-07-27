import { Navigate, type RouteObject } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import DiagnosisPage from '../pages/DiagnosisPage'
import KnowledgePage from '../pages/KnowledgePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import OptimizationPage from '../pages/OptimizationPage'
import OverviewPage from '../pages/OverviewPage'
import RulesPage from '../pages/RulesPage'
import SettingsPage from '../pages/SettingsPage'
import TasksPage from '../pages/TasksPage'

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
      { path: 'rules', element: <RulesPage /> },
      { path: 'knowledge', element: <KnowledgePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
