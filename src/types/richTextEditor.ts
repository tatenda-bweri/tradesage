export interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
  error?: boolean
  errorMessage?: string
  maxLength?: number
  showCharCount?: boolean
  onFocus?: () => void
  onBlur?: () => void
  modules?: Record<string, unknown>
  formats?: string[]
  theme?: 'snow' | 'bubble'
  lazyLoad?: boolean // Whether to lazy load the editor for large content
  optimizeForPerformance?: boolean // Debounce onChange for better performance with large content
  debounceTime?: number // Debounce time in milliseconds
}

export interface RichTextEditorRef {
  focus: () => void
  blur: () => void
  getLength: () => number
  getText: () => string
  getHTML: () => string
  insertText: (index: number, text: string) => void
  setSelection: (index: number, length?: number) => void
}

export interface ToolbarConfig {
  basic: string[][]
  standard: string[][]
  full: string[][]
}

export interface RichTextValidation {
  isValid: boolean
  errors: string[]
  charCount: number
  wordCount: number
}
