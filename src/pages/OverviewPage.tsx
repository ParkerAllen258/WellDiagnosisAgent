import { Bar, Line, Pie } from '@ant-design/charts'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ClosedLoopRail } from '../components/ClosedLoopRail'
import { KpiCard } from '../components/KpiCard'
import { LoadablePanel } from '../components/LoadablePanel'
import { PageHeader } from '../components/PageHeader'
import { getOverviewData } from '../services/mockApi'
import type { OverviewData } from '../types/domain'
import styles from './OverviewPage.module.css'

type RegionFilter = 'all' | 'north' | 'south'
type RangeFilter = '7d' | '30d'

const regionNames = {
  all: '区域',
  north: '北区',
  south: '南区',
} as const

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [region, setRegion] = useState<RegionFilter>('all')
  const [range, setRange] = useState<RangeFilter>('7d')

  useEffect(() => {
    let cancelled = false

    getOverviewData()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setError('运行总览数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const trends = useMemo(() => {
    if (!data) return []
    const filtered =
      region === 'all'
        ? data.trends
        : data.trends.filter((item) => item.region === region)
    const byDate = new Map<
      string,
      { date: string; production: number; waterCut: number; count: number }
    >()

    for (const item of filtered) {
      const current = byDate.get(item.date)
      byDate.set(item.date, {
        date: item.date,
        production: (current?.production ?? 0) + item.production,
        waterCut: (current?.waterCut ?? 0) + item.waterCut,
        count: (current?.count ?? 0) + 1,
      })
    }

    const combined = [...byDate.values()].map((item) => ({
      date: item.date,
      production: item.production,
      waterCut: Number((item.waterCut / item.count).toFixed(1)),
    }))
    return range === '7d' ? combined.slice(-7) : combined
  }, [data, range, region])

  const trendChartData = useMemo(
    () =>
      trends.flatMap((item) => [
        {
          date: item.date,
          value: item.production,
          metric: '日产液（t）',
        },
        {
          date: item.date,
          value: item.waterCut,
          metric: '含水率（%）',
        },
      ]),
    [trends],
  )

  const ranking = useMemo(() => {
    if (!data) return []
    return region === 'all'
      ? data.regionRank
      : data.regionRank.filter((item) => item.region === region)
  }, [data, region])

  const regionTitle = regionNames[region]

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="FIELD OPERATIONS · 实时态势"
        title="运行总览"
        description="汇总井场产液、含水、异常与处置状态，快速识别需要关注的运行区域。"
        actions={
          <div className={styles.filters}>
            <label>
              <span>区域</span>
              <select
                value={region}
                onChange={(event) =>
                  setRegion(event.target.value as RegionFilter)
                }
              >
                <option value="all">全部区域</option>
                <option value="north">北区</option>
                <option value="south">南区</option>
              </select>
            </label>
            <label>
              <span>时间范围</span>
              <select
                value={range}
                onChange={(event) =>
                  setRange(event.target.value as RangeFilter)
                }
              >
                <option value="7d">近 7 天</option>
                <option value="30d">近 30 天</option>
              </select>
            </label>
          </div>
        }
      />

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
            <section className={styles.kpiGrid} aria-label="核心运行指标">
              <article className={styles.healthCard}>
                <div
                  className={styles.healthGauge}
                  style={{
                    '--health-angle': `${data.healthScore * 3.6}deg`,
                  } as CSSProperties}
                >
                  <strong aria-label={`健康度 ${data.healthScore} 分`}>
                    {data.healthScore}
                  </strong>
                  <span>分</span>
                </div>
                <div className={styles.healthCopy}>
                  <span>井场运行健康度</span>
                  <strong>运行状态优良</strong>
                  <small>较昨日提升 2 分</small>
                </div>
              </article>
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </section>

            <div className={styles.dashboardGrid}>
              <section className={`${styles.panel} ${styles.trendPanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>PRODUCTION PULSE</span>
                    <h2>
                      {range === '7d' ? '近 7 日' : '近 30 日'}产量与含水率趋势
                    </h2>
                  </div>
                  <div className={styles.legend}>
                    <span>日产液</span>
                    <span>含水率</span>
                  </div>
                </div>
                <div className={styles.chart}>
                  <Line
                    data={trendChartData}
                    xField="date"
                    yField="value"
                    colorField="metric"
                    height={220}
                    axis={{ y: { title: false }, x: { title: false } }}
                    scale={{
                      color: { range: ['#2D7FB3', '#D58A32'] },
                    }}
                    style={{ lineWidth: 2 }}
                  />
                </div>
              </section>

              <section className={`${styles.panel} ${styles.piePanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>ANOMALY MIX</span>
                    <h2>异常类型分布</h2>
                  </div>
                </div>
                <div className={styles.chart}>
                  <Pie
                    data={data.anomalyDistribution}
                    angleField="value"
                    colorField="type"
                    innerRadius={0.62}
                    height={220}
                    legend={{ color: { position: 'bottom' } }}
                    scale={{
                      color: {
                        range: ['#C8524A', '#D58A32', '#2D7FB3', '#7E91A0'],
                      },
                    }}
                  />
                </div>
              </section>

              <section className={`${styles.panel} ${styles.rankPanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>AREA BENCHMARK</span>
                    <h2>{regionTitle}健康排名</h2>
                  </div>
                  <strong className={styles.rankAverage}>
                    {ranking.length
                      ? Math.round(
                          ranking.reduce((sum, item) => sum + item.score, 0) /
                            ranking.length,
                        )
                      : 0}
                    <small>均值</small>
                  </strong>
                </div>
                <div className={styles.chart}>
                  <Bar
                    data={ranking}
                    xField="score"
                    yField="name"
                    colorField="region"
                    height={210}
                    axis={{ x: { title: false }, y: { title: false } }}
                    scale={{
                      color: { range: ['#2D7FB3', '#3F9A61'] },
                      x: { domain: [0, 100] },
                    }}
                    legend={false}
                  />
                </div>
              </section>

              <section className={`${styles.panel} ${styles.activityPanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>LIVE LOG</span>
                    <h2>最新运行动态</h2>
                  </div>
                  <span className={styles.liveStatus}>实时更新</span>
                </div>
                <ol className={styles.activities}>
                  {data.activities.map((activity) => (
                    <li key={activity.id} data-tone={activity.tone}>
                      <time>{activity.time}</time>
                      <span aria-hidden="true" />
                      <strong>{activity.title}</strong>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <ClosedLoopRail activeStep={1} />
          </>
        ) : null}
      </LoadablePanel>
    </div>
  )
}
