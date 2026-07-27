import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <p>404 · ROUTE NOT FOUND</p>
      <h1 id="not-found-title">页面不存在</h1>
      <p>当前地址没有对应的工作台页面，请返回总览继续操作。</p>
      <Link to="/overview">
        <ArrowLeftOutlined aria-hidden="true" /> 返回运行总览
      </Link>
    </section>
  )
}
