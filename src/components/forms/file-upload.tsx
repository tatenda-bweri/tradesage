import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['.html', '.csv', '.xlsx', '.xls'],
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles)
    onFileSelect(acceptedFiles)
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles,
    maxSize
  })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-profit bg-profit bg-opacity-10',
          isDragReject && 'border-loss bg-loss bg-opacity-10',
          !isDragActive && 'border-surface-light hover:border-profit hover:bg-surface-light'
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn(
          'mx-auto h-12 w-12 mb-4',
          isDragActive && !isDragReject ? 'text-profit' : 'text-text-secondary'
        )} />
        <p className="text-lg font-medium text-text-primary mb-2">
          {isDragActive && !isDragReject && 'Drop files here'}
          {isDragReject && 'Invalid file type'}
          {!isDragActive && 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-sm text-text-secondary">
          Supported formats: {acceptedTypes.join(', ')}
        </p>
        <p className="text-xs text-text-secondary mt-2">
          Max file size: {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-primary">Selected Files:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-surface rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{file.name}</p>
                  <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 rounded-full hover:bg-surface-light transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload 