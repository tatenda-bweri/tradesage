import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { TradeRecord } from '@/lib/types'

interface TradesState {
  trades: TradeRecord[]
  isLoading: boolean
  error: string | null
  filters: {
    symbol: string
    broker: string
    dateFrom: string
    dateTo: string
    status: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
  
  // Actions
  setTrades: (trades: TradeRecord[]) => void
  addTrade: (trade: TradeRecord) => void
  updateTrade: (id: string, updates: Partial<TradeRecord>) => void
  deleteTrade: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<TradesState['filters']>) => void
  setPagination: (pagination: Partial<TradesState['pagination']>) => void
  resetFilters: () => void
  
  // Computed values
  getFilteredTrades: () => TradeRecord[]
  getTotalPnL: () => number
  getWinRate: () => number
  getAverageWin: () => number
  getAverageLoss: () => number
}

const initialFilters = {
  symbol: '',
  broker: '',
  dateFrom: '',
  dateTo: '',
  status: ''
}

export const useTradesStore = create<TradesState>()(
  devtools(
    (set, get) => ({
      trades: [],
      isLoading: false,
      error: null,
      filters: initialFilters,
      pagination: {
        page: 1,
        limit: 50,
        total: 0
      },
      
      setTrades: (trades) => set({ trades, error: null }),
      
      addTrade: (trade) => set((state) => ({
        trades: [trade, ...state.trades]
      })),
      
      updateTrade: (id, updates) => set((state) => ({
        trades: state.trades.map((trade) =>
          trade.id === id ? { ...trade, ...updates } : trade
        )
      })),
      
      deleteTrade: (id) => set((state) => ({
        trades: state.trades.filter((trade) => trade.id !== id)
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
        pagination: { ...state.pagination, page: 1 } // Reset to first page
      })),
      
      setPagination: (newPagination) => set((state) => ({
        pagination: { ...state.pagination, ...newPagination }
      })),
      
      resetFilters: () => set({
        filters: initialFilters,
        pagination: { page: 1, limit: 50, total: 0 }
      }),
      
      getFilteredTrades: () => {
        const { trades, filters } = get()
        return trades.filter((trade) => {
          if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
            return false
          }
          if (filters.broker && trade.broker !== filters.broker) {
            return false
          }
          if (filters.dateFrom && new Date(trade.openTime) < new Date(filters.dateFrom)) {
            return false
          }
          if (filters.dateTo && new Date(trade.openTime) > new Date(filters.dateTo)) {
            return false
          }
          if (filters.status) {
            const isWin = trade.profit > 0
            if (filters.status === 'win' && !isWin) return false
            if (filters.status === 'loss' && isWin) return false
          }
          return true
        })
      },
      
      getTotalPnL: () => {
        const filteredTrades = get().getFilteredTrades()
        return filteredTrades.reduce((sum, trade) => sum + trade.profit, 0)
      },
      
      getWinRate: () => {
        const filteredTrades = get().getFilteredTrades()
        if (filteredTrades.length === 0) return 0
        const wins = filteredTrades.filter((trade) => trade.profit > 0).length
        return (wins / filteredTrades.length) * 100
      },
      
      getAverageWin: () => {
        const filteredTrades = get().getFilteredTrades()
        const wins = filteredTrades.filter((trade) => trade.profit > 0)
        if (wins.length === 0) return 0
        return wins.reduce((sum, trade) => sum + trade.profit, 0) / wins.length
      },
      
      getAverageLoss: () => {
        const filteredTrades = get().getFilteredTrades()
        const losses = filteredTrades.filter((trade) => trade.profit < 0)
        if (losses.length === 0) return 0
        return losses.reduce((sum, trade) => sum + trade.profit, 0) / losses.length
      }
    }),
    { name: 'TradesStore' }
  )
)
