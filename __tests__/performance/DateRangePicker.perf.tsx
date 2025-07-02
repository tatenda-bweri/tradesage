import React from 'react'
import { render } from '@testing-library/react'
import DateRangePicker from '@/components/ui/DateRangePicker'
import { DateRange } from '@/types/dateRange'

// Mock the date to ensure consistent tests
jest.useFakeTimers()
jest.setSystemTime(new Date('2024-07-01'))

describe('DateRangePicker Performance Tests', () => {
  const mockOnChange = jest.fn()
  const mockOnClose = jest.fn()
  
  // Generate an array of preset options of different sizes
  const generatePresets = (count: number) => {
    const presets = [];
    const baseDate = new Date('2024-01-01');
    
    for (let i = 0; i < count; i++) {
      const startDate = new Date(baseDate);
      startDate.setDate(i + 1);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      
      presets.push({
        label: `Preset ${i + 1}`,
        startDate,
        endDate
      });
    }
    
    return presets;
  };

  it('should render with default presets in under 50ms', () => {
    const defaultDateRange: DateRange = {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      label: 'Last Month'
    };
    
    const start = performance.now();
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
      />
    );
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50);
  });

  it('should render with 100 custom presets in under 200ms', () => {
    const defaultDateRange: DateRange = {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      label: 'Last Month'
    };
    
    const customPresets = generatePresets(100);
    
    const start = performance.now();
    render(
      <DateRangePicker 
        value={defaultDateRange}
        onChange={mockOnChange}
        onClose={mockOnClose}
        customPresets={customPresets}
      />
    );
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });
});
