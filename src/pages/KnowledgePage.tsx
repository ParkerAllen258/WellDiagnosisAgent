import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Modal,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { ClosedLoopRail } from '../components/ClosedLoopRail'
import { KpiCard } from '../components/KpiCard'
import { LoadablePanel } from '../components/LoadablePanel'
import { PageHeader } from '../components/PageHeader'
import { getKnowledgeData } from '../services/mockApi'
import type { KnowledgeCase, KnowledgeData } from '../types/domain'
import styles from './KnowledgePage.module.css'

const categories: KnowledgeCase['category'][] = ['结蜡', '供液', '电气', '压力']

interface ImportFields {
  title: string
  category: KnowledgeCase['category']
}

export default function KnowledgePage() {
  const [data, setData] = useState<KnowledgeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<
    KnowledgeCase['category'] | 'all'
  >('all')
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importForm] = Form.useForm<ImportFields>()
  const [messageApi, messageContext] = message.useMessage()

  useEffect(() => {
    let cancelled = false

    getKnowledgeData()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('知识学习数据加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredCases = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return (data?.cases ?? []).filter((knowledgeCase) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          knowledgeCase.id,
          knowledgeCase.title,
          knowledgeCase.summary,
          knowledgeCase.symptom,
        ].some((value) => value.toLowerCase().includes(normalizedKeyword))
      const matchesCategory =
        categoryFilter === 'all' || knowledgeCase.category === categoryFilter
      return matchesKeyword && matchesCategory
    })
  }, [categoryFilter, data?.cases, keyword])

  const selectedCase =
    data?.cases.find((knowledgeCase) => knowledgeCase.id === selectedCaseId) ??
    null

  const clearFilters = () => {
    setKeyword('')
    setCategoryFilter('all')
  }

  const toggleFavorite = (knowledgeCase: KnowledgeCase) => {
    const favorite = !knowledgeCase.favorite
    setData((current) =>
      current
        ? {
            ...current,
            cases: current.cases.map((item) =>
              item.id === knowledgeCase.id ? { ...item, favorite } : item,
            ),
          }
        : null,
    )
    messageApi.success(favorite ? '案例已收藏' : '已取消收藏')
  }

  const closeImport = () => {
    setImportOpen(false)
    importForm.resetFields()
  }

  const importCase = (values: ImportFields) => {
    const nextNumber =
      Math.max(
        0,
        ...(data?.cases ?? []).map((knowledgeCase) =>
          Number(knowledgeCase.id.replace(/\D/g, '')),
        ),
      ) + 1
    const importedCase: KnowledgeCase = {
      id: `KC-${String(nextNumber).padStart(3, '0')}`,
      title: values.title.trim(),
      category: values.category,
      summary: '待补充',
      symptom: '待补充',
      cause: '待补充',
      evidence: '待补充',
      resolution: '待补充',
      favorite: false,
    }

    setData((current) =>
      current
        ? { ...current, cases: [importedCase, ...current.cases] }
        : current,
    )
    closeImport()
    messageApi.success('案例导入成功')
  }

  return (
    <div className={styles.page}>
      {messageContext}

      <PageHeader
        eyebrow="KNOWLEDGE LEARNING · 自主学习"
        title="知识学习"
        description="沉淀异常症状、诊断依据与现场处置经验，让每次闭环结果成为下一次判断的依据。"
        actions={
          <Button type="primary" onClick={() => setImportOpen(true)}>
            模拟导入案例
          </Button>
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
            <div className={styles.kpiGrid}>
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div>

            <section className={styles.categoryIndex} aria-label="知识分类">
              {categories.map((category) => {
                const count = data.cases.filter(
                  (knowledgeCase) => knowledgeCase.category === category,
                ).length
                return (
                  <button
                    className={styles.categoryCard}
                    data-active={categoryFilter === category}
                    data-category={category}
                    key={category}
                    type="button"
                    onClick={() =>
                      setCategoryFilter((current) =>
                        current === category ? 'all' : category,
                      )
                    }
                  >
                    <span>{category}</span>
                    <strong>{count}</strong>
                    <small>个案例</small>
                  </button>
                )
              })}
            </section>

            <div className={styles.workspace}>
              <section className={styles.casePanel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>FIELD CASEBOOK</span>
                    <h2>典型案例库</h2>
                  </div>
                  <p>当前显示 {filteredCases.length} 个案例</p>
                </div>

                <div
                  className={styles.filters}
                  role="search"
                  aria-label="知识案例筛选"
                >
                  <label>
                    <span>搜索案例</span>
                    <input
                      type="search"
                      value={keyword}
                      placeholder="案例 ID / 标题 / 症状"
                      onChange={(event) => setKeyword(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>案例类别</span>
                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(
                          event.target.value as
                            | KnowledgeCase['category']
                            | 'all',
                        )
                      }
                    >
                      <option value="all">全部类别</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {filteredCases.length > 0 ? (
                  <div className={styles.caseGrid}>
                    {filteredCases.map((knowledgeCase) => (
                      <article
                        className={styles.caseCard}
                        key={knowledgeCase.id}
                      >
                        <div className={styles.caseMeta}>
                          <span>{knowledgeCase.id}</span>
                          <span data-category={knowledgeCase.category}>
                            {knowledgeCase.category}
                          </span>
                        </div>
                        <button
                          className={styles.caseLink}
                          type="button"
                          onClick={() => setSelectedCaseId(knowledgeCase.id)}
                        >
                          <h3>{knowledgeCase.title}</h3>
                          <p>{knowledgeCase.summary}</p>
                        </button>
                        <div className={styles.caseActions}>
                          <Button
                            type="link"
                            onClick={() => setSelectedCaseId(knowledgeCase.id)}
                          >
                            查看案例
                          </Button>
                          <Button
                            aria-label={`${
                              knowledgeCase.favorite ? '取消收藏' : '收藏'
                            }${knowledgeCase.title}`}
                            type={knowledgeCase.favorite ? 'primary' : 'default'}
                            onClick={() => toggleFavorite(knowledgeCase)}
                          >
                            {knowledgeCase.favorite ? '已收藏' : '收藏'}
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="未找到匹配案例"
                    >
                      <Button onClick={clearFilters}>清除搜索条件</Button>
                    </Empty>
                  </div>
                )}
              </section>

              <aside className={styles.timelinePanel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>LEARNING LOG</span>
                    <h2>学习记录</h2>
                  </div>
                </div>
                <ol className={styles.timeline}>
                  {data.learningRecords.map((record) => (
                    <li key={record.id}>
                      <time>{record.time}</time>
                      <strong>{record.title}</strong>
                      <p>{record.detail}</p>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>

            <ClosedLoopRail activeStep={5} />
          </>
        ) : null}
      </LoadablePanel>

      <Drawer
        title="知识案例详情"
        open={Boolean(selectedCase)}
        size={500}
        onClose={() => setSelectedCaseId(null)}
      >
        {selectedCase ? (
          <div className={styles.detail}>
            <div className={styles.detailHeading}>
              <span>
                {selectedCase.id} · {selectedCase.category}
              </span>
              <h2>{selectedCase.title}</h2>
              <p>{selectedCase.summary}</p>
            </div>
            <dl>
              <div>
                <dt>异常症状</dt>
                <dd>{selectedCase.symptom}</dd>
              </div>
              <div>
                <dt>诊断原因</dt>
                <dd>{selectedCase.cause}</dd>
              </div>
              <div>
                <dt>判断依据</dt>
                <dd>{selectedCase.evidence}</dd>
              </div>
              <div>
                <dt>处置措施</dt>
                <dd>{selectedCase.resolution}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Drawer>

      <Modal
        title="模拟导入知识案例"
        open={importOpen}
        okText="确认导入"
        cancelText="取消"
        onCancel={closeImport}
        onOk={() => importForm.submit()}
      >
        <Form form={importForm} layout="vertical" onFinish={importCase}>
          <Form.Item
            label="案例标题"
            name="title"
            rules={[{ required: true, message: '请输入案例标题' }]}
          >
            <Input placeholder="例如：气锁导致产液波动" />
          </Form.Item>
          <Form.Item
            label="案例分类"
            name="category"
            rules={[{ required: true, message: '请选择案例分类' }]}
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
        </Form>
      </Modal>
    </div>
  )
}
