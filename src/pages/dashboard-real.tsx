/* eslint-disable */
import React, { useState } from 'react'
import Head from 'next/head'
import { TradingDashboard } from '@/components/dashboard'
import { RadarChart } from '@/components/charts'
import { CalendarView } from '@/components/calendar'
import { TradeTable } from '@/components/tables'
import { MetricsDashboard } from '@/components/analytics'
import { useTrades } from '@/hooks/useTrades'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Loading, ErrorBoundary } from '@/components/ui'

const DashboardRealPage = () => {
  const [selectedAccountId] = useState('demo-account') // In a real app, this would come from auth
  
  const { trades, loading: tradesLoading, error: tradesError, total, page, pageSize, setPage, setPageSize } = useTrades({
    accountId: selectedAccountId,
    page: 1,
    pageSize: 20
  })
  
  const { metrics, temporalAnalysis, loading: analyticsLoading, error: analyticsError } = useAnalytics({
    accountId: selectedAccountId
  })

  // Transform data for dashboard components
  const dashboardMetrics = metrics ? {
    netPnL: metrics.totalPnL,
    profitFactor: metrics.profitFactor,
    winRate: metrics.winRate,
    totalTrades: metrics.totalTrades,
    winningTrades: metrics.winningTrades,
    currency: 'USD'
  } : {
    netPnL: 0,
    profitFactor: 0,
    winRate: 0,
    totalTrades: 0,
    winningTrades: 0,
    currency: 'USD'
  }

  // Generate P&L data from trades
  const pnlData = trades.map((trade, index) => {
    const cumulativePnL = trades
      .slice(0, index + 1)
      .reduce((sum, t) => sum + t.profit, 0)
    
    return {
      date: new Date(trade.openTime).toISOString().split('T')[0],
      cumulativePnL,
      dailyPnL: trade.profit
    }
  })

  // Calculate performance score from metrics
  const performanceScore = metrics ? {
    planAdherence: Math.min(100, Math.max(0, (metrics.winRate / 100) * 100)),
    psychology: Math.min(100, Math.max(0, (1 - metrics.maxDrawdown / Math.abs(metrics.totalPnL || 1)) * 100)),
    entryQuality: Math.min(100, Math.max(0, (metrics.profitFactor / 2) * 100)),
    exitManagement: Math.min(100, Math.max(0, (metrics.riskRewardRatio / 2) * 100)),
    overall: Math.min(100, Math.max(0, 
      ((metrics.winRate / 100) * 25 + 
       (1 - metrics.maxDrawdown / Math.abs(metrics.totalPnL || 1)) * 25 +
       (metrics.profitFactor / 2) * 25 +
       (metrics.riskRewardRatio / 2) * 25))
    )
  } : {
    planAdherence: 0,
    psychology: 0,
    entryQuality: 0,
    exitManagement: 0,
    overall: 0
  }

  if (tradesLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="lg" text="Loading dashboard data..." />
      </div>
    )
  }

  if (tradesError || analyticsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-loss mb-4">Error Loading Dashboard</h2>
          <p className="text-text-secondary mb-4">
            {tradesError || analyticsError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-profit text-white rounded hover:bg-profit/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>TradeSage Dashboard - Real Data</title>
        <meta name="description" content="Trading dashboard with real data from your trades" />
      </Head>

      <ErrorBoundary>
        <div className="min-h-screen bg-background text-text-primary">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Trading Dashboard
              </h1>
              <p className="text-text-secondary">
                Real-time performance metrics from your trading data
              </p>
            </div>

            {/* Main Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <TradingDashboard 
                  metrics={dashboardMetrics}
                  pnlData={pnlData}
                />
              </div>
              
              <div>
                <RadarChart score={performanceScore} />
              </div>
            </div>

            {/* Analytics */}
            <div className="mb-8">
              <MetricsDashboard trades={trades} />
            </div>

            {/* Trades Table */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Recent Trades</h2>
                <div className="text-sm text-text-secondary">
                  {total} total trades
                </div>
              </div>
              <TradeTable 
                trades={trades}
                onEdit={(trade) => console.log('Edit trade:', trade)}
                onDelete={(id) => console.log('Delete trade:', id)}
                onDuplicate={(trade) => console.log('Duplicate trade:', trade)}
              />
              
              {/* Pagination */}
              {total > pageSize && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-text-secondary">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} trades
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1 bg-surface border border-surface-light rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-light"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-text-secondary">
                      Page {page} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="px-3 py-1 bg-surface border border-surface-light rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-light"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </>
  )
}

export default DashboardRealPage 