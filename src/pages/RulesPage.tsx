import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Switch,
  Table,
  type TableColumnsType,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { KpiCard } from '../components/KpiCard'
import { LoadablePanel } from '../components/LoadablePanel'
import { PageHeader } from '../components/PageHeader'
import { SeverityTag } from '../components/SeverityTag'
import { getRules } from '../services/mockApi'
import type { RuleItem } from '../types/domain'
import styles from './RulesPage.module.css'

const categories: RuleItem['category'][] = ['结蜡', '供液', '电气', '压力']

interface RuleFields {
  name: string
  category: RuleItem['category']
  target: string
  expression: string
}

export default function RulesPage() {
  const [rules, setRules] = useState<RuleItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<
    RuleItem['category'] | 'all'
  >('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [ruleToDisable, setRuleToDisable] = useState<RuleItem | null>(null)
  const [form] = Form.useForm<RuleFields>()
  const [messageApi, messageContext] = message.useMessage()

  useEffect(() => {
    let cancelled = false

    getRules()
      .then((result) => {
        if (cancelled) return
        setRules(result)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('规则库数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredRules = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return (rules ?? []).filter((rule) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [rule.id, rule.name, rule.target, rule.expression].some((value) =>
          value.toLowerCase().includes(normalizedKeyword),
        )
      const matchesCategory =
        categoryFilter === 'all' || rule.category === categoryFilter
      return matchesKeyword && matchesCategory
    })
  }, [categoryFilter, keyword, rules])

  const kpis = useMemo(() => {
    const allRules = rules ?? []
    return [
      {
        label: '规则总数',
        value: allRules.length,
        unit: '条',
        detail: '覆盖四类运行异常',
        tone: 'blue' as const,
      },
      {
        label: '启用规则',
        value: allRules.filter((rule) => rule.enabled).length,
        unit: '条',
        detail: '当前参与实时识别',
        tone: 'green' as const,
      },
      {
        label: '累计命中',
        value: allRules.reduce((sum, rule) => sum + rule.hitCount, 0),
        unit: '次',
        detail: '规则库历史识别次数',
        tone: 'orange' as const,
      },
      {
        label: '高优先级',
        value: allRules.filter((rule) => rule.priority === 'high').length,
        unit: '条',
        detail: '重点生产风险规则',
        tone: 'red' as const,
      },
    ]
  }, [rules])

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingRuleId(null)
    form.resetFields()
  }

  const openCreateDrawer = () => {
    setEditingRuleId(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEditDrawer = (rule: RuleItem) => {
    setEditingRuleId(rule.id)
    form.setFieldsValue({
      name: rule.name,
      category: rule.category,
      target: rule.target,
      expression: rule.expression,
    })
    setDrawerOpen(true)
  }

  const saveRule = (values: RuleFields) => {
    if (editingRuleId) {
      setRules(
        (current) =>
          current?.map((rule) =>
            rule.id === editingRuleId
              ? {
                  ...rule,
                  ...values,
                  name: values.name.trim(),
                  target: values.target.trim(),
                  expression: values.expression.trim(),
                  updatedAt: '2026-07-27',
                }
              : rule,
          ) ?? null,
      )
      messageApi.success('规则已更新')
    } else {
      const nextNumber =
        Math.max(
          0,
          ...(rules ?? []).map((rule) => Number(rule.id.replace(/\D/g, ''))),
        ) + 1
      const newRule: RuleItem = {
        id: `RL-${String(nextNumber).padStart(3, '0')}`,
        name: values.name.trim(),
        category: values.category,
        target: values.target.trim(),
        expression: values.expression.trim(),
        hitCount: 0,
        priority: 'medium',
        enabled: true,
        updatedAt: '2026-07-27',
      }
      setRules((current) => [newRule, ...(current ?? [])])
      messageApi.success('规则创建成功')
    }
    closeDrawer()
  }

  const toggleRule = (rule: RuleItem, enabled: boolean) => {
    if (!enabled) {
      setRuleToDisable(rule)
      return
    }
    setRules(
      (current) =>
        current?.map((item) =>
          item.id === rule.id ? { ...item, enabled: true } : item,
        ) ?? null,
    )
    messageApi.success('规则已启用')
  }

  const confirmDisable = () => {
    if (!ruleToDisable) return
    setRules(
      (current) =>
        current?.map((rule) =>
          rule.id === ruleToDisable.id ? { ...rule, enabled: false } : rule,
        ) ?? null,
    )
    setRuleToDisable(null)
    messageApi.success('规则已停用')
  }

  const columns: TableColumnsType<RuleItem> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      width: 188,
      render: (name: string, rule) => (
        <div className={styles.ruleName}>
          <span>{rule.id}</span>
          <strong>{name}</strong>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 76,
      render: (category: RuleItem['category']) => (
        <span className={styles.category} data-category={category}>
          {category}
        </span>
      ),
    },
    { title: '监测对象', dataIndex: 'target', width: 112 },
    {
      title: '触发条件',
      dataIndex: 'expression',
      width: 260,
      render: (expression: string) => (
        <code className={styles.expression}>{expression}</code>
      ),
    },
    {
      title: '命中次数',
      dataIndex: 'hitCount',
      align: 'right',
      width: 82,
      render: (hitCount: number) => (
        <strong className={styles.hitCount}>{hitCount}</strong>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      align: 'center',
      width: 76,
      render: (priority: RuleItem['priority']) => (
        <SeverityTag severity={priority} />
      ),
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 104 },
    {
      title: '启停',
      dataIndex: 'enabled',
      align: 'center',
      width: 76,
      render: (enabled: boolean, rule) => (
        <Switch
          aria-label={`${rule.name}启停`}
          checked={enabled}
          checkedChildren="启"
          unCheckedChildren="停"
          onChange={(checked) => toggleRule(rule, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 72,
      render: (_, rule) => (
        <Button type="link" onClick={() => openEditDrawer(rule)}>
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      {messageContext}

      <PageHeader
        eyebrow="RULE ENGINE · 知识规则"
        title="规则库管理"
        description="维护异常识别条件、优先级和启停状态，让现场经验持续转化为可执行规则。"
        actions={
          <Button type="primary" onClick={openCreateDrawer}>
            新建规则
          </Button>
        }
      />

      <LoadablePanel
        loading={loading}
        error={error}
        empty={rules?.length === 0}
        onRetry={() => {
          setLoading(true)
          setError(null)
          setReloadKey((value) => value + 1)
        }}
      >
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <section className={styles.rulePanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>ACTIVE RULESET</span>
              <h2>规则启停控制台</h2>
            </div>
            <p>
              已启用 {rules?.filter((rule) => rule.enabled).length ?? 0} /{' '}
              {rules?.length ?? 0}
            </p>
          </div>

          <div className={styles.filters} role="search" aria-label="规则筛选">
            <label>
              <span>规则关键词</span>
              <input
                type="search"
                value={keyword}
                placeholder="规则 ID / 名称 / 对象 / 条件"
                onChange={(event) => setKeyword(event.target.value)}
              />
            </label>
            <label>
              <span>规则分类</span>
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value as RuleItem['category'] | 'all',
                  )
                }
              >
                <option value="all">全部分类</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Table
            columns={columns}
            dataSource={filteredRules}
            locale={{ emptyText: '没有符合条件的规则' }}
            pagination={false}
            rowClassName={(rule) => (rule.enabled ? '' : styles.disabledRow)}
            rowKey="id"
            scroll={{ x: 1120 }}
          />
        </section>
      </LoadablePanel>

      <Drawer
        title={editingRuleId ? '编辑规则' : '新建规则'}
        open={drawerOpen}
        size={500}
        onClose={closeDrawer}
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={closeDrawer}>取消</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingRuleId ? '保存修改' : '创建规则'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={saveRule}>
          <Form.Item
            label="规则名称"
            name="name"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="例如：套压连续下降预警" />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <select className={styles.formSelect}>
              <option value="">请选择分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item
            label="监测对象"
            name="target"
            rules={[{ required: true, message: '请输入监测对象' }]}
          >
            <Input placeholder="例如：套压" />
          </Form.Item>
          <Form.Item
            label="规则表达式"
            name="expression"
            rules={[{ required: true, message: '请输入规则表达式' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="例如：套压连续 3 小时下降 ≥ 15%"
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="确认停用规则"
        open={Boolean(ruleToDisable)}
        okText="确认停用"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        onCancel={() => setRuleToDisable(null)}
        onOk={confirmDisable}
      >
        <p>
          停用后“{ruleToDisable?.name}”将不再参与实时异常识别，确认继续吗？
        </p>
      </Modal>
    </div>
  )
}
