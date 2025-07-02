import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { TradeRecord } from '@/lib/types'

interface UseTradesOptions {
  page?: number
  pageSize?: number
  autoFetch?: boolean
  filters?: Record<string, string | number>
}

interface UseTradesReturn {
  trades: TradeRecord[]
  loading: boolean
  error: string | null
  total: number
  page: number
  pageSize: number
  refetch: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

export const useTrades = (options: UseTradesOptions = {}): UseTradesReturn => {
  const { page: initialPage = 1, pageSize: initialPageSize = 20, autoFetch = true, filters = {} } = options
  const { data: session, status } = useSession()
  
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const fetchTrades = useCallback(async () => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        accountId: session.user.id,
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, String(value)])
        )
      })
      
      const response = await fetch(`/api/trades?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trades: ${response.statusText}`)
      }
      
      const data = await response.json()
      setTrades(data.trades)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trades')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, page, pageSize, filters])

  useEffect(() => {
    if (autoFetch && status === 'authenticated' && session?.user?.id) {
      fetchTrades()
    } else if (status === 'unauthenticated') {
      setError('Please log in to view trades')
    }
  }, [autoFetch, status, session?.user?.id, fetchTrades])

  const refetch = () => {
    if (session?.user?.id) {
      fetchTrades()
    }
  }

  return {
    trades,
    loading: loading || status === 'loading',
    error,
    total,
    page,
    pageSize,
    refetch,
    setPage,
    setPageSize
  }
} 