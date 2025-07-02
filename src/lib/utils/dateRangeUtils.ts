import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  format,
  differenceInDays,
  isWithinInterval,
  isSameDay,
  parseISO,
  isValid
} from 'date-fns'
import { DateRange } from '@/types/dateRange'

/**
 * Predefined date range presets
 */
export const dateRangePresets = {
  today: (): DateRange => ({
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date())
  }),

  yesterday: (): DateRange => {
    const yesterday = subDays(new Date(), 1)
    return {
      startDate: startOfDay(yesterday),
      endDate: endOfDay(yesterday)
    }
  },

  thisWeek: (): DateRange => ({
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date())
  }),

  lastWeek: (): DateRange => {
    const lastWeek = subWeeks(new Date(), 1)
    return {
      startDate: startOfWeek(lastWeek),
      endDate: endOfWeek(lastWeek)
    }
  },

  thisMonth: (): DateRange => ({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  }),

  lastMonth: (): DateRange => {
    const lastMonth = subMonths(new Date(), 1)
    return {
      startDate: startOfMonth(lastMonth),
      endDate: endOfMonth(lastMonth)
    }
  },

  thisQuarter: (): DateRange => {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3)
    const startMonth = quarter * 3
    return {
      startDate: new Date(now.getFullYear(), startMonth, 1),
      endDate: endOfMonth(new Date(now.getFullYear(), startMonth + 2, 1))
    }
  },

  lastQuarter: (): DateRange => {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3)
    const lastQuarter = quarter === 0 ? 3 : quarter - 1
    const year = quarter === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const startMonth = lastQuarter * 3
    return {
      startDate: new Date(year, startMonth, 1),
      endDate: endOfMonth(new Date(year, startMonth + 2, 1))
    }
  },

  thisYear: (): DateRange => ({
    startDate: startOfYear(new Date()),
    endDate: endOfYear(new Date())
  }),

  lastYear: (): DateRange => {
    const lastYear = subYears(new Date(), 1)
    return {
      startDate: startOfYear(lastYear),
      endDate: endOfYear(lastYear)
    }
  },

  last7Days: (): DateRange => ({
    startDate: startOfDay(subDays(new Date(), 6)),
    endDate: endOfDay(new Date())
  }),

  last30Days: (): DateRange => ({
    startDate: startOfDay(subDays(new Date(), 29)),
    endDate: endOfDay(new Date())
  }),

  last90Days: (): DateRange => ({
    startDate: startOfDay(subDays(new Date(), 89)),
    endDate: endOfDay(new Date())
  }),

  allTime: (): DateRange => ({
    startDate: null,
    endDate: null
  })
}

/**
 * Format a date range for display
 */
export const formatDateRange = (
  range: DateRange, 
  options: {
    separator?: string
    dateFormat?: string
    emptyText?: string
  } = {}
): string => {
  const { 
    separator = ' - ', 
    dateFormat = 'MMM d, yyyy',
    emptyText = 'Select date range'
  } = options

  if (!range.startDate && !range.endDate) {
    return emptyText
  }

  if (range.startDate && !range.endDate) {
    return format(range.startDate, dateFormat)
  }

  if (!range.startDate && range.endDate) {
    return format(range.endDate, dateFormat)
  }

  if (range.startDate && range.endDate) {
    if (isSameDay(range.startDate, range.endDate)) {
      return format(range.startDate, dateFormat)
    }
    return `${format(range.startDate, dateFormat)}${separator}${format(range.endDate, dateFormat)}`
  }

  return emptyText
}

/**
 * Get the number of days in a date range
 */
export const getDateRangeDays = (range: DateRange): number => {
  if (!range.startDate || !range.endDate) {
    return 0
  }
  return differenceInDays(range.endDate, range.startDate) + 1
}

/**
 * Check if a date is within a date range
 */
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  if (!range.startDate || !range.endDate) {
    return false
  }
  return isWithinInterval(date, { start: range.startDate, end: range.endDate })
}

/**
 * Validate a date range
 */
export const validateDateRange = (
  range: DateRange,
  options: {
    required?: boolean
    minDate?: Date
    maxDate?: Date
    maxDays?: number
  } = {}
): { isValid: boolean; error?: string } => {
  const { required = false, minDate, maxDate, maxDays } = options

  // Check required
  if (required && (!range.startDate || !range.endDate)) {
    return { isValid: false, error: 'Both start and end dates are required' }
  }

  // Validate dates
  if (range.startDate && !isValid(range.startDate)) {
    return { isValid: false, error: 'Invalid start date' }
  }

  if (range.endDate && !isValid(range.endDate)) {
    return { isValid: false, error: 'Invalid end date' }
  }

  // Check order
  if (range.startDate && range.endDate && range.startDate > range.endDate) {
    return { isValid: false, error: 'Start date must be before end date' }
  }

  // Check min/max constraints
  if (minDate) {
    if (range.startDate && range.startDate < minDate) {
      return { isValid: false, error: `Start date must be after ${format(minDate, 'MMM d, yyyy')}` }
    }
    if (range.endDate && range.endDate < minDate) {
      return { isValid: false, error: `End date must be after ${format(minDate, 'MMM d, yyyy')}` }
    }
  }

  if (maxDate) {
    if (range.startDate && range.startDate > maxDate) {
      return { isValid: false, error: `Start date must be before ${format(maxDate, 'MMM d, yyyy')}` }
    }
    if (range.endDate && range.endDate > maxDate) {
      return { isValid: false, error: `End date must be before ${format(maxDate, 'MMM d, yyyy')}` }
    }
  }

  // Check max days
  if (maxDays && range.startDate && range.endDate) {
    const days = getDateRangeDays(range)
    if (days > maxDays) {
      return { isValid: false, error: `Date range cannot exceed ${maxDays} days` }
    }
  }

  return { isValid: true }
}

/**
 * Parse date range from string format
 */
export const parseDateRange = (
  startDateStr: string | null, 
  endDateStr: string | null
): DateRange => {
  const startDate = startDateStr ? parseISO(startDateStr) : null
  const endDate = endDateStr ? parseISO(endDateStr) : null

  return {
    startDate: startDate && isValid(startDate) ? startDate : null,
    endDate: endDate && isValid(endDate) ? endDate : null
  }
}

/**
 * Convert date range to API query parameters
 */
export const dateRangeToQueryParams = (
  range: DateRange,
  options: {
    startKey?: string
    endKey?: string
    format?: string
  } = {}
): Record<string, string> => {
  const { 
    startKey = 'startDate', 
    endKey = 'endDate', 
    format: dateFormat = 'yyyy-MM-dd'
  } = options

  const params: Record<string, string> = {}

  if (range.startDate) {
    params[startKey] = format(range.startDate, dateFormat)
  }

  if (range.endDate) {
    params[endKey] = format(range.endDate, dateFormat)
  }

  return params
}

/**
 * Get relative date range (e.g., "Last 7 days", "This month")
 */
export const getRelativeDateRangeLabel = (range: DateRange): string | null => {
  if (!range.startDate || !range.endDate) {
    return null
  }

  const presetEntries = Object.entries(dateRangePresets)
  
  for (const [key, presetFn] of presetEntries) {
    const presetRange = presetFn()
    if (
      presetRange.startDate && 
      presetRange.endDate &&
      isSameDay(range.startDate, presetRange.startDate) &&
      isSameDay(range.endDate, presetRange.endDate)
    ) {
      // Convert camelCase to title case
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }
  }

  return null
}

/**
 * Compare two date ranges for equality
 */
export const isDateRangeEqual = (range1: DateRange, range2: DateRange): boolean => {
  const start1 = range1.startDate
  const end1 = range1.endDate
  const start2 = range2.startDate
  const end2 = range2.endDate

  return (
    (start1 === start2 || (start1 && start2 && isSameDay(start1, start2))) &&
    (end1 === end2 || (end1 && end2 && isSameDay(end1, end2)))
  )
}

/**
 * Shift a date range by a specified amount
 */
export const shiftDateRange = (
  range: DateRange,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years'
): DateRange => {
  if (!range.startDate || !range.endDate) {
    return range
  }

  const addFunctions = {
    days: addDays,
    weeks: addWeeks,
    months: addMonths,
    years: addYears
  }

  const addFn = addFunctions[unit]

  return {
    startDate: addFn(range.startDate, amount),
    endDate: addFn(range.endDate, amount)
  }
}
