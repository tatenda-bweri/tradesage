import React from 'react'
import { DateRangePicker } from '@/components/ui'
import { DateRange } from '@/types/dateRange'
import { cn } from '@/lib/utils/cn'

export interface DashboardFiltersProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  className
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border', className)}>
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Date Range
        </label>
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          placeholder="Select date range for dashboard data"
          className="min-w-[300px]"
          showPresets={true}
        />
      </div>
      
      {/* Future filters can be added here */}
      <div className="flex-1" />
      
      <div className="flex items-end">
        <button
          type="button"
          onClick={() => onDateRangeChange({ startDate: null, endDate: null })}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default DashboardFilters
