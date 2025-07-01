import React from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ImportProgressProps {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fileName: string
  broker: string
  totalTrades: number
  processedTrades: number
  errors: string[]
  warnings: string[]
  onRetry?: () => void
  onClose?: () => void
  className?: string
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  status,
  fileName,
  broker,
  totalTrades,
  processedTrades,
  errors,
  warnings,
  onRetry,
  onClose,
  className
}) => {
  const progress = totalTrades > 0 ? (processedTrades / totalTrades) * 100 : 0

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-profit" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-loss" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
      default:
        return <Clock className="w-5 h-5 text-text-secondary" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Import completed'
      case 'failed':
        return 'Import failed'
      case 'processing':
        return 'Processing...'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-profit'
      case 'failed':
        return 'text-loss'
      case 'processing':
        return 'text-yellow-400'
      default:
        return 'text-text-secondary'
    }
  }

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium text-text-primary">{fileName}</h3>
            <p className="text-sm text-text-secondary">{broker}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn('text-sm font-medium', getStatusColor())}>
            {getStatusText()}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface-light transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'processing' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Progress</span>
            <span>{processedTrades} / {totalTrades} trades</span>
          </div>
          <div className="w-full bg-surface-light rounded-full h-2">
            <div
              className="bg-profit h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'completed' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-profit">
            <CheckCircle className="w-4 h-4" />
            <span>Successfully imported {processedTrades} trades</span>
          </div>
          
          {warnings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span>{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="pl-6 space-y-1">
                {warnings.slice(0, 3).map((warning, index) => (
                  <div key={index} className="text-xs text-text-secondary">
                    {warning}
                  </div>
                ))}
                {warnings.length > 3 && (
                  <div className="text-xs text-text-secondary">
                    +{warnings.length - 3} more warnings
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {status === 'failed' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-loss">
            <XCircle className="w-4 h-4" />
            <span>Failed to import trades</span>
          </div>
          
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-text-secondary">
                {errors.length} error{errors.length !== 1 ? 's' : ''}:
              </div>
              <div className="pl-4 space-y-1">
                {errors.slice(0, 3).map((error, index) => (
                  <div key={index} className="text-xs text-loss">
                    {error}
                  </div>
                ))}
                {errors.length > 3 && (
                  <div className="text-xs text-text-secondary">
                    +{errors.length - 3} more errors
                  </div>
                )}
              </div>
            </div>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-profit text-white rounded hover:bg-profit/90 transition-colors text-sm"
            >
              Retry Import
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ImportProgress 