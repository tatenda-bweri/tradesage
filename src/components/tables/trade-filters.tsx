import { format } from 'date-fns'
import React, { useState, useEffect } from 'react'
import { Filter, X, Calendar, Tag, TrendingUp, TrendingDown } from 'lucide-react'

import { DateRangePicker } from '@/components/ui'
import { DateRange } from '@/types/dateRange'
import { cn } from '@/lib/utils/cn'

interface TradeFilters {
  dateRange: DateRange
  tags: string[]
  side: 'all' | 'BUY' | 'SELL'
  outcome: 'all' | 'profit' | 'loss'
  symbol: string
}

interface TradeFiltersProps {
  filters: TradeFilters
  onFiltersChange: (filters: TradeFilters) => void
  availableTags: string[]
  availableSymbols: string[]
  className?: string
}

const TradeFilters: React.FC<TradeFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  availableSymbols,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<TradeFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilters = (updates: Partial<TradeFilters>) => {
    const newFilters = { ...localFilters, ...updates }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: TradeFilters = {
      dateRange: { startDate: null, endDate: null },
      tags: [],
      side: 'all',
      outcome: 'all',
      symbol: ''
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return (
      localFilters.dateRange.startDate ||
      localFilters.dateRange.endDate ||
      localFilters.tags.length > 0 ||
      localFilters.side !== 'all' ||
      localFilters.outcome !== 'all' ||
      localFilters.symbol !== ''
    )
  }

  const toggleTag = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag]
    updateFilters({ tags: newTags })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
            isOpen || hasActiveFilters()
              ? 'bg-profit bg-opacity-20 text-profit'
              : 'bg-surface-light text-text-secondary hover:text-text-primary'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters() && (
            <div className="w-2 h-2 bg-profit rounded-full" />
          )}
        </button>

        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="card p-6 space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </h4>
            
            <DateRangePicker
              value={localFilters.dateRange}
              onChange={(dateRange: DateRange) => updateFilters({ dateRange })}
              placeholder="Select date range for trades"
              className="w-full"
            />
          </div>

          {/* Symbol Filter */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Symbol</h4>
            <select
              value={localFilters.symbol}
              onChange={(e) => updateFilters({ symbol: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-surface-light rounded text-sm"
            >
              <option value="">All Symbols</option>
              {availableSymbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Side Filter */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Position Side</span>
            </h4>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'BUY', label: 'Long', icon: TrendingUp },
                { value: 'SELL', label: 'Short', icon: TrendingDown }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ side: option.value as 'all' | 'BUY' | 'SELL' })}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded text-sm transition-colors',
                    localFilters.side === option.value
                      ? 'bg-profit bg-opacity-20 text-profit'
                      : 'bg-surface-light text-text-secondary hover:text-text-primary'
                  )}
                >
                  {option.icon && <option.icon className="w-3 h-3" />}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Filter */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Trade Outcome</h4>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'profit', label: 'Profitable' },
                { value: 'loss', label: 'Losing' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ outcome: option.value as 'all' | 'profit' | 'loss' })}
                  className={cn(
                    'px-3 py-2 rounded text-sm transition-colors',
                    localFilters.outcome === option.value
                      ? option.value === 'profit' 
                        ? 'bg-profit bg-opacity-20 text-profit'
                        : option.value === 'loss'
                        ? 'bg-loss bg-opacity-20 text-loss'
                        : 'bg-surface-light text-text-primary'
                      : 'bg-surface-light text-text-secondary hover:text-text-primary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Tags</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-3 py-1 rounded text-xs transition-colors',
                    localFilters.tags.includes(tag)
                      ? 'bg-profit bg-opacity-20 text-profit'
                      : 'bg-surface-light text-text-secondary hover:text-text-primary'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {localFilters.dateRange.startDate && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-surface-light rounded text-xs">
              <Calendar className="w-3 h-3" />
              <span>
                {format(localFilters.dateRange.startDate, 'MMM dd')}
                {localFilters.dateRange.endDate && ` - ${format(localFilters.dateRange.endDate, 'MMM dd')}`}
              </span>
            </div>
          )}
          
          {localFilters.symbol && (
            <div className="px-2 py-1 bg-surface-light rounded text-xs">
              Symbol: {localFilters.symbol}
            </div>
          )}
          
          {localFilters.side !== 'all' && (
            <div className="px-2 py-1 bg-surface-light rounded text-xs">
              {localFilters.side === 'BUY' ? 'Long' : 'Short'}
            </div>
          )}
          
          {localFilters.outcome !== 'all' && (
            <div className="px-2 py-1 bg-surface-light rounded text-xs">
              {localFilters.outcome === 'profit' ? 'Profitable' : 'Losing'}
            </div>
          )}
          
          {localFilters.tags.map((tag) => (
            <div key={tag} className="flex items-center space-x-1 px-2 py-1 bg-surface-light rounded text-xs">
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TradeFilters 