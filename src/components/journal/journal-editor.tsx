import React, { useState, useRef } from 'react'
import { Calendar, Tag, Save, X, Smile, Meh, Frown } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import RichTextEditor from '@/components/ui/RichTextEditor'
import { RichTextEditorRef } from '@/types/richTextEditor'
import useRichTextEditor from '@/hooks/useRichTextEditor'
import { JournalEntryType } from './journal-entry'

interface JournalEditorProps {
  entry?: JournalEntryType
  onSave: (entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  className?: string
}

const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSave,
  onCancel,
  className,
}) => {
  const isEditing = !!entry
  const [date, setDate] = useState(entry?.date || new Date())
  const [mood, setMood] = useState<'positive' | 'neutral' | 'negative'>(entry?.mood || 'neutral')
  const [tags, setTags] = useState<string[]>(entry?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const editorRef = useRef<RichTextEditorRef>(null)
  
  const { 
    value: content, 
    handleChange: handleContentChange,
    validation 
  } = useRichTextEditor({
    initialValue: entry?.content || '',
    required: true,
    maxLength: 10000,
  })

  const handleSave = () => {
    if (!validation.isValid) return
    
    onSave({
      date,
      content,
      mood,
      tags,
    })
  }

  const handleAddTag = () => {
    const newTag = tagInput.trim()
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className={cn('card p-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">
          {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="p-2 bg-surface-light rounded-full hover:bg-surface transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "p-2 rounded-full transition-colors",
              validation.isValid
                ? "bg-profit text-white hover:bg-profit/90"
                : "bg-surface-light text-text-secondary cursor-not-allowed"
            )}
            title="Save"
            disabled={!validation.isValid}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Date</span>
          </div>
        </label>
        <input
          type="date"
          value={format(date, 'yyyy-MM-dd')}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
        />
      </div>

      {/* Mood Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Mood</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setMood('positive')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2 rounded border",
              mood === 'positive' 
                ? "bg-profit bg-opacity-10 border-profit text-profit" 
                : "bg-surface border-surface-light text-text-secondary hover:bg-surface-light"
            )}
          >
            <Smile className="w-4 h-4" />
            <span>Positive</span>
          </button>
          <button
            onClick={() => setMood('neutral')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2 rounded border",
              mood === 'neutral' 
                ? "bg-surface-light border-text-secondary text-text-primary" 
                : "bg-surface border-surface-light text-text-secondary hover:bg-surface-light"
            )}
          >
            <Meh className="w-4 h-4" />
            <span>Neutral</span>
          </button>
          <button
            onClick={() => setMood('negative')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 py-2 rounded border",
              mood === 'negative' 
                ? "bg-loss bg-opacity-10 border-loss text-loss" 
                : "bg-surface border-surface-light text-text-secondary hover:bg-surface-light"
            )}
          >
            <Frown className="w-4 h-4" />
            <span>Negative</span>
          </button>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Journal Content
        </label>
        <RichTextEditor
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Write about your trading day..."
          error={!validation.isValid}
          errorMessage={validation.errors.join('. ')}
          maxLength={10000}
          showCharCount
        />
      </div>

      {/* Tags */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Tags</span>
          </div>
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add tags..."
            className="flex-1 px-3 py-2 bg-surface border border-surface-light rounded"
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-2 bg-profit text-white rounded hover:bg-profit/90 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tag List */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-surface-light rounded-full text-text-secondary flex items-center space-x-1"
          >
            <span>{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="hover:text-loss ml-1"
            >
              ×
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-text-secondary italic">
            No tags added yet
          </span>
        )}
      </div>
    </div>
  )
}

export default JournalEditor
