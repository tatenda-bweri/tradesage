import React from 'react'
import Head from 'next/head'
import MainLayout from '@/components/layout/main-layout'
import { TradeTable } from '@/components/tables'
import { useTrades } from '@/hooks/useTrades'
import { Loading } from '@/components/ui'

const TradesPage = () => {
  const { trades, loading, error, total, page, pageSize, setPage, setPageSize } = useTrades({
    page: 1,
    pageSize: 50
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loading size="lg" text="Loading trades..." />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-loss mb-4">Error Loading Trades</h2>
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
        <title>Trades - TradeSage</title>
        <meta name="description" content="Manage and analyze your trading history" />
      </Head>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Trade History</h1>
            <p className="text-text-secondary">
              Manage and analyze your trading history
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">All Trades</h2>
              <div className="text-sm text-text-secondary">
                {total} total trades
              </div>
            </div>
            
            <TradeTable 
              trades={trades}
              onEdit={(_trade) => {
                // TODO: Implement edit functionality
              }}
              onDelete={(_id) => {
                // TODO: Implement delete functionality
              }}
              onDuplicate={(_trade) => {
                // TODO: Implement duplicate functionality
              }}
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
    </MainLayout>
  )
}

export default TradesPage
