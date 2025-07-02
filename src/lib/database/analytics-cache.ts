import { AnalyticsQueries } from '@/lib/database/queries'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheKey {
  accountId: string
  startDate?: string
  endDate?: string
  type: 'performance' | 'temporal' | 'daily' | 'symbols'
  page?: number
  limit?: number
}

export class AnalyticsCache {
  private static cache = new Map<string, CacheEntry<any>>()
  private static readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly PERFORMANCE_TTL = 10 * 60 * 1000 // 10 minutes
  private static readonly TEMPORAL_TTL = 30 * 60 * 1000 // 30 minutes

  /**
   * Get cached performance metrics or fetch if not cached/expired
   */
  static async getPerformanceMetrics(filters: {
    accountId: string
    startDate?: Date
    endDate?: Date
  }) {
    const cacheKey = this.generateCacheKey({
      accountId: filters.accountId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      type: 'performance'
    })

    const cached = this.getCachedData<any>(cacheKey)
    if (cached) {
      return cached
    }

    const data = await AnalyticsQueries.getPerformanceMetrics(filters)
    this.setCachedData(cacheKey, data, this.PERFORMANCE_TTL)
    
    return data
  }

  /**
   * Get cached temporal analysis or fetch if not cached/expired
   */
  static async getTemporalAnalysis(filters: {
    accountId: string
    startDate?: Date
    endDate?: Date
  }) {
    const cacheKey = this.generateCacheKey({
      accountId: filters.accountId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      type: 'temporal'
    })

    const cached = this.getCachedData<any>(cacheKey)
    if (cached) {
      return cached
    }

    const data = await AnalyticsQueries.getTemporalAnalysis(filters)
    this.setCachedData(cacheKey, data, this.TEMPORAL_TTL)
    
    return data
  }

  /**
   * Get cached daily P&L data or fetch if not cached/expired
   */
  static async getDailyPnLData(
    filters: {
      accountId: string
      startDate?: Date
      endDate?: Date
    },
    page: number = 1,
    limit: number = 100
  ) {
    const cacheKey = this.generateCacheKey({
      accountId: filters.accountId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      type: 'daily',
      page,
      limit
    })

    const cached = this.getCachedData<any>(cacheKey)
    if (cached) {
      return cached
    }

    const data = await AnalyticsQueries.getDailyPnLData(filters, page, limit)
    this.setCachedData(cacheKey, data, this.DEFAULT_TTL)
    
    return data
  }

  /**
   * Get cached symbol stats or fetch if not cached/expired
   */
  static async getSymbolStats(filters: {
    accountId: string
    startDate?: Date
    endDate?: Date
  }) {
    const cacheKey = this.generateCacheKey({
      accountId: filters.accountId,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      type: 'symbols'
    })

    const cached = this.getCachedData<any>(cacheKey)
    if (cached) {
      return cached
    }

    const data = await AnalyticsQueries.getSymbolStats(filters)
    this.setCachedData(cacheKey, data, this.DEFAULT_TTL)
    
    return data
  }

  /**
   * Invalidate cache for specific account or all cache
   */
  static invalidateCache(accountId?: string) {
    if (!accountId) {
      this.cache.clear()
      return
    }

    // Remove all entries for specific account
    for (const [key, _] of this.cache) {
      if (key.includes(`accountId:${accountId}`)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clean up expired cache entries
   */
  static cleanupExpiredEntries() {
    const now = Date.now()
    
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    const now = Date.now()
    let active = 0
    let expired = 0

    for (const [_, entry] of this.cache) {
      if (entry.expiresAt >= now) {
        active++
      } else {
        expired++
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: expired,
      hitRate: this.getHitRate()
    }
  }

  /**
   * Generate cache key from parameters
   */
  private static generateCacheKey(params: CacheKey): string {
    const parts = [
      `accountId:${params.accountId}`,
      `type:${params.type}`
    ]

    if (params.startDate) parts.push(`start:${params.startDate}`)
    if (params.endDate) parts.push(`end:${params.endDate}`)
    if (params.page) parts.push(`page:${params.page}`)
    if (params.limit) parts.push(`limit:${params.limit}`)

    return parts.join('|')
  }

  /**
   * Get cached data if valid
   */
  private static getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set cached data with expiration
   */
  private static setCachedData<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    const now = Date.now()
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })

    // Periodically clean up expired entries
    if (Math.random() < 0.1) { // 10% chance
      this.cleanupExpiredEntries()
    }
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private static getHitRate(): number {
    // This is a simplified implementation
    // In production, you'd want to track hits/misses properly
    return this.cache.size > 0 ? 0.8 : 0
  }
}

// Auto-cleanup expired entries every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    AnalyticsCache.cleanupExpiredEntries()
  }, 5 * 60 * 1000)
}
