import React, { useState, useRef, useEffect } from 'react'
import { format, startOfDay, endOfDay, isSameDay, isWithinInterval, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isBefore, isAfter } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { DateRange, DateRangePickerProps, DateRangePreset } from '@/types/dateRange'

const datePresets: DateRangePreset[] = [
  {
    label: 'Today',
    value: 'today',
    getDateRange: () => ({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date())
    })
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getDateRange: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday)
      }
    }
  },
  {
    label: 'This Week',
    value: 'thisWeek',
    getDateRange: () => ({
      startDate: startOfWeek(new Date()),
      endDate: endOfWeek(new Date())
    })
  },
  {
    label: 'Last Week',
    value: 'lastWeek',
    getDateRange: () => {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      return {
        startDate: startOfWeek(lastWeek),
        endDate: endOfWeek(lastWeek)
      }
    }
  },
  {
    label: 'This Month',
    value: 'thisMonth',
    getDateRange: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    })
  },
  {
    label: 'Last Month',
    value: 'lastMonth',
    getDateRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      }
    }
  },
  {
    label: 'This Year',
    value: 'thisYear',
    getDateRange: () => {
      const now = new Date()
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      }
    }
  },
  {
    label: 'Last Year',
    value: 'lastYear',
    getDateRange: () => {
      const now = new Date()
      const lastYear = now.getFullYear() - 1
      return {
        startDate: new Date(lastYear, 0, 1),
        endDate: new Date(lastYear, 11, 31, 23, 59, 59)
      }
    }
  },
  {
    label: 'All Time',
    value: 'allTime',
    getDateRange: () => ({
      startDate: null,
      endDate: null
    })
  }
]

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { startDate: null, endDate: null },
  onChange,
  onConfirm,
  onCancel,
  placeholder = 'Select date range',
  disabled = false,
  className,
  showPresets = true,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(value)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  const nextMonth = addMonths(currentMonth, 1)

  useEffect(() => {
    setTempRange(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTempRange(value) // Reset to original value
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, value])

  const formatDateRange = (range: DateRange): string => {
    if (!range.startDate && !range.endDate) {
      return placeholder
    }
    if (range.startDate && !range.endDate) {
      return format(range.startDate, 'MMM d, yyyy')
    }
    if (!range.startDate && range.endDate) {
      return format(range.endDate, 'MMM d, yyyy')
    }
    if (range.startDate && range.endDate) {
      if (isSameDay(range.startDate, range.endDate)) {
        return format(range.startDate, 'MMM d, yyyy')
      }
      return `${format(range.startDate, 'MMM d, yyyy')} - ${format(range.endDate, 'MMM d, yyyy')}`
    }
    return placeholder
  }

  const handleDateSelect = (date: Date) => {
    if (disabled) return

    if (minDate && isBefore(date, minDate)) return
    if (maxDate && isAfter(date, maxDate)) return

    let newRange: DateRange

    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      // Starting new selection
      newRange = { startDate: date, endDate: null }
    } else {
      // Completing the range
      if (isBefore(date, tempRange.startDate)) {
        newRange = { startDate: date, endDate: tempRange.startDate }
      } else {
        newRange = { startDate: tempRange.startDate, endDate: date }
      }
    }

    setTempRange(newRange)
    onChange?.(newRange)
  }

  const handlePresetSelect = (preset: DateRangePreset) => {
    const range = preset.getDateRange()
    setTempRange(range)
    onChange?.(range)
  }

  const handleConfirm = () => {
    onConfirm?.(tempRange)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempRange(value)
    onCancel?.()
    setIsOpen(false)
  }

  const isDateInRange = (date: Date): boolean => {
    if (!tempRange.startDate) return false
    
    if (tempRange.endDate) {
      return isWithinInterval(date, { start: tempRange.startDate, end: tempRange.endDate })
    }
    
    if (hoveredDate && isAfter(hoveredDate, tempRange.startDate)) {
      return isWithinInterval(date, { start: tempRange.startDate, end: hoveredDate })
    }
    
    return isSameDay(date, tempRange.startDate)
  }

  const isDateRangeStart = (date: Date): boolean => {
    return tempRange.startDate ? isSameDay(date, tempRange.startDate) : false
  }

  const isDateRangeEnd = (date: Date): boolean => {
    if (tempRange.endDate) {
      return isSameDay(date, tempRange.endDate)
    }
    if (hoveredDate && tempRange.startDate && isAfter(hoveredDate, tempRange.startDate)) {
      return isSameDay(date, hoveredDate)
    }
    return false
  }

  const renderCalendar = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">
            {format(month, 'MMMM yyyy')}
          </h3>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous month</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next month</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="p-2 text-xs text-gray-500 text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isCurrentMonth = day.getMonth() === month.getMonth()
            const isToday = isSameDay(day, new Date())
            const isSelected = isDateInRange(day)
            const isRangeStart = isDateRangeStart(day)
            const isRangeEnd = isDateRangeEnd(day)
            const isDisabled = !isCurrentMonth || 
              (minDate && isBefore(day, minDate)) || 
              (maxDate && isAfter(day, maxDate))

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDateSelect(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={isDisabled}
                className={cn(
                  'p-2 text-sm relative transition-colors',
                  'hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  {
                    'text-gray-300': !isCurrentMonth,
                    'text-gray-900': isCurrentMonth && !isSelected,
                    'bg-blue-100 text-blue-900': isSelected && !isRangeStart && !isRangeEnd,
                    'bg-blue-500 text-white': isRangeStart || isRangeEnd,
                    'font-bold border border-blue-300': isToday,
                    'cursor-not-allowed opacity-50': isDisabled,
                    'rounded-l': isRangeStart,
                    'rounded-r': isRangeEnd,
                    'rounded': isRangeStart && isRangeEnd
                  }
                )}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-sm',
          'border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'hover:border-gray-400 transition-colors',
          {
            'cursor-not-allowed opacity-50': disabled,
            'text-gray-500': !value.startDate && !value.endDate
          }
        )}
      >
        <span className="truncate">
          {formatDateRange(value)}
        </span>
        <Calendar className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
          <div className="flex">
            {/* Presets sidebar */}
            {showPresets && (
              <div className="border-r border-gray-200 p-4 min-w-[160px]">
                <div className="space-y-1">
                  {datePresets.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar area */}
            <div>
              <div className="flex">
                {renderCalendar(currentMonth)}
                {renderCalendar(nextMonth)}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  data-testid="apply-button"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker
