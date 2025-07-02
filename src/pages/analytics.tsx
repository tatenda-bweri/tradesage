import React from 'react'
import Head from 'next/head'
import MainLayout from '@/components/layout/main-layout'
import { MetricsDashboard } from '@/components/analytics'
import { useTrades } from '@/hooks/useTrades'
import { Loading } from '@/components/ui'

const AnalyticsPage = () => {
  const { trades, loading, error } = useTrades()

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loading size="lg" text="Loading analytics..." />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-loss mb-4">Error Loading Analytics</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-profit text-white rounded hover:bg-profit/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Head>
        <title>Analytics - TradeSage</title>
        <meta name="description" content="Detailed trading performance analytics" />
      </Head>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
            <p className="text-text-secondary">
              Detailed insights into your trading performance and patterns
            </p>
          </div>

          <div className="mb-8">
            <MetricsDashboard trades={trades} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default AnalyticsPage
