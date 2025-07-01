import React from 'react'
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils/cn'

interface PerformanceScore {
  planAdherence: number
  psychology: number
  entryQuality: number
  exitManagement: number
  overall: number
}

interface RadarChartProps {
  score: PerformanceScore
  className?: string
}

const RadarChart: React.FC<RadarChartProps> = ({ score, className }) => {
  // Transform score data for radar chart
  const chartData = [
    {
      subject: 'Plan Adherence',
      score: score.planAdherence,
      fullMark: 100,
    },
    {
      subject: 'Psychology',
      score: score.psychology,
      fullMark: 100,
    },
    {
      subject: 'Entry Quality',
      score: score.entryQuality,
      fullMark: 100,
    },
    {
      subject: 'Exit Management',
      score: score.exitManagement,
      fullMark: 100,
    },
  ]

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ADE80' // Green - Excellent
    if (score >= 60) return '#FBBF24' // Yellow - Good
    return '#EF4444' // Red - Needs Improvement
  }

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Improvement'
  }

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">
          Performance Score (Zella Score)
        </h3>
        <div className="text-right">
          <div className={cn(
            'text-2xl font-bold',
            score.overall >= 80 ? 'text-profit' : score.overall >= 60 ? 'text-yellow-400' : 'text-loss'
          )}>
            {score.overall}
          </div>
          <div className="text-sm text-text-secondary">
            {getScoreStatus(score.overall)}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData}>
            <PolarGrid stroke="#4B5563" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#D1D5DB', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#D1D5DB', fontSize: 10 }}
            />
            <Radar
              name="Performance Score"
              dataKey="score"
              stroke="#4ADE80"
              fill="#4ADE80"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {chartData.map((item) => (
          <div key={item.subject} className="text-center">
            <div className={cn(
              'text-lg font-semibold',
              item.score >= 80 ? 'text-profit' : item.score >= 60 ? 'text-yellow-400' : 'text-loss'
            )}>
              {item.score}
            </div>
            <div className="text-xs text-text-secondary">
              {item.subject}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-profit rounded-full" />
          <span className="text-xs text-text-secondary">Excellent (80+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <span className="text-xs text-text-secondary">Good (60-79)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-loss rounded-full" />
          <span className="text-xs text-text-secondary">Needs Improvement (&lt;60)</span>
        </div>
      </div>
    </div>
  )
}

export default RadarChart 