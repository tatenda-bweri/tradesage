import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PerformanceMetrics {
  totalTrades: number
  winRate: number
  totalPnL: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  bestTrade: number
  worstTrade: number
  avgHoldTime: number
  dailyStats: Array<{
    date: string
    pnl: number
    trades: number
    winRate: number
  }>
  monthlyStats: Array<{
    month: string
    pnl: number
    trades: number
    winRate: number
  }>
  symbolStats: Array<{
    symbol: string
    trades: number
    pnl: number
    winRate: number
  }>
}

interface AnalyticsState {
  metrics: PerformanceMetrics | null
  isLoading: boolean
  error: string | null
  dateRange: {
    from: string
    to: string
  }
  
  // Actions
  setMetrics: (metrics: PerformanceMetrics) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setDateRange: (range: { from: string; to: string }) => void
  refreshMetrics: () => Promise<void>
  
  // Computed getters
  getDrawdownData: () => Array<{ date: string; drawdown: number }>
  getPnLChartData: () => Array<{ date: string; pnl: number; cumulative: number }>
  getTopSymbols: (limit: number) => Array<{ symbol: string; pnl: number }>
  getWorstSymbols: (limit: number) => Array<{ symbol: string; pnl: number }>
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      metrics: null,
      isLoading: false,
      error: null,
      dateRange: {
        from: '',
        to: ''
      },
      
      setMetrics: (metrics) => set({ metrics, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      setDateRange: (dateRange) => set({ dateRange }),
      
      refreshMetrics: async () => {
        const { dateRange } = get()
        set({ isLoading: true, error: null })
        
        try {
          const queryParams = new URLSearchParams()
          if (dateRange.from) queryParams.append('from', dateRange.from)
          if (dateRange.to) queryParams.append('to', dateRange.to)
          
          const response = await fetch(`/api/analytics/performance?${queryParams}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch analytics')
          }
          
          const metrics = await response.json()
          set({ metrics, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false 
          })
        }
      },
      
      getDrawdownData: () => {
        const { metrics } = get()
        if (!metrics || !metrics.dailyStats) return []
        
        let peak = 0
        let cumulative = 0
        
        return metrics.dailyStats.map((day) => {
          cumulative += day.pnl
          if (cumulative > peak) peak = cumulative
          const drawdown = peak > 0 ? ((peak - cumulative) / peak) * 100 : 0
          
          return {
            date: day.date,
            drawdown
          }
        })
      },
      
      getPnLChartData: () => {
        const { metrics } = get()
        if (!metrics || !metrics.dailyStats) return []
        
        let cumulative = 0
        return metrics.dailyStats.map((day) => {
          cumulative += day.pnl
          return {
            date: day.date,
            pnl: day.pnl,
            cumulative
          }
        })
      },
      
      getTopSymbols: (limit) => {
        const { metrics } = get()
        if (!metrics || !metrics.symbolStats) return []
        
        return metrics.symbolStats
          .filter((symbol) => symbol.pnl > 0)
          .sort((a, b) => b.pnl - a.pnl)
          .slice(0, limit)
      },
      
      getWorstSymbols: (limit) => {
        const { metrics } = get()
        if (!metrics || !metrics.symbolStats) return []
        
        return metrics.symbolStats
          .filter((symbol) => symbol.pnl < 0)
          .sort((a, b) => a.pnl - b.pnl)
          .slice(0, limit)
      }
    }),
    { name: 'AnalyticsStore' }
  )
)
