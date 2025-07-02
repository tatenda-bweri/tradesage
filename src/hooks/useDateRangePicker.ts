import { useState, useCallback, useMemo } from 'react'
import { 
  startOfDay, 
  endOfDay, 
  isValid, 
  isBefore, 
  isAfter, 
  differenceInDays,
  format,
  parseISO 
} from 'date-fns'
import { DateRange } from '@/types/dateRange'

export interface UseDateRangePickerOptions {
  initialRange?: DateRange
  minDate?: Date
  maxDate?: Date
  maxDays?: number
  required?: boolean
}

export interface UseDateRangePickerReturn {
  range: DateRange
  setRange: (range: DateRange) => void
  isValid: boolean
  error: string | null
  formattedRange: string
  isEmpty: boolean
  dayCount: number
  reset: () => void
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
}

const useDateRangePicker = (options: UseDateRangePickerOptions = {}): UseDateRangePickerReturn => {
  const {
    initialRange = { startDate: null, endDate: null },
    minDate,
    maxDate,
    maxDays,
    required = false
  } = options

  const [range, setRangeState] = useState<DateRange>(initialRange)

  const validation = useMemo(() => {
    let isValid = true
    let error: string | null = null

    // Check if required fields are filled
    if (required && (!range.startDate || !range.endDate)) {
      isValid = false
      error = 'Both start and end dates are required'
      return { isValid, error }
    }

    // Validate individual dates
    if (range.startDate && !isValid(range.startDate)) {
      isValid = false
      error = 'Invalid start date'
      return { isValid, error }
    }

    if (range.endDate && !isValid(range.endDate)) {
      isValid = false
      error = 'Invalid end date'
      return { isValid, error }
    }

    // Check date order
    if (range.startDate && range.endDate && isAfter(range.startDate, range.endDate)) {
      isValid = false
      error = 'Start date must be before end date'
      return { isValid, error }
    }

    // Check minimum date constraint
    if (minDate) {
      if (range.startDate && isBefore(range.startDate, minDate)) {
        isValid = false
        error = `Start date must be after ${format(minDate, 'MMM d, yyyy')}`
        return { isValid, error }
      }
      if (range.endDate && isBefore(range.endDate, minDate)) {
        isValid = false
        error = `End date must be after ${format(minDate, 'MMM d, yyyy')}`
        return { isValid, error }
      }
    }

    // Check maximum date constraint
    if (maxDate) {
      if (range.startDate && isAfter(range.startDate, maxDate)) {
        isValid = false
        error = `Start date must be before ${format(maxDate, 'MMM d, yyyy')}`
        return { isValid, error }
      }
      if (range.endDate && isAfter(range.endDate, maxDate)) {
        isValid = false
        error = `End date must be before ${format(maxDate, 'MMM d, yyyy')}`
        return { isValid, error }
      }
    }

    // Check maximum days constraint
    if (maxDays && range.startDate && range.endDate) {
      const days = differenceInDays(range.endDate, range.startDate) + 1
      if (days > maxDays) {
        isValid = false
        error = `Date range cannot exceed ${maxDays} days`
        return { isValid, error }
      }
    }

    return { isValid, error }
  }, [range, minDate, maxDate, maxDays, required])

  const formattedRange = useMemo(() => {
    if (!range.startDate && !range.endDate) {
      return ''
    }
    
    if (range.startDate && !range.endDate) {
      return format(range.startDate, 'MMM d, yyyy')
    }
    
    if (!range.startDate && range.endDate) {
      return format(range.endDate, 'MMM d, yyyy')
    }
    
    if (range.startDate && range.endDate) {
      return `${format(range.startDate, 'MMM d, yyyy')} - ${format(range.endDate, 'MMM d, yyyy')}`
    }
    
    return ''
  }, [range])

  const isEmpty = useMemo(() => {
    return !range.startDate && !range.endDate
  }, [range])

  const dayCount = useMemo(() => {
    if (!range.startDate || !range.endDate) {
      return 0
    }
    return differenceInDays(range.endDate, range.startDate) + 1
  }, [range])

  const setRange = useCallback((newRange: DateRange) => {
    // Normalize dates to start/end of day
    const normalizedRange: DateRange = {
      startDate: newRange.startDate ? startOfDay(newRange.startDate) : null,
      endDate: newRange.endDate ? endOfDay(newRange.endDate) : null
    }
    setRangeState(normalizedRange)
  }, [])

  const setStartDate = useCallback((date: Date | null) => {
    setRange({
      startDate: date,
      endDate: range.endDate
    })
  }, [range.endDate, setRange])

  const setEndDate = useCallback((date: Date | null) => {
    setRange({
      startDate: range.startDate,
      endDate: date
    })
  }, [range.startDate, setRange])

  const reset = useCallback(() => {
    setRangeState(initialRange)
  }, [initialRange])

  return {
    range,
    setRange,
    isValid: validation.isValid,
    error: validation.error,
    formattedRange,
    isEmpty,
    dayCount,
    reset,
    setStartDate,
    setEndDate
  }
}

export default useDateRangePicker
