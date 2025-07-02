import React, { useState, useMemo } from 'react'
import Head from 'next/head'
import MainLayout from '@/components/layout/main-layout'
import { TradeTable } from '@/components/tables'
import { TradeFilters, TradeForm, TradeDetails } from '@/components/trades'
import { useTrades } from '@/hooks/useTrades'
import { Button, Loading } from '@/components/ui'
import { DateRange } from '@/types/dateRange'
import { dateRangeToQueryParams } from '@/lib/utils/dateRangeUtils'
import { TradeRecord } from '@/lib/types'
import { Plus } from 'lucide-react'

const TradesPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [selectedSymbol, setSelectedSymbol] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  
  // State for managing trade form and details modals
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false)
  const [isTradeDetailsOpen, setIsTradeDetailsOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<TradeRecord | null>(null)

  // Convert filters to query parameters
  const filters = useMemo(() => {
    const params = dateRangeToQueryParams(dateRange)
    if (selectedSymbol !== 'all') {
      params.symbol = selectedSymbol
    }
    if (selectedType !== 'all') {
      params.type = selectedType
    }
    return params
  }, [dateRange, selectedSymbol, selectedType])

  const { trades, loading, error, total, page, pageSize, setPage, setPageSize } = useTrades({
    page: 1,
    pageSize: 50,
    filters
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
            <TradeFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">All Trades</h2>
              <div className="text-sm text-text-secondary">
                {total} total trades
              </div>
            </div>
            
            <div className="flex justify-end mb-4">
              <Button
                className="bg-profit text-white"
                onClick={() => {
                  setSelectedTrade(null)
                  setIsTradeFormOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Trade
              </Button>
            </div>
            
            <TradeTable 
              trades={trades}
              onEdit={(trade) => {
                setSelectedTrade(trade)
                setIsTradeFormOpen(true)
              }}
              onDelete={(id) => {
                // Implement delete confirmation logic
                if (window.confirm('Are you sure you want to delete this trade?')) {
                  // TODO: Implement actual deletion
                  console.log('Deleting trade', id)
                }
              }}
              onDuplicate={(trade) => {
                const duplicateTrade = {
                  ...trade,
                  id: `temp_${Date.now()}`, // Temporary ID that will be replaced when saved
                  ticketId: `${trade.ticketId}_copy`,
                }
                setSelectedTrade(duplicateTrade)
                setIsTradeFormOpen(true)
              }}
            />
            
            {/* Trade Form Modal */}
            {isTradeFormOpen && (
              <TradeForm
                isOpen={isTradeFormOpen}
                onClose={() => setIsTradeFormOpen(false)}
                onSave={(trade) => {
                  // TODO: Implement save functionality
                  console.log('Saving trade', trade)
                  setIsTradeFormOpen(false)
                }}
                trade={selectedTrade || undefined}
                symbols={Array.from(new Set(trades.map(t => t.symbol)))}
              />
            )}
            
            {/* Trade Details Modal */}
            {isTradeDetailsOpen && selectedTrade && (
              <TradeDetails
                isOpen={isTradeDetailsOpen}
                onClose={() => setIsTradeDetailsOpen(false)}
                onEdit={(trade) => {
                  setIsTradeDetailsOpen(false)
                  setSelectedTrade(trade)
                  setIsTradeFormOpen(true)
                }}
                onDelete={(id) => {
                  setIsTradeDetailsOpen(false)
                  // Implement delete confirmation logic
                  if (window.confirm('Are you sure you want to delete this trade?')) {
                    // TODO: Implement actual deletion
                    console.log('Deleting trade', id)
                  }
                }}
                trade={selectedTrade}
              />
            )}
            
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
