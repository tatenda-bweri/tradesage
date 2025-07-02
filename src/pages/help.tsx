import React, { useState } from 'react'
import Head from 'next/head'
import { Send, HelpCircle, MessageSquare, FileText, ExternalLink } from 'lucide-react'
import MainLayout from '@/components/layout/main-layout'
import { Button, Card, RichTextEditor } from '@/components/ui'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { cn } from '@/lib/utils/cn'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'How do I import my trades?',
    answer: 'You can import trades by going to the Import page and uploading your broker statement. We support various formats including CSV and broker-specific exports like MT4/MT5, Exness, and more.'
  },
  {
    question: 'How do I track my performance?',
    answer: 'The Dashboard provides key metrics like win rate, profit factor, and P&L. For detailed analysis, check the Analytics page which offers insights into your trading patterns and performance.'
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, you can export your trade data from the Trades page by clicking the export button. This will download your filtered trades as a CSV file.'
  },
  {
    question: 'How do I use the journal feature?',
    answer: 'The Journal page allows you to create daily entries about your trading. You can link trades to journal entries, add rich text notes, and track your psychological state during trading sessions.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption and security practices. Your data is stored securely and never shared with third parties without your consent.'
  },
]

const HelpPage = () => {
  const [messageCategory, setMessageCategory] = useState('general')
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  
  // Rich text editor for support message
  const { 
    value: supportMessage, 
    handleChange: handleSupportMessageChange,
    validation: supportMessageValidation,
    resetValue: resetSupportMessage
  } = useRichTextEditor({
    initialValue: '',
    maxLength: 3000,
  })

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supportMessageValidation.isValid || !email) return
    
    try {
      setIsSending(true)
      
      // TODO: Implement actual API call to send support message
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setMessageSent(true)
      resetSupportMessage('')
      setEmail('')
    } catch (error) {
      console.error('Failed to send support message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <MainLayout>
      <Head>
        <title>Help & Support - TradeSage</title>
        <meta name="description" content="Get help and support for TradeSage Trading Journal" />
      </Head>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
            <p className="text-text-secondary">
              Find answers to common questions or contact our support team
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* FAQs Section */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <HelpCircle className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                </div>
                
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-surface-light last:border-b-0 pb-4 last:pb-0">
                      <h3 className="font-medium text-text-primary mb-2">{faq.question}</h3>
                      <p className="text-sm text-text-secondary">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Documentation Links */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-semibold">Documentation</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Getting Started Guide', url: '#' },
                    { title: 'Import Data Tutorial', url: '#' },
                    { title: 'Journal Features Guide', url: '#' },
                    { title: 'Analytics Explained', url: '#' }
                  ].map((doc, index) => (
                    <a 
                      key={index}
                      href={doc.url}
                      className="p-4 border border-surface-light rounded-md hover:bg-surface-light transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium">{doc.title}</span>
                      <ExternalLink className="w-4 h-4 text-text-secondary" />
                    </a>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Contact Form */}
            <div>
              <Card className="p-6 sticky top-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-semibold">Contact Support</h2>
                </div>
                
                {messageSent ? (
                  <div className="bg-profit/10 border border-profit/20 rounded-md p-4 text-center">
                    <h3 className="font-medium text-profit mb-2">Message Sent!</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Thank you for contacting us. We'll get back to you shortly.
                    </p>
                    <Button
                      onClick={() => setMessageSent(false)}
                      className="bg-profit text-white"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        Your Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        value={messageCategory}
                        onChange={(e) => setMessageCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-surface-light rounded"
                      >
                        <option value="general">General Question</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="billing">Billing Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">
                        Message
                      </label>
                      <RichTextEditor
                        id="message"
                        value={supportMessage}
                        onChange={handleSupportMessageChange}
                        placeholder="Describe your issue or question in detail..."
                        error={!supportMessageValidation.isValid}
                        errorMessage={supportMessageValidation.errors.join('. ')}
                        maxLength={3000}
                        showCharCount
                        className="min-h-[150px]"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSending || !supportMessageValidation.isValid || !email}
                      className="w-full bg-accent text-white"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {isSending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default HelpPage
