import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-text-primary">
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#374151',
                color: '#F9FAFB',
                border: '1px solid #4B5563',
              },
              success: {
                iconTheme: {
                  primary: '#4ADE80',
                  secondary: '#1F2937',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#1F2937',
                },
              },
            }}
          />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  )
} 