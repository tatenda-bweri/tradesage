import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

import { cn } from '@/lib/utils/cn'
import { RichTextEditorProps, RichTextEditorRef, ToolbarConfig } from '@/types/richTextEditor'

// Dynamically import ReactQuill with configurable loading delay for performance optimization
const ReactQuill = dynamic(() => 
  // Add artificial delay for large content to prevent UI freezing
  new Promise((resolve) => {
    const importPromise = import('react-quill')
    // If lazyLoad is enabled, add a small delay to prevent UI blocking
    setTimeout(() => resolve(importPromise), 0)
    return importPromise
  }),
{
  ssr: false,
  loading: () => (
    <div className="w-full h-32 bg-surface border border-surface-light rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-text-secondary text-sm">Loading editor...</span>
    </div>
  )
})

// Toolbar configurations
const toolbarConfigs: ToolbarConfig = {
  basic: [
    ['bold', 'italic', 'underline'],
    ['link'],
    ['clean']
  ],
  standard: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
  full: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ]
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  readOnly = false,
  className,
  size = 'medium',
  error = false,
  errorMessage,
  maxLength,
  showCharCount = false,
  onFocus,
  onBlur,
  modules,
  formats,
  theme = 'snow',
  lazyLoad = false,
  optimizeForPerformance = false,
  debounceTime = 300
}, ref) => {
  const [isClient, setIsClient] = useState(false)
  const editorRef = useRef<any>(null)

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const defaultModules = {
    toolbar: toolbarConfigs.standard,
    clipboard: {
      matchVisual: false,
    }
  }

  const defaultFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'align',
    'link', 'color', 'background',
    'script', 'blockquote', 'code-block'
  ]

  const editorModules = modules || defaultModules
  const editorFormats = formats || defaultFormats

  // Character count calculation
  const getCharCount = () => {
    if (!value) return 0
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = value
    return (tempDiv.textContent || tempDiv.innerText || '').length
  }

  const charCount = getCharCount()
  const isOverLimit = maxLength ? charCount > maxLength : false

  const getCharCountFromContent = (content: string) => {
    if (!content) return 0
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    return (tempDiv.textContent || tempDiv.innerText || '').length
  }

  // Create a debounced onChange function for better performance with large content
  const debouncedChange = useCallback(
    debounce((content: string) => {
      onChange?.(content)
    }, debounceTime || 300),
    [onChange, debounceTime]
  )

  // Create a throttled onChange function for continuous typing
  const throttledChange = useCallback(
    throttle((content: string) => {
      onChange?.(content)
    }, 100),
    [onChange]
  )

  const handleChange = useCallback((content: string) => {
    if (maxLength && getCharCountFromContent(content) > maxLength) {
      return // Prevent input if over limit
    }
    
    // Determine which optimization technique to use based on content size and flags
    const contentSize = content?.length || 0;
    
    if (optimizeForPerformance) {
      // For very large content (>50KB), use aggressive debouncing
      if (contentSize > 50000) {
        debouncedChange(content)
      } 
      // For medium content, use throttling for better responsiveness
      else if (contentSize > 10000) {
        throttledChange(content)
      }
      // For small content, use direct onChange
      else {
        onChange?.(content)
      }
    } else {
      onChange?.(content)
    }
  }, [maxLength, optimizeForPerformance, debouncedChange, throttledChange, onChange])

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus()
    },
    blur: () => {
      editorRef.current?.blur()
    },
    getLength: () => {
      return editorRef.current?.getLength() || 0
    },
    getText: () => {
      return editorRef.current?.getText() || ''
    },
    getHTML: () => {
      return editorRef.current?.root?.innerHTML || ''
    },
    insertText: (index: number, text: string) => {
      editorRef.current?.insertText(index, text)
    },
    setSelection: (index: number, length?: number) => {
      editorRef.current?.setSelection(index, length)
    }
  }))

  // Render a placeholder if not on client side or if using lazy load with large content
  if (!isClient || (lazyLoad && value && value.length > 10000)) {
    // If using lazy load with large content, show a preview and an edit button
    if (lazyLoad && isClient && value && value.length > 10000) {
      return (
        <div className="rich-text-editor-lazy-container">
          <div 
            className="rich-text-editor-preview"
            dangerouslySetInnerHTML={{ __html: value.substring(0, 2000) + '...' }}
          />
          <button 
            className="btn btn-secondary mt-2"
            onClick={() => setIsClient(false)} // Force reload the editor
          >
            Edit Content
          </button>
          {showCharCount && (
            <div className="flex justify-between items-center mt-2 text-xs">
              <div />
              <div className={cn(
                'text-text-secondary',
                isOverLimit && 'text-loss'
              )}>
                {charCount}{maxLength && ` / ${maxLength}`}
              </div>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="w-full h-32 bg-surface border border-surface-light rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading editor...</span>
      </div>
    )
  }

  const editorClasses = cn(
    'rich-text-editor',
    {
      'rich-text-editor-small': size === 'small',
      'rich-text-editor-large': size === 'large',
      'rich-text-editor-error': error,
      'rich-text-editor-disabled': disabled,
      'rich-text-editor-readonly': readOnly
    },
    className
  )

  // Render optimization for large content in read-only mode
  const renderEditor = () => {
    // If not client-side, return null
    if (!isClient) return null;
    
    // For large content in read-only mode, use a simple HTML view for better performance
    if (readOnly && value && value.length > 50000) {
      return (
        <div 
          className="quill-content-readonly"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }
    
    // Otherwise, use the full ReactQuill editor
    return (
      <ReactQuill
        ref={(el) => { editorRef.current = el }}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        theme={theme}
        modules={editorModules}
        formats={editorFormats}
      />
    );
  };

  return (
    <div className={editorClasses}>
      {renderEditor()}
      
      {/* Character count display */}
      {showCharCount && (
        <div className="flex justify-between items-center mt-2 text-xs">
          <div />
          <div className={cn(
            'text-text-secondary',
            isOverLimit && 'text-loss'
          )}>
            {charCount}{maxLength && ` / ${maxLength}`}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && errorMessage && (
        <div className="mt-2 text-xs text-loss">
          {errorMessage}
        </div>
      )}
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
