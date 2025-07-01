import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { Parser } from 'json2csv'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { accountId } = req.query

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' })
    }

    const trades = await prisma.trade.findMany({
      where: { accountId: accountId as string },
      orderBy: { openTime: 'asc' }
    })

    if (trades.length === 0) {
      return res.status(404).json({ error: 'No trades found' })
    }

    // Convert to CSV
    const fields = [
      'ticketId',
      'symbol',
      'type',
      'volume',
      'openPrice',
      'closePrice',
      'openTime',
      'closeTime',
      'profit',
      'swap',
      'commission'
    ]
    const parser = new Parser({ fields })
    const csv = parser.parse(trades)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="trades.csv"')
    res.status(200).send(csv)
  } catch (error) {
    console.error('Export trades error:', error)
    res.status(500).json({ error: 'Failed to export trades' })
  }
} 