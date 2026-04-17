import React, { Component, ErrorInfo, ReactNode } from 'react'
import { analytics } from '../firebase'
import { logEvent } from 'firebase/analytics'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    try {
      if (analytics) {
        logEvent(analytics, 'error_caught', { message: error?.message || 'Unknown error' })
      }
    } catch (e) {
      console.error('Analytics log failed', e)
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef08a', // Kerala yellow
          color: '#166534', // Kerala green
          borderRadius: '8px',
          margin: '1rem',
          border: '2px solid #15803d',
          fontWeight: 'bold',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2>Something went wrong</h2>
          <p>We are experiencing an issue. Please try refreshing.</p>
        </div>
      )
    }

    return this.props.children
  }
}
