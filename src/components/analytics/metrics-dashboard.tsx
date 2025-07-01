import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3, PieChart } from 'lucide-react'
import { TradeRecord } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface MetricsDashboardProps {
  trades: TradeRecord[]
  className?: string
}

interface Metrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  largestWin: number
  largestLoss: number
  averageTrade: number
  expectancy: number
  riskRewardRatio: number
}

interface MetricCardProps {
  title: string
  value: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  isCurrency?: boolean
  isPercentage?: boolean
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ trades, className }) => {
  const metrics = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        largestWin: 0,
        largestLoss: 0,
        averageTrade: 0,
        expectancy: 0,
        riskRewardRatio: 0
      }
    }

    const winningTrades = trades.filter(t => t.profit > 0)
    const losingTrades = trades.filter(t => t.profit < 0)
    const totalPnL = trades.reduce((sum, t) => sum + t.profit, 0)
    const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0))

    // Calculate drawdown
    let peak = 0
    let drawdown = 0
    let maxDrawdown = 0
    let runningPnL = 0

    trades.forEach(trade => {
      runningPnL += trade.profit
      if (runningPnL > peak) {
        peak = runningPnL
      }
      drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      totalPnL,
      averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
      maxDrawdown,
      sharpeRatio: calculateSharpeRatio(trades),
      largestWin: Math.max(...trades.map(t => t.profit)),
      largestLoss: Math.min(...trades.map(t => t.profit)),
      averageTrade: totalPnL / trades.length,
      expectancy: ((winningTrades.length / trades.length) * (totalWins / winningTrades.length)) - 
                 ((losingTrades.length / trades.length) * (totalLosses / losingTrades.length)),
      riskRewardRatio: losingTrades.length > 0 ? (totalWins / winningTrades.length) / (totalLosses / losingTrades.length) : 0
    }
  }, [trades])

  const calculateSharpeRatio = (trades: TradeRecord[]) => {
    if (trades.length < 2) return 0
    
    const returns = trades.map(t => t.profit)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    const stdDev = Math.sqrt(variance)
    
    return stdDev > 0 ? meanReturn / stdDev : 0
  }

  const getMetricColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? 'text-profit' : value < 0 ? 'text-loss' : 'text-text-secondary'
    }
    return value > 0 ? 'text-loss' : value < 0 ? 'text-profit' : 'text-text-secondary'
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'totalPnL':
      case 'averageWin':
      case 'largestWin':
        return TrendingUp
      case 'largestLoss':
      case 'maxDrawdown':
        return TrendingDown
      case 'winRate':
      case 'profitFactor':
        return Target
      case 'sharpeRatio':
        return BarChart3
      default:
        return BarChart3
    }
  }

  const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, isCurrency = false, isPercentage = false }) => (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-text-secondary" />
          <h4 className="font-medium text-text-primary">{title}</h4>
        </div>
      </div>
      <div className={cn(
        'text-2xl font-bold mb-1',
        getMetricColor(value, title !== 'Max Drawdown')
      )}>
        {isCurrency && value > 0 ? '+' : ''}
        {isCurrency ? value.toFixed(2) : isPercentage ? value.toFixed(1) + '%' : value.toFixed(2)}
      </div>
      {subtitle && (
        <div className="text-sm text-text-secondary">{subtitle}</div>
      )}
    </div>
  )

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-xl font-semibold text-text-primary">
        Performance Metrics
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total P&L"
          value={metrics.totalPnL}
          subtitle={`${metrics.totalTrades} trades`}
          icon={TrendingUp}
          isCurrency={true}
        />
        <MetricCard
          title="Win Rate"
          value={metrics.winRate}
          subtitle={`${metrics.winningTrades}/${metrics.totalTrades} wins`}
          icon={Target}
          isPercentage={true}
        />
        <MetricCard
          title="Profit Factor"
          value={metrics.profitFactor}
          subtitle="Risk-adjusted return"
          icon={BarChart3}
        />
        <MetricCard
          title="Max Drawdown"
          value={metrics.maxDrawdown}
          subtitle="Largest peak to trough"
          icon={AlertTriangle}
          isCurrency={true}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Average Win"
          value={metrics.averageWin}
          subtitle="Per winning trade"
          icon={TrendingUp}
          isCurrency={true}
        />
        <MetricCard
          title="Average Loss"
          value={metrics.averageLoss}
          subtitle="Per losing trade"
          icon={TrendingDown}
          isCurrency={true}
        />
        <MetricCard
          title="Risk/Reward Ratio"
          value={metrics.riskRewardRatio}
          subtitle="Win size vs loss size"
          icon={Target}
        />
        <MetricCard
          title="Largest Win"
          value={metrics.largestWin}
          subtitle="Best single trade"
          icon={TrendingUp}
          isCurrency={true}
        />
        <MetricCard
          title="Largest Loss"
          value={metrics.largestLoss}
          subtitle="Worst single trade"
          icon={TrendingDown}
          isCurrency={true}
        />
        <MetricCard
          title="Sharpe Ratio"
          value={metrics.sharpeRatio}
          subtitle="Risk-adjusted returns"
          icon={BarChart3}
        />
      </div>

      {/* Trade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Trade Distribution</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Winning Trades</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-surface-light rounded-full h-2">
                  <div 
                    className="bg-profit h-2 rounded-full" 
                    style={{ width: `${metrics.winRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {metrics.winningTrades}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Losing Trades</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-surface-light rounded-full h-2">
                  <div 
                    className="bg-loss h-2 rounded-full" 
                    style={{ width: `${100 - metrics.winRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {metrics.losingTrades}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Performance Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Expectancy</span>
              <span className={cn('font-medium', getMetricColor(metrics.expectancy))}>
                {metrics.expectancy.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Average Trade</span>
              <span className={cn('font-medium', getMetricColor(metrics.averageTrade))}>
                {metrics.averageTrade.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Return</span>
              <span className={cn('font-medium', getMetricColor(metrics.totalPnL))}>
                {metrics.totalPnL > 0 ? '+' : ''}{metrics.totalPnL.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricsDashboard 