import React, { useState, useMemo } from 'react'
import NetPnLCard from './net-pnl-card'
import ProfitFactorCard from './profit-factor-card'
import WinRateCard from './win-rate-card'
import PnLChart from '@/components/charts/pnl-chart'
import { cn } from '@/lib/utils/cn'
import { type Currency } from '../../lib/utils/formatters'

interface DashboardMetrics {
  netPnL: number
  previousPeriodPnL?: number
  profitFactor: number
  winRate: number
  totalTrades: number
  winningTrades: number
  currency?: string
}

interface PnLDataPoint {
  date: string
  cumulativePnL: number
  dailyPnL: number
}

interface TradingDashboardProps {
  metrics: DashboardMetrics
  pnlData: PnLDataPoint[]
  className?: string
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({
  metrics,
  pnlData,
  className
}) => {
  const [timeFrame, setTimeFrame] = useState<'1w' | '1m' | '3m' | 'ytd' | 'all'>('1m')

  // Filter data based on time frame
  const filteredPnLData = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (timeFrame) {
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
      default:
        return pnlData
    }

    return pnlData.filter(point => new Date(point.date) >= startDate)
  }, [pnlData, timeFrame])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          Trading Dashboard
        </h1>
        <div className="text-sm text-text-secondary">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="dashboard-grid">
        <NetPnLCard
          netPnL={metrics.netPnL}
          previousPeriodPnL={metrics.previousPeriodPnL}
          currency={metrics.currency as Currency}
        />
        <ProfitFactorCard profitFactor={metrics.profitFactor} />
        <WinRateCard
          winRate={metrics.winRate}
          totalTrades={metrics.totalTrades}
          winningTrades={metrics.winningTrades}
        />
        <div className="card card-hover card-padding">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">
              Total Trades
            </h3>
            <div className="p-2 rounded-full bg-surface-light">
              <span className="text-text-secondary text-lg">📊</span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-2xl sm:text-3xl font-bold text-text-primary">
              {metrics.totalTrades}
            </span>
            <p className="text-sm text-text-secondary">
              All Time
            </p>
          </div>
        </div>
      </div>

      {/* P&L Chart */}
      <div className="chart-container">
        <PnLChart
          data={filteredPnLData}
          timeFrame={timeFrame}
          onTimeFrameChange={setTimeFrame}
        />
      </div>

      {/* Performance Summary */}
      <div className="mobile-grid gap-4 sm:gap-6">
        <div className="card card-padding">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Average Win
          </h4>
          <p className="text-lg sm:text-xl font-semibold text-profit">
            +${(metrics.netPnL * metrics.winRate / metrics.winningTrades || 0).toFixed(2)}
          </p>
        </div>
        <div className="card card-padding">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Average Loss
          </h4>
          <p className="text-lg sm:text-xl font-semibold text-loss">
            -${(Math.abs(metrics.netPnL * (1 - metrics.winRate) / (metrics.totalTrades - metrics.winningTrades)) || 0).toFixed(2)}
          </p>
        </div>
        <div className="card card-padding">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            Risk/Reward Ratio
          </h4>
          <p className="text-lg sm:text-xl font-semibold text-text-primary">
            {((metrics.netPnL * metrics.winRate / metrics.winningTrades) / 
              (Math.abs(metrics.netPnL * (1 - metrics.winRate) / (metrics.totalTrades - metrics.winningTrades))) || 0).toFixed(2)}:1
          </p>
        </div>
      </div>
    </div>
  )
}

export default TradingDashboard 