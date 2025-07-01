import React from 'react'
import { Target } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ProfitFactorCardProps {
  profitFactor: number
  className?: string
}

const ProfitFactorCard: React.FC<ProfitFactorCardProps> = ({
  profitFactor,
  className
}) => {
  // Calculate gauge percentage (0-100)
  const gaugePercentage = Math.min(Math.max(profitFactor * 20, 0), 100)
  
  // Determine color based on profit factor
  const getGaugeColor = (pf: number) => {
    if (pf >= 2.0) return 'text-profit' // Excellent
    if (pf >= 1.5) return 'text-yellow-400' // Good
    if (pf >= 1.0) return 'text-orange-400' // Acceptable
    return 'text-loss' // Poor
  }

  const getGaugeBgColor = (pf: number) => {
    if (pf >= 2.0) return 'bg-profit' // Excellent
    if (pf >= 1.5) return 'bg-yellow-400' // Good
    if (pf >= 1.0) return 'bg-orange-400' // Acceptable
    return 'bg-loss' // Poor
  }

  const getStatusText = (pf: number) => {
    if (pf >= 2.0) return 'Excellent'
    if (pf >= 1.5) return 'Good'
    if (pf >= 1.0) return 'Acceptable'
    return 'Poor'
  }

  return (
    <div className={cn('card card-hover p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Profit Factor
        </h3>
        <div className="p-2 rounded-full bg-surface-light">
          <Target className="w-5 h-5 text-text-secondary" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <span className={cn('text-3xl font-bold', getGaugeColor(profitFactor))}>
            {profitFactor.toFixed(2)}
          </span>
        </div>
        
        {/* Visual Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Risk/Reward Ratio</span>
            <span className={cn('font-medium', getGaugeColor(profitFactor))}>
              {getStatusText(profitFactor)}
            </span>
          </div>
          
          <div className="relative h-3 bg-surface-light rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', getGaugeBgColor(profitFactor))}
              style={{ width: `${gaugePercentage}%` }}
            />
            {/* Gauge markers */}
            <div className="absolute inset-0 flex justify-between px-1">
              <div className="w-px h-full bg-surface-dark" />
              <div className="w-px h-full bg-surface-dark" />
              <div className="w-px h-full bg-surface-dark" />
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-text-secondary">
            <span>0.5</span>
            <span>1.0</span>
            <span>1.5</span>
            <span>2.0+</span>
          </div>
        </div>
        
        <p className="text-sm text-text-secondary">
          Gross Profit / Gross Loss
        </p>
      </div>
    </div>
  )
}

export default ProfitFactorCard 