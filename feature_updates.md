# TradeSage UI Enhancement Tasks - Date Picker & Rich Text Editor

## Overview
This task list focuses on implementing two key UI enhancements:
1. Custom date range picker component matching the design specification
2. React Quill rich text editor integration for all text input areas

---

## Phase 1: Date Range Picker Implementation

### Task 1.1: Create Custom Date Range Picker Component
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 8 story points  
**Dependencies:** None

**Description:** Build a custom date range picker component matching the attachment design
- [ ] Create `DateRangePicker` component with dual calendar view
- [ ] Implement quick preset functionality (Today, Yesterday, This Week, etc.)
- [ ] Add month navigation controls
- [ ] Implement date selection and range highlighting
- [ ] Add input field integration with calendar icon
- [ ] Style component to match design specifications
- [ ] Add keyboard navigation support
- [ ] Implement responsive behavior for mobile devices

**Design Requirements from Attachment:**
- Quick presets sidebar: Today, Yesterday, This Week, Last Week, This Month, Last Month, This Year, Last Year, All Time
- Dual month calendar display (current and next month)
- Range selection with start/end date highlighting
- Input fields showing "Sep 1, 2022 - Oct 31, 2022" format
- Cancel and Confirm buttons
- Calendar icon trigger
- Hover states and visual feedback

**Acceptance Criteria:**
- Component matches the visual design exactly
- All quick presets work correctly
- Date range selection works smoothly
- Responsive on mobile devices
- Keyboard accessible
- Proper TypeScript types defined

**Files to create:**
- `components/ui/DateRangePicker.tsx`
- `components/ui/DateRangePicker.module.css`
- `types/dateRange.ts`

---

### Task 1.2: Create Date Range Picker Hook
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 3 story points  
**Dependencies:** Task 1.1

**Description:** Create a reusable hook for date range picker state management
- [ ] Create `useDateRangePicker` hook
- [ ] Implement date range validation logic
- [ ] Add preset calculation functions
- [ ] Handle timezone considerations
- [ ] Add date formatting utilities
- [ ] Implement date range comparison utilities

**Acceptance Criteria:**
- Hook provides consistent API for all date range interactions
- Proper date validation and error handling
- Timezone handling works correctly
- Easy to integrate with existing components

**Files to create:**
- `hooks/useDateRangePicker.ts`
- `lib/utils/dateRangeUtils.ts`

---

### Task 1.3: Replace Existing Date Inputs - Dashboard
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 4 story points  
**Dependencies:** Task 1.1, 1.2

**Description:** Replace all date inputs in dashboard components with new date range picker
- [ ] Update dashboard filters to use new DateRangePicker
- [ ] Replace any existing date input components
- [ ] Update dashboard state management for date ranges
- [ ] Ensure data fetching works with new date format
- [ ] Test all dashboard filtering functionality
- [ ] Update analytics components date selection

**Acceptance Criteria:**
- All dashboard date inputs use the new component
- Data filtering works correctly with selected ranges
- No regression in existing functionality
- Consistent date range behavior across dashboard

**Files to modify:**
- `pages/dashboard.tsx`
- `components/dashboard/DashboardFilters.tsx`
- `components/analytics/AnalyticsFilters.tsx`

---

### Task 1.4: Replace Existing Date Inputs - Trade Pages
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 5 story points  
**Dependencies:** Task 1.1, 1.2

**Description:** Update all trade-related pages to use the new date range picker
- [ ] Update trades list page filtering
- [ ] Update trade calendar date navigation
- [ ] Replace date inputs in trade entry/edit forms
- [ ] Update analytics page date selection
- [ ] Ensure API calls work with new date format
- [ ] Test trade data filtering and display

**Acceptance Criteria:**
- All trade pages use consistent date range picker
- Trade filtering by date works correctly
- Calendar navigation uses new component
- Trade entry forms have proper date selection

**Files to modify:**
- `pages/trades.tsx`
- `pages/calendar.tsx`
- `pages/analytics.tsx`
- `components/trades/TradeFilters.tsx`
- `components/trades/TradeForm.tsx`

---

### Task 1.5: Update Import and Report Date Selections
**Priority:** P2 (Medium)  
**Assignee:** Frontend Developer  
**Estimate:** 3 story points  
**Dependencies:** Task 1.1, 1.2

**Description:** Apply date range picker to import and reporting features
- [ ] Update import date range selection
- [ ] Update report generation date selection
- [ ] Ensure exported data respects date ranges
- [ ] Test import functionality with date filters

**Acceptance Criteria:**
- Import process uses new date picker for filtering
- Report generation has consistent date selection
- All date-related functionality works seamlessly

**Files to modify:**
- `components/import/ImportFilters.tsx`
- `components/reports/ReportFilters.tsx`

---

## Phase 2: React Quill Rich Text Editor Implementation

### Task 2.1: Install and Configure React Quill
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 2 story points  
**Dependencies:** None

**Description:** Set up React Quill package and basic configuration
- [ ] Install `react-quill` and required dependencies
- [ ] Install Quill CSS and theme files
- [ ] Configure Next.js for Quill (handle SSR issues)
- [ ] Set up basic Quill toolbar configuration
- [ ] Create wrapper component for consistent styling
- [ ] Test basic functionality

**Acceptance Criteria:**
- React Quill installed and working
- No SSR issues with Next.js
- Basic rich text editing functionality works
- Consistent styling applied

**Files to create/modify:**
- `package.json`
- `components/ui/RichTextEditor.tsx`
- `styles/quill-custom.css`

---

### Task 2.2: Create Custom Rich Text Editor Component
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 6 story points  
**Dependencies:** Task 2.1

**Description:** Build a reusable rich text editor component with custom configuration
- [ ] Create `RichTextEditor` component wrapper
- [ ] Configure toolbar with relevant options (bold, italic, lists, links, etc.)
- [ ] Implement custom styling to match app design
- [ ] Add placeholder text support
- [ ] Implement character/word count if needed
- [ ] Add validation and error handling
- [ ] Ensure proper TypeScript integration
- [ ] Add support for read-only mode

**Toolbar Configuration:**
- Basic formatting: Bold, Italic, Underline
- Lists: Bullet points, Numbered lists
- Text alignment: Left, Center, Right
- Links: Insert/edit links
- Text styles: Headers (H1, H2, H3)
- Clear formatting option

**Acceptance Criteria:**
- Component is reusable across the application
- Toolbar configuration matches requirements
- Styling consistent with app design
- Proper TypeScript types and props
- Validation and error states work correctly

**Files to create:**
- `components/ui/RichTextEditor.tsx`
- `types/richTextEditor.ts`
- `hooks/useRichTextEditor.ts`

---

### Task 2.3: Implement Rich Text Editor in Journal Pages
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 5 story points  
**Dependencies:** Task 2.2

**Description:** Replace plain text inputs in journal functionality with rich text editor
- [ ] Update journal entry creation form
- [ ] Update journal entry editing functionality
- [ ] Implement rich text display for journal entries
- [ ] Add auto-save functionality for journal entries
- [ ] Ensure proper data storage (HTML content)
- [ ] Update API endpoints to handle rich text content
- [ ] Test journal CRUD operations

**Acceptance Criteria:**
- Journal entries support rich text formatting
- Auto-save prevents data loss
- Rich text displays correctly in read mode
- API properly handles HTML content
- No data loss during rich text conversion

**Files to modify:**
- `pages/journal.tsx`
- `components/journal/JournalEntry.tsx`
- `components/journal/JournalEditor.tsx`
- `pages/api/journal/*`

---

### Task 2.4: Implement Rich Text Editor in Notebook Pages
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 5 story points  
**Dependencies:** Task 2.2

**Description:** Add rich text editing to notebook/notes functionality
- [ ] Update notebook entry creation
- [ ] Update notebook entry editing
- [ ] Implement rich text display for notes
- [ ] Add auto-save for notebook entries
- [ ] Update note search to work with rich text content
- [ ] Ensure proper content storage and retrieval
- [ ] Test all notebook functionality

**Acceptance Criteria:**
- Notebook entries support full rich text editing
- Search functionality works with rich text content
- Auto-save prevents content loss
- Rich text displays properly in all views

**Files to modify:**
- `pages/notebook.tsx`
- `components/notebook/NotebookEntry.tsx`
- `components/notebook/NotebookEditor.tsx`
- `pages/api/notebook/*`

---

### Task 2.5: Update Trade Notes and Comments
**Priority:** P2 (Medium)  
**Assignee:** Frontend Developer  
**Estimate:** 4 story points  
**Dependencies:** Task 2.2

**Description:** Add rich text support to trade-related text fields
- [ ] Update trade entry notes field
- [ ] Update trade comments/analysis fields
- [ ] Ensure rich text works in trade editing
- [ ] Update trade display to show formatted content
- [ ] Test trade notes functionality thoroughly

**Acceptance Criteria:**
- Trade notes support rich text formatting
- Trade analysis comments are rich text enabled
- Formatted content displays correctly in trade lists
- No issues with trade data integrity

**Files to modify:**
- `components/trades/TradeForm.tsx`
- `components/trades/TradeDetails.tsx`
- `components/trades/TradeNotes.tsx`

---

### Task 2.6: Update Other Text Input Areas
**Priority:** P2 (Medium)  
**Assignee:** Frontend Developer  
**Estimate:** 3 story points  
**Dependencies:** Task 2.2

**Description:** Replace remaining plain text areas with rich text editor where appropriate
- [ ] Update user profile bio/description fields
- [ ] Update any settings description fields
- [ ] Update help/support text areas
- [ ] Review all forms for text area candidates
- [ ] Ensure consistent rich text experience

**Acceptance Criteria:**
- All appropriate text areas use rich text editor
- Consistent user experience across the application
- No plain text areas where rich text would be beneficial

**Files to modify:**
- `components/profile/ProfileForm.tsx`
- `components/settings/SettingsForm.tsx`
- Any other forms with multi-line text inputs

---

## Phase 3: Integration and Testing

### Task 3.1: Database Schema Updates for Rich Text
**Priority:** P1 (High)  
**Assignee:** Backend Developer  
**Estimate:** 3 story points  
**Dependencies:** Task 2.3, 2.4

**Description:** Update database schema to properly store rich text content
- [ ] Update journal entries table for HTML content
- [ ] Update notebook entries table for HTML content  
- [ ] Update trade notes fields for HTML content
- [ ] Create database migration scripts
- [ ] Test data migration from plain text to rich text
- [ ] Ensure backward compatibility

**Acceptance Criteria:**
- Database properly stores HTML content
- Migration scripts work without data loss
- Existing plain text content is preserved
- Performance is not negatively impacted

**Files to create/modify:**
- `prisma/migrations/*` (new migration files)
- `lib/database/migrations/richTextMigration.ts`

---

### Task 3.2: API Updates for Rich Text Content
**Priority:** P1 (High)  
**Assignee:** Backend Developer  
**Estimate:** 4 story points  
**Dependencies:** Task 3.1

**Description:** Update API endpoints to handle rich text content properly
- [ ] Add HTML sanitization for security
- [ ] Update validation schemas for rich text content
- [ ] Ensure proper content encoding/decoding
- [ ] Add content length validation
- [ ] Test API endpoints with rich text data
- [ ] Add proper error handling

**Acceptance Criteria:**
- API properly handles HTML content
- Content is sanitized for security
- Validation prevents malicious content
- Error handling is comprehensive

**Files to modify:**
- `pages/api/journal/*`
- `pages/api/notebook/*`
- `pages/api/trades/*`
- `lib/validation/schemas.ts`
- `lib/utils/sanitization.ts` (new)

---

### Task 3.3: Comprehensive Testing and Bug Fixes
**Priority:** P1 (High)  
**Assignee:** Frontend Developer  
**Estimate:** 5 story points  
**Dependencies:** All previous tasks

**Description:** Thorough testing of both new components and integration
- [ ] Test date range picker in all contexts
- [ ] Test rich text editor in all implementations
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance testing with large content
- [ ] Accessibility testing
- [ ] Fix any discovered bugs
- [ ] Update documentation

**Acceptance Criteria:**
- All components work across different browsers
- Mobile experience is smooth
- No performance regressions
- Accessibility standards met
- Documentation is complete

**Files to create/modify:**
- `__tests__/components/DateRangePicker.test.tsx`
- `__tests__/components/RichTextEditor.test.tsx`
- `docs/components/date-range-picker.md`
- `docs/components/rich-text-editor.md`

---

## Implementation Timeline

### Week 1: Date Range Picker Foundation
- Tasks 1.1, 1.2 (Component creation and hook)

### Week 2: Date Range Picker Integration  
- Tasks 1.3, 1.4, 1.5 (Replace existing date inputs)

### Week 3: Rich Text Editor Foundation
- Tasks 2.1, 2.2 (Setup and component creation)

### Week 4: Rich Text Editor Integration
- Tasks 2.3, 2.4 (Journal and Notebook implementation)

### Week 5: Completion and Testing
- Tasks 2.5, 2.6, 3.1, 3.2 (Remaining integrations and backend updates)

### Week 6: Testing and Polish
- Task 3.3 (Comprehensive testing and bug fixes)

## Dependencies and Installation

### New Package Dependencies:
```json
{
  "react-quill": "^2.0.0",
  "quill": "^1.3.7",
  "date-fns": "^2.29.3" // if not already installed
}
```

### Development Dependencies:
```json
{
  "@types/react-quill": "^1.3.10",
  "@types/quill": "^1.3.10"
}
```

## Success Criteria

1. **Date Range Picker:**
   - Consistent date selection experience across all pages
   - Visual design matches specification exactly
   - All quick presets work correctly
   - Mobile responsive and accessible

2. **Rich Text Editor:**
   - All text input areas support rich formatting
   - Content is properly stored and retrieved
   - Security measures prevent XSS attacks
   - User experience is intuitive and smooth

3. **Integration:**
   - No regressions in existing functionality
   - Database migrations complete successfully
   - API endpoints handle new content types properly
   - Comprehensive test coverage implemented

## Notes

- Both components should be built as reusable UI components that can be easily maintained and extended
- Security is paramount for the rich text editor - all content must be properly sanitized
- The date range picker should handle edge cases like leap years, different timezones, and invalid date ranges
- Consider implementing lazy loading for the rich text editor to improve initial page load times
- Ensure both components work well with the existing state management system (Zustand stores)