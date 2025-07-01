import { TradeRecord, ImportResult } from '@/lib/types'

interface MetaTraderTradeData {
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

export class MetaTraderParser {
  private csvContent: string
  private headers: string[]

  constructor(csvContent: string) {
    this.csvContent = csvContent
    this.headers = []
  }

  /**
   * Parse MetaTrader CSV statement and extract all data
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
      
      // Parse trades
      const trades: MetaTraderTradeData[] = []
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
        id: `mt_${trade.ticketId}`,
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
        errors: [`Failed to parse MetaTrader CSV: ${error}`],
        warnings: []
      }
    }
  }

  /**
   * Parse CSV headers and map to expected columns
   */
  private parseHeaders(headerLine: string): string[] {
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Validate required headers
    const requiredHeaders = ['Ticket', 'Symbol', 'Type', 'Volume', 'Open Price', 'Close Price', 'Open Time', 'Close Time', 'Profit']
    const missingHeaders = requiredHeaders.filter(required => 
      !headers.some(header => 
        header.toLowerCase().includes(required.toLowerCase().replace(' ', ''))
      )
    )

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    return headers
  }

  /**
   * Parse individual trade row
   */
  private parseTradeRow(rowLine: string, rowNumber: number): MetaTraderTradeData | null {
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
        ticketId: this.extractValue(row, ['Ticket', 'Order', 'Order ID']),
        symbol: this.extractValue(row, ['Symbol', 'Instrument', 'Pair']),
        type: this.extractType(row),
        volume: parseFloat(this.extractValue(row, ['Volume', 'Size', 'Lots'])),
        openPrice: parseFloat(this.extractValue(row, ['Open Price', 'Open', 'Entry Price'])),
        closePrice: parseFloat(this.extractValue(row, ['Close Price', 'Close', 'Exit Price'])),
        openTime: this.parseDateTime(this.extractValue(row, ['Open Time', 'Open Date', 'Entry Time'])),
        closeTime: this.parseDateTime(this.extractValue(row, ['Close Time', 'Close Date', 'Exit Time'])),
        profit: parseFloat(this.extractValue(row, ['Profit', 'P&L', 'Net Profit'])),
        swap: parseFloat(this.extractValue(row, ['Swap', 'Interest', 'Rollover']) || '0'),
        commission: parseFloat(this.extractValue(row, ['Commission', 'Fee']) || '0'),
        stopLoss: this.extractOptionalNumber(row, ['Stop Loss', 'SL']),
        takeProfit: this.extractOptionalNumber(row, ['Take Profit', 'TP'])
      }
    } catch (error) {
      throw new Error(`Invalid data in row ${rowNumber}: ${error}`)
    }
  }

  /**
   * Extract value from row using multiple possible header names
   */
  private extractValue(row: any, possibleHeaders: string[]): string {
    for (const header of possibleHeaders) {
      if (row[header] !== undefined && row[header] !== '') {
        return row[header].toString().trim()
      }
    }
    throw new Error(`Could not find value for headers: ${possibleHeaders.join(', ')}`)
  }

  /**
   * Extract trade type (BUY/SELL)
   */
  private extractType(row: any): 'BUY' | 'SELL' {
    const typeValue = this.extractValue(row, ['Type', 'Direction', 'Side']).toLowerCase()
    
    if (typeValue.includes('buy') || typeValue.includes('long')) {
      return 'BUY'
    } else if (typeValue.includes('sell') || typeValue.includes('short')) {
      return 'SELL'
    } else {
      throw new Error(`Invalid trade type: ${typeValue}`)
    }
  }

  /**
   * Extract optional number value
   */
  private extractOptionalNumber(row: any, possibleHeaders: string[]): number | undefined {
    try {
      const value = this.extractValue(row, possibleHeaders)
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
    // Handle various MetaTrader date formats
    const formats = [
      'yyyy.MM.dd HH:mm:ss',
      'dd.MM.yyyy HH:mm:ss',
      'MM/dd/yyyy HH:mm:ss',
      'yyyy-MM-dd HH:mm:ss',
      'dd/MM/yyyy HH:mm:ss'
    ]

    for (const format of formats) {
      try {
        // Simple date parsing - in production, use a proper date library
        const date = new Date(dateTimeStr)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      } catch {
        continue
      }
    }

    throw new Error(`Unable to parse date: ${dateTimeStr}`)
  }
} 