import {
  AlertOutlined,
  ApartmentOutlined,
  BookOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  SettingOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import styles from './AppShell.module.css'

const navigation = [
  { to: '/overview', label: '运行总览', icon: <DashboardOutlined /> },
  { to: '/diagnosis', label: '异常诊断', icon: <AlertOutlined /> },
  { to: '/optimization', label: '洗井优化', icon: <ExperimentOutlined /> },
  { to: '/tasks', label: '任务派发', icon: <ApartmentOutlined /> },
  { to: '/rules', label: '规则库管理', icon: <ToolOutlined /> },
  { to: '/knowledge', label: '知识学习', icon: <BookOutlined /> },
  { to: '/settings', label: '系统设置', icon: <SettingOutlined /> },
] as const

const clockFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function AppShell() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        跳到主要内容
      </a>

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            井
          </span>
          <div>
            <strong className={styles.productName}>
              油水井运行异常诊断智能体
            </strong>
            <div className={styles.capabilities} aria-label="系统能力">
              <span>智能诊断</span>
              <span>动态优化</span>
              <span>任务闭环</span>
            </div>
          </div>
        </div>

        <div className={styles.topbarMeta}>
          <div className={styles.modelStatus}>
            <span className={styles.statusPulse} aria-hidden="true" />
            双引擎 · 大模型运行中
          </div>
          <time className={styles.clock} dateTime={now.toISOString()}>
            {clockFormatter.format(now)}
          </time>
          <div className={styles.user}>
            <span className={styles.userIcon} aria-hidden="true">
              <UserOutlined />
            </span>
            工艺室管理员
          </div>
        </div>
      </header>

      <aside className={styles.sidebar}>
        <div className={styles.sectionLabel}>运维工作台</div>
        <nav className={styles.navigation} aria-label="主要导航">
          {navigation.map(({ to, label, icon }, index) => (
            <NavLink
              className={({ isActive }) =>
                `${styles.navItem}${isActive ? ' active' : ''}`
              }
              end
              key={to}
              to={to}
            >
              <span className={styles.sequence} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.navIcon} aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.loopStatus}>
          <span className={styles.loopDot} aria-hidden="true" />
          <div>
            <strong>诊断闭环在线</strong>
            <span>数据接入 → 知识回流</span>
          </div>
        </div>
      </aside>

      <main className={styles.main} id="main-content">
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
