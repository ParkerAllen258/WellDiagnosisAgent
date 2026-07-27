import { Tag } from 'antd'
import type { Severity } from '../types/domain'

const severityMap = {
  high: { label: '高', color: 'red' },
  medium: { label: '中', color: 'orange' },
  low: { label: '低', color: 'blue' },
} as const

export function SeverityTag({ severity }: { severity: Severity }) {
  const { label, color } = severityMap[severity]
  return (
    <Tag color={color} aria-label={`${label}风险`}>
      {label}
    </Tag>
  )
}
