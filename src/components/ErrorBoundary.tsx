import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset)
      return (
        <div
          style={{
            padding: '40px 24px',
            maxWidth: 480,
            margin: '60px auto',
            background: 'var(--card, #fff)',
            border: '1px solid var(--border, #e5e0d6)',
            borderRadius: 16,
            textAlign: 'center',
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🐱💔</div>
          <h2 style={{ margin: '0 0 8px', fontFamily: 'Outfit, sans-serif' }}>Catto stumbled</h2>
          <p style={{ color: '#7a6f5e', fontSize: 14, marginBottom: 16 }}>
            Something unexpected happened. We've logged it. Try reloading.
          </p>
          <details style={{ fontSize: 11, textAlign: 'left', background: 'rgba(0,0,0,.04)', padding: 10, borderRadius: 8, marginBottom: 16 }}>
            <summary style={{ cursor: 'pointer' }}>Error detail</summary>
            <code style={{ wordBreak: 'break-word' }}>{this.state.error.message}</code>
          </details>
          <button
            onClick={this.reset}
            style={{
              background: 'linear-gradient(135deg,#FF6B9D,#F5C842)',
              color: '#fff',
              border: 0,
              borderRadius: 999,
              padding: '12px 22px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🐾 Reset and try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
