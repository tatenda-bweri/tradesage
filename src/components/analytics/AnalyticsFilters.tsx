import React from 'react'
import { DateRangePicker } from '@/components/ui'
import { DateRange } from '@/types/dateRange'
import { cn } from '@/lib/utils/cn'

export interface AnalyticsFiltersProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  includeSymbols?: string[]
  selectedSymbols?: string[]
  onSymbolsChange?: (symbols: string[]) => void
  className?: string
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  includeSymbols = [],
  selectedSymbols = [],
  onSymbolsChange,
  className
}) => {
  return (
    <div className={cn('flex flex-col lg:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border', className)}>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Analysis Period
        </label>
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          placeholder="Select period for analysis"
          className="min-w-[300px]"
          showPresets={true}
        />
      </div>
      
      {/* Symbol Filter */}
      {includeSymbols.length > 0 && (
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Trading Pairs
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSymbolsChange?.([])}
              className={cn(
                'px-3 py-1 text-xs rounded-full border transition-colors',
                selectedSymbols.length === 0
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              )}
            >
              All Pairs
            </button>
            {includeSymbols.slice(0, 8).map(symbol => (
              <button
                key={symbol}
                type="button"
                onClick={() => {
                  if (selectedSymbols.includes(symbol)) {
                    onSymbolsChange?.(selectedSymbols.filter(s => s !== symbol))
                  } else {
                    onSymbolsChange?.([...selectedSymbols, symbol])
                  }
                }}
                className={cn(
                  'px-3 py-1 text-xs rounded-full border transition-colors',
                  selectedSymbols.includes(symbol)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                )}
              >
                {symbol}
              </button>
            ))}
            {includeSymbols.length > 8 && (
              <span className="px-3 py-1 text-xs text-gray-500">
                +{includeSymbols.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1" />
      
      <div className="flex items-end space-x-2">
        <button
          type="button"
          onClick={() => {
            onDateRangeChange({ startDate: null, endDate: null })
            onSymbolsChange?.([])
          }}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default AnalyticsFilters
