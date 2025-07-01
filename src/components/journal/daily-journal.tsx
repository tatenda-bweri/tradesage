import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { TradeRecord } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface DailyJournalProps {
  trades: TradeRecord[]
  onTradeClick?: (trade: TradeRecord) => void
  className?: string
}

interface DailyData {
  date: string
  trades: TradeRecord[]
  pnl: number
  cumulativePnL: number
  winRate: number
  totalTrades: number
  winningTrades: number
}

const DailyJournal: React.FC<DailyJournalProps> = ({
  trades,
  onTradeClick,
  className
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  // Group trades by day and calculate daily metrics
  const dailyData = useMemo(() => {
    const grouped = trades.reduce((acc, trade) => {
      const date = format(new Date(trade.openTime), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = {
          date,
          trades: [],
          pnl: 0,
          cumulativePnL: 0,
          winRate: 0,
          totalTrades: 0,
          winningTrades: 0
        }
      }
      acc[date].trades.push(trade)
      acc[date].pnl += trade.profit
      acc[date].totalTrades += 1
      if (trade.profit > 0) acc[date].winningTrades += 1
      return acc
    }, {} as Record<string, DailyData>)

    // Calculate cumulative P&L and win rates
    let cumulativePnL = 0
    const sortedDates = Object.keys(grouped).sort()
    
    sortedDates.forEach(date => {
      cumulativePnL += grouped[date].pnl
      grouped[date].cumulativePnL = cumulativePnL
      grouped[date].winRate = (grouped[date].winningTrades / grouped[date].totalTrades) * 100
    })

    return sortedDates.map(date => grouped[date]).reverse()
  }, [trades])

  const toggleDayExpansion = (date: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-profit'
    if (pnl < 0) return 'text-loss'
    return 'text-text-secondary'
  }

  const getPnLBackground = (pnl: number) => {
    if (pnl > 0) return 'bg-profit bg-opacity-10 border-profit'
    if (pnl < 0) return 'bg-loss bg-opacity-10 border-loss'
    return 'bg-surface-light border-surface-light'
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-text-primary">
          Daily Journal
        </h3>
        <div className="text-sm text-text-secondary">
          {trades.length} total trades
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {dailyData.map((day) => (
          <div
            key={day.date}
            className={cn(
              'card p-4 transition-all',
              getPnLBackground(day.pnl)
            )}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-text-secondary" />
                <div>
                  <div className="font-medium text-text-primary">
                    {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {day.totalTrades} trades • {day.winRate.toFixed(1)}% win rate
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={cn('text-lg font-bold', getPnLColor(day.pnl))}>
                    {day.pnl > 0 ? '+' : ''}{day.pnl.toFixed(2)}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Daily P&L
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn('text-lg font-bold', getPnLColor(day.cumulativePnL))}>
                    {day.cumulativePnL > 0 ? '+' : ''}{day.cumulativePnL.toFixed(2)}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Cumulative
                  </div>
                </div>
                <button
                  onClick={() => toggleDayExpansion(day.date)}
                  className="p-1 rounded hover:bg-surface transition-colors"
                >
                  {expandedDays.has(day.date) ? (
                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            {/* Daily Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-sm font-medium text-text-primary">
                  {day.totalTrades}
                </div>
                <div className="text-xs text-text-secondary">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-profit">
                  {day.winningTrades}
                </div>
                <div className="text-xs text-text-secondary">Winning</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-loss">
                  {day.totalTrades - day.winningTrades}
                </div>
                <div className="text-xs text-text-secondary">Losing</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-text-primary">
                  {day.winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-text-secondary">Win Rate</div>
              </div>
            </div>

            {/* Expanded Trade Details */}
            {expandedDays.has(day.date) && (
              <div className="border-t border-surface-light pt-3 mt-3">
                <div className="space-y-2">
                  {day.trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between p-2 bg-surface rounded cursor-pointer hover:bg-surface-light transition-colors"
                      onClick={() => onTradeClick?.(trade)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          trade.profit > 0 ? 'bg-profit' : 'bg-loss'
                        )} />
                        <div>
                          <div className="font-medium text-text-primary">
                            {trade.symbol}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {format(new Date(trade.openTime), 'HH:mm')} - {trade.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn('font-medium', getPnLColor(trade.profit))}>
                          {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {trade.volume} lots
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {dailyData.length > 0 && (
        <div className="card p-4 bg-surface-light">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">
                {dailyData.length}
              </div>
              <div className="text-sm text-text-secondary">Trading Days</div>
            </div>
            <div className="text-center">
              <div className={cn(
                'text-lg font-bold',
                getPnLColor(dailyData[0]?.cumulativePnL || 0)
              )}>
                {dailyData[0]?.cumulativePnL > 0 ? '+' : ''}{dailyData[0]?.cumulativePnL.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-text-secondary">Total P&L</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">
                {(trades.filter(t => t.profit > 0).length / trades.length * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-text-secondary">Overall Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">
                {(trades.length / dailyData.length).toFixed(1)}
              </div>
              <div className="text-sm text-text-secondary">Avg Trades/Day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyJournal 