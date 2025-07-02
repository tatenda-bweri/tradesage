import { Filter, Upload, Download } from 'lucide-react'
import React from 'react'

import { DateRangePicker } from '@/components/ui'
import { DateRange } from '@/types/dateRange'

interface ImportReportFiltersProps {
  dateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
  showExportOptions?: boolean
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void
  className?: string
}

const ImportReportFilters: React.FC<ImportReportFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  showExportOptions = false,
  onExport,
  className
}) => {
  return (
    <div className={`card p-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">
              {showExportOptions ? 'Report Filters' : 'Import Filters'}
            </span>
          </div>
          
          <div className="flex-1">
            <DateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              placeholder={`Select date range for ${showExportOptions ? 'reports' : 'import filtering'}`}
              className="w-full max-w-md"
            />
          </div>
        </div>

        {showExportOptions && onExport && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Export:</span>
            <button
              onClick={() => onExport('csv')}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-surface-light hover:bg-surface text-text-secondary hover:text-text-primary rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => onExport('excel')}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-surface-light hover:bg-surface text-text-secondary hover:text-text-primary rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-surface-light hover:bg-surface text-text-secondary hover:text-text-primary rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>PDF</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportReportFilters
