import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch paginated trades
    const { page = '1', pageSize = '20', accountId } = req.query
    const pageNum = parseInt(page as string, 10) || 1
    const sizeNum = parseInt(pageSize as string, 10) || 20
    const skip = (pageNum - 1) * sizeNum
    try {
      const where = accountId ? { accountId: accountId as string } : {}
      const [trades, total] = await Promise.all([
        prisma.trade.findMany({
          where,
          orderBy: { openTime: 'desc' },
          skip,
          take: sizeNum
        }),
        prisma.trade.count({ where })
      ])
      res.status(200).json({ trades, total, page: pageNum, pageSize: sizeNum })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trades', details: error })
    }
  } else if (req.method === 'POST') {
    // Create a new trade
    try {
      const {
        ticketId, accountId, symbol, type, volume, openPrice, closePrice,
        openTime, closeTime, profit, swap, commission, stopLoss, takeProfit,
        linkedTrades, tags, notes
      } = req.body
      if (!ticketId || !accountId || !symbol || !type || !openTime || !closeTime) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      const trade = await prisma.trade.create({
        data: {
          ticketId,
          accountId,
          symbol,
          type,
          volume: Number(volume),
          openPrice: Number(openPrice),
          closePrice: Number(closePrice),
          openTime: new Date(openTime),
          closeTime: new Date(closeTime),
          profit: Number(profit),
          swap: Number(swap) || 0,
          commission: Number(commission) || 0,
          stopLoss: stopLoss !== undefined ? Number(stopLoss) : undefined,
          takeProfit: takeProfit !== undefined ? Number(takeProfit) : undefined,
          linkedTrades: linkedTrades ? JSON.stringify(linkedTrades) : undefined,
          tags: tags ? JSON.stringify(tags) : undefined,
          notes: notes || undefined
        }
      })
      res.status(201).json({ trade })
    } catch (error) {
      res.status(500).json({ error: 'Failed to create trade', details: error })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 