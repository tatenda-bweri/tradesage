import { useState, useEffect } from 'react'
import { JournalEntryType } from '@/components/journal/journal-entry'

interface UseJournalEntriesReturn {
  entries: JournalEntryType[]
  loading: boolean
  error: string | null
  createEntry: (entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntryType>
  updateEntry: (id: string, entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntryType>
  deleteEntry: (id: string) => Promise<void>
  refreshEntries: () => Promise<void>
}

export const useJournalEntries = (): UseJournalEntriesReturn => {
  const [entries, setEntries] = useState<JournalEntryType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/journal')
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries')
      }
      const data = await response.json()
      
      // Convert date strings to Date objects
      const formattedEntries = data.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }))
      
      setEntries(formattedEntries)
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching journal entries')
      console.error('Error fetching journal entries:', err)
    } finally {
      setLoading(false)
    }
  }

  const createEntry = async (entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntryType> => {
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create journal entry')
      }

      const data = await response.json()
      const newEntry = {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }

      setEntries(prevEntries => [newEntry, ...prevEntries])
      return newEntry
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating journal entry')
      console.error('Error creating journal entry:', err)
      throw err
    }
  }

  const updateEntry = async (id: string, entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntryType> => {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update journal entry')
      }

      const data = await response.json()
      const updatedEntry = {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }

      setEntries(prevEntries =>
        prevEntries.map(e => (e.id === id ? updatedEntry : e))
      )
      
      return updatedEntry
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating journal entry')
      console.error('Error updating journal entry:', err)
      throw err
    }
  }

  const deleteEntry = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete journal entry')
      }

      setEntries(prevEntries => prevEntries.filter(e => e.id !== id))
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting journal entry')
      console.error('Error deleting journal entry:', err)
      throw err
    }
  }

  const refreshEntries = async (): Promise<void> => {
    await fetchEntries()
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,
  }
}
