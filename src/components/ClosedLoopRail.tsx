import styles from './ClosedLoopRail.module.css'

const steps = ['自动感知', '智能诊断', '动态优化', '精准推送', '自主学习']

export interface ClosedLoopRailProps {
  activeStep: 1 | 2 | 3 | 4 | 5
}

export function ClosedLoopRail({ activeStep }: ClosedLoopRailProps) {
  return (
    <section className={styles.rail} aria-label="诊断闭环进度">
      <ol>
        {steps.map((label, index) => {
          const step = (index + 1) as ClosedLoopRailProps['activeStep']
          const state =
            step === activeStep
              ? styles.active
              : step < activeStep
                ? styles.completed
                : ''

          return (
            <li
              className={state}
              key={label}
              aria-current={step === activeStep ? 'step' : undefined}
            >
              <span aria-hidden="true">{step}</span>
              <strong>{label}</strong>
            </li>
          )
        })}
      </ol>
      <p>处理结果自动回流，迭代规则库与 AI 模型</p>
    </section>
  )
}
