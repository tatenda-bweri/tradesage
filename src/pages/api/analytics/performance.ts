import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { accountId, startDate, endDate } = req.query
    
    try {
      const where: any = {}
      if (accountId) where.accountId = accountId as string
      if (startDate || endDate) {
        where.openTime = {}
        if (startDate) where.openTime.gte = new Date(startDate as string)
        if (endDate) where.openTime.lte = new Date(endDate as string)
      }

      const trades = await prisma.trade.findMany({
        where,
        orderBy: { openTime: 'asc' }
      })

      if (trades.length === 0) {
        return res.status(200).json({
          metrics: {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            winRate: 0,
            totalPnL: 0,
            averageWin: 0,
            averageLoss: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            largestWin: 0,
            largestLoss: 0,
            averageTrade: 0,
            expectancy: 0,
            riskRewardRatio: 0
          },
          temporalAnalysis: {
            dailyDistribution: [],
            monthlyDistribution: [],
            hourlyDistribution: []
          }
        })
      }

      // Calculate basic metrics
      const totalTrades = trades.length
      const winningTrades = trades.filter((t: any) => t.profit > 0).length
      const losingTrades = totalTrades - winningTrades
      const winRate = (winningTrades / totalTrades) * 100
      const totalPnL = trades.reduce((sum: number, t: any) => sum + t.profit, 0)
      
      const winningTradesData = trades.filter((t: any) => t.profit > 0)
      const losingTradesData = trades.filter((t: any) => t.profit < 0)
      
      const averageWin = winningTradesData.length > 0 
        ? winningTradesData.reduce((sum: number, t: any) => sum + t.profit, 0) / winningTradesData.length 
        : 0
      const averageLoss = losingTradesData.length > 0 
        ? Math.abs(losingTradesData.reduce((sum: number, t: any) => sum + t.profit, 0) / losingTradesData.length)
        : 0
      
      const profitFactor = averageLoss > 0 ? (averageWin * winningTrades) / (averageLoss * losingTrades) : 0
      const largestWin = Math.max(...trades.map((t: any) => t.profit))
      const largestLoss = Math.min(...trades.map((t: any) => t.profit))
      const averageTrade = totalPnL / totalTrades
      const expectancy = (winRate / 100) * averageWin - ((1 - winRate / 100) * averageLoss)
      const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0

      // Calculate max drawdown
      let maxDrawdown = 0
      let peak = 0
      let runningPnL = 0
      
      for (const trade of trades as any[]) {
        runningPnL += trade.profit
        if (runningPnL > peak) {
          peak = runningPnL
        }
        const drawdown = peak - runningPnL
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
        }
      }

      // Calculate Sharpe ratio (simplified)
      const returns = trades.map((t: any) => t.profit)
      const meanReturn = returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length
      const variance = returns.reduce((sum: number, r: number) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
      const stdDev = Math.sqrt(variance)
      const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0

      // Temporal analysis
      const dailyDistribution = new Array(7).fill(0)
      const monthlyDistribution = new Array(12).fill(0)
      const hourlyDistribution = new Array(24).fill(0)

      trades.forEach((trade: any) => {
        const date = new Date(trade.openTime)
        dailyDistribution[date.getDay()]++
        monthlyDistribution[date.getMonth()]++
        hourlyDistribution[date.getHours()]++
      })

      const metrics = {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        totalPnL,
        averageWin,
        averageLoss,
        profitFactor,
        maxDrawdown,
        sharpeRatio,
        largestWin,
        largestLoss,
        averageTrade,
        expectancy,
        riskRewardRatio
      }

      const temporalAnalysis = {
        dailyDistribution,
        monthlyDistribution,
        hourlyDistribution
      }

      res.status(200).json({ metrics, temporalAnalysis })
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate performance metrics', details: error })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 