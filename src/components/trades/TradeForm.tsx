import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Save } from 'lucide-react'
import { TradeRecord } from '@/lib/types'
import { Button, Card, Select, Modal, RichTextEditor } from '@/components/ui'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { cn } from '@/lib/utils/cn'

interface TradeFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (trade: Partial<TradeRecord>) => void
  trade?: TradeRecord
  symbols?: string[]
  className?: string
}

const TradeForm: React.FC<TradeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  trade,
  symbols = [],
  className
}) => {
  const [ticketId, setTicketId] = useState('')
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY')
  const [volume, setVolume] = useState('')
  const [openPrice, setOpenPrice] = useState('')
  const [closePrice, setClosePrice] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [closeTime, setCloseTime] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [profit, setProfit] = useState('')
  const [commission, setCommission] = useState('0')
  const [swap, setSwap] = useState('0')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Rich text editor for notes
  const { 
    value: notes, 
    handleChange: handleNotesChange,
    validation: notesValidation 
  } = useRichTextEditor({
    initialValue: trade?.notes || '',
    maxLength: 5000,
  })

  // Initialize form with trade data if editing
  useEffect(() => {
    if (trade) {
      setTicketId(trade.ticketId || '')
      setSymbol(trade.symbol || '')
      setType(trade.type || 'BUY')
      setVolume(trade.volume?.toString() || '')
      setOpenPrice(trade.openPrice?.toString() || '')
      setClosePrice(trade.closePrice?.toString() || '')
      setOpenTime(trade.openTime ? format(new Date(trade.openTime), 'yyyy-MM-dd\'T\'HH:mm') : '')
      setCloseTime(trade.closeTime ? format(new Date(trade.closeTime), 'yyyy-MM-dd\'T\'HH:mm') : '')
      setStopLoss(trade.stopLoss?.toString() || '')
      setTakeProfit(trade.takeProfit?.toString() || '')
      setProfit(trade.profit?.toString() || '')
      setCommission(trade.commission?.toString() || '0')
      setSwap(trade.swap?.toString() || '0')
      setTags(trade.tags || [])
    }
  }, [trade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validation
    if (!ticketId || !symbol || !volume || !openPrice || !closePrice || !openTime || !closeTime) {
      return
    }

    // Create trade object
    const tradeData: Partial<TradeRecord> = {
      ticketId,
      symbol,
      type,
      volume: parseFloat(volume),
      openPrice: parseFloat(openPrice),
      closePrice: parseFloat(closePrice),
      openTime: new Date(openTime),
      closeTime: new Date(closeTime),
      profit: parseFloat(profit || '0'),
      commission: parseFloat(commission || '0'),
      swap: parseFloat(swap || '0'),
      tags,
      notes
    }

    if (stopLoss) {
      tradeData.stopLoss = parseFloat(stopLoss)
    }

    if (takeProfit) {
      tradeData.takeProfit = parseFloat(takeProfit)
    }

    onSave(tradeData)
    onClose()
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const symbolOptions = [
    ...new Set(['', ...(symbols || [])])
  ].map(s => ({
    value: s, 
    label: s || 'Select Symbol'
  }))

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trade ? 'Edit Trade' : 'Add Trade'}>
      <div className={cn('space-y-4', className)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Trade Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Ticket ID
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
                disabled={!!trade} // Can't edit ticket ID if editing existing trade
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Symbol
              </label>
              <Select
                options={symbolOptions}
                value={symbolOptions.find(s => s.value === symbol)}
                onChange={(option) => setSymbol(option?.value || '')}
                className="w-full"
              />
            </div>
          </div>

          {/* Trade Type & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Trade Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={type === 'BUY'}
                    onChange={() => setType('BUY')}
                    className="text-profit"
                  />
                  <span className="text-text-primary">Buy</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={type === 'SELL'}
                    onChange={() => setType('SELL')}
                    className="text-loss"
                  />
                  <span className="text-text-primary">Sell</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Volume / Lot Size
              </label>
              <input
                type="number"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
              />
            </div>
          </div>

          {/* Entry/Exit Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Open Price
              </label>
              <input
                type="number"
                step="0.00001"
                value={openPrice}
                onChange={(e) => setOpenPrice(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Close Price
              </label>
              <input
                type="number"
                step="0.00001"
                value={closePrice}
                onChange={(e) => setClosePrice(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Open Time
              </label>
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Close Time
              </label>
              <input
                type="datetime-local"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
              />
            </div>
          </div>

          {/* SL/TP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.00001"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="0.00001"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
              />
            </div>
          </div>

          {/* P&L and costs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Profit/Loss
              </label>
              <input
                type="number"
                step="0.01"
                value={profit}
                onChange={(e) => setProfit(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Commission
              </label>
              <input
                type="number"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Swap
              </label>
              <input
                type="number"
                step="0.01"
                value={swap}
                onChange={(e) => setSwap(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-surface-light text-text-secondary rounded flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-loss"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add tags and press Enter..."
              className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
            />
          </div>

          {/* Notes - Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Notes
            </label>
            <RichTextEditor
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add notes about this trade..."
              error={!notesValidation.isValid}
              errorMessage={notesValidation.errors.join('. ')}
              maxLength={5000}
              showCharCount
              className="min-h-[150px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-surface-light">
            <Button type="button" onClick={onClose} className="bg-surface-light text-text-primary">
              Cancel
            </Button>
            <Button type="submit" className="bg-profit text-white">
              <Save className="w-4 h-4 mr-1" />
              Save Trade
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default TradeForm
