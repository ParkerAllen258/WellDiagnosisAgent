import { describe, expect, it } from 'vitest'
import { getDiagnosisData, getTasks } from './mockApi'

describe('mockApi', () => {
  it('includes the prototype diagnosis and task rows', async () => {
    const [diagnosis, tasks] = await Promise.all([
      getDiagnosisData(),
      getTasks(),
    ])

    expect(diagnosis.events).toHaveLength(6)
    expect(tasks).toHaveLength(3)
  })

  it('returns isolated task data for each request', async () => {
    const first = await getTasks()
    first[0].title = '已修改'

    const second = await getTasks()
    expect(second[0].title).not.toBe('已修改')
  })
})
