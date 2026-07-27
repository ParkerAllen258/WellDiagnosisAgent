import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the product name', () => {
    render(<App />)
    expect(screen.getByText('油水井运行异常诊断智能体')).toBeInTheDocument()
  })
})
