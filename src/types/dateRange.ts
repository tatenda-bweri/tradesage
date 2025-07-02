export interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export interface DateRangePreset {
  label: string
  value: string
  getDateRange: () => DateRange
}

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  onConfirm?: (range: DateRange) => void
  onCancel?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showPresets?: boolean
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
}

export interface CalendarProps {
  month: Date
  selectedRange: DateRange
  onDateSelect: (date: Date) => void
  onMonthChange: (month: Date) => void
  minDate?: Date
  maxDate?: Date
}

export type DateRangePickerState = {
  isOpen: boolean
  tempRange: DateRange
  hoveredDate: Date | null
  currentMonth: Date
  nextMonth: Date
}
