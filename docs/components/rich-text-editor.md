# RichTextEditor Component Documentation

The `RichTextEditor` component provides a rich text editing experience in the TradeSage application. It is built on top of React Quill and offers a customizable toolbar, content sanitization, and various formatting options.

## Import

```tsx
import RichTextEditor from '@/components/ui/RichTextEditor';
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | The HTML content of the editor |
| `onChange` | `(value: string) => void` | Yes | - | Function called when the content changes |
| `placeholder` | `string` | No | `'Start typing...'` | Placeholder text when editor is empty |
| `readOnly` | `boolean` | No | `false` | If true, makes the editor read-only |
| `className` | `string` | No | - | Additional CSS class for styling |
| `height` | `string` | No | `'200px'` | Height of the editor |
| `maxHeight` | `string` | No | - | Maximum height of the editor |
| `minHeight` | `string` | No | - | Minimum height of the editor |
| `modules` | `object` | No | Default modules | Quill modules configuration |
| `formats` | `string[]` | No | Default formats | Allowed formats in the editor |

## Default Toolbar Options

The component includes the following default toolbar options:

- Basic Formatting: Bold, Italic, Underline
- Lists: Bullet List, Numbered List
- Text Alignment: Left, Center, Right
- Headings: H1, H2, H3
- Links: Insert/Edit Links
- Clear Formatting

## Example Usage

### Basic Usage

```tsx
import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';

const MyComponent = () => {
  const [content, setContent] = useState('<p>Initial content</p>');

  return (
    <div className="my-component">
      <h2>Write your notes</h2>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Enter your notes here..."
      />
    </div>
  );
};
```

### Read-Only Mode

```tsx
import RichTextEditor from '@/components/ui/RichTextEditor';

const DisplayComponent = ({ content }) => {
  return (
    <div className="display-component">
      <h2>Note Content</h2>
      <RichTextEditor
        value={content}
        onChange={() => {}} // No-op function since it's read-only
        readOnly={true}
      />
    </div>
  );
};
```

### Custom Toolbar Configuration

```tsx
import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';

const MyComponent = () => {
  const [content, setContent] = useState('<p>Initial content</p>');
  
  // Custom toolbar with only basic formatting options
  const customModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'bullet' }, { 'list': 'ordered' }],
    ]
  };

  return (
    <div className="my-component">
      <h2>Simple Editor</h2>
      <RichTextEditor
        value={content}
        onChange={setContent}
        modules={customModules}
        height="150px"
      />
    </div>
  );
};
```

## Integration with Forms

```tsx
import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';

const FormComponent = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content });
  };
  
  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your content here..."
        />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Working with HTML Content

The RichTextEditor stores content as HTML strings. When displaying this content:

```tsx
import { sanitizeHtml } from '@/lib/utils/sanitization';

// When receiving HTML from an API or user input:
const displaySafeContent = (htmlContent) => {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = sanitizeHtml(htmlContent);
  
  return (
    <div 
      className="content-display"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
```

## Using with useRichTextEditor Hook

```tsx
import { useRichTextEditor } from '@/hooks/useRichTextEditor';
import RichTextEditor from '@/components/ui/RichTextEditor';

const MyEditor = () => {
  const {
    content,
    setContent,
    isEmpty,
    wordCount,
    characterCount,
    resetContent
  } = useRichTextEditor('<p>Initial content</p>');
  
  return (
    <div className="editor-container">
      <RichTextEditor
        value={content}
        onChange={setContent}
      />
      
      <div className="editor-stats">
        <p>Words: {wordCount}</p>
        <p>Characters: {characterCount}</p>
        {isEmpty && <p className="warning">Content cannot be empty</p>}
        <button onClick={resetContent}>Reset</button>
      </div>
    </div>
  );
};
```

## Styling

The component uses custom CSS for styling based on Quill's Snow theme with customizations to match TradeSage design system. You can override the default styles by passing a `className` prop or by editing the `quill-custom.css` file.

## Accessibility Features

- Keyboard shortcuts for common formatting actions
- ARIA attributes for toolbar buttons
- High contrast mode support
- Screen reader compatible formatting

## Browser Compatibility

Tested and works on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (with touch-friendly toolbar)

## Notes

- HTML content is automatically sanitized when saved to prevent XSS attacks
- Images are not enabled by default in the toolbar for security and storage reasons
- For large text areas, consider using the lazy-loading option for better performance
- Maximum content length should be enforced at the form validation level
