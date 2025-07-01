import React from 'react'
import { TrendingUp, TrendingDown, Target, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Metric {
  id: string
  label: string
  value: number | string
  unit?: string
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ComponentType<{ className?: string }>
  color?: string
}

interface AdditionalMetricsCardProps {
  title?: string
  metrics: Metric[]
  layout?: 'grid' | 'list'
  className?: string
}

const AdditionalMetricsCard: React.FC<AdditionalMetricsCardProps> = ({
  title = 'Additional Metrics',
  metrics,
  layout = 'grid',
  className
}) => {
  const getChangeColor = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return 'text-profit'
      case 'negative':
        return 'text-loss'
      default:
        return 'text-text-secondary'
    }
  }

  const getChangeIcon = (changeType?: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-3 h-3" />
      case 'negative':
        return <TrendingDown className="w-3 h-3" />
      default:
        return null
    }
  }

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number') {
      const formatted = value.toLocaleString()
      return unit ? `${formatted} ${unit}` : formatted
    }
    return unit ? `${value} ${unit}` : value
  }

  return (
    <div className={cn('card p-6', className)}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      
      <div className={cn(
        layout === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'space-y-4'
      )}>
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center space-x-3">
            {metric.icon && (
              <div className={cn(
                'p-2 rounded-full',
                metric.color ? metric.color : 'bg-surface-light'
              )}>
                <metric.icon className="w-4 h-4 text-text-secondary" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-secondary truncate">
                {metric.label}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-lg font-semibold text-text-primary">
                  {formatValue(metric.value, metric.unit)}
                </div>
                {metric.change !== undefined && (
                  <div className={cn(
                    'flex items-center space-x-1 text-xs',
                    getChangeColor(metric.changeType)
                  )}>
                    {getChangeIcon(metric.changeType)}
                    <span>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdditionalMetricsCard 