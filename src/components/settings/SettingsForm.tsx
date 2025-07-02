import React, { useState } from 'react'
import { Save, Moon, Sun, Bell, Globe, CreditCard } from 'lucide-react'
import { Button, Card, Select, RichTextEditor } from '@/components/ui'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { cn } from '@/lib/utils/cn'

interface SettingsFormProps {
  initialData?: {
    theme: 'dark' | 'light'
    notifications: boolean
    defaultCurrency: string
    defaultTimeframe: string
    defaultDateRange: string
    tradingNotes: string
  }
  onSave?: (data: {
    theme: 'dark' | 'light'
    notifications: boolean
    defaultCurrency: string
    defaultTimeframe: string
    defaultDateRange: string
    tradingNotes: string
  }) => Promise<void>
  className?: string
}

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
]

const timeframes = [
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: 'ALL', label: 'All Time' },
]

const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'allTime', label: 'All Time' },
]

const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData = {
    theme: 'dark' as const,
    notifications: true,
    defaultCurrency: 'USD',
    defaultTimeframe: '1M',
    defaultDateRange: 'thisMonth',
    tradingNotes: ''
  },
  onSave,
  className
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(initialData.theme)
  const [notifications, setNotifications] = useState(initialData.notifications)
  const [defaultCurrency, setDefaultCurrency] = useState(initialData.defaultCurrency)
  const [defaultTimeframe, setDefaultTimeframe] = useState(initialData.defaultTimeframe)
  const [defaultDateRange, setDefaultDateRange] = useState(initialData.defaultDateRange)
  const [isSaving, setIsSaving] = useState(false)

  // Rich text editor for trading notes
  const { 
    value: tradingNotes, 
    handleChange: handleTradingNotesChange,
    validation: tradingNotesValidation 
  } = useRichTextEditor({
    initialValue: initialData.tradingNotes || '',
    maxLength: 2000,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!onSave || !tradingNotesValidation.isValid) return
    
    try {
      setIsSaving(true)
      await onSave({
        theme,
        notifications,
        defaultCurrency,
        defaultTimeframe,
        defaultDateRange,
        tradingNotes
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Application Settings</h2>
        <p className="text-sm text-text-secondary">Customize your TradeSage experience</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appearance Section */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-text-primary">Appearance</h3>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Theme
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="text-accent"
                />
                <div className="flex items-center">
                  <Sun className="w-4 h-4 mr-1 text-text-secondary" />
                  <span>Light</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  className="text-accent"
                />
                <div className="flex items-center">
                  <Moon className="w-4 h-4 mr-1 text-text-secondary" />
                  <span>Dark</span>
                </div>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Notifications
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="text-accent rounded"
              />
              <div className="flex items-center">
                <Bell className="w-4 h-4 mr-1 text-text-secondary" />
                <span>Enable notifications</span>
              </div>
            </label>
          </div>
        </div>

        {/* Defaults Section */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-text-primary">Default Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Default Currency
              </label>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-text-secondary" />
                <Select
                  options={currencies}
                  value={currencies.find(c => c.value === defaultCurrency)}
                  onChange={(option) => setDefaultCurrency(option?.value || 'USD')}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Default Timeframe
              </label>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-text-secondary" />
                <Select
                  options={timeframes}
                  value={timeframes.find(t => t.value === defaultTimeframe)}
                  onChange={(option) => setDefaultTimeframe(option?.value || '1M')}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Default Date Range
            </label>
            <Select
              options={dateRanges}
              value={dateRanges.find(d => d.value === defaultDateRange)}
              onChange={(option) => setDefaultDateRange(option?.value || 'thisMonth')}
              className="w-full"
            />
          </div>
        </div>

        {/* Trading Notes Section */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-text-primary">Trading Notes</h3>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Default Trading Rules & Notes
            </label>
            <RichTextEditor
              value={tradingNotes}
              onChange={handleTradingNotesChange}
              placeholder="Document your personal trading rules, reminders, and guidelines..."
              error={!tradingNotesValidation.isValid}
              errorMessage={tradingNotesValidation.errors.join('. ')}
              maxLength={2000}
              showCharCount
              className="min-h-[200px]"
            />
            <p className="mt-1 text-xs text-text-secondary">
              These notes will be visible as a reference on your dashboard.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-4 border-t border-surface-light">
          <Button 
            type="submit"
            disabled={isSaving || !tradingNotesValidation.isValid}
            className="bg-profit text-white"
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default SettingsForm
