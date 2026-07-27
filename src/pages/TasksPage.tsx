import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Progress,
  Table,
  type TableColumnsType,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { ClosedLoopRail } from '../components/ClosedLoopRail'
import { KpiCard } from '../components/KpiCard'
import { LoadablePanel } from '../components/LoadablePanel'
import { PageHeader } from '../components/PageHeader'
import { getTasks } from '../services/mockApi'
import type { TaskStatus, WorkTask } from '../types/domain'
import styles from './TasksPage.module.css'

const statusLabels: Record<TaskStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  cancelled: '已取消',
}

const actionLabels: Record<TaskStatus, string> = {
  pending: '开始处理',
  processing: '完成任务',
  completed: '已完成',
  cancelled: '已取消',
}

const dueSoonCutoff = '2026-07-30'

interface CreateTaskFields {
  title: string
  wellId: string
  owner: string
  dueDate: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<WorkTask[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [form] = Form.useForm<CreateTaskFields>()
  const [messageApi, messageContext] = message.useMessage()

  useEffect(() => {
    let cancelled = false

    getTasks()
      .then((result) => {
        if (cancelled) return
        setTasks(result)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('任务数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const owners = useMemo(
    () => [...new Set(tasks?.map((task) => task.owner) ?? [])],
    [tasks],
  )

  const filteredTasks = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return (tasks ?? []).filter((task) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [task.id, task.wellId, task.title].some((value) =>
          value.toLowerCase().includes(normalizedKeyword),
        )
      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter
      const matchesOwner = ownerFilter === 'all' || task.owner === ownerFilter
      return matchesKeyword && matchesStatus && matchesOwner
    })
  }, [keyword, ownerFilter, statusFilter, tasks])

  const kpis = useMemo(() => {
    const allTasks = tasks ?? []
    return [
      {
        label: '任务总数',
        value: allTasks.length,
        unit: '项',
        detail: '全部生产运维任务',
        tone: 'blue' as const,
      },
      {
        label: '处理中',
        value: allTasks.filter((task) => task.status === 'processing').length,
        unit: '项',
        detail: '责任人正在现场处置',
        tone: 'orange' as const,
      },
      {
        label: '临期任务',
        value: allTasks.filter(
          (task) =>
            task.status !== 'completed' &&
            task.dueDate <= dueSoonCutoff,
        ).length,
        unit: '项',
        detail: '含已到期与三日内到期',
        tone: 'red' as const,
      },
      {
        label: '已完成',
        value: allTasks.filter((task) => task.status === 'completed').length,
        unit: '项',
        detail: '处置结果已回流',
        tone: 'green' as const,
      },
    ]
  }, [tasks])

  const selectedTask = tasks?.find((task) => task.id === detailTaskId) ?? null

  const advanceTask = (task: WorkTask) => {
    if (task.status !== 'pending' && task.status !== 'processing') return
    const nextStatus = task.status === 'pending' ? 'processing' : 'completed'
    setTasks((current) =>
      current?.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: nextStatus,
              progress: nextStatus === 'processing' ? 45 : 100,
            }
          : item,
      ) ?? null,
    )
    messageApi.success(
      nextStatus === 'processing' ? '任务已开始处理' : '任务已完成',
    )
  }

  const createTask = (values: CreateTaskFields) => {
    const nextNumber =
      Math.max(
        0,
        ...(tasks ?? []).map((task) => Number(task.id.replace(/\D/g, ''))),
      ) + 1
    const newTask: WorkTask = {
      id: `RW-${String(nextNumber).padStart(3, '0')}`,
      wellId: values.wellId.trim(),
      title: values.title.trim(),
      owner: values.owner.trim(),
      dueDate: values.dueDate,
      status: 'pending',
      progress: 0,
      priority: 'normal',
    }

    setTasks((current) => [newTask, ...(current ?? [])])
    setCreateOpen(false)
    form.resetFields()
    messageApi.success('任务创建成功')
  }

  const columns: TableColumnsType<WorkTask> = [
    {
      title: '任务 ID',
      dataIndex: 'id',
      width: 92,
      render: (id: string) => <strong className={styles.taskId}>{id}</strong>,
    },
    { title: '井号', dataIndex: 'wellId', width: 90 },
    { title: '任务标题', dataIndex: 'title', width: 160 },
    { title: '负责人', dataIndex: 'owner', width: 116 },
    { title: '计划日期', dataIndex: 'dueDate', width: 108 },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 76,
      render: (priority: WorkTask['priority']) => (
        <span className={styles.priority} data-priority={priority}>
          {priority === 'urgent' ? '紧急' : '普通'}
        </span>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 126,
      render: (progress: number) => (
        <Progress
          aria-label={`任务进度 ${progress}%`}
          percent={progress}
          size="small"
          strokeColor={progress === 100 ? '#3f9a61' : '#2d7fb3'}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 82,
      render: (status: TaskStatus) => (
        <span className={styles.status} data-status={status}>
          {statusLabels[status]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 164,
      render: (_, task) => (
        <div className={styles.actions}>
          <Button type="link" onClick={() => setDetailTaskId(task.id)}>
            查看详情
          </Button>
          <Button
            disabled={
              task.status === 'completed' || task.status === 'cancelled'
            }
            size="small"
            type={task.status === 'pending' ? 'primary' : 'default'}
            onClick={() => advanceTask(task)}
          >
            {actionLabels[task.status]}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      {messageContext}

      <PageHeader
        eyebrow="TASK DISPATCH · 精准推送"
        title="任务派发"
        description="统一跟踪异常处置任务、责任人和现场进度，确保每项诊断建议闭环落地。"
        actions={
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            新建任务
          </Button>
        }
      />

      <LoadablePanel
        loading={loading}
        error={error}
        empty={tasks?.length === 0}
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

        <section className={styles.taskPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>DISPATCH BOARD</span>
              <h2>任务状态流水线</h2>
            </div>
            <p>当前显示 {filteredTasks.length} 项</p>
          </div>

          <div className={styles.filters} role="search" aria-label="任务筛选">
            <label>
              <span>关键词</span>
              <input
                type="search"
                value={keyword}
                placeholder="任务 ID / 井号 / 标题"
                onChange={(event) => setKeyword(event.target.value)}
              />
            </label>
            <label>
              <span>状态</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as TaskStatus | 'all')
                }
              >
                <option value="all">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </label>
            <label>
              <span>按负责人</span>
              <select
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
              >
                <option value="all">全部负责人</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Table
            columns={columns}
            dataSource={filteredTasks}
            locale={{ emptyText: '没有符合条件的任务' }}
            pagination={false}
            rowKey="id"
            scroll={{ x: 1116 }}
            size="middle"
          />
        </section>

        <ClosedLoopRail activeStep={4} />
      </LoadablePanel>

      <Drawer
        title="新建任务"
        open={createOpen}
        size={480}
        onClose={() => {
          setCreateOpen(false)
          form.resetFields()
        }}
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" onClick={() => form.submit()}>
              创建任务
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          initialValues={{ dueDate: '2026-07-30' }}
          layout="vertical"
          onFinish={createTask}
        >
          <Form.Item
            label="任务名称"
            name="title"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="例如：北区井组现场巡检" />
          </Form.Item>
          <Form.Item
            label="井号"
            name="wellId"
            rules={[{ required: true, message: '请输入井号' }]}
          >
            <Input placeholder="例如：H4-8-2" />
          </Form.Item>
          <Form.Item
            label="负责人"
            name="owner"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="例如：采油工周宁" />
          </Form.Item>
          <Form.Item label="计划完成日期" name="dueDate">
            <input className={styles.dateInput} type="date" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="任务详情"
        open={Boolean(selectedTask)}
        size={440}
        onClose={() => setDetailTaskId(null)}
      >
        {selectedTask ? (
          <div className={styles.detail}>
            <div className={styles.detailHeading}>
              <span>{selectedTask.id}</span>
              <h2>{selectedTask.title}</h2>
              <span
                className={styles.status}
                data-status={selectedTask.status}
              >
                {statusLabels[selectedTask.status]}
              </span>
            </div>
            <dl>
              <div>
                <dt>井号</dt>
                <dd>{selectedTask.wellId}</dd>
              </div>
              <div>
                <dt>负责人</dt>
                <dd>{selectedTask.owner}</dd>
              </div>
              <div>
                <dt>计划完成日期</dt>
                <dd>{selectedTask.dueDate}</dd>
              </div>
              <div>
                <dt>优先级</dt>
                <dd>
                  {selectedTask.priority === 'urgent' ? '紧急' : '普通'}
                </dd>
              </div>
              <div>
                <dt>当前进度</dt>
                <dd>{selectedTask.progress}%</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
