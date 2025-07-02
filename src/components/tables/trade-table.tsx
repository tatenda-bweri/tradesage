import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { TradeRecord } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { formatPnL, formatLotSize } from '@/lib/utils/formatters'

interface TradeTableProps {
  trades: TradeRecord[]
  onEdit?: (trade: TradeRecord) => void
  onDelete?: (tradeId: string) => void
  onDuplicate?: (trade: TradeRecord) => void
  className?: string
}

type SortField = 'openTime' | 'closeTime' | 'symbol' | 'type' | 'profit' | 'volume'
type SortDirection = 'asc' | 'desc'

const TradeTable: React.FC<TradeTableProps> = ({
  trades,
  onEdit,
  onDelete,
  onDuplicate,
  className
}) => {
  const [sortField, setSortField] = useState<SortField>('openTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set())

  // Sort trades
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'openTime' || sortField === 'closeTime') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [trades, sortField, sortDirection])

  // Paginate trades
  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedTrades.slice(startIndex, startIndex + pageSize)
  }, [sortedTrades, currentPage, pageSize])

  const totalPages = Math.ceil(sortedTrades.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const toggleTradeSelection = (tradeId: string) => {
    const newSelected = new Set(selectedTrades)
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId)
    } else {
      newSelected.add(tradeId)
    }
    setSelectedTrades(newSelected)
  }

  const selectAllTrades = () => {
    if (selectedTrades.size === paginatedTrades.length) {
      setSelectedTrades(new Set())
    } else {
      setSelectedTrades(new Set(paginatedTrades.map(t => t.id)))
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Trades ({trades.length})
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-1 bg-surface border border-surface-light rounded text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-light">
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTrades.size === paginatedTrades.length && paginatedTrades.length > 0}
                  onChange={selectAllTrades}
                  className="rounded"
                />
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-surface"
                onClick={() => handleSort('openTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>Open Time</span>
                  {getSortIcon('openTime')}
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-surface"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center space-x-1">
                  <span>Symbol</span>
                  {getSortIcon('symbol')}
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-surface"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {getSortIcon('type')}
                </div>
              </th>
              <th className="p-3 text-left">Volume</th>
              <th className="p-3 text-left">Open Price</th>
              <th className="p-3 text-left">Close Price</th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-surface"
                onClick={() => handleSort('profit')}
              >
                <div className="flex items-center space-x-1">
                  <span>P&L</span>
                  {getSortIcon('profit')}
                </div>
              </th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrades.map((trade) => (
              <tr key={trade.id} className="border-b border-surface-light hover:bg-surface-light">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedTrades.has(trade.id)}
                    onChange={() => toggleTradeSelection(trade.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-3 text-sm">
                  {format(new Date(trade.openTime), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="p-3 font-medium">{trade.symbol}</td>
                <td className="p-3">
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    trade.type === 'BUY' ? 'bg-profit bg-opacity-20 text-profit' : 'bg-loss bg-opacity-20 text-loss'
                  )}>
                    {trade.type}
                  </span>
                </td>
                <td className="p-3 text-sm">{trade.volume}</td>
                <td className="p-3 text-sm">{trade.openPrice.toFixed(5)}</td>
                <td className="p-3 text-sm">{trade.closePrice.toFixed(5)}</td>
                <td className="p-3">
                  {(() => {
                    const pnlData = formatPnL(trade.profit)
                    return (
                      <span className={cn('font-medium', pnlData.colorClass)}>
                        {pnlData.formatted}
                      </span>
                    )
                  })()}
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit?.(trade)}
                      className="p-1 rounded hover:bg-surface transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button
                      onClick={() => onDuplicate?.(trade)}
                      className="p-1 rounded hover:bg-surface transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button
                      onClick={() => onDelete?.(trade.id)}
                      className="p-1 rounded hover:bg-surface transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedTrades.length)} of {sortedTrades.length} trades
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-surface border border-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-surface border border-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradeTable 