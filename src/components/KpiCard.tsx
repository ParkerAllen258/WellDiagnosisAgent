import type { ReactNode } from 'react'
import type { Kpi } from '../types/domain'
import styles from './KpiCard.module.css'

export interface KpiCardProps extends Kpi {
  icon?: ReactNode
}

export function KpiCard({
  label,
  value,
  unit,
  detail,
  tone,
  icon,
}: KpiCardProps) {
  return (
    <article className={styles.card} data-tone={tone} aria-label={label}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <div className={styles.metric}>
        <strong>{value.toLocaleString('zh-CN')}</strong>
        <span>{unit}</span>
      </div>
      <p>{detail}</p>
    </article>
  )
}
