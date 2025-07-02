import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>TradeSage - Trading Journal</title>
        <meta name="description" content="Comprehensive trading journal application" />
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              TradeSage
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              Comprehensive trading journal application with performance tracking, behavioral analysis, and strategic planning
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="card card-hover p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Net P&L
                </h3>
                <p className="text-3xl font-bold profit-text">$0.00</p>
                <p className="text-sm text-text-secondary">Total Profit/Loss</p>
              </div>
              <div className="card card-hover p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Profit Factor
                </h3>
                <p className="text-3xl font-bold neutral-text">0.00</p>
                <p className="text-sm text-text-secondary">Risk/Reward Ratio</p>
              </div>
              <div className="card card-hover p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Win Rate
                </h3>
                <p className="text-3xl font-bold neutral-text">0%</p>
                <p className="text-sm text-text-secondary">Successful Trades</p>
              </div>
              <div className="card card-hover p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Total Trades
                </h3>
                <p className="text-3xl font-bold neutral-text">0</p>
                <p className="text-sm text-text-secondary">All Time</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/demo" className="btn btn-primary">
                View Demo
              </Link>
              <Link href="/dashboard-real" className="btn btn-secondary">
                Real Dashboard
              </Link>
              <Link href="/dashboard" className="btn btn-outline">
                Sample Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 