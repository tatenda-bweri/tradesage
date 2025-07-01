import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface DailyPnL {
  date: string
  pnl: number
  trades: number
}

interface CalendarViewProps {
  dailyPnLData: DailyPnL[]
  onDayClick?: (date: string) => void
  className?: string
}

const CalendarView: React.FC<CalendarViewProps> = ({
  dailyPnLData,
  onDayClick,
  className
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDayPnL = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return dailyPnLData.find(day => day.date === dateStr)
  }

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'bg-profit bg-opacity-20 border-profit'
    if (pnl < 0) return 'bg-loss bg-opacity-20 border-loss'
    return 'bg-surface-light border-surface-light'
  }

  const getPnLTextColor = (pnl: number) => {
    if (pnl > 0) return 'text-profit'
    if (pnl < 0) return 'text-loss'
    return 'text-text-secondary'
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className={cn('card p-6', className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">
          Calendar View
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-lg font-medium text-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-text-secondary">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((day) => {
          const dayPnL = getDayPnL(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all hover:scale-105',
                isCurrentMonth ? 'bg-surface' : 'bg-surface-dark opacity-50',
                dayPnL ? getPnLColor(dayPnL.pnl) : 'border-surface-light',
                'hover:border-profit hover:bg-profit hover:bg-opacity-10'
              )}
              onClick={() => onDayClick?.(format(day, 'yyyy-MM-dd'))}
            >
              <div className="text-sm font-medium text-text-primary mb-1">
                {format(day, 'd')}
              </div>
              {dayPnL && (
                <div className="space-y-1">
                  <div className={cn('text-xs font-medium', getPnLTextColor(dayPnL.pnl))}>
                    {dayPnL.pnl > 0 ? '+' : ''}{dayPnL.pnl.toFixed(0)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {dayPnL.trades} trades
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Calendar Legend */}
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-profit bg-opacity-20 border border-profit rounded" />
          <span className="text-xs text-text-secondary">Profitable Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-loss bg-opacity-20 border border-loss rounded" />
          <span className="text-xs text-text-secondary">Loss Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-surface-light border border-surface-light rounded" />
          <span className="text-xs text-text-secondary">No Trades</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarView 