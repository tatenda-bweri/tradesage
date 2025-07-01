import React, { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface PnLDataPoint {
  date: string
  cumulativePnL: number
  dailyPnL: number
}

interface PnLChartProps {
  data: PnLDataPoint[]
  timeFrame: '1w' | '1m' | '3m' | 'ytd' | 'all'
  onTimeFrameChange?: (timeFrame: '1w' | '1m' | '3m' | 'ytd' | 'all') => void
  className?: string
}

const PnLChart: React.FC<PnLChartProps> = ({
  data,
  timeFrame,
  onTimeFrameChange,
  className
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PnLDataPoint | null>(null)

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-surface border border-surface-light rounded-lg p-3 shadow-lg">
          <p className="text-sm text-text-secondary mb-1">
            {format(new Date(label), 'MMM dd, yyyy')}
          </p>
          <p className={cn(
            'text-lg font-semibold',
            data.cumulativePnL >= 0 ? 'text-profit' : 'text-loss'
          )}>
            Cumulative: {data.cumulativePnL >= 0 ? '+' : ''}{data.cumulativePnL.toFixed(2)}
          </p>
          <p className={cn(
            'text-sm',
            data.dailyPnL >= 0 ? 'text-profit' : 'text-loss'
          )}>
            Daily: {data.dailyPnL >= 0 ? '+' : ''}{data.dailyPnL.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  // Time frame selector
  const timeFrameOptions = [
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: 'ytd', label: 'YTD' },
    { value: 'all', label: 'All Time' }
  ] as const

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">
          Cumulative P&L
        </h3>
        
        {/* Time Frame Selector */}
        <div className="flex space-x-1 bg-surface-light rounded-lg p-1">
          {timeFrameOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeFrameChange?.(option.value)}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                timeFrame === option.value
                  ? 'bg-profit text-background'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(e) => {
              if (e.activePayload) {
                setHoveredPoint(e.activePayload[0].payload)
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#D1D5DB', fontSize: 12 }}
              tickLine={{ stroke: '#4B5563' }}
              axisLine={{ stroke: '#4B5563' }}
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            />
            <YAxis
              tick={{ fill: '#D1D5DB', fontSize: 12 }}
              tickLine={{ stroke: '#4B5563' }}
              axisLine={{ stroke: '#4B5563' }}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="cumulativePnL"
              stroke="#4ADE80"
              strokeWidth={2}
              fill="url(#profitGradient)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-profit rounded-sm" />
          <span className="text-sm text-text-secondary">Cumulative P&L</span>
        </div>
      </div>
    </div>
  )
}

export default PnLChart 