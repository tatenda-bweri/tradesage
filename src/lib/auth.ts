import { getServerSession } from 'next-auth/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    email: string
    name?: string
  }
}

/**
 * Get the current user session on the server side
 */
export async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  return session?.user
}

/**
 * Middleware to protect API routes
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Add user to request
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = session.user

    return handler(authenticatedReq, res)
  }
}

/**
 * Check if user is authenticated on client side
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

/**
 * Get user ID from session
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id || null
}

/**
 * Redirect to sign in if not authenticated
 */
export async function requireAuth(redirectTo = '/auth/signin') {
  const session = await getSession()
  
  if (!session?.user) {
    window.location.href = redirectTo
    return null
  }
  
  return session.user
}

/**
 * Check if user has permission to access resource
 */
export function hasPermission(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId
}

/**
 * Validate user access to resource
 */
export function validateUserAccess(userId: string, resourceUserId: string): void {
  if (!hasPermission(userId, resourceUserId)) {
    throw new Error('Access denied')
  }
} 