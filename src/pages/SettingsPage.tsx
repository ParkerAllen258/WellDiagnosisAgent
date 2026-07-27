import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Switch,
  Tabs,
} from 'antd'
import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { LoadablePanel } from '../components/LoadablePanel'
import { PageHeader } from '../components/PageHeader'
import { getSettings } from '../services/mockApi'
import type { SystemSettings } from '../types/domain'
import styles from './SettingsPage.module.css'

interface SettingsFormValues {
  dataSource: {
    endpoint: string
    refreshSeconds: number
  }
  model: {
    primary: string
    confidencePercent: number
  }
  notifications: {
    browser: boolean
    highRiskOnly: boolean
  }
  appearance: {
    compact: boolean
    animations: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [messageApi, messageContext] = message.useMessage()
  const blocker = useBlocker(dirty)

  useEffect(() => {
    let cancelled = false

    getSettings()
      .then((result) => {
        if (cancelled) return
        setSettings(result)
        setDirty(false)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('系统设置加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  useEffect(() => {
    if (!dirty) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [dirty])

  const saveSettings = (values: SettingsFormValues) => {
    const nextSettings: SystemSettings = {
      dataSource: values.dataSource,
      model: {
        primary: values.model.primary.trim(),
        confidenceThreshold: values.model.confidencePercent / 100,
      },
      notifications: values.notifications,
      appearance: values.appearance,
    }
    setSettings(nextSettings)
    setDirty(false)
    messageApi.success('设置已保存')
  }

  const continueEditing = () => {
    if (blocker.state === 'blocked') blocker.reset()
  }

  const abandonChanges = () => {
    setDirty(false)
    if (blocker.state === 'blocked') blocker.proceed()
  }

  const tabItems = [
    {
      key: 'data-source',
      label: '数据源',
      children: (
        <section className={styles.settingSection}>
          <header>
            <span>01 · DATA SOURCE</span>
            <h2>生产数据接入</h2>
            <p>配置油水井运行数据的服务地址与刷新频率。</p>
          </header>
          <div className={styles.fieldGrid}>
            <Form.Item
              label="数据接口地址"
              name={['dataSource', 'endpoint']}
              rules={[
                { required: true, message: '请输入数据接口地址' },
                { type: 'url', message: '请输入有效的 URL' },
              ]}
            >
              <Input placeholder="https://api.example.com/v1" />
            </Form.Item>
            <Form.Item
              label="刷新间隔"
              name={['dataSource', 'refreshSeconds']}
              rules={[
                {
                  validator: (_, value: number | undefined) =>
                    value !== undefined && value >= 5 && value <= 300
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('刷新间隔需在 5 到 300 秒之间'),
                        ),
                },
              ]}
            >
              <InputNumber suffix="秒" min={5} max={300} />
            </Form.Item>
          </div>
          <div className={styles.note}>
            这里只保存接口配置，不会在前端发起真实连接测试。
          </div>
        </section>
      ),
    },
    {
      key: 'model',
      label: '诊断模型',
      children: (
        <section className={styles.settingSection}>
          <header>
            <span>02 · DIAGNOSIS MODEL</span>
            <h2>模型与判断阈值</h2>
            <p>设置主要诊断模型，以及结果进入处置流程的最低置信度。</p>
          </header>
          <div className={styles.fieldGrid}>
            <Form.Item
              label="主要诊断模型"
              name={['model', 'primary']}
              rules={[{ required: true, message: '请输入主要诊断模型' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="置信度阈值"
              name={['model', 'confidencePercent']}
              rules={[
                {
                  validator: (_, value: number | undefined) =>
                    value !== undefined && value >= 50 && value <= 99
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error('置信度需在 50% 到 99% 之间'),
                        ),
                },
              ]}
            >
              <InputNumber suffix="%" min={50} max={99} />
            </Form.Item>
          </div>
          <div className={styles.note}>
            界面使用百分比显示，保存时自动转换为模型所需的小数值。
          </div>
        </section>
      ),
    },
    {
      key: 'notifications',
      label: '通知策略',
      children: (
        <section className={styles.settingSection}>
          <header>
            <span>03 · NOTIFICATION POLICY</span>
            <h2>异常通知范围</h2>
            <p>选择是否接收浏览器通知，并控制通知的风险范围。</p>
          </header>
          <div className={styles.switchList}>
            <Form.Item
              label="浏览器通知"
              name={['notifications', 'browser']}
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item
              label="仅通知高风险异常"
              name={['notifications', 'highRiskOnly']}
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </div>
        </section>
      ),
    },
    {
      key: 'appearance',
      label: '界面偏好',
      children: (
        <section className={styles.settingSection}>
          <header>
            <span>04 · APPEARANCE</span>
            <h2>工作台显示偏好</h2>
            <p>保存界面密度和动效偏好，不在当前原型中全局应用。</p>
          </header>
          <div className={styles.switchList}>
            <Form.Item
              label="紧凑布局"
              name={['appearance', 'compact']}
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item
              label="界面动效"
              name={['appearance', 'animations']}
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </div>
        </section>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      {messageContext}

      <PageHeader
        eyebrow="SYSTEM SETTINGS · 本地配置"
        title="系统设置"
        description="集中维护数据接入、诊断模型、通知策略和工作台显示偏好。"
        actions={
          <div className={styles.headerActions}>
            <span className={styles.saveState} data-dirty={dirty}>
              {dirty ? '有未保存修改' : '设置已同步'}
            </span>
            <Button
              disabled={!dirty}
              form="settings-form"
              htmlType="submit"
              type="primary"
            >
              保存设置
            </Button>
          </div>
        }
      />

      <LoadablePanel
        loading={loading}
        error={error}
        empty={!settings}
        onRetry={() => {
          setLoading(true)
          setError(null)
          setReloadKey((value) => value + 1)
        }}
      >
        <Form
          className={styles.settingsForm}
          id="settings-form"
          initialValues={{
            dataSource: settings?.dataSource,
            model: {
              primary: settings?.model.primary,
              confidencePercent: (settings?.model.confidenceThreshold ?? 0) * 100,
            },
            notifications: settings?.notifications,
            appearance: settings?.appearance,
          }}
          layout="vertical"
          onFinish={saveSettings}
          onValuesChange={() => setDirty(true)}
        >
          <Tabs
            className={styles.tabs}
            defaultActiveKey="data-source"
            items={tabItems}
          />
        </Form>
      </LoadablePanel>

      <Modal
        title="存在未保存的修改"
        open={blocker.state === 'blocked'}
        closable={false}
        footer={[
          <Button key="continue" onClick={continueEditing}>
            继续编辑
          </Button>,
          <Button danger key="abandon" onClick={abandonChanges}>
            放弃修改
          </Button>,
        ]}
      >
        <p>离开当前页面会丢失尚未保存的设置，是否放弃修改？</p>
      </Modal>
    </div>
  )
}
