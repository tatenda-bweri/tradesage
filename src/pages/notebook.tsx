import React from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]'
import MainLayout from '@/components/layout/main-layout'
import NotebookTabs from '@/components/notebook/notebook-tabs'
import { BookOpen, Edit3, Target, Lightbulb } from 'lucide-react'

interface NotebookPageProps {
  user: {
    id: string
    name: string
    email: string
  }
}

const NotebookPage: React.FC<NotebookPageProps> = ({ user }) => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 h-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BookOpen className="w-8 h-8 text-profit" />
            <h1 className="text-3xl font-bold text-text-primary">Trading Notebook</h1>
          </div>
          <p className="text-text-secondary">
            Document your strategies, insights, and goals to improve your trading
          </p>
        </div>

        {/* Quick Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Edit3 className="w-6 h-6 text-profit" />
              <h3 className="font-semibold text-text-primary">Strategy</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Document your trading strategies, setups, and methodologies for consistent execution
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Lightbulb className="w-6 h-6 text-profit" />
              <h3 className="font-semibold text-text-primary">Key Findings</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Capture market insights, patterns, and observations that can improve your trading
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-6 h-6 text-profit" />
              <h3 className="font-semibold text-text-primary">Mindset & Goals</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Set trading goals, track psychological state, and maintain discipline
            </p>
          </div>
        </div>

        {/* Notebook Component */}
        <div className="card h-[600px] overflow-hidden">
          <NotebookTabs />
        </div>

        {/* Tips Section */}
        <div className="mt-8 card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Notebook Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-text-primary mb-2">Writing Strategies</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Define clear entry and exit criteria</li>
                <li>• Include risk management rules</li>
                <li>• Document market conditions for each strategy</li>
                <li>• Keep strategies simple and actionable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">Capturing Insights</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Record market patterns and behavior</li>
                <li>• Note correlation between news and price action</li>
                <li>• Document failed trades and lessons learned</li>
                <li>• Track seasonal or cyclical patterns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">Setting Goals</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Set SMART (specific, measurable) goals</li>
                <li>• Include both performance and behavioral goals</li>
                <li>• Review and adjust goals regularly</li>
                <li>• Focus on process over profits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-text-primary mb-2">Organization Tips</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Use consistent tagging for easy search</li>
                <li>• Update documents regularly</li>
                <li>• Cross-reference related documents</li>
                <li>• Keep a backup of important strategies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session?.user) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    },
  }
}

export default NotebookPage
