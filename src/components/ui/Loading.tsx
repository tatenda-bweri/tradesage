import React, { type ReactNode } from 'react'
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-profit', sizeClasses[size])} />
      <span className="text-text-secondary">{text}</span>
    </div>
  )
}

export default Loading

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <XCircle className="w-12 h-12 text-loss" />
          <h2 className="text-xl font-semibold text-text-primary">
            Something went wrong
          </h2>
          <p className="text-text-secondary text-center max-w-md">
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-profit text-white rounded hover:bg-profit/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  className?: string
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  title,
  message,
  className
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: AlertCircle
  }

  const colors = {
    success: 'text-profit',
    error: 'text-loss',
    warning: 'text-yellow-400',
    info: 'text-text-secondary'
  }

  const backgrounds = {
    success: 'bg-profit bg-opacity-10 border-profit',
    error: 'bg-loss bg-opacity-10 border-loss',
    warning: 'bg-yellow-400 bg-opacity-10 border-yellow-400',
    info: 'bg-surface-light border-surface-light'
  }

  const Icon = icons[type]

  return (
    <div className={cn(
      'flex items-start space-x-3 p-4 rounded-lg border',
      backgrounds[type],
      className
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colors[type])} />
      <div className="flex-1">
        <h3 className={cn('font-medium', colors[type])}>{title}</h3>
        {message && (
          <p className="text-sm text-text-secondary mt-1">{message}</p>
        )}
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-light rounded animate-pulse"
          style={{
            width: i === lines - 1 ? '75%' : '100%'
          }}
        />
      ))}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...'
}) => {
  if (!isLoading) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75">
        <Loading text={text} />
      </div>
    </div>
  )
} 