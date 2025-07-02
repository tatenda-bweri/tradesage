import { prisma } from '@/lib/database/client'
import { Prisma } from '@prisma/client'

interface AnalyticsFilters {
  accountId: string
  startDate?: Date
  endDate?: Date
}

interface PerformanceMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  largestWin: number
  largestLoss: number
  averageTrade: number
  expectancy: number
  riskRewardRatio: number
}

interface TemporalAnalysis {
  dailyDistribution: number[]
  monthlyDistribution: number[]
  hourlyDistribution: number[]
}

export class AnalyticsQueries {
  /**
   * Get performance metrics using optimized database aggregations
   */
  static async getPerformanceMetrics(filters: AnalyticsFilters): Promise<PerformanceMetrics> {
    const whereClause = this.buildWhereClause(filters)

    // Use database aggregations for better performance
    const [
      basicStats,
      winLossStats,
      extremeValues
    ] = await Promise.all([
      // Basic trade statistics
      prisma.trade.aggregate({
        where: whereClause,
        _count: { id: true },
        _sum: { profit: true },
        _avg: { profit: true }
      }),

      // Win/Loss breakdown
      prisma.$transaction([
        prisma.trade.aggregate({
          where: { ...whereClause, profit: { gt: 0 } },
          _count: { id: true },
          _sum: { profit: true },
          _avg: { profit: true }
        }),
        prisma.trade.aggregate({
          where: { ...whereClause, profit: { lt: 0 } },
          _count: { id: true },
          _sum: { profit: true },
          _avg: { profit: true }
        })
      ]),

      // Extreme values
      prisma.trade.aggregate({
        where: whereClause,
        _max: { profit: true },
        _min: { profit: true }
      })
    ])

    const [winStats, lossStats] = winLossStats

    const totalTrades = basicStats._count.id
    const winningTrades = winStats._count.id
    const losingTrades = lossStats._count.id
    const totalPnL = basicStats._sum.profit || 0
    
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const averageWin = winStats._avg.profit || 0
    const averageLoss = Math.abs(lossStats._avg.profit || 0)
    const profitFactor = averageLoss > 0 ? (averageWin * winningTrades) / (averageLoss * losingTrades) : 0
    const largestWin = extremeValues._max.profit || 0
    const largestLoss = extremeValues._min.profit || 0
    const averageTrade = basicStats._avg.profit || 0
    const expectancy = (winRate / 100) * averageWin - ((1 - winRate / 100) * averageLoss)
    const riskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0

    // Calculate drawdown (still requires sequential processing but optimized query)
    const maxDrawdown = await this.calculateMaxDrawdown(filters)
    
    // Calculate Sharpe ratio
    const sharpeRatio = await this.calculateSharpeRatio(filters)

    return {
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
  }

  /**
   * Get temporal analysis with database aggregations
   */
  static async getTemporalAnalysis(filters: AnalyticsFilters): Promise<TemporalAnalysis> {
    const whereClause = this.buildWhereClause(filters)

    // Use raw SQL for temporal aggregations
    const [dailyData, monthlyData, hourlyData] = await Promise.all([
      // Daily distribution
      prisma.$queryRaw<Array<{ day_of_week: number; count: number }>>`
        SELECT EXTRACT(DOW FROM "openTime") as day_of_week, COUNT(*)::int as count
        FROM "Trade"
        WHERE "accountId" = ${filters.accountId}
        ${filters.startDate ? Prisma.sql`AND "openTime" >= ${filters.startDate}` : Prisma.empty}
        ${filters.endDate ? Prisma.sql`AND "openTime" <= ${filters.endDate}` : Prisma.empty}
        GROUP BY EXTRACT(DOW FROM "openTime")
        ORDER BY day_of_week
      `,

      // Monthly distribution
      prisma.$queryRaw<Array<{ month: number; count: number }>>`
        SELECT EXTRACT(MONTH FROM "openTime") as month, COUNT(*)::int as count
        FROM "Trade"
        WHERE "accountId" = ${filters.accountId}
        ${filters.startDate ? Prisma.sql`AND "openTime" >= ${filters.startDate}` : Prisma.empty}
        ${filters.endDate ? Prisma.sql`AND "openTime" <= ${filters.endDate}` : Prisma.empty}
        GROUP BY EXTRACT(MONTH FROM "openTime")
        ORDER BY month
      `,

      // Hourly distribution
      prisma.$queryRaw<Array<{ hour: number; count: number }>>`
        SELECT EXTRACT(HOUR FROM "openTime") as hour, COUNT(*)::int as count
        FROM "Trade"
        WHERE "accountId" = ${filters.accountId}
        ${filters.startDate ? Prisma.sql`AND "openTime" >= ${filters.startDate}` : Prisma.empty}
        ${filters.endDate ? Prisma.sql`AND "openTime" <= ${filters.endDate}` : Prisma.empty}
        GROUP BY EXTRACT(HOUR FROM "openTime")
        ORDER BY hour
      `
    ])

    // Convert to arrays
    const dailyDistribution = new Array(7).fill(0)
    const monthlyDistribution = new Array(12).fill(0)
    const hourlyDistribution = new Array(24).fill(0)

    dailyData.forEach(row => {
      dailyDistribution[row.day_of_week] = row.count
    })

    monthlyData.forEach(row => {
      monthlyDistribution[row.month - 1] = row.count // Month is 1-indexed
    })

    hourlyData.forEach(row => {
      hourlyDistribution[row.hour] = row.count
    })

    return {
      dailyDistribution,
      monthlyDistribution,
      hourlyDistribution
    }
  }

  /**
   * Get daily P&L data for charts with pagination
   */
  static async getDailyPnLData(
    filters: AnalyticsFilters,
    page: number = 1,
    limit: number = 100
  ) {
    const whereClause = this.buildWhereClause(filters)
    const skip = (page - 1) * limit

    const dailyPnL = await prisma.$queryRaw<Array<{
      date: Date
      daily_pnl: number
      trade_count: number
    }>>`
      SELECT 
        DATE("openTime") as date,
        SUM("profit")::float as daily_pnl,
        COUNT(*)::int as trade_count
      FROM "Trade"
      WHERE "accountId" = ${filters.accountId}
      ${filters.startDate ? Prisma.sql`AND "openTime" >= ${filters.startDate}` : Prisma.empty}
      ${filters.endDate ? Prisma.sql`AND "openTime" <= ${filters.endDate}` : Prisma.empty}
      GROUP BY DATE("openTime")
      ORDER BY date DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `

    return dailyPnL.map(row => ({
      date: row.date.toISOString().split('T')[0],
      dailyPnL: row.daily_pnl,
      tradeCount: row.trade_count
    }))
  }

  /**
   * Get symbol performance statistics
   */
  static async getSymbolStats(filters: AnalyticsFilters) {
    const whereClause = this.buildWhereClause(filters)

    const symbolStats = await prisma.$queryRaw<Array<{
      symbol: string
      trade_count: number
      total_pnl: number
      avg_pnl: number
      win_rate: number
    }>>`
      SELECT 
        "symbol",
        COUNT(*)::int as trade_count,
        SUM("profit")::float as total_pnl,
        AVG("profit")::float as avg_pnl,
        (COUNT(CASE WHEN "profit" > 0 THEN 1 END)::float / COUNT(*)::float * 100) as win_rate
      FROM "Trade"
      WHERE "accountId" = ${filters.accountId}
      ${filters.startDate ? Prisma.sql`AND "openTime" >= ${filters.startDate}` : Prisma.empty}
      ${filters.endDate ? Prisma.sql`AND "openTime" <= ${filters.endDate}` : Prisma.empty}
      GROUP BY "symbol"
      ORDER BY total_pnl DESC
    `

    return symbolStats.map(row => ({
      symbol: row.symbol,
      tradeCount: row.trade_count,
      totalPnL: row.total_pnl,
      avgPnL: row.avg_pnl,
      winRate: row.win_rate
    }))
  }

  /**
   * Build where clause for queries
   */
  private static buildWhereClause(filters: AnalyticsFilters) {
    const where: any = { accountId: filters.accountId }
    
    if (filters.startDate || filters.endDate) {
      where.openTime = {}
      if (filters.startDate) where.openTime.gte = filters.startDate
      if (filters.endDate) where.openTime.lte = filters.endDate
    }

    return where
  }

  /**
   * Calculate maximum drawdown
   */
  private static async calculateMaxDrawdown(filters: AnalyticsFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters)

    // Get trades ordered by time for sequential processing
    const trades = await prisma.trade.findMany({
      where: whereClause,
      select: { profit: true },
      orderBy: { openTime: 'asc' }
    })

    let maxDrawdown = 0
    let peak = 0
    let runningPnL = 0

    for (const trade of trades) {
      runningPnL += trade.profit
      if (runningPnL > peak) {
        peak = runningPnL
      }
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    return maxDrawdown
  }

  /**
   * Calculate Sharpe ratio
   */
  private static async calculateSharpeRatio(filters: AnalyticsFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters)

    const trades = await prisma.trade.findMany({
      where: whereClause,
      select: { profit: true }
    })

    if (trades.length < 2) return 0

    const returns = trades.map(t => t.profit)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    const stdDev = Math.sqrt(variance)

    return stdDev > 0 ? meanReturn / stdDev : 0
  }
}
