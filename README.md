# 油水井运行异常诊断智能体

这是一个桌面端前端原型，用于展示油水井运行总览、异常诊断、洗井优化、任务派发、规则管理、知识学习和系统设置。

当前项目是**纯前端页面**：所有数据都来自项目内的模拟数据，不包含后端服务、数据库、真实账号登录、文件上传或生产环境接口。

## 第一次运行

开始前，请先确认电脑已经安装 Node.js 和 npm。然后在项目目录打开终端，依次运行：

```bash
npm install
npm run dev
```

终端会显示一个本地访问地址，通常是 `http://localhost:5173`。在浏览器打开该地址即可查看项目。

停止本地服务时，在终端按 `Control + C`。

## 常用命令

```bash
# 安装项目依赖；首次运行或依赖发生变化时执行
npm install

# 启动本地开发服务
npm run dev

# 运行全部自动化测试
npm test -- --run

# 检查 TypeScript 类型
npm run typecheck

# 检查代码规范
npm run lint

# 生成可交付的生产构建，结果位于 dist 目录
npm run build
```

## 页面路由

项目共有 7 个主要页面：

| 地址 | 页面 | 用途 |
| --- | --- | --- |
| `/overview` | 运行总览 | 查看井况指标、趋势和异常分布 |
| `/diagnosis` | 异常诊断 | 查看异常事件、诊断依据和派发状态 |
| `/optimization` | 洗井优化 | 比较洗井窗口、风险趋势和优化方案 |
| `/tasks` | 任务派发 | 创建任务并推进处理状态 |
| `/rules` | 规则库管理 | 新建、编辑和启停诊断规则 |
| `/knowledge` | 知识学习 | 检索、收藏和模拟导入案例 |
| `/settings` | 系统设置 | 配置数据源、模型、通知和界面偏好 |

访问根地址 `/` 时会自动进入 `/overview`。

## 模拟数据说明

模拟数据保存在 [`src/mocks/data.ts`](src/mocks/data.ts)。

页面中的新建、编辑、收藏、状态推进和设置保存都只保存在浏览器当前内存中。**刷新页面后，这些操作会被重置，重新显示项目内的初始模拟数据。** 这是当前前端原型的正常行为，不是数据丢失故障。

项目不会读取或上传真实文件。“模拟导入案例”只根据填写的标题和类别，在当前页面内创建一条临时案例。

## 后端接入位置

前端统一从 [`src/services/mockApi.ts`](src/services/mockApi.ts) 获取数据。后端开发完成后，主要修改这个文件即可，页面组件不需要直接调用后端。

当前函数把本地模拟数据延迟返回：

```ts
export const getOverviewData = () => mockRequest(overviewData)
```

接入后端时，可以保留函数名和返回数据结构，用 `fetch` 替换函数体，例如：

```ts
export async function getOverviewData() {
  const response = await fetch('/api/overview')

  if (!response.ok) {
    throw new Error('运行总览数据加载失败')
  }

  return response.json()
}
```

其他页面对应 `getDiagnosisData`、`getOptimizationData`、`getTasks`、`getRules`、`getKnowledgeData` 和 `getSettings`。后端返回字段应与 [`src/types/domain.ts`](src/types/domain.ts) 中的类型保持一致。

正式接入时还需要由后端团队确认：

- 每个接口的真实地址和请求方式；
- 登录鉴权方式；
- 错误码和错误提示；
- 新建、编辑、启停、收藏和保存操作对应的写接口；
- 数据刷新与缓存策略。

## 当前范围

- 已完成桌面端前端原型和本地交互；
- 已包含加载、空数据、失败重试和页面级错误保护；
- 未实现后端、数据库、真实接口、用户权限和生产部署；
- 未将系统设置真正应用到全局界面或操作系统通知；
- 后续可在现有页面和类型基础上逐步接入完整架构。
