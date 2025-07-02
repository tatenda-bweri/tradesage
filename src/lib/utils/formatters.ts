/**
 * Currency and number formatting utilities
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'NZD'

export interface FormatOptions {
  currency?: Currency
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Default formatting options
 */
const DEFAULT_OPTIONS: FormatOptions = {
  currency: 'USD',
  locale: 'en-US',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  options: FormatOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  try {
    return new Intl.NumberFormat(opts.locale, {
      style: 'currency',
      currency: opts.currency,
      minimumFractionDigits: opts.minimumFractionDigits,
      maximumFractionDigits: opts.maximumFractionDigits,
    }).format(value)
  } catch (error) {
    // Fallback formatting
    const symbol = getCurrencySymbol(opts.currency!)
    return `${symbol}${value.toFixed(opts.maximumFractionDigits)}`
  }
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(
  value: number,
  options: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const opts = {
    locale: 'en-US',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    ...options,
  }
  
  try {
    return new Intl.NumberFormat(opts.locale, {
      style: 'percent',
      minimumFractionDigits: opts.minimumFractionDigits,
      maximumFractionDigits: opts.maximumFractionDigits,
    }).format(value / 100)
  } catch (error) {
    return `${value.toFixed(opts.maximumFractionDigits)}%`
  }
}

/**
 * Format a large number with compact notation (K, M, B)
 */
export function formatCompactNumber(
  value: number,
  options: { locale?: string } = {}
): string {
  const opts = { locale: 'en-US', ...options }
  
  try {
    return new Intl.NumberFormat(opts.locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value)
  } catch (error) {
    // Fallback for older browsers
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`
    } else if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`
    } else if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`
    }
    return value.toString()
  }
}

/**
 * Format a decimal number with specified precision
 */
export function formatNumber(
  value: number,
  options: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const opts = {
    locale: 'en-US',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }
  
  try {
    return new Intl.NumberFormat(opts.locale, {
      minimumFractionDigits: opts.minimumFractionDigits,
      maximumFractionDigits: opts.maximumFractionDigits,
    }).format(value)
  } catch (error) {
    return value.toFixed(opts.maximumFractionDigits)
  }
}

/**
 * Format profit/loss with color coding
 */
export function formatPnL(
  amount: number,
  options: FormatOptions = {}
): { 
  value: string; 
  className: string; 
  formatted: string; 
  colorClass: string; 
  isPositive: boolean;
} {
  const formatted = formatCurrency(amount, options)
  
  let colorClass = 'text-text-secondary'
  if (amount > 0) colorClass = 'text-profit'
  else if (amount < 0) colorClass = 'text-loss'
  
  return { 
    value: formatted,
    className: colorClass,
    formatted,
    colorClass,
    isPositive: amount >= 0
  }
}

/**
 * Format lot size
 */
export function formatLotSize(
  lotSize: number,
  options: { showUnit?: boolean; decimalPlaces?: number } = {}
): string {
  const { showUnit = true, decimalPlaces = 2 } = options
  const formatted = formatNumber(lotSize, { maximumFractionDigits: decimalPlaces })
  return showUnit ? `${formatted} lots` : formatted
}

/**
 * Format pip value
 */
export function formatPips(
  pips: number,
  options: { showUnit?: boolean; showSign?: boolean } = {}
): string {
  const { showUnit = true, showSign = false } = options
  const sign = showSign && pips >= 0 ? '+' : ''
  const formatted = `${sign}${pips.toFixed(1)}`
  return showUnit ? `${formatted} pips` : formatted
}

/**
 * Format duration from milliseconds to human readable
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
  }
  
  return symbols[currency] || currency
}

/**
 * Parse a formatted currency string back to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Format account balance with appropriate precision
 */
export function formatAccountBalance(value: number, options: FormatOptions = {}): string {
  // For larger amounts, show less decimal places
  if (Math.abs(value) >= 10000) {
    return formatCurrency(value, { ...options, maximumFractionDigits: 0 })
  } else if (Math.abs(value) >= 1000) {
    return formatCurrency(value, { ...options, maximumFractionDigits: 1 })
  } else {
    return formatCurrency(value, { ...options, maximumFractionDigits: 2 })
  }
}

/**
 * Format win rate percentage
 */
export function formatWinRate(winningTrades: number, totalTrades: number): string {
  if (totalTrades === 0) return '0.0%'
  const rate = (winningTrades / totalTrades) * 100
  return formatPercentage(rate, { maximumFractionDigits: 1 })
}

/**
 * Format return on investment (ROI)
 */
export function formatROI(profit: number, initialInvestment: number): string {
  if (initialInvestment === 0) return '0.0%'
  const roi = (profit / initialInvestment) * 100
  return formatPercentage(roi, { maximumFractionDigits: 2 })
}

/**
 * Format risk-reward ratio
 */
export function formatRiskReward(profit: number, loss: number): string {
  if (loss === 0) return '∞'
  const ratio = Math.abs(profit / loss)
  return `1:${formatNumber(ratio, { maximumFractionDigits: 2 })}`
}

/**
 * Format drawdown percentage
 */
export function formatDrawdown(peak: number, valley: number): string {
  if (peak === 0) return '0.0%'
  const drawdown = ((peak - valley) / peak) * 100
  return formatPercentage(drawdown, { maximumFractionDigits: 2 })
}

/**
 * Format profit factor with color coding
 */
export function formatProfitFactor(
  profitFactor: number,
  options: { showColor?: boolean } = {}
): { value: string; className?: string } {
  const value = formatNumber(profitFactor, { maximumFractionDigits: 2 })
  
  if (!options.showColor) {
    return { value }
  }
  
  let className = 'text-text-secondary'
  if (profitFactor >= 2) className = 'text-profit'
  else if (profitFactor >= 1.5) className = 'text-success'
  else if (profitFactor >= 1) className = 'text-warning'
  else className = 'text-loss'
  
  return { value, className }
}
