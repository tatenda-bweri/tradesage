// Core trading types
export interface TradeRecord {
  id: string
  ticketId: string
  accountId: string
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  openPrice: number
  closePrice: number
  openTime: Date
  closeTime: Date
  profit: number
  swap: number
  commission: number
  stopLoss?: number
  takeProfit?: number
  linkedTrades?: string[] // Array of ticket IDs
  tags?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AccountInfo {
  id: string
  name: string
  broker: string
  currency: string
  balance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
  createdAt: Date
  updatedAt: Date
}

export interface ImportSession {
  id: string
  accountId: string
  broker: string
  fileName: string
  fileSize: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalTrades: number
  processedTrades: number
  errors: string[]
  createdAt: Date
  updatedAt: Date
}

export interface JournalEntry {
  id: string
  date: Date
  trades: TradeRecord[]
  notes: string
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible'
  marketConditions: string
  lessons: string
  goals: string
  createdAt: Date
  updatedAt: Date
}

export interface StrategyDocument {
  id: string
  name: string
  content: string
  category: 'strategy' | 'insights' | 'goals'
  tags: string[]
  version: number
  createdAt: Date
  updatedAt: Date
}

// Dashboard types
export interface DashboardMetrics {
  netPnL: number
  profitFactor: number
  winRate: number
  totalTrades: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  maxDrawdown: number
  sharpeRatio: number
}

export interface PerformanceScore {
  planAdherence: number
  psychology: number
  entryQuality: number
  exitManagement: number
  overall: number
}

// Chart types
export interface ChartDataPoint {
  date: Date
  value: number
  label?: string
}

export interface PnLChartData {
  cumulative: ChartDataPoint[]
  daily: ChartDataPoint[]
  weekly: ChartDataPoint[]
  monthly: ChartDataPoint[]
}

// Filter types
export interface TradeFilters {
  dateRange: {
    start: Date | null
    end: Date | null
  }
  symbols: string[]
  types: ('BUY' | 'SELL')[]
  tags: string[]
  minProfit?: number
  maxProfit?: number
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface TradeFormData {
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  openPrice: number
  closePrice: number
  openTime: Date
  closeTime: Date
  stopLoss?: number
  takeProfit?: number
  notes?: string
  tags?: string[]
}

// Import types
export interface ImportResult {
  success: boolean
  trades: TradeRecord[]
  errors: string[]
  warnings: string[]
}

export interface BrokerConfig {
  name: string
  parser: string
  fields: Record<string, string>
  dateFormat: string
  timezone: string
}

// UI types
export interface Theme {
  mode: 'dark' | 'light'
  colors: {
    profit: string
    loss: string
    neutral: string
    background: string
    surface: string
    textPrimary: string
    textSecondary: string
  }
}

export interface UserPreferences {
  theme: Theme
  defaultTimeframe: string
  defaultCurrency: string
  notifications: boolean
  autoSave: boolean
} 