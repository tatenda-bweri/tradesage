# TradeSage Trading Journal

A comprehensive trading journal application with performance tracking, behavioral analysis, and strategic planning.

## Features

- **Dashboard**: Real-time performance metrics and visualizations
- **Import System**: Support for multiple broker formats (Exness, CSV, Excel)
- **Trade Management**: Advanced filtering, sorting, and analysis
- **Calendar View**: Multi-view calendar with daily journal entries
- **Analytics**: Detailed statistics and performance analysis
- **Trading Journal**: Daily reflections and trade plans
- **Knowledge Management**: Strategy documents and insights

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: React Quill for rich text editing
- **State Management**: Zustand for global state
- **Database**: Prisma with SQLite
- **Testing**: Jest + React Testing Library (including accessibility testing with jest-axe)
- **Linting**: ESLint + Prettier

## Design System

The application uses a dark theme design system with the following color palette:

- **Profit**: #4ADE80 (Green)
- **Loss**: #EF4444 (Red)
- **Neutral**: #6B7280 (Gray)
- **Background**: #1F2937 (Dark gray)
- **Surface**: #374151 (Medium gray)
- **Text Primary**: #F9FAFB (Light gray)
- **Text Secondary**: #D1D5DB (Medium light gray)

## Custom UI Components

TradeSage includes several custom-built UI components:

### DateRangePicker

A comprehensive date range selection component featuring:

- Dual calendar view for month-to-month range selection
- Quick preset options (Today, Yesterday, This Week, etc.)
- Custom range selection with start and end dates
- Responsive design with mobile optimization
- Keyboard accessibility and screen reader support

### RichTextEditor

A customized React Quill integration that provides:

- Multiple toolbar configurations (basic, standard, full)
- Customized styling to match application theme
- Performance optimizations for large content
- Character count and validation
- Read-only and disabled states
- Content sanitization for security
- Responsive design and accessibility features

See the `docs/components/` directory for detailed documentation on these components.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- SQLite (included with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tradesage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
- Database connection string (SQLite file path)
- Authentication secrets
- API keys (if needed)

4. Set up the database:
```bash
npm run db:init
```

This will:
- Create `.env.local` from `env.example`
- Generate the Prisma client
- Create the SQLite database with all tables
- The database file will be created as `dev.db` in your project root

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking
- `npm run db:init` - Initialize SQLite database
- `npm run db:studio` - Open Prisma Studio for database management

## Project Structure

```text
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (DateRangePicker, RichTextEditor, etc.)
│   ├── dashboard/      # Dashboard specific components
│   ├── charts/         # Chart components
│   ├── forms/          # Form components
│   ├── journal/        # Journal components with rich text support
│   ├── notebook/       # Notebook components with rich text support
│   ├── tables/         # Data table components
│   ├── profile/        # User profile components
│   ├── settings/       # Settings components
│   └── layout/         # Layout components
├── lib/                # Utility libraries
│   ├── parsers/        # Import parsers
│   ├── utils/          # Utility functions (incl. dateRangeUtils, sanitization)
│   ├── database/       # Database operations
│   ├── calculations/   # Trading calculations
│   └── types/          # TypeScript types
├── hooks/              # Custom React hooks (incl. useDateRangePicker, useRichTextEditor)
├── types/              # Global TypeScript types
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   └── ...             # Page components
├── styles/             # Styling files (including quill-custom.css)
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── performance/    # Performance tests
    └── accessibility/  # Accessibility tests
```

## Development Guidelines

### Code Standards

- Use TypeScript with strict mode
- Follow ESLint and Prettier configurations
- Use PascalCase for components and types
- Use camelCase for functions and variables
- Use kebab-case for file names

### Component Structure

```typescript
// 1. Imports (external dependencies first)
import React from 'react'
import { externalLibrary } from 'external-package'

// 2. Type definitions
interface ComponentProps {
  // props interface
}

// 3. Component implementation
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return <div>Component content</div>
}

// 4. Default export
export default Component
```

### Testing

- Write unit tests for all utility functions
- Test calculation algorithms
- Test data validation logic
- Test import parsing functionality
- Test chart components
- Test UI components (including accessibility testing with jest-axe)
- Performance testing for UI components with large datasets
- Test rich text editor functionality and sanitization

### Performance

- Dashboard load time: < 2 seconds
- UI interaction response: < 200ms
- Chart render time: < 500ms
- RichTextEditor render time: < 300ms for standard content, < 1000ms for large content
- DateRangePicker interaction time: < 100ms
- Import processing: < 30 seconds for typical statements
- Journal entry save time: < 500ms

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.
