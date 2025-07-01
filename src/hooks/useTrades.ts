import { useState, useEffect } from 'react'
import { TradeRecord } from '@/lib/types'

interface UseTradesOptions {
  accountId?: string
  page?: number
  pageSize?: number
  autoFetch?: boolean
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
  const { accountId, page: initialPage = 1, pageSize: initialPageSize = 20, autoFetch = true } = options
  
  const [trades, setTrades] = useState<TradeRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const fetchTrades = async () => {
    if (!accountId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        accountId,
        page: page.toString(),
        pageSize: pageSize.toString()
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
  }

  useEffect(() => {
    if (autoFetch && accountId) {
      fetchTrades()
    }
  }, [accountId, page, pageSize, autoFetch])

  const refetch = () => {
    fetchTrades()
  }

  return {
    trades,
    loading,
    error,
    total,
    page,
    pageSize,
    refetch,
    setPage,
    setPageSize
  }
} 