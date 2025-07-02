import { DefaultSession } from 'next-auth'

// augment the session object so it contains id and accountId

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      accountId: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
  }
} 