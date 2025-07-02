import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { AnalyticsCache } from '@/lib/database/analytics-cache'
import { serializeDates } from '@/lib/utils/dateUtils'
import { withErrorHandler } from '@/lib/middleware/errorHandler'
import { z } from 'zod'

const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(100),
  includeSymbols: z.string().transform(val => val === 'true').default(false)
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    // Check authentication
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.accountId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const query = analyticsQuerySchema.parse(req.query)
    const { startDate, endDate, page, limit, includeSymbols } = query
    const accountId = session.user.accountId

    try {
      const filters = {
        accountId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }

      // Fetch analytics data using optimized queries with caching
      const [metrics, temporalAnalysis, dailyPnL, symbolStats] = await Promise.all([
        AnalyticsCache.getPerformanceMetrics(filters),
        AnalyticsCache.getTemporalAnalysis(filters),
        AnalyticsCache.getDailyPnLData(filters, page, limit),
        includeSymbols ? AnalyticsCache.getSymbolStats(filters) : Promise.resolve([])
      ])

      // Add cache headers for client-side caching
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600') // 5min cache, 10min stale

      const response = {
        metrics: serializeDates(metrics),
        temporalAnalysis: serializeDates(temporalAnalysis),
        dailyPnL: serializeDates(dailyPnL),
        ...(includeSymbols && { symbolStats: serializeDates(symbolStats) }),
        pagination: {
          page,
          limit,
          hasMore: dailyPnL.length === limit
        },
        cached: true // Indicate this response may be cached
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Analytics performance error:', error)
      res.status(500).json({ 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default withErrorHandler(handler) 