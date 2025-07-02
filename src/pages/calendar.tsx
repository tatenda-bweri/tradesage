import React from 'react'
import Head from 'next/head'
import MainLayout from '@/components/layout/main-layout'
import { CalendarView } from '@/components/calendar'

const CalendarPage = () => {
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

          <div className="mb-8">
            <CalendarView />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CalendarPage
