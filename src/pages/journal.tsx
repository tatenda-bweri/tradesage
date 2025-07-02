import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
import MainLayout from '@/components/layout/main-layout'
import { DailyJournal, JournalEntry, JournalEditor } from '@/components/journal'
import { TradeRecord } from '@/lib/types'
import { useTrades } from '@/hooks/useTrades'
import { useJournalEntries } from '@/hooks/useJournalEntries'
import Loading from '@/components/ui/Loading'
import { BookOpen, Calendar, TrendingUp, Edit, Plus } from 'lucide-react'
import { JournalEntryType } from '@/components/journal/journal-entry'

interface JournalPageProps {
  user: {
    id: string
    name: string
    email: string
  }
}

const JournalPage: React.FC<JournalPageProps> = ({ user }) => {
  const { trades, loading: loadingTrades, error: tradesError } = useTrades()
  const { 
    entries, 
    loading: loadingEntries, 
    error: entriesError,
    createEntry,
    updateEntry,
    deleteEntry 
  } = useJournalEntries()
  
  const [isCreating, setIsCreating] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntryType | null>(null)

  const handleTradeClick = (_trade: TradeRecord) => {
    // Navigate to trade details or open modal
    // TODO: Implement trade details functionality
  }

  const handleCreateEntry = async (entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createEntry(entry)
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  const handleUpdateEntry = async (entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingEntry) return
    
    try {
      await updateEntry(editingEntry.id, entry)
      setEditingEntry(null)
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        await deleteEntry(id)
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }

  if (loadingTrades || loadingEntries) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </MainLayout>
    )
  }

  if (tradesError || entriesError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <div className="text-loss mb-4">Error loading data</div>
            <p className="text-text-secondary">{tradesError || entriesError}</p>
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-profit" />
              <h1 className="text-3xl font-bold text-text-primary">Trading Journal</h1>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="btn btn-primary flex items-center space-x-2"
              disabled={isCreating}
            >
              <Plus className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
          <p className="text-text-secondary">
            Document your trading journey with rich text journal entries
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

        {/* Journal Editor (Create/Edit) */}
        {(isCreating || editingEntry) && (
          <div className="mb-8">
            <JournalEditor
              entry={editingEntry || undefined}
              onSave={editingEntry ? handleUpdateEntry : handleCreateEntry}
              onCancel={() => {
                setIsCreating(false)
                setEditingEntry(null)
              }}
            />
          </div>
        )}

        {/* Journal Entries */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Journal Entries
          </h3>
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map(entry => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={setEditingEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No Journal Entries Yet
              </h3>
              <p className="text-text-secondary mb-4">
                Start documenting your trading journey by creating your first entry
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
                disabled={isCreating}
              >
                Create Your First Entry
              </button>
            </div>
          )}
        </div>

        {/* Daily Trade Journal */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Trade Performance
          </h3>
          {trades.length > 0 ? (
            <DailyJournal 
              trades={trades} 
              onTradeClick={handleTradeClick}
            />
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No Trading Data
              </h3>
              <p className="text-text-secondary mb-4">
                Import your trading data to see your performance
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="btn btn-primary"
              >
                Import Trades
              </button>
            </div>
          )}
        </div>

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
