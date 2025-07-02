import React from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface JournalEntryType {
  id: string
  date: Date
  content: string
  mood: 'positive' | 'neutral' | 'negative'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface JournalEntryProps {
  entry: JournalEntryType
  onEdit?: (entry: JournalEntryType) => void
  onDelete?: (id: string) => void
  className?: string
}

const JournalEntry: React.FC<JournalEntryProps> = ({
  entry,
  onEdit,
  onDelete,
  className,
}) => {
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'bg-profit bg-opacity-10 border-profit'
      case 'negative':
        return 'bg-loss bg-opacity-10 border-loss'
      default:
        return 'bg-surface-light border-surface-light'
    }
  }

  const getMoodTextColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'text-profit'
      case 'negative':
        return 'text-loss'
      default:
        return 'text-text-secondary'
    }
  }

  return (
    <div className={cn('card p-4', getMoodColor(entry.mood), className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">
            {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(entry)}
            className="p-1.5 bg-surface-light rounded-full hover:bg-surface transition-colors"
          >
            <Edit className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => onDelete?.(entry.id)}
            className="p-1.5 bg-surface-light rounded-full hover:bg-loss hover:bg-opacity-10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-text-secondary hover:text-loss" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-surface-light rounded-full text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className={cn('font-medium', getMoodTextColor(entry.mood))}>
          {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} mood
        </div>
      </div>
    </div>
  )
}

export default JournalEntry
