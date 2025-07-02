import { NextApiRequest, NextApiResponse } from 'next'
import { ZodError } from 'zod'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export class ValidationError extends Error {
  statusCode = 400
  code = 'VALIDATION_ERROR'
  
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  statusCode = 401
  code = 'AUTHENTICATION_ERROR'
  
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  statusCode = 403
  code = 'AUTHORIZATION_ERROR'
  
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  code = 'NOT_FOUND_ERROR'
  
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export const errorHandler = (
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
    })
  }

  // Handle custom API errors
  if (error instanceof ValidationError ||
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError ||
      error instanceof NotFoundError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: (error as any).details
    })
  }

  // Handle Prisma errors
  if (error.message.includes('Unique constraint')) {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'CONFLICT_ERROR'
    })
  }

  if (error.message.includes('Record to delete does not exist')) {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND_ERROR'
    })
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  })
}

// Wrapper function to handle async API routes
export const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      errorHandler(error as Error, req, res)
    }
  }
}
