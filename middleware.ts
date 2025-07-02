import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any additional logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/auth/signin',
          '/auth/signup',
          '/api/auth',
        ]
        
        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        )
        
        // Allow access to public routes without authentication
        if (isPublicRoute) {
          return true
        }
        
        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Match all routes except static files and API routes that should be public
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
