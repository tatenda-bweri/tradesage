import { TradeRecord, AccountInfo, ImportResult } from '@/lib/types'

interface ExnessTradeData {
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
  linkedTrades?: string[]
}

interface ExnessAccountData {
  accountNumber: string
  broker: string
  currency: string
  balance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
}

export class ExnessParser {
  private htmlContent: string

  constructor(htmlContent: string) {
    this.htmlContent = htmlContent
  }

  /**
   * Parse Exness HTML statement and extract all data
   */
  async parse(): Promise<ImportResult> {
    try {
      const accountInfo = this.extractAccountInfo()
      const trades = this.extractTrades()
      const linkedTrades = this.linkTrades(trades)

      return {
        success: true,
        trades: linkedTrades,
        errors: [],
        warnings: []
      }
    } catch (error) {
      return {
        success: false,
        trades: [],
        errors: [`Failed to parse Exness statement: ${error}`],
        warnings: []
      }
    }
  }

  /**
   * Extract account information from HTML
   */
  private extractAccountInfo(): ExnessAccountData {
    // Parse account details from HTML
    const accountMatch = this.htmlContent.match(/Account:\s*(\d+)/i)
    const balanceMatch = this.htmlContent.match(/Balance:\s*([\d,]+\.?\d*)/i)
    const equityMatch = this.htmlContent.match(/Equity:\s*([\d,]+\.?\d*)/i)
    const currencyMatch = this.htmlContent.match(/Currency:\s*([A-Z]{3})/i)

    return {
      accountNumber: accountMatch?.[1] || '',
      broker: 'Exness Technologies Ltd',
      currency: currencyMatch?.[1] || 'USD',
      balance: parseFloat(balanceMatch?.[1]?.replace(/,/g, '') || '0'),
      equity: parseFloat(equityMatch?.[1]?.replace(/,/g, '') || '0'),
      margin: 0, // Will be calculated
      freeMargin: 0, // Will be calculated
      marginLevel: 0 // Will be calculated
    }
  }

  /**
   * Extract trades from HTML table
   */
  private extractTrades(): ExnessTradeData[] {
    const trades: ExnessTradeData[] = []
    
    // Find trade table in HTML
    const tableMatch = this.htmlContent.match(/<table[^>]*class="[^"]*trades[^"]*"[^>]*>(.*?)<\/table>/is)
    if (!tableMatch) return trades

    const tableContent = tableMatch[1]
    const rowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gis)
    
    if (!rowMatches) return trades

    for (const row of rowMatches) {
      const trade = this.parseTradeRow(row)
      if (trade) {
        trades.push(trade)
      }
    }

    return trades
  }

  /**
   * Parse individual trade row
   */
  private parseTradeRow(rowHtml: string): ExnessTradeData | null {
    // Extract data from table cells
    const cellMatches = rowHtml.match(/<td[^>]*>(.*?)<\/td>/gis)
    if (!cellMatches || cellMatches.length < 8) return null

    const cells = cellMatches.map(cell => this.cleanHtml(cell))

    try {
      return {
        ticketId: cells[0] || '',
        symbol: cells[1] || '',
        type: cells[2]?.toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
        volume: parseFloat(cells[3] || '0'),
        openPrice: parseFloat(cells[4] || '0'),
        closePrice: parseFloat(cells[5] || '0'),
        openTime: this.parseDateTime(cells[6] || ''),
        closeTime: this.parseDateTime(cells[7] || ''),
        profit: parseFloat(cells[8] || '0'),
        swap: parseFloat(cells[9] || '0'),
        commission: parseFloat(cells[10] || '0'),
        stopLoss: cells[11] ? parseFloat(cells[11]) : undefined,
        takeProfit: cells[12] ? parseFloat(cells[12]) : undefined,
        linkedTrades: this.extractLinkedTrades(cells[13] || '')
      }
    } catch (error) {
      console.warn('Failed to parse trade row:', error)
      return null
    }
  }

  /**
   * Extract linked trades from "to #" and "from #" references
   */
  private extractLinkedTrades(linkedText: string): string[] {
    const linkedTrades: string[] = []
    
    // Find "to #" references
    const toMatches = linkedText.match(/to\s+#(\d+)/gi)
    if (toMatches) {
      linkedTrades.push(...toMatches.map(match => match.replace(/to\s+#/i, '')))
    }

    // Find "from #" references
    const fromMatches = linkedText.match(/from\s+#(\d+)/gi)
    if (fromMatches) {
      linkedTrades.push(...fromMatches.map(match => match.replace(/from\s+#/i, '')))
    }

    return linkedTrades
  }

  /**
   * Link trades based on "to #" and "from #" references
   */
  private linkTrades(trades: ExnessTradeData[]): TradeRecord[] {
    const tradeMap = new Map<string, ExnessTradeData>()
    const linkedTradesMap = new Map<string, string[]>()

    // Create map of trades by ticket ID
    trades.forEach(trade => {
      tradeMap.set(trade.ticketId, trade)
    })

    // Build linked trades relationships
    trades.forEach(trade => {
      if (trade.linkedTrades && trade.linkedTrades.length > 0) {
        linkedTradesMap.set(trade.ticketId, trade.linkedTrades)
      }
    })

    // Convert to TradeRecord format
    return trades.map(trade => ({
      id: `exness_${trade.ticketId}`,
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
      linkedTrades: linkedTradesMap.get(trade.ticketId) || [],
      tags: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  }

  /**
   * Clean HTML tags from text
   */
  private cleanHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  /**
   * Parse date time string to ISO format
   */
  private parseDateTime(dateTimeStr: string): string {
    // Handle various Exness date formats
    const dateMatch = dateTimeStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/)
    if (dateMatch) {
      const [, day, month, year, hour, minute, second] = dateMatch
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}:${second}`
    }
    
    // Fallback to current date if parsing fails
    return new Date().toISOString()
  }

  /**
   * Detect SL/TP execution
   */
  private detectSLTPExecution(trade: ExnessTradeData): boolean {
    // Check if trade was closed by SL/TP
    if (trade.stopLoss && trade.closePrice === trade.stopLoss) return true
    if (trade.takeProfit && trade.closePrice === trade.takeProfit) return true
    return false
  }
}

export default ExnessParser 