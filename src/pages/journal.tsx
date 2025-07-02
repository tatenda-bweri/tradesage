import React from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
import MainLayout from '@/components/layout/main-layout'
import DailyJournal from '@/components/journal/daily-journal'
import { TradeRecord } from '@/lib/types'
import { useTrades } from '@/hooks/useTrades'
import Loading from '@/components/ui/Loading'
import { BookOpen, Calendar, TrendingUp } from 'lucide-react'

interface JournalPageProps {
  user: {
    id: string
    name: string
    email: string
  }
}

const JournalPage: React.FC<JournalPageProps> = ({ user }) => {
  const { trades, loading, error } = useTrades()

  const handleTradeClick = (_trade: TradeRecord) => {
    // Navigate to trade details or open modal
    // TODO: Implement trade details functionality
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <div className="text-loss mb-4">Error loading trades</div>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const totalTrades = trades.length
  const totalDays = new Set(trades.map(trade => 
    new Date(trade.openTime).toDateString()
  )).size
  const totalPnL = trades.reduce((sum, trade) => sum + trade.profit, 0)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="w-8 h-8 text-profit" />
            <h1 className="text-3xl font-bold text-text-primary">Trading Journal</h1>
          </div>
          <p className="text-text-secondary">
            Daily breakdown of your trading performance and journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-profit" />
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {totalTrades}
                </div>
                <div className="text-sm text-text-secondary">Total Trades</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-profit" />
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {totalDays}
                </div>
                <div className="text-sm text-text-secondary">Trading Days</div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-profit" />
              <div>
                <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
                </div>
                <div className="text-sm text-text-secondary">Total P&L</div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Journal Component */}
        {trades.length > 0 ? (
          <DailyJournal 
            trades={trades} 
            onTradeClick={handleTradeClick}
            className="mb-8"
          />
        ) : (
          <div className="card p-12 text-center">
            <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Trading Data
            </h3>
            <p className="text-text-secondary mb-6">
              Import your trading data to start tracking your daily journal
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-primary"
            >
              Import Trades
            </button>
          </div>
        )}

        {/* Trading Tips */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Journal Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Daily Review</h4>
              <p className="text-sm text-text-secondary">
                Review each trading day to identify patterns, mistakes, and improvements
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Emotional State</h4>
              <p className="text-sm text-text-secondary">
                Track your emotional state during trades to improve discipline
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Market Conditions</h4>
              <p className="text-sm text-text-secondary">
                Note market conditions and how they affected your trading
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-text-primary">Lessons Learned</h4>
              <p className="text-sm text-text-secondary">
                Document key lessons and insights from each trading session
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    },
  }
}

export default JournalPage
