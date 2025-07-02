import React from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'

import { ImportReportFilters } from '@/components/forms'
import ImportUploader from '@/components/ImportUploader'
import MainLayout from '@/components/layout/main-layout'
import useDateRangePicker from '@/hooks/useDateRangePicker'

const ImportPage: React.FC = () => {
  const { range, setRange } = useDateRangePicker()

  return (
    <>
      <Head>
        <title>Import Data | TradeSage</title>
        <meta name="description" content="Import your trade data into TradeSage" />
      </Head>
      
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Import Trade Data</h1>
            <p className="text-text-secondary">
              Upload and import your trading data from various brokers
            </p>
          </div>

          <div className="mb-6">
            <ImportReportFilters
              dateRange={range}
              onDateRangeChange={setRange}
              showExportOptions={false}
            />
          </div>

          <ImportUploader />
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

export default ImportPage
