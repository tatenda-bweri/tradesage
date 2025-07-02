import React, { useState } from 'react'
import { Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { RichTextEditor } from '@/components/ui'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { cn } from '@/lib/utils/cn'

interface TradeNotesProps {
  notes: string
  tradeId: string
  readOnly?: boolean
  onSave?: (tradeId: string, notes: string) => Promise<void>
  className?: string
}

const TradeNotes: React.FC<TradeNotesProps> = ({
  notes,
  tradeId,
  readOnly = false,
  onSave,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const { 
    value: notesValue, 
    handleChange: handleNotesChange,
    validation: notesValidation,
    setValue: setNotesValue
  } = useRichTextEditor({
    initialValue: notes || '',
    maxLength: 5000
  })

  const handleEdit = () => {
    if (!readOnly && onSave) {
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setNotesValue(notes || '')
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!onSave || !notesValidation.isValid) return
    
    try {
      setIsSaving(true)
      await onSave(tradeId, notesValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {isEditing ? (
        <>
          <RichTextEditor 
            value={notesValue}
            onChange={handleNotesChange}
            placeholder="Add notes about this trade..."
            error={!notesValidation.isValid}
            errorMessage={notesValidation.errors.join('. ')}
            maxLength={5000}
            showCharCount
            className="min-h-[150px]"
          />
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-surface-light text-text-primary"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSave}
              disabled={isSaving || !notesValidation.isValid}
              className="bg-profit text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {notes ? (
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: notes }} />
          ) : (
            <p className="text-text-secondary italic">No notes for this trade.</p>
          )}
          
          {!readOnly && onSave && (
            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={handleEdit}
                className="bg-surface-light text-text-primary"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Notes
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TradeNotes
