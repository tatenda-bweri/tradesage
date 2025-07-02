import React from 'react'
import { render } from '@testing-library/react'
import RichTextEditor from '@/components/ui/RichTextEditor'

// Mock React Quill as it requires browser APIs
jest.mock('react-quill', () => {
  return {
    __esModule: true,
    default: ({ value, onChange }) => {
      return (
        <div data-testid="mock-quill">
          <textarea
            data-testid="quill-editor"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )
    },
  }
})

describe('RichTextEditor Performance Tests', () => {
  const generateLargeHtml = (size: number): string => {
    let content = '<div>';
    for (let i = 0; i < size; i++) {
      content += `<p>This is paragraph ${i} with some <strong>bold text</strong> and <em>italic text</em>.</p>`;
    }
    content += '</div>';
    return content;
  }

  it('should render with small content (1KB) in under 50ms', () => {
    const smallContent = generateLargeHtml(10);
    
    const start = performance.now();
    render(<RichTextEditor value={smallContent} onChange={() => {}} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50);
  });

  it('should render with medium content (50KB) in under 200ms', () => {
    const mediumContent = generateLargeHtml(500);
    
    const start = performance.now();
    render(<RichTextEditor value={mediumContent} onChange={() => {}} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(200);
  });

  it('should render with large content (200KB) in under 500ms', () => {
    const largeContent = generateLargeHtml(2000);
    
    const start = performance.now();
    render(<RichTextEditor value={largeContent} onChange={() => {}} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500);
  });
});
