import React from 'react'
import { format } from 'date-fns'
import { X, Edit, Trash2, ExternalLink, Tag } from 'lucide-react'
import { TradeRecord } from '@/lib/types'
import { Button, Card, Modal } from '@/components/ui'
import { formatPnL, formatLotSize } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import TradeNotes from './TradeNotes'

interface TradeDetailsProps {
  trade: TradeRecord
  isOpen: boolean
  onClose: () => void
  onEdit?: (trade: TradeRecord) => void
  onDelete?: (tradeId: string) => void
  className?: string
}

const TradeDetails: React.FC<TradeDetailsProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  className
}) => {
  if (!isOpen || !trade) return null

  const pnlData = formatPnL(trade.profit)
  const duration = new Date(trade.closeTime).getTime() - new Date(trade.openTime).getTime()
  const durationHours = Math.floor(duration / (1000 * 60 * 60))
  const durationMinutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${trade.symbol} ${trade.type}`}
      size="lg"
    >
      <div className={cn('space-y-6', className)}>
        {/* Header with key info */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-text-primary">
              {trade.symbol} {trade.type}
            </h3>
            <div className="text-sm text-text-secondary">
              Ticket #{trade.ticketId}
            </div>
          </div>
          <div className="text-right">
            <div className={cn('text-xl font-bold', pnlData.colorClass)}>
              {pnlData.formatted}
            </div>
            <div className="text-sm text-text-secondary">
              {formatLotSize(trade.volume)} lots
            </div>
          </div>
        </div>

        {/* Main trade details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Entry/Exit</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-text-secondary">Open Time</div>
                  <div className="font-medium">
                    {format(new Date(trade.openTime), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Close Time</div>
                  <div className="font-medium">
                    {format(new Date(trade.closeTime), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Duration</div>
                  <div className="font-medium">
                    {durationHours}h {durationMinutes}m
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Type</div>
                  <div className="font-medium">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      trade.type === 'BUY' ? 'bg-profit bg-opacity-20 text-profit' : 'bg-loss bg-opacity-20 text-loss'
                    )}>
                      {trade.type}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Price Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-text-secondary">Open Price</div>
                  <div className="font-medium">{trade.openPrice.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Close Price</div>
                  <div className="font-medium">{trade.closePrice.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Stop Loss</div>
                  <div className="font-medium">{trade.stopLoss ? trade.stopLoss.toFixed(5) : '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Take Profit</div>
                  <div className="font-medium">{trade.takeProfit ? trade.takeProfit.toFixed(5) : '—'}</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-text-secondary">Net P&L</div>
                  <div className={cn('font-medium', pnlData.colorClass)}>
                    {pnlData.formatted}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Swap</div>
                  <div className={cn('font-medium', trade.swap > 0 ? 'text-profit' : 'text-text-primary')}>
                    {trade.swap ? trade.swap.toFixed(2) : '0.00'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Commission</div>
                  <div className={cn('font-medium', trade.commission < 0 ? 'text-loss' : 'text-text-primary')}>
                    {trade.commission ? trade.commission.toFixed(2) : '0.00'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Total Return</div>
                  <div className={cn('font-medium', pnlData.colorClass)}>
                    {pnlData.formatted}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">Tags</h4>
              {trade.tags && trade.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trade.tags.map((tag) => (
                    <div key={tag} className="px-2 py-1 bg-surface-light text-text-secondary rounded text-xs flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic">No tags</p>
              )}
            </Card>
          </div>
        </div>

        {/* Trade Notes */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Trade Notes</h4>
          <Card className="p-4">
            <TradeNotes 
              notes={trade.notes} 
              tradeId={trade.id} 
              readOnly={true}
            />
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-surface-light">
          <div>
            {onDelete && (
              <Button 
                onClick={() => onDelete(trade.id)}
                className="bg-loss text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button onClick={onClose} className="bg-surface-light text-text-primary">
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
            {onEdit && (
              <Button 
                onClick={() => {
                  onEdit(trade)
                  onClose()
                }}
                className="bg-accent text-white"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TradeDetails
