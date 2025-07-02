import { useState, useCallback, useMemo } from 'react'
import { RichTextValidation } from '@/types/richTextEditor'

interface UseRichTextEditorOptions {
  initialValue?: string
  maxLength?: number
  required?: boolean
  onValueChange?: (value: string) => void
}

interface UseRichTextEditorReturn {
  value: string
  setValue: (value: string) => void
  validation: RichTextValidation
  handleChange: (content: string) => void
  reset: () => void
  isEmpty: boolean
  getPlainText: () => string
  getCharCount: () => number
  getWordCount: () => number
}

const useRichTextEditor = (options: UseRichTextEditorOptions = {}): UseRichTextEditorReturn => {
  const {
    initialValue = '',
    maxLength,
    required = false,
    onValueChange
  } = options

  const [value, setValue] = useState<string>(initialValue)

  const validation = useMemo((): RichTextValidation => {
    const errors: string[] = []
    
    // Get plain text for character/word counting
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = value
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    
    const charCount = plainText.length
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0

    // Validation rules
    if (required && charCount === 0) {
      errors.push('This field is required')
    }

    if (maxLength && charCount > maxLength) {
      errors.push(`Content exceeds maximum length of ${maxLength} characters`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      charCount,
      wordCount
    }
  }, [value, maxLength, required])

  const handleChange = useCallback((content: string) => {
    setValue(content)
    onValueChange?.(content)
  }, [onValueChange])

  const reset = useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  const isEmpty = useMemo(() => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = value
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    return plainText.trim().length === 0
  }, [value])

  const getPlainText = useCallback((): string => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = value
    return tempDiv.textContent || tempDiv.innerText || ''
  }, [value])

  const getCharCount = useCallback((): number => {
    return validation.charCount
  }, [validation.charCount])

  const getWordCount = useCallback((): number => {
    return validation.wordCount
  }, [validation.wordCount])

  return {
    value,
    setValue,
    validation,
    handleChange,
    reset,
    isEmpty,
    getPlainText,
    getCharCount,
    getWordCount
  }
}

export default useRichTextEditor
