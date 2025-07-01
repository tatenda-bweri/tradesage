import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, BarChart3 } from 'lucide-react'
import { format, startOfYear, endOfYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { cn } from '@/lib/utils/cn'

type CalendarView = 'year' | 'quarter' | 'month'

interface DailyData {
  date: string
  pnl: number
  trades: number
  winRate: number
}

interface MultiViewCalendarProps {
  dailyData: DailyData[]
  onDayClick?: (date: string) => void
  onMonthClick?: (date: Date) => void
  className?: string
}

const MultiViewCalendar: React.FC<MultiViewCalendarProps> = ({
  dailyData,
  onDayClick,
  onMonthClick,
  className
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('year')

  const yearStart = startOfYear(currentDate)
  const yearEnd = endOfYear(currentDate)
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  const getMonthData = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = dailyData.find(d => d.date === dateStr)
      return {
        date: dateStr,
        pnl: dayData?.pnl || 0,
        trades: dayData?.trades || 0,
        winRate: dayData?.winRate || 0
      }
    })
  }

  const getMonthPnL = (month: Date) => {
    const monthData = getMonthData(month)
    return monthData.reduce((sum, day) => sum + day.pnl, 0)
  }

  const getMonthColor = (pnl: number) => {
    if (pnl > 0) return 'bg-profit bg-opacity-20 border-profit'
    if (pnl < 0) return 'bg-loss bg-opacity-20 border-loss'
    return 'bg-surface-light border-surface-light'
  }

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() + (direction === 'next' ? 1 : -1), 0, 1))
    } else if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1))
    }
  }

  const YearView = () => (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {months.map((month) => {
        const monthPnL = getMonthPnL(month)
        return (
          <div
            key={month.toISOString()}
            className={cn(
              'card p-4 cursor-pointer transition-all hover:scale-105',
              getMonthColor(monthPnL)
            )}
            onClick={() => {
              setCurrentDate(month)
              setView('month')
              onMonthClick?.(month)
            }}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-text-primary mb-2">
                {format(month, 'MMM')}
              </div>
              <div className={cn(
                'text-lg font-bold',
                monthPnL > 0 ? 'text-profit' : monthPnL < 0 ? 'text-loss' : 'text-text-secondary'
              )}>
                {monthPnL > 0 ? '+' : ''}{monthPnL.toFixed(0)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {getMonthData(month).filter(d => d.trades > 0).length} days
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const monthData = getMonthData(currentDate)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-text-secondary">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayData = monthData.find(d => d.date === dateStr)
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all hover:scale-105',
                  dayData && dayData.trades > 0 ? getMonthColor(dayData.pnl) : 'border-surface-light',
                  'hover:border-profit hover:bg-profit hover:bg-opacity-10'
                )}
                onClick={() => onDayClick?.(dateStr)}
              >
                <div className="text-sm font-medium text-text-primary mb-1">
                  {format(day, 'd')}
                </div>
                {dayData && dayData.trades > 0 && (
                  <div className="space-y-1">
                    <div className={cn(
                      'text-xs font-medium',
                      dayData.pnl > 0 ? 'text-profit' : dayData.pnl < 0 ? 'text-loss' : 'text-text-secondary'
                    )}>
                      {dayData.pnl > 0 ? '+' : ''}{dayData.pnl.toFixed(0)}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {dayData.trades} trades
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('card p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-text-primary">
            Calendar View
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('year')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                view === 'year' ? 'bg-profit text-white' : 'bg-surface text-text-secondary hover:bg-surface-light'
              )}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-3 py-1 rounded text-sm transition-colors',
                view === 'month' ? 'bg-profit text-white' : 'bg-surface text-text-secondary hover:bg-surface-light'
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('prev')}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="text-lg font-medium text-text-primary">
            {view === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => navigate('next')}
            className="p-2 rounded-full hover:bg-surface-light transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      {view === 'year' ? <YearView /> : <MonthView />}

      {/* Legend */}
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-profit bg-opacity-20 border border-profit rounded" />
          <span className="text-xs text-text-secondary">Profitable</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-loss bg-opacity-20 border border-loss rounded" />
          <span className="text-xs text-text-secondary">Loss</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-surface-light border border-surface-light rounded" />
          <span className="text-xs text-text-secondary">No Trades</span>
        </div>
      </div>
    </div>
  )
}

export default MultiViewCalendar 