import React from 'react'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import RichTextEditor from '@/components/ui/RichTextEditor'
import DateRangePicker from '@/components/ui/DateRangePicker'
import { DateRange } from '@/types/dateRange'

// Add jest-axe matchers
expect.extend(toHaveNoViolations)

// Mock React Quill
jest.mock('react-quill', () => {
  return {
    __esModule: true,
    default: ({ value, onChange, placeholder, readOnly }) => {
      return (
        <div data-testid="mock-quill" role="textbox" aria-label={placeholder}>
          <textarea
            data-testid="quill-editor"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            aria-label={placeholder}
          />
        </div>
      )
    },
  }
})

// Mock the date to ensure consistent tests
jest.useFakeTimers()
jest.setSystemTime(new Date('2024-07-01'))

describe('Accessibility Tests', () => {
  describe('RichTextEditor Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <RichTextEditor 
          value="<p>Test content</p>" 
          onChange={() => {}} 
          placeholder="Enter your text"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
    
    it('should have no accessibility violations in read-only mode', async () => {
      const { container } = render(
        <RichTextEditor 
          value="<p>Test content</p>" 
          onChange={() => {}} 
          readOnly={true}
          placeholder="Read-only content"
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
  
  describe('DateRangePicker Accessibility', () => {
    it('should have no accessibility violations when closed', async () => {
      const defaultDateRange: DateRange = {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-30'),
        label: 'Last Month'
      }
      
      const { container } = render(
        <DateRangePicker 
          value={defaultDateRange}
          onChange={() => {}}
          onClose={() => {}}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
