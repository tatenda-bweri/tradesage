import { z } from 'zod'

// User schemas
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

export const signinSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Trade schemas
export const createTradeSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['BUY', 'SELL'], { 
    errorMap: () => ({ message: 'Type must be either BUY or SELL' })
  }),
  volume: z.number().positive('Volume must be positive'),
  openPrice: z.number().positive('Open price must be positive'),
  closePrice: z.number().positive('Close price must be positive'),
  openTime: z.string().datetime('Invalid open time format'),
  closeTime: z.string().datetime('Invalid close time format'),
  profit: z.number(),
  swap: z.number().default(0),
  commission: z.number().default(0),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  linkedTrades: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
})

export const updateTradeSchema = createTradeSchema.partial().omit({ ticketId: true })

export const tradesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).default('1'),
  pageSize: z.string().regex(/^\d+$/, 'Page size must be a number').transform(Number).default('20'),
  accountId: z.string().optional(),
  symbol: z.string().optional(),
  type: z.enum(['BUY', 'SELL']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// Analytics schemas
export const analyticsQuerySchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// Import schemas
export const importSessionSchema = z.object({
  broker: z.enum(['exness', 'metatrader', 'generic-csv'], {
    errorMap: () => ({ message: 'Unsupported broker type' })
  }),
  fileName: z.string().min(1, 'File name is required'),
  fileContent: z.string().min(1, 'File content is required'),
  columnMapping: z.record(z.string()).optional(),
})

// Journal schemas
export const journalEntrySchema = z.object({
  date: z.string().datetime('Invalid date format'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
  mood: z.enum(['excellent', 'good', 'neutral', 'poor', 'terrible']).optional(),
})

// Strategy schemas
export const strategySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['strategy', 'insights', 'goals'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  tags: z.array(z.string()).default([]),
})

// Helper function to validate request body
export const validateRequestBody = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error
    }
    throw new Error('Validation failed')
  }
}

// Helper function to validate query parameters
export const validateQuery = <T>(schema: z.ZodSchema<T>, query: unknown): T => {
  try {
    return schema.parse(query)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error
    }
    throw new Error('Query validation failed')
  }
}
