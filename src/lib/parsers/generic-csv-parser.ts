import { TradeRecord, ImportResult } from '@/lib/types'

interface ColumnMapping {
  ticketId: string
  symbol: string
  type: string
  volume: string
  openPrice: string
  closePrice: string
  openTime: string
  closeTime: string
  profit: string
  swap?: string
  commission?: string
  stopLoss?: string
  takeProfit?: string
}

interface GenericCSVTradeData {
  ticketId: string
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  openPrice: number
  closePrice: number
  openTime: string
  closeTime: string
  profit: number
  swap: number
  commission: number
  stopLoss?: number
  takeProfit?: number
}

export class GenericCSVParser {
  private csvContent: string
  private columnMapping: ColumnMapping
  private headers: string[]

  constructor(csvContent: string, columnMapping: ColumnMapping) {
    this.csvContent = csvContent
    this.columnMapping = columnMapping
    this.headers = []
  }

  /**
   * Parse generic CSV statement and extract all data
   */
  async parse(): Promise<ImportResult> {
    try {
      const lines = this.csvContent.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        return {
          success: false,
          trades: [],
          errors: ['CSV file must contain at least a header row and one data row'],
          warnings: []
        }
      }

      // Parse headers
      this.headers = this.parseHeaders(lines[0])
      
      // Validate column mapping
      const validationResult = this.validateColumnMapping()
      if (!validationResult.valid) {
        return {
          success: false,
          trades: [],
          errors: validationResult.errors,
          warnings: []
        }
      }

      // Parse trades
      const trades: GenericCSVTradeData[] = []
      const errors: string[] = []
      const warnings: string[] = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const trade = this.parseTradeRow(lines[i], i + 1)
          if (trade) {
            trades.push(trade)
          }
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error}`)
        }
      }

      // Convert to TradeRecord format
      const tradeRecords: TradeRecord[] = trades.map(trade => ({
        id: `csv_${trade.ticketId}`,
        ticketId: trade.ticketId,
        accountId: '', // Will be set by import process
        symbol: trade.symbol,
        type: trade.type,
        volume: trade.volume,
        openPrice: trade.openPrice,
        closePrice: trade.closePrice,
        openTime: new Date(trade.openTime),
        closeTime: new Date(trade.closeTime),
        profit: trade.profit,
        swap: trade.swap,
        commission: trade.commission,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        linkedTrades: [],
        tags: [],
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      return {
        success: errors.length === 0,
        trades: tradeRecords,
        errors,
        warnings
      }
    } catch (error) {
      return {
        success: false,
        trades: [],
        errors: [`Failed to parse CSV: ${error}`],
        warnings: []
      }
    }
  }

  /**
   * Parse CSV headers
   */
  private parseHeaders(headerLine: string): string[] {
    return headerLine.split(',').map(h => h.trim().replace(/"/g, ''))
  }

  /**
   * Validate that all required columns are present
   */
  private validateColumnMapping(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const requiredColumns = [
      'ticketId', 'symbol', 'type', 'volume', 'openPrice', 
      'closePrice', 'openTime', 'closeTime', 'profit'
    ]

    for (const column of requiredColumns) {
      const mappedColumn = this.columnMapping[column as keyof ColumnMapping]
      if (!mappedColumn || !this.headers.some(header => 
        header.toLowerCase() === mappedColumn.toLowerCase()
      )) {
        errors.push(`Required column '${mappedColumn}' not found in CSV headers`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Parse individual trade row
   */
  private parseTradeRow(rowLine: string, rowNumber: number): GenericCSVTradeData | null {
    const values = this.parseCSVRow(rowLine)
    
    if (values.length !== this.headers.length) {
      throw new Error(`Column count mismatch. Expected ${this.headers.length}, got ${values.length}`)
    }

    const row: any = {}
    this.headers.forEach((header, index) => {
      row[header] = values[index]
    })

    try {
      return {
        ticketId: this.getColumnValue(row, this.columnMapping.ticketId),
        symbol: this.getColumnValue(row, this.columnMapping.symbol),
        type: this.parseTradeType(this.getColumnValue(row, this.columnMapping.type)),
        volume: parseFloat(this.getColumnValue(row, this.columnMapping.volume)),
        openPrice: parseFloat(this.getColumnValue(row, this.columnMapping.openPrice)),
        closePrice: parseFloat(this.getColumnValue(row, this.columnMapping.closePrice)),
        openTime: this.parseDateTime(this.getColumnValue(row, this.columnMapping.openTime)),
        closeTime: this.parseDateTime(this.getColumnValue(row, this.columnMapping.closeTime)),
        profit: parseFloat(this.getColumnValue(row, this.columnMapping.profit)),
        swap: parseFloat(this.getColumnValue(row, this.columnMapping.swap || '') || '0'),
        commission: parseFloat(this.getColumnValue(row, this.columnMapping.commission || '') || '0'),
        stopLoss: this.parseOptionalNumber(row, this.columnMapping.stopLoss),
        takeProfit: this.parseOptionalNumber(row, this.columnMapping.takeProfit)
      }
    } catch (error) {
      throw new Error(`Invalid data in row ${rowNumber}: ${error}`)
    }
  }

  /**
   * Get value from row by column name
   */
  private getColumnValue(row: any, columnName: string): string {
    const value = row[columnName]
    if (value === undefined || value === '') {
      throw new Error(`Missing required value for column: ${columnName}`)
    }
    return value.toString().trim()
  }

  /**
   * Parse trade type
   */
  private parseTradeType(typeValue: string): 'BUY' | 'SELL' {
    const normalized = typeValue.toLowerCase()
    
    if (normalized.includes('buy') || normalized.includes('long') || normalized === 'b') {
      return 'BUY'
    } else if (normalized.includes('sell') || normalized.includes('short') || normalized === 's') {
      return 'SELL'
    } else {
      throw new Error(`Invalid trade type: ${typeValue}`)
    }
  }

  /**
   * Parse optional number value
   */
  private parseOptionalNumber(row: any, columnName?: string): number | undefined {
    if (!columnName) return undefined
    
    try {
      const value = this.getColumnValue(row, columnName)
      return parseFloat(value)
    } catch {
      return undefined
    }
  }

  /**
   * Parse CSV row handling quoted values
   */
  private parseCSVRow(line: string): string[] {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    values.push(current.trim())
    return values
  }

  /**
   * Parse date time string to ISO format
   */
  private parseDateTime(dateTimeStr: string): string {
    // Try to parse the date string
    const date = new Date(dateTimeStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }

    // Try common date formats
    const formats = [
      /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, // MM-DD-YYYY or MM/DD/YYYY
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})/, // MM-DD-YY or MM/DD/YY
    ]

    for (const format of formats) {
      const match = dateTimeStr.match(format)
      if (match) {
        const [, year, month, day] = match
        const fullYear = year.length === 2 ? `20${year}` : year
        const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day))
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      }
    }

    throw new Error(`Unable to parse date: ${dateTimeStr}`)
  }

  /**
   * Get available columns from CSV headers
   */
  static getAvailableColumns(csvContent: string): string[] {
    const lines = csvContent.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []
    
    return lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  }
} 