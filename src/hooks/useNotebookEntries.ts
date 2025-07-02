import { useState, useEffect, useCallback } from 'react'

export interface NotebookEntry {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface UseNotebookEntriesOptions {
  initialEntries?: NotebookEntry[]
}

export const useNotebookEntries = (options: UseNotebookEntriesOptions = {}) => {
  const [entries, setEntries] = useState<NotebookEntry[]>(options.initialEntries || [])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all notebook entries
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/notebook')
      
      if (!response.ok) {
        throw new Error('Failed to fetch notebook entries')
      }
      
      const data = await response.json()
      
      // Convert string dates to Date objects
      const formattedEntries = data.map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }))
      
      setEntries(formattedEntries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching notebook entries:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new notebook entry
  const createEntry = useCallback(async (entryData: Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      
      const response = await fetch('/api/notebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create notebook entry')
      }
      
      const newEntry = await response.json()
      
      // Convert string dates to Date objects
      const formattedEntry = {
        ...newEntry,
        createdAt: new Date(newEntry.createdAt),
        updatedAt: new Date(newEntry.updatedAt),
      }
      
      setEntries(prev => [formattedEntry, ...prev])
      return formattedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error creating notebook entry:', err)
      throw err
    }
  }, [])

  // Update an existing notebook entry
  const updateEntry = useCallback(async (id: string, entryData: Partial<Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/notebook/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update notebook entry')
      }
      
      const updatedEntry = await response.json()
      
      // Convert string dates to Date objects
      const formattedEntry = {
        ...updatedEntry,
        createdAt: new Date(updatedEntry.createdAt),
        updatedAt: new Date(updatedEntry.updatedAt),
      }
      
      setEntries(prev => prev.map(entry => 
        entry.id === id ? formattedEntry : entry
      ))
      
      return formattedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error updating notebook entry:', err)
      throw err
    }
  }, [])

  // Delete a notebook entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/notebook/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete notebook entry')
      }
      
      setEntries(prev => prev.filter(entry => entry.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error deleting notebook entry:', err)
      throw err
    }
  }, [])

  // Get a single notebook entry
  const getEntry = useCallback(async (id: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/notebook/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notebook entry')
      }
      
      const entry = await response.json()
      
      // Convert string dates to Date objects
      return {
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching notebook entry:', err)
      throw err
    }
  }, [])

  // Load entries on mount
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    isLoading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
  }
}
