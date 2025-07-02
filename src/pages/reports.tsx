import React from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'

import { ImportReportFilters } from '@/components/forms'
import MainLayout from '@/components/layout/main-layout'
import useDateRangePicker from '@/hooks/useDateRangePicker'
import { Card } from '@/components/ui'
import { BarChart3, Download, Calendar, TrendingUp, DollarSign } from 'lucide-react'

const ReportsPage: React.FC = () => {
  const { range, setRange } = useDateRangePicker()

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting reports in ${format} format for range:`, range)
    // In a real app, this would call the export API
  }

  const reportTypes = [
    {
      title: 'Trading Performance Report',
      description: 'Comprehensive overview of your trading performance including P&L, win rate, and risk metrics',
      icon: BarChart3,
      available: true
    },
    {
      title: 'Monthly Statement',
      description: 'Detailed monthly breakdown of all trades and account activity',
      icon: Calendar,
      available: true
    },
    {
      title: 'Risk Analysis Report',
      description: 'In-depth analysis of your risk management and drawdown patterns',
      icon: TrendingUp,
      available: true
    },
    {
      title: 'Tax Summary Report',
      description: 'Summary of trading activity formatted for tax reporting purposes',
      icon: DollarSign,
      available: false
    }
  ]

  return (
    <>
      <Head>
        <title>Reports | TradeSage</title>
        <meta name="description" content="Generate and export detailed trading reports" />
      </Head>
      
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Trading Reports</h1>
            <p className="text-text-secondary">
              Generate detailed reports and export your trading data
            </p>
          </div>

          <div className="mb-6">
            <ImportReportFilters
              dateRange={range}
              onDateRangeChange={setRange}
              showExportOptions={true}
              onExport={handleExport}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${report.available ? 'bg-profit bg-opacity-20' : 'bg-surface-light'}`}>
                    <report.icon className={`w-6 h-6 ${report.available ? 'text-profit' : 'text-text-secondary'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {report.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      {report.description}
                    </p>
                    <button
                      disabled={!report.available}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        report.available
                          ? 'bg-profit bg-opacity-20 text-profit hover:bg-opacity-30'
                          : 'bg-surface-light text-text-secondary cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{report.available ? 'Generate Report' : 'Coming Soon'}</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}

export default ReportsPage
