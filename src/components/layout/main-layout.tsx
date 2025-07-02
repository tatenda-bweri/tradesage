import React, { useState } from 'react'
import { Menu, X, BarChart3, Calendar, FileText, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils/cn'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Trading overview and metrics'
    },
    {
      name: 'Trades',
      href: '/trades',
      icon: BarChart3,
      description: 'Trade management and analysis'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Calendar view and daily journal'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Detailed performance analytics'
    },
    {
      name: 'Journal',
      href: '/journal',
      icon: FileText,
      description: 'Trading journal and notes'
    },
    {
      name: 'Notebook',
      href: '/notebook',
      icon: BookOpen,
      description: 'Strategy and knowledge management'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Application settings'
    }
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-light transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed && 'lg:w-16'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-light">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-text-primary">TradeSage</h1>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1 rounded hover:bg-surface-light transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-text-secondary" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded hover:bg-surface-light transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                  isActive(item.href)
                    ? 'bg-profit bg-opacity-20 text-profit'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-surface-light">
            {!sidebarCollapsed && (
              <div className="text-xs text-text-secondary">
                TradeSage v1.0.0
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        'lg:pl-64 transition-all duration-300 ease-in-out',
        sidebarCollapsed && 'lg:pl-16'
      )}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-surface border-b border-surface-light">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded hover:bg-surface-light transition-colors"
            >
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-text-secondary">
                Welcome back, Trader
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout 