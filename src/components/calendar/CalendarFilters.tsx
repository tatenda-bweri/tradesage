import { Filter } from 'lucide-react'
import React from 'react'

import { DateRangePicker } from '@/components/ui'
import { DateRange } from '@/types/dateRange'

interface CalendarFiltersProps {
  dateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
  className?: string
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  className
}) => {
  return (
    <div className={`card p-4 ${className || ''}`}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Calendar Filters</span>
        </div>
        
        <div className="flex-1">
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            placeholder="Select date range for calendar view"
            className="w-full max-w-md"
          />
        </div>
      </div>
    </div>
  )
}

export default CalendarFilters
