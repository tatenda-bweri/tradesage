# DateRangePicker Component Documentation

The `DateRangePicker` component provides an elegant and user-friendly interface for selecting date ranges in the TradeSage application. It includes a dual calendar view and quick preset options for common date ranges.

## Import

```tsx
import DateRangePicker from '@/components/ui/DateRangePicker';
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `DateRange` | Yes | - | The currently selected date range |
| `onChange` | `(range: DateRange) => void` | Yes | - | Function called when the date range changes |
| `onClose` | `() => void` | No | `() => {}` | Function called when the calendar closes |
| `className` | `string` | No | - | Additional CSS class for styling |
| `minDate` | `Date` | No | - | Minimum selectable date |
| `maxDate` | `Date` | No | - | Maximum selectable date |
| `disablePresets` | `boolean` | No | `false` | If true, disables the preset options |
| `customPresets` | `DateRangePreset[]` | No | - | Custom preset options to add to the default list |

## DateRange Type

```tsx
interface DateRange {
  startDate: Date;
  endDate: Date;
  label?: string;
}
```

## DateRangePreset Type

```tsx
interface DateRangePreset {
  label: string;
  value: () => DateRange;
}
```

## Default Presets

The component includes the following default presets:

- Today
- Yesterday
- This Week
- Last Week
- This Month
- Last Month
- Last 3 Months
- Last 6 Months
- This Year
- Last Year
- All Time

## Example Usage

### Basic Usage

```tsx
import { useState } from 'react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { DateRange } from '@/types/dateRange';

const MyComponent = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    label: 'Custom Range'
  });

  return (
    <div className="my-component">
      <h2>Select Date Range</h2>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
      />
    </div>
  );
};
```

### With Custom Presets

```tsx
import { useState } from 'react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { DateRange, DateRangePreset } from '@/types/dateRange';
import { startOfQuarter, endOfQuarter, startOfYear, subYears } from 'date-fns';

const MyComponent = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    label: 'Custom Range'
  });

  // Custom presets for trading periods
  const customPresets: DateRangePreset[] = [
    {
      label: 'Current Quarter',
      value: () => {
        const now = new Date();
        return {
          startDate: startOfQuarter(now),
          endDate: endOfQuarter(now),
          label: 'Current Quarter'
        };
      }
    },
    {
      label: 'Fiscal Year',
      value: () => {
        const now = new Date();
        return {
          startDate: startOfYear(subYears(now, 1)),
          endDate: now,
          label: 'Fiscal Year'
        };
      }
    }
  ];

  return (
    <div className="my-component">
      <h2>Select Trading Period</h2>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        customPresets={customPresets}
      />
    </div>
  );
};
```

## Integration with Filters

The DateRangePicker is commonly used within filter components:

```tsx
import { useState } from 'react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { DateRange } from '@/types/dateRange';

const FilterPanel = ({ onApplyFilters }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    label: 'This Month'
  });
  
  const [otherFilters, setOtherFilters] = useState({
    // other filter state
  });
  
  const handleApply = () => {
    onApplyFilters({
      dateRange,
      ...otherFilters
    });
  };
  
  return (
    <div className="filter-panel">
      <div className="filter-item">
        <label>Date Range</label>
        <DateRangePicker 
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      
      {/* Other filter controls */}
      
      <button onClick={handleApply}>Apply Filters</button>
    </div>
  );
};
```

## Styling

The component uses Tailwind CSS for styling. You can override the default styles by passing a `className` prop or by targeting the component's internal classes in your CSS.

## Accessibility Features

- Keyboard navigation support for calendar navigation
- ARIA attributes for screen readers
- Focus management for improved keyboard usability
- Descriptive labels and announcements for state changes

## Browser Compatibility

Tested and works on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Android Chrome)

## Notes

- The component automatically handles timezone differences
- Dates are displayed in the format "MMM D, YYYY" (e.g., "Jan 1, 2024")
- When using with server data, ensure proper date parsing/formatting
