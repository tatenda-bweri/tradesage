import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface FilterState {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  symbols: string[]
  types: ('BUY' | 'SELL')[]
  profitRange: {
    min: number | null
    max: number | null
  }
  tags: string[]
  minVolume: number | null
  maxVolume: number | null
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableSymbols: string[]
  availableTags: string[]
  className?: string
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availableSymbols,
  availableTags,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  const resetFilters = () => {
    const resetFilters: FilterState = {
      dateRange: { startDate: null, endDate: null },
      symbols: [],
      types: [],
      profitRange: { min: null, max: null },
      tags: [],
      minVolume: null,
      maxVolume: null
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.symbols.length > 0) count++
    if (filters.types.length > 0) count++
    if (filters.profitRange.min !== null || filters.profitRange.max !== null) count++
    if (filters.tags.length > 0) count++
    if (filters.minVolume !== null || filters.maxVolume !== null) count++
    return count
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-text-primary hover:text-text-secondary transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-profit text-background text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {getActiveFilterCount() > 0 && (
          <button
            onClick={resetFilters}
            className="text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="card p-6 space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Date Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Start Date</label>
                <input
                  type="date"
                  value={localFilters.dateRange.start ? format(localFilters.dateRange.start, 'yyyy-MM-dd') : ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...localFilters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : null
                  })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">End Date</label>
                <input
                  type="date"
                  value={localFilters.dateRange.end ? format(localFilters.dateRange.end, 'yyyy-MM-dd') : ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...localFilters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : null
                  })}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Symbols */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Symbols</h4>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {availableSymbols.map((symbol) => (
                <label key={symbol} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localFilters.symbols.includes(symbol)}
                    onChange={(e) => {
                      const newSymbols = e.target.checked
                        ? [...localFilters.symbols, symbol]
                        : localFilters.symbols.filter(s => s !== symbol)
                      updateFilter('symbols', newSymbols)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">{symbol}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trade Types */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Trade Types</h4>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.types.includes('BUY')}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...localFilters.types, 'BUY']
                      : localFilters.types.filter(t => t !== 'BUY')
                    updateFilter('types', newTypes)
                  }}
                  className="rounded"
                />
                <span className="text-sm text-text-secondary">Buy</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.types.includes('SELL')}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...localFilters.types, 'SELL']
                      : localFilters.types.filter(t => t !== 'SELL')
                    updateFilter('types', newTypes)
                  }}
                  className="rounded"
                />
                <span className="text-sm text-text-secondary">Sell</span>
              </label>
            </div>
          </div>

          {/* Profit Range */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Profit Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Min Profit</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.profitRange.min || ''}
                  onChange={(e) => updateFilter('profitRange', {
                    ...localFilters.profitRange,
                    min: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Max Profit</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.profitRange.max || ''}
                  onChange={(e) => updateFilter('profitRange', {
                    ...localFilters.profitRange,
                    max: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Volume Range */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Volume Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Min Volume</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Min"
                  value={localFilters.minVolume || ''}
                  onChange={(e) => updateFilter('minVolume', e.target.value ? parseFloat(e.target.value) : null)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Max Volume</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Max"
                  value={localFilters.maxVolume || ''}
                  onChange={(e) => updateFilter('maxVolume', e.target.value ? parseFloat(e.target.value) : null)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <h4 className="font-medium text-text-primary mb-3">Tags</h4>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={localFilters.tags.includes(tag)}
                      onChange={(e) => {
                        const newTags = e.target.checked
                          ? [...localFilters.tags, tag]
                          : localFilters.tags.filter(t => t !== tag)
                        updateFilter('tags', newTags)
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-text-secondary">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-surface-light">
            <button
              onClick={() => setIsExpanded(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="btn btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters 