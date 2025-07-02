import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/database/client'
import { serializeDates } from '@/lib/utils/dateUtils'
import { withErrorHandler, ValidationError } from '@/lib/middleware/errorHandler'
import { createTradeSchema, tradesQuerySchema } from '@/lib/validation/schemas'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    // Fetch paginated trades
    const query = tradesQuerySchema.parse(req.query)
    const { page, pageSize, accountId, symbol, type, startDate, endDate } = query
    const skip = (page - 1) * pageSize
    
    const where: any = {}
    if (accountId) where.accountId = accountId
    if (symbol) where.symbol = symbol
    if (type) where.type = type
    if (startDate || endDate) {
      where.openTime = {}
      if (startDate) where.openTime.gte = new Date(startDate)
      if (endDate) where.openTime.lte = new Date(endDate)
    }
    
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { openTime: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.trade.count({ where })
    ])
    
    // Serialize dates for JSON response
    const serializedTrades = trades.map(trade => serializeDates(trade))
    
    res.status(200).json({ 
      trades: serializedTrades, 
      total, 
      page, 
      pageSize 
    })
  } else if (req.method === 'POST') {
    // Create a new trade
    const validatedData = createTradeSchema.parse(req.body)
    
    // Check for duplicate ticket ID
    const existingTrade = await prisma.trade.findUnique({
      where: { ticketId: validatedData.ticketId }
    })
    
    if (existingTrade) {
      throw new ValidationError('Trade with this ticket ID already exists')
    }
    
    const trade = await prisma.trade.create({
      data: {
        ticketId: validatedData.ticketId,
        accountId: validatedData.accountId,
        symbol: validatedData.symbol,
        type: validatedData.type,
        volume: validatedData.volume,
        openPrice: validatedData.openPrice,
        closePrice: validatedData.closePrice,
        openTime: new Date(validatedData.openTime),
        closeTime: new Date(validatedData.closeTime),
        profit: validatedData.profit,
        swap: validatedData.swap,
        commission: validatedData.commission,
        stopLoss: validatedData.stopLoss,
        takeProfit: validatedData.takeProfit,
        linkedTrades: JSON.stringify(validatedData.linkedTrades),
        tags: JSON.stringify(validatedData.tags),
        notes: validatedData.notes
      }
    })
    
    res.status(201).json({ trade: serializeDates(trade) })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default withErrorHandler(handler) 