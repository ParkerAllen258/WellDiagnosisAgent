import { Area, Line } from '@ant-design/charts'
import { Button, message, Modal } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { ClosedLoopRail } from '../components/ClosedLoopRail'
import { LoadablePanel } from '../components/LoadablePanel'
import { PageHeader } from '../components/PageHeader'
import { SeverityTag } from '../components/SeverityTag'
import { getOptimizationData } from '../services/mockApi'
import type {
  OptimizationData,
  OptimizationPlan,
} from '../types/domain'
import styles from './OptimizationPage.module.css'

export default function OptimizationPage() {
  const [data, setData] = useState<OptimizationData | null>(null)
  const [selectedWellId, setSelectedWellId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [planToAdopt, setPlanToAdopt] = useState<OptimizationPlan | null>(null)
  const [adoptedPlanId, setAdoptedPlanId] = useState<string | null>(null)
  const [messageApi, messageContext] = message.useMessage()

  useEffect(() => {
    let cancelled = false

    getOptimizationData()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setSelectedWellId((current) => current || result.wells[0]?.id || '')
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('洗井优化数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const selectedWell = useMemo(
    () => data?.wells.find((well) => well.id === selectedWellId),
    [data, selectedWellId],
  )

  const confirmAdoption = () => {
    if (!planToAdopt) return
    setAdoptedPlanId(planToAdopt.id)
    setPlanToAdopt(null)
    messageApi.success('优化方案已采用')
  }

  return (
    <div className={styles.page}>
      {messageContext}

      <PageHeader
        eyebrow="WASHING OPTIMIZATION · 周期预测"
        title="洗井周期优化"
        description="结合结蜡负荷、周期风险和停井损失，为每口井选择更合适的作业窗口。"
        actions={
          <label className={styles.wellSelector}>
            <span>选择井号</span>
            <select
              value={selectedWellId}
              onChange={(event) => setSelectedWellId(event.target.value)}
            >
              {data?.wells.map((well) => (
                <option key={well.id} value={well.id}>
                  {well.id}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <LoadablePanel
        loading={loading}
        error={error}
        empty={!data || data.wells.length === 0}
        onRetry={() => {
          setLoading(true)
          setError(null)
          setReloadKey((value) => value + 1)
        }}
      >
        {selectedWell ? (
          <>
            <section className={styles.summary}>
              <div className={styles.summaryIdentity}>
                <span>当前评估井</span>
                <div>
                  <strong>{selectedWell.id}</strong>
                  <SeverityTag severity={selectedWell.risk} />
                </div>
                <p>综合结蜡负荷与固定洗井周期风险</p>
              </div>
              <dl>
                <div>
                  <dt>推荐作业窗口</dt>
                  <dd>{selectedWell.recommendedWindow}</dd>
                </div>
                <div>
                  <dt>模型置信度</dt>
                  <dd>{selectedWell.confidence}%</dd>
                </div>
                <div>
                  <dt>预计停井时长</dt>
                  <dd>{selectedWell.downtimeHours} 小时</dd>
                </div>
                <div>
                  <dt>作业成本</dt>
                  <dd>{selectedWell.costWan} 万元</dd>
                </div>
                <div>
                  <dt>预计避免损失</dt>
                  <dd className={styles.benefit}>
                    {selectedWell.avoidedLossWan} 万元
                  </dd>
                </div>
              </dl>
            </section>

            <div className={styles.chartGrid}>
              <section className={styles.panel}>
                <header>
                  <div>
                    <span>WAX LOAD</span>
                    <h2>结蜡负荷趋势</h2>
                  </div>
                  <small>近 7 日持续监测</small>
                </header>
                <div className={styles.chart}>
                  <Line
                    data={selectedWell.waxTrend}
                    xField="date"
                    yField="value"
                    height={230}
                    axis={{ x: { title: false }, y: { title: false } }}
                    scale={{ color: { range: ['#2D7FB3'] } }}
                    style={{ lineWidth: 2.5 }}
                  />
                </div>
              </section>

              <section className={styles.panel}>
                <header>
                  <div>
                    <span>CYCLE RISK</span>
                    <h2>{selectedWell.id} 风险趋势</h2>
                  </div>
                  <small>风险阈值 80%</small>
                </header>
                <div className={styles.chart}>
                  <Area
                    data={selectedWell.cycleTrend}
                    xField="day"
                    yField="risk"
                    height={230}
                    axis={{ x: { title: '运行天数' }, y: { title: false } }}
                    scale={{ y: { domain: [0, 100] } }}
                    style={{
                      fill: 'linear-gradient(-90deg, white 0%, #D58A32 100%)',
                      fillOpacity: 0.28,
                      lineWidth: 2,
                      stroke: '#D58A32',
                    }}
                  />
                </div>
              </section>
            </div>

            <section className={styles.planSection}>
              <header className={styles.sectionHeader}>
                <div>
                  <span>PLAN COMPARISON</span>
                  <h2>作业方案</h2>
                </div>
                <p>当前井共 {selectedWell.plans.length} 个可用方案</p>
              </header>

              <div className={styles.planGrid}>
                {selectedWell.plans.map((plan) => {
                  const adopted = adoptedPlanId === plan.id
                  return (
                    <article className={styles.planCard} key={plan.id}>
                      <div className={styles.planHeading}>
                        <div>
                          <span>{plan.id}</span>
                          <h3>{plan.name}</h3>
                        </div>
                        <SeverityTag severity={plan.risk} />
                      </div>
                      <strong className={styles.planWindow}>
                        {plan.window}
                      </strong>
                      <dl>
                        <div>
                          <dt>作业时长</dt>
                          <dd>{plan.durationHours} 小时</dd>
                        </div>
                        <div>
                          <dt>预计成本</dt>
                          <dd>{plan.costWan} 万元</dd>
                        </div>
                        <div>
                          <dt>预期收益</dt>
                          <dd>{plan.benefitWan} 万元</dd>
                        </div>
                      </dl>
                      <Button
                        block
                        disabled={adopted}
                        type={adopted ? 'default' : 'primary'}
                        onClick={() => setPlanToAdopt(plan)}
                      >
                        {adopted ? '已采用' : '采用方案'}
                      </Button>
                    </article>
                  )
                })}
              </div>
            </section>

            <ClosedLoopRail activeStep={3} />
          </>
        ) : null}
      </LoadablePanel>

      <Modal
        title="确认采用优化方案"
        open={Boolean(planToAdopt)}
        okText="确认采用"
        cancelText="取消"
        onCancel={() => setPlanToAdopt(null)}
        onOk={confirmAdoption}
      >
        <p>
          确认为井号 <strong>{selectedWell?.id}</strong> 采用
          “{planToAdopt?.name}”？
        </p>
      </Modal>
    </div>
  )
}
