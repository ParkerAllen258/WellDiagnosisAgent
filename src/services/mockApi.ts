import {
  diagnosisData,
  knowledgeData,
  optimizationData,
  overviewData,
  ruleData,
  settingsData,
  taskData,
} from '../mocks/data'

export async function mockRequest<T>(value: T, delay = 250): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, delay))
  return structuredClone(value)
}

export const getOverviewData = () => mockRequest(overviewData)
export const getDiagnosisData = () => mockRequest(diagnosisData)
export const getOptimizationData = () => mockRequest(optimizationData)
export const getTasks = () => mockRequest(taskData)
export const getRules = () => mockRequest(ruleData)
export const getKnowledgeData = () => mockRequest(knowledgeData)
export const getSettings = () => mockRequest(settingsData)
