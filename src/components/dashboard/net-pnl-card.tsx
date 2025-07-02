import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPnL, formatPercentage, Currency } from '@/lib/utils/formatters'

interface NetPnLCardProps {
  netPnL: number
  previousPeriodPnL?: number
  currency?: Currency
  className?: string
}

const NetPnLCard: React.FC<NetPnLCardProps> = ({
  netPnL,
  previousPeriodPnL,
  currency = 'USD',
  className
}) => {
  const pnlData = formatPnL(netPnL, { currency })
  
  const percentageChange = previousPeriodPnL 
    ? ((netPnL - previousPeriodPnL) / Math.abs(previousPeriodPnL)) * 100
    : null

  return (
    <div className={cn('card card-hover p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Net P&L
        </h3>
        <div className={cn(
          'p-2 rounded-full',
          pnlData.isPositive ? 'bg-profit bg-opacity-10' : 'bg-loss bg-opacity-10'
        )}>
          {pnlData.isPositive ? (
            <TrendingUp className="w-5 h-5 text-profit" />
          ) : (
            <TrendingDown className="w-5 h-5 text-loss" />
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className={cn('text-3xl font-bold', pnlData.colorClass)}>
            {pnlData.formatted}
          </span>
        </div>
        
        {percentageChange !== null && (
          <div className="flex items-center space-x-1">
            <span className={cn(
              'text-sm font-medium',
              percentageChange >= 0 ? 'text-profit' : 'text-loss'
            )}>
              {percentageChange >= 0 ? '+' : ''}{formatPercentage(percentageChange)}
            </span>
            <span className="text-sm text-text-secondary">
              vs previous period
            </span>
          </div>
        )}
        
        <p className="text-sm text-text-secondary">
          Total Profit/Loss
        </p>
      </div>
    </div>
  )
}

export default NetPnLCard 