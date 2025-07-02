import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PerformanceMetrics {
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

interface TemporalAnalysis {
  dailyDistribution: number[]
  monthlyDistribution: number[]
  hourlyDistribution: number[]
}

interface UseAnalyticsOptions {
  startDate?: string
  endDate?: string
  autoFetch?: boolean
}

interface UseAnalyticsReturn {
  metrics: PerformanceMetrics | null
  temporalAnalysis: TemporalAnalysis | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
  const { startDate, endDate, autoFetch = true } = options
  const { data: session, status } = useSession()
  
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({ accountId: session.user.id })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/analytics/performance?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }
      
      const data = await response.json()
      setMetrics(data.metrics)
      setTemporalAnalysis(data.temporalAnalysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && session?.user?.id) {
      fetchAnalytics()
    } else if (status === 'unauthenticated') {
      setError('Please log in to view analytics')
    }
  }, [session?.user?.id, status, startDate, endDate, autoFetch])

  const refetch = () => {
    if (session?.user?.id) {
      fetchAnalytics()
    }
  }

  return {
    metrics,
    temporalAnalysis,
    loading: loading || status === 'loading',
    error,
    refetch
  }
} 