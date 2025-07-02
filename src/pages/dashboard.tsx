import React from 'react'
import Head from 'next/head'
import TradingDashboard from '@/components/dashboard/trading-dashboard'
import MainLayout from '@/components/layout/main-layout'
import { NotebookTabs } from '@/components/notebook'

// Sample data for demonstration
const sampleMetrics = {
  netPnL: 1250.75,
  previousPeriodPnL: 980.50,
  profitFactor: 1.85,
  winRate: 0.62,
  totalTrades: 156,
  winningTrades: 97,
  currency: 'USD'
}

const samplePnLData = [
  { date: '2024-01-01', cumulativePnL: 0, dailyPnL: 0 },
  { date: '2024-01-02', cumulativePnL: 125.50, dailyPnL: 125.50 },
  { date: '2024-01-03', cumulativePnL: 89.25, dailyPnL: -36.25 },
  { date: '2024-01-04', cumulativePnL: 234.75, dailyPnL: 145.50 },
  { date: '2024-01-05', cumulativePnL: 198.00, dailyPnL: -36.75 },
  { date: '2024-01-06', cumulativePnL: 312.25, dailyPnL: 114.25 },
  { date: '2024-01-07', cumulativePnL: 287.50, dailyPnL: -24.75 },
  { date: '2024-01-08', cumulativePnL: 456.75, dailyPnL: 169.25 },
  { date: '2024-01-09', cumulativePnL: 398.00, dailyPnL: -58.75 },
  { date: '2024-01-10', cumulativePnL: 567.25, dailyPnL: 169.25 },
  { date: '2024-01-11', cumulativePnL: 634.50, dailyPnL: 67.25 },
  { date: '2024-01-12', cumulativePnL: 589.75, dailyPnL: -44.75 },
  { date: '2024-01-13', cumulativePnL: 723.00, dailyPnL: 133.25 },
  { date: '2024-01-14', cumulativePnL: 678.25, dailyPnL: -44.75 },
  { date: '2024-01-15', cumulativePnL: 856.50, dailyPnL: 178.25 },
  { date: '2024-01-16', cumulativePnL: 789.75, dailyPnL: -66.75 },
  { date: '2024-01-17', cumulativePnL: 945.00, dailyPnL: 155.25 },
  { date: '2024-01-18', cumulativePnL: 1012.25, dailyPnL: 67.25 },
  { date: '2024-01-19', cumulativePnL: 967.50, dailyPnL: -44.75 },
  { date: '2024-01-20', cumulativePnL: 1123.75, dailyPnL: 156.25 },
  { date: '2024-01-21', cumulativePnL: 1250.75, dailyPnL: 127.00 }
]

export default function Dashboard() {
  return (
    <MainLayout>
      <Head>
        <title>Trading Dashboard - TradeSage</title>
        <meta name="description" content="Trading performance dashboard with real-time metrics" />
      </Head>
      
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Trading Dashboard
              </h1>
              <NotebookTabs className="mb-6" />
            </div>
            <TradingDashboard
              metrics={sampleMetrics}
              pnlData={samplePnLData}
            />
          </div>
        </div>
      </main>
    </MainLayout>
  )
} 