import { ExnessParser } from '../exness-parser'

describe('ExnessParser', () => {
  const sampleHTML = `
    <html>
      <body>
        <table>
          <tr>
            <td>Ticket</td>
            <td>Symbol</td>
            <td>Type</td>
            <td>Volume</td>
            <td>Open Price</td>
            <td>Close Price</td>
            <td>Open Time</td>
            <td>Close Time</td>
            <td>Profit</td>
          </tr>
          <tr>
            <td>12345</td>
            <td>EURUSD</td>
            <td>BUY</td>
            <td>0.1</td>
            <td>1.0850</td>
            <td>1.0870</td>
            <td>2024-01-15 10:30:00</td>
            <td>2024-01-15 11:45:00</td>
            <td>20.00</td>
          </tr>
          <tr>
            <td>12346</td>
            <td>GBPUSD</td>
            <td>SELL</td>
            <td>0.05</td>
            <td>1.2650</td>
            <td>1.2630</td>
            <td>2024-01-15 14:20:00</td>
            <td>2024-01-15 15:30:00</td>
            <td>-10.00</td>
          </tr>
        </table>
      </body>
    </html>
  `

  const malformedHTML = `
    <html>
      <body>
        <div>No table found</div>
      </body>
    </html>
  `

  describe('parse', () => {
    it('should successfully parse valid Exness HTML', async () => {
      const parser = new ExnessParser(sampleHTML)
      const result = await parser.parse()

      expect(result.success).toBe(true)
      expect(result.trades).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)

      const firstTrade = result.trades[0]
      expect(firstTrade.ticketId).toBe('12345')
      expect(firstTrade.symbol).toBe('EURUSD')
      expect(firstTrade.type).toBe('BUY')
      expect(firstTrade.volume).toBe(0.1)
      expect(firstTrade.openPrice).toBe(1.0850)
      expect(firstTrade.closePrice).toBe(1.0870)
      expect(firstTrade.profit).toBe(20.00)
    })

    it('should handle malformed HTML gracefully', async () => {
      const parser = new ExnessParser(malformedHTML)
      const result = await parser.parse()

      expect(result.success).toBe(false)
      expect(result.trades).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle empty HTML', async () => {
      const parser = new ExnessParser('')
      const result = await parser.parse()

      expect(result.success).toBe(false)
      expect(result.trades).toHaveLength(0)
      expect(result.errors).toContain('No table found in HTML')
    })

    it('should handle HTML with no trade data', async () => {
      const emptyTableHTML = `
        <html>
          <body>
            <table>
              <tr>
                <td>Ticket</td>
                <td>Symbol</td>
                <td>Type</td>
                <td>Volume</td>
                <td>Open Price</td>
                <td>Close Price</td>
                <td>Open Time</td>
                <td>Close Time</td>
                <td>Profit</td>
              </tr>
            </table>
          </body>
        </html>
      `

      const parser = new ExnessParser(emptyTableHTML)
      const result = await parser.parse()

      expect(result.success).toBe(true)
      expect(result.trades).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle missing required columns', async () => {
      const incompleteHTML = `
        <html>
          <body>
            <table>
              <tr>
                <td>Ticket</td>
                <td>Symbol</td>
                <!-- Missing other required columns -->
              </tr>
              <tr>
                <td>12345</td>
                <td>EURUSD</td>
              </tr>
            </table>
          </body>
        </html>
      `

      const parser = new ExnessParser(incompleteHTML)
      const result = await parser.parse()

      expect(result.success).toBe(false)
      expect(result.trades).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle invalid numeric values', async () => {
      const invalidNumericHTML = `
        <html>
          <body>
            <table>
              <tr>
                <td>Ticket</td>
                <td>Symbol</td>
                <td>Type</td>
                <td>Volume</td>
                <td>Open Price</td>
                <td>Close Price</td>
                <td>Open Time</td>
                <td>Close Time</td>
                <td>Profit</td>
              </tr>
              <tr>
                <td>12345</td>
                <td>EURUSD</td>
                <td>BUY</td>
                <td>invalid</td>
                <td>1.0850</td>
                <td>1.0870</td>
                <td>2024-01-15 10:30:00</td>
                <td>2024-01-15 11:45:00</td>
                <td>20.00</td>
              </tr>
            </table>
          </body>
        </html>
      `

      const parser = new ExnessParser(invalidNumericHTML)
      const result = await parser.parse()

      expect(result.success).toBe(false)
      expect(result.trades).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle invalid date formats', async () => {
      const invalidDateHTML = `
        <html>
          <body>
            <table>
              <tr>
                <td>Ticket</td>
                <td>Symbol</td>
                <td>Type</td>
                <td>Volume</td>
                <td>Open Price</td>
                <td>Close Price</td>
                <td>Open Time</td>
                <td>Close Time</td>
                <td>Profit</td>
              </tr>
              <tr>
                <td>12345</td>
                <td>EURUSD</td>
                <td>BUY</td>
                <td>0.1</td>
                <td>1.0850</td>
                <td>1.0870</td>
                <td>invalid-date</td>
                <td>2024-01-15 11:45:00</td>
                <td>20.00</td>
              </tr>
            </table>
          </body>
        </html>
      `

      const parser = new ExnessParser(invalidDateHTML)
      const result = await parser.parse()

      expect(result.success).toBe(false)
      expect(result.trades).toHaveLength(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('parseTradeRow', () => {
    it('should correctly parse a valid trade row', () => {
      const parser = new ExnessParser(sampleHTML)
      const rowHtml = '<tr><td>12345</td><td>EURUSD</td><td>BUY</td><td>0.1</td><td>1.0850</td><td>1.0870</td><td>2024-01-15 10:30:00</td><td>2024-01-15 11:45:00</td><td>20.00</td></tr>'
      
      const trade = parser['parseTradeRow'](rowHtml)
      
      expect(trade).toEqual({
        ticketId: '12345',
        symbol: 'EURUSD',
        type: 'BUY',
        volume: 0.1,
        openPrice: 1.0850,
        closePrice: 1.0870,
        openTime: expect.any(String),
        closeTime: expect.any(String),
        profit: 20.00,
        swap: 0,
        commission: 0,
        linkedTrades: []
      })
    })

    it('should handle SELL trades correctly', () => {
      const parser = new ExnessParser(sampleHTML)
      const rowHtml = '<tr><td>12346</td><td>GBPUSD</td><td>SELL</td><td>0.05</td><td>1.2650</td><td>1.2630</td><td>2024-01-15 14:20:00</td><td>2024-01-15 15:30:00</td><td>-10.00</td></tr>'
      
      const trade = parser['parseTradeRow'](rowHtml)
      
      expect(trade?.type).toBe('SELL')
      expect(trade?.profit).toBe(-10.00)
    })
  })

  describe('parseDateTime', () => {
    it('should parse various date formats', () => {
      const parser = new ExnessParser(sampleHTML)
      
      const formats = [
        '2024-01-15 10:30:00',
        '2024/01/15 10:30:00',
        '15.01.2024 10:30:00',
        '01/15/2024 10:30:00'
      ]

      formats.forEach(dateStr => {
        const result = parser['parseDateTime'](dateStr)
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })
    })

    it('should throw error for invalid date format', () => {
      const parser = new ExnessParser(sampleHTML)
      
      expect(() => {
        parser['parseDateTime']('invalid-date')
      }).toThrow('Unable to parse date')
    })
  })
}) 