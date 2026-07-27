import { Column } from '@ant-design/charts'
import { Button, message, Modal, Progress } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { ClosedLoopRail } from '../components/ClosedLoopRail'
import { KpiCard } from '../components/KpiCard'
import { LoadablePanel } from '../components/LoadablePanel'
import { SeverityTag } from '../components/SeverityTag'
import { getDiagnosisData } from '../services/mockApi'
import type {
  DiagnosisData,
  DiagnosisEvent,
  Severity,
  TaskStatus,
} from '../types/domain'
import styles from './DiagnosisPage.module.css'

type SeverityFilter = 'all' | Severity
type RefreshSeconds = '30' | '60' | '300'

const taskStatus: Record<TaskStatus, { label: string; tone: string }> = {
  pending: { label: '待处理', tone: 'pending' },
  processing: { label: '处理中', tone: 'processing' },
  completed: { label: '已销项', tone: 'completed' },
  cancelled: { label: '已取消', tone: 'cancelled' },
}

export default function DiagnosisPage() {
  const [data, setData] = useState<DiagnosisData | null>(null)
  const [events, setEvents] = useState<DiagnosisEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [refreshSeconds, setRefreshSeconds] =
    useState<RefreshSeconds>('60')
  const [dispatchTarget, setDispatchTarget] =
    useState<DiagnosisEvent | null>(null)
  const [adoptionOpen, setAdoptionOpen] = useState(false)
  const [adopted, setAdopted] = useState(false)
  const [messageApi, messageContext] = message.useMessage()

  useEffect(() => {
    let cancelled = false

    getDiagnosisData()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setEvents(result.events)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('异常诊断数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  useEffect(() => {
    const timer = window.setInterval(
      () => setReloadKey((value) => value + 1),
      Number(refreshSeconds) * 1000,
    )
    return () => window.clearInterval(timer)
  }, [refreshSeconds])

  const filteredEvents = useMemo(
    () =>
      severity === 'all'
        ? events
        : events.filter((event) => event.severity === severity),
    [events, severity],
  )

  const confirmDispatch = () => {
    if (!dispatchTarget) return
    setEvents((current) =>
      current.map((event) =>
        event.id === dispatchTarget.id
          ? { ...event, dispatched: true }
          : event,
      ),
    )
    setDispatchTarget(null)
    messageApi.success('任务已派发')
  }

  const confirmAdoption = () => {
    setAdopted(true)
    setAdoptionOpen(false)
    messageApi.success('建议已采纳')
  }

  return (
    <div className={styles.page}>
      {messageContext}

      <LoadablePanel
        loading={loading}
        error={error}
        empty={!data}
        onRetry={() => {
          setLoading(true)
          setError(null)
          setReloadKey((value) => value + 1)
        }}
      >
        {data ? (
          <>
            <section className={styles.kpiGrid} aria-label="诊断核心指标">
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </section>

            <div className={styles.workspace}>
              <section className={styles.tablePanel}>
                <header className={styles.panelHeader}>
                  <div>
                    <span>REAL-TIME DIAGNOSIS</span>
                    <h1>实时异常诊断列表</h1>
                  </div>
                  <div className={styles.filters}>
                    <label>
                      <span>严重度</span>
                      <select
                        value={severity}
                        onChange={(event) =>
                          setSeverity(event.target.value as SeverityFilter)
                        }
                      >
                        <option value="all">全部等级</option>
                        <option value="high">高风险</option>
                        <option value="medium">中风险</option>
                        <option value="low">低风险</option>
                      </select>
                    </label>
                    <label>
                      <span>刷新频率</span>
                      <select
                        value={refreshSeconds}
                        onChange={(event) =>
                          setRefreshSeconds(
                            event.target.value as RefreshSeconds,
                          )
                        }
                      >
                        <option value="30">每 30 秒</option>
                        <option value="60">每 1 分钟</option>
                        <option value="300">每 5 分钟</option>
                      </select>
                    </label>
                  </div>
                </header>

                <div className={styles.tableViewport}>
                  <table aria-label="实时异常诊断列表">
                    <colgroup>
                      <col className={styles.wellColumn} />
                      <col className={styles.typeColumn} />
                      <col className={styles.severityColumn} />
                      <col />
                      <col className={styles.timeColumn} />
                      <col className={styles.engineColumn} />
                      <col className={styles.actionColumn} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>井号</th>
                        <th>异常类型</th>
                        <th>严重度</th>
                        <th>诊断依据</th>
                        <th>发现时间</th>
                        <th>诊断引擎</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr
                          key={event.id}
                          data-critical={event.severity === 'high'}
                        >
                          <td>
                            <strong>{event.wellId}</strong>
                          </td>
                          <td>{event.type}</td>
                          <td>
                            <SeverityTag severity={event.severity} />
                          </td>
                          <td className={styles.evidence}>{event.evidence}</td>
                          <td>
                            <time>{event.discoveredAt}</time>
                          </td>
                          <td>
                            <span className={styles.engine}>{event.engine}</span>
                          </td>
                          <td>
                            {event.dispatched ? (
                              <span className={styles.dispatched}>已派发</span>
                            ) : (
                              <Button
                                size="small"
                                type="primary"
                                onClick={() => setDispatchTarget(event)}
                              >
                                一键派单
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredEvents.length === 0 ? (
                    <div className={styles.noRows}>当前等级暂无异常</div>
                  ) : null}
                </div>
              </section>

              <aside className={styles.insights} aria-label="诊断洞察与任务">
                <section className={styles.recommendationPanel}>
                  <header className={styles.panelHeader}>
                    <div>
                      <span>WASHING DECISION</span>
                      <h2>洗井周期优化 · 决策推荐</h2>
                    </div>
                    <span className={styles.predictBadge}>趋势预测</span>
                  </header>

                  <div className={styles.recommendationTitle}>
                    <strong>{data.recommendation.wellId}</strong>
                    <span>{data.recommendation.type}</span>
                  </div>
                  <div className={styles.trendChart}>
                    <Column
                      data={data.trend}
                      xField="date"
                      yField="value"
                      height={142}
                      axis={{
                        x: { title: false, tick: false },
                        y: false,
                      }}
                      style={{
                        fill: (datum: { predicted: boolean }) =>
                          datum.predicted ? '#C8524A' : '#91BDDE',
                      }}
                    />
                  </div>
                  <p className={styles.diagnosisCopy}>
                    三相电流负荷日升速率 <strong>4% / 天</strong>，预计
                    <strong> 3 天后</strong>超过安全阈值
                  </p>
                  <p className={styles.diagnosisCopy}>
                    较固定周期（30 天）<strong>提前 6 天</strong>介入，避免卡泵风险
                  </p>

                  <div className={styles.recommendationStrip}>
                    <span>
                      推荐作业窗口{' '}
                      <strong>
                        {data.recommendation.window.replace(' ～ ', ' ~ ')}
                      </strong>{' '}
                      （置信度 {data.recommendation.confidence}%）
                    </span>
                    {adopted ? (
                      <span className={styles.adopted}>已采纳</span>
                    ) : (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => setAdoptionOpen(true)}
                      >
                        采纳建议
                      </Button>
                    )}
                  </div>
                </section>

                <section className={styles.taskPanel}>
                  <header className={styles.panelHeader}>
                    <div>
                      <span>DISPATCH TRACKING</span>
                      <h2>任务派发跟踪</h2>
                    </div>
                    <span className={styles.taskCount}>3 项任务</span>
                  </header>

                  <div className={styles.taskList}>
                    {data.tasks.map((task) => {
                      const status = taskStatus[task.status]
                      return (
                        <article key={task.id} className={styles.task}>
                          <div className={styles.taskTitle}>
                            <strong>{task.id}</strong>
                            <span>{task.wellId}</span>
                            <span>{task.title}</span>
                            <em data-tone={status.tone}>{status.label}</em>
                          </div>
                          <p>
                            责任人：{task.owner} · 时限 {task.dueDate.slice(5)}
                          </p>
                          <Progress
                            percent={task.progress}
                            showInfo={false}
                            size="small"
                            status={
                              task.status === 'completed' ? 'success' : 'active'
                            }
                          />
                        </article>
                      )
                    })}
                  </div>
                </section>
              </aside>
            </div>

            <ClosedLoopRail activeStep={2} />
          </>
        ) : null}
      </LoadablePanel>

      <Modal
        title="派发异常处理任务"
        open={Boolean(dispatchTarget)}
        okText="确认派单"
        cancelText="取消"
        onCancel={() => setDispatchTarget(null)}
        onOk={confirmDispatch}
      >
        <p>
          将为井号 <strong>{dispatchTarget?.wellId}</strong> 创建
          “{dispatchTarget?.type}”处理任务，并推送至责任班组。
        </p>
      </Modal>

      <Modal
        title="采纳洗井建议"
        open={adoptionOpen}
        okText="确认采纳"
        cancelText="取消"
        onCancel={() => setAdoptionOpen(false)}
        onOk={confirmAdoption}
      >
        <p>
          确认采用 {data?.recommendation.wellId} 在{' '}
          {data?.recommendation.window} 的推荐作业窗口？
        </p>
      </Modal>
    </div>
  )
}
