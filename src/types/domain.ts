export type Severity = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Kpi {
  label: string
  value: number
  unit: string
  detail: string
  tone: 'blue' | 'red' | 'orange' | 'green'
}

export interface DiagnosisEvent {
  id: string
  wellId: string
  type: string
  severity: Severity
  evidence: string
  discoveredAt: string
  engine: 'AI 模型' | '规则引擎' | '规则 + AI'
  dispatched: boolean
}

export interface WorkTask {
  id: string
  wellId: string
  title: string
  owner: string
  dueDate: string
  status: TaskStatus
  progress: number
  priority: 'urgent' | 'normal'
}

export interface OverviewData {
  kpis: Kpi[]
  healthScore: number
  trends: Array<{
    date: string
    production: number
    waterCut: number
    region: 'north' | 'south'
  }>
  anomalyDistribution: Array<{ type: string; value: number }>
  regionRank: Array<{
    name: string
    score: number
    region: 'north' | 'south'
  }>
  activities: Array<{
    id: string
    time: string
    title: string
    tone: 'info' | 'success' | 'warning'
  }>
}

export interface DiagnosisData {
  kpis: Kpi[]
  events: DiagnosisEvent[]
  trend: Array<{ date: string; value: number; predicted: boolean }>
  recommendation: {
    wellId: string
    type: string
    window: string
    confidence: number
  }
  tasks: WorkTask[]
}

export interface OptimizationPlan {
  id: string
  name: string
  window: string
  durationHours: number
  costWan: number
  risk: Severity
  benefitWan: number
}

export interface OptimizationWell {
  id: string
  risk: Severity
  confidence: number
  recommendedWindow: string
  downtimeHours: number
  costWan: number
  avoidedLossWan: number
  waxTrend: Array<{ date: string; value: number }>
  cycleTrend: Array<{ day: number; risk: number }>
  plans: OptimizationPlan[]
}

export interface OptimizationData {
  wells: OptimizationWell[]
}

export interface RuleItem {
  id: string
  name: string
  category: '结蜡' | '供液' | '电气' | '压力'
  target: string
  expression: string
  hitCount: number
  priority: Severity
  enabled: boolean
  updatedAt: string
}

export interface KnowledgeCase {
  id: string
  title: string
  category: '结蜡' | '供液' | '电气' | '压力'
  summary: string
  symptom: string
  cause: string
  evidence: string
  resolution: string
  favorite: boolean
}

export interface KnowledgeData {
  cases: KnowledgeCase[]
  learningRecords: Array<{
    id: string
    time: string
    title: string
    detail: string
  }>
  kpis: Kpi[]
}

export interface SystemSettings {
  dataSource: { endpoint: string; refreshSeconds: number }
  model: { primary: string; confidenceThreshold: number }
  notifications: { browser: boolean; highRiskOnly: boolean }
  appearance: { compact: boolean; animations: boolean }
}
