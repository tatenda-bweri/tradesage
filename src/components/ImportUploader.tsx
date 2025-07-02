import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Upload, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

import { Card, Button } from '@/components/ui'
import FileUpload from '@/components/forms/file-upload'
import ImportProgress from '@/components/forms/import-progress'
import BrokerSelector from '@/components/forms/broker-selector'
import { cn } from '@/lib/utils/cn'

interface ImportSession {
  id: string
  fileName: string
  broker: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalTrades: number
  processedTrades: number
  errors: string[]
  warnings: string[]
}

const ImportUploader: React.FC = () => {
  const { data: session } = useSession()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedBroker, setSelectedBroker] = useState<string>('')
  const [importSessions, setImportSessions] = useState<ImportSession[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  const handleFileSelect = useCallback((files: File[]) => {
    setSelectedFiles(files)
  }, [])

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  const handleUpload = async () => {
    if (!selectedFiles.length || !selectedBroker || !session?.user?.accountId) return

    setIsUploading(true)

    for (const file of selectedFiles) {
      try {
        // Create import session
        const newSession: ImportSession = {
          id: Date.now().toString(),
          fileName: file.name,
          broker: selectedBroker,
          status: 'processing',
          totalTrades: 0,
          processedTrades: 0,
          errors: [],
          warnings: []
        }

        setImportSessions(prev => [...prev, newSession])

        // Read file content
        const fileContent = await readFileAsText(file)

        // Call import API
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId: session.user.accountId,
            broker: selectedBroker,
            fileName: file.name,
            fileContent,
            columnMapping: selectedBroker === 'generic-csv' ? columnMapping : undefined
          }),
        })

        const result = await response.json()

        if (response.ok) {
          // Update session with results
          setImportSessions(prev => prev.map(s => 
            s.id === newSession.id 
              ? {
                  ...s,
                  status: 'completed',
                  totalTrades: result.totalTrades || 0,
                  processedTrades: result.importedTrades || 0,
                  errors: result.errors || [],
                  warnings: result.warnings || []
                }
              : s
          ))
        } else {
          // Handle error
          setImportSessions(prev => prev.map(s => 
            s.id === newSession.id 
              ? {
                  ...s,
                  status: 'failed',
                  errors: [result.error || 'Import failed']
                }
              : s
          ))
        }
      } catch (error) {
        console.error('Upload error:', error)
        setImportSessions(prev => prev.map(s => 
          s.fileName === file.name 
            ? {
                ...s,
                status: 'failed',
                errors: ['Network error occurred']
              }
            : s
        ))
      }
    }

    setIsUploading(false)
    setSelectedFiles([])
  }

  const handleRetry = (sessionId: string) => {
    // Find the session and retry the import
    const session = importSessions.find(s => s.id === sessionId)
    if (session) {
      setImportSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'processing', errors: [], warnings: [] }
          : s
      ))
      // Here you would trigger the actual retry logic
    }
  }

  const handleCloseSession = (sessionId: string) => {
    setImportSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  const canUpload = selectedFiles.length > 0 && selectedBroker && !isUploading

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-text-secondary mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Import Trade Data</h2>
        <p className="text-text-secondary">
          Upload your trading history files to analyze your performance
        </p>
      </div>

      {/* Broker Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Select Your Broker
        </h3>
        <BrokerSelector
          value={selectedBroker}
          onChange={setSelectedBroker}
          className="mb-4"
        />
        
        {selectedBroker === 'generic-csv' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
              <h4 className="text-sm font-medium text-amber-800">
                Column Mapping Required
              </h4>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              For generic CSV files, you'll need to map your columns to our standard format after upload.
            </p>
          </div>
        )}
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Upload Files
        </h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes={['.html', '.csv', '.xlsx', '.xls']}
          maxFiles={5}
          maxSize={50 * 1024 * 1024} // 50MB
        />
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              className="flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Import</span>
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Import Sessions */}
      {importSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Import Progress
          </h3>
          {importSessions.map((session) => (
            <ImportProgress
              key={session.id}
              status={session.status}
              fileName={session.fileName}
              broker={session.broker}
              totalTrades={session.totalTrades}
              processedTrades={session.processedTrades}
              errors={session.errors}
              warnings={session.warnings}
              onRetry={() => handleRetry(session.id)}
              onClose={() => handleCloseSession(session.id)}
            />
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Supported File Formats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Exness</h4>
            <p className="text-blue-700">Account statement HTML files from Exness web terminal</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">MetaTrader</h4>
            <p className="text-blue-700">History export from MT4/MT5 (HTML or CSV format)</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Generic CSV</h4>
            <p className="text-blue-700">Any CSV file with trade data (requires column mapping)</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Excel Files</h4>
            <p className="text-blue-700">.xlsx and .xls files with trade data</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ImportUploader
