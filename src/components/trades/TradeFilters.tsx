import React from 'react'
import { DateRangePicker, Select } from '@/components/ui'
import { DateRange } from '@/types/dateRange'
import { cn } from '@/lib/utils/cn'

export interface TradeFiltersProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  selectedSymbol?: string
  onSymbolChange?: (symbol: string) => void
  selectedType?: string
  onTypeChange?: (type: string) => void
  symbols?: string[]
  className?: string
}

const tradeTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'buy', label: 'Buy Orders' },
  { value: 'sell', label: 'Sell Orders' }
]

const TradeFilters: React.FC<TradeFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  selectedSymbol = 'all',
  onSymbolChange,
  selectedType = 'all',
  onTypeChange,
  symbols = [],
  className
}) => {
  const symbolOptions = [
    { value: 'all', label: 'All Symbols' },
    ...symbols.map(symbol => ({ value: symbol, label: symbol }))
  ]

  const handleSymbolChange = (option: { value: string; label: string } | null) => {
    onSymbolChange?.(option?.value || 'all')
  }

  const handleTypeChange = (option: { value: string; label: string } | null) => {
    onTypeChange?.(option?.value || 'all')
  }

  return (
    <div className={cn('flex flex-col lg:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border', className)}>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Date Range
        </label>
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          placeholder="Filter trades by date"
          className="min-w-[300px]"
          showPresets={true}
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Symbol
        </label>
        <Select
          value={symbolOptions.find(opt => opt.value === selectedSymbol) || null}
          onChange={handleSymbolChange}
          options={symbolOptions}
          className="min-w-[150px]"
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Trade Type
        </label>
        <Select
          value={tradeTypes.find(opt => opt.value === selectedType) || null}
          onChange={handleTypeChange}
          options={tradeTypes}
          className="min-w-[150px]"
        />
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-end space-x-2">
        <div className="text-sm text-gray-500">
          Showing trades
        </div>
        <button
          type="button"
          onClick={() => {
            onDateRangeChange({ startDate: null, endDate: null })
            onSymbolChange?.('all')
            onTypeChange?.('all')
          }}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

export default TradeFilters
