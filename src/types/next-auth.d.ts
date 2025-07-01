import NextAuth, { DefaultSession } from 'next-auth'

// augment the session object so it contains id

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
  }
} 