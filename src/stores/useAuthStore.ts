import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Session } from 'next-auth'

interface AuthState {
  session: Session | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        session: null,
        isLoading: true,
        setSession: (session) => set({ session }),
        setLoading: (isLoading) => set({ isLoading }),
        signOut: () => set({ session: null })
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ session: state.session })
      }
    ),
    { name: 'AuthStore' }
  )
)
