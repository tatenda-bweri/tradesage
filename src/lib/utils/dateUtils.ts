import { format, parseISO, isValid, formatDistance, startOfDay, endOfDay } from 'date-fns'

/**
 * Date formatting and serialization utilities
 */

/**
 * Serialize Date objects to ISO strings for JSON responses
 */
export const serializeDate = (date: Date | string | null | undefined): string | null => {
  if (!date) return null
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? dateObj.toISOString() : null
  } catch {
    return null
  }
}

/**
 * Format date for display
 */
export const formatDate = (
  date: Date | string | null | undefined,
  formatString: string = 'MMM dd, yyyy'
): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  } catch {
    return ''
  }
}

/**
 * Format date for time display
 */
export const formatTime = (
  date: Date | string | null | undefined,
  formatString: string = 'HH:mm'
): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  } catch {
    return ''
  }
}

/**
 * Format date and time for display
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  formatString: string = 'MMM dd, yyyy HH:mm'
): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : ''
  } catch {
    return ''
  }
}

/**
 * Format distance from now (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? formatDistance(dateObj, new Date(), { addSuffix: true }) : ''
  } catch {
    return ''
  }
}

/**
 * Get start and end of day for a given date
 */
export const getDayRange = (date: Date | string): { start: Date; end: Date } => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return {
    start: startOfDay(dateObj),
    end: endOfDay(dateObj)
  }
}

/**
 * Recursively serialize Date objects in an object structure
 */
export const serializeDates = <T extends Record<string, unknown>>(obj: T): T => {
  const serialized: Record<string, unknown> = { ...obj }
  
  for (const [key, value] of Object.entries(serialized)) {
    if (value instanceof Date) {
      serialized[key] = serializeDate(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeDates(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((item) => 
        item instanceof Date 
          ? serializeDate(item)
          : (item && typeof item === 'object' ? serializeDates(item as Record<string, unknown>) : item)
      )
    }
  }
  
  return serialized as T
}

/**
 * Parse date string with fallback
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null
  
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Check if a date is valid
 */
export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && isValid(date)
}

/**
 * Convert date to UTC string for API requests
 */
export const toUTCString = (date: Date | string | null | undefined): string | null => {
  if (!date) return null
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? dateObj.toISOString() : null
  } catch {
    return null
  }
}
