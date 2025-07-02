import React from 'react'
import Head from 'next/head'

import { CalendarView, CalendarFilters } from '@/components/calendar'
import MainLayout from '@/components/layout/main-layout'
import useDateRangePicker from '@/hooks/useDateRangePicker'

const CalendarPage = () => {
  const { range, setRange } = useDateRangePicker()

  // Mock data - in real app this would come from API based on range
  const mockDailyPnLData = [
    { date: '2024-01-15', pnl: 250, trades: 3 },
    { date: '2024-01-16', pnl: -150, trades: 2 },
    { date: '2024-01-17', pnl: 300, trades: 5 },
  ]

  return (
    <MainLayout>
      <Head>
        <title>Calendar - TradeSage</title>
        <meta name="description" content="Trading calendar and daily journal" />
      </Head>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Trading Calendar</h1>
            <p className="text-text-secondary">
              View your trading activity by date and manage daily journal entries
            </p>
          </div>

          <div className="mb-6">
            <CalendarFilters
              dateRange={range}
              onDateRangeChange={setRange}
            />
          </div>

          <div className="mb-8">
            <CalendarView 
              dailyPnLData={mockDailyPnLData}
              onDayClick={(date) => console.log('Day clicked:', date)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CalendarPage
