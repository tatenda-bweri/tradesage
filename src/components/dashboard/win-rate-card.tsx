import React from 'react'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatWinRate } from '@/lib/utils/formatters'

interface WinRateCardProps {
  winRate: number // Percentage as decimal (0-1)
  totalTrades: number
  winningTrades: number
  className?: string
}

const WinRateCard: React.FC<WinRateCardProps> = ({
  winRate,
  totalTrades,
  winningTrades,
  className
}) => {
  const formattedWinRate = formatWinRate(winningTrades, totalTrades)
  const winRatePercentage = winRate * 100
  
  // Determine color based on win rate
  const getWinRateColor = (rate: number) => {
    if (rate >= 0.6) return 'text-profit' // 60%+
    if (rate >= 0.5) return 'text-yellow-400' // 50-59%
    if (rate >= 0.4) return 'text-orange-400' // 40-49%
    return 'text-loss' // Below 40%
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 0.6) return 'bg-profit' // 60%+
    if (rate >= 0.5) return 'bg-yellow-400' // 50-59%
    if (rate >= 0.4) return 'bg-orange-400' // 40-49%
    return 'bg-loss' // Below 40%
  }

  const getStatusText = (rate: number) => {
    if (rate >= 0.6) return 'Excellent'
    if (rate >= 0.5) return 'Good'
    if (rate >= 0.4) return 'Acceptable'
    return 'Needs Improvement'
  }

  return (
    <div className={cn('card card-hover p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Win Rate
        </h3>
        <div className="p-2 rounded-full bg-surface-light">
          <Trophy className="w-5 h-5 text-text-secondary" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <span className={cn('text-3xl font-bold', getWinRateColor(winRate))}>
            {formattedWinRate}
          </span>
        </div>
        
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Successful Trades</span>
            <span className={cn('font-medium', getWinRateColor(winRate))}>
              {getStatusText(winRate)}
            </span>
          </div>
          
          <div className="relative h-3 bg-surface-light rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', getProgressColor(winRate))}
              style={{ width: `${winRatePercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{winningTrades} wins</span>
            <span>{totalTrades} total</span>
          </div>
        </div>
        
        <p className="text-sm text-text-secondary">
          Winning Trades / Total Trades
        </p>
      </div>
    </div>
  )
}

export default WinRateCard 