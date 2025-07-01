import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleGoBack = () => {
    window.history.back()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card p-8 text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-loss/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-loss" />
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-text-primary">
                  Something went wrong
                </h1>
                <p className="text-text-secondary">
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                    Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-surface rounded text-xs font-mono text-text-secondary overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorId && (
                      <div className="mt-2">
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={this.handleReset}
                  className="btn btn-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleGoBack}
                  className="btn btn-secondary flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-outline flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Support Information */}
              <div className="pt-4 border-t border-surface-light">
                <p className="text-xs text-text-secondary">
                  If this problem continues, please contact support with error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for functional components to throw errors
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}

export default ErrorBoundary 