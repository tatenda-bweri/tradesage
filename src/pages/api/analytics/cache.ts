import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { AnalyticsCache } from '@/lib/database/analytics-cache'
import { withErrorHandler } from '@/lib/middleware/errorHandler'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Check authentication
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.accountId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // Get cache statistics
    const stats = AnalyticsCache.getCacheStats()
    res.status(200).json({ stats })
  } else if (req.method === 'DELETE') {
    // Invalidate cache
    const { accountId } = req.query
    
    if (accountId && typeof accountId === 'string') {
      AnalyticsCache.invalidateCache(accountId)
      res.status(200).json({ message: `Cache invalidated for account ${accountId}` })
    } else {
      AnalyticsCache.invalidateCache()
      res.status(200).json({ message: 'All cache invalidated' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default withErrorHandler(handler)
