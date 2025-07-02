import React from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import MainLayout from '@/components/layout/main-layout'
import ImportUploader from '@/components/ImportUploader'

const ImportPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Import Data | TradeSage</title>
        <meta name="description" content="Import your trade data into TradeSage" />
      </Head>
      
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
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
