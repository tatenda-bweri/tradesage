import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import DateRangePicker from '@/components/ui/DateRangePicker'
import { DateRange } from '@/types/dateRange'

// Mock the date to ensure consistent tests
jest.useFakeTimers()
jest.setSystemTime(new Date('2024-07-01'))

describe('DateRangePicker Component', () => {
  const mockOnChange = jest.fn()
  const mockOnClose = jest.fn()
  const defaultDateRange: DateRange = {
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-30'),
    label: 'Last Month'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with default props', () => {
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    )
    
    // Should show the formatted date range
    expect(screen.getByText(/Jun 1, 2024 - Jun 30, 2024/i)).toBeInTheDocument()
  })

  it('opens calendar when clicking the button', () => {
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    )
    
    // Initially calendar should be closed
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    
    // Open calendar
    fireEvent.click(screen.getByRole('button'))
    
    // Calendar should be open now
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Apply')).toBeInTheDocument()
    
    // Should show preset options
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('Last Month')).toBeInTheDocument()
  })

  it('selects a preset when clicked', () => {
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    )
    
    // Open calendar
    fireEvent.click(screen.getByRole('button'))
    
    // Select 'Today' preset
    fireEvent.click(screen.getByText('Today'))
    
    // Apply the selection
    fireEvent.click(screen.getByText('Apply'))
    
    // Should call onChange with today's date range
    expect(mockOnChange).toHaveBeenCalledWith({
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-01'),
      label: 'Today'
    })
    
    // Should close the calendar
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('allows selecting custom date range', () => {
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    )
    
    // Open calendar
    fireEvent.click(screen.getByRole('button'))
    
    // Find and click on a date in the first month (e.g., the 15th)
    const startDate = screen.getByText('15').closest('button')
    if (startDate) {
      fireEvent.click(startDate)
    }
    
    // Find and click on a date in the second month (e.g., the 20th)
    const endDates = screen.getAllByText('20')
    const endDate = endDates[endDates.length - 1].closest('button')
    if (endDate) {
      fireEvent.click(endDate)
    }
    
    // Apply the selection
    fireEvent.click(screen.getByText('Apply'))
    
    // Should call onChange with selected date range
    expect(mockOnChange).toHaveBeenCalled()
    
    // Should close the calendar
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes calendar when clicking Cancel', () => {
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    )
    
    // Open calendar
    fireEvent.click(screen.getByRole('button'))
    
    // Click Cancel
    fireEvent.click(screen.getByText('Cancel'))
    
    // Should close the calendar without calling onChange
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('handles navigation between months', () => {
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    )
    
    // Open calendar
    fireEvent.click(screen.getByRole('button'))
    
    // Initially should show current month (July) and next month (August)
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    expect(screen.getByText('August 2024')).toBeInTheDocument()
    
    // Click previous month button
    const prevButtons = screen.getAllByRole('button', { name: /previous month/i })
    fireEvent.click(prevButtons[0])
    
    // Should now show June and July
    expect(screen.getByText('June 2024')).toBeInTheDocument()
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    
    // Click next month button
    const nextButtons = screen.getAllByRole('button', { name: /next month/i })
    fireEvent.click(nextButtons[nextButtons.length - 1])
    
    // Should now show July and August again
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    expect(screen.getByText('August 2024')).toBeInTheDocument()
  })
})
