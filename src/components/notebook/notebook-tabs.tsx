import React, { useState } from 'react'
import { BookOpen, Lightbulb, Target, Plus, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import RichTextEditor from '@/components/ui/RichTextEditor'

type TabType = 'strategy' | 'insights' | 'goals'

interface NotebookTabsProps {
  className?: string
}

interface Document {
  id: string
  title: string
  content: string
  type: TabType
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

const NotebookTabs: React.FC<NotebookTabsProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<TabType>('strategy')
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'EURUSD Breakout Strategy',
      content: 'Strategy for trading EURUSD breakouts during London session...',
      type: 'strategy',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      tags: ['EURUSD', 'Breakout', 'London Session']
    },
    {
      id: '2',
      title: 'Market Structure Analysis',
      content: 'Key insights about market structure and order flow...',
      type: 'insights',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      tags: ['Market Structure', 'Order Flow', 'Analysis']
    },
    {
      id: '3',
      title: 'Monthly Profit Target',
      content: 'Goal: Achieve 5% monthly return with max 2% drawdown...',
      type: 'goals',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: ['Monthly Target', 'Risk Management']
    }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const tabs = [
    {
      id: 'strategy' as TabType,
      label: 'Strategy',
      icon: BookOpen,
      description: 'Trading strategies and methodologies'
    },
    {
      id: 'insights' as TabType,
      label: 'Key Findings',
      icon: Lightbulb,
      description: 'Market insights and observations'
    },
    {
      id: 'goals' as TabType,
      label: 'Mindset & Goals',
      icon: Target,
      description: 'Trading goals and psychological notes'
    }
  ]

  const filteredDocuments = documents.filter(doc => 
    doc.type === activeTab && 
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  const createNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: `New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Document`,
      content: '',
      type: activeTab,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }
    setDocuments([...documents, newDoc])
    setSelectedDocument(newDoc)
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(docs => 
      docs.map(doc => 
        doc.id === id 
          ? { ...doc, ...updates, updatedAt: new Date() }
          : doc
      )
    )
  }

  const deleteDocument = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id))
    if (selectedDocument?.id === id) {
      setSelectedDocument(null)
    }
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Tab Navigation */}
      <div className="flex border-b border-surface-light">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center space-x-2 px-4 py-3 transition-colors',
              activeTab === tab.id
                ? 'bg-surface text-text-primary border-b-2 border-profit'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Document List */}
        <div className="w-1/3 border-r border-surface-light flex flex-col">
          {/* Search and Actions */}
          <div className="p-4 border-b border-surface-light">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-surface border border-surface-light rounded text-sm"
                />
              </div>
              <button
                onClick={createNewDocument}
                className="p-2 bg-profit text-white rounded hover:bg-profit/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-text-secondary">
              {filteredDocuments.length} documents
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  'p-4 border-b border-surface-light cursor-pointer transition-colors',
                  selectedDocument?.id === doc.id
                    ? 'bg-profit bg-opacity-10 border-profit'
                    : 'hover:bg-surface-light'
                )}
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-text-primary line-clamp-1">
                    {doc.title}
                  </h4>
                  <div className="text-xs text-text-secondary">
                    {doc.updatedAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-text-secondary line-clamp-2 mb-2">
                  {doc.content ? (
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : '') }}
                    />
                  ) : (
                    <p>No content</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-surface-light text-text-secondary rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-surface-light text-text-secondary rounded">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Editor */}
        <div className="flex-1 flex flex-col">
          {selectedDocument ? (
            <>
              {/* Editor Header */}
              <div className="p-4 border-b border-surface-light">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={selectedDocument.title}
                    onChange={(e) => updateDocument(selectedDocument.id, { title: e.target.value })}
                    className="text-xl font-semibold text-text-primary bg-transparent border-none outline-none w-full"
                  />
                  <button
                    onClick={() => deleteDocument(selectedDocument.id)}
                    className="px-3 py-1 text-sm bg-loss text-white rounded hover:bg-loss/90 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-text-secondary">
                  Last updated: {selectedDocument.updatedAt.toLocaleString()}
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 p-4">
                <RichTextEditor
                  value={selectedDocument.content}
                  onChange={(content) => updateDocument(selectedDocument.id, { content })}
                  placeholder="Start writing your document..."
                  showCharCount
                />
              </div>

              {/* Tags */}
              <div className="p-4 border-t border-surface-light">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary">Tags:</span>
                  <input
                    type="text"
                    placeholder="Add tags..."
                    className="flex-1 px-3 py-1 bg-surface border border-surface-light rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newTag = e.currentTarget.value.trim()
                        if (newTag && !selectedDocument.tags.includes(newTag)) {
                          updateDocument(selectedDocument.id, {
                            tags: [...selectedDocument.tags, newTag]
                          })
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDocument.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-surface-light text-text-secondary rounded flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => updateDocument(selectedDocument.id, {
                          tags: selectedDocument.tags.filter(t => t !== tag)
                        })}
                        className="hover:text-loss"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No document selected
                </h3>
                <p className="text-text-secondary">
                  Select a document from the list or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotebookTabs 